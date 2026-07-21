# Contributing

## 1. Goal

This guide defines the standard for new contributions: clean workflow, clear commit history, and stable CI.

## 2. Workflow

1. Create branch from dev.
2. Apply small, focused changes.
3. Test and lint locally:
 - **Rust/WASM**: Run `cargo fmt` and `cargo clippy` in the physics engine directory
 - **Rust/WASM**: Run `cargo fmt`, `cargo clippy`, and `cargo +nightly udeps` in the physics engine directory
 - **React/TypeScript**: Run `npm run lint` and `npm run check:fallow` from the repository root
 - **Full quality gate**: Run `npm run check:quality` from the repository root when you want both scans together
4. Write commit messages in Conventional Commit format.
5. Open pull request and complete CI successfully.

## 3. Branch naming

Recommended pattern:

- feature/<short-description>
- fix/<short-description>
- docs/<short-description>
- refactor/<short-description>
- chore/<short-description>

Examples:

- feature/elliptical-orbits
- fix/physics-precision-bug
- docs/add-dod-pr-release

## 4. Conventional commits

Format:

type(scope): short summary

Important types:

- `feat` (alias `feature`): new feature
- fix: bug fix
- docs: documentation only
- refactor: code restructure without behavior change
- test: new or updated tests
- chore: build/tooling/dependencies/housekeeping
- ci: CI/CD workflow updates
- perf: performance improvement
- revert: revert a commit

Rules:

- summary in imperative mood, short and clear
- no trailing period in summary
- scope optional but recommended
- one commit addresses one logical change

Examples:

- feat(wasm): add three-body orbital calculations
- fix(physics): correct gravitational constant precision
- docs(readme): add physics algorithm explanation
- ci(workflows): add performance benchmark gate
- test(simulation): add accuracy test for Kepler orbits
- feat(ui)!: redesign canvas coordinate system

## 5. Changelog & releases

We create tags, GitHub releases, and maintain `CHANGELOG.md` from Conventional Commits via `semantic-release`. No automatic npm/crates.io publication — only tags, releases, and changelog.

- Commits and PR titles use Conventional Commit format (`feat`, `fix`, `chore`, ...).
- Prefer `Squash and merge`: PR title becomes squash commit message and forms changelog entry.
- After merge to `main`, release pipeline runs:
 - `semantic-release` creates changelog entry, tag, and GitHub release based on Conventional Commit types.

Note: PR title must be Conventional format to group and version releases correctly.

## 6. Pull request standard

PR should include:

- goal and context
- scope of changes in bullets
- test evidence
- open risks or known limitations

Check before merge:

- CI green (tests, security, integration)
- relevant DoD points addressed
- no secrets or sensitive data in diff

## 7. Quality baseline

- spec first, code derived from it
- tests derived from spec and acceptance criteria
- error handling visible and robust
- security and input validation considered
- improve modularity, avoid unnecessary duplicate logic
- maintain colocation and deliberate extraction

## 8. In-Code Documentation

All **exported** functions, components, classes, and modules require documentation. This is validated on every PR.

**Quick reference:**

- **Rust/WASM**: Standard Rust documentation comments (`///` and `//!`). Use `cargo doc --open` to preview.
- **React/TypeScript**: JSDoc comments on exports. Run `npm run lint` to validate.
- All exports must have a clear description of purpose, parameters, and return values.

## 9. Quick commit cheatsheet

- new feature: feat(scope): ...
- bug fix: fix(scope): ...
- docs: docs(scope): ...
- tests: test(scope): ...
- CI change: ci(scope): ...
