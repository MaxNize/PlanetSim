import React, { useState, useCallback, useEffect } from 'react';
import { SimulationState, StepResult, LagrangePointSet, Body, SimulatorBridge } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';
import { SimulationMode, SandboxBody } from '../types';
import { DEFAULT_INITIAL_STATE, PresetType, getPresetState } from './presets';
import { simulationContext } from './SimulationContext';
import { useSandbox } from './useSandbox';
import { useTrailHistory } from './useTrailHistory';

function enrichBodies(
  bodies: (Body & { id?: string; name?: string; color?: string; locked?: boolean })[],
  sandboxBodies: SandboxBody[],
): (Body & { id: string; name?: string; color?: string; locked?: boolean })[] {
  // Fallback merge of 4 independently-optional fields; each ?? / || is a real, distinct data-source choice.
  // fallow-ignore-next-line complexity
  return bodies.map((b, idx) => ({
    ...b,
    id: sandboxBodies[idx]?.id || `body-${idx}`,
    name: sandboxBodies[idx]?.name || b.name,
    color: sandboxBodies[idx]?.color || b.color,
    locked: sandboxBodies[idx]?.locked ?? b.locked,
  }));
}

/** Recomputes Lagrange points from the simulator, logging (not throwing) on failure. */
function refreshLagrangePoints(simulator: SimulatorBridge, setLagrangePoints: (points: LagrangePointSet | null) => void): void {
  try {
    setLagrangePoints(simulator.getLagrangePoints());
  } catch (err) {
    console.error(err);
  }
}

/**
 * Context provider that manages the simulation engine state and lifecycle.
 */
// This is the app's single top-level state provider; its high hook count is the React context-provider
// pattern itself (one useState/useCallback per piece of shared state), not accidental branching — the
// preset/sandbox/trail concerns already extracted into useSandbox/useTrailHistory/presets are as far as
// this can be decomposed without prop-drilling multiple contexts through every consumer.
// fallow-ignore-next-line complexity
export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SimulationMode>('3body');
  const [sandboxBodies, setSandboxBodies] = useState<SandboxBody[]>([]);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [currentState, setCurrentState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(10000.0);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [lagrangePoints, setLagrangePoints] = useState<LagrangePointSet | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [preset, setPresetState] = useState<PresetType>('earth-moon');

  const { simulator, error } = useSimulation(initialState, resetCounter);
  const { trailHistory, trailLength, recordStep, resetTrail, setTrailLength } = useTrailHistory(DEFAULT_INITIAL_STATE);

  useEffect(() => {
    if (selectedBodyId && !sandboxBodies.some((b) => b.id === selectedBodyId)) {
      setSelectedBodyId(null);
    }
  }, [sandboxBodies, selectedBodyId]);

  useEffect(() => {
    setCurrentState(initialState);
    resetTrail(initialState);
    if (simulator && mode === '3body') {
      refreshLagrangePoints(simulator, setLagrangePoints);
    } else {
      setLagrangePoints(null);
    }
    // Deps intentionally exclude initialState/resetTrail: including them resets the trail on every mass/distance slider change.
  }, [simulator, mode]);

  const handleStep = useCallback(
    (result: StepResult) => {
      const enriched = { ...result.newState };
      if (enriched.bodies) {
        enriched.bodies = enrichBodies(enriched.bodies, sandboxBodies);
      }
      setCurrentState(enriched);
      recordStep(enriched);
      if (simulator && mode === '3body') refreshLagrangePoints(simulator, setLagrangePoints);
    },
    [simulator, sandboxBodies, mode, recordStep],
  );

  const { stepResult, setStepResult } = useSimulationStep(simulator, isPaused, speedMultiplier, handleStep);

  const clearTrailHistory = useCallback(() => resetTrail(currentState), [currentState, resetTrail]);

  const resetSimulation = useCallback(() => {
    resetTrail(initialState);
    setStepResult(null);
    setResetCounter((prev) => prev + 1);
  }, [initialState, setStepResult, resetTrail]);

  const setPreset = useCallback(
    (p: PresetType) => {
      const data = getPresetState(p);
      if (!data) return;
      setPresetState(p);
      setSpeedMultiplier(data.speed);
      setInitialState(data.state);
      setCurrentState(data.state);
      resetTrail(data.state);
      setIsPaused(true);
      setStepResult(null);
      setResetCounter((prev) => prev + 1);
    },
    [setStepResult, resetTrail],
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
