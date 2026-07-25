import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SimulationProvider, useSimulationContext } from './SimulationContext';

// Helper component to consume context and expose fields for assertion
function TestConsumer() {
  const {
    currentState,
    isPaused,
    setIsPaused,
    speedMultiplier,
    setSpeedMultiplier,
    resetSimulation,
    history,
  } = useSimulationContext();

  return (
    <div>
      <span data-testid="time">{currentState.time}</span>
      <span data-testid="paused">{isPaused ? 'paused' : 'running'}</span>
      <span data-testid="speed">{speedMultiplier}</span>
      <span data-testid="history-len">{history.length}</span>
      <button data-testid="btn-toggle" onClick={() => setIsPaused(!isPaused)}>Toggle</button>
      <button data-testid="btn-speed" onClick={() => setSpeedMultiplier(20000)}>Speed</button>
      <button data-testid="btn-reset" onClick={resetSimulation}>Reset</button>
    </div>
  );
}

describe('SimulationContext and SimulationProvider', () => {
  it('should provide default simulation state and update values', () => {
    render(
      <SimulationProvider>
        <TestConsumer />
      </SimulationProvider>
    );

    // Assert defaults
    expect(screen.getByTestId('time').textContent).toBe('0');
    expect(screen.getByTestId('paused').textContent).toBe('paused'); // Default is paused (true)
    expect(screen.getByTestId('speed').textContent).toBe('10000');
    expect(screen.getByTestId('history-len').textContent).toBe('1'); // Initial particle position

    // Toggle paused state
    act(() => {
      screen.getByTestId('btn-toggle').click();
    });
    expect(screen.getByTestId('paused').textContent).toBe('running');

    // Update speed multiplier
    act(() => {
      screen.getByTestId('btn-speed').click();
    });
    expect(screen.getByTestId('speed').textContent).toBe('20000');

    // Trigger reset
    act(() => {
      screen.getByTestId('btn-reset').click();
    });
    expect(screen.getByTestId('history-len').textContent).toBe('1');
  });
});
