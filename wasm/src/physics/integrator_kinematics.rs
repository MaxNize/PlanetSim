//! Position/velocity advancement helpers shared by the restricted and N-body integrators.

use super::gravity::{acceleration_from_force, distance, force_between};
use super::types::{Body, Vec2};

pub(crate) fn advance_pos(p: Vec2, v: Vec2, a: Vec2, dt: f64) -> Vec2 {
    p + v * dt + a * (0.5 * dt * dt)
}

pub(crate) fn advance_vel_and_body(
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

pub(crate) fn pairwise_acc(src: &Body, tgt: &Body, g: f64) -> Vec2 {
    let r = distance(src.position, tgt.position);
    // Coincident (or NaN) bodies are softened rather than panicking: r.max(1000.0)
    // returns 1000.0 for r == 0.0 or r.is_nan(), matching n_body_acc's guard behavior.
    let r_safe = r.max(1000.0);
    let force = force_between(src.mass, tgt.mass, r_safe, g);
    let a_mag = acceleration_from_force(force, tgt.mass);

    (src.position - tgt.position) * (a_mag / r_safe)
}

pub(crate) fn tp_acc(p: &Body, s: &Body, t: &Body, g: f64) -> Vec2 {
    pairwise_acc(p, t, g) + pairwise_acc(s, t, g)
}
