import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBodyTracking } from './useBodyTracking';
import { SandboxBody, SimulationMode } from '../types';
import { SimulationState } from '../services/wasmBridge';

const baseState: SimulationState = {
  primary: { position: [0, 0], velocity: [0, 0], mass: 5e24, radius: 6e6 },
  secondary: { position: [3e8, 0], velocity: [0, 1000], mass: 7e22, radius: 1e6 },
  testParticle: { position: [2e8, 0], velocity: [0, 500], mass: 1, radius: 1 },
  time: 0,
  gravitationalConstant: 6.6743e-11,
};

const body: SandboxBody = { id: 'body-0', position: [1e8, 2e8], velocity: [0, 0], mass: 1e24, radius: 1e6, color: '#fff', name: 'Tracked' };

describe('useBodyTracking (FP-36)', () => {
  it('toggles a body in and out of trackedBodyId', () => {
    const { result } = renderHook(({ state }: { state: SimulationState }) => useBodyTracking(state, 'sandbox'), { initialProps: { state: { ...baseState, bodies: [body] } } });

    expect(result.current.trackedBodyId).toBeNull();
    act(() => result.current.toggleTracking(body));
    expect(result.current.trackedBodyId).toBe('body-0');
    act(() => result.current.toggleTracking(body));
    expect(result.current.trackedBodyId).toBeNull();
  });

  it('clears when the tracked body is removed', () => {
    const { result, rerender } = renderHook(({ state }: { state: SimulationState }) => useBodyTracking(state, 'sandbox'), { initialProps: { state: { ...baseState, bodies: [body] } } });

    act(() => result.current.toggleTracking(body));
    expect(result.current.trackedBodyId).toBe('body-0');

    rerender({ state: { ...baseState, bodies: [] } });
    expect(result.current.trackedBodyId).toBeNull();
  });

  it('clears when the mode changes', () => {
    const { result, rerender } = renderHook(({ state, mode }: { state: SimulationState; mode: SimulationMode }) => useBodyTracking(state, mode), {
      initialProps: { state: { ...baseState, bodies: [body] }, mode: 'sandbox' },
    });

    act(() => result.current.toggleTracking(body));
    expect(result.current.trackedBodyId).toBe('body-0');

    rerender({ state: { ...baseState, bodies: [body] }, mode: '3body' });
    expect(result.current.trackedBodyId).toBeNull();
  });
});
