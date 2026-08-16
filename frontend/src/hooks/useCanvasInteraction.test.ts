import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasInteraction } from './useCanvasInteraction';
import { simulationContext, DEFAULT_INITIAL_STATE } from '../context/SimulationContext';
import { SandboxBody } from '../types';

const trackedBody: SandboxBody = { id: 'body-0', position: [1e8, 2e8], velocity: [0, 0], mass: 1e24, radius: 1e6, color: '#fff', name: 'Tracked' };

function makeCanvasRef(): React.RefObject<HTMLCanvasElement | null> {
  const el = document.createElement('canvas');
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) });
  return { current: el };
}

function renderWithContext(mode: 'sandbox' | '3body', bodies: SandboxBody[]) {
  const canvasRef = makeCanvasRef();
  let contextValue = {
    currentState: { ...DEFAULT_INITIAL_STATE, bodies },
    setSelectedBodyId: vi.fn(),
    sandboxBodies: bodies,
    mode,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(simulationContext.Provider, { value: contextValue as any }, children);

  const { result, rerender } = renderHook(() => useCanvasInteraction({ canvasRef }), { wrapper });

  const setCurrentState = (bodies: SandboxBody[]) => {
    contextValue = { ...contextValue, currentState: { ...DEFAULT_INITIAL_STATE, bodies } };
    rerender();
  };

  return { result, setCurrentState };
}

describe('useCanvasInteraction tracking (FP-36)', () => {
  it('toggles a body in and out of trackedBodyId', () => {
    const { result } = renderWithContext('sandbox', [trackedBody]);

    expect(result.current.trackedBodyId).toBeNull();
    act(() => result.current.toggleTracking(trackedBody));
    expect(result.current.trackedBodyId).toBe('body-0');
    act(() => result.current.toggleTracking(trackedBody));
    expect(result.current.trackedBodyId).toBeNull();
  });

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

  it('clears tracking when the tracked body no longer exists', () => {
    const { result, setCurrentState } = renderWithContext('sandbox', [trackedBody]);
    act(() => result.current.toggleTracking(trackedBody));
    expect(result.current.trackedBodyId).toBe('body-0');

    setCurrentState([]);
    expect(result.current.trackedBodyId).toBeNull();
  });
});
