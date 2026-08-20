//! Generalized N-body physics integrator.

use super::gravity::{acceleration_from_force, distance, force_between};
use super::integrator::advance_pos;
use super::types::{Body, Vec2};

/// Symplectic Velocity-Verlet integration for N arbitrary bodies.
///
/// Computes mutual gravitational forces between all pairs of $N$ bodies and advances positions
/// and velocities in $\mathcal{O}(N^2)$ time per step.
///
/// # Examples
/// ```
/// use planet_sim_wasm::physics::{Body, n_body::integrate_n_body, Vec2};
///
/// let b1 = Body::new(Vec2::new(0.0, 0.0), Vec2::new(0.0, 0.0), 1.989e30, 6.96e8);
/// let b2 = Body::new(Vec2::new(1.496e11, 0.0), Vec2::new(0.0, 29780.0), 5.972e24, 6.371e6);
/// let bodies = vec![b1, b2];
///
/// let next_bodies = integrate_n_body(&bodies, 6.67430e-11, 1.0);
/// assert_eq!(next_bodies.len(), 2);
/// assert!(next_bodies[1].position.y > 0.0);
/// ```
pub fn integrate_n_body(bodies: &[Body], g: f64, dt: f64) -> Vec<Body> {
    let n = bodies.len();
    if n == 0 {
        return Vec::new();
    }

    let mut acc_init = vec![Vec2::ZERO; n];
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

    let mut acc_final = vec![Vec2::ZERO; n];
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
        let v_new = b.velocity + (acc_init[i] + acc_final[i]) * (0.5 * dt);
        new_bodies[i].velocity = v_new;
        new_bodies[i].locked = Some(false);
    }

    new_bodies
}

/// Computes the net gravitational acceleration on a body due to all other bodies.
pub fn n_body_acc(bodies: &[Body], idx: usize, g: f64) -> Vec2 {
    let mut acc = Vec2::ZERO;
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
            acc += (b_j.position - b_i.position) * (a_mag / r_safe);
        }
    }
    acc
}
