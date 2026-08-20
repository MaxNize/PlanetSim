import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { simulationContext } from '../../context/SimulationContext';
import { StressTestModal } from './StressTestModal';
import { SimulationState } from '../../services/wasmBridge';

const mockState: SimulationState = {
  primary: { position: [0.0, 0.0], velocity: [0.0, 0.0], mass: 5e24, radius: 6e6 },
  secondary: { position: [3e8, 0.0], velocity: [0.0, 1000.0], mass: 7e22, radius: 1e6 },
  testParticle: { position: [2e8, 0.0], velocity: [0.0, 500.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: 6.67e-11,
};

describe('StressTestModal component', () => {
  it('renders stress test title and workload controls', () => {
    const mockContextValue = {
      mode: 'sandbox' as const,
      setMode: vi.fn(),
      currentState: mockState,
      addBody: vi.fn(),
      fps: 60,
      isPaused: true,
      setIsPaused: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <StressTestModal onClose={vi.fn()} />
      </simulationContext.Provider>,
    );

    expect(screen.getByText('Performance Stress Test')).toBeDefined();
    expect(screen.getByText('60 FPS')).toBeDefined();
    expect(screen.getByText('▶ Run Auto Benchmark')).toBeDefined();
  });

  it('triggers onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const mockContextValue = {
      mode: 'sandbox' as const,
      setMode: vi.fn(),
      currentState: mockState,
      addBody: vi.fn(),
      fps: 60,
      isPaused: true,
      setIsPaused: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <StressTestModal onClose={onClose} />
      </simulationContext.Provider>,
    );

    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
