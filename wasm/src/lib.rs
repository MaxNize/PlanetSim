//! WebAssembly entry points for the planet simulation physics engine.

pub mod physics;
pub mod wasm;

pub use physics::*;
pub use wasm::{hello, Simulator};
