import { SimulationState, LagrangePointSet } from './wasmBridge';

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
  public draw(state: SimulationState, history: [number, number][], showTrail: boolean, lagrangePoints: LagrangePointSet | null, viewport: ViewportConfig): void {
    const { width, height } = this.resize();
    this.clear();

    if (lagrangePoints) {
      this.drawLagrangePoints(lagrangePoints, viewport, width, height);
    }

    if (showTrail && history.length > 0) {
      this.drawTrail(history, 'rgba(46, 213, 115, 0.4)', viewport, width, height);
    }

    // Draw primary (M1), secondary (M2), and test particle
    this.drawBody(state.primary.position, state.primary.radius, '#f0932b', viewport, width, height);
    this.drawBody(state.secondary.position, state.secondary.radius, '#48dbfb', viewport, width, height);
    this.drawBody(state.testParticle.position, state.testParticle.radius, '#2ed573', viewport, width, height);

    this.drawOverlay(state, viewport);
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
  public drawBody(pos: [number, number], physicalRadius: number, color: string, viewport: ViewportConfig, width: number, height: number, isFixed = false): void {
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

    if (isFixed) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  /** Draws the historical trajectory trail of a body. */
  public drawTrail(history: [number, number][], color: string, viewport: ViewportConfig, width: number, height: number): void {
    if (!this.ctx) return;
    if (history.length < 2) return;

    this.ctx.beginPath();
    const start = this.worldToCanvas(history[0], viewport, width, height);
    this.ctx.moveTo(start.x, start.y);

    for (let i = 1; i < history.length; i++) {
      const next = this.worldToCanvas(history[i], viewport, width, height);
      this.ctx.lineTo(next.x, next.y);
    }

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  /** Draws Lagrange points L1 to L5 as markers. */
  public drawLagrangePoints(points: LagrangePointSet, viewport: ViewportConfig, width: number, height: number): void {
    if (!this.ctx) return;
    const labels: (keyof LagrangePointSet)[] = ['l1', 'l2', 'l3', 'l4', 'l5'];

    this.ctx.fillStyle = '#ff4757';
    this.ctx.font = '10px sans-serif';

    labels.forEach((label) => {
      const pt = points[label];
      const { x, y } = this.worldToCanvas(pt, viewport, width, height);

      this.ctx.strokeStyle = 'rgba(255, 71, 87, 0.8)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x - 5, y);
      this.ctx.lineTo(x + 5, y);
      this.ctx.moveTo(x, y - 5);
      this.ctx.lineTo(x, y + 5);
      this.ctx.stroke();

      this.ctx.fillText(label.toUpperCase(), x + 6, y - 4);
    });
  }

  /** Draws text telemetry overlays in the viewport. */
  public drawOverlay(state: SimulationState, viewport: ViewportConfig): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '11px monospace';

    const scaleString = `${(1 / viewport.scale).toExponential(3)} m/px`;
    // Offset Y coordinates to Y: 140/156 and X to 44px to clear the floating header card (top: 24px, padding: 16px)
    this.ctx.fillText(`Time: ${state.time.toFixed(1)} s`, 44, 140);
    this.ctx.fillText(`Scale: ${scaleString}`, 44, 156);
  }
}
