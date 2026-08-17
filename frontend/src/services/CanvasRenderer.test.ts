import { describe, it, expect, vi } from 'vitest';
import { CanvasRenderer, ViewportConfig } from './CanvasRenderer';
import { SimulationState, LagrangePointSet } from './wasmBridge';
import { TrailHistory } from '../types';

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
    setLineDash: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    resetTransform: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    globalAlpha: 1,
  };

  const mockCanvas = {
    getContext: vi.fn(() => mockContext),
    getBoundingClientRect: vi.fn(() => ({ width: 800, height: 600 })),
    width: 800,
    height: 600,
  } as unknown as HTMLCanvasElement;

  const viewport: ViewportConfig = { scale: 1, pan: { x: 0, y: 0 } };

  const emptyTrails: TrailHistory = { primary: [], secondary: [], testParticle: [] };

  const fixedState: SimulationState = {
    primary: { position: [0, 0], velocity: [0, 0], mass: 1, radius: 5 },
    secondary: { position: [10, 0], velocity: [0, 0], mass: 1, radius: 5 },
    testParticle: { position: [20, 0], velocity: [0, 0], mass: 1, radius: 5 },
    time: 1.5,
    gravitationalConstant: 6.674e-11,
  };

  const lagrangePoints: LagrangePointSet = { l1: [1, 0], l2: [2, 0], l3: [-1, 0], l4: [0, 1], l5: [0, -1] };

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

  describe('draw', () => {
    it('renders fixed bodies with trails, lagrange points, and the overlay', () => {
      const renderer = new CanvasRenderer(mockCanvas);
      const trails: TrailHistory = {
        primary: [
          [0, 0],
          [1, 1],
        ],
        secondary: [
          [0, 0],
          [1, 1],
        ],
        testParticle: [
          [0, 0],
          [1, 1],
        ],
      };

      renderer.draw(fixedState, trails, true, lagrangePoints, viewport, undefined, 'primary', 'secondary');

      expect(mockContext.fillText).toHaveBeenCalledWith('L1', expect.any(Number), expect.any(Number));
      expect(mockContext.fillText).toHaveBeenCalledWith(expect.stringContaining('Time:'), 44, 140);
    });

    it('renders sandbox bodies with names, custom trails, and locked/selected markers', () => {
      const renderer = new CanvasRenderer(mockCanvas);
      const sandboxState: SimulationState = {
        ...fixedState,
        bodies: [
          { id: 'a', name: 'Alpha', position: [0, 0], velocity: [0, 0], mass: 1, radius: 5, color: '#fff', locked: true },
          { position: [5, 5], velocity: [0, 0], mass: 1, radius: 5 },
        ],
      };
      const trails: TrailHistory = {
        ...emptyTrails,
        customBodies: {
          a: [
            [0, 0],
            [1, 1],
          ],
        },
      };

      renderer.draw(sandboxState, trails, true, null, viewport, undefined, 'a', 'body-1');

      expect(mockContext.fillText).toHaveBeenCalledWith('Alpha', expect.any(Number), expect.any(Number));
    });

    it('draws the placement preview body and skips the velocity arrow when velocity is zero', () => {
      const renderer = new CanvasRenderer(mockCanvas);
      renderer.draw(fixedState, emptyTrails, false, null, viewport, { position: [0, 0], velocity: [0, 0], radius: 5, color: '#fff' });

      expect(mockContext.fill).toHaveBeenCalled();
      expect(mockContext.setLineDash).not.toHaveBeenCalled();
    });

    it('draws a directional velocity arrow for a nonzero placement preview velocity', () => {
      const renderer = new CanvasRenderer(mockCanvas);
      renderer.draw(fixedState, emptyTrails, false, null, viewport, { position: [0, 0], velocity: [1, 1], radius: 5, color: '#fff' });

      expect(mockContext.setLineDash).toHaveBeenCalledWith([4, 4]);
    });

    it('does nothing if the canvas context is unavailable', () => {
      const canvasWithoutContext = {
        getContext: vi.fn(() => null),
        getBoundingClientRect: vi.fn(() => ({ width: 800, height: 600 })),
        width: 800,
        height: 600,
      } as unknown as HTMLCanvasElement;
      const renderer = new CanvasRenderer(canvasWithoutContext);

      expect(() => renderer.draw(fixedState, emptyTrails, true, null, viewport)).not.toThrow();
    });
  });

  describe('drawBody', () => {
    it('draws every marker ring when all markers are active', () => {
      const renderer = new CanvasRenderer(mockCanvas);
      renderer.drawBody([0, 0], 5, '#fff', viewport, 800, 600, { isFixed: true, isSelected: true, isLocked: true, isTracked: true });

      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('draws no marker rings by default', () => {
      mockContext.stroke.mockClear();
      const renderer = new CanvasRenderer(mockCanvas);
      renderer.drawBody([0, 0], 5, '#fff', viewport, 800, 600);

      expect(mockContext.stroke).not.toHaveBeenCalled();
    });
  });

  it('clears the canvas with the background color', () => {
    const renderer = new CanvasRenderer(mockCanvas);
    renderer.clear();
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });
});
