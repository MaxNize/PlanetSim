# Project Architecture

This document provides a high-level overview of the planet simulation project's architecture, directory layout, and data flow.

---

## High-Level Overview

The application is structured as a hybrid TypeScript/Rust project:

```text
┌─────────────────────────────────────────┐
│          React UI (TypeScript)          │
│  Components, Hooks, Canvas Rendering    │
└──────────────┬──────────────────────────┘
               │ WASM Bindgen Bridge (SimulatorBridge)
               ▼
┌─────────────────────────────────────────┐
│       Physics Engine (Rust/WASM)        │
│  2-Body Orbital Mechanics, Integration  │
└─────────────────────────────────────────┘
```

* **Frontend (TypeScript/React)**: Manages state, handles user interactions, runs the animation loop, and renders the canvas.
* **Backend (Rust/WASM)**: A high-performance, stateless physics engine compiled to WebAssembly for numerical stability and speed.

---

## Directory Layout & Module Structure

### Frontend (`frontend/src/`)
* **`components/`**: React components representing visual parts of the application (e.g., `SimulationShell.tsx`).
* **`hooks/`**: Custom React hooks managing states and controls (e.g., `useSimulationControls.ts`).
* **`services/`**: Class wrappers and rendering logic.
  * [`wasmBridge.ts`](../../frontend/src/services/wasmBridge.ts) — The wrapper for the WASM `Simulator` instance.
  * [`wasm.ts`](../../frontend/src/services/wasm.ts) — The asynchronous loader for the WASM module.
* **`types/`**: Domain-specific TypeScript declarations.
* **`utils/`**: Helper utilities (e.g., `calculateOrbitalVelocity.ts`).

### Physics Engine (`wasm/src/`)
* **[`lib.rs`](../../wasm/src/lib.rs)**: Re-exports public items for WASM bindings.
* **`physics/`**: Core orbital mechanics code.
  * [`types.rs`](../../wasm/src/physics/types.rs) — Core structs (`Body`, `State`, `PhysicsConfig`).
  * [`gravity.rs`](../../wasm/src/physics/gravity.rs) — Newton's law of gravitation and Lagrange point calculators.
  * [`integrator.rs`](../../wasm/src/physics/integrator.rs) — Symplectic Velocity Verlet integrator.
* **`wasm/`**: WASM-bindgen interface wrapper.
  * [`mod.rs`](../../wasm/src/wasm/mod.rs) — Implements `Simulator` wrapper class exposing methods to JavaScript.

---

## Data Flow

The simulation loop progresses in a unidirectional data flow:

```text
User Input (UI) → React State → SimulatorBridge.step(dt)
                                      │
                                      ▼
Serialized State ← Canvas Renderer ← WASM Simulator.step(dt)
```

1. **User Action**: The user starts the simulation or interacts with controls.
2. **Animation Frame**: An animation loop triggers every frame (targeting 60 FPS) and calls the `step(dt)` method on the active `SimulatorBridge` instance.
3. **Rust integration**: The bridge passes the step duration `dt` (in seconds) to the Rust `Simulator`.
4. **Physics integration**: The Rust `Simulator` uses the Velocity Verlet integrator to update the positions, velocities, and time.
5. **State Return**: The new state is serialized back to JavaScript as a `StepResult` (including updated coordinates and system energy).
6. **Canvas Redraw**: The canvas renderer reads the coordinates and draws the primary, secondary, and test particles onto the canvas.

---

## Dependency Graph

```text
SPEC-001 (Foundation)
  ├→ SPEC-002 (Testing)
  ├→ SPEC-003 (Physics)
  │   └→ SPEC-004 (WASM)
  │       ├→ SPEC-005 (React Architecture)
  │       │   └→ SPEC-006 (Canvas Rendering)
  │       │       ├→ SPEC-007 (Parameters)
  │       │       └→ SPEC-008 (Trajectory)
  │       │           ├→ SPEC-009 (Sandbox)
  │       │           └→ SPEC-010 (Manipulation)
  ├→ SPEC-011 (CI/CD)
  └→ SPEC-012 (Deployment)
  └→ SPEC-013 (API Documentation)
  └→ SPEC-014 (Developer Guide)
```

---

## Adding a New Feature

When contributing a new feature, follow this spec-driven workflow:

1. **Write Spec**: Define acceptance criteria and a technical solution in a new spec file under `Docs/Management/Project-Management/Specs/SPEC-XXX-feature-name.md`.
2. **Scaffold Branch**: Create a new git branch: `git checkout -b feature/your-feature-name`.
3. **Tests First (RED)**: Write unit/integration tests that fail.
4. **Implement (GREEN)**: Write the minimal implementation to make tests pass.
5. **Refactor**: Improve code quality while keeping tests green. Ensure no files exceed the 200-line limit.
6. **CI Checks**: Run `npm run test` locally to verify structure, formatting, linting, and tests.
7. **Commit & PR**: Commit using Conventional Commits and open a Pull Request linking to your spec.
