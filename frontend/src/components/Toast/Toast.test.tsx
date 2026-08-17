import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the message', () => {
    render(<Toast message="Overlap detected" onDismiss={vi.fn()} />);
    expect(screen.getByText(/Overlap detected/)).toBeDefined();
  });

  it('calls onDismiss after the configured duration', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Overlap detected" onDismiss={onDismiss} durationMs={1000} />);

    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('still dismisses on time even when the parent re-renders with a new onDismiss reference each time (regression)', () => {
    const dismissCalls: number[] = [];
    let renderCount = 0;
    const { rerender } = render(<Toast message="Overlap detected" onDismiss={() => dismissCalls.push(renderCount)} durationMs={1000} />);

    // Simulate a parent that re-renders every frame (e.g. Simulator during an active simulation step),
    // passing a brand-new inline onDismiss each time — this used to reset the timer forever.
    for (let i = 0; i < 15; i++) {
      renderCount = i;
      vi.advanceTimersByTime(50); // 15 * 50ms = 750ms total, still under the 1000ms duration
      rerender(<Toast message="Overlap detected" onDismiss={() => dismissCalls.push(renderCount)} durationMs={1000} />);
    }

    expect(dismissCalls).toHaveLength(0);
    vi.advanceTimersByTime(300); // crosses the 1000ms mark
    expect(dismissCalls).toHaveLength(1);
  });
});
