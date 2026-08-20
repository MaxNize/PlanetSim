import { describe, it, expect } from 'vitest';
import { generateStressTestBodies } from './stressTestUtils';

describe('stressTestUtils', () => {
  it('should generate the requested number of bodies with valid orbital physics parameters', () => {
    const count = 50;
    const bodies = generateStressTestBodies(count, 0);

    expect(bodies).toHaveLength(50);
    expect(bodies[0].name).toBe('Test Body 1');
    expect(bodies[49].name).toBe('Test Body 50');

    for (const b of bodies) {
      expect(b.id).toMatch(/^stress-/);
      expect(b.position[0]).toBeTypeOf('number');
      expect(b.position[1]).toBeTypeOf('number');
      expect(b.velocity[0]).toBeTypeOf('number');
      expect(b.velocity[1]).toBeTypeOf('number');
      expect(b.mass).toBe(5.972e24);
      expect(b.radius).toBe(1e9);
      expect(b.locked).toBe(false);
      expect(b.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('should support startIndex offset to produce distinct names and indices', () => {
    const bodies = generateStressTestBodies(10, 100);

    expect(bodies).toHaveLength(10);
    expect(bodies[0].name).toBe('Test Body 101');
    expect(bodies[9].name).toBe('Test Body 110');
  });

  it('should handle count = 0 gracefully', () => {
    const bodies = generateStressTestBodies(0);
    expect(bodies).toHaveLength(0);
  });
});
