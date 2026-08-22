import { useMemo } from 'react';
import { SimulationState, StepResult, LagrangePointSet } from '../services/wasmBridge';
import { TrailHistory } from '../types';
import { SimulationContextType } from './SimulationContext';
import { SimulationAnimationContextType } from './SimulationAnimationContext';

type UiContextInputs = SimulationContextType;

interface AnimationContextInputs {
  currentState: SimulationState;
  stepResult: StepResult | null;
  lagrangePoints: LagrangePointSet | null;
  trailHistory: TrailHistory;
  clearTrailHistory: () => void;
  fps: number;
  frameTimeMs: number;
  fpsStatus: 'smooth' | 'moderate' | 'lag';
}

/**
 * Builds the two memoized SimulationProvider context values (low-frequency UI state vs. 60Hz
 * animation data). Memoization is what makes the context split actually work: a fresh object
 * literal on every provider render would change context identity every frame regardless of which
 * fields changed, re-rendering every consumer and defeating the split. See SimulationProvider.tsx.
 */
export function useSimulationContextValues(ui: UiContextInputs, animation: AnimationContextInputs) {
  const uiContextValue = useMemo<SimulationContextType>(
    () => ({
      initialState: ui.initialState,
      setInitialState: ui.setInitialState,
      isPaused: ui.isPaused,
      setIsPaused: ui.setIsPaused,
      speedMultiplier: ui.speedMultiplier,
      setSpeedMultiplier: ui.setSpeedMultiplier,
      clearTrailHistory: ui.clearTrailHistory,
      showTrail: ui.showTrail,
      setShowTrail: ui.setShowTrail,
      trailLength: ui.trailLength,
      setTrailLength: ui.setTrailLength,
      resetSimulation: ui.resetSimulation,
      error: ui.error,
      preset: ui.preset,
      setPreset: ui.setPreset,
      mode: ui.mode,
      setMode: ui.setMode,
      sandboxBodies: ui.sandboxBodies,
      addBody: ui.addBody,
      addBodies: ui.addBodies,
      removeBody: ui.removeBody,
      updateBody: ui.updateBody,
      selectedBodyId: ui.selectedBodyId,
      setSelectedBodyId: ui.setSelectedBodyId,
      trackedBodyId: ui.trackedBodyId,
      setTrackedBodyId: ui.setTrackedBodyId,
      toggleTracking: ui.toggleTracking,
      miniviewBodyId: ui.miniviewBodyId,
      setMiniviewBodyId: ui.setMiniviewBodyId,
      toggleMiniview: ui.toggleMiniview,
    }),
    [
      ui.initialState,
      ui.setInitialState,
      ui.isPaused,
      ui.setIsPaused,
      ui.speedMultiplier,
      ui.setSpeedMultiplier,
      ui.clearTrailHistory,
      ui.showTrail,
      ui.setShowTrail,
      ui.trailLength,
      ui.setTrailLength,
      ui.resetSimulation,
      ui.error,
      ui.preset,
      ui.setPreset,
      ui.mode,
      ui.setMode,
      ui.sandboxBodies,
      ui.addBody,
      ui.addBodies,
      ui.removeBody,
      ui.updateBody,
      ui.selectedBodyId,
      ui.setSelectedBodyId,
      ui.trackedBodyId,
      ui.setTrackedBodyId,
      ui.toggleTracking,
      ui.miniviewBodyId,
      ui.setMiniviewBodyId,
      ui.toggleMiniview,
    ],
  );

  const animationContextValue = useMemo<SimulationAnimationContextType>(
    () => ({
      currentState: animation.currentState,
      stepResult: animation.stepResult,
      lagrangePoints: animation.lagrangePoints,
      trailHistory: animation.trailHistory,
      history: animation.trailHistory.testParticle,
      clearHistory: animation.clearTrailHistory,
      fps: animation.fps,
      frameTimeMs: animation.frameTimeMs,
      fpsStatus: animation.fpsStatus,
    }),
    [animation.currentState, animation.stepResult, animation.lagrangePoints, animation.trailHistory, animation.clearTrailHistory, animation.fps, animation.frameTimeMs, animation.fpsStatus],
  );

  return { uiContextValue, animationContextValue };
}
