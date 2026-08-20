import { useEffect, useRef } from 'react';

/**
 * Custom hook that manages requestAnimationFrame and calls the callback on each frame.
 *
 * @param callback Callback function executed with delta time (in seconds).
 * @param active Boolean indicating if the animation loop is running.
 */
export function useAnimationFrame(callback: (deltaTime: number) => void, active: boolean) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = (time - previousTimeRef.current) / 1000.0; // convert milliseconds to seconds
        if (deltaTime > 0) {
          callback(deltaTime);
        }
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback, active]);
}
