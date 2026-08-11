//! Gravity helpers and Lagrange-point calculations for the physics engine.

use super::types::{Body, LagrangePointSet};

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
pub fn distance(position1: (f64, f64), position2: (f64, f64)) -> f64 {
    let delta_x = position2.0 - position1.0;
    let delta_y = position2.1 - position1.1;
    delta_x.hypot(delta_y)
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

    let delta_x = secondary.position.0 - primary.position.0;
    let delta_y = secondary.position.1 - primary.position.1;
    let direction = (delta_x / separation, delta_y / separation);
    let perpendicular = (-direction.1, direction.0);
    let barycenter = barycenter(primary, secondary);
    let mass_ratio = secondary.mass / (primary.mass + secondary.mass);

    let l1_x = solve_collinear_point(1.0 - mass_ratio - (mass_ratio / 3.0).cbrt(), mass_ratio);
    let l2_x = solve_collinear_point(1.0 - mass_ratio + (mass_ratio / 3.0).cbrt(), mass_ratio);
    let l3_x = solve_collinear_point(-1.0 - 5.0 * mass_ratio / 12.0, mass_ratio);

    let l1 = from_normalized_x(barycenter, direction, l1_x * separation);
    let l2 = from_normalized_x(barycenter, direction, l2_x * separation);
    let l3 = from_normalized_x(barycenter, direction, l3_x * separation);
    let midpoint = (
        (primary.position.0 + secondary.position.0) * 0.5,
        (primary.position.1 + secondary.position.1) * 0.5,
    );
    let equilateral_offset = (3.0_f64.sqrt() * 0.5) * separation;

    let l4 = (
        midpoint.0 + perpendicular.0 * equilateral_offset,
        midpoint.1 + perpendicular.1 * equilateral_offset,
    );
    let l5 = (
        midpoint.0 - perpendicular.0 * equilateral_offset,
        midpoint.1 - perpendicular.1 * equilateral_offset,
    );

    LagrangePointSet { l1, l2, l3, l4, l5 }
}

fn barycenter(primary: &Body, secondary: &Body) -> (f64, f64) {
    let total_mass = primary.mass + secondary.mass;
    assert!(total_mass > 0.0, "total mass must be positive");

    (
        (primary.position.0 * primary.mass + secondary.position.0 * secondary.mass) / total_mass,
        (primary.position.1 * primary.mass + secondary.position.1 * secondary.mass) / total_mass,
    )
}

fn from_normalized_x(barycenter: (f64, f64), direction: (f64, f64), offset: f64) -> (f64, f64) {
    (
        barycenter.0 + direction.0 * offset,
        barycenter.1 + direction.1 * offset,
    )
}

fn solve_collinear_point(initial_guess: f64, mass_ratio: f64) -> f64 {
    let mut x = initial_guess;

    for _ in 0..64 {
        let function_value = collinear_equation(x, mass_ratio);
        if function_value.abs() < 1e-14 {
            return x;
        }

        let step = x.abs().max(1.0) * 1e-8;
        let derivative = (collinear_equation(x + step, mass_ratio)
            - collinear_equation(x - step, mass_ratio))
            / (2.0 * step);
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

#[cfg(test)]
mod tests {
    use super::{
        acceleration_from_force, distance, force_between, gravitational_force, lagrange_points,
        DEFAULT_GRAVITATIONAL_CONSTANT,
    };
    use crate::physics::fixtures::*;
    use crate::physics::types::Body;

    #[test]
    fn distance_between_earth_and_moon_matches_fixture() {
        let computed_distance = distance((0.0, 0.0), (EARTH_MOON_DISTANCE, 0.0));
        assert!((computed_distance - EARTH_MOON_DISTANCE).abs() < 1e-6);
    }

    #[test]
    fn force_between_earth_and_moon_matches_expected_value() {
        let force = force_between(
            EARTH_MASS,
            MOON_MASS,
            EARTH_MOON_DISTANCE,
            DEFAULT_GRAVITATIONAL_CONSTANT,
        );
        let expected_force = 1.982054291079361e20;
        assert!((force - expected_force).abs() < 1e16);
    }

    #[test]
    fn gravitational_force_uses_default_constant() {
        let force = gravitational_force(EARTH_MASS, MOON_MASS, EARTH_MOON_DISTANCE);
        let expected_force = 1.982054291079361e20;
        assert!((force - expected_force).abs() < 1e16);
    }

    #[test]
    fn acceleration_is_force_divided_by_mass() {
        let acceleration = acceleration_from_force(12.0, 3.0);
        assert!((acceleration - 4.0).abs() < f64::EPSILON);
    }

    #[test]
    fn lagrange_points_return_equilateral_l4_l5() {
        let primary = Body::new((0.0, 0.0), (0.0, 0.0), EARTH_MASS, 6.371e6);
        let secondary = Body::new((EARTH_MOON_DISTANCE, 0.0), (0.0, 0.0), MOON_MASS, 1.737e6);

        let points = lagrange_points(&primary, &secondary, DEFAULT_GRAVITATIONAL_CONSTANT);
        let expected_l4_y = (3.0_f64.sqrt() * 0.5) * EARTH_MOON_DISTANCE;
        assert!((points.l4.0 - EARTH_MOON_DISTANCE * 0.5).abs() < 1e-3);
        assert!((points.l4.1 - expected_l4_y).abs() < 1e-3);
        assert!((points.l5.0 - EARTH_MOON_DISTANCE * 0.5).abs() < 1e-3);
        assert!((points.l5.1 + expected_l4_y).abs() < 1e-3);
    }
}
