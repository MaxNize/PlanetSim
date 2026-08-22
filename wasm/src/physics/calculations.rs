//! Shared physics calculations used by the WASM layer.

use super::gravity::{force_between, DEFAULT_GRAVITATIONAL_CONSTANT};

/// Calculates the gravitational force between two bodies using Newton's law of universal gravitation.
pub fn calculate_force(mass1_kg: f64, mass2_kg: f64, distance_m: f64) -> f64 {
    force_between(
        mass1_kg,
        mass2_kg,
        distance_m,
        DEFAULT_GRAVITATIONAL_CONSTANT,
    )
}

#[cfg(test)]
#[path = "calculations_tests.rs"]
mod tests;
