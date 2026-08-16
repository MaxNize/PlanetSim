import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMiniview } from './useMiniview';
import { SandboxBody, SimulationMode } from '../types';
import { SimulationState } from '../services/wasmBridge';

const baseState: SimulationState = {
  primary: { position: [0, 0], velocity: [0, 0], mass: 5e24, radius: 6e6 },
  secondary: { position: [3e8, 0], velocity: [0, 1000], mass: 7e22, radius: 1e6 },
  testParticle: { position: [2e8, 0], velocity: [0, 500], mass: 1, radius: 1 },
  time: 0,
  gravitationalConstant: 6.6743e-11,
};

const body: SandboxBody = { id: 'body-0', position: [1e8, 2e8], velocity: [0, 0], mass: 1e24, radius: 1e6, color: '#fff', name: 'Focus Body' };

describe('useMiniview (FP-37)', () => {
  it('toggles a body in and out of miniviewBodyId', () => {
    const { result, rerender } = renderHook(({ state }) => useMiniview(state, 'sandbox'), { initialProps: { state: { ...baseState, bodies: [body] } } });

    expect(result.current.miniviewBodyId).toBeNull();
    act(() => result.current.toggleMiniview(body));
    expect(result.current.miniviewBodyId).toBe('body-0');
    rerender({ state: { ...baseState, bodies: [body] } });
    act(() => result.current.toggleMiniview(body));
    expect(result.current.miniviewBodyId).toBeNull();
  });

  it('clears when the miniview body is removed', () => {
    const { result, rerender } = renderHook(({ state }) => useMiniview(state, 'sandbox'), { initialProps: { state: { ...baseState, bodies: [body] } } });

    act(() => result.current.toggleMiniview(body));
    expect(result.current.miniviewBodyId).toBe('body-0');

    rerender({ state: { ...baseState, bodies: [] } });
    expect(result.current.miniviewBodyId).toBeNull();
  });

  it('clears when the mode changes', () => {
    const { result, rerender } = renderHook(({ state, mode }: { state: SimulationState; mode: SimulationMode }) => useMiniview(state, mode), {
      initialProps: { state: { ...baseState, bodies: [body] }, mode: 'sandbox' },
    });

    act(() => result.current.toggleMiniview(body));
    expect(result.current.miniviewBodyId).toBe('body-0');

    rerender({ state: { ...baseState, bodies: [body] }, mode: '3body' });
    expect(result.current.miniviewBodyId).toBeNull();
  });
});
