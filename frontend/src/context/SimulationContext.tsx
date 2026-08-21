import { createContext, useContext } from 'react';
import { SimulationState } from '../services/wasmBridge';
import { SimulationMode, SandboxBody } from '../types';
import { DEFAULT_INITIAL_STATE, PresetType, EARTH_MOON_PRESET, BINARY_STARS_PRESET } from './presets';

export { DEFAULT_INITIAL_STATE, EARTH_MOON_PRESET, BINARY_STARS_PRESET };
export type { PresetType };

/**
 * Low-frequency simulation UI state — presets, pause/speed controls, sandbox body list,
 * selection. Updates only on user interaction, unlike {@link SimulationAnimationContextType}
 * which changes on every animation frame. See `context/SimulationAnimationContext.tsx`.
 */
export interface SimulationContextType {
  initialState: SimulationState;
  setInitialState: (state: SimulationState) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (multiplier: number) => void;
  clearTrailHistory: () => void;
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
  addBodies: (bodies: SandboxBody[]) => void;
  removeBody: (id: string) => void;
  updateBody: (id: string, updates: Partial<SandboxBody>) => void;
  selectedBodyId: string | null;
  setSelectedBodyId: (id: string | null) => void;
  // Camera tracking (FP-36) and focused miniview (FP-37); toggleable from both the canvas context
  // menu and the sandbox object list.
  trackedBodyId: string | null;
  setTrackedBodyId: (id: string | null) => void;
  toggleTracking: (body: SandboxBody) => void;
  miniviewBodyId: string | null;
  setMiniviewBodyId: (id: string | null) => void;
  toggleMiniview: (body: SandboxBody) => void;
}

export const simulationContext = createContext<SimulationContextType | null>(null);

export const useSimulationContext = () => {
  const context = useContext(simulationContext);
  if (!context) throw new Error('useSimulationContext must be used within a SimulationProvider');
  return context;
};
