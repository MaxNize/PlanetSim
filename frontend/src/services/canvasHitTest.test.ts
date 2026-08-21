import { describe, it, expect } from 'vitest';
import { screenToWorld, findBodyAtPosition } from './canvasHitTest';
import { SandboxBody } from '../types';

describe('screenToWorld', () => {
  it('maps the screen center to the viewport pan position', () => {
    const rect = { left: 0, top: 0, width: 800, height: 600 };
    const viewport = { scale: 1e-6, pan: { x: 1.5e8, y: 0 } };
    expect(screenToWorld(400, 300, rect, viewport)).toEqual([1.5e8, 0]);
  });

  it('scales screen offsets by the inverse viewport scale', () => {
    const rect = { left: 0, top: 0, width: 0, height: 0 };
    const viewport = { scale: 1e-6, pan: { x: 0, y: 0 } };
    expect(screenToWorld(100, 0, rect, viewport)).toEqual([1e8, 0]);
  });
});

describe('findBodyAtPosition', () => {
  const bodies: SandboxBody[] = [
    { id: 'a', position: [0, 0], velocity: [0, 0], mass: 1, radius: 1e6, color: '#fff' },
    { id: 'b', position: [1e8, 0], velocity: [0, 0], mass: 1, radius: 1e6, color: '#fff' },
  ];

  it('returns null when there are no bodies', () => {
    expect(findBodyAtPosition([0, 0], [], 1e-6)).toBeNull();
    expect(findBodyAtPosition([0, 0], undefined, 1e-6)).toBeNull();
  });

  it('returns the body whose radius contains the position', () => {
    expect(findBodyAtPosition([1e8, 0], bodies, 1e-6)?.id).toBe('b');
  });

  it('returns null when no body is within range', () => {
    expect(findBodyAtPosition([5e8, 5e8], bodies, 1e-6)).toBeNull();
  });

  it('falls back to the default hit radius when a body has a falsy radius', () => {
    const zeroRadiusBody: SandboxBody = { id: 'z', position: [2e8, 0], velocity: [0, 0], mass: 1, radius: 0, color: '#fff' };
    expect(findBodyAtPosition([2e8, 0], [zeroRadiusBody], 1e-6)?.id).toBe('z');
  });
});
