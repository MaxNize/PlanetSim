import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      preset: 'earth-moon' as const,
      setPreset: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <Simulator />
      </simulationContext.Provider>,
    );

    // Assert container renders headings from presentational children
    expect(screen.getByText('Simulation System')).toBeDefined();
    expect(screen.getByText('Simulation Telemetry')).toBeDefined();

    // Assert Canvas renders
    expect(screen.getByLabelText('Celestial simulation rendering area')).toBeDefined();

    // Assert context errors are passed
    expect(screen.getByText('⚠️ Error: Mock engine error')).toBeDefined();
  });

  it('should show a toast instead of crashing when addBody throws (FP-38)', () => {
    const addBody = vi.fn(() => {
      throw new Error('Maximum 300 bodies reached');
    });
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
      error: null,
      preset: 'earth-moon' as const,
      setPreset: vi.fn(),
      mode: 'sandbox' as const,
      setMode: vi.fn(),
      sandboxBodies: [],
      addBody,
      removeBody: vi.fn(),
      updateBody: vi.fn(),
      selectedBodyId: null,
      setSelectedBodyId: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <Simulator />
      </simulationContext.Provider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    fireEvent.mouseDown(canvasElement, { button: 0, clientX: 1000, clientY: 1000 });
    fireEvent.mouseUp(canvasElement, { clientX: 1000, clientY: 1000 });
    fireEvent.click(screen.getByText('Confirm'));

    expect(addBody).toHaveBeenCalled();
    expect(screen.getByText(/Maximum body count reached/)).toBeDefined();
  });
});
