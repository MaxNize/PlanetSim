# Contributing

Thank you for contributing! This guide covers the contribution workflow, commit standards, and guardrails.

For deeper technical information, please refer to our companion guides:
* **[Project Architecture Guide](Docs/Guides/architecture.md)**: Module layouts, unidirectional data flow, and dependency tree.
* **[Developer Guide](Docs/Guides/developer-guide.md)**: Extended setup instructions, testing conventions, performance budgets, and troubleshooting FAQ.

-

## Getting Started

1. **Clone and install:**
   ```bash
   git clone <repo>
   cd fortgeschrittene-programmierung
   npm run setup
   rustup toolchain install --file .rust-toolchain.toml
   ```

2. **Local Git hooks:**
   Local Git hooks are not required. All enforcement is performed by CI; developers may follow CI checks locally if desired.

3. **Run tests and linting:**
   ```bash
   make test      # full test suite + linting
   make lint      # linting only
   make dev       # start dev server
   ```

-

## Branch & Commit Conventions

### Branch Naming

Use branch prefixes to signal intent:
- `feature/<description>` — new functionality
- `fix/<description>` — bug fix
- `docs/<description>` — documentation or guides
- `refactor/<description>` — code refactoring (no behavior change)
- `chore/<description>` — dependency updates, CI/CD, or config

**Example:** `feature/add-orbit-visualization`, `fix/gravity-calculation-precision`

**Enforcement:** Team convention, enforced through code review on PR approval.

### Conventional Commits

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) with a scope.

**Format:**
```text
<type>(<scope>): <subject>

[optional body]
[optional footer]
```
**Type:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`

**Scope:** `wasm`, `ui`, `physics`, `perf`, `build`, `docs`, `deps`

**Example commits:**
```text
feat(physics): add orbital mechanics solver
fix(ui): correct parameter input validation
docs(guides): update naming conventions
refactor(wasm): extract gravity calculation
chore(deps): upgrade React to 19.2.6
```
**Enforcement:** Conventional Commits are validated during code review. Developers may run `npm run commit-lint` locally for validation.

-

## Code Quality & Guardrails

### Documentation Requirements

- **All public exports require JSDoc (TypeScript) or rustdoc (Rust).** See [Docs/Guides/documentation-conventions.md](Docs/Guides/documentation-conventions.md) for format and examples.
- Physics functions must document formulas, input units, and output units.
- ESLint rule `eslint-plugin-jsdoc` and Clippy enforce documentation on public items.

### 200-Line File Maximum

All files should stay ≤200 lines to keep code focused and reviewable.

**Enforcement:**
- ESLint rule `max-lines: ["error", {"max": 200}]` for TypeScript.
- Clippy `too-many-lines = 200` for Rust.
- CI step `check-max-lines.yml` validates all files before merge.

### Exceptions to the 200-Line Limit

Exceptions are **tracked in `max-lines-exceptions.json`** at the repository root. Each exception requires:
- **path**: glob pattern of the file (e.g., `frontend/src/types/*.ts`)
- **reason**: rationale for the exception
- **approved_by**: who approved it (e.g., `arch-team`, `lead-contributor`)

**Valid exception categories:**
1. **Type-only files** — e.g., `types/*.ts` for related TypeScript interfaces
2. **Generated code** — marked with `@generated` pragma
3. **Large test fixtures** — multiple related test cases
4. **Barrel re-exports** — `index.ts`, `index.rs`
5. **Reference implementations** — educational or reference material with examples

**To add an exception:**

1. Edit `max-lines-exceptions.json`:
   ```json
   {
     "exemptions": [
       {
         "path": "frontend/src/types/*.ts",
         "reason": "type clusters - related TypeScript interfaces for physics domain",
         "approved_by": "arch-team"
       }
     ]
   }
   ```

2. Document the decision in your PR:
   ```text
   This PR adds `frontend/src/types/physics.ts` which clusters related physics types.
   Added exception with arch-team approval per CONTRIBUTING.md guidelines.
   ```

3. Get explicit approval from the mentioned approver before merging.

### Naming Conventions

See [Docs/Guides/documentation-conventions.md](Docs/Guides/documentation-conventions.md) for:
- File naming: `PascalCase` (components), `snake_case` (modules), `kebab-case` (CSS)
- Variables: `camelCase` (JS/TS), `snake_case` (Rust)
- Functions: descriptive verbs (e.g., `calculateOrbitalVelocity`)

-

## Testing & Linting

**Before pushing, run:**
```bash
make test                           # full test suite
make lint                           # linting only
make check:max-lines                # file-size compliance
node scripts/check-structure.js     # verify project structure
```
**CI checks (GitHub Actions):**
- `lint.yml` — ESLint, Prettier, Stylelint, Cargo Clippy, Cargo Doc
- `check-max-lines.yml` — File-size compliance

All checks must pass before a PR can be merged.

-

## Pull Request Process

1. **Create a feature branch** with proper prefix (e.g., `feature/add-orbit-cache`).
2. **Make commits** following Conventional Commits format.
3. **Run local tests:** `make test`
4. **Push and open a PR** with a clear description:
 - What changed and why
 - Any design decisions or trade-offs
 - Link related issues
5. **Wait for CI to pass** and address any review comments.
6. **Get approval** from at least one team member before merge.

-

## Code Style

- **TypeScript/JavaScript:** Prettier auto-formats on save.
- **Rust:** Format with `rustfmt` (run via `cargo fmt`).
- **CSS:** stylelint validates class names and formatting.
- **Markdown:** Follow GitHub Flavored Markdown (GFM).

-

## Questions or Issues?

Open a GitHub issue or reach out to the team. Happy coding!
