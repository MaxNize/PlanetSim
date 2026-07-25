import { describe, it, expect, vi } from 'vitest';
import { CanvasRenderer, ViewportConfig } from './CanvasRenderer';

describe('CanvasRenderer', () => {
  const mockContext = {
    scale: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fillText: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    resetTransform: vi.fn(),
  };

  const mockCanvas = {
    getContext: vi.fn(() => mockContext),
    getBoundingClientRect: vi.fn(() => ({ width: 800, height: 600 })),
    width: 800,
    height: 600,
  } as unknown as HTMLCanvasElement;

  it('should construct correctly and resize context according to DPR', () => {
    const renderer = new CanvasRenderer(mockCanvas);
    expect(renderer).toBeDefined();

    const dims = renderer.resize();
    expect(dims.width).toBe(800);
    expect(dims.height).toBe(600);
  });

  it('should map world coordinates to canvas coordinates correctly', () => {
    const renderer = new CanvasRenderer(mockCanvas);
    const viewport: ViewportConfig = {
      scale: 2.0, // 2 pixels per meter
      pan: { x: 10.0, y: 5.0 }, // center of viewport in world space
    };

    // Center is (400, 300) since width = 800, height = 600
    // Test point at center (10, 5)
    const centerResult = renderer.worldToCanvas([10.0, 5.0], viewport, 800, 600);
    expect(centerResult.x).toBe(400);
    expect(centerResult.y).toBe(300);

    // Test point offset by 5 meters right, 10 meters up (15, 15)
    // x = 400 + (15 - 10) * 2 = 410
    // y = 300 - (15 - 5) * 2 = 280
    const offsetResult = renderer.worldToCanvas([15.0, 15.0], viewport, 800, 600);
    expect(offsetResult.x).toBe(410);
    expect(offsetResult.y).toBe(280);
  });

  it('should map canvas coordinates back to world coordinates correctly', () => {
    const renderer = new CanvasRenderer(mockCanvas);
    const viewport: ViewportConfig = {
      scale: 0.5, // 0.5 pixels per meter
      pan: { x: -100.0, y: 200.0 },
    };

    // Center (400, 300)
    // Screen point at (400, 300) should map to pan center (-100, 200)
    const centerWorld = renderer.canvasToWorld(400, 300, viewport, 800, 600);
    expect(centerWorld.x).toBe(-100.0);
    expect(centerWorld.y).toBe(200.0);

    // Screen point at (500, 100)
    // x = (500 - 400) / 0.5 + (-100) = 100
    // y = (300 - 100) / 0.5 + 200 = 600
    const offsetWorld = renderer.canvasToWorld(500, 100, viewport, 800, 600);
    expect(offsetWorld.x).toBe(100.0);
    expect(offsetWorld.y).toBe(600.0);
  });
});
