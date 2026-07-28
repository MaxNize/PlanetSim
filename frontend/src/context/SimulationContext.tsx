import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SimulationState, StepResult, LagrangePointSet } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';
import { TrailHistory } from '../types';
import { DEFAULT_INITIAL_STATE, PresetType, EARTH_MOON_PRESET, BINARY_STARS_PRESET } from './presets';
export { DEFAULT_INITIAL_STATE, EARTH_MOON_PRESET, BINARY_STARS_PRESET };
export type { PresetType };

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
  trailHistory: TrailHistory;
  clearTrailHistory: () => void;
  history: [number, number][]; // Backwards compatibility
  clearHistory: () => void; // Backwards compatibility
  showTrail: boolean;
  setShowTrail: (show: boolean) => void;
  trailLength: number;
  setTrailLength: (length: number) => void;
  resetSimulation: () => void;
  error: string | null;
  preset: PresetType;
  setPreset: (preset: PresetType) => void;
}

export const simulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [initialState, setInitialState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [currentState, setCurrentState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(10000.0);
  const [trailHistory, setTrailHistory] = useState<TrailHistory>(() => ({
    primary: [DEFAULT_INITIAL_STATE.primary.position],
    secondary: [DEFAULT_INITIAL_STATE.secondary.position],
    testParticle: [DEFAULT_INITIAL_STATE.testParticle.position],
  }));
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [trailLength, setTrailLengthState] = useState<number>(1000);
  const [lagrangePoints, setLagrangePoints] = useState<LagrangePointSet | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [preset, setPresetState] = useState<PresetType>('earth-moon');

  const { simulator, error } = useSimulation(initialState, resetCounter);

  useEffect(() => {
    setCurrentState(initialState);
    setTrailHistory({
      primary: [initialState.primary.position],
      secondary: [initialState.secondary.position],
      testParticle: [initialState.testParticle.position],
    });
    if (simulator) {
      try {
        setLagrangePoints(simulator.getLagrangePoints());
      } catch (err) {
        console.error(err);
      }
    } else {
      setLagrangePoints(null);
    }
  }, [simulator]);

  const handleStep = useCallback(
    (result: StepResult) => {
      setCurrentState(result.newState);
      setTrailHistory((prev) => ({
        primary: [...prev.primary, result.newState.primary.position].slice(-trailLength),
        secondary: [...prev.secondary, result.newState.secondary.position].slice(-trailLength),
        testParticle: [...prev.testParticle, result.newState.testParticle.position].slice(-trailLength),
      }));
      if (simulator) {
        try {
          setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error(err);
        }
      }
    },
    [simulator, trailLength],
  );

  const { stepResult, setStepResult } = useSimulationStep(simulator, isPaused, speedMultiplier, handleStep);

  const clearTrailHistory = useCallback(() => {
    const s = currentState;
    setTrailHistory({ primary: [s.primary.position], secondary: [s.secondary.position], testParticle: [s.testParticle.position] });
  }, [currentState]);

  const setTrailLength = useCallback((len: number) => {
    setTrailLengthState(len);
    setTrailHistory((prev) => ({
      primary: prev.primary.slice(-len),
      secondary: prev.secondary.slice(-len),
      testParticle: prev.testParticle.slice(-len),
    }));
  }, []);

  const resetSimulation = useCallback(() => {
    setTrailHistory({
      primary: [initialState.primary.position],
      secondary: [initialState.secondary.position],
      testParticle: [initialState.testParticle.position],
    });
    setStepResult(null);
    setResetCounter((prev) => prev + 1);
  }, [initialState, setStepResult]);

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
      setTrailHistory({
        primary: [newState.primary.position],
        secondary: [newState.secondary.position],
        testParticle: [newState.testParticle.position],
      });
      setIsPaused(true);
      setStepResult(null);
      setResetCounter((prev) => prev + 1);
    },
    [setStepResult],
  );

  const setInitialStateAndSync = useCallback(
    (state: SimulationState) => {
      setPresetState('custom');
      setInitialState(state);
      setCurrentState(state);
      if (simulator) {
        try {
          simulator.setState(state);
          setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error(err);
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
        trailHistory,
        clearTrailHistory,
        history: trailHistory.testParticle,
        clearHistory: clearTrailHistory,
        showTrail,
        setShowTrail,
        trailLength,
        setTrailLength,
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
  if (!context) throw new Error('useSimulationContext must be used within a SimulationProvider');
  return context;
};
