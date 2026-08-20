import { useCallback, useState } from 'react';
import { SimulatorBridge, StepResult } from '../services/wasmBridge';
import { useAnimationFrame } from './useAnimationFrame';

function performStep(simulator: SimulatorBridge | null, dt: number, speedMultiplier: number): StepResult | null {
  if (dt <= 0 || !simulator) return null;
  try {
    return simulator.step(dt * speedMultiplier);
  } catch (err) {
    console.error('Simulation step failed:', err);
    return null;
  }
}

/**
 * Custom hook that runs the simulation stepping loop at 60 FPS.
 * Executes simulator steps, scales time by speedMultiplier, and records step results.
 *
 * @param simulator The active SimulatorBridge instance.
 * @param isPaused Boolean indicating if the simulation is paused.
 * @param speedMultiplier Simulation speed multiplier (time scaling).
 * @param onStep Callback executed after each successful step.
 * @returns The latest StepResult from the physics engine.
 */
export function useSimulationStep(simulator: SimulatorBridge | null, isPaused: boolean, speedMultiplier: number, onStep?: (result: StepResult) => void) {
  const [stepResult, setStepResult] = useState<StepResult | null>(null);

  const tick = useCallback(
    (dt: number) => {
      const result = performStep(simulator, dt, speedMultiplier);
      if (result) {
        setStepResult(result);
        onStep?.(result);
      }
    },
    [simulator, speedMultiplier, onStep],
  );

  useAnimationFrame(tick, !isPaused && simulator !== null);

  return { stepResult, setStepResult };
}
