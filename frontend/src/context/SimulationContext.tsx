import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SimulationState, StepResult, LagrangePointSet } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';

// Default gravitational constant
const G = 6.6743e-11;

export const DEFAULT_INITIAL_STATE: SimulationState = {
  primary: { position: [0.0, 0.0], velocity: [0.0, 0.0], mass: 5.9722e24, radius: 6.371e6 },
  secondary: { position: [3.844e8, 0.0], velocity: [0.0, 1022.0], mass: 7.3477e22, radius: 1.737e6 },
  testParticle: { position: [3.0e8, 0.0], velocity: [0.0, 800.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: G,
};

export type PresetType = 'earth-moon' | 'binary-stars' | 'custom';

export const EARTH_MOON_PRESET: SimulationState = DEFAULT_INITIAL_STATE;

export const BINARY_STARS_PRESET: SimulationState = {
  primary: { position: [-5.0e8, 0.0], velocity: [0.0, -257635.0], mass: 1.989e30, radius: 6.9634e7 },
  secondary: { position: [5.0e8, 0.0], velocity: [0.0, 257635.0], mass: 1.989e30, radius: 6.9634e7 },
  testParticle: { position: [0.0, 4.33e8], velocity: [223120.0, 0.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: G,
};

export interface SimulationContextType {
  initialState: SimulationState;
  setInitialState: (state: SimulationState) => void;
  currentState: SimulationState;
  stepResult: StepResult | null;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (multiplier: number) => void;
  lagrangePoints: LagrangePointSet | null;
  history: [number, number][];
  clearHistory: () => void;
  resetSimulation: () => void;
  error: string | null;
  preset: PresetType;
  setPreset: (preset: PresetType) => void;
}

export const simulationContext = createContext<SimulationContextType | null>(null);

/**
 * Provider component that wraps the application and exposes the simulation state.
 *
 * @param props Component properties.
 * @param props.children React child elements.
 * @returns The context provider component.
 */
export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [initialState, setInitialState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [currentState, setCurrentState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(10000.0); // Default speedup factor
  const [history, setHistory] = useState<[number, number][]>([]);
  const [lagrangePoints, setLagrangePoints] = useState<LagrangePointSet | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [preset, setPresetState] = useState<PresetType>('earth-moon');

  // Manage simulator lifecycle
  const { simulator, error } = useSimulation(initialState, resetCounter);

  // Sync state and compute initial Lagrange points when simulator is (re)created
  useEffect(() => {
    setCurrentState(initialState);
    setHistory([initialState.testParticle.position]);
    if (simulator) {
      try {
        setLagrangePoints(simulator.getLagrangePoints());
      } catch (err) {
        console.error('Failed to compute initial Lagrange points:', err);
      }
    } else {
      setLagrangePoints(null);
    }
  }, [simulator]);

  // Handle updates after each simulation step
  const handleStep = useCallback(
    (result: StepResult) => {
      setCurrentState(result.newState);
      setHistory((prev) => [...prev, result.newState.testParticle.position]);
      if (simulator) {
        try {
          setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error('Failed to compute Lagrange points during step:', err);
        }
      }
    },
    [simulator],
  );

  // Run simulation stepping loop
  const { stepResult, setStepResult } = useSimulationStep(simulator, isPaused, speedMultiplier, handleStep);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const resetSimulation = useCallback(() => {
    setHistory([initialState.testParticle.position]);
    setStepResult(null);
    setResetCounter((prev) => prev + 1);
  }, [initialState, setStepResult]);

  // Set preset and reset simulator to the preset config
  const setPreset = useCallback(
    (p: PresetType) => {
      setPresetState(p);
      let newState: SimulationState;
      if (p === 'earth-moon') {
        newState = EARTH_MOON_PRESET;
        setSpeedMultiplier(10000.0);
      } else if (p === 'binary-stars') {
        newState = BINARY_STARS_PRESET;
        setSpeedMultiplier(20.0);
      } else {
        return;
      }
      setInitialState(newState);
      setCurrentState(newState);
      setHistory([newState.testParticle.position]);
      setIsPaused(true);
      setStepResult(null);
      setResetCounter((prev) => prev + 1);
    },
    [setStepResult],
  );

  // Custom setInitialState that marks preset as custom and syncs current state & WASM engine in-place
  const setInitialStateAndSync = useCallback(
    (state: SimulationState) => {
      setPresetState('custom');
      setInitialState(state);
      setCurrentState(state);
      if (simulator) {
        try {
          simulator.setState(state);
          // Force immediate recalculation of Lagrange points when masses update
          setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error('Failed to update simulator state in-place:', err);
        }
      }
    },
    [simulator],
  );

  return (
    <simulationContext.Provider
      value={{
        initialState,
        setInitialState: setInitialStateAndSync,
        currentState,
        stepResult,
        isPaused,
        setIsPaused,
        speedMultiplier,
        setSpeedMultiplier,
        lagrangePoints,
        history,
        clearHistory,
        resetSimulation,
        error,
        preset,
        setPreset,
      }}
    >
      {children}
    </simulationContext.Provider>
  );
}

export const useSimulationContext = () => {
  const context = useContext(simulationContext);
  if (!context) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
};
