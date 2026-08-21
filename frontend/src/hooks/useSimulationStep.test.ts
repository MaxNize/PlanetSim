import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulationStep } from './useSimulationStep';
import { SimulatorBridge, StepResult } from '../services/wasmBridge';

function mockRequestAnimationFrame() {
  let requestFrameCallback: FrameRequestCallback | null = null;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    requestFrameCallback = cb;
    return 1;
  });
  return {
    fire: (time: number) => requestFrameCallback?.(time),
  };
}

describe('useSimulationStep hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('steps the simulator, scales dt by the speed multiplier, and records the result', () => {
    const stepResult = { time: 1.0 } as unknown as StepResult;
    const simulator = { step: vi.fn(() => stepResult) } as unknown as SimulatorBridge;
    const onStep = vi.fn();

    const raf = mockRequestAnimationFrame();
    const { result } = renderHook(() => useSimulationStep(simulator, false, 2, onStep));

    act(() => {
      raf.fire(1000.0);
      raf.fire(1016.7);
    });

    expect(simulator.step).toHaveBeenCalledTimes(1);
    expect(simulator.step).toHaveBeenCalledWith(expect.closeTo(0.0334, 3));
    expect(onStep).toHaveBeenCalledWith(stepResult);
    expect(result.current.stepResult).toBe(stepResult);
  });

  it('breaks a large scaled time step into bounded sub-steps instead of one huge leap', () => {
    const stepResult = { time: 1.0 } as unknown as StepResult;
    const simulator = { step: vi.fn(() => stepResult) } as unknown as SimulatorBridge;

    const raf = mockRequestAnimationFrame();
    // dt ~0.0167s * 10000x speed ~= 167s of simulation time in one frame.
    const { result } = renderHook(() => useSimulationStep(simulator, false, 10000));

    act(() => {
      raf.fire(1000.0);
      raf.fire(1016.7);
    });

    const calls = (simulator.step as ReturnType<typeof vi.fn>).mock.calls as [number][];
    expect(calls.length).toBeGreaterThan(1);
    calls.forEach(([subDt]) => expect(subDt).toBeLessThanOrEqual(5));
    const total = calls.reduce((sum, [subDt]) => sum + subDt, 0);
    expect(total).toBeCloseTo(0.0167 * 10000, 0);
    expect(result.current.stepResult).toBe(stepResult);
  });

  it('does nothing when the simulator is null', () => {
    const raf = mockRequestAnimationFrame();
    const { result } = renderHook(() => useSimulationStep(null, false, 1));

    act(() => {
      raf.fire(1000.0);
      raf.fire(1016.7);
    });

    expect(result.current.stepResult).toBeNull();
  });

  it('does not throw and logs when a step fails', () => {
    const simulator = {
      step: vi.fn(() => {
        throw new Error('boom');
      }),
    } as unknown as SimulatorBridge;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const raf = mockRequestAnimationFrame();
    const { result } = renderHook(() => useSimulationStep(simulator, false, 1));

    act(() => {
      raf.fire(1000.0);
      raf.fire(1016.7);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Simulation step failed:', expect.any(Error));
    expect(result.current.stepResult).toBeNull();
  });
});
