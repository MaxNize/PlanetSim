import { describe, it, expect, vi } from 'vitest';
import { SimulatorBridge, SimulationState } from './wasmBridge';

const G = 6.6743e-11;

const validState: SimulationState = {
  primary: { position: [0, 0], velocity: [0, 0], mass: 5.9722e24, radius: 6.371e6 },
  secondary: { position: [3.844e8, 0], velocity: [0, 1022.0], mass: 7.3477e22, radius: 1.737e6 },
  testParticle: { position: [3.0e8, 0], velocity: [0, 800.0], mass: 1.0, radius: 1.0 },
  time: 0.0,
  gravitationalConstant: G,
};

vi.mock('planet-sim-wasm', () => {
  // Property names mirror the real wasm-bindgen-generated Simulator's snake_case method names exactly.
  /* eslint-disable @typescript-eslint/naming-convention */
  class Simulator {
    step = vi.fn(() => ({ not: 'a step result' }));
    get_state = vi.fn(() => ({ not: 'a simulation state' }));
    get_lagrange_points = vi.fn(() => ({ not: 'a lagrange point set' }));
    set_state = vi.fn();
  }
  /* eslint-enable @typescript-eslint/naming-convention */
  return { Simulator };
});

describe('SimulatorBridge malformed WASM output handling', () => {
  it('throws when the WASM module returns a malformed StepResult from step()', () => {
    const bridge = new SimulatorBridge(validState);
    expect(() => bridge.step(1.0)).toThrow('WASM simulator returned a malformed StepResult');
  });

  it('throws when a returned SimulationState has a non-finite time/gravitationalConstant', () => {
    const bridge = new SimulatorBridge(validState);

    (bridge as any).simulator.get_state = () => ({ ...validState, time: 'not a number' });
    expect(() => bridge.getState()).toThrow('WASM simulator returned a malformed SimulationState');
  });

  it('throws when a returned SimulationState has an invalid bodies entry', () => {
    const bridge = new SimulatorBridge(validState);

    (bridge as any).simulator.get_state = () => ({ ...validState, bodies: [{ not: 'a body' }] });
    expect(() => bridge.getState()).toThrow('WASM simulator returned a malformed SimulationState');
  });

  it('accepts a SimulationState with a valid bodies array', () => {
    const bridge = new SimulatorBridge(validState);
    const withBodies = { ...validState, bodies: [validState.primary] };

    (bridge as any).simulator.get_state = () => withBodies;
    expect(bridge.getState()).toEqual(withBodies);
  });

  it('throws when the WASM module returns null for LagrangePointSet', () => {
    const bridge = new SimulatorBridge(validState);

    (bridge as any).simulator.get_lagrange_points = () => null;
    expect(() => bridge.getLagrangePoints()).toThrow('WASM simulator returned a malformed LagrangePointSet');
  });

  it('throws when the WASM module returns a malformed SimulationState from get_state()', () => {
    const bridge = new SimulatorBridge(validState);
    expect(() => bridge.getState()).toThrow('WASM simulator returned a malformed SimulationState');
  });

  it('throws when the WASM module returns a malformed LagrangePointSet from get_lagrange_points()', () => {
    const bridge = new SimulatorBridge(validState);
    expect(() => bridge.getLagrangePoints()).toThrow('WASM simulator returned a malformed LagrangePointSet');
  });
});
