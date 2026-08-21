//! Gravity helpers and Lagrange-point calculations for the physics engine.

use super::types::{Body, LagrangePointSet, Vec2};

/// Default gravitational constant in m^3 kg^-1 s^-2.
pub const DEFAULT_GRAVITATIONAL_CONSTANT: f64 = 6.67430e-11;

/// Computes the Euclidean distance between two positions in meters.
///
/// # Examples
/// ```
/// use planet_sim_wasm::physics::gravity::distance;
/// let d = distance((0.0, 0.0), (3.0, 4.0));
/// assert_eq!(d, 5.0);
/// ```
pub fn distance(position1: impl Into<Vec2>, position2: impl Into<Vec2>) -> f64 {
    position1.into().distance(position2.into())
}

/// Computes the gravitational force magnitude between two bodies using Newton's law of universal gravitation:
///
/// $$F = G \frac{m_1 m_2}{r^2}$$
///
/// # Arguments
/// * `mass1` - Mass of body 1 (kg)
/// * `mass2` - Mass of body 2 (kg)
/// * `distance` - Euclidean distance between bodies (m)
/// * `gravitational_constant` - Gravitational constant G (m³ kg⁻¹ s⁻²)
///
/// # Examples
/// ```
/// use planet_sim_wasm::physics::gravity::force_between;
/// let force = force_between(5.9722e24, 7.348e22, 3.844e8, 6.67430e-11);
/// assert!((force - 1.982e20).abs() < 1e18);
/// ```
pub fn force_between(mass1: f64, mass2: f64, distance: f64, gravitational_constant: f64) -> f64 {
    assert!(distance > 0.0, "distance must be positive");
    assert!(
        gravitational_constant > 0.0,
        "gravitational_constant must be positive"
    );

    gravitational_constant * mass1 * mass2 / distance.powi(2)
}

/// Converts a force magnitude into acceleration using Newton's second law ($a = F / m$).
///
/// # Examples
/// ```
/// use planet_sim_wasm::physics::gravity::acceleration_from_force;
/// let accel = acceleration_from_force(100.0, 20.0);
/// assert_eq!(accel, 5.0);
/// ```
pub fn acceleration_from_force(force: f64, mass: f64) -> f64 {
    assert!(mass > 0.0, "mass must be positive");
    force / mass
}

/// Calculates the Newtonian gravitational force using the default gravitational constant $G = 6.67430 \times 10^{-11} \text{ m}^3 \text{ kg}^{-1} \text{ s}^{-2}$.
///
/// # Examples
/// ```
/// use planet_sim_wasm::physics::gravity::gravitational_force;
/// let force = gravitational_force(5.9722e24, 7.348e22, 3.844e8);
/// assert!(force > 1.9e20);
/// ```
pub fn gravitational_force(mass1: f64, mass2: f64, distance: f64) -> f64 {
    force_between(mass1, mass2, distance, DEFAULT_GRAVITATIONAL_CONSTANT)
}

/// Calculates the five Lagrange points for a primary/secondary pair.
pub fn lagrange_points(
    primary: &Body,
    secondary: &Body,
    gravitational_constant: f64,
) -> LagrangePointSet {
    assert!(
        gravitational_constant > 0.0,
        "gravitational_constant must be positive"
    );

    let separation = distance(primary.position, secondary.position);
    assert!(separation > 0.0, "bodies must not occupy the same position");

    let direction = (secondary.position - primary.position) / separation;
    let perpendicular = Vec2::new(-direction.y, direction.x);
    let barycenter = barycenter(primary, secondary);
    let mass_ratio = secondary.mass / (primary.mass + secondary.mass);

    let l1_x = solve_collinear_point(1.0 - mass_ratio - (mass_ratio / 3.0).cbrt(), mass_ratio);
    let l2_x = solve_collinear_point(1.0 - mass_ratio + (mass_ratio / 3.0).cbrt(), mass_ratio);
    let l3_x = solve_collinear_point(-1.0 - 5.0 * mass_ratio / 12.0, mass_ratio);

    let l1 = from_normalized_x(barycenter, direction, l1_x * separation);
    let l2 = from_normalized_x(barycenter, direction, l2_x * separation);
    let l3 = from_normalized_x(barycenter, direction, l3_x * separation);
    let midpoint = (primary.position + secondary.position) * 0.5;
    let equilateral_offset = (3.0_f64.sqrt() * 0.5) * separation;

    let l4 = midpoint + perpendicular * equilateral_offset;
    let l5 = midpoint - perpendicular * equilateral_offset;

    LagrangePointSet { l1, l2, l3, l4, l5 }
}

fn barycenter(primary: &Body, secondary: &Body) -> Vec2 {
    let total_mass = primary.mass + secondary.mass;
    assert!(total_mass > 0.0, "total mass must be positive");

    (primary.position * primary.mass + secondary.position * secondary.mass) / total_mass
}

fn from_normalized_x(barycenter: Vec2, direction: Vec2, offset: f64) -> Vec2 {
    barycenter + direction * offset
}

fn solve_collinear_point(initial_guess: f64, mass_ratio: f64) -> f64 {
    let mut x = initial_guess;

    for _ in 0..64 {
        let function_value = collinear_equation(x, mass_ratio);
        if function_value.abs() < 1e-14 {
            return x;
        }

        let derivative = collinear_equation_derivative(x, mass_ratio);
        if derivative.abs() < 1e-14 {
            break;
        }

        let next_x = x - function_value / derivative;
        if (next_x - x).abs() < 1e-14 {
            return next_x;
        }

        x = next_x;
    }

    x
}

fn collinear_equation(x: f64, mass_ratio: f64) -> f64 {
    let primary_term = (1.0 - mass_ratio) * (x + mass_ratio) / (x + mass_ratio).abs().powi(3);
    let secondary_term = mass_ratio * (x - 1.0 + mass_ratio) / (x - 1.0 + mass_ratio).abs().powi(3);

    x - primary_term - secondary_term
}

/// Analytic derivative of [`collinear_equation`] with respect to `x`.
///
/// For `f(u) = u / |u|^3` (with `u` linear in `x`), `f'(u) = -2 / |u|^3` — a closed form free of
/// the cancellation error that plagues a finite-difference approximation near the singularities
/// at `x = -mass_ratio` and `x = 1 - mass_ratio`.
fn collinear_equation_derivative(x: f64, mass_ratio: f64) -> f64 {
    let u = x + mass_ratio;
    let w = x - 1.0 + mass_ratio;

    1.0 + 2.0 * (1.0 - mass_ratio) / u.abs().powi(3) + 2.0 * mass_ratio / w.abs().powi(3)
}

#[cfg(test)]
#[path = "gravity_tests.rs"]
mod tests;
