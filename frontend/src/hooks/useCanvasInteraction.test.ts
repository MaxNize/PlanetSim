import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasInteraction } from './useCanvasInteraction';
import { simulationContext, DEFAULT_INITIAL_STATE } from '../context/SimulationContext';
import { simulationAnimationContext } from '../context/SimulationAnimationContext';
import { SandboxBody } from '../types';

const trackedBody: SandboxBody = { id: 'body-0', position: [1e8, 2e8], velocity: [0, 0], mass: 1e24, radius: 1e6, color: '#fff', name: 'Tracked' };

function makeCanvasRef(): React.RefObject<HTMLCanvasElement | null> {
  const el = document.createElement('canvas');
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) });
  return { current: el };
}

// trackedBodyId now lives in SimulationContext (production: SimulationProvider via useBodyTracking, see
// useBodyTracking.test.ts for its own toggle/cleanup behavior). This harness stubs just enough of that
// contract — a mutable trackedBodyId plus setters that trigger a rerender — for useCanvasInteraction's
// own responsibility: reading it to pan the viewport, and clearing it when a manual pan drag starts.
function renderWithContext(mode: 'sandbox' | '3body', bodies: SandboxBody[]) {
  const canvasRef = makeCanvasRef();
  let rerenderFn: () => void = () => {};
  let contextValue: any = {
    currentState: { ...DEFAULT_INITIAL_STATE, bodies },
    setSelectedBodyId: vi.fn(),
    sandboxBodies: bodies,
    mode,
    trackedBodyId: null as string | null,
    setTrackedBodyId: (id: string | null) => {
      contextValue = { ...contextValue, trackedBodyId: id };
      rerenderFn();
    },
    toggleTracking: (body: SandboxBody) => {
      contextValue = { ...contextValue, trackedBodyId: contextValue.trackedBodyId === body.id ? null : body.id };
      rerenderFn();
    },
  };

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(simulationContext.Provider, { value: contextValue }, React.createElement(simulationAnimationContext.Provider, { value: contextValue }, children));

  const { result, rerender } = renderHook(() => useCanvasInteraction({ canvasRef }), { wrapper });
  rerenderFn = rerender;

  const setCurrentState = (bodies: SandboxBody[]) => {
    contextValue = { ...contextValue, currentState: { ...DEFAULT_INITIAL_STATE, bodies } };
    rerender();
  };

  return { result, setCurrentState };
}

describe('useCanvasInteraction tracking (FP-36)', () => {
  it('pans the viewport to follow the tracked body as its position updates', () => {
    const { result, setCurrentState } = renderWithContext('sandbox', [trackedBody]);

    act(() => result.current.toggleTracking(trackedBody));
    expect(result.current.viewport.pan).toEqual({ x: 1e8, y: 2e8 });

    setCurrentState([{ ...trackedBody, position: [3e8, 4e8] }]);
    expect(result.current.viewport.pan).toEqual({ x: 3e8, y: 4e8 });
  });

  it('stops tracking when the user starts a manual pan drag', () => {
    const { result } = renderWithContext('sandbox', [trackedBody]);
    act(() => result.current.toggleTracking(trackedBody));
    expect(result.current.trackedBodyId).toBe('body-0');

    act(() => result.current.handleMouseDown({ button: 1, clientX: 0, clientY: 0 } as any));
    expect(result.current.trackedBodyId).toBeNull();
  });
});
