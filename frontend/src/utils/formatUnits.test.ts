import { describe, it, expect } from 'vitest';
import { formatDistance, formatVelocity, formatMass } from './formatUnits';

describe('formatDistance', () => {
  it('formats sub-kilometer distances in meters', () => {
    expect(formatDistance(42)).toBe('42.0 m');
  });

  it('formats kilometer-scale distances in km', () => {
    expect(formatDistance(1500)).toBe('1.50 km');
  });

  it('formats megameter-scale distances in Mm', () => {
    expect(formatDistance(3.844e8)).toBe('384.40 Mm');
  });

  it('formats gigameter-scale distances in Gm', () => {
    expect(formatDistance(5e9)).toBe('5.00 Gm');
  });

  it('formats distances at 0.1 AU or beyond in AU', () => {
    expect(formatDistance(1.495978707e10)).toBe('0.100 AU');
  });

  it('handles negative distances by preserving sign', () => {
    expect(formatDistance(-1500)).toBe('-1.50 km');
  });

  it('handles zero', () => {
    expect(formatDistance(0)).toBe('0.0 m');
  });
});

describe('formatVelocity', () => {
  it('formats sub-km/s speeds in m/s', () => {
    expect(formatVelocity(800)).toBe('800.0 m/s');
  });

  it('formats km/s-scale speeds in km/s', () => {
    expect(formatVelocity(1022)).toBe('1.02 km/s');
  });

  it('handles negative velocities by preserving sign', () => {
    expect(formatVelocity(-1022)).toBe('-1.02 km/s');
  });

  it('handles zero', () => {
    expect(formatVelocity(0)).toBe('0.0 m/s');
  });
});

describe('formatMass', () => {
  it('formats sub-Earth-mass values in kg scientific notation', () => {
    expect(formatMass(1)).toBe('1.000e+0 kg');
  });

  it('formats Earth-mass-scale values in M⊕', () => {
    expect(formatMass(5.9722e24)).toBe('1.000 M⊕');
  });

  it('formats solar-mass-scale values (>= 0.1 solar masses) in M☉', () => {
    expect(formatMass(1.989e29)).toBe('0.100 M☉');
  });

  it('handles zero', () => {
    expect(formatMass(0)).toBe('0.000e+0 kg');
  });
});
