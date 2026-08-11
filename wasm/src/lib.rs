//! WebAssembly entry points for the planet simulation physics engine.
#![warn(clippy::cognitive_complexity)]

pub mod physics;
pub mod wasm;

pub use physics::*;
pub use wasm::{hello, Simulator};
