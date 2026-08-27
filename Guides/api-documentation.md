# API Documentation & Integration Guide

## 1. Overview

The **Planet Simulation** monorepo consists of a high-performance Rust/WASM physics library (`planet-sim-wasm`) and a modern React/TypeScript frontend.
This guide provides full API references for both Rust and TypeScript interfaces.

---

## 2. Rust Physics Engine API (`planet_sim::physics`)

### 2.1 Structs & Types

#### `Body`
Represents a physical celestial body.
```rust
pub struct Body {
    pub position: (f64, f64),
    pub velocity: (f64, f64),
    pub mass: f64,
    pub radius: f64,
    pub color: Option<String>,
    pub name: Option<String>,
    pub locked: Option<bool>,
}
```

#### `State`
Encapsulates the complete system state.
```rust
pub struct State {
    pub primary: Body,
    pub secondary: Body,
    pub test_particle: Body,
    pub time: f64,
    pub gravitational_constant: f64,
    pub bodies: Option<Vec<Body>>,
}
```

#### `StepResult`
Returned by `integrate_step` after performing a simulation step.
```rust
pub struct StepResult {
    pub new_state: State,
    pub kinetic_energy: f64,
    pub potential_energy: f64,
}
```

### 2.2 Core Physics Functions

#### `integrate_step(state: &State, dt: f64) -> StepResult`
Advances simulation state by time step `dt` using symplectic Velocity-Verlet integration.

#### `force_between(m1: f64, m2: f64, distance: f64, g: f64) -> f64`
Calculates Newtonian gravitational force magnitude $F = G \frac{m_1 m_2}{r^2}$.

#### `lagrange_points(primary: &Body, secondary: &Body, g: f64) -> LagrangePointSet`
Calculates the 5 equilibrium Lagrange points ($L_1 \dots L_5$).

---

## 3. WebAssembly JavaScript Bridge (`SimulatorBridge`)

Imported from `frontend/src/services/wasmBridge.ts`.

### `class SimulatorBridge`

#### `constructor(initialState: SimulationState)`
Initializes the WASM physics simulator with a JSON serialized state configuration.

#### `step(dt: number): StepResult`
Executes one simulation step for delta time `dt` in seconds. Returns updated state and energies.

#### `getState(): SimulationState`
Retrieves a snapshot of the current state from WASM memory.

#### `getLagrangePoints(): LagrangePointSet`
Calculates and returns current Lagrange point coordinates (`l1` through `l5`).

#### `setState(state: SimulationState): void`
Overwrites the WASM simulator's internal state in real time.

---

## 4. React Context & Hooks (`SimulationContext`)

### `useSimulationContext()`
Hook providing access to global simulation state:

```typescript
const {
  currentState,
  isPaused,
  setIsPaused,
  speedMultiplier,
  setSpeedMultiplier,
  mode,
  setMode,
  sandboxBodies,
  addBody,
  removeBody,
  updateBody,
  selectedBodyId,
  setSelectedBodyId,
} = useSimulationContext();
```

---

## 5. Quickstart Integration Example

```typescript
import { SimulatorBridge, SimulationState } from './services/wasmBridge';

const initialState: SimulationState = {
  primary: { position: [0, 0], velocity: [0, 0], mass: 1.989e30, radius: 6.96e8 },
  secondary: { position: [1.496e11, 0], velocity: [0, 29780], mass: 5.972e24, radius: 6.371e6 },
  testParticle: { position: [1.50e11, 0], velocity: [0, 30000], mass: 1000, radius: 10 },
  time: 0,
  gravitationalConstant: 6.67430e-11,
};

const bridge = new SimulatorBridge(initialState);
const { newState, kineticEnergy } = bridge.step(1.0); // step 1 second
console.log(`Time: ${newState.time}s, KE: ${kineticEnergy}J`);
```
