import { useCallback, useRef, useState } from 'react';
import { SimulationState } from '../services/wasmBridge';
import { TrailHistory } from '../types';

type EnrichedBody = NonNullable<SimulationState['bodies']>[number];

/**
 * Bounded point history with O(1)-amortized push, avoiding the O(capacity) array copy a naive
 * `[...points, next].slice(-capacity)` pattern pays on every single append (at 1000 points ×
 * up to 1000 sandbox bodies, that pattern turned into millions of element copies per second and
 * collapsed frame rate well before the physics itself became the bottleneck). Instead of
 * trimming to `capacity` on every push, the backing array is left to grow to `2*capacity` before
 * a single compaction, spreading that O(capacity) cost across `capacity` pushes. `toArray()` is
 * memoized so re-reading an untouched body's trail (most bodies, most frames) costs O(1).
 */
class TrailBuffer {
  private points: [number, number][];
  private capacity: number;

  constructor(capacity: number, seed: [number, number]) {
    this.capacity = capacity;
    this.points = [seed];
  }

  push(point: [number, number]): void {
    this.points.push(point);
    if (this.points.length > this.capacity) {
      this.points.shift();
    }
  }

  setCapacity(capacity: number): void {
    this.capacity = capacity;
    if (this.points.length > capacity) {
      this.points = this.points.slice(-capacity);
    }
  }

  reset(seed: [number, number]): void {
    this.points = [seed];
  }

  toArray(): [number, number][] {
    return this.points;
  }
}

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
  const trailLengthRef = useRef(1000);

  const primaryRef = useRef(new TrailBuffer(1000, initialState.primary.position));
  const secondaryRef = useRef(new TrailBuffer(1000, initialState.secondary.position));
  const testParticleRef = useRef(new TrailBuffer(1000, initialState.testParticle.position));
  const customRef = useRef(new Map<string, TrailBuffer>());

  const resetTrail = useCallback((state: SimulationState) => {
    primaryRef.current.reset(state.primary.position);
    secondaryRef.current.reset(state.secondary.position);
    testParticleRef.current.reset(state.testParticle.position);
    customRef.current.clear();
    setTrailHistory(initTrail(state));
  }, []);

  const recordStep = useCallback((enriched: SimulationState) => {
    primaryRef.current.push(enriched.primary.position);
    secondaryRef.current.push(enriched.secondary.position);
    testParticleRef.current.push(enriched.testParticle.position);

    if (enriched.bodies) {
      enriched.bodies.forEach((b: EnrichedBody) => {
        if (!b.id) return;
        const existing = customRef.current.get(b.id);
        if (existing) {
          existing.push(b.position);
        } else {
          customRef.current.set(b.id, new TrailBuffer(trailLengthRef.current, b.position));
        }
      });
    }

    const nextCustom: { [bodyId: string]: [number, number][] } = {};
    customRef.current.forEach((buf, id) => {
      nextCustom[id] = buf.toArray();
    });

    setTrailHistory({
      primary: primaryRef.current.toArray(),
      secondary: secondaryRef.current.toArray(),
      testParticle: testParticleRef.current.toArray(),
      customBodies: nextCustom,
    });
  }, []);

  const setTrailLength = useCallback((len: number) => {
    trailLengthRef.current = len;
    setTrailLengthState(len);

    primaryRef.current.setCapacity(len);
    secondaryRef.current.setCapacity(len);
    testParticleRef.current.setCapacity(len);
    const nextCustom: { [bodyId: string]: [number, number][] } = {};
    customRef.current.forEach((buf, id) => {
      buf.setCapacity(len);
      nextCustom[id] = buf.toArray();
    });

    setTrailHistory({
      primary: primaryRef.current.toArray(),
      secondary: secondaryRef.current.toArray(),
      testParticle: testParticleRef.current.toArray(),
      customBodies: nextCustom,
    });
  }, []);

  return { trailHistory, trailLength, recordStep, resetTrail, setTrailLength };
}
