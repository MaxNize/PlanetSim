import { describe, it, expect } from 'vitest';
import { calculateOrbitalVelocity } from './calculateOrbitalVelocity';

describe('calculateOrbitalVelocity', () => {
  it('should calculate the correct orbital velocity for valid inputs', () => {
    // G = 6.6743e-11
    // M1 = 1e24 kg
    // R = 1e8 m
    // V = sqrt(6.6743e-11 * 1e24 / 1e8) = sqrt(6.6743e5) ≈ 816.96389
    const velocity = calculateOrbitalVelocity(1e24, 1e8);
    expect(velocity).toBeCloseTo(816.96389, 4);
  });

  it('should throw an error if distance is zero', () => {
    expect(() => calculateOrbitalVelocity(1e24, 0)).toThrow('distanceR must be positive');
  });

  it('should throw an error if distance is negative', () => {
    expect(() => calculateOrbitalVelocity(1e24, -100)).toThrow('distanceR must be positive');
  });
});
