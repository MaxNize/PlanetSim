use super::*;
use crate::physics::fixtures::*;

#[test]
fn integrate_n_body_returns_empty_for_no_bodies() {
    let mut scratch = NBodyScratch::default();
    let result = integrate_n_body(&[], G, 1.0, &mut scratch);
    assert!(result.is_empty());
}

#[test]
fn integrate_n_body_leaves_a_single_locked_body_stationary() {
    let locked = Body::new_locked((1.0e6, 0.0), (0.0, 0.0), EARTH_MASS, 1.0, true);
    let mut scratch = NBodyScratch::default();
    let result = integrate_n_body(&[locked], G, 10.0, &mut scratch);
    assert_eq!(result[0].position, locked.position);
    assert_eq!(result[0].velocity, Vec2::ZERO);
}

#[test]
fn n_body_acc_ignores_a_body_at_the_exact_same_position() {
    let bodies = vec![
        Body::new((0.0, 0.0), (0.0, 0.0), EARTH_MASS, 1.0),
        Body::new((0.0, 0.0), (0.0, 0.0), MOON_MASS, 1.0),
    ];
    let acc = n_body_acc(&bodies, 0, G);
    assert_eq!(acc, Vec2::ZERO);
}

#[test]
fn n_body_acc_pulls_toward_the_other_body() {
    let bodies = vec![
        Body::new((0.0, 0.0), (0.0, 0.0), 1.0, 1.0),
        Body::new((1.0e7, 0.0), (0.0, 0.0), EARTH_MASS, 1.0),
    ];
    let acc = n_body_acc(&bodies, 0, G);
    assert!(acc.x > 0.0);
    assert_eq!(acc.y, 0.0);
}

#[test]
fn compute_accelerations_skips_pairs_that_are_both_locked() {
    let bodies = vec![
        Body::new_locked((0.0, 0.0), (0.0, 0.0), EARTH_MASS, 1.0, true),
        Body::new_locked((1.0e6, 0.0), (0.0, 0.0), EARTH_MASS, 1.0, true),
    ];
    let mut acc = vec![Vec2::ZERO; 2];
    compute_accelerations(&bodies, G, &mut acc);
    assert_eq!(acc[0], Vec2::ZERO);
    assert_eq!(acc[1], Vec2::ZERO);
}

#[test]
fn compute_accelerations_still_pulls_an_unlocked_body_toward_a_locked_one() {
    let bodies = vec![
        Body::new_locked((0.0, 0.0), (0.0, 0.0), SUN_MASS, 1.0, true),
        Body::new((1.0e9, 0.0), (0.0, 0.0), 1.0, 1.0),
    ];
    let mut acc = vec![Vec2::ZERO; 2];
    compute_accelerations(&bodies, G, &mut acc);
    assert_eq!(acc[0], Vec2::ZERO, "locked body must not accumulate its own acceleration");
    assert!(acc[1].x < 0.0, "unlocked body should accelerate toward the locked one");
}

#[test]
fn compute_accelerations_skips_pairs_at_identical_positions() {
    let bodies = vec![
        Body::new((5.0, 5.0), (0.0, 0.0), EARTH_MASS, 1.0),
        Body::new((5.0, 5.0), (0.0, 0.0), MOON_MASS, 1.0),
    ];
    let mut acc = vec![Vec2::ZERO; 2];
    compute_accelerations(&bodies, G, &mut acc);
    assert_eq!(acc[0], Vec2::ZERO);
    assert_eq!(acc[1], Vec2::ZERO);
}
