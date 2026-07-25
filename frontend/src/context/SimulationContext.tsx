import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SimulationState, StepResult, LagrangePointSet } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';

// Default gravitational constant
const G = 6.6743e-11;

// Default initial state: Earth-Moon system
export const DEFAULT_INITIAL_STATE: SimulationState = {
  primary: {
    position: [0.0, 0.0],
    velocity: [0.0, 0.0],
    mass: 5.9722e24, // Earth mass in kg
    radius: 6.371e6,  // Earth radius in meters
  },
  secondary: {
    position: [3.844e8, 0.0], // Earth-Moon distance in meters
    velocity: [0.0, 1022.0], // Moon orbital speed in m/s
    mass: 7.3477e22, // Moon mass in kg
    radius: 1.737e6,  // Moon radius in meters
  },
  testParticle: {
    position: [3.0e8, 0.0], // Test particle position between Earth and Moon
    velocity: [0.0, 800.0],  // Test particle initial velocity
    mass: 1.0,               // Negligible mass
    radius: 1.0,
  },
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
  }, [simulator, initialState]);

  // Handle updates after each simulation step
  const handleStep = useCallback((result: StepResult) => {
    setCurrentState(result.newState);
    setHistory((prev) => [...prev, result.newState.testParticle.position]);
    if (simulator) {
      try {
        setLagrangePoints(simulator.getLagrangePoints());
      } catch (err) {
        console.error('Failed to compute Lagrange points during step:', err);
      }
    }
  }, [simulator]);

  // Run simulation stepping loop
  const { stepResult, setStepResult } = useSimulationStep(
    simulator,
    isPaused,
    speedMultiplier,
    handleStep
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const resetSimulation = useCallback(() => {
    setHistory([initialState.testParticle.position]);
    setStepResult(null);
    setResetCounter((prev) => prev + 1);
  }, [initialState, setStepResult]);

  return (
    <simulationContext.Provider
      value={{
        initialState,
        setInitialState,
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
