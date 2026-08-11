import { createContext, useContext } from 'react';
import { SimulationState, StepResult, LagrangePointSet } from '../services/wasmBridge';
import { TrailHistory, SimulationMode, SandboxBody } from '../types';
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
  // Sandbox specific additions
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  sandboxBodies: SandboxBody[];
  addBody: (body: SandboxBody) => void;
  removeBody: (id: string) => void;
  updateBody: (id: string, updates: Partial<SandboxBody>) => void;
  selectedBodyId: string | null;
  setSelectedBodyId: (id: string | null) => void;
}

export const simulationContext = createContext<SimulationContextType | null>(null);

export const useSimulationContext = () => {
  const context = useContext(simulationContext);
  if (!context) throw new Error('useSimulationContext must be used within a SimulationProvider');
  return context;
};
