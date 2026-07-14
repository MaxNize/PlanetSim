# Unit Testing Guide

> **AI TL;DR**
> **Purpose**: Practical guide for creating and running unit tests in Rust and React/TypeScript.
> **Key Rules**: Frontend tests are colocated as `*.test.ts/tsx` using Vitest and React Testing Library. Backend tests reside in `#[cfg(test)]` modules.
> **Commands**: Run `make test` for full suite; `npm --prefix frontend run test` for frontend; `cargo test` for wasm.

This guide provides practical instructions for writing, organizing, and running unit tests in the Planet Simulation monorepo.

## Test File Organization

We colocate test files with the code they verify. This makes finding tests easy and keeps files small:

```text
frontend/src/
  components/
    SimulationShell.tsx
    SimulationShell.test.tsx      # Colocated component test
  hooks/
    useSimulationControls.ts
    useSimulationControls.test.ts  # Colocated custom hook test
  utils/
    calculateOrbitalVelocity.ts
    calculateOrbitalVelocity.test.ts # Colocated utility test
wasm/src/
  physics/
    calculations.rs                # Rust logic with inline tests
```

---

## Writing Frontend Tests (Vitest & RTL)

Frontend tests use **Vitest** as the test runner and **React Testing Library** for component mounting and querying.

### 1. Pure Utility Functions
For simple functions, test assertions are straightforward:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateOrbitalVelocity } from './calculateOrbitalVelocity';

describe('calculateOrbitalVelocity', () => {
  it('should compute velocity correctly', () => {
    const result = calculateOrbitalVelocity(1e24, 1e8);
    expect(result).toBeCloseTo(816.96, 2);
  });
});
```

### 2. Custom Hooks
Custom React hooks are tested using `renderHook` and `act`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSimulationControls } from './useSimulationControls';

describe('useSimulationControls', () => {
  it('updates state variables', () => {
    const { result } = renderHook(() => useSimulationControls());
    act(() => {
      result.current.setMassM1(5e24);
    });
    expect(result.current.massM1).toBe(5e24);
  });
});
```

### 3. React Components
React component tests simulate user interactions:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimulationShell } from './SimulationShell';

describe('SimulationShell', () => {
  it('allows user input', async () => {
    render(<SimulationShell />);
    const user = userEvent.setup();
    const input = screen.getByLabelText('Mass 1');
    await user.clear(input);
    await user.type(input, '2e24');
    expect(input).toHaveValue(2e24);
  });
});
```

---

## Writing Backend Tests (Rust)

Backend unit tests are written inside a colocated module marked with `#[cfg(test)]`.

```rust
pub fn calculate_force(mass1: f64, mass2: f64, distance: f64) -> f64 {
    // math...
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::physics::fixtures::*;

    #[test]
    fn test_force() {
        let f = calculate_force(EARTH_MASS, MOON_MASS, EARTH_MOON_DISTANCE);
        assert!((f - 1.982e20).abs() < 1e18);
    }
}
```

---

## Running Tests

Run these commands from the root directory:

```bash
# Run all project checks & tests (Makefile target)
make test

# Run frontend tests only
npm --prefix frontend run test

# Run frontend tests in watch mode
npm --prefix frontend run test:watch

# Run wasm tests only (using login shell in WSL)
wsl -d Ubuntu bash -l -c "cd wasm && cargo test"
```
