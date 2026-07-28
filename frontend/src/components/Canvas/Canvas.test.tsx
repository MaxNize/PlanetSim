import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { simulationContext, DEFAULT_INITIAL_STATE } from '../../context/SimulationContext';
import { Canvas } from './Canvas';

describe('Canvas component', () => {
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
    history: [] as [number, number][],
    clearHistory: vi.fn(),
    resetSimulation: vi.fn(),
    error: null,
    preset: 'earth-moon' as const,
    setPreset: vi.fn(),
  };

  it('should render canvas element with appropriate attributes', () => {
    render(
      <simulationContext.Provider value={mockContextValue}>
        <Canvas showTrail={true} />
      </simulationContext.Provider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    expect(canvasElement).toBeDefined();
    expect(canvasElement.tagName).toBe('CANVAS');
  });
});
