//! WASM bindings for JavaScript callers.

use wasm_bindgen::prelude::*;
use crate::physics::{State, integrate_step, lagrange_points};

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
}

#[wasm_bindgen]
impl Simulator {
    /// Creates a new Simulator instance initialized with the given state JSON string.
    #[wasm_bindgen(constructor)]
    pub fn new(state_json: &str) -> Result<Simulator, JsValue> {
        let state: State = serde_json::from_str(state_json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(Simulator { state })
    }

    /// Advances the simulation state by one time step `dt` (in seconds).
    /// Returns the step result (including energies and the new state) serialized to JsValue.
    pub fn step(&mut self, dt: f64) -> Result<JsValue, JsValue> {
        if dt <= 0.0 {
            return Err(JsValue::from_str("Time step must be positive"));
        }
        if dt >= crate::physics::MAX_TIME_STEP_SECONDS {
            return Err(JsValue::from_str("Time step is too large (must be less than one day)"));
        }
        let result = integrate_step(&self.state, dt);
        self.state = result.new_state;
        serde_wasm_bindgen::to_value(&result).map_err(|e| e.into())
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
mod tests {
    use super::*;

    #[test]
    fn hello_returns_expected_message() {
        assert_eq!(hello(), "planet-sim-wasm");
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_simulator_lifecycle() {
        use crate::physics::DEFAULT_GRAVITATIONAL_CONSTANT;
        use crate::physics::fixtures::*;
        use crate::physics::types::Body;

        let primary = Body::new((0.0, 0.0), (0.0, 0.0), EARTH_MASS, 6.371e6);
        let secondary = Body::new((EARTH_MOON_DISTANCE, 0.0), (0.0, 0.0), MOON_MASS, 1.737e6);
        let test_particle = Body::new((1.0e7, 0.0), (0.0, 0.0), 1.0, 1.0);
        let state = State::new(primary, secondary, test_particle, 0.0, DEFAULT_GRAVITATIONAL_CONSTANT);

        let state_json = serde_json::to_string(&state).unwrap();
        let mut sim = Simulator::new(&state_json).unwrap();

        // Step the simulation
        let _step_result_val = sim.step(10.0).unwrap();

        // Verify time advanced
        let current_state_val = sim.get_state().unwrap();
        let current_state: State = serde_wasm_bindgen::from_value(current_state_val).unwrap();
        assert_eq!(current_state.time, 10.0);
    }
}
