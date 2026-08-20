import { useEffect, useRef, useState } from 'react';

export interface FpsMetrics {
  fps: number;
  frameTimeMs: number;
  status: 'smooth' | 'moderate' | 'lag';
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
        const fps = times.length;
        const frameTimeMs = fps > 0 ? 1000 / fps : 0;
        let status: 'smooth' | 'moderate' | 'lag' = 'smooth';
        if (fps < 30) {
          status = 'lag';
        } else if (fps < 55) {
          status = 'moderate';
        }

        setMetrics({ fps, frameTimeMs, status });
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
