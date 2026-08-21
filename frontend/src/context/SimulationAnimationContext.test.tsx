import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useSimulationAnimation } from './SimulationAnimationContext';

describe('useSimulationAnimation guard', () => {
  it('throws when used outside a SimulationProvider', () => {
    function Unwrapped() {
      useSimulationAnimation();
      return null;
    }
    expect(() => render(<Unwrapped />)).toThrow('useSimulationAnimation must be used within a SimulationProvider');
  });
});
