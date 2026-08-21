use super::*;
use crate::physics::gravity::DEFAULT_GRAVITATIONAL_CONSTANT;
use crate::physics::types::{Body, State};

fn circular_orbit_state() -> State {
    let separation = 1.0e6;
    let mass = 5.0e24;
    let orbital_speed = (DEFAULT_GRAVITATIONAL_CONSTANT * mass / (2.0 * separation)).sqrt();

    let primary = Body::new((-separation * 0.5, 0.0), (0.0, orbital_speed), mass, 1.0e6);
    let secondary = Body::new((separation * 0.5, 0.0), (0.0, -orbital_speed), mass, 1.0e6);
    let test_particle = Body::new((0.0, 0.0), (0.0, 0.0), 1.0, 1.0);

    State::new(
        primary,
        secondary,
        test_particle,
        0.0,
        DEFAULT_GRAVITATIONAL_CONSTANT,
    )
}

#[test]
fn integrate_step_advances_time_and_preserves_circular_orbit_energy_reasonably() {
    let initial_state = circular_orbit_state();
    let initial_energy =
        kinetic_energy(&initial_state) + potential_energy(&initial_state);
    let mut state = initial_state;
    let mut scratch = NBodyScratch::default();

    for _ in 0..500 {
        state = integrate_step(&state, 10.0, &mut scratch).new_state;
    }

    let final_energy = kinetic_energy(&state) + potential_energy(&state);
    let variance = (final_energy - initial_energy).abs() / initial_energy.abs();

    assert!(state.time > 0.0);
    assert!(variance < 0.001, "energy variance was {variance}");
}

#[test]
fn integrate_step_n_body_test() {
    let b1 = Body::new((0.0, 0.0), (0.0, 0.0), 1.0e24, 1.0e5);
    let b2 = Body::new((1.0e6, 0.0), (0.0, 1000.0), 1.0e22, 1.0e4);
    let b3 = Body::new_locked((0.0, 1.0e7), (0.0, 0.0), 1.0e20, 1.0e3, true);

    let initial_state = State::new_with_bodies(
        b1,
        b1,
        b1,
        0.0,
        DEFAULT_GRAVITATIONAL_CONSTANT,
        Some(vec![b1, b2, b3]),
    );

    let mut scratch = NBodyScratch::default();
    let res = integrate_step(&initial_state, 10.0, &mut scratch);
    let next_state = res.new_state;

    assert_eq!(next_state.time, 10.0);
    let list = next_state.bodies.unwrap();
    assert_eq!(list.len(), 3);

    // Locked body should not move
    assert_eq!(list[2].position, Vec2::new(0.0, 1.0e7));
    assert_eq!(list[2].velocity, Vec2::ZERO);

    // Unlocked body should move
    assert_ne!(list[1].position, Vec2::new(1.0e6, 0.0));
}
