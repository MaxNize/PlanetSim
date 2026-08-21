import { createContext, useContext } from 'react';
import { SimulationState, StepResult, LagrangePointSet } from '../services/wasmBridge';
import { TrailHistory } from '../types';

/**
 * High-frequency simulation data that changes up to 60(+) times per second while running:
 * the live physics state, step result, trails, and FPS telemetry. Kept in a context separate
 * from {@link SimulationContext} so that components which only need low-frequency UI state
 * (presets, pause toggle, sandbox body list, ...) don't re-render on every animation frame.
 */
export interface SimulationAnimationContextType {
  currentState: SimulationState;
  stepResult: StepResult | null;
  lagrangePoints: LagrangePointSet | null;
  trailHistory: TrailHistory;
  history: [number, number][]; // Backwards compatibility
  clearHistory: () => void; // Backwards compatibility
  fps: number;
  frameTimeMs: number;
  fpsStatus: 'smooth' | 'moderate' | 'lag';
}

export const simulationAnimationContext = createContext<SimulationAnimationContextType | null>(null);

export const useSimulationAnimation = () => {
  const context = useContext(simulationAnimationContext);
  if (!context) throw new Error('useSimulationAnimation must be used within a SimulationProvider');
  return context;
};
