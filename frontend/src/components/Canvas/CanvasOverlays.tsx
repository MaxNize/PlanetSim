import { BodyPlacementDialog } from '../BodyPlacementDialog/BodyPlacementDialog';
import { BodyContextMenu, BodyContextMenuActions } from '../BodyContextMenu/BodyContextMenu';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';
import { SandboxBody } from '../../types';

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
  return (
    <>
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
