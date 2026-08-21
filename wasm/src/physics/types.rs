//! Core physics data structures for the restricted three-body engine.

use serde::{Deserialize, Deserializer, Serialize, Serializer};

/// A 2D Cartesian vector supporting vector arithmetic operations.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

impl Vec2 {
    pub const ZERO: Self = Self::new(0.0, 0.0);

    pub const fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    pub fn length_sq(self) -> f64 {
        self.x * self.x + self.y * self.y
    }

    pub fn length(self) -> f64 {
        self.length_sq().sqrt()
    }

    pub fn distance(self, other: Self) -> f64 {
        (self - other).length()
    }
}

impl std::ops::Add for Vec2 {
    type Output = Self;
    fn add(self, rhs: Self) -> Self {
        Self::new(self.x + rhs.x, self.y + rhs.y)
    }
}

impl std::ops::AddAssign for Vec2 {
    fn add_assign(&mut self, rhs: Self) {
        self.x += rhs.x;
        self.y += rhs.y;
    }
}

impl std::ops::Sub for Vec2 {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self {
        Self::new(self.x - rhs.x, self.y - rhs.y)
    }
}

impl std::ops::SubAssign for Vec2 {
    fn sub_assign(&mut self, rhs: Self) {
        self.x -= rhs.x;
        self.y -= rhs.y;
    }
}

impl std::ops::Mul<f64> for Vec2 {
    type Output = Self;
    fn mul(self, rhs: f64) -> Self {
        Self::new(self.x * rhs, self.y * rhs)
    }
}

impl std::ops::Mul<Vec2> for f64 {
    type Output = Vec2;
    fn mul(self, rhs: Vec2) -> Vec2 {
        Vec2::new(self * rhs.x, self * rhs.y)
    }
}

impl std::ops::Div<f64> for Vec2 {
    type Output = Self;
    fn div(self, rhs: f64) -> Self {
        Self::new(self.x / rhs, self.y / rhs)
    }
}

impl From<(f64, f64)> for Vec2 {
    fn from(tuple: (f64, f64)) -> Self {
        Self::new(tuple.0, tuple.1)
    }
}

impl From<[f64; 2]> for Vec2 {
    fn from(arr: [f64; 2]) -> Self {
        Self::new(arr[0], arr[1])
    }
}

impl From<Vec2> for (f64, f64) {
    fn from(v: Vec2) -> Self {
        (v.x, v.y)
    }
}

impl Serialize for Vec2 {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        (self.x, self.y).serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for Vec2 {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let (x, y) = <(f64, f64)>::deserialize(deserializer)?;
        Ok(Self::new(x, y))
    }
}

/// A body with position, velocity, mass, and radius.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Body {
    pub position: Vec2,
    pub velocity: Vec2,
    pub mass: f64,
    pub radius: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locked: Option<bool>,
}

impl Body {
    /// Creates a new body.
    pub fn new(position: impl Into<Vec2>, velocity: impl Into<Vec2>, mass: f64, radius: f64) -> Self {
        Self {
            position: position.into(),
            velocity: velocity.into(),
            mass,
            radius,
            locked: None,
        }
    }

    /// Creates a new body with locked status.
    pub fn new_locked(
        position: impl Into<Vec2>,
        velocity: impl Into<Vec2>,
        mass: f64,
        radius: f64,
        locked: bool,
    ) -> Self {
        Self {
            position: position.into(),
            velocity: velocity.into(),
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
    pub l1: Vec2,
    pub l2: Vec2,
    pub l3: Vec2,
    pub l4: Vec2,
    pub l5: Vec2,
}

#[cfg(test)]
#[path = "types_tests.rs"]
mod tests;

