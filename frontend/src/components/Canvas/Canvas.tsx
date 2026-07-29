import React, { useRef, useEffect, useState } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { CanvasRenderer, ViewportConfig } from '../../services/CanvasRenderer';
import { BodyPlacementDialog } from '../BodyPlacementDialog/BodyPlacementDialog';
import { SandboxBody } from '../../types';

interface CanvasProps {
  showTrail?: boolean;
  placementActive?: boolean;
  onPlacementCancel?: () => void;
  onPlacementComplete?: (body: SandboxBody) => void;
}

/**
 * Renders the interactive simulation viewport canvas, handling panning, zooming, and sandbox body placements.
 */
export function Canvas({ showTrail = true, placementActive = false, onPlacementCancel, onPlacementComplete }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const { currentState, lagrangePoints, trailHistory, showTrail: contextShowTrail } = useSimulationContext();
  const activeShowTrail = showTrail && contextShowTrail;

  const [viewport, setViewport] = useState<ViewportConfig>({
    scale: 1e-6,
    pan: { x: 1.5e8, y: 0.0 },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Placement State
  const [hoverWorldPos, setHoverWorldPos] = useState<[number, number] | null>(null);
  const [placementStage, setPlacementStage] = useState<'idle' | 'position' | 'velocity'>('idle');
  const [placedWorldPos, setPlacedWorldPos] = useState<[number, number] | null>(null);
  const [draggedVel, setDraggedVel] = useState<[number, number]>([0, 0]);
  const [showDialog, setShowDialog] = useState(false);

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
  }, []);

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
    const x = screenX - rect.left;
    const y = screenY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    return [(x - centerX) / viewport.scale + viewport.pan.x, (centerY - y) / viewport.scale + viewport.pan.y];
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) rendererRef.current = new CanvasRenderer(canvasRef.current);

    const preview =
      placementActive && placedWorldPos
        ? {
            position: placedWorldPos,
            velocity: draggedVel,
            radius: 6.371e6, // Preview radius (Earth scale)
            color: '#3b82f6',
          }
        : placementActive && hoverWorldPos
          ? {
              position: hoverWorldPos,
              velocity: [0, 0] as [number, number],
              radius: 6.371e6,
              color: 'rgba(59, 130, 246, 0.4)',
            }
          : undefined;

    rendererRef.current.draw(currentState, trailHistory, activeShowTrail, lagrangePoints, viewport, preview);
  }, [currentState, viewport, trailHistory, activeShowTrail, lagrangePoints, dimensions, placementActive, hoverWorldPos, placedWorldPos, draggedVel]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (placementActive) {
      const pos = screenToWorld(e.clientX, e.clientY);
      if (placementStage === 'idle') {
        setPlacedWorldPos(pos);
        setPlacementStage('velocity');
      } else if (placementStage === 'velocity') {
        setPlacementStage('idle');
        setShowDialog(true);
      }
      return;
    }
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
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
      setViewport((prev) => ({
        ...prev,
        pan: { x: prev.pan.x - dx / prev.scale, y: prev.pan.y + dy / prev.scale },
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const zoomFactor = e.deltaY > 0 ? 0.85 : 1.15;
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(1e-9, Math.min(1e-4, prev.scale * zoomFactor)),
    }));
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        aria-label="Celestial simulation rendering area"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : isSpacePressed ? 'grab' : placementActive ? 'crosshair' : 'default',
          outline: 'none',
        }}
      />
      {showDialog && placedWorldPos && (
        <BodyPlacementDialog
          position={placedWorldPos}
          initialVelocity={draggedVel}
          onConfirm={(body) => {
            setShowDialog(false);
            setPlacedWorldPos(null);
            setDraggedVel([0, 0]);
            if (onPlacementComplete) onPlacementComplete(body);
          }}
          onCancel={() => {
            setShowDialog(false);
            setPlacedWorldPos(null);
            setDraggedVel([0, 0]);
            if (onPlacementCancel) onPlacementCancel();
          }}
        />
      )}
    </>
  );
}
