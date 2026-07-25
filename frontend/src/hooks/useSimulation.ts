import { useEffect, useState } from 'react';
import { SimulatorBridge, SimulationState } from '../services/wasmBridge';

/**
 * Custom hook that encapsulates the SimulatorBridge lifecycle.
 * Instantiates the WASM simulator when the initial state or resetCounter changes.
 *
 * @param initialState The initial parameters of the simulation.
 * @param resetCounter An incrementing counter used to force re-instantiation (reset).
 * @returns The simulator instance and any initialization errors.
 */
export function useSimulation(initialState: SimulationState, resetCounter: number) {
  const [simulator, setSimulator] = useState<SimulatorBridge | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sim = new SimulatorBridge(initialState);
      setSimulator(sim);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize simulator');
      setSimulator(null);
    }
  }, [initialState, resetCounter]);

  return { simulator, error };
}
