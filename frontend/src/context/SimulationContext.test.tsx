import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useSimulationContext } from './SimulationContext';
import { useSimulationAnimation } from './SimulationAnimationContext';
import { SimulationProvider } from './SimulationProvider';

// Helper component to consume context and expose fields for assertion
function TestConsumer() {
  const { initialState, isPaused, setIsPaused, speedMultiplier, setSpeedMultiplier, resetSimulation, preset, setPreset } = useSimulationContext();
  const { currentState, history } = useSimulationAnimation();

  return (
    <div>
      <span data-testid="time">{currentState.time}</span>
      <span data-testid="paused">{isPaused ? 'paused' : 'running'}</span>
      <span data-testid="speed">{speedMultiplier}</span>
      <span data-testid="history-len">{history.length}</span>
      <span data-testid="preset">{preset}</span>
      <span data-testid="mass1">{initialState.primary.mass}</span>
      <button data-testid="btn-toggle" onClick={() => setIsPaused(!isPaused)}>
        Toggle
      </button>
      <button data-testid="btn-speed" onClick={() => setSpeedMultiplier(20000)}>
        Speed
      </button>
      <button data-testid="btn-reset" onClick={resetSimulation}>
        Reset
      </button>
      <button data-testid="btn-preset-binary" onClick={() => setPreset('binary-stars')}>
        Binary
      </button>
    </div>
  );
}

describe('useSimulationContext guard', () => {
  it('throws when used outside a SimulationProvider', () => {
    function Unwrapped() {
      useSimulationContext();
      return null;
    }
    expect(() => render(<Unwrapped />)).toThrow('useSimulationContext must be used within a SimulationProvider');
  });
});

describe('SimulationContext and SimulationProvider', () => {
  it('should provide default simulation state and update values', () => {
    render(
      <SimulationProvider>
        <TestConsumer />
      </SimulationProvider>,
    );

    // Assert defaults
    expect(screen.getByTestId('time').textContent).toBe('0');
    expect(screen.getByTestId('paused').textContent).toBe('paused'); // Default is paused (true)
    expect(screen.getByTestId('speed').textContent).toBe('10000');
    expect(screen.getByTestId('history-len').textContent).toBe('1'); // Initial particle position
    expect(screen.getByTestId('preset').textContent).toBe('earth-moon');

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

    // Set preset to binary-stars
    act(() => {
      screen.getByTestId('btn-preset-binary').click();
    });
    expect(screen.getByTestId('preset').textContent).toBe('binary-stars');
    expect(screen.getByTestId('mass1').textContent).toBe('1.989e+30');
    expect(screen.getByTestId('speed').textContent).toBe('20');
  });

  it('should update body parameters in sandbox mode while retaining real-time position', () => {
    function SandboxTestConsumer() {
      const { setMode, sandboxBodies, addBody, updateBody } = useSimulationContext();
      return (
        <div>
          <button data-testid="btn-mode-sandbox" onClick={() => setMode('sandbox')}>
            Sandbox Mode
          </button>
          <button
            data-testid="btn-add-body"
            onClick={() =>
              addBody({
                id: 'custom-1',
                position: [5e8, 1e8],
                velocity: [100, 200],
                mass: 1e24,
                radius: 1e6,
                color: '#ff0000',
              })
            }
          >
            Add Body
          </button>
          <button
            data-testid="btn-update-body"
            onClick={() =>
              updateBody('custom-1', {
                mass: 5e24,
                color: '#00ff00',
              })
            }
          >
            Update Body
          </button>
          <span data-testid="body-count">{sandboxBodies.length}</span>
          {sandboxBodies.map((b) => (
            <div key={b.id} data-testid={`body-${b.id}`}>
              {b.mass}:{b.position.join(',')}:{b.color}
            </div>
          ))}
        </div>
      );
    }

    render(
      <SimulationProvider>
        <SandboxTestConsumer />
      </SimulationProvider>,
    );

    act(() => {
      screen.getByTestId('btn-mode-sandbox').click();
    });

    act(() => {
      screen.getByTestId('btn-add-body').click();
    });

    expect(screen.getByTestId('body-custom-1').textContent).toBe('1e+24:500000000,100000000:#ff0000');

    act(() => {
      screen.getByTestId('btn-update-body').click();
    });

    expect(screen.getByTestId('body-custom-1').textContent).toBe('5e+24:500000000,100000000:#00ff00');
  });

  it('clears selectedBodyId once the selected body no longer exists in sandboxBodies', () => {
    function SelectionTestConsumer() {
      const { setMode, addBody, removeBody, selectedBodyId, setSelectedBodyId } = useSimulationContext();
      return (
        <div>
          <button data-testid="btn-mode-sandbox" onClick={() => setMode('sandbox')}>
            Sandbox Mode
          </button>
          <button
            data-testid="btn-add-body"
            onClick={() =>
              addBody({
                id: 'custom-1',
                position: [5e8, 1e8],
                velocity: [100, 200],
                mass: 1e24,
                radius: 1e6,
                color: '#ff0000',
              })
            }
          >
            Add Body
          </button>
          <button data-testid="btn-select" onClick={() => setSelectedBodyId('custom-1')}>
            Select
          </button>
          <button data-testid="btn-remove" onClick={() => removeBody('custom-1')}>
            Remove
          </button>
          <span data-testid="selected">{selectedBodyId ?? 'none'}</span>
        </div>
      );
    }

    render(
      <SimulationProvider>
        <SelectionTestConsumer />
      </SimulationProvider>,
    );

    act(() => screen.getByTestId('btn-mode-sandbox').click());
    act(() => screen.getByTestId('btn-add-body').click());
    act(() => screen.getByTestId('btn-select').click());
    expect(screen.getByTestId('selected').textContent).toBe('custom-1');

    act(() => screen.getByTestId('btn-remove').click());
    expect(screen.getByTestId('selected').textContent).toBe('none');
  });
});
