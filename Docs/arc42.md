# arc42 Architecture Documentation — Planet Simulation

> This document follows the [arc42](https://arc42.de/) template (12 chapters) and describes the architecture of
> the "Planet Simulation" project (exam project for the Advanced Programming module). It consolidates the
> existing documentation spread across `Docs/` (ADRs, SPECs, guides, definitions of done) and links to the
> detailed documents where appropriate instead of duplicating them.
>
> **Team**: Gemmingen, Müller, Tsigaropoulos · **Jira project**: FP · **As of**: 2026-08-14

---

## 1. Introduction and Goals

### 1.1 Requirements Overview

Planet Simulation is a browser-based, interactive 2D simulation of gravitational mechanics (two-body and
restricted three-body problems). It targets students and physics-interested hobbyists who want to explore
planetary orbits and gravitational forces in real time, without sluggish JavaScript-based simulations getting
in the way of interaction.

From the project README (`README.md`):

> Existing JavaScript-based physics simulations are slow and difficult to extend. Students and hobbyist
> astronomers need a fluid, responsive tool to explore gravitational interactions in real-time.

The solution: a browser sandbox where users interactively change masses and initial conditions, visualize
gravitational forces and orbits, and experience a consistent 60 FPS — achieved by offloading physics
computation to Rust/WebAssembly.

### 1.2 Quality Goals

Prioritized quality goals (from the README, `testing-philosophy.md`, and SPEC-001):

| Priority | Quality Goal | Details |
|---|---|---|
| 1 | **Performance** | Consistent ~60 FPS in the browser, no GC stutter during simulation |
| 2 | **Physics Correctness** | Numerically stable integration (energy conservation, see `physics-guide.md`) |
| 3 | **Maintainability** | Hard 200-line limit per file, clear module boundaries, high test coverage |
| 4 | **Traceability** | Spec-driven workflow (SPEC → test → implementation → review) |
| 5 | **Learnability** | Understandable UI for students (presets, parameter controls, i18n) |

### 1.3 Stakeholders

| Role | Expectations |
|---|---|
| Students / end users | Intuitive, performant simulation for experimenting with orbits |
| Team (Gemmingen, Müller, Tsigaropoulos) | Maintainable, spec-driven codebase for the exam deliverable |
| Instructors / graders | Traceable architecture and decision documentation (ADRs, arc42, SPECs) |

---

## 2. Architecture Constraints

### 2.1 Technical Constraints

- **Monorepo**: `frontend/` (TypeScript/React) + `wasm/` (Rust) + `Docs/` (see SPEC-001).
- **Target platform**: modern browser with WebAssembly support, no server-side physics.
- **Node version**: pinned via `.nvmrc` (Node 25); **Rust**: `stable` toolchain via `.rust-toolchain.toml`.
- **Hard 200-line limit** per source file (TS/Rust/docs), enforced via ESLint `max-lines` /
  Clippy `too-many-lines-threshold`, exceptions only via `max-lines-exceptions.json`.
- **64-bit floating-point numbers** for physical precision (see `physics-guide.md`).

### 2.2 Organizational Constraints

- Exam project with a fixed team (3 people), spec-driven approach (SPEC-XXX files in
  `Docs/Management/Project-Management/Specs/`).
- Commit conventions: Conventional Commits with scopes (`wasm`, `ui`, `physics`, `perf`, `build`, `docs`);
  branch prefixes `feature/`, `fix/`, `docs/`, `refactor/`, `chore/` (see SPEC-001, ADR-003).
- CI/CD via GitHub Actions.

### 2.3 Conventions

- **Project language for code/docs**: English (ADR-001).
- Documentation conventions: see `Docs/Guides/documentation-conventions.md`.
- Architecture decisions are recorded as ADRs under `Docs/ADRs/` (context → options → decision).

---

## 3. System Scope and Context

### 3.1 Business Context

```text
┌───────────────────┐        Mouse clicks, sliders,     ┌───────────────────────────┐
│  User               │────────presets, sandbox edits───▶│   Planet Simulation (App)  │
│ (Browser)           │◀───────Canvas rendering, state───│                            │
└───────────────────┘                                    └───────────────────────────┘
```

The application has **no external systems** in the sense of third-party APIs or databases — it is a fully
client-side single-page application. The only "external" runtime dependency is the browser itself
(WebAssembly runtime, Canvas API).

### 3.2 Technical Context

```text
┌──────────────────────────────────────────┐
│           Browser (Client)                │
│  ┌─────────────────────────────────────┐  │
│  │   React UI (TypeScript)              │  │
│  │   Components, Hooks, Canvas          │  │
│  └───────────────┬───────────────────────┘  │
│                  │ WASM-Bindgen Bridge      │
│                  │ (SimulatorBridge)        │
│  ┌───────────────▼───────────────────────┐  │
│  │   Physics Engine (Rust → WASM)       │  │
│  │   Newtonian gravity, Verlet          │  │
│  │   integrator                          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

The application is shipped as a static bundle (Vite build) inside a Docker container (see chapter 7).

---

## 4. Solution Strategy

Core decisions that shape the architecture (see `Docs/ADRs/` for details):

1. **Hybrid Rust/WASM + React**: Physics-intensive computation is implemented statelessly in Rust and compiled
   to WebAssembly (performance quality goal), while UI state and rendering stay in React/TypeScript
   (productivity, ecosystem). Rationale: see `Docs/Guides/architecture.md`.
2. **Unidirectional data flow**: `User input → React state → SimulatorBridge.step(dt) → WASM → StepResult →
   Canvas`. No bidirectional state between JS and WASM — the WASM side is stateless with respect to UI
   concerns per call; the full simulation state is explicitly exchanged via `setState`/`step`.
3. **Spec-driven development process**: Every feature starts with a SPEC (acceptance criteria), followed by
   TDD (red → green → refactor), see `architecture.md`, section "Adding a New Feature".
4. **Colocated components** (ADR-003): Every component is a folder with implementation and tests side by
   side, instead of separate `components/` and `tests/` trees.
5. **Two simulation modes** (`3body`/preset vs. `sandbox`): Preset mode uses fixed physical roles (`primary`,
   `secondary`, `testParticle`); sandbox mode manages a flexible list of editable bodies (`sandboxBodies`).
   This deliberate separation is the source of several UI constraints (e.g. FP-39: editing only makes sense
   in sandbox mode, since only there does an editable data model exist).
6. **Hard quality gates in CI**: 200-line limit, strict ESLint/Clippy, `fallow` (unused code/complexity),
   coverage targets — maintainability is enforced technically rather than only organizationally (SPEC-001).

---

## 5. Building Block View

### 5.1 Whitebox Overall System

```text
Planet Simulation (Monorepo)
├── frontend/   — Vite + React + TypeScript SPA
├── wasm/       — Rust physics engine, compiled to WebAssembly
└── Docs/       — Architecture/process documentation, specs, ADRs
```

### 5.2 Level 1 — Frontend (`frontend/src/`)

| Building Block | Responsibility |
|---|---|
| `components/` | Visual React components (e.g. `Canvas`, `SimulationShell`, `BodyEditDialog`, `BodyPlacementDialog`, `BodyContextMenu`, `ParameterControls`) |
| `context/` | Global simulation state: `SimulationProvider`, `useSandbox` (sandbox body management), `useTrailHistory`, `presets.ts` (Earth-Moon/binary stars), `I18nContext` |
| `hooks/` | Reusable logic: `useSimulation`, `useSimulationStep`, `useSimulationControls`, `useCanvasInteraction` (mouse/context-menu interaction), `useAnimationFrame` |
| `services/` | `wasmBridge.ts` (wrapper around the WASM `Simulator` instance), `wasm.ts` (async loader), `CanvasRenderer.ts` (2D rendering pipeline), `canvasHelpers.ts` |
| `types/` | Domain types (`SimulationMode`, `SandboxBody`, physics types) |
| `utils/` | Pure helper functions (e.g. `calculateOrbitalVelocity`) |
| `i18n/` | Translation tables (de/en) |

Central state management runs through `SimulationProvider` (`context/SimulationProvider.tsx`), which provides
all components with `currentState`, `mode`, `sandboxBodies`, and actions (`updateBody`, `addBody`, `removeBody`,
`setMode`, `setPreset`, …) via React Context (`SimulationContext`).

### 5.3 Level 1 — Physics Engine (`wasm/src/`)

| Building Block | Responsibility |
|---|---|
| `lib.rs` | Re-exports of the public WASM bindings |
| `physics/types.rs` | Core structures: `Body`, `State`, `PhysicsConfig` |
| `physics/gravity.rs` | Newton's law of gravitation, Lagrange point calculation |
| `physics/integrator.rs` | Symplectic velocity-Verlet integrator |
| `wasm/mod.rs` | `Simulator` wrapper class, exposes methods (`step`, `setState`, `getLagrangePoints`) to JavaScript |

### 5.4 Dependency Graph (Feature Level)

The full feature dependency graph (SPEC-001…SPEC-017) is documented in
`Docs/Guides/architecture.md#dependency-graph` and not duplicated here.

---

## 6. Runtime View

### 6.1 Simulation Step (Default Case)

```text
1. User starts/pauses the simulation or changes parameters (UI)
2. Animation loop (target: 60 FPS) calls SimulatorBridge.step(dt)
3. Bridge passes dt (seconds) to the Rust simulator
4. Rust: velocity-Verlet integrator updates positions/velocities/time
5. New state is serialized to JS as StepResult (including system energy)
6. SimulationProvider.handleStep enriches bodies (enrichBodies: id/name/color/locked
   from sandboxBodies, or synthetic ids in preset mode) and sets currentState
7. CanvasRenderer redraws primary/secondary/testParticle or sandboxBodies
```

### 6.2 Editing an Object (Sandbox Mode)

```text
1. Right-click on a body → useCanvasInteraction.handleContextMenu (only when mode === 'sandbox', see FP-39)
2. BodyContextMenu → "Edit" → BodyEditDialog opens with the current SandboxBody
3. Confirm → Canvas.onEditConfirm → updateBody(id, updates)
4. useSandbox.updateBody maps sandboxBodies, merging updates for the matching id
5. commitSandboxBodies writes state into React (setSandboxBodies/setCurrentState)
   and synchronously into the running simulator (simulator.setState)
```

### 6.3 Mode Switch (Preset ↔ Sandbox)

```text
1. setMode('sandbox') → useSandbox.setMode populates sandboxBodies from the current
   currentState (primary/secondary/testParticle → three SandboxBody entries)
2. setMode('3body') → sandboxBodies is kept/cleared; physics continues to run on the
   fixed primary/secondary/testParticle fields
```

---

## 7. Deployment View

- Containerized via Docker Compose, Alpine Nginx image.
- CI/CD via GitHub Actions. Workflows: `test.yml`, `deploy-docs.yml`, `docs.yml`, `release.yml`,
  `security.yml` (`.github/workflows/`).

---

## 8. Crosscutting Concepts

### 8.1 Physics Model

Classical Newtonian mechanics (two-body and restricted three-body problem), 64-bit precision, symplectic
velocity-Verlet integrator for energy conservation. Full derivation, formulas, and units:
`Docs/Guides/physics-guide.md`.

### 8.2 Internationalization (i18n)

UI text is available in German and English via `I18nContext`/`frontend/src/i18n/translations.ts`
(`LanguageSelector` component).

### 8.3 Test Strategy

Test pyramid with a focus on unit tests (~90%) and integration tests (~10%) for the WASM bridge and canvas
rendering. Coverage target: 100% for core physics logic, >80% for frontend hooks/utils. Details:
`Docs/Guides/testing/testing-philosophy.md`, `testing-best-practices.md`, `unit-testing.md`.
E2E coverage (Playwright) was implemented as part of FP-42 (see test reports under
`Docs/Guides/testing/reports/`).

### 8.4 Code Quality & Maintainability

- Hard 200-line limit per file (ESLint `max-lines` / Clippy threshold), exceptions only via
  `max-lines-exceptions.json`.
- `fallow` (frontend) and `cargo-udeps`/`cargo-modules orphans` (Rust) as checks against dead code,
  unnecessary complexity, and duplication (`npm run check:quality`).
- ESLint/Prettier/Stylelint/Clippy/`cargo fmt` as mandatory formatting/lint gates.
- Full rule set: SPEC-001.

### 8.5 Error Handling

WASM calls (`simulator.setState`, `getLagrangePoints`) are defensively wrapped in `try/catch` and log instead
of throwing, so the UI doesn't crash on transient errors (see `SimulationProvider.tsx`).

---

## 9. Architecture Decisions

Decisions are recorded as ADRs (context → options → decision) under `Docs/ADRs/`:

| ADR | Decision |
|---|---|
| [ADR-001](./ADRs/ADR-001-project-language.md) | Project language: English (code & standard documentation) |
| [ADR-003](./ADRs/ADR-003-colocated-files.md) | Colocated components (implementation + tests in the same folder) |

Feature/architecture specifications with detailed implementation decisions and acceptance criteria:
`Docs/Management/Project-Management/Specs/SPEC-001` through `SPEC-017` (see dependency graph in chapter 5.4).

---

## 10. Quality Requirements

### 10.1 Quality Tree (Excerpt)

```text
Quality
├── Performance
│   └── 60 FPS rendering, no GC jank during simulation
├── Correctness
│   ├── Physical invariants (energy conservation < 0.1% deviation on circular orbits)
│   └── Deterministic behavior per mode (preset vs. sandbox)
├── Maintainability
│   ├── 200-line limit per file
│   └── Clear module boundaries frontend/WASM
└── Usability
    ├── Understandable units (→ FP-34)
    └── Consistent styling (→ FP-44)
```

### 10.2 Quality Scenarios

| Scenario | Expected Behavior |
|---|---|
| User changes the mass slider during a running simulation | Physics reacts without a restart, trail is preserved (see `SimulationProvider` comment on trail reset) |
| User edits a sandbox body | Change is persisted immediately and picked up in the next simulation step (regression protection: `Canvas.test.tsx`, FP-39) |
| User edits a body in preset mode | Context menu is disabled, since preset roles have no editable data model (FP-39) |
| Reference circular orbit simulated over N steps | Energy deviation < 0.1% (physics reference test, DOD-Physics-WASM) |

Full criteria per feature: `Docs/Management/Project-Management/Definitions of Done/`.

---

## 11. Risks and Technical Debt

| Risk / Debt | Description | Reference |
|---|---|---|
| Implicit mode coupling | The UI was not guarded against `mode`, even though `sandboxBodies` only exists in sandbox mode (root cause of FP-39). Similar issues may persist elsewhere. | FP-39 |
| Unit readability | Raw physical values (e.g. `6.371e6` m) are sometimes displayed unformatted in the UI, limiting interpretability for students. | FP-34 |
| Inconsistent styling | No centrally enforced styling system; inline styles (e.g. `BodyContextMenu.tsx`) and component styles are not consistently consolidated. | FP-44 |
| Sandbox object creation (placement flow) | The current object-creation flow in sandbox mode is considered in need of rework (UX). | FP-38 |
| Missing object tracking/miniview | There is currently no way to specifically track individual objects or view them in a focused mini view. | FP-36, FP-37 |
| Missing favicon | No branding favicon exists. | FP-33 |

This chapter is updated as the referenced tickets are addressed.

---

## 12. Glossary

| Term | Meaning |
|---|---|
| **Preset mode** (`mode: '3body'`) | Mode with fixed physical roles `primary`, `secondary`, `testParticle`, initialized via presets (`earth-moon`, `binary-stars`) |
| **Sandbox mode** (`mode: 'sandbox'`) | Mode with a flexible, user-defined list of bodies (`sandboxBodies`) that can be added, edited, deleted, and locked |
| **SandboxBody** | Data type for an editable body in sandbox mode (`id`, `position`, `velocity`, `mass`, `radius`, `color`, `name`, `locked`) |
| **SimulatorBridge** | TypeScript wrapper around the WASM `Simulator` instance; encapsulates `step`, `setState`, `getLagrangePoints` |
| **StepResult** | Serialized state returned by the physics engine after each `step(dt)` call (positions, velocities, energy) |
| **Velocity-Verlet integrator** | Symplectic numerical integration method for solving equations of motion with good long-term energy conservation |
| **Lagrange points** | Equilibrium points in the restricted three-body problem, computed in `physics/gravity.rs` |
| **Trail** | Visualized orbital path of a body over the last N simulation steps (`useTrailHistory`) |
| **SPEC** | Feature specification with user story and acceptance criteria under `Docs/Management/Project-Management/Specs/` |
| **ADR** | Architecture Decision Record — documented architecture decision under `Docs/ADRs/` |
| **DoD** | Definition of Done — binding completion criteria per area (`Docs/Management/Project-Management/Definitions of Done/`) |
