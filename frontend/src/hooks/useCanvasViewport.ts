import { useEffect, useState } from 'react';
import { ViewportConfig } from '../services/CanvasRenderer';
import { SimulationState } from '../services/wasmBridge';

interface CanvasViewportOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentState: SimulationState;
  trackedBodyId: string | null;
}

/**
 * Manages the canvas viewport's pan/zoom state, canvas-size tracking, and the camera-follow
 * behavior for a tracked body (FP-36). Split out of useCanvasInteraction to keep each hook
 * focused on a single concern.
 */
export function useCanvasViewport({ canvasRef, currentState, trackedBodyId }: CanvasViewportOptions) {
  const [viewport, setViewport] = useState<ViewportConfig>({ scale: 1e-6, pan: { x: 1.5e8, y: 0.0 } });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!trackedBodyId) return;
    const trackedBody = currentState.bodies?.find((b) => b.id === trackedBodyId);
    if (!trackedBody) return;
    setViewport((prev) => ({ ...prev, pan: { x: trackedBody.position[0], y: trackedBody.position[1] } }));
  }, [currentState, trackedBodyId]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const zoomFactor = e.deltaY > 0 ? 0.85 : 1.15;
    setViewport((prev) => ({ ...prev, scale: Math.max(1e-9, Math.min(1e-4, prev.scale * zoomFactor)) }));
  };

  return { viewport, setViewport, dimensions, handleWheel };
}
