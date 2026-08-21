//! WASM bindings for JavaScript callers.

use crate::physics::{integrate_step, lagrange_points, NBodyScratch, State};
use wasm_bindgen::prelude::*;

/// Returns a small greeting from the WASM module.
///
/// # Example
/// ```
/// assert_eq!(planet_sim_wasm::hello(), "planet-sim-wasm");
/// ```
#[wasm_bindgen]
pub fn hello() -> String {
    "planet-sim-wasm".to_string()
}

/// The main Simulator class exposed to JavaScript.
/// Manages the physics state and coordinates stepping the simulation forward.
#[wasm_bindgen]
pub struct Simulator {
    state: State,
    n_body_scratch: NBodyScratch,
}

#[wasm_bindgen]
impl Simulator {
    /// Creates a new Simulator instance initialized with the given state JSON string.
    #[wasm_bindgen(constructor)]
    pub fn new(state_json: &str) -> Result<Simulator, JsValue> {
        let state: State =
            serde_json::from_str(state_json).map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(Simulator {
            state,
            n_body_scratch: NBodyScratch::default(),
        })
    }

    /// Updates the simulator state with the given state JSON string.
    pub fn set_state(&mut self, state_json: &str) -> Result<(), JsValue> {
        let state: State =
            serde_json::from_str(state_json).map_err(|e| JsValue::from_str(&e.to_string()))?;
        self.state = state;
        Ok(())
    }

    /// Advances the simulation state by one time step `dt` (in seconds).
    /// Returns the step result (including energies and the new state) serialized to JsValue.
    pub fn step(&mut self, dt: f64) -> Result<JsValue, JsValue> {
        if dt.is_nan() || dt <= 0.0 {
            return Err(JsValue::from_str("Time step must be positive"));
        }
        if dt >= crate::physics::MAX_TIME_STEP_SECONDS {
            return Err(JsValue::from_str(
                "Time step is too large (must be less than one day)",
            ));
        }
        let result = integrate_step(&self.state, dt, &mut self.n_body_scratch);
        let val = serde_wasm_bindgen::to_value(&result).map_err(JsValue::from)?;
        self.state = result.new_state;
        Ok(val)
    }

    /// Returns the current simulation state serialized to JsValue.
    pub fn get_state(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.state).map_err(|e| e.into())
    }

    /// Calculates and returns the L1 to L5 Lagrange points based on the current state.
    pub fn get_lagrange_points(&self) -> Result<JsValue, JsValue> {
        let points = lagrange_points(
            &self.state.primary,
            &self.state.secondary,
            self.state.gravitational_constant,
        );
        serde_wasm_bindgen::to_value(&points).map_err(|e| e.into())
    }
}

#[cfg(test)]
#[path = "mod_tests.rs"]
mod tests;
