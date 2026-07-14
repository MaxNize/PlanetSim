//! Shared physics calculations used by the WASM layer.

/// Calculates the gravitational force between two bodies using Newton's law of universal gravitation.
///
/// Formula: `F = G * (m1 * m2) / r^2`
///
/// # Arguments
/// * `mass1_kg` - Mass of the first body in kilograms.
/// * `mass2_kg` - Mass of the second body in kilograms.
/// * `distance_m` - Distance between the bodies in meters.
///
/// # Returns
/// The gravitational force in newtons.
///
/// # Panics
/// Panics if `distance_m` is less than or equal to zero.
///
/// # Example
/// ```
/// let force = planet_sim_wasm::calculate_force(1.0e24, 2.0e24, 1.0e6);
/// assert!(force > 0.0);
/// ```
pub fn calculate_force(mass1_kg: f64, mass2_kg: f64, distance_m: f64) -> f64 {
    assert!(distance_m > 0.0, "distance_m must be positive");

    const G: f64 = 6.67430e-11;
    G * mass1_kg * mass2_kg / distance_m.powi(2)
}

#[cfg(test)]
mod tests {
    use super::calculate_force;
    use crate::physics::fixtures::*;

    #[test]
    fn calculate_force_earth_moon() {
        let force = calculate_force(EARTH_MASS, MOON_MASS, EARTH_MOON_DISTANCE);
        let expected_force = 1.982054291079361e20;
        let tolerance = 1e16;
        assert!((force - expected_force).abs() < tolerance);
    }

    #[test]
    #[should_panic(expected = "distance_m must be positive")]
    fn calculate_force_zero_distance_panics() {
        calculate_force(EARTH_MASS, MOON_MASS, 0.0);
    }

    #[test]
    #[should_panic(expected = "distance_m must be positive")]
    fn calculate_force_negative_distance_panics() {
        calculate_force(EARTH_MASS, MOON_MASS, -100.0);
    }
}
