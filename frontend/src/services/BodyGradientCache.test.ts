import { describe, it, expect, vi } from 'vitest';
import { BodyGradientCache } from './BodyGradientCache';

function makeCtx() {
  const gradient = { addColorStop: vi.fn() };
  const createRadialGradient = vi.fn(() => gradient);
  return { createRadialGradient, gradient } as unknown as CanvasRenderingContext2D & { createRadialGradient: typeof createRadialGradient };
}

describe('BodyGradientCache', () => {
  it('creates a new gradient for a new color/radius bucket', () => {
    const ctx = makeCtx();
    const cache = new BodyGradientCache();

    const gradient = cache.get(ctx, '#ff0000', 10);

    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1);
    expect(gradient).toBeDefined();
  });

  it('reuses a cached gradient for the same color and bucketed radius', () => {
    const ctx = makeCtx();
    const cache = new BodyGradientCache();

    const first = cache.get(ctx, '#ff0000', 10.2);
    const second = cache.get(ctx, '#ff0000', 10.4);

    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('creates distinct gradients for different colors or radii', () => {
    const ctx = makeCtx();
    const cache = new BodyGradientCache();

    cache.get(ctx, '#ff0000', 10);
    cache.get(ctx, '#00ff00', 10);
    cache.get(ctx, '#ff0000', 20);

    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(3);
  });

  it('clears the cache once it grows past the configured bound', () => {
    const ctx = makeCtx();
    const cache = new BodyGradientCache();

    for (let i = 0; i < 500; i += 1) {
      cache.get(ctx, '#ff0000', i + 1);
    }
    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(500);

    // The cache is now full; the 501st distinct entry must trigger a clear instead of
    // growing unboundedly, then re-populate with the new entry.
    cache.get(ctx, '#ff0000', 501);
    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(501);

    // A previously-cached bucket is gone after the clear, so requesting it again creates
    // a brand new gradient rather than reusing the evicted one.
    cache.get(ctx, '#ff0000', 1);
    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(502);
  });
});
