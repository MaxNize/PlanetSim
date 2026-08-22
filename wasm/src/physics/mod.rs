//! Physics calculations for the restricted three-body simulation.

pub mod calculations;
pub mod gravity;
pub mod integrator;
mod integrator_energy;
mod integrator_kinematics;
pub mod n_body;
pub mod types;
pub mod vec2;

#[cfg(test)]
pub mod fixtures;

pub use calculations::calculate_force;
pub use gravity::{
    acceleration_from_force, distance, force_between, gravitational_force, lagrange_points,
    DEFAULT_GRAVITATIONAL_CONSTANT,
};
pub use integrator::{integrate_step, StepResult, MAX_TIME_STEP_SECONDS};
pub use n_body::NBodyScratch;
pub use types::{Body, LagrangePointSet, PhysicsConfig, State, Vec2};

