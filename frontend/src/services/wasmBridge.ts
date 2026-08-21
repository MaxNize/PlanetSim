import { Simulator } from 'planet-sim-wasm';

/**
 * Physical properties of a single celestial body.
 */
export interface Body {
  /** (x, y) coordinates in meters. */
  position: [number, number];
  /** (vx, vy) velocity components in meters per second. */
  velocity: [number, number];
  /** Mass of the body in kilograms (> 0). */
  mass: number;
  /** Physical radius in meters for collision/rendering (> 0). */
  radius: number;
}

/**
 * Representation of the complete simulation state at a given instant.
 */
export interface SimulationState {
  /** Primary heavy mass (e.g. Earth or Sun). */
  primary: Body;
  /** Secondary orbiting mass (e.g. Moon or Planet). */
  secondary: Body;
  /** Lightweight test particle (zero back-reaction in 3-body mode). */
  testParticle: Body;
  /** Total elapsed simulation time in seconds. */
  time: number;
  /** Gravitational constant G in m³ kg⁻¹ s⁻² (default: 6.67430e-11). */
  gravitationalConstant: number;
  /** Optional custom bodies list for Sandbox multi-body mode. */
  bodies?: (Body & { id?: string; name?: string; color?: string; locked?: boolean })[];
}

/**
 * Result returned after performing a numerical simulation step.
 */
export interface StepResult {
  /** Updated simulation state after applying integration. */
  newState: SimulationState;
  /** Total kinetic energy of all bodies in Joules. */
  kineticEnergy: number;
  /** Total gravitational potential energy in Joules. */
  potentialEnergy: number;
}

/**
 * Coordinates of the five equilibrium Lagrange points (L1..L5).
 */
export interface LagrangePointSet {
  /** Collinear Lagrange point L1 between primary and secondary. */
  l1: [number, number];
  /** Collinear Lagrange point L2 beyond secondary. */
  l2: [number, number];
  /** Collinear Lagrange point L3 beyond primary. */
  l3: [number, number];
  /** Triangular Lagrange point L4 leading secondary by 60°. */
  l4: [number, number];
  /** Triangular Lagrange point L5 trailing secondary by 60°. */
  l5: [number, number];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isVec2(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && isFiniteNumber(value[0]) && isFiniteNumber(value[1]);
}

function isBody(value: unknown): value is Body {
  if (typeof value !== 'object' || value === null) return false;
  const b = value as Record<string, unknown>;
  return isVec2(b.position) && isVec2(b.velocity) && isFiniteNumber(b.mass) && isFiniteNumber(b.radius);
}

function isSimulationState(value: unknown): value is SimulationState {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  if (!isBody(s.primary) || !isBody(s.secondary) || !isBody(s.testParticle)) return false;
  if (!isFiniteNumber(s.time) || !isFiniteNumber(s.gravitationalConstant)) return false;
  if (s.bodies !== undefined && (!Array.isArray(s.bodies) || !s.bodies.every(isBody))) return false;
  return true;
}

function isStepResult(value: unknown): value is StepResult {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return isSimulationState(r.newState) && isFiniteNumber(r.kineticEnergy) && isFiniteNumber(r.potentialEnergy);
}

function isLagrangePointSet(value: unknown): value is LagrangePointSet {
  if (typeof value !== 'object' || value === null) return false;
  const l = value as Record<string, unknown>;
  return isVec2(l.l1) && isVec2(l.l2) && isVec2(l.l3) && isVec2(l.l4) && isVec2(l.l5);
}

/**
 * Service bridge wrapper providing type-safe interaction with the WebAssembly physics engine.
 *
 * @example
 * ```typescript
 * const bridge = new SimulatorBridge(initialState);
 * const result = bridge.step(0.016); // step 16ms
 * console.log(`Time: ${result.newState.time}s, Energy: ${result.kineticEnergy}J`);
 * ```
 */
export class SimulatorBridge {
  private simulator: Simulator;

  /**
   * Constructs a new SimulatorBridge instance and initializes the Rust WASM simulator.
   * @param initialState - Initial simulation state configuration
   */
  constructor(initialState: SimulationState) {
    this.simulator = new Simulator(JSON.stringify(initialState));
  }

  /**
   * Advances the simulation by time step `dt` (seconds) using Velocity-Verlet integration.
   * @param dt - Delta time step in seconds (valid range: 0 < dt < 86400)
   * @returns The updated simulation state and energy breakdown
   */
  public step(dt: number): StepResult {
    const result: unknown = this.simulator.step(dt);
    if (!isStepResult(result)) {
      throw new Error('WASM simulator returned a malformed StepResult');
    }
    return result;
  }

  /**
   * Retrieves a snapshot of the current simulation state from the WASM module.
   * @returns Current simulation state object
   */
  public getState(): SimulationState {
    const state: unknown = this.simulator.get_state();
    if (!isSimulationState(state)) {
      throw new Error('WASM simulator returned a malformed SimulationState');
    }
    return state;
  }

  /**
   * Computes the current coordinates of the five equilibrium Lagrange points (L1–L5).
   * @returns LagrangePointSet coordinates in meters
   */
  public getLagrangePoints(): LagrangePointSet {
    const points: unknown = this.simulator.get_lagrange_points();
    if (!isLagrangePointSet(points)) {
      throw new Error('WASM simulator returned a malformed LagrangePointSet');
    }
    return points;
  }

  /**
   * Overwrites the simulator's internal state with a new state object.
   * @param state - Target simulation state to set
   */
  public setState(state: SimulationState): void {
    this.simulator.set_state(JSON.stringify(state));
  }
}
