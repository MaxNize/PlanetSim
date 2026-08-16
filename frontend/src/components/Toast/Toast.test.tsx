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
});
