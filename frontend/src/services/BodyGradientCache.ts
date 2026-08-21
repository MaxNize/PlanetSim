import { colors } from '../styles/tokens';

/** Bounds the cache so a long session of continuous zooming can't grow it unboundedly. */
const MAX_CACHED_GRADIENTS = 500;

/**
 * Caches the radial gradients used to shade celestial bodies, keyed by "color:radiusPx".
 *
 * Without this, a 60Hz render loop would call `createRadialGradient` (and allocate a new
 * `CanvasGradient`) for every body on every frame — measurable GC pressure once a stress
 * test spawns 100+ bodies. Gradients are built around the local origin so callers can reuse
 * them for any body by wrapping the fill in `ctx.translate(x, y)`.
 */
export class BodyGradientCache {
  private cache = new Map<string, CanvasGradient>();

  get(ctx: CanvasRenderingContext2D, color: string, radius: number): CanvasGradient {
    const bucketedRadius = Math.max(1, Math.round(radius));
    const key = `${color}:${bucketedRadius}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    if (this.cache.size >= MAX_CACHED_GRADIENTS) this.cache.clear();

    const gradient = ctx.createRadialGradient(0, 0, bucketedRadius * 0.1, 0, 0, bucketedRadius);
    gradient.addColorStop(0, colors.white);
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, '#000000');
    this.cache.set(key, gradient);
    return gradient;
  }
}
