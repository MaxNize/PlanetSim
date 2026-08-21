use super::{
    acceleration_from_force, collinear_equation, collinear_equation_derivative, distance,
    force_between, gravitational_force, lagrange_points, solve_collinear_point,
    DEFAULT_GRAVITATIONAL_CONSTANT,
};
use crate::physics::fixtures::*;
use crate::physics::types::Body;

#[test]
fn distance_between_earth_and_moon_matches_fixture() {
    let computed_distance = distance((0.0, 0.0), (EARTH_MOON_DISTANCE, 0.0));
    assert!((computed_distance - EARTH_MOON_DISTANCE).abs() < 1e-6);
}

#[test]
fn force_between_earth_and_moon_matches_expected_value() {
    let force = force_between(
        EARTH_MASS,
        MOON_MASS,
        EARTH_MOON_DISTANCE,
        DEFAULT_GRAVITATIONAL_CONSTANT,
    );
    let expected_force = 1.982054291079361e20;
    assert!((force - expected_force).abs() < 1e16);
}

#[test]
fn gravitational_force_uses_default_constant() {
    let force = gravitational_force(EARTH_MASS, MOON_MASS, EARTH_MOON_DISTANCE);
    let expected_force = 1.982054291079361e20;
    assert!((force - expected_force).abs() < 1e16);
}

#[test]
fn acceleration_is_force_divided_by_mass() {
    let acceleration = acceleration_from_force(12.0, 3.0);
    assert!((acceleration - 4.0).abs() < f64::EPSILON);
}

#[test]
fn solve_collinear_point_breaks_and_returns_the_guess_when_the_derivative_vanishes() {
    // solve_collinear_point's Newton iteration guards against dividing by a near-zero
    // derivative (it would blow up the step size) by breaking out of the loop and returning
    // the current guess unchanged. Physical mass ratios (0 < r < 1) never actually vanish the
    // derivative — it stays strictly positive there — so this locates a root of the derivative
    // itself for an unphysical (but not otherwise invalid) mass_ratio via bisection, independent
    // of solve_collinear_point, to exercise that guard directly.
    let mass_ratio = -1.0;
    let mut lo = 3.0_f64;
    let mut hi = 3.3_f64;
    assert!(collinear_equation_derivative(lo, mass_ratio) * collinear_equation_derivative(hi, mass_ratio) < 0.0);

    for _ in 0..200 {
        let mid = (lo + hi) / 2.0;
        if collinear_equation_derivative(lo, mass_ratio) * collinear_equation_derivative(mid, mass_ratio) <= 0.0 {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    let vanishing_point = (lo + hi) / 2.0;
    assert!(collinear_equation_derivative(vanishing_point, mass_ratio).abs() < 1e-14);
    // The root itself must not also be a root of collinear_equation, otherwise the loop would
    // return via its other early exit (the |f(x)| < 1e-14 check) instead of the derivative guard.
    assert!(collinear_equation(vanishing_point, mass_ratio).abs() > 1e-6);

    let result = solve_collinear_point(vanishing_point, mass_ratio);
    assert_eq!(result, vanishing_point);
}

#[test]
fn lagrange_points_return_equilateral_l4_l5() {
    let primary = Body::new((0.0, 0.0), (0.0, 0.0), EARTH_MASS, 6.371e6);
    let secondary = Body::new((EARTH_MOON_DISTANCE, 0.0), (0.0, 0.0), MOON_MASS, 1.737e6);

    let points = lagrange_points(&primary, &secondary, DEFAULT_GRAVITATIONAL_CONSTANT);
    let expected_l4_y = (3.0_f64.sqrt() * 0.5) * EARTH_MOON_DISTANCE;
    assert!((points.l4.x - EARTH_MOON_DISTANCE * 0.5).abs() < 1e-3);
    assert!((points.l4.y - expected_l4_y).abs() < 1e-3);
    assert!((points.l5.x - EARTH_MOON_DISTANCE * 0.5).abs() < 1e-3);
    assert!((points.l5.y + expected_l4_y).abs() < 1e-3);
}
