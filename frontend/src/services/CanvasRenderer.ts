import { SimulationState, LagrangePointSet, Body } from './wasmBridge';
import { TrailHistory } from '../types';
import { drawTrail, drawLagrangePoints, drawOverlay, drawBodyLabel, drawVelocityArrow, drawRing } from './canvasHelpers';
import { ViewportConfig, worldToCanvas as toCanvas, canvasToWorld as toWorld } from './canvasCoords';
import { BodyGradientCache } from './BodyGradientCache';
import { colors } from '../styles/tokens';

export type { ViewportConfig };

/** Shared per-frame budget for trail points, split across bodies. See decimateTrail in canvasHelpers.ts. */
const TRAIL_POINT_BUDGET = 10_000;
const MIN_TRAIL_POINTS_PER_BODY = 20;

type SandboxRenderBody = Body & { id?: string; name?: string; color?: string; locked?: boolean };
type WorldToCanvasFn = (pos: [number, number]) => { x: number; y: number };

/** Which highlight rings to draw around a body (selection, lock, fixed-role, camera-tracking). */
export interface BodyMarkers {
  isFixed?: boolean;
  isSelected?: boolean;
  isLocked?: boolean;
  isTracked?: boolean;
}

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  viewport: ViewportConfig;
  width: number;
  height: number;
  selectedBodyId?: string | null;
  trackedBodyId?: string | null;
  wtc: WorldToCanvasFn;
  trailPointBudget: number;
}

/** Handles 2D HTML5 Canvas rendering logic (coordinate system mapping and pan/zoom). */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D | null;
  private canvas: HTMLCanvasElement;
  private gradientCache = new BodyGradientCache();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  private calculateTrailBudget(bodies?: Body[]): number {
    const count = bodies ? bodies.length : 3;
    return Math.max(MIN_TRAIL_POINTS_PER_BODY, Math.floor(TRAIL_POINT_BUDGET / Math.max(1, count)));
  }

  private renderBodies(rc: RenderContext, state: SimulationState, trailHistory: TrailHistory, showTrail: boolean): void {
    if (state.bodies) {
      this.drawSandboxBodies(rc, state.bodies, trailHistory, showTrail);
    } else {
      this.drawFixedBodies(rc, state, trailHistory, showTrail);
    }
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
    trackedBodyId?: string | null,
  ): void {
    const { width, height } = this.resize();
    this.clear();
    const ctx = this.ctx;
    if (!ctx) return;

    const wtc: WorldToCanvasFn = (pos) => this.worldToCanvas(pos, viewport, width, height);
    if (lagrangePoints) drawLagrangePoints(ctx, lagrangePoints, wtc);

    const trailPointBudget = this.calculateTrailBudget(state.bodies);
    const rc: RenderContext = { ctx, viewport, width, height, selectedBodyId, trackedBodyId, wtc, trailPointBudget };

    this.renderBodies(rc, state, trailHistory, showTrail);
    if (placementPreview) this.drawPlacementPreview(rc, placementPreview);
    drawOverlay(ctx, state, viewport.scale);
  }

  /** Draws the ghost body and, if it has a nonzero velocity, the directional launch arrow shown while placing a new body. */
  private drawPlacementPreview(rc: RenderContext, preview: { position: [number, number]; velocity: [number, number]; radius: number; color: string }): void {
    this.drawBody(preview.position, preview.radius, preview.color, rc.viewport, rc.width, rc.height);
    const velMag = Math.hypot(...preview.velocity);
    if (velMag === 0) return;
    const start = rc.wtc(preview.position);
    const scaleVel = 1e1;
    const endPos: [number, number] = [preview.position[0] + preview.velocity[0] * scaleVel, preview.position[1] + preview.velocity[1] * scaleVel];
    drawVelocityArrow(rc.ctx, start, rc.wtc(endPos));
  }

  /** Renders the trails and discs for the fixed primary/secondary/test-particle bodies. */
  private drawFixedBodies(rc: RenderContext, state: SimulationState, trailHistory: TrailHistory, showTrail: boolean): void {
    const fixedBodies = [
      { id: 'primary', body: state.primary, color: colors.primaryBody, trail: trailHistory.primary },
      { id: 'secondary', body: state.secondary, color: colors.secondaryBody, trail: trailHistory.secondary },
      { id: 'testParticle', body: state.testParticle, color: colors.testParticleBody, trail: trailHistory.testParticle },
    ];
    fixedBodies.forEach(({ id, body, color, trail }) => {
      if (showTrail) drawTrail(rc.ctx, trail, color, rc.wtc, rc.trailPointBudget);
      this.drawBody(body.position, body.radius, color, rc.viewport, rc.width, rc.height, { isSelected: rc.selectedBodyId === id, isTracked: rc.trackedBodyId === id });
    });
  }

  private getSandboxBodyVisuals(b: SandboxRenderBody, idx: number) {
    return {
      bodyId: b.id || `body-${idx}`,
      color: b.color || colors.white,
    };
  }

  private drawSandboxBodyTrail(rc: RenderContext, trailHistory: TrailHistory, bodyId: string, color: string, showTrail: boolean): void {
    if (!showTrail || !trailHistory.customBodies) return;
    const trail = trailHistory.customBodies[bodyId];
    if (trail) drawTrail(rc.ctx, trail, color, rc.wtc, rc.trailPointBudget);
  }

  private drawSingleSandboxBody(rc: RenderContext, b: SandboxRenderBody, idx: number, trailHistory: TrailHistory, showTrail: boolean): void {
    const { bodyId, color } = this.getSandboxBodyVisuals(b, idx);
    this.drawSandboxBodyTrail(rc, trailHistory, bodyId, color, showTrail);
    const markers: BodyMarkers = { isSelected: rc.selectedBodyId === bodyId, isLocked: b.locked, isTracked: rc.trackedBodyId === bodyId };
    this.drawBody(b.position, b.radius, color, rc.viewport, rc.width, rc.height, markers);
    if (b.name) drawBodyLabel(rc.ctx, b.position, b.name, rc.wtc);
  }

  /** Renders each sandbox body's trail, disc, and optional name label. */
  private drawSandboxBodies(rc: RenderContext, bodies: SandboxRenderBody[], trailHistory: TrailHistory, showTrail: boolean): void {
    bodies.forEach((b, idx) => this.drawSingleSandboxBody(rc, b, idx, trailHistory, showTrail));
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

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.gradientCache.get(this.ctx, color, radius);
    this.ctx.fill();
    this.ctx.restore();

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
