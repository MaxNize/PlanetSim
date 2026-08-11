import { useRef, useEffect, useState } from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { ViewportConfig } from '../services/CanvasRenderer';
import { SandboxBody } from '../types';

interface CanvasInteractionOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  placementActive: boolean;
  onPlacementCancel?: () => void;
}

/** Hook for managing canvas viewport zooming, panning, placement, selection, and context menu events. */
export function useCanvasInteraction({ canvasRef, placementActive, onPlacementCancel }: CanvasInteractionOptions) {
  const lastMousePos = useRef({ x: 0, y: 0 });
  const { currentState, setSelectedBodyId, sandboxBodies } = useSimulationContext();

  const [viewport, setViewport] = useState<ViewportConfig>({ scale: 1e-6, pan: { x: 1.5e8, y: 0.0 } });
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Placement & Editing State
  const [hoverWorldPos, setHoverWorldPos] = useState<[number, number] | null>(null);
  const [placementStage, setPlacementStage] = useState<'idle' | 'position' | 'velocity'>('idle');
  const [placedWorldPos, setPlacedWorldPos] = useState<[number, number] | null>(null);
  const [draggedVel, setDraggedVel] = useState<[number, number]>([0, 0]);
  const [showDialog, setShowDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; body: SandboxBody } | null>(null);
  const [editingBody, setEditingBody] = useState<SandboxBody | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(e.type === 'keydown');
      }
      if (e.type === 'keydown' && e.key === 'Escape') {
        setPlacementStage('idle');
        setPlacedWorldPos(null);
        setDraggedVel([0, 0]);
        setContextMenu(null);
        if (onPlacementCancel) onPlacementCancel();
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [onPlacementCancel]);

  const screenToWorld = (screenX: number, screenY: number): [number, number] => {
    if (!canvasRef.current) return [0, 0];
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    return [
      (screenX - rect.left - centerX) / viewport.scale + viewport.pan.x,
      (centerY - (screenY - rect.top)) / viewport.scale + viewport.pan.y,
    ];
  };

  const findBodyAtPosition = (worldPos: [number, number]): SandboxBody | null => {
    // currentState.bodies is always fully enriched with id/color by the time it's set (see SimulationProvider.handleStep and useSandbox).
    const bodies = (currentState.bodies || sandboxBodies) as SandboxBody[];
    if (!bodies || bodies.length === 0) return null;
    const minHitRadiusMeters = 15 / viewport.scale;

    for (const b of bodies) {
      const dist = Math.hypot(worldPos[0] - b.position[0], worldPos[1] - b.position[1]);
      if (dist <= Math.max(b.radius || 6.371e6, minHitRadiusMeters)) return b;
    }
    return null;
  };

  const handlePlacementClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = screenToWorld(e.clientX, e.clientY);
    if (placementStage === 'idle') {
      setPlacedWorldPos(pos);
      setPlacementStage('velocity');
    } else if (placementStage === 'velocity') {
      setPlacementStage('idle');
      setShowDialog(true);
    }
  };

  const handleSelectionOrDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && !isSpacePressed) {
      const hit = findBodyAtPosition(screenToWorld(e.clientX, e.clientY));
      setSelectedBodyId(hit ? hit.id : null);
    }
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu(null);
    if (placementActive) {
      handlePlacementClick(e);
      return;
    }
    handleSelectionOrDrag(e);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (placementActive) return;
    const hit = findBodyAtPosition(screenToWorld(e.clientX, e.clientY));
    if (hit) {
      setSelectedBodyId(hit.id);
      setContextMenu({ x: e.clientX, y: e.clientY, body: hit });
    } else {
      setContextMenu(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = screenToWorld(e.clientX, e.clientY);
    setHoverWorldPos(pos);
    if (placementActive && placementStage === 'velocity' && placedWorldPos) {
      setDraggedVel([(pos[0] - placedWorldPos[0]) / 10, (pos[1] - placedWorldPos[1]) / 10]);
      return;
    }
    if (isDragging) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewport((prev) => ({ ...prev, pan: { x: prev.pan.x - dx / prev.scale, y: prev.pan.y + dy / prev.scale } }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const zoomFactor = e.deltaY > 0 ? 0.85 : 1.15;
    setViewport((prev) => ({ ...prev, scale: Math.max(1e-9, Math.min(1e-4, prev.scale * zoomFactor)) }));
  };

  return {
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
    handleMouseUp: () => setIsDragging(false),
    handleWheel,
  };
}
