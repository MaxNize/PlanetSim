# SPEC-013: API Documentation

-

## 📝 User Story
```text
As a developer
I want clear documentation of public APIs and physics functions
so that I can integrate the library or understand how to extend it
```
-

## ✅ Acceptance Criteria

### Rust API Documentation
- [ ] AC 1.1: `cargo doc` generates docs from doc comments
- [ ] AC 1.2: Public functions include examples (doctests)
- [ ] AC 1.3: Physics equations explained in module docs
- [ ] AC 1.4: Links between related concepts (e.g., force → acceleration)

### JavaScript/TypeScript API
- [ ] AC 2.1: JSDoc comments on all public exports
- [ ] AC 2.2: TypeScript interfaces fully documented
- [ ] AC 2.3: Example usage in README for each hook/component
- [ ] AC 2.4: Parameter descriptions include valid ranges

### WASM Bridge Documentation
- [ ] AC 3.1: `wasm-bindgen` bindings documented
- [ ] AC 3.2: Data marshalling explained (Rust ↔ JS)
- [ ] AC 3.3: Performance characteristics documented
- [ ] AC 3.4: Error handling patterns explained

### Physics Documentation
- [ ] AC 4.1: Numerical method explained (Velocity Verlet)
- [ ] AC 4.2: Gravitational constant and units documented
- [ ] AC 4.3: Known limitations documented (2-body only, float precision)
- [ ] AC 4.4: References to physics textbooks/papers

### Usage Guides
- [ ] AC 5.1: Quick start guide (simple example)
- [ ] AC 5.2: Advanced usage guide (Sandbox mode, custom configs)
- [ ] AC 5.3: Architecture overview diagram
- [ ] AC 5.4: Troubleshooting guide

### Generated Documentation
- [ ] AC 6.1: Docs built and published on every release
- [ ] AC 6.2: Search functionality available
- [ ] AC 6.3: Docs versioning (latest + previous releases)

-

## 🔧 Technical Solution

### Rust Documentation

**`src/physics/mod.rs` (doc example)**
```rust
//! Physics engine for 2-body orbital mechanics.
//!
//! This module provides high-performance gravitational calculations suitable for
//! real-time 60 FPS simulation.
//!
//! # Physics Model
//!
//! Uses Newton's law of universal gravitation and velocity Verlet integration:
//!
//! ```
//! F = G * (m1 * m2) / r²
//! ```
//!
//! # Examples
//!
//! ```
//! use planet_sim::physics::{Body, State, integrate_step};
//!
//! let state = State::new(/* config */);
//! let result = integrate_step(&state, 1.0);  // dt = 1.0 second
//! ```

pub use self::types::*;
pub use self::gravity::*;
pub use self::integrator::*;
```
**`src/physics/gravity.rs` (doc examples)**
```rust
/// Calculates gravitational force between two bodies.
///
/// Uses Newton's law of universal gravitation:
/// F = G * (m1 * m2) / r²
///
/// # Arguments
/// * `m1` - Mass of body 1 (kg)
/// * `m2` - Mass of body 2 (kg)
/// * `distance` - Euclidean distance between bodies (m)
/// * `g` - Gravitational constant (default: 6.674e-11 m³ kg⁻¹ s⁻²)
///
/// # Returns
/// Magnitude of gravitational force (N)
///
/// # Example
/// ```
/// let force = force_between(5.972e24, 7.342e22, 3.84e8, 6.674e-11);
/// assert!((force - 1.98e20).abs() < 1e19);  // Approximate Earth-Moon force
/// ```
pub fn force_between(m1: f64, m2: f64, distance: f64, g: f64) -> f64 {
    if distance == 0.0 {
        return 0.0;  // Avoid division by zero
    }
    g * (m1 * m2) / (distance * distance)
}
```
### TypeScript Documentation

**`src/services/wasmBridge.ts` (JSDoc example)**
```typescript
/**
- Bridge between Rust WASM physics engine and JavaScript UI.
- Handles all Rust ↔ JS communication and data marshalling.
- * @example
- ```typescript
- const bridge = new SimulatorBridge(config);
- const state = bridge.step(0.016);  // 60 FPS
- ```
 */
export class SimulatorBridge {
  /**
- Initialize simulator with configuration.
- @param config - Physics configuration (mass, velocity, time scale)
- @throws {Error} If WASM module fails to load or config is invalid
   */
  constructor(config: PhysicsConfig) {
    // ...
  }

  /**
- Execute one simulation step.
- @param dt - Delta time in seconds (recommended: 0.016 for 60 FPS)
- @returns Current simulation state (bodies, energy, time)
- @throws {Error} If dt is negative or WASM panic occurs
   */
  step(dt: number): SimulationState {
    // ...
  }
}
```
### Generated Documentation Build

**`.github/workflows/docs.yml`**
```yaml
name: Generate Documentation

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  rust-docs:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: dtolnay/rust-toolchain@stable
 - run: cargo doc --no-deps --document-private-items
 - uses: actions/upload-artifact@v3
        with:
          name: rust-docs
          path: target/doc/

  typedoc:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
 - run: npm ci && npm run docs
 - uses: actions/upload-artifact@v3
        with:
          name: ts-docs
          path: docs/generated/
```
### Documentation Site

**`docs/README.md` (index)**
```markdown
# Planet Simulation Documentation

## Quick Links
- [API Reference (Rust)](./rust-api/)
- [API Reference (TypeScript)](./ts-api/)
- [Physics Guide](./physics/)
- [Usage Examples](./examples/)
- [Architecture](./architecture/)

## Quick Start
[Integrate with 3 lines of code...]

## For Contributors
[Dev setup, testing, deployment...]
```
**`docs/physics/README.md`**
```markdown
# Physics Model

## Overview
The Planet Simulation uses Newton's classical mechanics for 2-body systems.

## Key Equations

### Gravitational Force
$F = G \cdot \frac{m_1 m_2}{r^2}$

Where:
- $G = 6.674 \times 10^{-11}$ m³ kg⁻¹ s⁻²
- $m_1, m_2$ are masses in kg
- $r$ is distance in meters

### Velocity Verlet Integration
[Mathematical details and pseudocode]

## Limitations
- Only 2-body interactions (N-body extensible in future)
- Float64 precision (±1e-15 relative error typical)
- No relativity effects

## References
- [Classical Mechanics, Goldstein et al.](...)
- [Celestial Mechanics, Murray & Dermott](...)
```
-

## 🧪 Tests

- [ ] Unit: `cargo test --doc` passes (doctests)
- [ ] Build: `cargo doc` completes without warnings
- [ ] Build: `npm run docs` generates TypeScript docs
- [ ] Manual: Documentation site renders correctly, links work

-

## 🚀 Implementation Flow

1. Spec Review → Doc comments in code → Doc examples/tests → Site generation → Publish

-

## ✅ Definition of Done

- [ ] DOD-Global: All public APIs documented
- [ ] Doctests pass (`cargo test --doc`)
- [ ] Generated docs published automatically
- [ ] Search functionality works

-

## 📚 Related Specs

**Depends on**: All other specs (documents them)
**Required by**: Users, contributors, maintainers
