import { useCallback, useState } from 'react';
import { SimulatorBridge, StepResult } from '../services/wasmBridge';
import { useAnimationFrame } from './useAnimationFrame';

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
      if (dt <= 0 || !simulator) return;

      const simDt = dt * speedMultiplier;
      try {
        const result = simulator.step(simDt);
        setStepResult(result);
        if (onStep) {
          onStep(result);
        }
      } catch (err) {
        console.error('Simulation step failed:', err);
      }
    },
    [simulator, speedMultiplier, onStep],
  );

  useAnimationFrame(tick, !isPaused && simulator !== null);

  return { stepResult, setStepResult };
}
