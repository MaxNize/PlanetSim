import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { simulationContext, DEFAULT_INITIAL_STATE } from '../../context/SimulationContext';
import { Layout } from './Layout';

describe('Layout component', () => {
  it('should render application header and simulation view', () => {
    const mockContextValue = {
      initialState: DEFAULT_INITIAL_STATE,
      setInitialState: vi.fn(),
      currentState: DEFAULT_INITIAL_STATE,
      stepResult: null,
      isPaused: true,
      setIsPaused: vi.fn(),
      speedMultiplier: 1000.0,
      setSpeedMultiplier: vi.fn(),
      lagrangePoints: null,
      history: [],
      clearHistory: vi.fn(),
      resetSimulation: vi.fn(),
      error: null,
      preset: 'earth-moon' as const,
      setPreset: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue}>
        <Layout />
      </simulationContext.Provider>,
    );

    // Assert main header text
    expect(screen.getByText('Restricted 3-Body Planet Simulation')).toBeDefined();
    expect(screen.getByText('Simulates orbital mechanics of a test particle in a primary/secondary gravitational system.')).toBeDefined();

    // Assert children are rendered
    expect(screen.getByText('Simulation System')).toBeDefined();
  });
});
