import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StateDisplay } from './StateDisplay';

vi.mock('../../context/SimulationContext', () => ({
  useSimulationContext: () => ({
    mode: '3body',
    currentState: {},
  }),
}));

describe('StateDisplay component', () => {
  it('should render telemetry details and format exponential numbers', () => {
    const props = {
      time: 3600.0,
      primaryPos: [1e6, 2e6] as [number, number],
      primaryVel: [100.0, -200.0] as [number, number],
      secondaryPos: [4e8, 5e8] as [number, number],
      secondaryVel: [50.0, 10.0] as [number, number],
      testParticlePos: [3e8, 0.0] as [number, number],
      testParticleVel: [0.0, 500.0] as [number, number],
      kineticEnergy: 1.5e20,
      potentialEnergy: -2.3e20,
      error: 'Test engine warning',
    };

    render(<StateDisplay {...props} />);

    // Assert time conversion (3600s = 1.00h)
    expect(screen.getByText(/3600\.0 s/)).toBeDefined();
    expect(screen.getByText(/1\.00 h/)).toBeDefined();

    // Assert coordinates are formatted with human-readable, auto-scaled units (FP-34)
    expect(screen.getByText(/Pos: \[1\.00 Mm, 2\.00 Mm\]/)).toBeDefined();
    expect(screen.getByText(/Vel: \[100\.0 m\/s, -200\.0 m\/s\]/)).toBeDefined();

    // Assert energies
    expect(screen.getByText(/Kinetic: 1\.5000e\+20 J/)).toBeDefined();
    expect(screen.getByText(/Potential: -2\.3000e\+20 J/)).toBeDefined();
    expect(screen.getByText(/Total: -8\.0000e\+19 J/)).toBeDefined(); // 1.5e20 - 2.3e20 = -0.8e20 = -8e19

    // Assert error state
    expect(screen.getByText(/⚠️ Error: Test engine warning/)).toBeDefined();
  });
});
