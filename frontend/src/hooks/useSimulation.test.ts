import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSimulation } from './useSimulation';
import { SimulationState } from '../services/wasmBridge';

const createValidState = (): SimulationState => ({
  primary: { position: [0.0, 0.0], velocity: [0.0, 0.0], mass: 5.97e24, radius: 6e6 },
  secondary: { position: [3.8e8, 0.0], velocity: [0.0, 1000.0], mass: 7e22, radius: 1.7e6 },
  testParticle: { position: [3e8, 0.0], velocity: [0.0, 800.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: 6.674e-11,
});

describe('useSimulation hook', () => {
  it('should initialize SimulatorBridge successfully with valid state', () => {
    const state = createValidState();
    const { result } = renderHook(() => useSimulation(state, 0));

    expect(result.current.simulator).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return error on invalid state deserialization', () => {
    const invalidState = {
      ...createValidState(),

      primary: undefined as any,
    };
    
    const { result } = renderHook(() => useSimulation(invalidState, 0));

    expect(result.current.simulator).toBeNull();
    expect(result.current.error).not.toBeNull();
  });
});
