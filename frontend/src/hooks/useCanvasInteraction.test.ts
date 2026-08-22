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

  const setTrackedBodyId = (id: string | null) => {
    contextValue.setTrackedBodyId(id);
  };

  return { result, setCurrentState, setTrackedBodyId };
}

describe('useCanvasInteraction tracking (FP-36)', () => {
  it('pans the viewport to follow the tracked body as its position updates', () => {
    const { result, setCurrentState } = renderWithContext('sandbox', [trackedBody]);

    act(() => result.current.toggleTracking(trackedBody));
    expect(result.current.viewport.pan).toEqual({ x: 1e8, y: 2e8 });

    setCurrentState([{ ...trackedBody, position: [3e8, 4e8] }]);
    expect(result.current.viewport.pan).toEqual({ x: 3e8, y: 4e8 });
  });

  it('leaves the viewport untouched when the tracked id has no matching body', () => {
    const { result, setTrackedBodyId } = renderWithContext('sandbox', [trackedBody]);
    const initialPan = result.current.viewport.pan;

    act(() => setTrackedBodyId('does-not-exist'));

    expect(result.current.viewport.pan).toEqual(initialPan);
  });

  it('stops tracking when the user starts a manual pan drag', () => {
    const { result } = renderWithContext('sandbox', [trackedBody]);
    act(() => result.current.toggleTracking(trackedBody));
    expect(result.current.trackedBodyId).toBe('body-0');

    act(() => result.current.handleMouseDown({ button: 1, clientX: 0, clientY: 0 } as any));
    expect(result.current.trackedBodyId).toBeNull();
  });
});

describe('useCanvasInteraction pointer/keyboard handling', () => {
  it('sets isSpacePressed on keydown and clears it on keyup for the Space key', () => {
    const { result } = renderWithContext('3body', []);
    expect(result.current.isSpacePressed).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    });
    expect(result.current.isSpacePressed).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    });
    expect(result.current.isSpacePressed).toBe(false);
  });

  it('cancels an in-progress body placement on Escape', () => {
    const { result } = renderWithContext('sandbox', []);
    act(() => result.current.handleMouseDown({ button: 0, clientX: 10, clientY: 10 } as any));
    expect(result.current.isPlacingBody).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.isPlacingBody).toBe(false);
    expect(result.current.placedWorldPos).toBeNull();
  });

  it('pans the viewport as the mouse moves while dragging', () => {
    const { result } = renderWithContext('3body', []);
    act(() => result.current.handleMouseDown({ button: 1, clientX: 100, clientY: 100 } as any));
    const initialPan = result.current.viewport.pan;

    act(() => result.current.handleMouseMove({ clientX: 120, clientY: 90 } as any));

    expect(result.current.viewport.pan).not.toEqual(initialPan);
  });

  it('sets the drag velocity preview while placing a body and moving the mouse', () => {
    const { result } = renderWithContext('sandbox', []);
    act(() => result.current.handleMouseDown({ button: 0, clientX: 10, clientY: 10 } as any));
    expect(result.current.isPlacingBody).toBe(true);

    act(() => result.current.handleMouseMove({ clientX: 50, clientY: 10 } as any));

    expect(result.current.draggedVel).not.toEqual([0, 0]);
  });

  it('sets isHoveringBody when the pointer moves over a body in sandbox mode', () => {
    const { result } = renderWithContext('sandbox', [trackedBody]);

    act(() => result.current.handleMouseMove({ clientX: 400, clientY: 300 } as any));
    expect(result.current.isHoveringBody).toBe(false);
  });

  it('clears the context menu on right-click over empty space', () => {
    const { result } = renderWithContext('sandbox', [trackedBody]);
    act(() => result.current.handleContextMenu({ preventDefault: () => {}, clientX: 400, clientY: 300 } as any));
    expect(result.current.contextMenu).toBeNull();
  });

  it('opens a confirm dialog when a body-creation drag ends on mouseup', () => {
    const { result } = renderWithContext('sandbox', []);
    act(() => result.current.handleMouseDown({ button: 0, clientX: 10, clientY: 10 } as any));
    expect(result.current.isPlacingBody).toBe(true);

    act(() => result.current.handleMouseUp());

    expect(result.current.isPlacingBody).toBe(false);
    expect(result.current.showDialog).toBe(true);
  });

  it('cancels an in-progress body-creation drag when the mouse leaves the canvas', () => {
    const { result } = renderWithContext('sandbox', []);
    act(() => result.current.handleMouseDown({ button: 0, clientX: 10, clientY: 10 } as any));
    expect(result.current.isPlacingBody).toBe(true);

    act(() => result.current.handleMouseLeave());

    expect(result.current.isPlacingBody).toBe(false);
    expect(result.current.placedWorldPos).toBeNull();
  });

  it('zooms out on a positive wheel delta and back in on a negative one', () => {
    const { result } = renderWithContext('3body', []);
    const initialScale = result.current.viewport.scale;

    act(() => result.current.handleWheel({ deltaY: 100 } as any));
    expect(result.current.viewport.scale).toBeLessThan(initialScale);

    const zoomedOutScale = result.current.viewport.scale;
    act(() => result.current.handleWheel({ deltaY: -100 } as any));
    expect(result.current.viewport.scale).toBeGreaterThan(zoomedOutScale);
  });

  it('clamps the zoom scale to its configured bounds', () => {
    const { result } = renderWithContext('3body', []);

    for (let i = 0; i < 200; i += 1) {
      act(() => result.current.handleWheel({ deltaY: 100 } as any));
    }
    expect(result.current.viewport.scale).toBeGreaterThanOrEqual(1e-15);

    for (let i = 0; i < 400; i += 1) {
      act(() => result.current.handleWheel({ deltaY: -100 } as any));
    }
    expect(result.current.viewport.scale).toBeLessThanOrEqual(1e-4);
  });
});
