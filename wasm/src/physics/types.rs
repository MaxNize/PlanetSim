//! Core physics data structures for the restricted three-body engine.

use serde::{Deserialize, Serialize};

/// A body with position, velocity, mass, and radius.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Body {
    pub position: (f64, f64),
    pub velocity: (f64, f64),
    pub mass: f64,
    pub radius: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locked: Option<bool>,
}

impl Body {
    /// Creates a new body.
    pub const fn new(position: (f64, f64), velocity: (f64, f64), mass: f64, radius: f64) -> Self {
        Self {
            position,
            velocity,
            mass,
            radius,
            locked: None,
        }
    }

    /// Creates a new body with locked status.
    pub const fn new_locked(
        position: (f64, f64),
        velocity: (f64, f64),
        mass: f64,
        radius: f64,
        locked: bool,
    ) -> Self {
        Self {
            position,
            velocity,
            mass,
            radius,
            locked: Some(locked),
        }
    }
}

/// Gravitational configuration shared by the simulation.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PhysicsConfig {
    pub gravitational_constant: f64,
}

impl PhysicsConfig {
    /// Creates a configuration with a custom gravitational constant.
    pub const fn new(gravitational_constant: f64) -> Self {
        Self {
            gravitational_constant,
        }
    }
}

impl Default for PhysicsConfig {
    fn default() -> Self {
        Self::new(6.67430e-11)
    }
}

/// Full simulation state for the system.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub primary: Body,
    pub secondary: Body,
    pub test_particle: Body,
    pub time: f64,
    pub gravitational_constant: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bodies: Option<Vec<Body>>,
}

impl State {
    /// Creates a new simulation state.
    pub const fn new(
        primary: Body,
        secondary: Body,
        test_particle: Body,
        time: f64,
        gravitational_constant: f64,
    ) -> Self {
        Self {
            primary,
            secondary,
            test_particle,
            time,
            gravitational_constant,
            bodies: None,
        }
    }

    /// Creates a new simulation state with custom bodies.
    pub fn new_with_bodies(
        primary: Body,
        secondary: Body,
        test_particle: Body,
        time: f64,
        gravitational_constant: f64,
        bodies: Option<Vec<Body>>,
    ) -> Self {
        Self {
            primary,
            secondary,
            test_particle,
            time,
            gravitational_constant,
            bodies,
        }
    }

    /// Creates a new state using a configuration object.
    pub fn with_config(
        primary: Body,
        secondary: Body,
        test_particle: Body,
        time: f64,
        config: PhysicsConfig,
    ) -> Self {
        Self::new(
            primary,
            secondary,
            test_particle,
            time,
            config.gravitational_constant,
        )
    }
}

/// The five Lagrange points for a primary/secondary pair.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LagrangePointSet {
    pub l1: (f64, f64),
    pub l2: (f64, f64),
    pub l3: (f64, f64),
    pub l4: (f64, f64),
    pub l5: (f64, f64),
}
