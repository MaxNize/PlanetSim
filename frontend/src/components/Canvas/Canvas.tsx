import React, { useRef, useEffect } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { CanvasRenderer } from '../../services/CanvasRenderer';
import { BodyPlacementDialog } from '../BodyPlacementDialog/BodyPlacementDialog';
import { BodyContextMenu } from '../BodyContextMenu/BodyContextMenu';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { SandboxBody, SimulationMode } from '../../types';
import { colors } from '../../styles/tokens';

interface CanvasProps {
  showTrail?: boolean;
  onPlacementComplete?: (body: SandboxBody) => void;
}

/** Live preview of the body being created: a solid drag-preview while placing, or a translucent
 * hover hint over empty sandbox canvas space (never over an existing body). */
// Three independently-optional guards (actively placing vs. just hovering vs. hovering a body) —
// already minimal.
// fallow-ignore-next-line complexity
function computePlacementPreview(
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
function getCanvasCursor(isDragging: boolean, isSpacePressed: boolean, mode: SimulationMode, isHoveringBody: boolean): string {
  if (isDragging) return 'grabbing';
  if (isSpacePressed) return 'grab';
  if (mode === 'sandbox' && !isHoveringBody) return 'crosshair';
  return 'default';
}

interface CanvasOverlaysProps {
  contextMenu: { x: number; y: number; body: SandboxBody } | null;
  onContextMenuClose: () => void;
  onEdit: (body: SandboxBody) => void;
  onLockToggle: (body: SandboxBody) => void;
  onDelete: (body: SandboxBody) => void;
  editingBody: SandboxBody | null;
  onEditConfirm: (updated: SandboxBody) => void;
  onEditCancel: () => void;
  showPlacementDialog: boolean;
  placedWorldPos: [number, number] | null;
  draggedVel: [number, number];
  onPlacementConfirm: (body: SandboxBody) => void;
  onPlacementDialogCancel: () => void;
}

/** Renders the context menu, edit dialog, and placement dialog overlays for the canvas, each conditionally. */
// 3 independently-optional overlays bundled into one component to keep Canvas itself small; the
// prop count is the sum of what each of those 3 pieces needs, not accidental sprawl.
// fallow-ignore-next-line complexity
function CanvasOverlays({
  contextMenu,
  onContextMenuClose,
  onEdit,
  onLockToggle,
  onDelete,
  editingBody,
  onEditConfirm,
  onEditCancel,
  showPlacementDialog,
  placedWorldPos,
  draggedVel,
  onPlacementConfirm,
  onPlacementDialogCancel,
}: CanvasOverlaysProps) {
  return (
    <>
      {contextMenu && (
        <BodyContextMenu body={contextMenu.body} position={{ x: contextMenu.x, y: contextMenu.y }} onEdit={onEdit} onLockToggle={onLockToggle} onDelete={onDelete} onClose={onContextMenuClose} />
      )}

      {editingBody && <BodyEditDialog body={editingBody} onConfirm={onEditConfirm} onCancel={onEditCancel} />}

      {showPlacementDialog && placedWorldPos && <BodyPlacementDialog position={placedWorldPos} initialVelocity={draggedVel} onConfirm={onPlacementConfirm} onCancel={onPlacementDialogCancel} />}
    </>
  );
}

/**
 * Renders the interactive simulation viewport canvas. In sandbox mode, clicking and dragging on
 * empty canvas space creates a new body directly — no separate placement-mode toggle (FP-38).
 */
export function Canvas({ showTrail = true, onPlacementComplete }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const { currentState, lagrangePoints, trailHistory, showTrail: contextShowTrail, selectedBodyId, removeBody, updateBody } = useSimulationContext();
  const activeShowTrail = showTrail && contextShowTrail;

  const {
    viewport,
    dimensions,
    isDragging,
    isSpacePressed,
    mode,
    isPlacingBody,
    isHoveringBody,
    hoverWorldPos,
    placedWorldPos,
    draggedVel,
    showDialog,
    setShowDialog,
    setPlacedWorldPos,
    setDraggedVel,
    contextMenu,
    setContextMenu,
    editingBody,
    setEditingBody,
    handleMouseDown,
    handleContextMenu,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
  } = useCanvasInteraction({ canvasRef });

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) rendererRef.current = new CanvasRenderer(canvasRef.current);

    const preview = computePlacementPreview(mode, isPlacingBody, placedWorldPos, draggedVel, hoverWorldPos, isHoveringBody);

    rendererRef.current.draw(currentState, trailHistory, activeShowTrail, lagrangePoints, viewport, preview, selectedBodyId);
  }, [currentState, viewport, trailHistory, activeShowTrail, lagrangePoints, dimensions, mode, isPlacingBody, hoverWorldPos, placedWorldPos, draggedVel, isHoveringBody, selectedBodyId]);

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        aria-label="Celestial simulation rendering area"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: getCanvasCursor(isDragging, isSpacePressed, mode, isHoveringBody),
          outline: 'none',
        }}
      />

      <CanvasOverlays
        contextMenu={contextMenu}
        onContextMenuClose={() => setContextMenu(null)}
        onEdit={(b) => setEditingBody(b)}
        onLockToggle={(b) => updateBody(b.id, { locked: !b.locked })}
        onDelete={(b) => removeBody(b.id)}
        editingBody={editingBody}
        onEditConfirm={(updated) => {
          updateBody(updated.id, updated);
          setEditingBody(null);
        }}
        onEditCancel={() => setEditingBody(null)}
        showPlacementDialog={showDialog}
        placedWorldPos={placedWorldPos}
        draggedVel={draggedVel}
        onPlacementConfirm={(body) => {
          setShowDialog(false);
          setPlacedWorldPos(null);
          setDraggedVel([0, 0]);
          if (onPlacementComplete) onPlacementComplete(body);
        }}
        onPlacementDialogCancel={() => {
          setShowDialog(false);
          setPlacedWorldPos(null);
          setDraggedVel([0, 0]);
        }}
      />
    </>
  );
}
