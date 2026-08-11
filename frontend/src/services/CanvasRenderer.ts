import { SimulationState, LagrangePointSet, Body } from './wasmBridge';
import { TrailHistory } from '../types';
import { drawTrail, drawLagrangePoints, drawOverlay, drawBodyLabel } from './canvasHelpers';

export interface ViewportConfig {
  scale: number; // pixels per meter
  pan: { x: number; y: number }; // physical center offset in meters
}

/** Handles 2D HTML5 Canvas rendering logic (coordinate system mapping and pan/zoom). */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D | null;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /** Main render method that coordinates drawing the entire simulation state. */
  public draw(
    state: SimulationState,
    trailHistory: TrailHistory,
    showTrail: boolean,
    lagrangePoints: LagrangePointSet | null,
    viewport: ViewportConfig,
    placementPreview?: { position: [number, number]; velocity: [number, number]; radius: number; color: string },
    selectedBodyId?: string | null,
  ): void {
    const { width, height } = this.resize();
    this.clear();
    const ctx = this.ctx;
    if (!ctx) return;

    const wtc = (pos: [number, number]) => this.worldToCanvas(pos, viewport, width, height);

    if (lagrangePoints) {
      drawLagrangePoints(ctx, lagrangePoints, wtc);
    }

    if (state.bodies) {
      this.drawSandboxBodies(ctx, state.bodies, trailHistory, showTrail, viewport, width, height, selectedBodyId, wtc);
    } else {
      if (showTrail) {
        drawTrail(ctx, trailHistory.primary, '#f0932b', wtc);
        drawTrail(ctx, trailHistory.secondary, '#48dbfb', wtc);
        drawTrail(ctx, trailHistory.testParticle, '#2ed573', wtc);
      }
      this.drawBody(state.primary.position, state.primary.radius, '#f0932b', viewport, width, height, false, selectedBodyId === 'primary');
      this.drawBody(state.secondary.position, state.secondary.radius, '#48dbfb', viewport, width, height, false, selectedBodyId === 'secondary');
      this.drawBody(state.testParticle.position, state.testParticle.radius, '#2ed573', viewport, width, height, false, selectedBodyId === 'testParticle');
    }

    if (placementPreview) {
      const p = placementPreview;
      this.drawBody(p.position, p.radius, p.color, viewport, width, height);

      const velMag = Math.hypot(...p.velocity);
      if (velMag > 0) {
        const start = wtc(p.position);
        const scaleVel = 1e1;
        const endPos: [number, number] = [p.position[0] + p.velocity[0] * scaleVel, p.position[1] + p.velocity[1] * scaleVel];
        this.drawVelocityArrow(ctx, start, wtc(endPos));
      }
    }

    drawOverlay(ctx, state, viewport.scale);
  }

  /** Renders each sandbox body's trail, disc, and optional name label. */
  private drawSandboxBodies(
    ctx: CanvasRenderingContext2D,
    bodies: (Body & { id?: string; name?: string; color?: string; locked?: boolean })[],
    trailHistory: TrailHistory,
    showTrail: boolean,
    viewport: ViewportConfig,
    width: number,
    height: number,
    selectedBodyId: string | null | undefined,
    wtc: (pos: [number, number]) => { x: number; y: number },
  ): void {
    bodies.forEach((b, idx) => {
      const bodyId = b.id || `body-${idx}`;
      const isSelected = selectedBodyId === bodyId;
      if (showTrail && trailHistory.customBodies && trailHistory.customBodies[bodyId]) {
        drawTrail(ctx, trailHistory.customBodies[bodyId], b.color || '#fff', wtc);
      }
      this.drawBody(b.position, b.radius, b.color || '#fff', viewport, width, height, false, isSelected, b.locked);
      if (b.name) {
        drawBodyLabel(ctx, b.position, b.name, wtc);
      }
    });
  }

  /** Draws a directional arrow representing a velocity vector preview. */
  private drawVelocityArrow(ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }): void {
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.fillStyle = '#3b82f6';
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - 8 * Math.cos(angle - Math.PI / 6), end.y - 8 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - 8 * Math.cos(angle + Math.PI / 6), end.y - 8 * Math.sin(angle + Math.PI / 6));
    ctx.fill();
  }

  /** Resizes canvas to match client dimensions, accounting for high-DPI screens. */
  public resize(): { width: number; height: number } {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    if (this.ctx) {
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    }
    return { width: rect.width, height: rect.height };
  }

  /** Clears the canvas with a deep-space dark background. */
  public clear(): void {
    if (!this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.fillStyle = '#05070a';
    this.ctx.fillRect(0, 0, rect.width, rect.height);
  }

  /** Converts physics coordinate in meters to canvas screen coordinates. */
  public worldToCanvas(pos: [number, number], viewport: ViewportConfig, width: number, height: number): { x: number; y: number } {
    const centerX = width / 2;
    const centerY = height / 2;
    return {
      x: centerX + (pos[0] - viewport.pan.x) * viewport.scale,
      y: centerY - (pos[1] - viewport.pan.y) * viewport.scale,
    };
  }

  /** Converts canvas screen coordinates to physics coordinates in meters. */
  public canvasToWorld(screenX: number, screenY: number, viewport: ViewportConfig, width: number, height: number): { x: number; y: number } {
    const centerX = width / 2;
    const centerY = height / 2;
    return {
      x: (screenX - centerX) / viewport.scale + viewport.pan.x,
      y: (centerY - screenY) / viewport.scale + viewport.pan.y,
    };
  }

  /** Draws a celestial body on the canvas. */
  public drawBody(
    pos: [number, number],
    physicalRadius: number,
    color: string,
    viewport: ViewportConfig,
    width: number,
    height: number,
    isFixed = false,
    isSelected = false,
    isLocked = false,
  ): void {
    if (!this.ctx) return;
    const { x, y } = this.worldToCanvas(pos, viewport, width, height);
    const radius = Math.max(4, physicalRadius * viewport.scale);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    const gradient = this.ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, '#000000');

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    if (isSelected) {
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    if (isLocked) {
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + (isSelected ? 8 : 4), 0, Math.PI * 2);
      this.ctx.stroke();
    }

    if (isFixed) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }
}
