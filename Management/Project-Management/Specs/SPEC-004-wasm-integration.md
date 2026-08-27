# SPEC-004: WASM Integration & JS Bridge

-

## 📝 User Story
```text
As a frontend developer
I want seamless communication between Rust physics and JavaScript UI
so that I can build reactive components without worrying about FFI complexity
```
-

## ✅ Acceptance Criteria

### WASM Module Compilation
- [x] AC 1.1: `npm run build:wasm` compiles Rust to .wasm + .js bindings
- [x] AC 1.2: WASM module bundles into frontend build automatically
- [x] AC 1.3: No runtime errors loading WASM in browser dev console

### Data Marshalling
- [x] AC 2.1: Rust `State` serializes to JavaScript object with no precision loss
- [x] AC 2.2: JavaScript `SimulationConfig` deserializes correctly in Rust
- [x] AC 2.3: Float arrays (trajectories) marshalled efficiently via shared memory or typed arrays

### Simulator Instance
- [x] AC 3.1: `new Simulator(config)` constructs instance in WASM
- [x] AC 3.2: `step(dt)` advances simulation and returns new state
- [x] AC 3.3: `getState()` returns current bodies without performing step
- [x] AC 3.4: Multiple instances can coexist without interference

### Error Handling
- [x] AC 4.1: Invalid parameters (e.g., negative mass) raise clear JS errors
- [x] AC 4.2: WASM panics are caught and logged (no silent crashes)
- [x] AC 4.3: Error messages mention relevant SPEC or physics law

### Performance
- [x] AC 5.1: Overhead of JS ↔ Rust crossing < 5% of step time
- [x] AC 5.2: No garbage collection pauses during hot simulation
- [x] AC 5.3: Memory usage stable (no leaks after 10k steps)

### Integration Tests
- [x] AC 6.1: Simulator initialized with realistic parameters (Earth mass, Sun mass)
- [x] AC 6.2: 10 steps produce consistent state progression
- [x] AC 6.3: Trajectory history maintained correctly

-

## 🔧 Technical Solution

### Rust WASM Bindings

**`src/lib.rs`**
```rust
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use crate::physics::*;

#[wasm_bindgen]
pub struct Simulator {
    state: State,
}

#[wasm_bindgen]
impl Simulator {
    #[wasm_bindgen(constructor)]
    pub fn new(config_json: &str) -> Result<Simulator, JsValue> {
        let config: PhysicsConfig = serde_json::from_str(config_json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(Simulator { state: State::new(config) })
    }

    pub fn step(&mut self, dt: f64) -> Result<JsValue, JsValue> {
        let result = self.state.integrate_step(dt)?;
        Ok(serde_wasm_bindgen::to_value(&result)?)
    }

    pub fn get_state(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.state)?)
    }
}
```
### JavaScript Service Layer

**`src/services/wasmBridge.ts`**
```typescript
export class SimulatorBridge {
  private simulator: any;  // WASM Simulator instance

  constructor(config: PhysicsConfig) {
    this.simulator = new Simulator(JSON.stringify(config));
  }

  step(dt: number): SimulationState {
    return this.simulator.step(dt);
  }

  getState(): SimulationState {
    return this.simulator.get_state();
  }
}

export interface SimulationState {
  body1: Body;
  body2: Body;
  time: number;
  energy: { kinetic: number; potential: number };
}
```
### Cargo.toml Dependencies
```toml
[dependencies]
wasm-bindgen = "0.2"
wasm-bindgen-futures = "0.4"
web-sys = { version = "0.3", features = ["console"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde-wasm-bindgen = "0.4"
```
### Build Configuration

**`Cargo.toml` (lib section)**
```toml
[lib]
crate-type = ["cdylib"]
```
**`vite.config.ts`** (WASM plugin)
```typescript
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
  // ...
});
```
-

## 🧪 Tests

- [x] Unit: Serialization roundtrip (JS object → Rust → JS object)
- [x] Integration: Create Simulator, step 10 times, verify state consistency
- [ ] Manual: Open DevTools, inspect WASM module memory
- [x] Performance: Measure JS ↔ Rust crossing time

-

## 🚀 Implementation Flow

1. Spec Review → WASM binding scaffolding (RED) → Data marshalling (GREEN) → Integration tests → Performance profiling

-

## ✅ Definition of Done

- [x] DOD-Global: All criteria met
- [x] DOD-WASM: WASM builds without warnings
- [x] DOD-Perf: Crossing overhead < 5% of step time
- [x] Integration test passes in CI

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-002, SPEC-003
**Required by**: SPEC-005, SPEC-006
