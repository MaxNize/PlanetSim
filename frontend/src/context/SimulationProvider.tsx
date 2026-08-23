import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SimulationState, StepResult, LagrangePointSet, Body, SimulatorBridge } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';
import { SimulationMode, SandboxBody } from '../types';
import { DEFAULT_INITIAL_STATE, PresetType, getPresetState } from './presets';
import { simulationContext } from './SimulationContext';
import { simulationAnimationContext } from './SimulationAnimationContext';
import { useSandbox } from './useSandbox';
import { useTrailHistory } from './useTrailHistory';
import { useBodyTracking } from '../hooks/useBodyTracking';
import { useMiniview } from '../hooks/useMiniview';
import { useFps } from '../hooks/useFps';
import { useSimulationContextValues } from './useSimulationContextValues';

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
 * Context provider managing the simulation engine state and lifecycle. This is the app's single
 * top-level state provider; its high hook count is the React context-provider pattern itself (one
 * useState/useCallback per piece of shared state), not accidental branching — the preset/sandbox/
 * trail concerns already extracted into useSandbox/useTrailHistory/presets/useSimulationContextValues
 * are as far as this can be decomposed without prop-drilling multiple contexts through every consumer.
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulator, mode]);

  const handleStep = useCallback(
    (result: StepResult) => {
      const enriched = { ...result.newState };
      if (enriched.bodies) {
        enriched.bodies = enrichBodies(enriched.bodies, sandboxBodies);
      }
      setCurrentState(enriched);
      if (showTrail) recordStep(enriched); // O(bodies) work (see useTrailHistory); skip if unseen.
      if (simulator && mode === '3body') refreshLagrangePoints(simulator, setLagrangePoints);
    },
    [simulator, sandboxBodies, mode, recordStep, showTrail],
  );

  const { stepResult, setStepResult } = useSimulationStep(simulator, isPaused, speedMultiplier, handleStep);
  // currentState updates up to 60x/sec while running; reading it via ref instead of a useCallback
  // dependency keeps clearTrailHistory referentially stable so it can live in the low-frequency
  // SimulationContext without dragging that context's value into churning every animation frame.
  const currentStateRef = useRef(currentState);
  currentStateRef.current = currentState;
  const clearTrailHistory = useCallback(() => resetTrail(currentStateRef.current), [resetTrail]);

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

  const { setMode, addBody, addBodies, removeBody, updateBody } = useSandbox(
    sandboxBodies,
    setSandboxBodies,
    currentState,
    setCurrentState,
    setInitialState,
    setIsPaused,
    setStepResult,
    setModeState,
    simulator,
  );
  const { trackedBodyId, setTrackedBodyId, toggleTracking } = useBodyTracking(currentState, mode);
  const { miniviewBodyId, setMiniviewBodyId, toggleMiniview } = useMiniview(currentState, mode);
  const { fps, frameTimeMs, status: fpsStatus } = useFps(!isPaused);

  // Split into two contexts (low-frequency UI state vs. 60Hz animation data) so components that
  // only need e.g. the preset/pause controls don't re-render on every simulation step.
  const { uiContextValue, animationContextValue } = useSimulationContextValues(
    {
      initialState,
      setInitialState: setInitialStateAndSync,
      isPaused,
      setIsPaused,
      speedMultiplier,
      setSpeedMultiplier,
      clearTrailHistory,
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
      addBodies,
      removeBody,
      updateBody,
      selectedBodyId,
      setSelectedBodyId,
      trackedBodyId,
      setTrackedBodyId,
      toggleTracking,
      miniviewBodyId,
      setMiniviewBodyId,
      toggleMiniview,
    },
    { currentState, stepResult, lagrangePoints, trailHistory, clearTrailHistory, fps, frameTimeMs, fpsStatus },
  );

  return (
    <simulationContext.Provider value={uiContextValue}>
      <simulationAnimationContext.Provider value={animationContextValue}>{children}</simulationAnimationContext.Provider>
    </simulationContext.Provider>
  );
}
