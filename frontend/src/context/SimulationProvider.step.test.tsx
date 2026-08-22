import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SimulationProvider } from './SimulationProvider';
import { useSimulationContext } from './SimulationContext';
import { useSimulationAnimation } from './SimulationAnimationContext';
import { DEFAULT_INITIAL_STATE } from './presets';

const threeBodyStep = {
  newState: { ...DEFAULT_INITIAL_STATE, time: 1 },
  kineticEnergy: 1,
  potentialEnergy: 1,
};

const nBodyStep = {
  newState: {
    ...DEFAULT_INITIAL_STATE,
    time: 1,
    bodies: [
      { position: [1, 1] as [number, number], velocity: [0, 0] as [number, number], mass: 1, radius: 1 },
      { position: [2, 2] as [number, number], velocity: [0, 0] as [number, number], mass: 1, radius: 1 },
      { position: [3, 3] as [number, number], velocity: [0, 0] as [number, number], mass: 1, radius: 1 },
      { position: [4, 4] as [number, number], velocity: [0, 0] as [number, number], mass: 1, radius: 1, name: 'Extra' },
    ],
  },
  kineticEnergy: 1,
  potentialEnergy: 1,
};

const mockSimulator = {
  step: vi.fn(() => threeBodyStep),
  getLagrangePoints: vi.fn(() => ({ l1: [1, 0], l2: [2, 0], l3: [3, 0], l4: [4, 0], l5: [5, 0] })),
  setState: vi.fn(),
};

vi.mock('../hooks/useSimulation', () => ({
  useSimulation: () => ({ simulator: mockSimulator, error: null }),
}));

// useFps also drives its own requestAnimationFrame loop; stub it out so the mocked rAF
// callback captured below is unambiguously the simulation step loop's.
vi.mock('../hooks/useFps', () => ({
  useFps: () => ({ fps: 60, frameTimeMs: 16.7, status: 'smooth' as const }),
}));

function mockRequestAnimationFrame() {
  let cb: FrameRequestCallback | null = null;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((c) => {
    cb = c;
    return 1;
  });
  return { fire: (time: number) => cb?.(time) };
}

function TestConsumer() {
  const { setMode, setIsPaused } = useSimulationContext();
  const { currentState } = useSimulationAnimation();
  return (
    <div>
      <span data-testid="time">{currentState.time}</span>
      <span data-testid="bodies-len">{currentState.bodies?.length ?? 0}</span>
      <span data-testid="body0-id">{currentState.bodies?.[0]?.id ?? 'none'}</span>
      <span data-testid="body3-id">{currentState.bodies?.[3]?.id ?? 'none'}</span>
      <span data-testid="body3-name">{currentState.bodies?.[3]?.name ?? 'none'}</span>
      <button data-testid="btn-sandbox" onClick={() => setMode('sandbox')}>
        Sandbox
      </button>
      <button data-testid="btn-play" onClick={() => setIsPaused(false)}>
        Play
      </button>
    </div>
  );
}

describe('SimulationProvider handleStep', () => {
  beforeEach(() => {
    mockSimulator.step.mockImplementation(() => threeBodyStep);
    mockSimulator.getLagrangePoints.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('advances currentState and refreshes Lagrange points on each 3-body step', () => {
    const raf = mockRequestAnimationFrame();

    render(
      <SimulationProvider>
        <TestConsumer />
      </SimulationProvider>,
    );

    act(() => screen.getByTestId('btn-play').click());
    mockSimulator.getLagrangePoints.mockClear();

    act(() => {
      raf.fire(1000.0);
      raf.fire(1016.7);
    });

    expect(screen.getByTestId('time').textContent).toBe('1');
    expect(mockSimulator.getLagrangePoints).toHaveBeenCalled();
  });

  it('enriches N-body step results with sandbox body ids/names/colors in sandbox mode', () => {
    mockSimulator.step.mockImplementation(() => nBodyStep);
    const raf = mockRequestAnimationFrame();

    render(
      <SimulationProvider>
        <TestConsumer />
      </SimulationProvider>,
    );

    act(() => screen.getByTestId('btn-sandbox').click());
    act(() => screen.getByTestId('btn-play').click());

    act(() => {
      raf.fire(2000.0);
      raf.fire(2016.7);
    });

    expect(screen.getByTestId('bodies-len').textContent).toBe('4');
    expect(screen.getByTestId('body0-id').textContent).toBe('primary');
    // The 4th step body has no matching sandbox entry (only 3 exist after setMode('sandbox')),
    // so enrichBodies falls back to a generated id and keeps the step result's own name.
    expect(screen.getByTestId('body3-id').textContent).toBe('body-3');
    expect(screen.getByTestId('body3-name').textContent).toBe('Extra');
  });
});
