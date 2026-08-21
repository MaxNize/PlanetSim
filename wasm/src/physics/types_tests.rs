use super::*;

#[test]
fn vec2_add_and_sub() {
    let a = Vec2::new(1.0, 2.0);
    let b = Vec2::new(3.0, 5.0);
    assert_eq!(a + b, Vec2::new(4.0, 7.0));
    assert_eq!(b - a, Vec2::new(2.0, 3.0));
}

#[test]
fn vec2_add_assign_and_sub_assign() {
    let mut v = Vec2::new(1.0, 1.0);
    v += Vec2::new(2.0, 3.0);
    assert_eq!(v, Vec2::new(3.0, 4.0));
    v -= Vec2::new(1.0, 1.0);
    assert_eq!(v, Vec2::new(2.0, 3.0));
}

#[test]
fn vec2_scalar_mul_both_directions() {
    let v = Vec2::new(2.0, 3.0);
    assert_eq!(v * 2.0, Vec2::new(4.0, 6.0));
    assert_eq!(2.0 * v, Vec2::new(4.0, 6.0));
}

#[test]
fn vec2_div_scalar() {
    let v = Vec2::new(4.0, 6.0);
    assert_eq!(v / 2.0, Vec2::new(2.0, 3.0));
}

#[test]
fn vec2_length_and_length_sq() {
    let v = Vec2::new(3.0, 4.0);
    assert_eq!(v.length_sq(), 25.0);
    assert_eq!(v.length(), 5.0);
}

#[test]
fn vec2_distance_between_points() {
    let a = Vec2::new(0.0, 0.0);
    let b = Vec2::new(3.0, 4.0);
    assert_eq!(a.distance(b), 5.0);
}

#[test]
fn vec2_from_tuple_and_array() {
    assert_eq!(Vec2::from((1.0, 2.0)), Vec2::new(1.0, 2.0));
    assert_eq!(Vec2::from([1.0, 2.0]), Vec2::new(1.0, 2.0));
}

#[test]
fn vec2_into_tuple() {
    let v = Vec2::new(1.5, 2.5);
    let tuple: (f64, f64) = v.into();
    assert_eq!(tuple, (1.5, 2.5));
}

#[test]
fn vec2_zero_constant() {
    assert_eq!(Vec2::ZERO, Vec2::new(0.0, 0.0));
}

#[test]
fn vec2_serializes_and_deserializes_as_tuple() {
    let v = Vec2::new(1.0, -2.5);
    let json = serde_json::to_string(&v).unwrap();
    assert_eq!(json, "[1.0,-2.5]");
    let round_tripped: Vec2 = serde_json::from_str(&json).unwrap();
    assert_eq!(round_tripped, v);
}

#[test]
fn body_new_leaves_locked_unset() {
    let body = Body::new((1.0, 2.0), (3.0, 4.0), 5.0, 6.0);
    assert_eq!(body.position, Vec2::new(1.0, 2.0));
    assert_eq!(body.velocity, Vec2::new(3.0, 4.0));
    assert_eq!(body.mass, 5.0);
    assert_eq!(body.radius, 6.0);
    assert_eq!(body.locked, None);
}

#[test]
fn body_new_locked_sets_locked_flag() {
    let body = Body::new_locked((0.0, 0.0), (0.0, 0.0), 1.0, 1.0, true);
    assert_eq!(body.locked, Some(true));
}

#[test]
fn physics_config_default_matches_named_constant() {
    let config = PhysicsConfig::default();
    assert_eq!(config.gravitational_constant, 6.67430e-11);
}

#[test]
fn physics_config_new_sets_custom_constant() {
    let config = PhysicsConfig::new(1.0);
    assert_eq!(config.gravitational_constant, 1.0);
}

#[test]
fn state_new_has_no_bodies() {
    let b = Body::new((0.0, 0.0), (0.0, 0.0), 1.0, 1.0);
    let state = State::new(b, b, b, 0.0, 6.674e-11);
    assert_eq!(state.bodies, None);
}

#[test]
fn state_new_with_bodies_stores_given_list() {
    let b = Body::new((0.0, 0.0), (0.0, 0.0), 1.0, 1.0);
    let list = vec![b, b];
    let state = State::new_with_bodies(b, b, b, 0.0, 6.674e-11, Some(list.clone()));
    assert_eq!(state.bodies, Some(list));
}

#[test]
fn state_with_config_uses_configs_gravitational_constant() {
    let b = Body::new((0.0, 0.0), (0.0, 0.0), 1.0, 1.0);
    let config = PhysicsConfig::new(42.0);
    let state = State::with_config(b, b, b, 0.0, config);
    assert_eq!(state.gravitational_constant, 42.0);
    assert_eq!(state.bodies, None);
}
