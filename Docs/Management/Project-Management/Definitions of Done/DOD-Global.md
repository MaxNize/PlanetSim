# Definition of Done - Global (Planet Simulation)

This DoD applies to all SPEC implementations unless overridden by feature-specific DoDs.

## 1. Spec Compliance (Required)

- [ ] All acceptance criteria from SPEC are met
- [ ] Implementation traces back to acceptance criteria (code comments link to AC numbers)
- [ ] No scope creep (features not in SPEC are documented as future work)

## 2. Testing (Required)

### Unit Tests
- [ ] Happy path tested
- [ ] Edge cases tested (boundary values, zero, negative, max)
- [ ] Error paths tested (invalid input, exceptional conditions)
- [ ] Coverage ≥ 80% for critical functions (physics, marshalling)

### Integration Tests
- [ ] Components work together (WASM ↔ JS for physics features)
- [ ] State flows correctly between layers
- [ ] No data loss or corruption in marshalling

### Physics Tests (for physics/WASM changes)
- [ ] Reference test passes (e.g., circular orbit energy conservation < 0.1%)
- [ ] Float comparisons use delta tolerance (not exact equality)
- [ ] Tests document assumptions (units, time scales, precision)

## 3. Code Quality (Required)

### TypeScript
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] No `any` types (use proper TypeScript interfaces)
- [ ] All public functions/components have JSDoc comments
- [ ] Props interfaces fully typed

### Rust
- [ ] `cargo clippy` passes with no warnings (`cargo clippy -- -D warnings`)
- [ ] `cargo fmt` applied (`cargo fmt --all`)
- [ ] All public functions have doc comments with examples
- [ ] No `unsafe` code without justification comments

## 4. Performance (Required)

### Physics Engine (WASM)
- [ ] Single integration step: < 1ms (100 iterations < 100ms)
- [ ] No allocations in hot loop
- [ ] Release build optimized (`opt-level = "z"`, `lto = true`)

### UI/Rendering
- [ ] 60 FPS maintained (frame time < 16.67ms)
- [ ] Canvas updates smooth (no visible stuttering)
- [ ] WASM boundary crossing: < 5% of frame time

### Bundle Size
- [ ] WASM module: < 500KB
- [ ] Total frontend dist: < 1MB
- [ ] Report sizes in PR description

## 5. Error Handling (Required)

- [ ] All error cases explicitly handled (no silent failures)
- [ ] User-friendly error messages (not internal stack traces)
- [ ] Error messages actionable (suggest fix when possible)
- [ ] Errors logged with context for debugging

### WASM Errors
- [ ] Rust panics caught and converted to JS errors
- [ ] Invalid parameters (e.g., negative mass) rejected before WASM call
- [ ] Network/IO errors handled gracefully (if applicable)

## 6. Security (Required)

- [ ] No secrets in code or commits
- [ ] Input validation (size limits, type checks)
- [ ] XSS prevention (no `dangerouslySetInnerHTML` unless justified)
- [ ] CORS configured if needed
- [ ] Dependencies checked for vulnerabilities (`cargo audit`, `npm audit`)

## 7. Documentation (Required)

- [ ] Code comments explain *why*, not *what*
- [ ] Complex algorithms documented with pseudocode/references
- [ ] Public APIs documented (JSDoc, doc comments)
- [ ] Breaking changes noted in PR description
- [ ] Complex business logic explained (especially physics)

## 8. Architecture (Required)

- [ ] Module boundaries maintained (no layer violations)
- [ ] Modularity improved or at least not degraded
- [ ] Reusable logic extracted (DRY principle)
- [ ] Colocated related code (component + tests + styles together)
- [ ] No unnecessary dependencies added

## 9. Compatibility (Required)

- [ ] Works in latest 2 versions of Chrome/Firefox/Safari
- [ ] Mobile responsive (tested on 375px width)
- [ ] No console errors or warnings
- [ ] Graceful degradation for older browsers (if applicable)

## 10. Constants & Configuration (Required)

- [ ] No hardcoded values (extract to constants)
- [ ] Magic strings in centralized config:
  - **Backend**: `app/config/constants.py` or `app/utils/api_endpoints.py`
  - **Frontend**: `src/shared/constants/` with appropriate module (api.ts, simulation.ts, validation.ts)
  - **Rust**: Module-level `const` or `static`
- [ ] Barrel exports updated (`src/shared/constants/index.ts` for new constants)

## 11. Git Hygiene (Required)

- [ ] Commits use Conventional Commits format:
  - `feat(scope): description` for features
  - `fix(scope): description` for bugs
  - `docs(scope): description` for documentation
  - Scopes: `wasm`, `ui`, `physics`, `perf`, `build`, `chore`
- [ ] Commit messages reference SPEC or issue numbers
- [ ] One logical change per commit (not too granular, not too large)
- [ ] No merge commits in PR (rebase if needed)

## 12. PR Completeness (Required)

- [ ] PR title follows Conventional Commits
- [ ] PR description includes:
  - Link to SPEC
  - Summary of changes
  - Performance metrics (if applicable)
  - Bundle size impact (if applicable)
  - Screenshots or video (for UI changes)
- [ ] All conversations resolved
- [ ] CI/CD pipeline passes
- [ ] At least 1 approval from maintainer

## 13. Physics-Specific DoD

- [ ] Equations verified against references (textbook/paper)
- [ ] Units consistent (SI units throughout: m, kg, s)
- [ ] Numerical stability verified (no NaN or Inf propagation)
- [ ] Edge cases handled (zero distance, equal masses, high velocity)
- [ ] Float precision documented (64-bit, typical ±1e-15 error)

## 14. WASM-Specific DoD

- [ ] Data marshalling tested both directions (Rust → JS, JS → Rust)
- [ ] No memory leaks (profile with DevTools Memory tab after 10k cycles)
- [ ] Error messages clear (mention WASM source when possible)
- [ ] Version compatibility documented (WASM ABI changes noted)

---

## Summary Checklist

### Before Submitting PR
- [ ] Tests written and passing
- [ ] Linting passes (ESLint, Clippy, Prettier)
- [ ] Performance within budget
- [ ] No secrets committed
- [ ] Comments explain *why*
- [ ] Constants extracted
- [ ] PR description complete

### Before Merge
- [ ] All CI/CD checks passing
- [ ] At least 1 approval
- [ ] Conversations resolved
- [ ] Performance validated
- [ ] Documentation updated

---

## Related DoDs

- [DOD-Testing](./DOD-Testing.md)
- [DOD-Performance](./DOD-Performance.md)
- [DOD-Security](./DOD-Security.md)
