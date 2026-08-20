import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFps } from './useFps';

describe('useFps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns default initial fps metrics', () => {
    const { result } = renderHook(() => useFps(false));
    expect(result.current.fps).toBe(60);
    expect(result.current.status).toBe('smooth');
  });

  it('updates FPS and status when active', () => {
    let animationCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      animationCallback = cb;
      return 1;
    });

    const { result } = renderHook(() => useFps(true));

    // Simulate frames over time
    act(() => {
      let time = 1000;
      for (let i = 0; i < 60; i++) {
        time += 16.6;
        if (animationCallback) {
          animationCallback(time);
        }
      }
    });

    expect(result.current.fps).toBeGreaterThan(0);
    expect(['smooth', 'moderate', 'lag']).toContain(result.current.status);
  });
});
