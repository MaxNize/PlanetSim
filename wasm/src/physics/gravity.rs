//! Gravity-specific helpers for the physics engine.

pub use super::calculations::calculate_force;

/// Calculates gravitational force between two bodies.
///
/// This is a thin wrapper around the shared physics calculation to keep the module boundary explicit.
///
/// # Arguments
/// * `mass1_kg` - Mass of the first body in kilograms.
/// * `mass2_kg` - Mass of the second body in kilograms.
/// * `distance_m` - Distance between the bodies in meters.
///
/// # Returns
/// The gravitational force in newtons.
pub fn gravitational_force(mass1_kg: f64, mass2_kg: f64, distance_m: f64) -> f64 {
    calculate_force(mass1_kg, mass2_kg, distance_m)
}
