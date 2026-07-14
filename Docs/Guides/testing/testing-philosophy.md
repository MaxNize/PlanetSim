# Testing Philosophy

> **AI TL;DR**
> **Purpose**: Establishes the core principles and standards for testing the Planet Simulation application.
> **Key Rules**: We follow a strict testing pyramid (prioritizing unit tests) with a target of >80% coverage for critical business logic paths.
> **Relevant Files**: Configured in `vitest` (frontend) and standard cargo configuration (backend).

This guide describes the testing philosophy and strategy for the Planet Simulation project.
It outlines our approach to ensuring the reliability, correctness, and performance of our physics engine and user interface.

## Why We Test

Our simulation relies on WebAssembly-compiled Rust code for high-performance physics calculations
and a React interface for real-time visualization. Given the complexity of orbital mechanics
and the necessity of maintaining 60 FPS in the browser, testing is critical to:
1. **Verify Physics Invariants**: Ensure orbital math conforms to physical laws (e.g. conservation of energy, correct force vector calculations).
2. **Prevent Regression**: Catch performance degradation or mathematical drifts before they are merged.
3. **Validate UI State**: Ensure that the user control inputs map correctly to state variables and trigger updates to the calculations.

## The Testing Pyramid

We organize our test suite into three tiers, optimizing for execution speed and confidence:

```text
    / \      Integration Tests (WASM Bridge & Canvas rendering)
   /   \     ~10% of suite
  /     \    
 /       \   Unit Tests (Rust physics math, React components & hooks)
/_________\  ~90% of suite
```

### 1. Unit Tests (90% of Suite)
The foundation of our testing is small, fast, and isolated unit tests:
- **Rust Backend**: Test pure mathematical functions (e.g. gravitational force, vector operations) without compiling WASM bindings.
- **Frontend React**: Test UI components in isolation (e.g. `SimulationShell`) using React Testing Library and Vitest with a mock WASM service layer.
- **Frontend Hooks/Utils**: Verify custom React hooks (e.g. `useSimulationControls`) and utility calculations (e.g. `calculateOrbitalVelocity`).

### 2. Integration Tests (10% of Suite)
Integration tests verify the communication between different components:
- **WASM Bridge**: Ensure data marshalling and serialization/deserialization between JS and WASM boundary function calls operate smoothly without memory leaks.
- **Canvas System**: Verify that coordinate transformations and rendering pipelines receive correct coordinates from the physics simulation step.

## Coverage Goals

We aim for high-quality test coverage, prioritizing critical execution paths:
- **Physics Logic**: 100% test coverage for all core physics models, integrations, and mathematical utilities.
- **Frontend State & Utilities**: >80% coverage for hooks and utility functions.
- **UI Components**: Focus on happy path and user input constraints; we aim to test all interactive paths.

By maintaining these testing layers, we ensure the simulation remains physically accurate, stable, and highly performant across all platforms.
