# Testing Best Practices

> **AI TL;DR**
> **Purpose**: Style guidelines and best practices for writing high-quality tests.
> **Key Rules**: Use standard describe-it naming blocks, apply the Arrange-Act-Assert (AAA) pattern, handle float comparisons using delta tolerance, and mock external WASM services.
> **Relevant Files**: Apply to all `.test.ts/tsx` and Rust test modules.

This guide outlines the coding standards, patterns, and best practices for writing tests in this repository.

---

## 1. Test Naming Conventions

We use a clear descriptive style for test blocks. This ensures that the test runner output readably lists what is being verified.

### TypeScript / Vitest
Use nested `describe` and `it` blocks:
- **`describe`**: Group related tests (e.g. named after a class, hook, function, or component).
- **`it`**: Formulate assertions using a lowercase verb phrase starting with "should..." describing the expected outcome.

```typescript
describe('SimulationShell component', () => {
  describe('rendering', () => {
    it('should show the heading title', () => {
      // test here
    });
  });
});
```

### Rust Unit Tests
In Rust, name test functions using snake_case, prefixing with `test_` or describing the behavior:
```rust
#[test]
fn test_calculate_force_with_positive_mass() {
    // test here
}
```

---

## 2. Arrange-Act-Assert (AAA) Pattern

Write tests following the AAA structure. This improves readability by separating setup from actions and assertions:

1. **Arrange**: Set up the inputs, mocks, and rendering.
2. **Act**: Execute the function or trigger the user interaction.
3. **Assert**: Verify that the outcomes match expectations.

```typescript
it('should update distance input value', async () => {
  // 1. Arrange
  render(<SimulationShell />);
  const user = userEvent.setup();
  const input = screen.getByLabelText('Distance');

  // 2. Act
  await user.clear(input);
  await user.type(input, '5e8');

  // 3. Assert
  expect(input).toHaveValue(5e8);
});
```

---

## 3. Floating-Point Comparisons

Physics simulations heavily utilize 64-bit floating-point numbers (`f64`/`number`). Floats accumulate small rounding errors. Never use exact equality checks on floats.

### In TypeScript / Vitest
Use `toBeCloseTo(expected, precision)` rather than `toBe()`:
```typescript
// Good: Allows minor float variance
expect(velocity).toBeCloseTo(816.96389, 4);

// Bad: Will fail due to precision noise
expect(velocity).toBe(816.96389);
```

### In Rust
Verify using a delta tolerance range:
```rust
// Good: Compare using absolute difference
let force = calculate_force(EARTH_MASS, MOON_MASS, DISTANCE);
let expected = 1.982e20;
let tolerance = 1e16;
assert!((force - expected).abs() < tolerance);

// Bad: Exact equality will often fail
assert_eq!(force, expected);
```

---

## 4. Mocking Strategy

To keep unit tests fast and isolated, mock complex external dependencies:
- **WASM Modules**: When testing React components (like sliders or canvas structures), mock the WASM service rather than executing compiled WASM bindings.
- **Vite Env**: Mock imports of WASM using Vitest mock factories if the WASM file is not built yet.

Example mocking the WASM api in a component test:
```typescript
import { vi } from 'vitest';

vi.mock('../services/wasm', () => ({
  loadWasmApi: vi.fn().mockResolvedValue(true),
}));
```
