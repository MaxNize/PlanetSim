# GitHub Copilot Instructions - Planet Simulation

> This file contains project-level context for the Planet Simulation learning project.

## Project context

Planet Simulation is an interactive web-based physics sandbox for learning gravitational mechanics:

- **Real-time 2-body orbital mechanics** simulation with accurate gravitational calculations
- **Interactive parameter control** – adjust mass, time scale, initial positions live
- **High-performance visualization** – 60 FPS guaranteed via Rust/WASM + Canvas
- **Educational focus** – demonstrate systems programming, web technologies, and physics

## Architecture

**Tech Stack:**

- **Rust + WebAssembly** for physics engine (high-performance gravitational calculations)
- **React + TypeScript** for interactive UI (Canvas rendering, parameter controls)
- **Vite** for fast frontend development builds
- **wasm-bindgen** for seamless Rust ↔ JavaScript communication

**Code Organization:**

- Physics logic isolated in Rust/WASM for performance and maintainability
- React/TypeScript handles all user interaction and visualization
- Clear boundary between simulation state (Rust) and rendering (JavaScript)

## Quality principles

- **Physics accuracy first**: Verify gravitational calculations against known orbital mechanics references
- **Performance is a feature**: Maintain 60 FPS target; use Rust for computational bottlenecks
- **Clean interfaces**: WASM functions have clear input/output contracts; React props are well-typed
- **Test behavior**: Unit tests for physics calculations and integration tests for UI interactions
- **Document learning value**: Code explains _why_ decisions were made, not just _what_ they do
- **Colocation principle**: Keep physics logic, rendering, and UI interaction together when semantically related

## Commit & PR standards

Follow the [Contributing Guide](../Docs/Management/Project-Management/Guides/contributing-guide.md) for:

- Conventional Commits with scope (e.g., `feat(wasm)`, `fix(ui)`)
- Branch naming: `feature/`, `fix/`, `docs/`, `refactor/`, `chore/`
- All exports require documentation (Rust docs + JSDoc)
- CI must pass before merge

## Useful scopes for this project

- `wasm` – Physics engine and WASM integration
- `ui` – React components and user interactions
- `physics` – Physics calculations and accuracy
- `perf` – Performance optimizations
- `build` – Build tooling and CI/CD
