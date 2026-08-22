import { useCallback, useState } from 'react';
import { SimulatorBridge, StepResult } from '../services/wasmBridge';
import { useAnimationFrame } from './useAnimationFrame';

/**
 * Largest single Velocity-Verlet sub-step, in simulation seconds. The integrator's error
 * grows as O(dt^2), so a scaled-up frame delta (e.g. 0.016s * 100000x speed = 1600s) is
 * broken into sub-steps no larger than this to keep orbits from visibly drifting.
 */
const MAX_SUB_STEP_SECONDS = 5;

/** Hard cap on sub-steps per animation frame, bounding worst-case per-frame WASM cost at extreme speed multipliers. */
const MAX_SUB_STEPS_PER_FRAME = 200;

// fallow-ignore-next-line complexity
function performStep(simulator: SimulatorBridge | null, dt: number, speedMultiplier: number): StepResult | null {
  if (dt <= 0 || !simulator) return null;
  const totalDt = dt * speedMultiplier;
  if (totalDt <= 0) return null;

  const steps = Math.min(Math.max(1, Math.ceil(totalDt / MAX_SUB_STEP_SECONDS)), MAX_SUB_STEPS_PER_FRAME);
  const subDt = totalDt / steps;

  try {
    let result: StepResult | null = null;
    for (let i = 0; i < steps; i += 1) {
      result = simulator.step(subDt);
    }
    return result;
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
