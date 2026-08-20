import { useEffect, useRef, useState } from 'react';

export interface FpsMetrics {
  fps: number;
  frameTimeMs: number;
  status: 'smooth' | 'moderate' | 'lag';
}

function calculateFpsMetrics(fps: number): FpsMetrics {
  const frameTimeMs = fps > 0 ? 1000 / fps : 0;
  const status: FpsMetrics['status'] = fps < 30 ? 'lag' : fps < 55 ? 'moderate' : 'smooth';
  return { fps, frameTimeMs, status };
}

/**
 * Custom hook that tracks real-time frames per second (FPS) and frame render time (ms)
 * using performance.now() and requestAnimationFrame.
 *
 * @param active Whether frame measurement is currently enabled.
 * @returns FpsMetrics object containing current fps, frameTimeMs, and performance status.
 */
export function useFps(active: boolean = true): FpsMetrics {
  const [metrics, setMetrics] = useState<FpsMetrics>({
    fps: 60,
    frameTimeMs: 16.67,
    status: 'smooth',
  });

  const frameTimesRef = useRef<number[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!active) {
      frameTimesRef.current = [];
      return;
    }

    const loop = (now: number) => {
      const times = frameTimesRef.current;
      times.push(now);

      const cutoff = now - 1000;
      while (times.length > 0 && times[0] <= cutoff) {
        times.shift();
      }

      if (now - lastUpdateRef.current >= 200) {
        setMetrics(calculateFpsMetrics(times.length));
        lastUpdateRef.current = now;
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active]);

  return metrics;
}
