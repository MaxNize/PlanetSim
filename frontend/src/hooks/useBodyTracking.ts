import { useState, useEffect } from 'react';
import { SimulationState } from '../services/wasmBridge';
import { SandboxBody, SimulationMode } from '../types';

/**
 * Camera tracking (FP-36): tracks which single body, if any, the viewport should auto-pan to
 * follow every simulation step. Lives in the global SimulationContext (not Canvas-local) so it can
 * be toggled from both the canvas context menu and the sandbox object list. The actual viewport
 * pan effect lives in useCanvasInteraction, since the viewport itself is Canvas-local state.
 * Available in both sandbox and preset mode; tracking is dropped on mode switch (body ids from one
 * mode aren't meaningful in the other) and when the tracked body no longer exists.
 */
export function useBodyTracking(currentState: SimulationState, mode: SimulationMode) {
  const [trackedBodyId, setTrackedBodyId] = useState<string | null>(null);

  useEffect(() => {
    setTrackedBodyId(null);
  }, [mode]);

  useEffect(() => {
    if (!trackedBodyId) return;
    if (!currentState.bodies?.some((b) => b.id === trackedBodyId)) {
      setTrackedBodyId(null);
    }
  }, [currentState, trackedBodyId]);

  const toggleTracking = (body: SandboxBody) => {
    setTrackedBodyId((prev) => (prev === body.id ? null : body.id));
  };

  return { trackedBodyId, setTrackedBodyId, toggleTracking };
}
