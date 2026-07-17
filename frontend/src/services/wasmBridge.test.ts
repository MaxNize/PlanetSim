import { describe, it, expect } from 'vitest';
import { SimulatorBridge, SimulationState } from './wasmBridge';

// Gravitational constant G = 6.67430e-11
const G = 6.6743e-11;

// Reusable test state based on Earth-Moon system
const createTestState = (): SimulationState => ({
  primary: {
    position: [0.0, 0.0],
    velocity: [0.0, 0.0],
    mass: 5.9722e24, // Earth mass
    radius: 6.371e6,
  },
  secondary: {
    position: [3.844e8, 0.0], // Earth-Moon distance
    velocity: [0.0, 1022.0], // Moon orbital speed
    mass: 7.3477e22, // Moon mass
    radius: 1.737e6,
  },
  testParticle: {
    position: [3.0e8, 0.0], // between Earth and Moon
    velocity: [0.0, 800.0],
    mass: 1.0,
    radius: 1.0,
  },
  time: 0.0,
  gravitationalConstant: G,
});

describe('SimulatorBridge integration tests', () => {
  it('should initialize and get state successfully', () => {
    const initialState = createTestState();
    const bridge = new SimulatorBridge(initialState);

    const state = bridge.getState();
    expect(state.time).toBe(0.0);
    expect(state.gravitationalConstant).toBe(G);
    expect(state.primary.mass).toBe(5.9722e24);
    expect(state.secondary.position).toEqual([3.844e8, 0.0]);
    expect(state.testParticle.position).toEqual([3.0e8, 0.0]);
  });

  it('should step the simulation forward and update positions', () => {
    const initialState = createTestState();
    const bridge = new SimulatorBridge(initialState);

    const dt = 100.0; // 100 seconds
    const result = bridge.step(dt);

    // Verify time advanced
    expect(result.newState.time).toBe(100.0);

    // Verify Moon moved (y coordinate should not be zero anymore due to vertical velocity)
    expect(result.newState.secondary.position[0]).not.toBe(3.844e8);
    expect(result.newState.secondary.position[1]).toBeGreaterThan(0.0);

    // Verify energies are returned as numbers
    expect(typeof result.kineticEnergy).toBe('number');
    expect(typeof result.potentialEnergy).toBe('number');
  });

  it('should calculate L1-L5 Lagrange points', () => {
    const initialState = createTestState();
    const bridge = new SimulatorBridge(initialState);

    const points = bridge.getLagrangePoints();

    // Verify all 5 points exist
    expect(points.l1).toBeDefined();
    expect(points.l2).toBeDefined();
    expect(points.l3).toBeDefined();
    expect(points.l4).toBeDefined();
    expect(points.l5).toBeDefined();

    // Check l4 and l5 are equilateral triangles:
    // Earth-Moon vector is [D, 0], L4/L5 should be [D/2, +/- D * sqrt(3)/2]
    // D = 3.844e8. D/2 = 1.922e8. D * sqrt(3)/2 ≈ 3.329e8.
    const D = 3.844e8;
    const expectedX = D / 2;
    const expectedY = D * Math.sqrt(3) / 2;

    expect(points.l4[0]).toBeCloseTo(expectedX, -4); // compare within tolerance
    expect(points.l4[1]).toBeCloseTo(expectedY, -4);
    expect(points.l5[0]).toBeCloseTo(expectedX, -4);
    expect(points.l5[1]).toBeCloseTo(-expectedY, -4);
  });

  it('should throw error on invalid dt', () => {
    const initialState = createTestState();
    const bridge = new SimulatorBridge(initialState);

    // dt <= 0 should throw an error from WASM
    expect(() => bridge.step(0)).toThrow();
    expect(() => bridge.step(-10)).toThrow();
  });
});
