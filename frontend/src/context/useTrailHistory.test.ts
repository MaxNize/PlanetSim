import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTrailHistory } from './useTrailHistory';
import { SimulationState } from '../services/wasmBridge';

function createState(overrides: Partial<SimulationState> = {}): SimulationState {
  return {
    primary: { position: [0, 0], velocity: [0, 0], mass: 1, radius: 1 },
    secondary: { position: [1, 1], velocity: [0, 0], mass: 1, radius: 1 },
    testParticle: { position: [2, 2], velocity: [0, 0], mass: 1, radius: 1 },
    time: 0,
    gravitationalConstant: 6.674e-11,
    ...overrides,
  };
}

describe('useTrailHistory hook', () => {
  it('initializes trail history with the initial positions', () => {
    const { result } = renderHook(() => useTrailHistory(createState()));
    expect(result.current.trailHistory.primary).toEqual([[0, 0]]);
    expect(result.current.trailHistory.secondary).toEqual([[1, 1]]);
    expect(result.current.trailHistory.testParticle).toEqual([[2, 2]]);
  });

  it('records fixed-body positions on each step', () => {
    const { result } = renderHook(() => useTrailHistory(createState()));

    act(() => {
      result.current.recordStep(createState({ primary: { position: [5, 5], velocity: [0, 0], mass: 1, radius: 1 } }));
    });

    expect(result.current.trailHistory.primary).toEqual([
      [0, 0],
      [5, 5],
    ]);
  });

  it('accumulates a custom sandbox body trail keyed by id and skips bodies without an id', () => {
    const { result } = renderHook(() => useTrailHistory(createState()));

    act(() => {
      result.current.recordStep(
        createState({
          bodies: [
            { id: 'a', position: [3, 3], velocity: [0, 0], mass: 1, radius: 1 },
            { position: [9, 9], velocity: [0, 0], mass: 1, radius: 1 },
          ],
        }),
      );
    });

    expect(result.current.trailHistory.customBodies).toEqual({ a: [[3, 3]] });
  });

  it('resets the trail history back to the given state', () => {
    const { result } = renderHook(() => useTrailHistory(createState()));

    act(() => {
      result.current.recordStep(createState({ primary: { position: [5, 5], velocity: [0, 0], mass: 1, radius: 1 } }));
    });
    act(() => {
      result.current.resetTrail(createState({ primary: { position: [7, 7], velocity: [0, 0], mass: 1, radius: 1 } }));
    });

    expect(result.current.trailHistory.primary).toEqual([[7, 7]]);
  });

  it('truncates existing history when the trail length is reduced', () => {
    const { result } = renderHook(() => useTrailHistory(createState()));

    act(() => {
      for (let i = 1; i <= 5; i++) {
        result.current.recordStep(createState({ primary: { position: [i, i], velocity: [0, 0], mass: 1, radius: 1 } }));
      }
    });
    act(() => {
      result.current.setTrailLength(2);
    });

    expect(result.current.trailHistory.primary).toEqual([
      [4, 4],
      [5, 5],
    ]);
    expect(result.current.trailLength).toBe(2);
  });
});
