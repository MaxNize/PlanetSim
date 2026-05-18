# SPEC-002: Testing Infrastructure

---

## 📝 User Story
```
As a developer
I want a robust testing setup with clear patterns
so that I can verify physics accuracy and UI behavior with confidence
```

---

## ✅ Acceptance Criteria

### Rust Unit Testing
- [ ] AC 1.1: cargo test runs all Rust unit tests
- [ ] AC 1.2: Test modules exist for physics calculations (PASSED criteria: match known orbital mechanics)
- [ ] AC 1.3: Mock data library exists for consistent test fixtures

### TypeScript/React Testing
- [ ] AC 2.1: Vitest configured as test runner
- [ ] AC 2.2: React Testing Library configured for component tests
- [ ] AC 2.3: Happy path + error cases tested for each component

### Integration Testing
- [ ] AC 3.1: WASM module can be loaded in test environment
- [ ] AC 3.2: JS ↔ Rust boundary has integration tests (data marshalling)
- [ ] AC 3.3: Tests verify Canvas rendering receives correct coordinates

### Coverage & CI
- [ ] AC 4.1: Test coverage reports generated (target: >80% for critical paths)
- [ ] AC 4.2: All tests run in CI on every commit
- [ ] AC 4.3: Coverage reports visible in CI logs

### Test Documentation
- [ ] AC 5.1: docs/guides/testing.md explains test patterns
- [ ] AC 5.2: Test naming convention documented (describe "Module", it "should...")
- [ ] AC 5.3: Physics test assertions use delta tolerance for float comparisons

---

## 🔧 Technical Solution

### Rust Testing
- **Framework**: built-in `#[test]` + `#[wasm_bindgen_test]` for WASM
- **Libraries**:
  - assert_approx_eq or similar for float comparisons
  - proptest for property-based testing (physics invariants)
- **File Location**: Colocated with source modules using `#[cfg(test)] mod tests { ... }`
- **Fixtures**: Defined inline in test modules with helper functions for standard planet configurations

### TypeScript/React Testing
- **Runner**: Vitest
- **Libraries**:
  - @testing-library/react (component testing)
  - @testing-library/user-event (user interactions)
  - vitest/coverage for coverage reports
- **File Location**: `Component.test.tsx` (colocated with Component.tsx, no __tests__ folder)
- **Mock WASM**: Mock `services/wasmBridge.ts` for isolated component tests

### CI/CD Integration
- **Runner**: GitHub Actions
- **Steps**:
  1. Rust tests: `cargo test --release`
  2. TypeScript tests: `npm test`
  3. Coverage: `npm coverage`
  4. Report: Upload coverage to Codecov (optional)

---

## 🧪 Tests

- [ ] Unit: `npm test` passes all tests
- [ ] Integration: WASM module loads and marshals data correctly
- [ ] Manual: Developer runs tests locally before committing

---

## 🚀 Implementation Flow

1. Spec Review → Setup test infrastructure → Write test templates → CI integration → Verification

---

## ✅ Definition of Done

- [ ] DOD-Global: All criteria met
- [ ] DOD-Testing: Coverage reports generated, CI passes
- [ ] All team members can run tests locally with single command

---

## 📚 Related Specs

**Depends on**: SPEC-001
**Required by**: SPEC-003, SPEC-004, SPEC-005, SPEC-006
