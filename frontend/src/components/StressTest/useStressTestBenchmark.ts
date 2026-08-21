import { useState, useEffect, useRef, useCallback } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { useSimulationAnimation } from '../../context/SimulationAnimationContext';
import { useI18n } from '../../context/I18nContext';
import { generateStressTestBodies } from '../../utils/stressTestUtils';

export interface BenchmarkStage {
  bodyCount: number;
  avgFps: number;
  status: 'passing' | 'dropping';
}

const BATCH_SIZES = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000];

function computeAverageFps(samples: number[], fallbackFps: number): number {
  if (samples.length === 0) return fallbackFps;
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}

function shouldStopBenchmark(isDropping: boolean, step: number | null): boolean {
  if (step === null) return true;
  if (isDropping && step > 0) return true;
  return step >= BATCH_SIZES.length;
}

/**
 * Custom hook to manage step-by-step performance benchmark logic.
 */
// fallow-ignore-next-line complexity
export function useStressTestBenchmark() {
  const { mode, setMode, addBodies, setIsPaused } = useSimulationContext();
  const { currentState, fps } = useSimulationAnimation();
  const { t } = useI18n();

  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkStep, setBenchmarkStep] = useState<number | null>(null);
  const [stages, setStages] = useState<BenchmarkStage[]>([]);
  const [thresholdResult, setThresholdResult] = useState<{ bodyCount: number; avgFps: number } | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);

  const fpsSamplesRef = useRef<number[]>([]);
  const fpsRef = useRef(fps);
  const currentStateRef = useRef(currentState);
  const addBodiesRef = useRef(addBodies);

  useEffect(() => {
    fpsRef.current = fps;
  }, [fps]);

  useEffect(() => {
    currentStateRef.current = currentState;
  }, [currentState]);

  useEffect(() => {
    addBodiesRef.current = addBodies;
  }, [addBodies]);

  useEffect(() => {
    if (isRunning) {
      fpsSamplesRef.current.push(fps);
    }
  }, [fps, isRunning]);

  const activeBodyCount = mode === 'sandbox' && currentState.bodies ? currentState.bodies.length : 3;

  const spawnBulkBodies = useCallback(
    (count: number) => {
      if (mode !== 'sandbox') {
        setMode('sandbox');
      }
      setIsPaused(false);

      const currentCount = currentState.bodies ? currentState.bodies.length : 3;
      const newBodies = generateStressTestBodies(count, currentCount);

      try {
        addBodiesRef.current(newBodies);
      } catch (e) {
        console.warn('Could not add bodies during stress test:', e);
      }
    },
    [mode, setMode, setIsPaused, currentState.bodies],
  );

  const stopBenchmark = useCallback(() => {
    setIsRunning(false);
    setBenchmarkStep(null);
    setStatusText(null);
  }, []);

  const startBenchmark = useCallback(() => {
    if (mode !== 'sandbox') {
      setMode('sandbox');
    }
    setIsPaused(false);
    setStages([]);
    setThresholdResult(null);
    setIsRunning(true);
    setStatusText(t('stressTest.testing'));
    fpsSamplesRef.current = [];
    setBenchmarkStep(0);
  }, [mode, setMode, setIsPaused, t]);

  // fallow-ignore-next-line complexity
  const executeBenchmarkStep = useCallback(() => {
    const avg = computeAverageFps(fpsSamplesRef.current, fpsRef.current);
    fpsSamplesRef.current = [];

    const latestState = currentStateRef.current;
    const liveBodies = mode === 'sandbox' && latestState.bodies ? latestState.bodies.length : 3;
    const roundedAvg = Math.round(avg * 10) / 10;
    const isDropping = roundedAvg < 58.0;

    setStages((prev) => [...prev, { bodyCount: liveBodies, avgFps: roundedAvg, status: isDropping ? 'dropping' : 'passing' }]);

    if (shouldStopBenchmark(isDropping, benchmarkStep)) {
      if (isDropping && benchmarkStep !== null && benchmarkStep > 0) {
        setThresholdResult({ bodyCount: liveBodies, avgFps: roundedAvg });
      }
      stopBenchmark();
      return;
    }

    const targetCount = BATCH_SIZES[benchmarkStep!];
    const needed = Math.max(0, targetCount - liveBodies);
    if (needed > 0) {
      addBodiesRef.current(generateStressTestBodies(needed, liveBodies));
    }
    setBenchmarkStep((prev) => (prev !== null ? prev + 1 : null));
  }, [mode, benchmarkStep, stopBenchmark]);

  useEffect(() => {
    if (!isRunning || benchmarkStep === null) return;
    fpsSamplesRef.current = [];
    const timer = setTimeout(executeBenchmarkStep, 1400);
    return () => clearTimeout(timer);
  }, [isRunning, benchmarkStep, executeBenchmarkStep]);

  return {
    isRunning,
    activeBodyCount,
    stages,
    thresholdResult,
    statusText,
    startBenchmark,
    stopBenchmark,
    spawnBulkBodies,
  };
}
