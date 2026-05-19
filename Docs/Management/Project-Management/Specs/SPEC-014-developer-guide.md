# SPEC-014: Developer Guide & Contribution Framework

-

## 📝 User Story
```text
As a developer (student, contributor, maintainer)
I want clear guidelines on how to extend, test, and contribute to the project
so that I can confidently implement new features and maintain code quality
```
-

## ✅ Acceptance Criteria

### Project Structure Guide
- [ ] AC 1.1: Directory layout explained (why things are organized this way)
- [ ] AC 1.2: Module boundaries documented (when to add files to each layer)
- [ ] AC 1.3: Naming conventions for components, functions, types
- [ ] AC 1.4: File path examples for new features

### Setup & Local Development
- [ ] AC 2.1: Prerequisites listed (Node, Rust version, tools)
- [ ] AC 2.2: Step-by-step setup with `make dev` or equivalent
- [ ] AC 2.3: Troubleshooting common setup issues
- [ ] AC 2.4: IDE setup recommendations (VSCode, Rust Analyzer, TypeScript)

### Contribution Workflow
- [ ] AC 3.1: Feature request → GitHub issue → SPEC → PR → Review → Merge process
- [ ] AC 3.2: Branch naming conventions (feature/, fix/, docs/)
- [ ] AC 3.3: Commit message format (Conventional Commits)
- [ ] AC 3.4: PR template with checklist
- [ ] AC 3.5: Code review expectations

### Testing Requirements
- [ ] AC 4.1: When to write unit vs integration tests
- [ ] AC 4.2: Physics test examples (float comparison, energy conservation)
- [ ] AC 4.3: Component test examples (mocking WASM, user interactions)
- [ ] AC 4.4: Coverage requirements and how to measure

### Performance & Optimization
- [ ] AC 5.1: Performance budgets (e.g., "Physics step < 1ms")
- [ ] AC 5.2: Profiling tools and how to use them
- [ ] AC 5.3: Common performance pitfalls documented
- [ ] AC 5.4: Benchmark procedures for major changes

### Release & Versioning
- [ ] AC 6.1: Semantic versioning explained
- [ ] AC 6.2: What changes trigger major/minor/patch bumps
- [ ] AC 6.3: Release checklist
- [ ] AC 6.4: Changelog guidelines

### Spec-Driven Development
- [ ] AC 7.1: How to write a SPEC (acceptance criteria, technical solution)
- [ ] AC 7.2: When to create a SPEC vs quick fix
- [ ] AC 7.3: Spec review process and approval gates
- [ ] AC 7.4: Linking implementation to spec (traceability)

-

## 🔧 Technical Solution

### Core Documents

**`docs/CONTRIBUTING.md`**
```markdown
# Contributing to Planet Simulation

## Welcome!
This project is designed for learning. Your contributions help others learn.

## Getting Started

### Prerequisites
- Node.js 20+ (check `.nvmrc`)
- Rust 1.70+ (check `.rust-toolchain.toml`)
- cargo-watch (for auto-rebuild)

### Setup
\`\`\`bash
git clone <repo>
cd planet-simulation
make setup  # Installs dependencies
make dev    # Runs watch mode for WASM + frontend
\`\`\`

### Verify Setup
\`\`\`bash
npm test           # Run TypeScript tests
cargo test         # Run Rust tests
npm run build:wasm # Build WASM
\`\`\`

## Contribution Workflow

### 1. Check Existing Issues
Look for [good first issues](https://github.com/...issues?q=label:good-first-issue)

### 2. Propose Your Change
- **Bug Fix**: Open issue, link code location
- **Feature**: Open discussion issue first
- **Spec-driven**: Create SPEC file in `Docs/Management/Specs/`

### 3. Fork & Branch
\`\`\`bash
git checkout -b feature/your-feature-name
# Branch names: feature/, fix/, docs/, refactor/, chore/
\`\`\`

### 4. Write Spec (for features)
Copy from template and document acceptance criteria and technical approach.

### 5. Implement & Test
\`\`\`bash
npm run lint:fix    # Auto-fix style issues
cargo fmt --all     # Format Rust
npm test            # Run all tests
cargo test
\`\`\`

### 6. Commit with Conventional Commits
\`\`\`bash
git commit -m \"feat(wasm): add new physics function

Adds distance calculation with special handling for zero-distance edge case.
Closes #123\"
\`\`\`

**Scopes**: wasm, ui, physics, perf, build

### 7. Push & Open PR
\`\`\`bash
git push origin feature/your-feature-name
# Fill out PR template
\`\`\`

## Code Style

### TypeScript/React
- Use `const` (never `var`)
- Components: PascalCase (MyComponent.tsx)
- Hooks: useMyHook pattern
- Props: Fully typed interfaces
- Files: Feature-based organization

Example:
\`\`\`typescript
// src/components/ParameterControls/ParameterControls.tsx
interface ParameterControlsProps {
  config: PhysicsConfig;
  onConfigChange: (config: PhysicsConfig) => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  config,
  onConfigChange,
}) => { /* ... */ };
\`\`\`

### Rust
- Modules: snake_case (physics, wasm)
- Public functions: Documented with `///` doc comments
- Functions: Prefer small, focused, testable units
- Tests: Inline with `#[cfg(test)]` modules

Example:
\`\`\`rust
/// Calculates gravitational force between two bodies.
///
/// # Example
/// \`\`\`
/// let f = force_between(1e24, 1e24, 1e11, 6.674e-11);
/// \`\`\`
pub fn force_between(m1: f64, m2: f64, r: f64, g: f64) -> f64 { /* ... */ }
\`\`\`

## Testing

### When to Test
- All public functions (Rust)
- All React components
- Physics calculations (especially edge cases)
- WASM boundary marshalling

### Test Patterns

**Physics (Rust)**
\`\`\`rust
#[test]
fn test_circular_orbit_energy_conservation() {
    let state = create_earth_moon_state();
    let mut energy = calculate_total_energy(&state);

    for _ in 0..1000 {
        let result = integrate_step(&state, 1.0);
        let new_energy = result.kinetic_energy + result.potential_energy;

        // Allow 0.1% relative error
        assert!((new_energy - energy).abs() / energy < 0.001);
    }
}
\`\`\`

**Components (React)**
\`\`\`typescript
describe('ParameterControls', () => {
  it('should update mass when slider changes', () => {
    const mockOnChange = vi.fn();
    const { getByRole } = render(
      <ParameterControls config={defaultConfig} onConfigChange={mockOnChange} />
    );

    const slider = getByRole('slider');
    fireEvent.change(slider, { target: { value: '1e30' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ mass: 1e30 })
    );
  });
});
\`\`\`

## Performance

### Budgets
- Physics step: < 1ms (60 FPS requirement)
- Frame render: < 16.67ms
- WASM boundary crossing: < 5% of step time
- Bundle size: < 500KB (WASM + JS)

### Profiling
1. **Rust**: Use `cargo flamegraph` for CPU profiles
2. **JS**: DevTools Performance tab → record → analyze
3. **WASM**: `wasm-bindgen` profiling mode

## Release Process

### Version Bumping
Uses Conventional Commits to auto-bump:
- `feat(...)` → minor version
- `fix(...)` → patch version
- `BREAKING CHANGE:` footer → major version

### Release Checklist
- [ ] All tests passing
- [ ] `cargo clippy` clean
- [ ] `npm run lint` clean
- [ ] Changelog updated (auto-generated)
- [ ] Version bumped
- [ ] Tag created
- [ ] Artifacts published

## Questions?
- Check [FAQ](./FAQ.md)
- Open [GitHub Discussions](https://github.com/.../discussions)
- Review existing PRs for patterns
```
**`docs/ARCHITECTURE.md`**
```markdown
# Project Architecture

## Overview
```
┌─────────────────────────────────────────┐
│          React UI (TypeScript)          │
│  Components, Hooks, Canvas Rendering    │
└──────────────┬──────────────────────────┘
               │ WASM Bindgen Bridge
               ▼
┌─────────────────────────────────────────┐
│       Physics Engine (Rust/WASM)        │
│  2-Body Orbital Mechanics, Integration  │
└─────────────────────────────────────────┘
```text
## Module Structure

### Frontend (`src/`)
- `components/` - React components (Simulator, Controls, Canvas)
- `hooks/` - Custom hooks (useSimulation, useAnimationFrame)
- `services/` - Business logic (CanvasRenderer, SimulatorBridge)
- `context/` - Global state (SimulationContext)
- `types/` - TypeScript interfaces
- `utils/` - Helpers, constants

### Rust (`src/`)
- `lib.rs` - WASM entry point, `#[wasm_bindgen]` exports
- `physics/` - Physics calculations (gravity, integration)
- `physics/types.rs` - Body, State structs
- `physics/gravity.rs` - Newton's law, force calculations
- `physics/integrator.rs` - Velocity Verlet integration

## Data Flow

\`\`\`
User Input (UI) → React State → SimulatorBridge.step()
  ↓
WASM Simulator.step(dt) → Physics Calculations
  ↓
Serialized State → Canvas Renderer → Visual Output
\`\`\`

## Dependency Graph

```
SPEC-001 (Foundation)
  ├→ SPEC-002 (Testing)
  ├→ SPEC-003 (Physics)
  │   └→ SPEC-004 (WASM)
  │       ├→ SPEC-005 (React Architecture)
  │       │   └→ SPEC-006 (Canvas)
  │       │       ├→ SPEC-007 (Parameters)
  │       │       └→ SPEC-008 (Trajectory)
  │       │           ├→ SPEC-009 (Sandbox)
  │       │           └→ SPEC-010 (Manipulation)
  ├→ SPEC-011 (CI/CD)
  └→ SPEC-012 (Deployment)
```text
## Adding a New Feature

1. **Spec**: Create SPEC-XXX.md in Docs/Management/Specs/
2. **Branch**: `git checkout -b feature/your-feature`
3. **Test First**: Write tests that fail (RED)
4. **Implement**: Make tests pass (GREEN)
5. **Refactor**: Improve code quality
6. **Commit**: Use Conventional Commits
7. **PR**: Reference SPEC, include before/after behavior

- -

**`docs/FAQ.md`**

```
# Frequently Asked Questions

## Development

Q: How do I get 60 FPS?
A: Use `cargo --release` for optimized WASM builds, profile with DevTools Performance tab

Q: How do I test physics changes?
A: See tests in `src/physics/tests.rs`, run with `cargo test --lib physics`

Q: How do I debug WASM?
A: Check browser DevTools console, enable WASM debugging with `wasm-bindgen`, review error logs

## Performance

Q: Why is WASM slow?
A: Likely optimization issue. Check:
1. Use `--release` profile
2. Ensure dt is reasonable (< 1 second)
3. Profile with flamegraph

## Contributing

Q: What if my feature breaks tests?
A: Fix the implementation to pass existing tests, or update tests with spec review

Q: How do I add a preset?
A: Update `src/shared/constants/simulation.ts` with new PhysicsConfig
```text
- -

## 🧪 Tests

- [ ] Unit: Verify guides are accurate (clone repo → follow setup → works)
- [ ] Manual: New contributor follows guide without assistance
- [ ] Code review: Spec templates useful and complete

- -

## 🚀 Implementation Flow

1. Spec Review → Write core guides (CONTRIBUTING, ARCHITECTURE) → Add examples → Maintenance docs

- -

## ✅ Definition of Done

- [ ] DOD-Global: All acceptance criteria met
- [ ] Guides updated and accurate
- [ ] Examples provided for common tasks
- [ ] New contributor successfully follows guide

- -

## 📚 Related Specs

**Depends on**: All other specs (documents them)
**Required by**: Project success and community growth
