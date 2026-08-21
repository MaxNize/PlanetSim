import React from 'react';
import { BodyPlacementDialog } from '../BodyPlacementDialog/BodyPlacementDialog';
import { BodyContextMenu, BodyContextMenuActions } from '../BodyContextMenu/BodyContextMenu';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';
import { SandboxBody } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useSimulationAnimation } from '../../context/SimulationAnimationContext';

export interface CanvasOverlaysProps extends BodyContextMenuActions {
  contextMenu: { x: number; y: number; body: SandboxBody } | null;
  onContextMenuClose: () => void;
  editingBody: SandboxBody | null;
  onEditConfirm: (updated: SandboxBody) => void;
  onEditCancel: () => void;
  showPlacementDialog: boolean;
  placedWorldPos: [number, number] | null;
  draggedVel: [number, number];
  onPlacementConfirm: (body: SandboxBody) => void;
  onPlacementDialogCancel: () => void;
}

/** Renders the context menu, edit dialog, placement dialog, and live FPS HUD overlay on the canvas. */
// fallow-ignore-next-line complexity
export function CanvasOverlays({
  contextMenu,
  onContextMenuClose,
  showFullMenu,
  isTracked,
  onTrackToggle,
  isInMiniview,
  onMiniviewToggle,
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
  const { mode } = useSimulationContext();
  const { fps, fpsStatus, currentState } = useSimulationAnimation();
  const bodyCount = mode === 'sandbox' && currentState.bodies ? currentState.bodies.length : 3;

  return (
    <>
      {/* Floating Canvas HUD for FPS and Body Count */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          background: 'rgba(5, 7, 10, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: fpsStatus === 'smooth' ? '#2ed573' : fpsStatus === 'moderate' ? '#feca57' : '#ff6b6b',
              boxShadow: `0 0 8px ${fpsStatus === 'smooth' ? '#2ed573' : fpsStatus === 'moderate' ? '#feca57' : '#ff6b6b'}`,
            }}
          />
          <span style={{ color: fpsStatus === 'smooth' ? '#2ed573' : fpsStatus === 'moderate' ? '#feca57' : '#ff6b6b' }}>{fps !== undefined ? fps : 60} FPS</span>
        </div>
        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
        <span style={{ color: '#cbd5e1' }}>{bodyCount} Bodies</span>
      </div>

      {contextMenu && (
        <BodyContextMenu
          body={contextMenu.body}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          showFullMenu={showFullMenu}
          isTracked={isTracked}
          onTrackToggle={onTrackToggle}
          isInMiniview={isInMiniview}
          onMiniviewToggle={onMiniviewToggle}
          onEdit={onEdit}
          onLockToggle={onLockToggle}
          onDelete={onDelete}
          onClose={onContextMenuClose}
        />
      )}

      {editingBody && <BodyEditDialog body={editingBody} onConfirm={onEditConfirm} onCancel={onEditCancel} />}

      {showPlacementDialog && placedWorldPos && <BodyPlacementDialog position={placedWorldPos} initialVelocity={draggedVel} onConfirm={onPlacementConfirm} onCancel={onPlacementDialogCancel} />}
    </>
  );
}
