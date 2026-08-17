export interface ViewportConfig {
  scale: number; // pixels per meter
  pan: { x: number; y: number }; // physical center offset in meters
}

/** Converts a physics coordinate in meters to canvas-local pixel coordinates. */
export function worldToCanvas(pos: [number, number], viewport: ViewportConfig, width: number, height: number): { x: number; y: number } {
  const centerX = width / 2;
  const centerY = height / 2;
  return {
    x: centerX + (pos[0] - viewport.pan.x) * viewport.scale,
    y: centerY - (pos[1] - viewport.pan.y) * viewport.scale,
  };
}

/** Converts canvas-local pixel coordinates to a physics coordinate in meters. */
export function canvasToWorld(screenX: number, screenY: number, viewport: ViewportConfig, width: number, height: number): { x: number; y: number } {
  const centerX = width / 2;
  const centerY = height / 2;
  return {
    x: (screenX - centerX) / viewport.scale + viewport.pan.x,
    y: (centerY - screenY) / viewport.scale + viewport.pan.y,
  };
}
