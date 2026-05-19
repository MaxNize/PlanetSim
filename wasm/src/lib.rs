//! WebAssembly entry points for the planet simulation physics engine.

mod physics;
mod wasm;

pub use physics::{calculate_force, gravitational_force};
pub use wasm::hello;
