# SPEC-001: Project Setup & Guardrails

---

## 📝 User Story
```
As a developer
I want a well-structured project foundation with clear conventions
so that the team can work efficiently and maintain code quality from day one
```

---

## ✅ Acceptance Criteria

### Workspace Setup
- [ ] AC 1.1: Project structure follows monorepo pattern (frontend, backend/rust, docs)
- [ ] AC 1.2: All configuration files exist (.gitignore, .editorconfig, package.json, Cargo.toml)
- [ ] AC 1.3: Root README explains project vision, tech stack, and quick start

### Development Environment
- [ ] AC 2.1: .env.example files exist for all services (no secrets committed)
- [ ] AC 2.2: Makefile or similar automation exists for common tasks (setup, test, build)
- [ ] AC 2.3: Node.js and Rust version pinned (via .nvmrc, .rust-toolchain.toml)

### Code Organization
- [ ] AC 3.1: Clear module boundaries between Rust and JavaScript
- [ ] AC 3.2: Frontend structure: src/components, src/hooks, src/services, src/utils (tests colocated)
- [ ] AC 3.3: Rust structure: src/physics, src/wasm (with colocated unit tests and #[cfg(test)] modules)
- [ ] AC 3.4: Hard 200-line maximum per file (TS/Rust/Docs) enforced via linting; exceptions documented

### Naming Conventions
- [ ] AC 4.1: File naming: PascalCase for React components, snake_case for Rust modules, kebab-case for CSS classes
- [ ] AC 4.2: Variable naming: camelCase (JS/TS), snake_case (Rust) per Google Style Guides
- [ ] AC 4.3: Function naming: descriptive verbs (e.g., calculateOrbitalVelocity, handleParameterChange)

### Commit & VCS Conventions
- [ ] AC 5.1: Commit messages follow Conventional Commits with scopes (wasm, ui, physics, perf, build, docs)
- [ ] AC 5.2: Branch naming convention: feature/, fix/, docs/, refactor/, chore/ prefix
- [ ] AC 5.3: PR templates require description of what changed and why

### Documentation Conventions (Google Style Guides)
- [ ] AC 6.1: All public exports require JSDoc (TypeScript) or rustdoc (Rust)
- [ ] AC 6.2: JSDoc format includes @param (with type), @returns, @example, @throws (Google TypeScript Style Guide)
- [ ] AC 6.3: rustdoc includes description, examples, panics, and physics units where applicable
- [ ] AC 6.4: Physics functions document algorithm reference, input units, and output units
- [ ] AC 6.5: CI enforces documentation: ESLint rule for missing JSDoc, cargo doc warnings as errors
- [ ] AC 6.6: Code examples in docs are validated and runnable (doctests for Rust)

### Code Quality & Guardrails
- [ ] AC 7.1: ESLint configured with TypeScript support, strict rules enabled, eslint-plugin-jsdoc enforces doc requirements
- [ ] AC 7.2: Prettier configured for consistent code formatting (100 char line length)
- [ ] AC 7.3: .gitignore excludes node_modules, target, build artifacts, and secrets
- [ ] AC 7.4: EditorConfig enforces consistent line endings (LF), indentation (2 spaces JS, 4 Rust)
- [ ] AC 7.5: Stylelint configured for CSS/module.css files
- [ ] AC 7.6: Rust clippy linter enabled with strict warnings
- [ ] AC 7.7: ESLint rule `max-lines` enforces 200-line maximum on .ts/.tsx files (with exceptions)
- [ ] AC 7.8: Cargo clippy enforces 200-line maximum on .rs files (with exceptions in clippy.toml)

---

## 🔧 Technical Solution

### Frontend (React/TypeScript)
- **Project Generator**: Vite + React template
- **Configuration Files**: 
  - tsconfig.json (strict mode, noImplicitAny: true)
  - vite.config.ts
  - eslint.config.js (with typescript-eslint, eslint-plugin-jsdoc, max-lines: 200)
  - .prettierrc (printWidth: 100, semi: true)
  - .editorconfig
  - .eslintignore (explicit exceptions: types/, __generated__)
  - stylelint.config.js (for CSS modules)
- **Directory Structure**:
  ```
  src/
    components/    # React components (PascalCase, each in its own folder)
    hooks/         # Custom React hooks (useHookName pattern)
    services/      # API & WASM integration
    utils/         # Helpers & constants (strict naming: calculateX, formatX, etc.)
    types/         # TypeScript interfaces & types
    index.tsx      # Entry point
  public/          # Static assets
  ```
- **JSDoc Example** (Google TypeScript Style Guide):
  ```typescript
  /**
   * Calculates orbital velocity given two celestial bodies.
   * 
   * @param massM1 Mass of primary body (kg)
   * @param distanceR Distance between bodies (m)
   * @returns Orbital velocity in m/s
   * @throws {Error} If distance is negative or zero
   * @example
   * const velocity = calculateOrbitalVelocity(1e24, 1e8);
   * // Returns: 8171.8
   */
  export function calculateOrbitalVelocity(massM1: number, distanceR: number): number { }
  ```

### Backend (Rust)
- **Project Generator**: `cargo new --lib planet-sim-wasm`
- **Configuration Files**:
  - Cargo.toml (with wasm-bindgen, web-sys, nalgebra dependencies)
  - .rust-toolchain.toml (MSRV pinning)
  - build script for WASM compilation
  - clippy.toml (with strict lint settings, deny warnings, max-lines: 200)
- **Directory Structure**:
  ```
  src/
    lib.rs         # Entry point with public WASM exports, all with rustdoc
    physics/
      mod.rs       # Physics engine with inline tests and rustdoc
      calculations.rs
      gravity.rs
    wasm/
      mod.rs       # WASM binding layer with rustdoc for all exports
  ```
- **rustdoc Example**:
  ```rust
  /// Calculates gravitational force between two bodies using Newton's law of universal gravitation.
  ///
  /// Formula: F = G * (m₁ * m₂) / r²
  ///
  /// # Arguments
  /// * `mass1_kg` - Mass of first body in kilograms
  /// * `mass2_kg` - Mass of second body in kilograms
  /// * `distance_m` - Distance between bodies in meters
  ///
  /// # Returns
  /// Gravitational force in Newtons (N)
  ///
  /// # Panics
  /// Panics if distance is zero or negative.
  ///
  /// # Example
  /// ```
  /// let force = calculate_force(1e24, 6e24, 1.5e11);
  /// assert!(force > 0.0);
  /// ```
  pub fn calculate_force(mass1_kg: f64, mass2_kg: f64, distance_m: f64) -> f64 { }
  ```

### Repository Root
- **Files**:
  - README.md
  - .gitignore
  - .editorconfig
  - Makefile
  - package.json (workspace root, manages dependencies)
  - Cargo.toml (workspace config)
  - .env.example

---

## 🧪 Tests

- [ ] Unit: Verify directory structure and config files exist
- [ ] Linting:
  - `npm run lint` detects missing JSDoc and files exceeding 200 lines
  - `cargo clippy` detects documentation issues and line-length violations
  - `cargo doc` builds without warnings
- [ ] Manual: 
  - Clone repo → run `npm install` → `cargo build` succeeds
  - Run `make dev` to start development environment
  - Create file exceeding 200 lines → ESLint/clippy fails
  - Add file to exception list → passes
  - Run `cargo test --doc` to verify documentation examples

---

## 🚀 Implementation Flow

1. Spec Review
2. Initialize Vite/React project and Rust WASM project
3. Configure all tools: ESLint (with jsdoc, max-lines), Prettier, EditorConfig, stylelint, cargo clippy
4. Create .eslintignore and clippy.toml with documented exceptions for types/, __generated__/
5. Create linting scripts in Makefile and package.json
6. Set up CI to enforce all linting gates (including line-length checks)
7. Manual validation: test line-length enforcement with >200 line file
8. Create documentation-conventions.md guide for team including file-size rationale

---

## ✅ Definition of Done

- [ ] DOD-Global: All acceptance criteria met
- [ ] DOD-Build: No warnings during `npm run build` or `cargo build --release`
- [ ] DOD-DevSetup: Quick start guide verified by team member
- [ ] All configuration files checked in, no local overrides needed
- [ ] CI passes: ESLint (including max-lines), Prettier, cargo clippy, rustdoc, typescript strict mode
- [ ] All files ≤200 lines (or explicitly documented in .eslintignore/clippy.toml)
- [ ] Documentation guide added to Docs/Guides/documentation-conventions.md
- [ ] Exception whitelist documented in CONTRIBUTING.md with justification

---

## 📚 Related Specs

**Depends on**: None (Foundation)
**Required by**: SPEC-002 (Testing), SPEC-003 (WASM Bridge), SPEC-004 (Physics Engine), SPEC-005 (React Architecture), SPEC-006 (Canvas Rendering)

## 📖 References

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Google Rust Style Guide](https://google.github.io/styleguide/rust-style-guide.html)  
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [JSDoc Official Documentation](https://jsdoc.app/)
- [rustdoc Official Documentation](https://doc.rust-lang.org/rustdoc/)

---

## 🎯 200-Line Maximum Rationale

Enforcing 200-line file size maximums promotes:
- **Cognitive load**: Easier to understand, test, and maintain focused modules
- **Single Responsibility**: Forces separation of concerns
- **Reviewability**: PR reviews stay manageable (~20-30 min review time per file)
- **Modularity**: Natural boundaries between components and functions

**Legitimate exceptions** (documented in .eslintignore/clippy.toml):
- Type definition files (`types/*.ts`) - interfaces/types can cluster
- Generated code - mark with `@generated` pragma
- Large test fixture files - multiple related test cases
- Configuration files that logically belong together
- Re-export index files - barrel exports are okay
