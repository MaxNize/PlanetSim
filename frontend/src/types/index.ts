/**
 * Props for the ParameterControls presentational component.
 */
export interface ParameterControlsProps {
  massM1: number;
  setMassM1: (mass: number) => void;
  massM2: number;
  setMassM2: (mass: number) => void;
  distanceR: number;
  setDistanceR: (distance: number) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (multiplier: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  onReset: () => void;
  preset: 'earth-moon' | 'binary-stars' | 'custom';
  setPreset: (preset: 'earth-moon' | 'binary-stars' | 'custom') => void;
  placementActive?: boolean;
  setPlacementActive?: (active: boolean) => void;
}

/**
 * Props for the StateDisplay presentational component.
 */
export interface StateDisplayProps {
  time: number;
  primaryPos: [number, number];
  primaryVel: [number, number];
  secondaryPos: [number, number];
  secondaryVel: [number, number];
  testParticlePos: [number, number];
  testParticleVel: [number, number];
  kineticEnergy: number | undefined;
  potentialEnergy: number | undefined;
  error: string | null;
}

/**
 * Historical coordinates structure for drawing trajectory trails of all celestial bodies.
 */
export interface TrailHistory {
  primary: [number, number][];
  secondary: [number, number][];
  testParticle: [number, number][];
  customBodies?: { [bodyId: string]: [number, number][] };
}

/**
 * Modes of simulation: standard restricted 3-body or generalized sandbox mode.
 */
export type SimulationMode = '3body' | 'sandbox';

/**
 * Representation of a customizable body placed in sandbox mode.
 */
export interface SandboxBody {
  id: string;
  position: [number, number];
  velocity: [number, number];
  mass: number;
  radius: number;
  color: string;
  name?: string;
  locked?: boolean;
}

/**
 * Props for the SandboxControls component.
 */
export interface SandboxControlsProps {
  placementActive: boolean;
  setPlacementActive: (active: boolean) => void;
}
