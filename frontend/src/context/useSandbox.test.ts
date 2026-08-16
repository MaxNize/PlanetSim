import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSandbox, MAX_SANDBOX_BODIES } from './useSandbox';
import { SandboxBody } from '../types';
import { SimulationState } from '../services/wasmBridge';

const baseState: SimulationState = {
  primary: { position: [0, 0], velocity: [0, 0], mass: 5e24, radius: 6e6 },
  secondary: { position: [3e8, 0], velocity: [0, 1000], mass: 7e22, radius: 1e6 },
  testParticle: { position: [2e8, 0], velocity: [0, 500], mass: 1, radius: 1 },
  time: 0,
  gravitationalConstant: 6.6743e-11,
};

function makeSpacedBody(index: number): SandboxBody {
  // Spread bodies far enough apart (1e8 m spacing) that overlap detection never triggers.
  return { id: `body-${index}`, position: [index * 1e8, 1e9], velocity: [0, 0], mass: 1e20, radius: 1e5, color: '#fff', name: `Body ${index}` };
}

function setupHook(initialBodies: SandboxBody[] = []) {
  let sandboxBodies = initialBodies;
  const setSandboxBodies = vi.fn((updater) => {
    sandboxBodies = typeof updater === 'function' ? updater(sandboxBodies) : updater;
  });
  const setCurrentState = vi.fn();
  const { result, rerender } = renderHook(() =>
    useSandbox(sandboxBodies, setSandboxBodies, { ...baseState, bodies: sandboxBodies }, setCurrentState, vi.fn(), vi.fn(), vi.fn(), vi.fn(), null),
  );
  return { result, rerender, getSandboxBodies: () => sandboxBodies };
}

describe('useSandbox addBody limit (FP-38)', () => {
  it('allows adding a body when under the limit', () => {
    const { result } = setupHook([makeSpacedBody(0)]);
    expect(() => act(() => result.current.addBody(makeSpacedBody(1)))).not.toThrow();
  });

  it('throws once MAX_SANDBOX_BODIES is reached', () => {
    const bodies = Array.from(Array(MAX_SANDBOX_BODIES).keys()).map((i) => makeSpacedBody(i));
    const { result } = setupHook(bodies);
    expect(() => act(() => result.current.addBody(makeSpacedBody(MAX_SANDBOX_BODIES)))).toThrow(`Maximum ${MAX_SANDBOX_BODIES} bodies reached`);
  });

  it('throws on overlap regardless of body count', () => {
    const existing = makeSpacedBody(0);
    const { result } = setupHook([existing]);
    const overlapping: SandboxBody = { ...existing, id: 'overlap', position: [...existing.position] };
    expect(() => act(() => result.current.addBody(overlapping))).toThrow('Overlap detected with another body');
  });
});
