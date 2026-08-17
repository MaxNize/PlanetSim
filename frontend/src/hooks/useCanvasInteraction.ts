import { useSimulationContext } from '../context/SimulationContext';
import { useCanvasViewport } from './useCanvasViewport';
import { useCanvasPointer } from './useCanvasPointer';

interface CanvasInteractionOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/**
 * Combines viewport control (useCanvasViewport) and pointer/keyboard interaction (useCanvasPointer)
 * into the single API Canvas expects. In sandbox mode, a plain click-drag on empty canvas space
 * directly creates a body (mousedown = position, drag = velocity, mouseup = confirm dialog) — no
 * separate "placement mode" toggle is needed (FP-38).
 */
export function useCanvasInteraction({ canvasRef }: CanvasInteractionOptions) {
  const { currentState, setSelectedBodyId, sandboxBodies, mode, trackedBodyId, setTrackedBodyId, toggleTracking } = useSimulationContext();

  const { viewport, setViewport, dimensions, handleWheel } = useCanvasViewport({ canvasRef, currentState, trackedBodyId });

  const pointer = useCanvasPointer({ canvasRef, viewport, setViewport, mode, currentState, sandboxBodies, setSelectedBodyId, setTrackedBodyId });

  return {
    viewport,
    dimensions,
    mode,
    trackedBodyId,
    toggleTracking,
    handleWheel,
    ...pointer,
  };
}
