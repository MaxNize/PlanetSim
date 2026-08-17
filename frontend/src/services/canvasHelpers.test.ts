import { describe, it, expect, vi } from 'vitest';
import { LagrangePointSet, SimulationState } from './wasmBridge';
import { drawTrail, drawLagrangePoints, drawOverlay, drawBodyLabel, drawVelocityArrow, drawRing } from './canvasHelpers';

function createMockContext() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    arc: vi.fn(),
    setLineDash: vi.fn(),
    globalAlpha: 1,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
  } as unknown as CanvasRenderingContext2D;
}

const worldToCanvas = (pos: [number, number]) => ({ x: pos[0] * 2, y: pos[1] * 2 });

describe('canvasHelpers', () => {
  describe('drawTrail', () => {
    it('does nothing for fewer than 2 points', () => {
      const ctx = createMockContext();
      drawTrail(ctx, [[0, 0]], '#fff', worldToCanvas);
      expect(ctx.beginPath).not.toHaveBeenCalled();
    });

    it('draws sections for a longer history and resets alpha', () => {
      const ctx = createMockContext();
      const history: [number, number][] = Array.from({ length: 25 }, (elementIgnored, i) => [i, i]);
      drawTrail(ctx, history, '#fff', worldToCanvas);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.globalAlpha).toBe(1.0);
    });

    it('handles a short history that still spans multiple sections', () => {
      const ctx = createMockContext();
      const history: [number, number][] = [
        [0, 0],
        [1, 1],
        [2, 2],
      ];
      drawTrail(ctx, history, '#fff', worldToCanvas);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawLagrangePoints', () => {
    it('draws markers and labels for all five Lagrange points', () => {
      const ctx = createMockContext();
      const points: LagrangePointSet = {
        l1: [1, 0],
        l2: [2, 0],
        l3: [-1, 0],
        l4: [0, 1],
        l5: [0, -1],
      };
      drawLagrangePoints(ctx, points, worldToCanvas);
      expect(ctx.fillText).toHaveBeenCalledTimes(5);
      expect(ctx.stroke).toHaveBeenCalledTimes(5);
      expect(ctx.fillText).toHaveBeenCalledWith('L1', expect.any(Number), expect.any(Number));
    });
  });

  describe('drawOverlay', () => {
    it('renders the formatted time and scale strings', () => {
      const ctx = createMockContext();
      const state = { time: 12.345 } as SimulationState;
      drawOverlay(ctx, state, 0.001);
      expect(ctx.fillText).toHaveBeenCalledWith('Time: 12.3 s', 44, 140);
      expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('Scale:'), 44, 156);
    });
  });

  describe('drawBodyLabel', () => {
    it('draws the name above the converted screen position', () => {
      const ctx = createMockContext();
      drawBodyLabel(ctx, [5, 5], 'Earth', worldToCanvas);
      expect(ctx.fillText).toHaveBeenCalledWith('Earth', 10, -2);
      expect(ctx.textAlign).toBe('center');
    });
  });

  describe('drawVelocityArrow', () => {
    it('draws a dashed line and an arrowhead, then clears the dash', () => {
      const ctx = createMockContext();
      drawVelocityArrow(ctx, { x: 0, y: 0 }, { x: 10, y: 0 });
      expect(ctx.setLineDash).toHaveBeenNthCalledWith(1, [4, 4]);
      expect(ctx.setLineDash).toHaveBeenNthCalledWith(2, []);
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(ctx.lineTo).toHaveBeenCalledWith(10, 0);
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('drawRing', () => {
    it('strokes a circle with the given style', () => {
      const ctx = createMockContext();
      drawRing(ctx, 5, 5, 10, '#00ff00', 2);
      expect(ctx.arc).toHaveBeenCalledWith(5, 5, 10, 0, Math.PI * 2);
      expect(ctx.strokeStyle).toBe('#00ff00');
      expect(ctx.lineWidth).toBe(2);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });
});
