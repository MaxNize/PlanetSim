//! Shared physics calculations used by the WASM layer.

use super::gravity::{force_between, DEFAULT_GRAVITATIONAL_CONSTANT};

/// Calculates the gravitational force between two bodies using Newton's law of universal gravitation.
pub fn calculate_force(mass1_kg: f64, mass2_kg: f64, distance_m: f64) -> f64 {
    force_between(mass1_kg, mass2_kg, distance_m, DEFAULT_GRAVITATIONAL_CONSTANT)
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
    #[should_panic(expected = "distance must be positive")]
    fn calculate_force_zero_distance_panics() {
        calculate_force(EARTH_MASS, MOON_MASS, 0.0);
    }

    #[test]
    #[should_panic(expected = "distance must be positive")]
    fn calculate_force_negative_distance_panics() {
        calculate_force(EARTH_MASS, MOON_MASS, -100.0);
    }
}
