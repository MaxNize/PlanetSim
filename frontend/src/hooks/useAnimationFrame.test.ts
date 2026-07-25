import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnimationFrame } from './useAnimationFrame';

describe('useAnimationFrame hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should call callback on animation frame when active', () => {
    const callback = vi.fn();

    // Mock requestAnimationFrame to invoke the animate function inside the hook
    let requestFrameCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      requestFrameCallback = cb;
      return 1;
    });

    const { unmount } = renderHook(() => useAnimationFrame(callback, true));

    expect(window.requestAnimationFrame).toHaveBeenCalled();

    // Trigger animation frame callback twice to calculate dt
    if (requestFrameCallback) {
      (requestFrameCallback as FrameRequestCallback)(1000.0); // T1
    }
    if (requestFrameCallback) {
      (requestFrameCallback as FrameRequestCallback)(1016.7); // T2 (+16.7ms)
    }

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toBeCloseTo(0.0167, 4); // 16.7ms in seconds

    unmount();
  });

  it('should not request animation frame when inactive', () => {
    const callback = vi.fn();
    const requestSpy = vi.spyOn(window, 'requestAnimationFrame');

    renderHook(() => useAnimationFrame(callback, false));

    expect(requestSpy).not.toHaveBeenCalled();
  });
});
