import { SimulationMode } from '../../types';
import { colors } from '../../styles/tokens';

/** Live preview of the body being created: a solid drag-preview while placing, or a translucent
 * hover hint over empty sandbox canvas space (never over an existing body). */
// Three independently-optional guards (actively placing vs. just hovering vs. hovering a body) —
// already minimal.
// fallow-ignore-next-line complexity
export function computePlacementPreview(
  mode: SimulationMode,
  isPlacingBody: boolean,
  placedWorldPos: [number, number] | null,
  draggedVel: [number, number],
  hoverWorldPos: [number, number] | null,
  isHoveringBody: boolean,
): { position: [number, number]; velocity: [number, number]; radius: number; color: string } | undefined {
  if (isPlacingBody && placedWorldPos) {
    return { position: placedWorldPos, velocity: draggedVel, radius: 6.371e6, color: colors.accent };
  }
  if (mode === 'sandbox' && hoverWorldPos && !isHoveringBody) {
    return { position: hoverWorldPos, velocity: [0, 0], radius: 6.371e6, color: 'rgba(59, 130, 246, 0.4)' };
  }
  return undefined;
}

/** Picks the mouse cursor for the current interaction state (dragging > space-panning > sandbox-create-hint > default). */
export function getCanvasCursor(isDragging: boolean, isSpacePressed: boolean, mode: SimulationMode, isHoveringBody: boolean): string {
  if (isDragging) return 'grabbing';
  if (isSpacePressed) return 'grab';
  if (mode === 'sandbox' && !isHoveringBody) return 'crosshair';
  return 'default';
}
