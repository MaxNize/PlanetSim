//! Velocity-Verlet integration for the restricted three-body engine.

use serde::{Deserialize, Serialize};

use super::gravity::{acceleration_from_force, distance, force_between};
use super::n_body::integrate_n_body;
use super::types::{Body, State, Vec2};

/// Maximum allowed time step in simulation seconds.
pub const MAX_TIME_STEP_SECONDS: f64 = 86_400.0;

/// The result of a simulation step.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepResult {
    pub new_state: State,
    pub kinetic_energy: f64,
    pub potential_energy: f64,
}

/// Advances the simulation by one step using a symplectic Velocity-Verlet integrator.
///
/// # Arguments
/// * `state` - The current simulation state (3-body or N-body)
/// * `dt` - Time step in simulation seconds ($0 < \text{dt} < 86400.0$)
///
/// # Returns
/// A [`StepResult`] containing the updated state and mechanical energy values.
///
/// # Examples
/// ```
/// use planet_sim_wasm::physics::{Body, State, integrate_step, Vec2};
///
/// let primary = Body::new(Vec2::new(0.0, 0.0), Vec2::new(0.0, 0.0), 1.989e30, 6.96e8);
/// let secondary = Body::new(Vec2::new(1.496e11, 0.0), Vec2::new(0.0, 29780.0), 5.972e24, 6.371e6);
/// let test_particle = Body::new(Vec2::new(1.50e11, 0.0), Vec2::new(0.0, 30000.0), 1000.0, 10.0);
/// let state = State::new(primary, secondary, test_particle, 0.0, 6.67430e-11);
///
/// let result = integrate_step(&state, 1.0);
/// assert!(result.new_state.time > 0.0);
/// assert!(result.kinetic_energy > 0.0);
/// ```
pub fn integrate_step(state: &State, dt: f64) -> StepResult {
    assert!(dt > 0.0, "dt must be positive");
    assert!(
        dt < MAX_TIME_STEP_SECONDS,
        "dt must be less than one day in simulation time"
    );

    let g = state.gravitational_constant;

    if let Some(ref list) = state.bodies {
        let new_bodies = integrate_n_body(list, g, dt);

        let mut ke = 0.0;
        for b in &new_bodies {
            ke += 0.5 * b.mass * b.velocity.length_sq();
        }

        let mut pe = 0.0;
        let n = new_bodies.len();
        for i in 0..n {
            for j in (i + 1)..n {
                let d = distance(new_bodies[i].position, new_bodies[j].position);
                if d > 0.0 {
                    pe -= force_between(new_bodies[i].mass, new_bodies[j].mass, d, g) * d;
                }
            }
        }

        let new_state = State::new_with_bodies(
            state.primary,
            state.secondary,
            state.test_particle,
            state.time + dt,
            g,
            Some(new_bodies),
        );

        StepResult {
            kinetic_energy: ke,
            potential_energy: pe,
            new_state,
        }
    } else {
        let a_p_init = pairwise_acc(&state.secondary, &state.primary, g);
        let a_s_init = pairwise_acc(&state.primary, &state.secondary, g);
        let a_t_init = tp_acc(&state.primary, &state.secondary, &state.test_particle, g);

        let pos_p = advance_pos(state.primary.position, state.primary.velocity, a_p_init, dt);
        let pos_s = advance_pos(
            state.secondary.position,
            state.secondary.velocity,
            a_s_init,
            dt,
        );
        let pos_t = advance_pos(
            state.test_particle.position,
            state.test_particle.velocity,
            a_t_init,
            dt,
        );

        let p_mid = Body::new(
            pos_p,
            state.primary.velocity,
            state.primary.mass,
            state.primary.radius,
        );
        let s_mid = Body::new(
            pos_s,
            state.secondary.velocity,
            state.secondary.mass,
            state.secondary.radius,
        );
        let t_mid = Body::new(
            pos_t,
            state.test_particle.velocity,
            state.test_particle.mass,
            state.test_particle.radius,
        );

        let a_p_final = pairwise_acc(&s_mid, &p_mid, g);
        let a_s_final = pairwise_acc(&p_mid, &s_mid, g);
        let a_t_final = tp_acc(&p_mid, &s_mid, &t_mid, g);

        let new_primary = advance_vel_and_body(state.primary, a_p_init, a_p_final, dt, pos_p);
        let new_secondary = advance_vel_and_body(state.secondary, a_s_init, a_s_final, dt, pos_s);
        let new_test_particle =
            advance_vel_and_body(state.test_particle, a_t_init, a_t_final, dt, pos_t);

        let new_state = State::new(
            new_primary,
            new_secondary,
            new_test_particle,
            state.time + dt,
            g,
        );

        StepResult {
            kinetic_energy: kinetic_energy(&new_state),
            potential_energy: potential_energy(&new_state),
            new_state,
        }
    }
}

pub(crate) fn advance_pos(p: Vec2, v: Vec2, a: Vec2, dt: f64) -> Vec2 {
    p + v * dt + a * (0.5 * dt * dt)
}

fn advance_vel_and_body(
    b: Body,
    a_init: Vec2,
    a_final: Vec2,
    dt: f64,
    pos: Vec2,
) -> Body {
    Body::new(
        pos,
        b.velocity + (a_init + a_final) * (0.5 * dt),
        b.mass,
        b.radius,
    )
}

fn pairwise_acc(src: &Body, tgt: &Body, g: f64) -> Vec2 {
    let r = distance(src.position, tgt.position);
    assert!(r > 0.0, "bodies must not occupy the same position");

    let r_safe = r.max(1000.0);
    let force = force_between(src.mass, tgt.mass, r_safe, g);
    let a_mag = acceleration_from_force(force, tgt.mass);

    (src.position - tgt.position) * (a_mag / r_safe)
}

fn tp_acc(p: &Body, s: &Body, t: &Body, g: f64) -> Vec2 {
    pairwise_acc(p, t, g) + pairwise_acc(s, t, g)
}

fn kinetic_energy(state: &State) -> f64 {
    let ke = |b: &Body| 0.5 * b.mass * b.velocity.length_sq();
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
#[path = "integrator_tests.rs"]
mod tests;
