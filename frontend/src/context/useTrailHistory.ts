import { useCallback, useState } from 'react';
import { SimulationState } from '../services/wasmBridge';
import { TrailHistory } from '../types';

type EnrichedBody = NonNullable<SimulationState['bodies']>[number];

const initTrail = (s: SimulationState): TrailHistory => ({
  primary: [s.primary.position],
  secondary: [s.secondary.position],
  testParticle: [s.testParticle.position],
  customBodies: {},
});

/**
 * Hook that manages trajectory trail history for all bodies (primary/secondary/test particle and sandbox custom bodies).
 */
export function useTrailHistory(initialState: SimulationState) {
  const [trailHistory, setTrailHistory] = useState<TrailHistory>(() => initTrail(initialState));
  const [trailLength, setTrailLengthState] = useState<number>(1000);

  const resetTrail = useCallback((state: SimulationState) => {
    setTrailHistory(initTrail(state));
  }, []);

  const recordStep = useCallback(
    (enriched: SimulationState) => {
      setTrailHistory((prev) => {
        const nextCustom: { [bodyId: string]: [number, number][] } = { ...(prev.customBodies || {}) };
        if (enriched.bodies) {
          enriched.bodies.forEach((b: EnrichedBody) => {
            if (!b.id) return;
            nextCustom[b.id] = [...(nextCustom[b.id] || []), b.position].slice(-trailLength);
          });
        }
        return {
          primary: [...prev.primary, enriched.primary.position].slice(-trailLength),
          secondary: [...prev.secondary, enriched.secondary.position].slice(-trailLength),
          testParticle: [...prev.testParticle, enriched.testParticle.position].slice(-trailLength),
          customBodies: nextCustom,
        };
      });
    },
    [trailLength],
  );

  const setTrailLength = useCallback((len: number) => {
    setTrailLengthState(len);
    setTrailHistory((prev) => {
      const nextCustom: { [bodyId: string]: [number, number][] } = {};
      if (prev.customBodies) {
        Object.keys(prev.customBodies).forEach((k) => {
          nextCustom[k] = prev.customBodies![k].slice(-len);
        });
      }
      return {
        primary: prev.primary.slice(-len),
        secondary: prev.secondary.slice(-len),
        testParticle: prev.testParticle.slice(-len),
        customBodies: nextCustom,
      };
    });
  }, []);

  return { trailHistory, trailLength, recordStep, resetTrail, setTrailLength };
}
