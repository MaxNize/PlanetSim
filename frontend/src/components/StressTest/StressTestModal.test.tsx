import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { simulationContext } from '../../context/SimulationContext';
import { simulationAnimationContext } from '../../context/SimulationAnimationContext';
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
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders stress test title and workload controls', () => {
    const mockContextValue = {
      mode: 'sandbox' as const,
      setMode: vi.fn(),
      currentState: mockState,
      addBodies: vi.fn(),
      fps: 60,
      isPaused: true,
      setIsPaused: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <simulationAnimationContext.Provider value={mockContextValue as any}>
          <StressTestModal onClose={vi.fn()} />
        </simulationAnimationContext.Provider>
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
      addBodies: vi.fn(),
      fps: 60,
      isPaused: true,
      setIsPaused: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <simulationAnimationContext.Provider value={mockContextValue as any}>
          <StressTestModal onClose={onClose} />
        </simulationAnimationContext.Provider>
      </simulationContext.Provider>,
    );

    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('triggers quick spawn buttons to add bodies in bulk', () => {
    const addBodies = vi.fn();
    const setMode = vi.fn();
    const setIsPaused = vi.fn();

    const mockContextValue = {
      mode: 'sandbox' as const,
      setMode,
      currentState: mockState,
      addBodies,
      fps: 60,
      isPaused: true,
      setIsPaused,
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <simulationAnimationContext.Provider value={mockContextValue as any}>
          <StressTestModal onClose={vi.fn()} />
        </simulationAnimationContext.Provider>
      </simulationContext.Provider>,
    );

    fireEvent.click(screen.getByText('+50'));
    expect(addBodies).toHaveBeenCalled();
    expect(addBodies.mock.calls[0][0]).toHaveLength(50);
  });

  it('switches to sandbox mode and starts benchmark on click', () => {
    const setMode = vi.fn();
    const setIsPaused = vi.fn();
    const addBodies = vi.fn();

    const mockContextValue = {
      mode: '3body' as const,
      setMode,
      currentState: mockState,
      addBodies,
      fps: 60,
      isPaused: true,
      setIsPaused,
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <simulationAnimationContext.Provider value={mockContextValue as any}>
          <StressTestModal onClose={vi.fn()} />
        </simulationAnimationContext.Provider>
      </simulationContext.Provider>,
    );

    const startBtn = screen.getByText('▶ Run Auto Benchmark');
    fireEvent.click(startBtn);

    expect(setMode).toHaveBeenCalledWith('sandbox');
    expect(setIsPaused).toHaveBeenCalledWith(false);

    // Fast-forward step timer
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Benchmark Log History')).toBeDefined();
  });

  it('allows stopping an active benchmark', () => {
    const mockContextValue = {
      mode: 'sandbox' as const,
      setMode: vi.fn(),
      currentState: mockState,
      addBodies: vi.fn(),
      fps: 60,
      isPaused: true,
      setIsPaused: vi.fn(),
    };

    render(
      <simulationContext.Provider value={mockContextValue as any}>
        <simulationAnimationContext.Provider value={mockContextValue as any}>
          <StressTestModal onClose={vi.fn()} />
        </simulationAnimationContext.Provider>
      </simulationContext.Provider>,
    );

    fireEvent.click(screen.getByText('▶ Run Auto Benchmark'));
    expect(screen.getByText(/Stop Benchmark/)).toBeDefined();

    fireEvent.click(screen.getByText(/Stop Benchmark/));
    expect(screen.getByText('▶ Run Auto Benchmark')).toBeDefined();
  });

  it('records performance threshold result when FPS drops below 58 in later stages', () => {
    let currentFps = 60;
    const addBodies = vi.fn();

    const mockContextValue = {
      mode: 'sandbox' as const,
      setMode: vi.fn(),
      currentState: {
        ...mockState,
        bodies: new Array(50).fill(null).map((_, i) => ({ id: `${i}` })),
      },
      addBodies,
      get fps() {
        return currentFps;
      },
      isPaused: false,
      setIsPaused: vi.fn(),
    };

    const { rerender } = render(
      <simulationContext.Provider value={mockContextValue as any}>
        <simulationAnimationContext.Provider value={mockContextValue as any}>
          <StressTestModal onClose={vi.fn()} />
        </simulationAnimationContext.Provider>
      </simulationContext.Provider>,
    );

    fireEvent.click(screen.getByText('▶ Run Auto Benchmark'));

    // Baseline stage 0 (50 bodies, 60 FPS)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Drop FPS for step 1
    currentFps = 45;
    rerender(
      <simulationContext.Provider value={mockContextValue as any}>
        <simulationAnimationContext.Provider value={mockContextValue as any}>
          <StressTestModal onClose={vi.fn()} />
        </simulationAnimationContext.Provider>
      </simulationContext.Provider>,
    );

    // Step 1 stage (FPS < 58.0, triggers threshold)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/🎯/)).toBeDefined();
  });
});
