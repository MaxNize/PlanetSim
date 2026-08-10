import React, { useRef, useEffect, useState } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { CanvasRenderer, ViewportConfig } from '../../services/CanvasRenderer';

interface CanvasProps {
  showTrail?: boolean;
}

/**
 * Interactive Canvas component that renders the restricted 3-body planetary orbit simulation.
 * Manages pan/zoom interactions and redraws when the physics state updates.
 */
export function Canvas({ showTrail = true }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const { currentState, lagrangePoints, trailHistory, showTrail: contextShowTrail } = useSimulationContext();
  const activeShowTrail = showTrail && contextShowTrail;

  // Viewport configuration: scale (px/meter) and pan offset (meters)
  const [viewport, setViewport] = useState<ViewportConfig>({
    scale: 1e-6, // Initial scale: 1 pixel represents 1,000,000 meters
    pan: { x: 1.5e8, y: 0.0 }, // Offset pan slightly to center M1 and M2
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Monitor window resize to trigger redraws
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

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

  // Monitor Spacebar key state for panning cursor toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Redraw loop triggered when state or viewport changes
  useEffect(() => {
    if (!canvasRef.current) return;

    // Lazy load the renderer service
    if (!rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
    }

    rendererRef.current.draw(currentState, trailHistory, activeShowTrail, lagrangePoints, viewport);
  }, [currentState, viewport, trailHistory, activeShowTrail, lagrangePoints, dimensions]);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Pan with middle mouse button OR space + left click
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      setViewport((prev) => ({
        ...prev,
        pan: {
          x: prev.pan.x - dx / prev.scale,
          y: prev.pan.y + dy / prev.scale,
        },
      }));

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const zoomFactor = e.deltaY > 0 ? 0.85 : 1.15;

    setViewport((prev) => ({
      ...prev,
      // Clamp scale to prevent division by zero or excessive zooming
      scale: Math.max(1e-9, Math.min(1e-4, prev.scale * zoomFactor)),
    }));
  };

  return (
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
        cursor: isDragging ? 'grabbing' : isSpacePressed ? 'grab' : 'crosshair',
        outline: 'none',
      }}
    />
  );
}
