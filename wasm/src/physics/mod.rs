//! Physics calculations for the restricted three-body simulation.

pub mod calculations;
pub mod gravity;
pub mod integrator;
pub mod types;

#[cfg(test)]
pub mod fixtures;

pub use calculations::calculate_force;
pub use gravity::{
    acceleration_from_force, distance, force_between, gravitational_force, lagrange_points,
    DEFAULT_GRAVITATIONAL_CONSTANT,
};
pub use integrator::{integrate_step, StepResult, MAX_TIME_STEP_SECONDS};
pub use types::{Body, LagrangePointSet, PhysicsConfig, State};
