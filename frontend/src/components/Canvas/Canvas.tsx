import React, { useRef, useEffect } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { CanvasRenderer } from '../../services/CanvasRenderer';
import { BodyPlacementDialog } from '../BodyPlacementDialog/BodyPlacementDialog';
import { BodyContextMenu } from '../BodyContextMenu/BodyContextMenu';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { SandboxBody } from '../../types';

interface CanvasProps {
  showTrail?: boolean;
  placementActive?: boolean;
  onPlacementCancel?: () => void;
  onPlacementComplete?: (body: SandboxBody) => void;
}

// Two independent simple guards (has a placed point vs. is just hovering) — already minimal.
// fallow-ignore-next-line complexity
function computePlacementPreview(
  placementActive: boolean,
  placedWorldPos: [number, number] | null,
  draggedVel: [number, number],
  hoverWorldPos: [number, number] | null,
): { position: [number, number]; velocity: [number, number]; radius: number; color: string } | undefined {
  if (placementActive && placedWorldPos) {
    return { position: placedWorldPos, velocity: draggedVel, radius: 6.371e6, color: '#3b82f6' };
  }
  if (placementActive && hoverWorldPos) {
    return { position: hoverWorldPos, velocity: [0, 0], radius: 6.371e6, color: 'rgba(59, 130, 246, 0.4)' };
  }
  return undefined;
}

/** Picks the mouse cursor for the current interaction state (dragging > space-panning > placing > default). */
function getCanvasCursor(isDragging: boolean, isSpacePressed: boolean, placementActive: boolean): string {
  if (isDragging) return 'grabbing';
  if (isSpacePressed) return 'grab';
  if (placementActive) return 'crosshair';
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
 * Renders the interactive simulation viewport canvas.
 */
export function Canvas({ showTrail = true, placementActive = false, onPlacementCancel, onPlacementComplete }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const { currentState, lagrangePoints, trailHistory, showTrail: contextShowTrail, selectedBodyId, removeBody, updateBody } = useSimulationContext();
  const activeShowTrail = showTrail && contextShowTrail;

  const {
    viewport,
    dimensions,
    isDragging,
    isSpacePressed,
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
    handleWheel,
  } = useCanvasInteraction({ canvasRef, placementActive, onPlacementCancel });

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) rendererRef.current = new CanvasRenderer(canvasRef.current);

    const preview = computePlacementPreview(placementActive, placedWorldPos, draggedVel, hoverWorldPos);

    rendererRef.current.draw(currentState, trailHistory, activeShowTrail, lagrangePoints, viewport, preview, selectedBodyId);
  }, [currentState, viewport, trailHistory, activeShowTrail, lagrangePoints, dimensions, placementActive, hoverWorldPos, placedWorldPos, draggedVel, selectedBodyId]);

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        aria-label="Celestial simulation rendering area"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: getCanvasCursor(isDragging, isSpacePressed, placementActive),
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
          if (onPlacementCancel) onPlacementCancel();
        }}
      />
    </>
  );
}
