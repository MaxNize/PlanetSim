import { describe, it, expect } from 'vitest';
import { getPresetState, EARTH_MOON_PRESET, BINARY_STARS_PRESET } from './presets';

describe('getPresetState', () => {
  it('returns the earth-moon preset and speed', () => {
    expect(getPresetState('earth-moon')).toEqual({ state: EARTH_MOON_PRESET, speed: 10000.0 });
  });

  it('returns the binary-stars preset and speed', () => {
    expect(getPresetState('binary-stars')).toEqual({ state: BINARY_STARS_PRESET, speed: 20.0 });
  });

  it('returns null for the custom preset', () => {
    expect(getPresetState('custom')).toBeNull();
  });
});
