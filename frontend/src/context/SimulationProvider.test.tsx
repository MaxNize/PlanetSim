import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useSimulationContext } from './SimulationContext';
import { DEFAULT_INITIAL_STATE } from './presets';
import { SimulationProvider } from './SimulationProvider';

const mockSimulator = {
  getLagrangePoints: vi.fn(() => ({ l1: [1, 0], l2: [2, 0], l3: [3, 0], l4: [4, 0], l5: [5, 0] })),
  setState: vi.fn(),
};

vi.mock('../hooks/useSimulation', () => ({
  useSimulation: () => ({ simulator: mockSimulator, error: null }),
}));

function TestConsumer() {
  const { setInitialState } = useSimulationContext();
  return (
    <button data-testid="btn-set-state" onClick={() => setInitialState({ ...DEFAULT_INITIAL_STATE, time: 42 })}>
      Set
    </button>
  );
}

describe('SimulationProvider error handling', () => {
  afterEach(() => {
    mockSimulator.getLagrangePoints.mockClear();
    mockSimulator.setState.mockClear();
    mockSimulator.getLagrangePoints.mockImplementation(() => ({ l1: [1, 0], l2: [2, 0], l3: [3, 0], l4: [4, 0], l5: [5, 0] }));
    mockSimulator.setState.mockImplementation(() => {});
  });

  it('logs and recovers when the simulator throws while refreshing Lagrange points on mount', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSimulator.getLagrangePoints.mockImplementation(() => {
      throw new Error('lagrange failure');
    });

    render(
      <SimulationProvider>
        <TestConsumer />
      </SimulationProvider>,
    );

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('logs and recovers when simulator.setState throws inside setInitialState', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSimulator.setState.mockImplementation(() => {
      throw new Error('setState failure');
    });

    render(
      <SimulationProvider>
        <TestConsumer />
      </SimulationProvider>,
    );
    consoleError.mockClear();

    act(() => {
      screen.getByTestId('btn-set-state').click();
    });

    expect(consoleError).toHaveBeenCalled();
    expect(mockSimulator.setState).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
