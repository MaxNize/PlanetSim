# Developer Guide

Welcome to the Developer Guide for the Planet Simulation project! This document
outlines setup instructions, local development commands, testing guidelines,
performance budgets, and answers to frequently asked questions.

---

## 💻 Setup & Local Development

### Prerequisites

- **Node.js**: Version 20+ (managed via `.nvmrc`)
- **Rust**: Stable toolchain (managed via `.rust-toolchain.toml`)
- **wasm-pack**: Required to compile Rust to WASM (installed automatically via `make setup` / `npm run setup`)

### Quick Start

To set up the development environment, execute the following commands in the root of the project:

```bash
# 1. Install toolchains, compile WASM and install npm packages
make setup

# 2. Start the Vite development server
make dev
```

Open `http://localhost:5173` in your browser to view the application.

### IDE Setup Recommendations

- **VS Code**: Recommended editor.
- **Rust Analyzer**: Standard extension for Rust language features.
- **ESLint & Prettier**: Auto-format and lint code on save.
- **Vitest**: Integration for running Vitest suite in VS Code.

---

## 🧪 Testing & Code Quality

Our testing framework covers both the frontend TypeScript layer and the backend Rust layer.

### Running Local Tests

Before committing, verify that your changes pass all local verification checks:

```bash
# Run all unit tests, linters, and style checks
make test

# Run linters only
make lint
```

### TypeScript / Frontend Tests

- **Framework**: Vitest + React Testing Library.
- **Commands**:
  - Run tests: `npm --prefix frontend run test`
  - Test coverage: `npm --prefix frontend run test:coverage`
- **Writing Component Tests**: Mock any WASM service layer interactions if you are testing pure UI layout. Use rendering utilities to query elements.

### Rust / WASM Tests

- **Framework**: Cargo test framework.
- **Commands**:
  - Run tests: `cd wasm && cargo test`
  - Run doctests: `cd wasm && cargo test --doc`
- **Writing Physics Tests**: Co-locate unit tests within the same module inside `#[cfg(test)]` blocks. Physics integrations should verify conservation laws (e.g. energy variance over 1,000 steps ≤ 0.1%).

---

## ⚡ Performance budgets & Profiling

### Budgets

To keep the simulation running smoothly at 60 FPS in the browser, adhere to the following performance budgets:

- **Physics Step**: < 1.0 millisecond.
- **Frame Render**: < 16.67 milliseconds (to avoid dropping frames).
- **WASM boundary overhead**: < 5% of step execution time.
- **Bundle size target**: < 500 KB total size (WASM binary + JS bundle).

### Profiling Tools

- **Rust CPU Profiles**: Use `cargo flamegraph` to profile the hot loop in Rust.
- **JavaScript/UI Profiles**: Use the Chrome DevTools **Performance** panel to record simulation runs and analyze call stacks.

---

## 🚀 Release & Versioning

The project uses semantic versioning (`MAJOR.MINOR.PATCH`) automated by Conventional Commit messages:

- Commits starting with `fix(...)` trigger a **patch** version bump.
- Commits starting with `feat(...)` trigger a **minor** version bump.
- Commits with `BREAKING CHANGE:` in the footer trigger a **major** version bump.

---

## 🌐 Internationalization (i18n)

The application supports tri-lingual internationalization (**English (EN)**, **German (DE)**, and **Italian (IT)**):

- **Dictionaries**: Translation mappings are stored in [translations.ts](file:///home/max/root/Code-Root/fortgeschrittene-programmierung/frontend/src/i18n/translations.ts).
- **Context & Hook**: Use the `useI18n()` hook (`const { t } = useI18n()`) to access translation strings dynamically.
- **Adding New Keys**: When adding new UI components or text labels, add matching keys for `'en'`, `'de'`, and `'it'` in `translations.ts`.

---

## ❓ Frequently Asked Questions (FAQ)

### Q: How do I deploy the application to production?

A: See the [Deployment Guide](./deployment-guide.md) for full instructions on setting up a self-hosted runner, containerizing with Docker, and routing through Nginx Proxy Manager.

### Q: How do I build the optimized WASM package?

A: Run `npm run build` or `make build`. This compiles the WebAssembly target in release mode, applying optimizations like dead-code elimination and size shrinking.

### Q: How do I debug WASM code in the browser?

A: Open Chrome DevTools ➔ Settings ➔ Experiments ➔ Check "WebAssembly debugging: Enable DWARF support". This allows you to set breakpoints directly inside the Rust source files in the dev panel!

### Q: The build fails with `Cannot find module 'planet-sim-wasm'`?

A: You must run `wasm-pack build` inside the `wasm/` directory before installing node dependencies. Running `make setup` in the root directory takes care of this step automatically.

### Q: How do I add a new preset planet system configuration?

A:

1. Define the preset state in [SimulationContext.tsx](file:///home/max/root/Code-Root/fortgeschrittene-programmierung/frontend/src/context/SimulationContext.tsx) (e.g., `EARTH_MOON_PRESET` or `BINARY_STARS_PRESET`).
2. Add the preset key to the `PresetType` type in [SimulationContext.tsx](file:///home/max/root/Code-Root/fortgeschrittene-programmierung/frontend/src/context/SimulationContext.tsx).
3. Update the matching presets mapping inside the `SimulationProvider`'s `useEffect` for preset updates.
4. Add a selection button in [ParameterControls.tsx](file:///home/max/root/Code-Root/fortgeschrittene-programmierung/frontend/src/components/ParameterControls/ParameterControls.tsx).
   Ensure that the initial body coordinates and masses are mathematically stable to avoid immediate ejection.
