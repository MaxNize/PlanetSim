import { useState, useEffect } from 'react';
import { ViewportConfig } from '../services/CanvasRenderer';
import { SimulationState } from '../services/wasmBridge';
import { SandboxBody, SimulationMode } from '../types';

/**
 * Camera tracking (FP-36): the viewport auto-pans to follow a chosen body every simulation step.
 * Available in both sandbox and preset mode; tracking is dropped on mode switch (body ids from one
 * mode aren't meaningful in the other) and when the tracked body no longer exists.
 */
export function useBodyTracking(currentState: SimulationState, mode: SimulationMode, setViewport: React.Dispatch<React.SetStateAction<ViewportConfig>>) {
  const [trackedBodyId, setTrackedBodyId] = useState<string | null>(null);

  useEffect(() => {
    setTrackedBodyId(null);
  }, [mode]);

  useEffect(() => {
    if (!trackedBodyId) return;
    const trackedBody = currentState.bodies?.find((b) => b.id === trackedBodyId);
    if (!trackedBody) {
      setTrackedBodyId(null);
      return;
    }
    setViewport((prev) => ({ ...prev, pan: { x: trackedBody.position[0], y: trackedBody.position[1] } }));
  }, [currentState, trackedBodyId, setViewport]);

  const toggleTracking = (body: SandboxBody) => {
    setTrackedBodyId((prev) => (prev === body.id ? null : body.id));
  };

  return { trackedBodyId, setTrackedBodyId, toggleTracking };
}
