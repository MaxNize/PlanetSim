import { useEffect, useState, useRef } from 'react';
import { SimulatorBridge, SimulationState } from '../services/wasmBridge';

/**
 * Custom hook that encapsulates the SimulatorBridge lifecycle.
 * Instantiates the WASM simulator when the resetCounter changes.
 *
 * @param initialState The initial parameters of the simulation.
 * @param resetCounter An incrementing counter used to force re-instantiation (reset).
 * @returns The simulator instance and any initialization errors.
 */
export function useSimulation(initialState: SimulationState, resetCounter: number) {
  const [simulator, setSimulator] = useState<SimulatorBridge | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref of the initial state so we can access the latest values without triggering recreation
  const initialStateRef = useRef(initialState);
  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  useEffect(() => {
    try {
      const sim = new SimulatorBridge(initialStateRef.current);
      setSimulator(sim);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize simulator');
      setSimulator(null);
    }
  }, [resetCounter]);

  return { simulator, error };
}
