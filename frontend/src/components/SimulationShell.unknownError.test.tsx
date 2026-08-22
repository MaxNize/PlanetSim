import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimulationShell } from './SimulationShell';

vi.mock('../utils/calculateOrbitalVelocity', () => ({
  calculateOrbitalVelocity: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- intentionally not an Error, to exercise the non-Error catch branch.
    throw 'boom';
  },
}));

describe('SimulationShell non-Error throw handling', () => {
  it('falls back to a generic message when a non-Error value is thrown', () => {
    render(<SimulationShell />);
    expect(screen.getByLabelText('error-message')).toHaveTextContent('Error: An unknown error occurred');
  });
});
