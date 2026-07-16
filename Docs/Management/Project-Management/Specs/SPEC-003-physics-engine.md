# SPEC-003: Restricted Three-Body Physics Engine with Lagrange Points (Rust)

-

## 📝 User Story
```text
As a physics enthusiast
I want accurate gravitational orbital mechanics calculations for Lagrange-point systems
so that I can learn about equilibrium points and experiment with different configurations
```
-

## ✅ Acceptance Criteria

### Core Physics
- [ ] AC 1.1: Newton's law of universal gravitation correctly implemented: F = G *(m1* m2) / r²
- [ ] AC 1.2: Lagrange point positions L1-L5 are computed for a primary/secondary body pair
- [ ] AC 1.3: Acceleration calculation from forces: a = F / m
- [ ] AC 1.4: Velocity updated via: v = v_old + a * dt
- [ ] AC 1.5: Position updated via: x = x_old + v * dt (or better integration method)

### Numerical Stability
- [ ] AC 2.1: Symplectic integrator (e.g., Velocity Verlet) used for energy conservation
- [ ] AC 2.2: Float precision: 64-bit (f64) used throughout
- [ ] AC 2.3: Time step validation: dt must be positive and reasonable (< 1 day in simulation time)

### Data Structures
- [ ] AC 3.1: Body struct contains: position (x, y), velocity (vx, vy), mass, radius
- [ ] AC 3.2: State struct contains: primary body, secondary body, test particle state, current time, gravitational constant
- [ ] AC 3.3: Serializable via serde for WASM boundary marshalling

### Physics Validation
- [ ] AC 4.1: Circular orbit test: bodies maintain stable circular orbits (energy variance < 0.1%)
- [ ] AC 4.2: Lagrange point stability test: L4/L5 remain near-equilibrium for small perturbations
- [ ] AC 4.3: Known orbital elements match reference values for a standard primary/secondary system

### Performance
- [ ] AC 5.1: Single integration step completes in < 100 microseconds (1000 steps in < 0.1 sec)
- [ ] AC 5.2: No allocations in hot loop (pre-allocate state vectors)
- [ ] AC 5.3: Suitable for 60 FPS @ 60x time acceleration

-

## 🔧 Technical Solution

### Rust Modules

**`src/physics/mod.rs`** - Main API
```rust
pub use self::types::*;
pub use self::gravity::*;
pub use self::integrator::*;

pub mod types;      // Body, State, PhysicsConfig
pub mod gravity;    // force_between, acceleration
pub mod integrator; // StepResult, integrate_step()
```
**`src/physics/types.rs`** - Data structures
```rust
pub struct Body {
    pub position: (f64, f64),  // (x, y) in meters
    pub velocity: (f64, f64),  // (vx, vy) in m/s
    pub mass: f64,             // kg
    pub radius: f64,           // meters (visual only)
}

pub struct State {
    pub body1: Body,
    pub body2: Body,
    pub time: f64,
    pub config: PhysicsConfig,
}

pub struct PhysicsConfig {
    pub g: f64,  // Gravitational constant (default 6.674e-11)
}
```
**`src/physics/gravity.rs`** - Physics calculations
```rust
pub fn distance(pos1: (f64, f64), pos2: (f64, f64)) -> f64;
pub fn force_between(m1: f64, m2: f64, distance: f64, g: f64) -> f64;
pub fn acceleration_from_force(force: f64, mass: f64) -> f64;
```
**`src/physics/integrator.rs`** - Integration method (Velocity Verlet)
```rust
pub struct StepResult {
    pub new_state: State,
    pub kinetic_energy: f64,
    pub potential_energy: f64,
}

pub fn integrate_step(state: &State, dt: f64) -> StepResult;
```
### WASM Bindings

**`src/lib.rs`** (wasm entry point)
```rust
use wasm_bindgen::prelude::*;
use crate::physics::*;

#[wasm_bindgen]
pub struct Simulator {
    state: State,
}

#[wasm_bindgen]
impl Simulator {
    #[wasm_bindgen(constructor)]
    pub fn new(/* config */) -> Simulator;

    pub fn step(&mut self, dt: f64) -> StepResult;
    pub fn get_state(&self) -> JsValue;  // Serialize to JS
}
```
-

## 🧪 Tests

- [ ] Unit: Physics laws verified against known formulas
- [ ] Integration: Circular orbit test (energy conservation ± 0.1%)
- [ ] Reference: Compare computed Lagrange points against a known primary/secondary system
- [ ] Manual: Visualize orbits in browser, verify smooth circular motion

-

## 🚀 Implementation Flow

1. Spec Review → Data structures (RED tests) → Gravity functions (GREEN) → Integrator → Lagrange-point validation → Manual visual verification

-

## ✅ Definition of Done

- [ ] DOD-Global: All acceptance criteria met
- [ ] DOD-Physics: Reference test passes (circular orbit stable)
- [ ] DOD-Performance: Single step < 100 microseconds
- [ ] DOD-WASM: Serialization/deserialization works

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-002
**Required by**: SPEC-004
