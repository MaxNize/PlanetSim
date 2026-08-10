import { SimulationState } from '../services/wasmBridge';

export const G = 6.6743e-11;

export const DEFAULT_INITIAL_STATE: SimulationState = {
  primary: { position: [0.0, 0.0], velocity: [0.0, 0.0], mass: 5.9722e24, radius: 6.371e6 },
  secondary: { position: [3.844e8, 0.0], velocity: [0.0, 1022.0], mass: 7.3477e22, radius: 1.737e6 },
  testParticle: { position: [3.0e8, 0.0], velocity: [0.0, 800.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: G,
};

export type PresetType = 'earth-moon' | 'binary-stars' | 'custom';

export const EARTH_MOON_PRESET: SimulationState = DEFAULT_INITIAL_STATE;

export const BINARY_STARS_PRESET: SimulationState = {
  primary: { position: [-5.0e8, 0.0], velocity: [0.0, -257635.0], mass: 1.989e30, radius: 6.9634e7 },
  secondary: { position: [5.0e8, 0.0], velocity: [0.0, 257635.0], mass: 1.989e30, radius: 6.9634e7 },
  testParticle: { position: [0.0, 4.33e8], velocity: [223120.0, 0.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: G,
};

/**
 * Returns the state and recommended speed configuration for the given preset type.
 */
export function getPresetState(p: PresetType): { state: SimulationState; speed: number } | null {
  if (p === 'earth-moon') return { state: EARTH_MOON_PRESET, speed: 10000.0 };
  if (p === 'binary-stars') return { state: BINARY_STARS_PRESET, speed: 20.0 };
  return null;
}
