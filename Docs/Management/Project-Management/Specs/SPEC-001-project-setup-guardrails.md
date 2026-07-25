# SPEC-001: Project Setup & Guardrails

-

## 📝 User Story
```text
As a developer
I want a well-structured project foundation with clear conventions
so that the team can work efficiently and maintain code quality from day one
```
-

## ✅ Acceptance Criteria

### Workspace Setup
- [x] AC 1.1: Project structure follows monorepo pattern (frontend, backend/rust, docs)
- [x] AC 1.2: All configuration files exist (.gitignore, .editorconfig, package.json, Cargo.toml)
- [x] AC 1.3: Root README explains project vision, tech stack, and quick start

### Development Environment
- [x] AC 2.1: .env.example files exist for all services (no secrets committed)
- [x] AC 2.2: Makefile or similar automation exists for common tasks (setup, test, build)
- [x] AC 2.3: Node.js and Rust version pinned (via .nvmrc, .rust-toolchain.toml)

### Code Organization
- [x] AC 3.1: Clear module boundaries between Rust and JavaScript
- [x] AC 3.2: Frontend structure: src/components, src/hooks, src/services, src/utils (tests colocated)
- [x] AC 3.3: Rust structure: src/physics, src/wasm (with colocated unit tests and #[cfg(test)] modules)
- [x] AC 3.4: Hard 200-line maximum per file (TS/Rust/Docs) enforced via linting and CI; exceptions in `max-lines-exceptions.json` with approval trail

### Naming Conventions
- [x] AC 4.1: File naming enforced via ESLint and clippy: PascalCase for React components, snake_case for Rust modules, kebab-case for CSS classes. ESLint rule: `selector-class-pattern:
 - "^[a-z0-9]+(-[a-z0-9]+)*$"`  (stylelint); no built-in TS rule (manual review).
- [x] AC 4.2: Variable naming: camelCase (JS/TS via ESLint `naming-convention` plugin), snake_case (Rust via clippy). ESLint config: `"@typescript-eslint/naming-convention": ["error", {"selector":
 - "variable",  "format": ["camelCase", "UPPER_CASE"]}]`.
- [x] AC 4.3: Function naming: descriptive verbs enforced by code review (no automatic rule). Examples: `calculateOrbitalVelocity`, `handleParameterChange`, `updateSimulationState`.

### Commit & VCS Conventions
- [x] AC 5.1: Commit messages follow Conventional Commits with scopes (wasm, ui, physics, perf, build, docs). Enforced by code review; local validation available via `npm run commit-lint`.
- [x] AC 5.2: Branch naming convention: `feature/`, `fix/`, `docs/`, `refactor/`, `chore/` prefix (enforced by team convention and code review).
- [x] AC 5.3: PR templates require description of what changed and why
- [x] AC 5.4: Lockfiles are committed (`frontend/package-lock.json`, `Cargo.lock`) to ensure reproducible builds

Note: Local Git commit hooks are managed by the team and are not strictly required by this spec.
CI workflows (GitHub Actions) remain the authoritative enforcement mechanism for linting and commit message validation.

### Documentation Conventions (Google Style Guides)
- [x] AC 6.1: All public exports require JSDoc (TypeScript) or rustdoc (Rust)
- [x] AC 6.2: JSDoc format includes @param (with type), @returns, @example, @throws (Google TypeScript Style Guide)
- [x] AC 6.3: rustdoc includes description, examples, panics, and physics units where applicable
- [x] AC 6.4: Physics functions document algorithm reference, input units, and output units
- [x] AC 6.5: CI enforces documentation: ESLint rule for missing JSDoc, cargo doc warnings as errors
- [x] AC 6.6: Code examples in docs are validated and runnable (doctests for Rust)

### Code Quality & Guardrails
- [x] AC 7.1: ESLint configured with TypeScript support, strict rules enabled, eslint-plugin-jsdoc enforces doc requirements
- [x] AC 7.2: Prettier configured for consistent code formatting (200 char line length)
- [x] AC 7.3: .gitignore excludes node_modules, target, build artifacts, and secrets
- [x] AC 7.4: EditorConfig enforces consistent line endings (LF), indentation (2 spaces JS, 4 Rust)
- [x] AC 7.5: Stylelint configured for CSS/module.css files; enforces kebab-case for class selectors (rule: `selector-class-pattern`)
- [x] AC 7.6: Rust clippy linter enabled with strict warnings
- [x] AC 7.7: ESLint rule `max-lines` enforces 200-line maximum on .ts/.tsx files. Config: `"max-lines": ["error", {"max": 200, "skipBlankLines": true, "skipComments": true}]`. Exceptions checked
 - against  `max-lines-exceptions.json` via custom `scripts/check-max-lines.js` CI step.
- [x] AC 7.8: Cargo clippy enforces 200-line maximum on .rs files via `clippy.toml` with `too-many-lines-threshold = 200`. Exceptions checked against `max-lines-exceptions.json` via same CI step.
- [x] AC 7.9: markdownlint configured for all `.md` files in `Docs/` and root. Config: `.markdownlint.json` enforces line length ≤200 chars, proper heading hierarchy, no trailing spaces, link
 - validation.  `npm run lint:md` runs validation; CI step `lint.yml` includes markdown checks.
- [x] AC 7.10: Fallow runs on the frontend TypeScript sources to flag unused files, unused exports/types, duplication, complexity hotspots, and boundary violations.
  Local check: `npm run check:fallow`; CI gate: `npm run check:quality`.
- [x] AC 7.11: Rust uses `cargo-udeps` as the comparable unused-dependency quality check for the `wasm` crate. Local check: `cargo +nightly udeps --all-targets --all-features`; CI gate: `npm run check:quality`.

Exceptions catalog: The exceptions to the 200-line rule MUST be recorded in a machine-readable whitelist stored at `max-lines-exceptions.json` at the repository root. The CI linting scripts will
consult  this file when deciding whether a file is exempt. Schema:
```json
{
  "exemptions": [
    {
      "path": "frontend/src/types/*.ts",
      "reason": "type clusters",
      "approved_by": "arch-team"
    }
  ]
}
```
## 🔧 Technical Solution

### Frontend (React/TypeScript)
- **Project Generator**: Vite + React template
- **Configuration Files**:
 - tsconfig.json (strict mode, noImplicitAny: true)
 - vite.config.ts
 - eslint.config.js (with typescript-eslint, eslint-plugin-jsdoc, max-lines: 200)
 - .prettierrc (printWidth: 200, semi: true)
 - .editorconfig
 - .eslintignore (explicit exceptions: types/, __generated__)
 - stylelint.config.js (for CSS modules)
 - .fallowrc.json (frontend code quality analysis for unused code, duplication, and boundary rules)
- **Directory Structure**:
  ```text
  src/
    components/    # React components (PascalCase, each in its own folder)
    hooks/         # Custom React hooks (useHookName pattern)
    services/      # API & WASM integration
    utils/         # Helpers & constants (strict naming: calculateX, formatX, etc.)
    types/         # TypeScript interfaces & types
    index.tsx      # Entry point
  public/          # Static assets
  ```
**JSDoc Example** (Google TypeScript Style Guide):
  ```typescript
  /**
   * Calculates orbital velocity given two celestial bodies.
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
  ```text
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
 - `.markdownlint.json` (markdown validation config; enforces line length ≤200, heading hierarchy, no trailing spaces)
 - `frontend/package-lock.json` and `Cargo.lock` must be committed to the repository root to make builds reproducible and to allow security scanning of resolved dependency graphs.

**Markdown Linting Config (.markdownlint.json):**
```json
{
  "line-length": {"line_length": 200, "code_blocks": false},
  "no-trailing-spaces": true,
  "heading-increment": true,
  "no-bare-urls": true
}
```
-

## 🧪 Tests

- [x] Unit & Automation:
 - **Structure check:** `npm run check:structure` (script verifies `frontend/src/`, `wasm/src/`, `Docs/` exist and contain expected subdirs)
 - **Linting:** `npm run lint` runs ESLint + Prettier check + stylelint + markdownlint; detects missing JSDoc, max-lines violations, naming issues, markdown style violations
 - **Markdown linting:** `npm run lint:md` validates all `.md` files in `Docs/` and root against `.markdownlint.json` rules
 - **Rust linting:** `cargo clippy -- -D warnings` detects documentation issues, line-length violations; exits non-zero on failure
 - **Quality scans:** `npm run check:quality` runs Fallow for frontend code quality and `cargo-udeps` for Rust dependency hygiene
 - **Doc tests:** `cargo test --doc` verifies all rustdoc examples run correctly
 - **Max-lines enforcement:** `node scripts/check-max-lines.js --exceptions max-lines-exceptions.json` checks all files against limit and exceptions
 - **Commit message validation:** `npm run commit-lint` (local, optional)
- [ ] Manual smoke test (performed before first merge):
 - Clone repo → `npm install` → `cargo build` succeeds
 - Run `make dev` to start development environment
 - Run `make test` (all linting + doc tests pass)
 - Create file exceeding 200 lines in `frontend/src/` → `npm run lint` fails with max-lines error
 - Add file path to `max-lines-exceptions.json` → run `node scripts/check-max-lines.js` → passes
 - Commit message without conventional format → `npm run commit-lint` fails validation

-

## 🚀 Implementation Flow

1. Spec Review
2. Initialize Vite/React project and Rust WASM project
3. Configure all tools: ESLint (with jsdoc, max-lines, naming-convention, selector-class-pattern), Prettier, EditorConfig, stylelint, markdownlint, cargo clippy.
4. Create `.markdownlint.json` at repository root with line-length, heading, and trailing-space rules
5. Create `max-lines-exceptions.json` at repository root with schema and initial exemptions (e.g., `frontend/src/types/*.ts`)
6. Create `scripts/check-max-lines.js` to validate files against `max-lines-exceptions.json`
7. Provide documentation for developer setup and local workflows.
8. Create linting scripts in `package.json`: `lint`, `lint:md`, `check:structure`, `check-max-lines`; update Makefile with `make lint`, `make test`, `make dev`
9. Set up GitHub Actions CI workflows:
 - `lint.yml`: Run `npm run lint`, `npm run lint:md`, `cargo clippy`, `cargo doc`
 - `check-max-lines.yml`: Run custom `scripts/check-max-lines.js` step
10. Manual validation: test line-length enforcement with >200 line file, test exception whitelist, test markdown linting with violations
11. Create or update `Docs/Guides/documentation-conventions.md` guide with file-size rationale, naming examples, and markdown standards

-

## ✅ Definition of Done

- [ ] DOD-Global: All acceptance criteria met
- [ ] DOD-Build: No warnings during `npm run build` or `cargo build --release`
- [ ] DOD-DevSetup: Quick start guide verified by team member
- [ ] All configuration files checked in, no local overrides needed
- [ ] CI passes: ESLint (including max-lines), Prettier, cargo clippy, rustdoc, typescript strict mode
- [ ] All files ≤200 lines (or explicitly documented in .eslintignore/clippy.toml)
- [ ] Documentation guide added to Docs/Guides/documentation-conventions.md
- [ ] Exception whitelist documented in CONTRIBUTING.md with justification

-

## 📚 Related Specs

**Depends on**: None (Foundation)
**Required by**: SPEC-002 (Testing), SPEC-003 (WASM Bridge), SPEC-004 (Physics Engine), SPEC-005 (React Architecture), SPEC-006 (Canvas Rendering)

## 📖 References

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Google Rust Style Guide](https://google.github.io/styleguide/rust-style-guide.html)
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [JSDoc Official Documentation](https://jsdoc.app/)
- [rustdoc Official Documentation](https://doc.rust-lang.org/rustdoc/)

-

## 🎯 200-Line Maximum Rationale & Clarifications

### Line-Wrap vs. File-Line Maximum
- **`printWidth: 200`** (Prettier config) controls character-based line wrapping — prevents excessively long lines within a file.
- **`max-lines: 200`** (ESLint/clippy) controls file-line count — encourages decomposition of large modules into smaller, focused files.
- **Markdown line length: 200 characters** — enforced by markdownlint for consistency with code formatting.
- All three rules (printWidth, max-lines, markdown-line-length) are complementary and enforce a 200-character consistency across all file types.

### Cognitive Load & Maintainability
Enforcing 200-line file size maximums promotes:
- **Cognitive load**: Easier to understand, test, and maintain focused modules
- **Single Responsibility**: Forces separation of concerns
- **Reviewability**: PR reviews stay manageable (~20–30 min review time per file)
- **Modularity**: Natural boundaries between components and functions

**Legitimate exceptions** (documented in `max-lines-exceptions.json`):
- Type definition files (`frontend/src/types/*.ts`) — interfaces/types can cluster
- Generated code — mark with `@generated` pragma and document in exceptions
- Large test fixture files — multiple related test cases in single test suite
- Configuration/barrel files (`index.ts`, `index.rs`) — re-exports okay
- Files with multiple examples (e.g., `wasm/src/lib.rs` with many rustdoc examples) — document reason
