//! Physics calculations for orbital simulation.

pub mod calculations;
pub mod gravity;

#[cfg(test)]
pub mod fixtures;

pub use gravity::{calculate_force, gravitational_force};
