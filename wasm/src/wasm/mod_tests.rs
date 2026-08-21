use super::*;

#[test]
fn hello_returns_expected_message() {
    assert_eq!(hello(), "planet-sim-wasm");
}

#[test]
#[cfg(target_arch = "wasm32")]
fn test_simulator_lifecycle() {
    use crate::physics::fixtures::*;
    use crate::physics::types::Body;
    use crate::physics::DEFAULT_GRAVITATIONAL_CONSTANT;

    let primary = Body::new((0.0, 0.0), (0.0, 0.0), EARTH_MASS, 6.371e6);
    let secondary = Body::new((EARTH_MOON_DISTANCE, 0.0), (0.0, 0.0), MOON_MASS, 1.737e6);
    let test_particle = Body::new((1.0e7, 0.0), (0.0, 0.0), 1.0, 1.0);
    let state = State::new(
        primary,
        secondary,
        test_particle,
        0.0,
        DEFAULT_GRAVITATIONAL_CONSTANT,
    );

    let state_json = serde_json::to_string(&state).unwrap();
    let mut sim = Simulator::new(&state_json).unwrap();

    // Step the simulation
    let _step_result_val = sim.step(10.0).unwrap();

    // Verify time advanced
    let current_state_val = sim.get_state().unwrap();
    let current_state: State = serde_wasm_bindgen::from_value(current_state_val).unwrap();
    assert_eq!(current_state.time, 10.0);
}

#[test]
fn test_simulator_set_state() {
    use crate::physics::fixtures::*;
    use crate::physics::types::Body;
    use crate::physics::DEFAULT_GRAVITATIONAL_CONSTANT;

    let primary = Body::new((0.0, 0.0), (0.0, 0.0), EARTH_MASS, 6.371e6);
    let secondary = Body::new((EARTH_MOON_DISTANCE, 0.0), (0.0, 0.0), MOON_MASS, 1.737e6);
    let test_particle = Body::new((1.0e7, 0.0), (0.0, 0.0), 1.0, 1.0);
    let state1 = State::new(
        primary,
        secondary,
        test_particle,
        0.0,
        DEFAULT_GRAVITATIONAL_CONSTANT,
    );

    let state_json = serde_json::to_string(&state1).unwrap();
    let mut sim = Simulator::new(&state_json).unwrap();

    // Change mass of primary in a new state
    let mut state2 = state1;
    state2.primary.mass = 2.0 * EARTH_MASS;
    let state2_json = serde_json::to_string(&state2).unwrap();

    sim.set_state(&state2_json).unwrap();
    assert_eq!(sim.state.primary.mass, 2.0 * EARTH_MASS);
}

// NOTE: the Err(...) branches of Simulator::new/set_state/step construct a JsValue via
// JsValue::from_str, which aborts the process (SIGABRT, "non-unwinding panic") when run under
// plain `cargo test` outside a wasm32 target — wasm-bindgen's JS glue isn't present there. CI
// only runs `cargo test` natively (see .github/workflows/test.yml), so these error paths cannot
// be exercised by this test file; they would need `wasm-bindgen-test` under a wasm32 target.
