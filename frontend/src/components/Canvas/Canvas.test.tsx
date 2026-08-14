import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    mode: '3body' as const,
    setMode: vi.fn(),
    sandboxBodies: [],
    addBody: vi.fn(),
    removeBody: vi.fn(),
    updateBody: vi.fn(),
    selectedBodyId: null,
    setSelectedBodyId: vi.fn(),
  };

  it('should render canvas element with appropriate attributes', () => {
    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <Canvas showTrail={true} />
      </simulationContext.Provider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    expect(canvasElement).toBeDefined();
    expect(canvasElement.tagName).toBe('CANVAS');
  });

  it('should not open the body context menu (edit/lock/delete) in preset (3body) mode', () => {
    const bodies = [
      { ...DEFAULT_INITIAL_STATE.primary, id: 'body-0', name: 'Primary' },
      { ...DEFAULT_INITIAL_STATE.secondary, id: 'body-1', name: 'Secondary' },
      { ...DEFAULT_INITIAL_STATE.testParticle, id: 'body-2', name: 'Test' },
    ];
    render(
      <simulationContext.Provider
        value={{ ...mockContextValue, mode: '3body', currentState: { ...DEFAULT_INITIAL_STATE, bodies } } as any}
      >
        <Canvas showTrail={true} />
      </simulationContext.Provider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    // Primary body sits at world (0, 0); with default viewport (scale 1e-6, pan {x:1.5e8,y:0})
    // and a zero-size jsdom bounding rect, clientX -150 / clientY 0 maps back to world (0, 0).
    fireEvent.contextMenu(canvasElement, { clientX: -150, clientY: 0 });

    expect(screen.queryByTestId('body-context-menu')).toBeNull();
  });

  it('should open the body context menu in sandbox mode', () => {
    const bodies = [{ ...DEFAULT_INITIAL_STATE.primary, id: 'body-0', name: 'Primary', color: '#fff' }];
    render(
      <simulationContext.Provider
        value={{ ...mockContextValue, mode: 'sandbox', currentState: { ...DEFAULT_INITIAL_STATE, bodies } } as any}
      >
        <Canvas showTrail={true} />
      </simulationContext.Provider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    fireEvent.contextMenu(canvasElement, { clientX: -150, clientY: 0 });

    expect(screen.queryByTestId('body-context-menu')).not.toBeNull();
  });
});
