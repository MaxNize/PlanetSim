import { LagrangePointSet, SimulationState } from './wasmBridge';

/**
 * Draws a fading trajectory trail for a celestial body.
 */
export function drawTrail(ctx: CanvasRenderingContext2D, history: [number, number][], color: string, worldToCanvas: (pos: [number, number]) => { x: number; y: number }): void {
  const len = history.length;
  if (len < 2) return;

  const numSections = Math.min(10, len - 1);
  const sectionSize = Math.ceil(len / numSections);

  for (let s = 0; s < numSections; s++) {
    const startIdx = s * sectionSize;
    const endIdx = Math.min(len - 1, (s + 1) * sectionSize);

    if (startIdx >= endIdx) continue;

    ctx.beginPath();
    const firstPoint = worldToCanvas(history[startIdx]);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = startIdx + 1; i <= endIdx; i++) {
      const pt = worldToCanvas(history[i]);
      ctx.lineTo(pt.x, pt.y);
    }

    ctx.globalAlpha = ((s + 1) / numSections) * 0.45;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
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
