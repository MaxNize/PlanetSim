import { useRef, useEffect, useState } from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { ViewportConfig } from '../services/CanvasRenderer';
import { screenToWorld as toWorld, findBodyAtPosition as hitTest } from '../services/canvasHitTest';
import { SandboxBody } from '../types';

interface CanvasInteractionOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/**
 * Hook for managing canvas viewport zooming, panning, selection, context menu, and body-creation
 * events. In sandbox mode, a plain click-drag on empty canvas space directly creates a body
 * (mousedown = position, drag = velocity, mouseup = confirm dialog) — no separate "placement mode"
 * toggle is needed (FP-38).
 */
export function useCanvasInteraction({ canvasRef }: CanvasInteractionOptions) {
  const lastMousePos = useRef({ x: 0, y: 0 });
  const { currentState, setSelectedBodyId, sandboxBodies, mode } = useSimulationContext();

  const [viewport, setViewport] = useState<ViewportConfig>({ scale: 1e-6, pan: { x: 1.5e8, y: 0.0 } });
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Body-creation & editing state
  const [hoverWorldPos, setHoverWorldPos] = useState<[number, number] | null>(null);
  const [isHoveringBody, setIsHoveringBody] = useState(false);
  const [isPlacingBody, setIsPlacingBody] = useState(false);
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
    // Multiplexes two independent, unrelated keyboard concerns (space = pan modifier, escape =
    // cancel body creation) onto one shared listener — intentional, not accidental complexity.
    // fallow-ignore-next-line complexity
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(e.type === 'keydown');
      }
      if (e.type === 'keydown' && e.key === 'Escape') {
        setIsPlacingBody(false);
        setPlacedWorldPos(null);
        setDraggedVel([0, 0]);
        setShowDialog(false);
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  const screenToWorld = (screenX: number, screenY: number): [number, number] => {
    if (!canvasRef.current) return [0, 0];
    return toWorld(screenX, screenY, canvasRef.current.getBoundingClientRect(), viewport);
  };

  // currentState.bodies is always fully enriched with id/color by the time it's set (see SimulationProvider.handleStep and useSandbox).
  const findBodyAtPosition = (worldPos: [number, number]): SandboxBody | null => hitTest(worldPos, (currentState.bodies || sandboxBodies) as SandboxBody[], viewport.scale);

  // Dispatches on mouse button + modifier + hit-test result — inherent to reading a single mousedown event.
  // fallow-ignore-next-line complexity
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu(null);
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.button === 0) {
      const pos = screenToWorld(e.clientX, e.clientY);
      const hit = findBodyAtPosition(pos);
      if (mode === 'sandbox' && !hit) {
        setPlacedWorldPos(pos);
        setDraggedVel([0, 0]);
        setIsPlacingBody(true);
        return;
      }
      setSelectedBodyId(hit ? hit.id : null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    // Edit/lock/delete only make sense for user-defined sandbox bodies; the fixed primary/secondary/testParticle
    // roles in preset ('3body') mode aren't backed by sandboxBodies, so updateBody would silently no-op and the
    // body would appear to "reset" on the next simulation tick (FP-39).
    if (mode !== 'sandbox') {
      setContextMenu(null);
      return;
    }
    const hit = findBodyAtPosition(screenToWorld(e.clientX, e.clientY));
    if (hit) {
      setSelectedBodyId(hit.id);
      setContextMenu({ x: e.clientX, y: e.clientY, body: hit });
    } else {
      setContextMenu(null);
    }
  };

  // Multiplexes three independent, unrelated pointer concerns (body-creation velocity-drag preview,
  // viewport pan, and hover-affordance hit-testing) onto one mousemove handler.
  // fallow-ignore-next-line complexity
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = screenToWorld(e.clientX, e.clientY);
    setHoverWorldPos(pos);
    if (isPlacingBody && placedWorldPos) {
      setDraggedVel([(pos[0] - placedWorldPos[0]) / 10, (pos[1] - placedWorldPos[1]) / 10]);
      return;
    }
    if (isDragging) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewport((prev) => ({ ...prev, pan: { x: prev.pan.x - dx / prev.scale, y: prev.pan.y + dy / prev.scale } }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    if (mode === 'sandbox' && !isSpacePressed) {
      setIsHoveringBody(!!findBodyAtPosition(pos));
    }
  };

  /** Ends panning; if a body-creation drag was in progress, opens the confirm dialog at the dragged velocity. */
  const handleMouseUp = () => {
    setIsDragging(false);
    if (isPlacingBody) {
      setIsPlacingBody(false);
      setShowDialog(true);
    }
  };

  /** Leaving the canvas mid-drag cancels an in-progress body creation instead of confirming it. */
  const handleMouseLeave = () => {
    setIsDragging(false);
    if (isPlacingBody) {
      setIsPlacingBody(false);
      setPlacedWorldPos(null);
      setDraggedVel([0, 0]);
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
  };
}
