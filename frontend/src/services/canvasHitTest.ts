import { SandboxBody } from '../types';
import { ViewportConfig } from './CanvasRenderer';

/** Converts a screen (client) coordinate to a world (physics) coordinate for the given canvas rect and viewport. */
export function screenToWorld(screenX: number, screenY: number, rect: { left: number; top: number; width: number; height: number }, viewport: ViewportConfig): [number, number] {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  return [(screenX - rect.left - centerX) / viewport.scale + viewport.pan.x, (centerY - (screenY - rect.top)) / viewport.scale + viewport.pan.y];
}

/** Finds the first body (in draw order) whose hit radius contains the given world position, or null. */
export function findBodyAtPosition(worldPos: [number, number], bodies: SandboxBody[] | undefined, scale: number): SandboxBody | null {
  if (!bodies || bodies.length === 0) return null;
  const minHitRadiusMeters = 15 / scale;

  for (const b of bodies) {
    const dist = Math.hypot(worldPos[0] - b.position[0], worldPos[1] - b.position[1]);
    if (dist <= Math.max(b.radius || 6.371e6, minHitRadiusMeters)) return b;
  }
  return null;
}
