//! Mechanical energy accounting for the restricted three-body integrator.

use super::gravity::{distance, force_between};
use super::types::{Body, State};

pub(crate) fn kinetic_energy(state: &State) -> f64 {
    let ke = |b: &Body| 0.5 * b.mass * b.velocity.length_sq();
    ke(&state.primary) + ke(&state.secondary) + ke(&state.test_particle)
}

pub(crate) fn potential_energy(state: &State) -> f64 {
    let g = state.gravitational_constant;
    let d_ps = distance(state.primary.position, state.secondary.position);
    let d_pt = distance(state.primary.position, state.test_particle.position);
    let d_st = distance(state.secondary.position, state.test_particle.position);

    -force_between(state.primary.mass, state.secondary.mass, d_ps, g) * d_ps
        - force_between(state.primary.mass, state.test_particle.mass, d_pt, g) * d_pt
        - force_between(state.secondary.mass, state.test_particle.mass, d_st, g) * d_st
}
