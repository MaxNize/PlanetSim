import { useState, useEffect, useCallback } from 'react';
import { SimulationState } from '../services/wasmBridge';
import { SandboxBody, SimulationMode } from '../types';

/**
 * Miniview (FP-37): tracks which single body, if any, is shown in a small focused secondary
 * canvas. Independent of camera tracking (FP-36) — the main viewport stays fully user-controlled
 * while the miniview shows one body zoomed in. Cleared on mode switch or if the body is removed.
 */
export function useMiniview(currentState: SimulationState, mode: SimulationMode) {
  const [miniviewBodyId, setMiniviewBodyId] = useState<string | null>(null);

  useEffect(() => {
    setMiniviewBodyId(null);
  }, [mode]);

  useEffect(() => {
    if (!miniviewBodyId) return;
    if (!currentState.bodies?.some((b) => b.id === miniviewBodyId)) {
      setMiniviewBodyId(null);
    }
  }, [currentState, miniviewBodyId]);

  const toggleMiniview = useCallback((body: SandboxBody) => {
    setMiniviewBodyId((prev) => (prev === body.id ? null : body.id));
  }, []);

  return { miniviewBodyId, setMiniviewBodyId, toggleMiniview };
}
