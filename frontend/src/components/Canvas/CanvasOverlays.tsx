import { BodyPlacementDialog } from '../BodyPlacementDialog/BodyPlacementDialog';
import { BodyContextMenu } from '../BodyContextMenu/BodyContextMenu';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';
import { SandboxBody } from '../../types';

export interface CanvasOverlaysProps {
  contextMenu: { x: number; y: number; body: SandboxBody } | null;
  onContextMenuClose: () => void;
  showFullMenu: boolean;
  isTracked: boolean;
  onTrackToggle: (body: SandboxBody) => void;
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
export function CanvasOverlays({
  contextMenu,
  onContextMenuClose,
  showFullMenu,
  isTracked,
  onTrackToggle,
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
        <BodyContextMenu
          body={contextMenu.body}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          showFullMenu={showFullMenu}
          isTracked={isTracked}
          onTrackToggle={onTrackToggle}
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
