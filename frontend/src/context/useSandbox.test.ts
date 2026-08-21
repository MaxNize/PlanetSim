import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSandbox, MAX_SANDBOX_BODIES } from './useSandbox';
import { SandboxBody } from '../types';
import { SimulationState, SimulatorBridge } from '../services/wasmBridge';

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

function setupHook(initialBodies: SandboxBody[] = [], simulator: SimulatorBridge | null = null) {
  let sandboxBodies = initialBodies;
  const setSandboxBodies = vi.fn((updater) => {
    sandboxBodies = typeof updater === 'function' ? updater(sandboxBodies) : updater;
  });
  const setCurrentState = vi.fn();
  const { result, rerender } = renderHook(() => useSandbox(sandboxBodies, setSandboxBodies, { ...baseState, bodies: sandboxBodies }, setCurrentState, vi.fn(), vi.fn(), vi.fn(), vi.fn(), simulator));
  return { result, rerender, getSandboxBodies: () => sandboxBodies, setCurrentState };
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

describe('useSandbox removeBody', () => {
  it('removes the body with the matching id and keeps the rest', () => {
    const bodies = [makeSpacedBody(0), makeSpacedBody(1), makeSpacedBody(2)];
    const { result, getSandboxBodies } = setupHook(bodies);
    act(() => result.current.removeBody('body-1'));
    expect(getSandboxBodies().map((b) => b.id)).toEqual(['body-0', 'body-2']);
  });

  it('is a no-op when the id is not found', () => {
    const bodies = [makeSpacedBody(0)];
    const { result, getSandboxBodies } = setupHook(bodies);
    act(() => result.current.removeBody('does-not-exist'));
    expect(getSandboxBodies().map((b) => b.id)).toEqual(['body-0']);
  });
});

describe('useSandbox updateBody', () => {
  it('merges updates into the body with the matching id', () => {
    const bodies = [makeSpacedBody(0), makeSpacedBody(1)];
    const { result, getSandboxBodies } = setupHook(bodies);
    act(() => result.current.updateBody('body-1', { name: 'Renamed', mass: 5e21 }));
    const updated = getSandboxBodies().find((b) => b.id === 'body-1');
    expect(updated?.name).toBe('Renamed');
    expect(updated?.mass).toBe(5e21);
  });

  it('leaves other bodies unchanged', () => {
    const bodies = [makeSpacedBody(0), makeSpacedBody(1)];
    const { result, getSandboxBodies } = setupHook(bodies);
    act(() => result.current.updateBody('body-1', { name: 'Renamed' }));
    const untouched = getSandboxBodies().find((b) => b.id === 'body-0');
    expect(untouched?.name).toBe('Body 0');
  });

  it('uses the explicit velocity override when provided', () => {
    const bodies = [makeSpacedBody(0)];
    const { result, getSandboxBodies } = setupHook(bodies);
    act(() => result.current.updateBody('body-0', { velocity: [42, 42] }));
    expect(getSandboxBodies()[0].velocity).toEqual([42, 42]);
  });
});

describe('useSandbox addBodies', () => {
  it('appends all given bodies at once', () => {
    const { result, getSandboxBodies } = setupHook([makeSpacedBody(0)]);
    act(() => result.current.addBodies([makeSpacedBody(1), makeSpacedBody(2)]));
    expect(getSandboxBodies().map((b) => b.id)).toEqual(['body-0', 'body-1', 'body-2']);
  });

  it('throws when the bulk add would exceed the limit', () => {
    const bodies = Array.from(Array(MAX_SANDBOX_BODIES - 1).keys()).map((i) => makeSpacedBody(i));
    const { result } = setupHook(bodies);
    expect(() => act(() => result.current.addBodies([makeSpacedBody(9000), makeSpacedBody(9001)]))).toThrow(`Maximum ${MAX_SANDBOX_BODIES} bodies reached`);
  });
});

describe('useSandbox simulator sync', () => {
  it('logs and does not throw when simulator.setState fails during addBody', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const simulator = {
      setState: vi.fn(() => {
        throw new Error('boom');
      }),
    } as unknown as SimulatorBridge;
    const { result } = setupHook([makeSpacedBody(0)], simulator);

    expect(() => act(() => result.current.addBody(makeSpacedBody(1)))).not.toThrow();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('calls simulator.setState with the updated body list when adding a body', () => {
    const simulator = { setState: vi.fn() } as unknown as SimulatorBridge;
    const { result } = setupHook([makeSpacedBody(0)], simulator);

    act(() => result.current.addBody(makeSpacedBody(1)));

    expect(simulator.setState).toHaveBeenCalled();
  });
});
