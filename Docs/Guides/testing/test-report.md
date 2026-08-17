# Test Report

> **AI TL;DR**
> **Purpose**: Point-in-time snapshot of results across all test/quality levels (Rust unit, frontend unit, E2E, quality gates).
> **Key Rules**: Regenerate by re-running the commands in each section; do not hand-edit numbers without re-running the underlying tool.
> **Relevant Files**: See [testing-philosophy.md](testing-philosophy.md) for the pyramid this report
> tracks against, and [SPEC-002](../../Management/Project-Management/Specs/SPEC-002-testing-infrastructure.md)
> for the acceptance criteria this satisfies.

Snapshot generated: 2026-08-11, commit `e355df8` (branch `dev`). The raw, tool-generated reports this
snapshot summarizes are checked into [`reports/`](reports/) alongside this file:

| Level | Generated report |
|---|---|
| Rust unit | [`reports/rust-test-output.txt`](reports/rust-test-output.txt) — raw `cargo test` / `cargo test --doc` output |
| Frontend unit coverage | [`reports/frontend-coverage/index.html`](reports/frontend-coverage/index.html) — Vitest v8 HTML coverage report |
| E2E | [`reports/e2e-playwright-report/index.html`](reports/e2e-playwright-report/index.html) — Playwright HTML report |
| Quality gates | [`reports/fallow-report.md`](reports/fallow-report.md) — `fallow audit --format markdown` output |

These are point-in-time snapshots, not live-synced — regenerate them (see each section's command) and
re-copy into `reports/` whenever this report is refreshed.

---

## 1. Rust Unit Tests

**Command**: `cd wasm && cargo test`

| Metric | Result |
|---|---|
| Unit tests | 12 passed / 0 failed |
| Doctests | 8 passed / 0 failed |
| Total | **20 passed, 0 failed** |

Covers: gravitational force calculations, Lagrange points, N-body integration (Velocity-Verlet), WASM bindings (`hello`, `Simulator::set_state`).

---

## 2. Frontend Unit Tests (Vitest)

**Command**: `npm --prefix frontend run test:coverage`

| Metric | Result |
|---|---|
| Test files | 16 passed / 0 failed |
| Tests | 39 passed / 0 failed |

### Coverage

| Metric | % | Covered/Total |
|---|---|---|
| Statements | 53.10% | 419/789 |
| Branches | 32.64% | 127/389 |
| Functions | 50.22% | 113/225 |
| Lines | 55.41% | 399/720 |

This is well below the >80% target for critical paths stated in [testing-philosophy.md](testing-philosophy.md). Weakest files:

| File | Line Coverage | Note |
|---|---|---|
| `src/services/canvasHelpers.ts` | 0% | untested |
| `src/services/wasm.ts` | 0% | untested |
| `src/services/canvasRenderer.ts` | 32.3% | core render loop, largely untested |
| `src/hooks/useInteraction.ts` | 38.5% | pan/zoom/drag input handling |
| `src/hooks/useSimulationStep.ts` | 33.3% | |
| `src/components/ParameterControls/SandboxControls.tsx` | 21.7% | |

Full HTML report: [`reports/frontend-coverage/index.html`](reports/frontend-coverage/index.html) (also
uploaded as a CI artifact `frontend-coverage` on the `typescript-tests` job).

---

## 3. End-to-End Tests (Playwright)

**Command**: `npm --prefix frontend run test:e2e`

| Metric | Result |
|---|---|
| Tests | 5 passed / 0 failed |
| Project | Chromium only |

| Test | Status |
|---|---|
| loads page with fullscreen canvas and overlay panels | ✅ |
| toggles play/pause and progresses simulation time | ✅ |
| supports canvas zooming via mouse wheel | ✅ |
| supports panning via space + drag | ✅ |
| enters sandbox mode, places a body, configures it | ✅ |

Full HTML report: [`reports/e2e-playwright-report/index.html`](reports/e2e-playwright-report/index.html).

**Observation**: the run logged a browser console error not asserted on by any test —
`Simulation step failed: Time step must be positive` — surfaced during the play/pause test.
This didn't fail the suite (no assertion checks console output) but indicates an edge case
in the simulation step worth a dedicated unit test.

### Coverage gap vs. the testing pyramid

[testing-philosophy.md](testing-philosophy.md) only defines Unit (~90%) and Integration (~10%) tiers — E2E
is not named as a tier even though this Playwright suite exists and runs in CI (`playwright-e2e` job). The
suite currently only covers the happy path. Not covered:

- Editing/deleting an existing body (`BodyEditDialog`, `BodyContextMenu`)
- Invalid parameter input / validation error states in `BodyDialog`
- Language switching (`LanguageSelector`)
- Preset selection
- Time-travel / history scrubbing (`detailHistory.ts`)

---

## 4. Quality Gates

| Check | Command | Result |
|---|---|---|
| Fallow audit (changed files vs. `origin/main`) | `npm run check:fallow` | ✅ pass — 0 issues in 8 changed files |
| Rust Clippy | `cargo clippy --all-targets -- -D warnings` | ✅ pass, 0 warnings |
| Directory/file structure | `npm run check:structure` | ✅ 18/18 checks passed |
| Max line count (200 LOC/file) | `npm run check:max-lines` | ✅ 105/105 files compliant |

Fallow found 3 pre-existing findings on `scripts/rewrap-markdown.js`, but they predate this change set and
are excluded from the gate as inherited. Full breakdown: [`reports/fallow-report.md`](reports/fallow-report.md).
Max-lines has 12 documented exceptions (see `max-lines-exceptions.json`).

Not run in this snapshot — both require extra toolchains not installed in this environment, but run in the
`code-quality` CI job on every push/PR: `cargo +nightly udeps` (`check:rust-udeps`) and
`cargo modules orphans` (`check:rust-orphans`).

---

## Summary

| Level | Status | Gap |
|---|---|---|
| Rust unit | ✅ 20/20 passing | none significant |
| Frontend unit | ✅ 39/39 passing | coverage at 53% stmts, below the >80% target for critical paths — see `src/services` and interaction hooks above |
| E2E | ✅ 5/5 passing | happy-path only; no edit/delete, validation, i18n, or history coverage; not represented in the testing pyramid doc |
| Quality gates | ✅ all pass | `rust-udeps`/`rust-orphans` not exercised locally, CI-only |

**Regenerating this report**: re-run the four commands above from the repo root and update the tables. Consider scripting this (e.g. a `npm run test:report` target) if it needs to be refreshed frequently.
