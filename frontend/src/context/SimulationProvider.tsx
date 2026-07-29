import React, { useState, useCallback, useEffect } from 'react';
import { SimulationState, StepResult, LagrangePointSet } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';
import { TrailHistory, SimulationMode, SandboxBody } from '../types';
import { DEFAULT_INITIAL_STATE, PresetType, getPresetState } from './presets';
import { simulationContext } from './SimulationContext';
import { useSandbox } from './useSandbox';

const initTrail = (s: SimulationState): TrailHistory => ({
  primary: [s.primary.position],
  secondary: [s.secondary.position],
  testParticle: [s.testParticle.position],
  customBodies: {},
});

/**
 * Context provider that manages the simulation engine state and lifecycle.
 */
export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SimulationMode>('3body');
  const [sandboxBodies, setSandboxBodies] = useState<SandboxBody[]>([]);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [currentState, setCurrentState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(10000.0);
  const [trailHistory, setTrailHistory] = useState<TrailHistory>(() => initTrail(DEFAULT_INITIAL_STATE));
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [trailLength, setTrailLengthState] = useState<number>(1000);
  const [lagrangePoints, setLagrangePoints] = useState<LagrangePointSet | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [preset, setPresetState] = useState<PresetType>('earth-moon');

  const { simulator, error } = useSimulation(initialState, resetCounter);

  useEffect(() => {
    if (selectedBodyId && !sandboxBodies.some((b) => b.id === selectedBodyId)) {
      setSelectedBodyId(null);
    }
  }, [sandboxBodies, selectedBodyId]);

  useEffect(() => {
    setCurrentState(initialState);
    setTrailHistory(initTrail(initialState));
    if (simulator && mode === '3body') {
      try {
        setLagrangePoints(simulator.getLagrangePoints());
      } catch (err) {
        console.error(err);
      }
    } else {
      setLagrangePoints(null);
    }
  }, [simulator, mode]);

  const handleStep = useCallback(
    (result: StepResult) => {
      const enriched = { ...result.newState };
      if (enriched.bodies) {
        enriched.bodies = enriched.bodies.map((b: any, idx: number) => ({
          ...b,
          id: sandboxBodies[idx]?.id || `body-${idx}`,
          name: sandboxBodies[idx]?.name || b.name,
          color: sandboxBodies[idx]?.color || b.color,
          locked: sandboxBodies[idx]?.locked ?? b.locked,
        }));
      }
      setCurrentState(enriched);
      setTrailHistory((prev) => {
        const nextCustom: { [bodyId: string]: [number, number][] } = { ...(prev.customBodies || {}) };
        if (enriched.bodies) {
          enriched.bodies.forEach((b: any) => {
            nextCustom[b.id] = [...(nextCustom[b.id] || []), b.position].slice(-trailLength);
          });
        }
        return {
          primary: [...prev.primary, enriched.primary.position].slice(-trailLength),
          secondary: [...prev.secondary, enriched.secondary.position].slice(-trailLength),
          testParticle: [...prev.testParticle, enriched.testParticle.position].slice(-trailLength),
          customBodies: nextCustom,
        };
      });
      if (simulator && mode === '3body') {
        try {
          setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error(err);
        }
      }
    },
    [simulator, trailLength, sandboxBodies, mode],
  );

  const { stepResult, setStepResult } = useSimulationStep(simulator, isPaused, speedMultiplier, handleStep);

  const clearTrailHistory = useCallback(() => setTrailHistory(initTrail(currentState)), [currentState]);

  const setTrailLength = useCallback((len: number) => {
    setTrailLengthState(len);
    setTrailHistory((prev) => {
      const nextCustom: { [bodyId: string]: [number, number][] } = {};
      if (prev.customBodies) {
        Object.keys(prev.customBodies).forEach((k) => {
          nextCustom[k] = prev.customBodies![k].slice(-len);
        });
      }
      return {
        primary: prev.primary.slice(-len),
        secondary: prev.secondary.slice(-len),
        testParticle: prev.testParticle.slice(-len),
        customBodies: nextCustom,
      };
    });
  }, []);

  const resetSimulation = useCallback(() => {
    setTrailHistory(initTrail(initialState));
    setStepResult(null);
    setResetCounter((prev) => prev + 1);
  }, [initialState, setStepResult]);

  const setPreset = useCallback(
    (p: PresetType) => {
      const data = getPresetState(p);
      if (!data) return;
      setPresetState(p);
      setSpeedMultiplier(data.speed);
      setInitialState(data.state);
      setCurrentState(data.state);
      setTrailHistory(initTrail(data.state));
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
          if (mode === '3body') setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error(err);
        }
      }
    },
    [simulator, mode],
  );

  const { setMode, addBody, removeBody, updateBody } = useSandbox(sandboxBodies, setSandboxBodies, currentState, setCurrentState, setInitialState, setIsPaused, setStepResult, setModeState, simulator);

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
        mode,
        setMode,
        sandboxBodies,
        addBody,
        removeBody,
        updateBody,
        selectedBodyId,
        setSelectedBodyId,
      }}
    >
      {children}
    </simulationContext.Provider>
  );
}
