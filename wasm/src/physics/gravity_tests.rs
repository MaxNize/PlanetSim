use super::{
    acceleration_from_force, distance, force_between, gravitational_force, lagrange_points,
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
