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
    return this.simulator.step(dt) as StepResult;
  }

  /**
   * Retrieves a snapshot of the current simulation state from the WASM module.
   * @returns Current simulation state object
   */
  public getState(): SimulationState {
    return this.simulator.get_state() as SimulationState;
  }

  /**
   * Computes the current coordinates of the five equilibrium Lagrange points (L1–L5).
   * @returns LagrangePointSet coordinates in meters
   */
  public getLagrangePoints(): LagrangePointSet {
    return this.simulator.get_lagrange_points() as LagrangePointSet;
  }

  /**
   * Overwrites the simulator's internal state with a new state object.
   * @param state - Target simulation state to set
   */
  public setState(state: SimulationState): void {
    this.simulator.set_state(JSON.stringify(state));
  }
}
