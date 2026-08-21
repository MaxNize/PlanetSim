import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { simulationContext } from '../../context/SimulationContext';
import { simulationAnimationContext } from '../../context/SimulationAnimationContext';
import { Simulator } from './Simulator';
import { SimulationState } from '../../services/wasmBridge';

const mockState: SimulationState = {
  primary: { position: [0.0, 0.0], velocity: [0.0, 0.0], mass: 5e24, radius: 6e6 },
  secondary: { position: [3e8, 0.0], velocity: [0.0, 1000.0], mass: 7e22, radius: 1e6 },
  testParticle: { position: [2e8, 0.0], velocity: [0.0, 500.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: 6.67e-11,
};

function makeContextValue(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

function renderSimulator(mockContextValue: Record<string, unknown>) {
  return render(
    <simulationContext.Provider value={mockContextValue as any}>
      <simulationAnimationContext.Provider value={mockContextValue as any}>
        <Simulator />
      </simulationAnimationContext.Provider>
    </simulationContext.Provider>,
  );
}

function placeBodyAndConfirm() {
  const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
  fireEvent.mouseDown(canvasElement, { button: 0, clientX: 1000, clientY: 1000 });
  fireEvent.mouseUp(canvasElement, { clientX: 1000, clientY: 1000 });
  fireEvent.click(screen.getByText('Confirm'));
}

describe('Simulator container component', () => {
  it('should render and bind to SimulationContext values', () => {
    renderSimulator(makeContextValue({ error: 'Mock engine error' }));

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
    renderSimulator(makeContextValue({ mode: 'sandbox', setMode: vi.fn(), sandboxBodies: [], addBody, removeBody: vi.fn(), updateBody: vi.fn(), selectedBodyId: null, setSelectedBodyId: vi.fn() }));

    placeBodyAndConfirm();

    expect(addBody).toHaveBeenCalled();
    expect(screen.getByText(/Maximum body count reached/)).toBeDefined();
  });

  it('shows an overlap toast when addBody throws an overlap error (FP-38)', () => {
    const addBody = vi.fn(() => {
      throw new Error('Overlap detected with another body');
    });
    renderSimulator(makeContextValue({ mode: 'sandbox', setMode: vi.fn(), sandboxBodies: [], addBody, removeBody: vi.fn(), updateBody: vi.fn(), selectedBodyId: null, setSelectedBodyId: vi.fn() }));

    placeBodyAndConfirm();

    expect(screen.getByText(/overlaps an existing one/)).toBeDefined();
  });

  it('shows the raw error message for an unrecognized addBody failure', () => {
    const addBody = vi.fn(() => {
      throw new Error('Something unexpected happened');
    });
    renderSimulator(makeContextValue({ mode: 'sandbox', setMode: vi.fn(), sandboxBodies: [], addBody, removeBody: vi.fn(), updateBody: vi.fn(), selectedBodyId: null, setSelectedBodyId: vi.fn() }));

    placeBodyAndConfirm();

    expect(screen.getByText(/Something unexpected happened/)).toBeDefined();
  });

  it('propagates mass1/mass2/distance edits from ParameterControls up through setInitialState', () => {
    const setInitialState = vi.fn();
    renderSimulator(makeContextValue({ setInitialState }));

    const [mass1Input, mass2Input, distInput] = screen.getAllByRole('textbox');

    fireEvent.change(mass1Input, { target: { value: '6e24' } });
    fireEvent.blur(mass1Input);
    expect(setInitialState).toHaveBeenLastCalledWith(expect.objectContaining({ primary: expect.objectContaining({ mass: 6e24 }) }));

    fireEvent.change(mass2Input, { target: { value: '8e22' } });
    fireEvent.blur(mass2Input);
    expect(setInitialState).toHaveBeenLastCalledWith(expect.objectContaining({ secondary: expect.objectContaining({ mass: 8e22 }) }));

    fireEvent.change(distInput, { target: { value: '4e8' } });
    fireEvent.blur(distInput);
    expect(setInitialState).toHaveBeenLastCalledWith(
      expect.objectContaining({
        secondary: expect.objectContaining({ position: [4e8, 0.0] }),
        testParticle: expect.objectContaining({ position: [4e8 * 0.78, 0.0] }),
      }),
    );
  });
});
