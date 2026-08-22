//! Generalized N-body physics integrator.

use super::gravity::{acceleration_from_force, distance, force_between};
use super::integrator_kinematics::advance_pos;
use super::types::{Body, Vec2};

/// Symplectic Velocity-Verlet integration for N arbitrary bodies.
///
/// Computes mutual gravitational forces between all pairs of $N$ bodies and advances positions
/// and velocities in $\mathcal{O}(N^2)$ time per step.
///
/// # Examples
/// ```
/// use planet_sim_wasm::physics::{Body, Vec2};
/// use planet_sim_wasm::physics::n_body::{integrate_n_body, NBodyScratch};
///
/// let b1 = Body::new(Vec2::new(0.0, 0.0), Vec2::new(0.0, 0.0), 1.989e30, 6.96e8);
/// let b2 = Body::new(Vec2::new(1.496e11, 0.0), Vec2::new(0.0, 29780.0), 5.972e24, 6.371e6);
/// let bodies = vec![b1, b2];
///
/// let mut scratch = NBodyScratch::default();
/// let next_bodies = integrate_n_body(&bodies, 6.67430e-11, 1.0, &mut scratch);
/// assert_eq!(next_bodies.len(), 2);
/// assert!(next_bodies[1].position.y > 0.0);
/// ```
pub fn integrate_n_body(bodies: &[Body], g: f64, dt: f64, scratch: &mut NBodyScratch) -> Vec<Body> {
    let n = bodies.len();
    if n == 0 {
        return Vec::new();
    }
    scratch.resize(n);

    compute_accelerations(bodies, g, &mut scratch.acc_init);

    let mut new_bodies = Vec::with_capacity(n);
    for (b, &acc) in bodies.iter().zip(scratch.acc_init.iter()) {
        if b.locked.unwrap_or(false) {
            new_bodies.push(*b);
        } else {
            let pos_new = advance_pos(b.position, b.velocity, acc, dt);
            new_bodies.push(Body::new_locked(pos_new, b.velocity, b.mass, b.radius, false));
        }
    }

    compute_accelerations(&new_bodies, g, &mut scratch.acc_final);

    for i in 0..n {
        let b = &bodies[i];
        if b.locked.unwrap_or(false) {
            continue;
        }
        let v_new = b.velocity + (scratch.acc_init[i] + scratch.acc_final[i]) * (0.5 * dt);
        new_bodies[i].velocity = v_new;
        new_bodies[i].locked = Some(false);
    }

    new_bodies
}

/// Reusable scratch buffers for [`integrate_n_body`]'s per-step O(N) acceleration arrays.
///
/// Held by the caller (e.g. the WASM `Simulator`) across steps so the 60Hz integration loop
/// does not allocate two fresh `Vec<Vec2>` on every call. `new_bodies` inside
/// `integrate_n_body` is intentionally not part of this scratch space: it becomes the
/// persisted next-state buffer returned to the caller, not throwaway working memory.
#[derive(Default)]
pub struct NBodyScratch {
    acc_init: Vec<Vec2>,
    acc_final: Vec<Vec2>,
}

impl NBodyScratch {
    fn resize(&mut self, n: usize) {
        self.acc_init.clear();
        self.acc_init.resize(n, Vec2::ZERO);
        self.acc_final.clear();
        self.acc_final.resize(n, Vec2::ZERO);
    }
}

/// Computes the net gravitational acceleration on a body due to all other bodies.
///
/// Runs in $\mathcal{O}(N)$ time via a single pass over the full body list; prefer the
/// crate-internal pairwise accelerator when accelerations for *all* bodies are needed, since it
/// applies Newton's third law ($F_{ij} = -F_{ji}$) to halve the pairwise work from
/// $N(N-1)$ to $N(N-1)/2$.
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

/// Fills `acc` with the net gravitational acceleration on every body in `bodies`.
///
/// Visits each unordered pair `(i, j)` once and applies Newton's third law
/// ($F_{ij} = -F_{ji}$) to derive both bodies' contributions from a single force
/// evaluation, reducing the per-step cost from $2N(N-1)$ to $N(N-1)/2$ evaluations.
/// A locked body still exerts gravity on others but never accumulates its own
/// acceleration (it does not move).
fn compute_accelerations(bodies: &[Body], g: f64, acc: &mut [Vec2]) {
    for a in acc.iter_mut() {
        *a = Vec2::ZERO;
    }

    let n = bodies.len();
    for (i, body_i) in bodies.iter().enumerate() {
        let i_locked = body_i.locked.unwrap_or(false);
        for j in (i + 1)..n {
            let j_locked = bodies[j].locked.unwrap_or(false);
            if i_locked && j_locked {
                continue;
            }

            let r = distance(bodies[i].position, bodies[j].position);
            if r <= 0.0 {
                continue;
            }
            let r_safe = r.max(1000.0);
            let force = force_between(bodies[i].mass, bodies[j].mass, r_safe, g);
            let direction = (bodies[j].position - bodies[i].position) / r_safe;

            if !i_locked {
                acc[i] += direction * acceleration_from_force(force, bodies[i].mass);
            }
            if !j_locked {
                acc[j] -= direction * acceleration_from_force(force, bodies[j].mass);
            }
        }
    }
}

#[cfg(test)]
#[path = "n_body_tests.rs"]
mod tests;
