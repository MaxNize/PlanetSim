//! Generalized N-body physics integrator.

use super::gravity::{acceleration_from_force, distance, force_between};
use super::types::Body;
use super::integrator::advance_pos;

/// Symplectic Velocity-Verlet integration for N arbitrary bodies.
pub fn integrate_n_body(bodies: &[Body], g: f64, dt: f64) -> Vec<Body> {
    let n = bodies.len();
    if n == 0 {
        return Vec::new();
    }

    let mut acc_init = vec![(0.0, 0.0); n];
    for i in 0..n {
        if bodies[i].locked.unwrap_or(false) {
            continue;
        }
        acc_init[i] = n_body_acc(bodies, i, g);
    }

    let mut new_bodies = Vec::with_capacity(n);
    for i in 0..n {
        let b = &bodies[i];
        if b.locked.unwrap_or(false) {
            new_bodies.push(*b);
        } else {
            let pos_new = advance_pos(b.position, b.velocity, acc_init[i], dt);
            new_bodies.push(Body::new_locked(pos_new, b.velocity, b.mass, b.radius, false));
        }
    }

    let mut acc_final = vec![(0.0, 0.0); n];
    for i in 0..n {
        if new_bodies[i].locked.unwrap_or(false) {
            continue;
        }
        acc_final[i] = n_body_acc(&new_bodies, i, g);
    }

    for i in 0..n {
        let b = &bodies[i];
        if b.locked.unwrap_or(false) {
            continue;
        }
        let v_new = (
            b.velocity.0 + 0.5 * (acc_init[i].0 + acc_final[i].0) * dt,
            b.velocity.1 + 0.5 * (acc_init[i].1 + acc_final[i].1) * dt,
        );
        new_bodies[i].velocity = v_new;
        new_bodies[i].locked = Some(false);
    }

    new_bodies
}

/// Computes the net gravitational acceleration on a body due to all other bodies.
pub fn n_body_acc(bodies: &[Body], idx: usize, g: f64) -> (f64, f64) {
    let mut ax = 0.0;
    let mut ay = 0.0;
    let b_i = &bodies[idx];

    for (j, b_j) in bodies.iter().enumerate() {
        if j == idx {
            continue;
        }
        let r = distance(b_i.position, b_j.position);
        if r > 0.0 {
            let r_safe = r.max(1000.0);
            let force = force_between(b_i.mass, b_j.mass, r_safe, g);
            let a_mag = acceleration_from_force(force, b_i.mass);
            let dx = b_j.position.0 - b_i.position.0;
            let dy = b_j.position.1 - b_i.position.1;
            ax += dx * a_mag / r_safe;
            ay += dy * a_mag / r_safe;
        }
    }
    (ax, ay)
}
