import { useCallback, useEffect, useRef } from 'react';
import { SimulationState, StepResult, SimulatorBridge } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';
import { DEFAULT_INITIAL_STATE, PresetType, getPresetState } from './presets';
import { useTrailHistory } from './useTrailHistory';
import { useSimulationContextValues } from './useSimulationContextValues';
import { refreshLagrangePoints, processStepState, updateLagrange } from './simulationStepHelpers';
import { useSimulationCoreState } from './useSimulationCoreState';
import { useSimulationSubsystems } from './useSimulationSubsystems';

function useSimulationPresetActions(
  core: ReturnType<typeof useSimulationCoreState>,
  simulator: SimulatorBridge | null,
  resetTrail: (s: SimulationState) => void,
  setStepResult: React.Dispatch<React.SetStateAction<StepResult | null>>,
) {
  const { setPresetState, setSpeedMultiplier, setInitialState, setCurrentState, setIsPaused, setResetCounter, setLagrangePoints, mode } = core;

  const resetSimulation = useCallback(() => {
    resetTrail(core.initialState);
    setStepResult(null);
    setResetCounter((prev) => prev + 1);
  }, [core.initialState, setStepResult, resetTrail, setResetCounter]);

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
    [setPresetState, setSpeedMultiplier, setInitialState, setCurrentState, resetTrail, setIsPaused, setStepResult, setResetCounter],
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
    [simulator, mode, setPresetState, setInitialState, setCurrentState, setLagrangePoints],
  );

  return { resetSimulation, setPreset, setInitialStateAndSync };
}

/** Main hook coordinating simulation provider state, callbacks, and context creation. */
export function useSimulationProviderState() {
  const core = useSimulationCoreState();
  const {
    mode,
    sandboxBodies,
    selectedBodyId,
    setSelectedBodyId,
    initialState,
    setCurrentState,
    isPaused,
    setIsPaused,
    speedMultiplier,
    setSpeedMultiplier,
    showTrail,
    setShowTrail,
    lagrangePoints,
    setLagrangePoints,
    preset,
  } = core;
  const { simulator, error } = useSimulation(initialState, core.resetCounter);
  const { trailHistory, trailLength, recordStep, resetTrail, setTrailLength } = useTrailHistory(DEFAULT_INITIAL_STATE);

  useEffect(() => {
    if (selectedBodyId && !sandboxBodies.some((b) => b.id === selectedBodyId)) {
      setSelectedBodyId(null);
    }
  }, [selectedBodyId, sandboxBodies, setSelectedBodyId]);

  useEffect(() => {
    setCurrentState(initialState);
    resetTrail(initialState);
    if (simulator && mode === '3body') {
      refreshLagrangePoints(simulator, setLagrangePoints);
    } else {
      setLagrangePoints(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulator, mode]);

  const handleStep = useCallback(
    (result: StepResult) => {
      const nextState = processStepState(result.newState, sandboxBodies, showTrail, recordStep);
      setCurrentState(nextState);
      updateLagrange(simulator, mode, setLagrangePoints);
    },
    [simulator, sandboxBodies, showTrail, recordStep, mode, setCurrentState, setLagrangePoints],
  );

  const { stepResult, setStepResult } = useSimulationStep(simulator, isPaused, speedMultiplier, handleStep);
  const currentStateRef = useRef(core.currentState);
  currentStateRef.current = core.currentState;
  const clearTrailHistory = useCallback(() => resetTrail(currentStateRef.current), [resetTrail]);

  const { resetSimulation, setPreset, setInitialStateAndSync } = useSimulationPresetActions(core, simulator, resetTrail, setStepResult);
  const { sandbox, tracking, miniview, fps } = useSimulationSubsystems(core, simulator, setStepResult);

  return useSimulationContextValues(
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
      setMode: sandbox.setMode,
      sandboxBodies,
      addBody: sandbox.addBody,
      addBodies: sandbox.addBodies,
      removeBody: sandbox.removeBody,
      updateBody: sandbox.updateBody,
      selectedBodyId,
      setSelectedBodyId,
      trackedBodyId: tracking.trackedBodyId,
      setTrackedBodyId: tracking.setTrackedBodyId,
      toggleTracking: tracking.toggleTracking,
      miniviewBodyId: miniview.miniviewBodyId,
      setMiniviewBodyId: miniview.setMiniviewBodyId,
      toggleMiniview: miniview.toggleMiniview,
    },
    { currentState: core.currentState, stepResult, lagrangePoints, trailHistory, clearTrailHistory, fps: fps.fps, frameTimeMs: fps.frameTimeMs, fpsStatus: fps.status },
  );
}
