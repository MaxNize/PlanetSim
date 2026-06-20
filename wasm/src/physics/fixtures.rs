#![allow(dead_code)]
//! Reusable test fixtures and constants for physical bodies and configurations.

/// Gravitational constant (G) in m³ kg⁻¹ s⁻².
pub const G: f64 = 6.67430e-11;

/// Earth's mass in kilograms.
pub const EARTH_MASS: f64 = 5.9722e24;

/// Moon's mass in kilograms.
pub const MOON_MASS: f64 = 7.3477e22;

/// Sun's mass in kilograms.
pub const SUN_MASS: f64 = 1.989e30;

/// Average Earth-Moon distance in meters.
pub const EARTH_MOON_DISTANCE: f64 = 3.844e8;

/// Average Sun-Earth distance in meters (1 AU).
pub const SUN_EARTH_DISTANCE: f64 = 1.496e11;
