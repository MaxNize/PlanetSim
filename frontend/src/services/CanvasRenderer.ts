import { SimulationState, LagrangePointSet, Body } from './wasmBridge';
import { TrailHistory } from '../types';
import { drawTrail, drawLagrangePoints, drawOverlay, drawBodyLabel, drawVelocityArrow, drawRing } from './canvasHelpers';
import { ViewportConfig, worldToCanvas as toCanvas, canvasToWorld as toWorld } from './canvasCoords';
import { colors } from '../styles/tokens';

export type { ViewportConfig };

/** Which highlight rings to draw around a body (selection, lock, fixed-role, camera-tracking). */
export interface BodyMarkers {
  isFixed?: boolean;
  isSelected?: boolean;
  isLocked?: boolean;
  isTracked?: boolean;
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
  // 4 independent top-level rendering steps (early-return guard, optional Lagrange points,
  // sandbox-vs-fixed body dispatch, optional placement preview) — already delegated to helper
  // methods; wrapping single `if`s in more functions would only dodge the metric.
  // fallow-ignore-next-line complexity
  public draw(
    state: SimulationState,
    trailHistory: TrailHistory,
    showTrail: boolean,
    lagrangePoints: LagrangePointSet | null,
    viewport: ViewportConfig,
    placementPreview?: { position: [number, number]; velocity: [number, number]; radius: number; color: string },
    selectedBodyId?: string | null,
    trackedBodyId?: string | null,
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
      this.drawSandboxBodies(ctx, state.bodies, trailHistory, showTrail, viewport, width, height, selectedBodyId, trackedBodyId, wtc);
    } else {
      this.drawFixedBodies(ctx, state, trailHistory, showTrail, viewport, width, height, selectedBodyId, trackedBodyId, wtc);
    }

    if (placementPreview) {
      this.drawPlacementPreview(ctx, placementPreview, viewport, width, height, wtc);
    }

    drawOverlay(ctx, state, viewport.scale);
  }

  /** Draws the ghost body and, if it has a nonzero velocity, the directional launch arrow shown while placing a new body. */
  private drawPlacementPreview(
    ctx: CanvasRenderingContext2D,
    preview: { position: [number, number]; velocity: [number, number]; radius: number; color: string },
    viewport: ViewportConfig,
    width: number,
    height: number,
    wtc: (pos: [number, number]) => { x: number; y: number },
  ): void {
    this.drawBody(preview.position, preview.radius, preview.color, viewport, width, height);

    const velMag = Math.hypot(...preview.velocity);
    if (velMag === 0) return;

    const start = wtc(preview.position);
    const scaleVel = 1e1;
    const endPos: [number, number] = [preview.position[0] + preview.velocity[0] * scaleVel, preview.position[1] + preview.velocity[1] * scaleVel];
    drawVelocityArrow(ctx, start, wtc(endPos));
  }

  /** Renders the trails and discs for the fixed primary/secondary/test-particle bodies. */
  private drawFixedBodies(
    ctx: CanvasRenderingContext2D,
    state: SimulationState,
    trailHistory: TrailHistory,
    showTrail: boolean,
    viewport: ViewportConfig,
    width: number,
    height: number,
    selectedBodyId: string | null | undefined,
    trackedBodyId: string | null | undefined,
    wtc: (pos: [number, number]) => { x: number; y: number },
  ): void {
    const fixedBodies = [
      { id: 'primary', body: state.primary, color: '#f0932b', trail: trailHistory.primary },
      { id: 'secondary', body: state.secondary, color: '#48dbfb', trail: trailHistory.secondary },
      { id: 'testParticle', body: state.testParticle, color: '#2ed573', trail: trailHistory.testParticle },
    ];
    fixedBodies.forEach(({ id, body, color, trail }) => {
      if (showTrail) drawTrail(ctx, trail, color, wtc);
      this.drawBody(body.position, body.radius, color, viewport, width, height, { isSelected: selectedBodyId === id, isTracked: trackedBodyId === id });
    });
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
    trackedBodyId: string | null | undefined,
    wtc: (pos: [number, number]) => { x: number; y: number },
  ): void {
    // 3 independent per-body concerns: id fallback, optional trail, optional label — already minimal.
    // fallow-ignore-next-line complexity
    bodies.forEach((b, idx) => {
      const bodyId = b.id || `body-${idx}`;
      if (showTrail && trailHistory.customBodies?.[bodyId]) {
        drawTrail(ctx, trailHistory.customBodies[bodyId], b.color || colors.white, wtc);
      }
      this.drawBody(b.position, b.radius, b.color || colors.white, viewport, width, height, { isSelected: selectedBodyId === bodyId, isLocked: b.locked, isTracked: trackedBodyId === bodyId });
      if (b.name) drawBodyLabel(ctx, b.position, b.name, wtc);
    });
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
    this.ctx.fillStyle = colors.background;
    this.ctx.fillRect(0, 0, rect.width, rect.height);
  }

  /** Converts physics coordinate in meters to canvas screen coordinates. */
  public worldToCanvas(pos: [number, number], viewport: ViewportConfig, width: number, height: number): { x: number; y: number } {
    return toCanvas(pos, viewport, width, height);
  }

  /** Converts canvas screen coordinates to physics coordinates in meters. */
  public canvasToWorld(screenX: number, screenY: number, viewport: ViewportConfig, width: number, height: number): { x: number; y: number } {
    return toWorld(screenX, screenY, viewport, width, height);
  }

  /** Draws a celestial body on the canvas. */
  public drawBody(pos: [number, number], physicalRadius: number, color: string, viewport: ViewportConfig, width: number, height: number, markers: BodyMarkers = {}): void {
    const { isFixed = false, isSelected = false, isLocked = false, isTracked = false } = markers;
    if (!this.ctx) return;
    const { x, y } = this.worldToCanvas(pos, viewport, width, height);
    const radius = Math.max(4, physicalRadius * viewport.scale);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    const gradient = this.ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    gradient.addColorStop(0, colors.white);
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, '#000000');

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    const ctx = this.ctx;
    const rings: { active: boolean; color: string; lineWidth: number; offset: number }[] = [
      { active: isSelected, color: colors.selection, lineWidth: 2.5, offset: 5 },
      { active: isLocked, color: colors.warning, lineWidth: 1.5, offset: isSelected ? 8 : 4 },
      { active: isFixed, color: colors.white, lineWidth: 1.5, offset: 2 },
      { active: isTracked, color: colors.tracked, lineWidth: 2, offset: isSelected ? 13 : 9 },
    ];
    rings.forEach((ring) => {
      if (ring.active) drawRing(ctx, x, y, radius + ring.offset, ring.color, ring.lineWidth);
    });
  }
}
