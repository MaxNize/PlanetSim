//! Physics calculations for orbital simulation.

pub mod calculations;
pub mod gravity;

pub use gravity::{calculate_force, gravitational_force};
