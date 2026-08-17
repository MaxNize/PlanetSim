import { LagrangePointSet, SimulationState } from './wasmBridge';
import { colors } from '../styles/tokens';

function drawTrailSection(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  startIdx: number,
  endIdx: number,
  color: string,
  alpha: number,
  worldToCanvas: (pos: [number, number]) => { x: number; y: number },
): void {
  ctx.beginPath();
  const firstPoint = worldToCanvas(points[startIdx]);
  ctx.moveTo(firstPoint.x, firstPoint.y);

  for (let i = startIdx + 1; i <= endIdx; i++) {
    const pt = worldToCanvas(points[i]);
    ctx.lineTo(pt.x, pt.y);
  }

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/**
 * Draws a fading trajectory trail for a celestial body.
 */
export function drawTrail(ctx: CanvasRenderingContext2D, history: [number, number][], color: string, worldToCanvas: (pos: [number, number]) => { x: number; y: number }): void {
  const len = history.length;
  if (len < 2) return;

  const numSections = Math.min(10, len - 1);
  const sectionSize = Math.ceil(len / numSections);

  const sections = Array.from({ length: numSections }, (index, s) => ({
    s,
    startIdx: s * sectionSize,
    endIdx: Math.min(len - 1, (s + 1) * sectionSize),
  })).filter(({ startIdx, endIdx }) => startIdx < endIdx);

  sections.forEach(({ s, startIdx, endIdx }) => {
    drawTrailSection(ctx, history, startIdx, endIdx, color, ((s + 1) / numSections) * 0.45, worldToCanvas);
  });

  ctx.globalAlpha = 1.0;
}

/**
 * Draws markers and labels for Lagrange points L1 to L5.
 */
export function drawLagrangePoints(ctx: CanvasRenderingContext2D, points: LagrangePointSet, worldToCanvas: (pos: [number, number]) => { x: number; y: number }): void {
  const labels: (keyof LagrangePointSet)[] = ['l1', 'l2', 'l3', 'l4', 'l5'];

  ctx.fillStyle = '#ff4757';
  ctx.font = '10px sans-serif';

  labels.forEach((label) => {
    const pt = points[label];
    const { x, y } = worldToCanvas(pt);

    ctx.strokeStyle = 'rgba(255, 71, 87, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, y);
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x, y + 5);
    ctx.stroke();

    ctx.fillText(label.toUpperCase(), x + 6, y - 4);
  });
}

/**
 * Draws text overlays for time and grid scale.
 */
export function drawOverlay(ctx: CanvasRenderingContext2D, state: SimulationState, scale: number): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '11px monospace';

  const scaleString = `${(1 / scale).toExponential(3)} m/px`;
  ctx.fillText(`Time: ${state.time.toFixed(1)} s`, 44, 140);
  ctx.fillText(`Scale: ${scaleString}`, 44, 156);
}

/**
 * Draws a textual name label above a body's position.
 */
export function drawBodyLabel(ctx: CanvasRenderingContext2D, pos: [number, number], name: string, worldToCanvas: (pos: [number, number]) => { x: number; y: number }): void {
  const screenPos = worldToCanvas(pos);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = "11px 'Outfit', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(name, screenPos.x, screenPos.y - 12);
}

/**
 * Draws a directional arrow representing a velocity vector preview.
 */
export function drawVelocityArrow(ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }): void {
  ctx.beginPath();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]);

  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  ctx.beginPath();
  ctx.fillStyle = colors.accent;
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - 8 * Math.cos(angle - Math.PI / 6), end.y - 8 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(end.x - 8 * Math.cos(angle + Math.PI / 6), end.y - 8 * Math.sin(angle + Math.PI / 6));
  ctx.fill();
}

/**
 * Strokes a single decoration ring (selection/lock/fixed indicator) around a body.
 */
export function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, lineWidth: number): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}
