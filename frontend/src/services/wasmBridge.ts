import { Simulator } from 'planet-sim-wasm';

export interface Body {
  position: [number, number]; // (x, y) in meters
  velocity: [number, number]; // (vx, vy) in m/s
  mass: number; // kg
  radius: number; // meters
}

export interface SimulationState {
  primary: Body;
  secondary: Body;
  testParticle: Body;
  time: number;
  gravitationalConstant: number;
  bodies?: (Body & { id?: string; name?: string; color?: string; locked?: boolean })[];
}

export interface StepResult {
  newState: SimulationState;
  kineticEnergy: number;
  potentialEnergy: number;
}

export interface LagrangePointSet {
  l1: [number, number];
  l2: [number, number];
  l3: [number, number];
  l4: [number, number];
  l5: [number, number];
}

/**
 * Service bridge class wrapper around the Rust/WASM Simulator class.
 * Handles type-safe communication and state progression.
 */
export class SimulatorBridge {
  private simulator: Simulator;

  constructor(initialState: SimulationState) {
    this.simulator = new Simulator(JSON.stringify(initialState));
  }

  /**
   * Advances the simulation by a time step dt (in seconds).
   * @param dt Time step in seconds.
   * @returns The StepResult with the new state and energies.
   */
  public step(dt: number): StepResult {
    return this.simulator.step(dt) as StepResult;
  }

  /**
   * Retrieves the current simulation state.
   * @returns The current SimulationState.
   */
  public getState(): SimulationState {
    return this.simulator.get_state() as SimulationState;
  }

  /**
   * Computes the Lagrange points based on the current state.
   * @returns The LagrangePointSet coordinates.
   */
  public getLagrangePoints(): LagrangePointSet {
    return this.simulator.get_lagrange_points() as LagrangePointSet;
  }

  /**
   * Updates the simulator state in-place.
   * @param state The new SimulationState.
   */
  public setState(state: SimulationState): void {
    this.simulator.set_state(JSON.stringify(state));
  }
}
