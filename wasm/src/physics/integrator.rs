//! Velocity-Verlet integration for the restricted three-body engine.

use serde::{Deserialize, Serialize};

use super::gravity::{acceleration_from_force, distance, force_between};
use super::types::{Body, State};

/// Maximum allowed time step in simulation seconds.
pub const MAX_TIME_STEP_SECONDS: f64 = 86_400.0;

/// The result of a simulation step.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepResult {
    pub new_state: State,
    pub kinetic_energy: f64,
    pub potential_energy: f64,
}

/// Advances the simulation by one step using a symplectic Velocity-Verlet integrator.
pub fn integrate_step(state: &State, dt: f64) -> StepResult {
    assert!(dt > 0.0, "dt must be positive");
    assert!(dt < MAX_TIME_STEP_SECONDS, "dt must be less than one day in simulation time");

    let g = state.gravitational_constant;
    let a_p_init = pairwise_acc(&state.secondary, &state.primary, g);
    let a_s_init = pairwise_acc(&state.primary, &state.secondary, g);
    let a_t_init = tp_acc(&state.primary, &state.secondary, &state.test_particle, g);

    let pos_p = advance_pos(state.primary.position, state.primary.velocity, a_p_init, dt);
    let pos_s = advance_pos(state.secondary.position, state.secondary.velocity, a_s_init, dt);
    let pos_t = advance_pos(state.test_particle.position, state.test_particle.velocity, a_t_init, dt);

    let p_mid = Body::new(pos_p, state.primary.velocity, state.primary.mass, state.primary.radius);
    let s_mid = Body::new(pos_s, state.secondary.velocity, state.secondary.mass, state.secondary.radius);
    let t_mid = Body::new(pos_t, state.test_particle.velocity, state.test_particle.mass, state.test_particle.radius);

    let a_p_final = pairwise_acc(&s_mid, &p_mid, g);
    let a_s_final = pairwise_acc(&p_mid, &s_mid, g);
    let a_t_final = tp_acc(&p_mid, &s_mid, &t_mid, g);

    let new_primary = advance_vel_and_body(state.primary, a_p_init, a_p_final, dt, pos_p);
    let new_secondary = advance_vel_and_body(state.secondary, a_s_init, a_s_final, dt, pos_s);
    let new_test_particle = advance_vel_and_body(state.test_particle, a_t_init, a_t_final, dt, pos_t);

    let new_state = State::new(new_primary, new_secondary, new_test_particle, state.time + dt, g);

    StepResult {
        kinetic_energy: kinetic_energy(&new_state),
        potential_energy: potential_energy(&new_state),
        new_state,
    }
}

fn advance_pos(p: (f64, f64), v: (f64, f64), a: (f64, f64), dt: f64) -> (f64, f64) {
    let h = 0.5 * dt * dt;
    (p.0 + v.0 * dt + a.0 * h, p.1 + v.1 * dt + a.1 * h)
}

fn advance_vel_and_body(b: Body, a_init: (f64, f64), a_final: (f64, f64), dt: f64, pos: (f64, f64)) -> Body {
    Body::new(
        pos,
        (
            b.velocity.0 + 0.5 * (a_init.0 + a_final.0) * dt,
            b.velocity.1 + 0.5 * (a_init.1 + a_final.1) * dt,
        ),
        b.mass,
        b.radius,
    )
}

fn pairwise_acc(src: &Body, tgt: &Body, g: f64) -> (f64, f64) {
    let r = distance(src.position, tgt.position);
    let force = force_between(src.mass, tgt.mass, r, g);
    let a_mag = acceleration_from_force(force, tgt.mass);

    let dx = src.position.0 - tgt.position.0;
    let dy = src.position.1 - tgt.position.1;
    assert!(r > 0.0, "bodies must not occupy the same position");
    (dx * a_mag / r, dy * a_mag / r)
}

fn tp_acc(p: &Body, s: &Body, t: &Body, g: f64) -> (f64, f64) {
    let a_p = pairwise_acc(p, t, g);
    let a_s = pairwise_acc(s, t, g);
    (a_p.0 + a_s.0, a_p.1 + a_s.1)
}

fn kinetic_energy(state: &State) -> f64 {
    let ke = |b: &Body| 0.5 * b.mass * (b.velocity.0.powi(2) + b.velocity.1.powi(2));
    ke(&state.primary) + ke(&state.secondary) + ke(&state.test_particle)
}

fn potential_energy(state: &State) -> f64 {
    let g = state.gravitational_constant;
    let d_ps = distance(state.primary.position, state.secondary.position);
    let d_pt = distance(state.primary.position, state.test_particle.position);
    let d_st = distance(state.secondary.position, state.test_particle.position);

    -force_between(state.primary.mass, state.secondary.mass, d_ps, g) * d_ps
        - force_between(state.primary.mass, state.test_particle.mass, d_pt, g) * d_pt
        - force_between(state.secondary.mass, state.test_particle.mass, d_st, g) * d_st
}

#[cfg(test)]
mod tests {
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

        State::new(primary, secondary, test_particle, 0.0, DEFAULT_GRAVITATIONAL_CONSTANT)
    }

    #[test]
    fn integrate_step_advances_time_and_preserves_circular_orbit_energy_reasonably() {
        let initial_state = circular_orbit_state();
        let initial_energy = super::kinetic_energy(&initial_state) + super::potential_energy(&initial_state);
        let mut state = initial_state;

        for _ in 0..500 {
            state = integrate_step(&state, 10.0).new_state;
        }

        let final_energy = super::kinetic_energy(&state) + super::potential_energy(&state);
        let variance = (final_energy - initial_energy).abs() / initial_energy.abs();

        assert!(state.time > 0.0);
        assert!(variance < 0.001, "energy variance was {variance}");
    }
}
