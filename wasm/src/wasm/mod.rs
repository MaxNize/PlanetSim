//! WASM bindings for JavaScript callers.

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

#[cfg(test)]
mod tests {
    use super::hello;

    #[test]
    fn hello_returns_expected_message() {
        assert_eq!(hello(), "planet-sim-wasm");
    }
}
