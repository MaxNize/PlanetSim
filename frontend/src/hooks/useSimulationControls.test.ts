import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulationControls } from './useSimulationControls';

describe('useSimulationControls', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSimulationControls());
    expect(result.current.massM1).toBe(1e24);
    expect(result.current.distanceR).toBe(1e8);
  });

  it('should update massM1 state correctly', () => {
    const { result } = renderHook(() => useSimulationControls());

    act(() => {
      result.current.setMassM1(5e24);
    });

    expect(result.current.massM1).toBe(5e24);
  });

  it('should update distanceR state correctly', () => {
    const { result } = renderHook(() => useSimulationControls());

    act(() => {
      result.current.setDistanceR(2e8);
    });

    expect(result.current.distanceR).toBe(2e8);
  });
});
