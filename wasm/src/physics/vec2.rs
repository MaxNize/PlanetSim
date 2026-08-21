//! 2D vector arithmetic used throughout the physics engine.

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

