import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { simulationContext } from '../../context/SimulationContext';
import { Simulator } from './Simulator';
import { SimulationState } from '../../services/wasmBridge';

const mockState: SimulationState = {
  primary: { position: [0.0, 0.0], velocity: [0.0, 0.0], mass: 5e24, radius: 6e6 },
  secondary: { position: [3e8, 0.0], velocity: [0.0, 1000.0], mass: 7e22, radius: 1e6 },
  testParticle: { position: [2e8, 0.0], velocity: [0.0, 500.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: 6.67e-11,
};

describe('Simulator container component', () => {
  it('should render and bind to SimulationContext values', () => {
    const mockContextValue = {
      initialState: mockState,
      setInitialState: vi.fn(),
      currentState: mockState,
      stepResult: null,
      isPaused: true,
      setIsPaused: vi.fn(),
      speedMultiplier: 1000.0,
      setSpeedMultiplier: vi.fn(),
      lagrangePoints: null,
      history: [],
      clearHistory: vi.fn(),
      resetSimulation: vi.fn(),
      error: 'Mock engine error',
    };

    render(
      <simulationContext.Provider value={mockContextValue}>
        <Simulator />
      </simulationContext.Provider>
    );

    // Assert container renders headings from presentational children
    expect(screen.getByText('Simulation Controls')).toBeDefined();
    expect(screen.getByText('Simulation Telemetry')).toBeDefined();

    // Assert Canvas placeholder renders
    expect(screen.getByLabelText('Simulation Canvas Placeholder')).toBeDefined();

    // Assert context errors are passed
    expect(screen.getByText('⚠️ Error: Mock engine error')).toBeDefined();
  });
});
