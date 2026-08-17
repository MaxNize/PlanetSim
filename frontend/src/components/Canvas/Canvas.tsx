import React, { useRef, useEffect } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { CanvasRenderer } from '../../services/CanvasRenderer';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { computePlacementPreview, getCanvasCursor } from './canvasVisuals';
import { CanvasOverlays } from './CanvasOverlays';
import { MiniviewCanvas } from '../MiniviewCanvas/MiniviewCanvas';
import { SandboxBody } from '../../types';

interface CanvasProps {
  showTrail?: boolean;
  onPlacementComplete?: (body: SandboxBody) => void;
}

/**
 * Renders the interactive simulation viewport canvas. In sandbox mode, clicking and dragging on
 * empty canvas space creates a new body directly — no separate placement-mode toggle (FP-38).
 */
// Composition root wiring viewport rendering, pointer interaction, and the overlay stack together —
// the size follows from being the single place that owns the canvas element, not accidental sprawl.
// fallow-ignore-next-line complexity
export function Canvas({ showTrail = true, onPlacementComplete }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const { currentState, lagrangePoints, trailHistory, showTrail: contextShowTrail, selectedBodyId, removeBody, updateBody, miniviewBodyId, setMiniviewBodyId, toggleMiniview } = useSimulationContext();
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
    trackedBodyId,
    toggleTracking,
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

    rendererRef.current.draw(currentState, trailHistory, activeShowTrail, lagrangePoints, viewport, preview, selectedBodyId, trackedBodyId);
  }, [
    currentState,
    viewport,
    trailHistory,
    activeShowTrail,
    lagrangePoints,
    dimensions,
    mode,
    isPlacingBody,
    hoverWorldPos,
    placedWorldPos,
    draggedVel,
    isHoveringBody,
    selectedBodyId,
    trackedBodyId,
  ]);

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
        showFullMenu={mode === 'sandbox'}
        isTracked={!!contextMenu && contextMenu.body.id === trackedBodyId}
        onTrackToggle={toggleTracking}
        isInMiniview={!!contextMenu && contextMenu.body.id === miniviewBodyId}
        onMiniviewToggle={toggleMiniview}
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

      {miniviewBodyId && <MiniviewCanvas bodyId={miniviewBodyId} onClose={() => setMiniviewBodyId(null)} />}
    </>
  );
}
