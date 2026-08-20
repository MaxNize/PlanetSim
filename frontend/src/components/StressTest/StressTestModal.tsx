import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { generateStressTestBodies } from '../../utils/stressTestUtils';
import { colors } from '../../styles/tokens';

interface BenchmarkStage {
  bodyCount: number;
  avgFps: number;
  status: 'passing' | 'dropping';
}

interface StressTestModalProps {
  onClose: () => void;
}

const BATCH_SIZES = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000];

/**
 *
 */
// fallow-ignore-next-line complexity
export function StressTestModal({ onClose }: StressTestModalProps) {
  const { mode, setMode, currentState, addBodies, fps, setIsPaused } = useSimulationContext();
  const { t } = useI18n();

  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkStep, setBenchmarkStep] = useState<number | null>(null);
  const [stages, setStages] = useState<BenchmarkStage[]>([]);
  const [thresholdResult, setThresholdResult] = useState<{ bodyCount: number; avgFps: number } | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);

  const fpsSamplesRef = useRef<number[]>([]);

  const fpsRef = useRef(fps);
  useEffect(() => {
    fpsRef.current = fps;
  }, [fps]);

  const currentStateRef = useRef(currentState);
  useEffect(() => {
    currentStateRef.current = currentState;
  }, [currentState]);

  const addBodiesRef = useRef(addBodies);
  useEffect(() => {
    addBodiesRef.current = addBodies;
  }, [addBodies]);

  // Collect live FPS samples while benchmark is running
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

  // Step-by-step benchmark runner driven purely by benchmarkStep state transitions
  // fallow-ignore-next-line complexity
  useEffect(() => {
    if (!isRunning || benchmarkStep === null) return;

    fpsSamplesRef.current = [];

    const timer = setTimeout(() => {
      const samples = fpsSamplesRef.current;
      const avg = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : fpsRef.current;
      fpsSamplesRef.current = [];

      const latestState = currentStateRef.current;
      const liveBodies = mode === 'sandbox' && latestState.bodies ? latestState.bodies.length : 3;
      const roundedAvg = Math.round(avg * 10) / 10;
      const isDropping = roundedAvg < 58.0;

      const newStage: BenchmarkStage = {
        bodyCount: liveBodies,
        avgFps: roundedAvg,
        status: isDropping ? 'dropping' : 'passing',
      };

      setStages((prev) => [...prev, newStage]);

      // Only treat performance drop as threshold after baseline stage
      if (isDropping && benchmarkStep > 0) {
        setThresholdResult({ bodyCount: liveBodies, avgFps: roundedAvg });
        setIsRunning(false);
        setBenchmarkStep(null);
        setStatusText(null);
        return;
      }

      if (benchmarkStep >= BATCH_SIZES.length) {
        setIsRunning(false);
        setBenchmarkStep(null);
        setStatusText(null);
        return;
      }

      // Calculate next target count and spawn additional bodies for next step
      const targetCount = BATCH_SIZES[benchmarkStep];
      const needed = Math.max(0, targetCount - liveBodies);

      if (needed > 0) {
        const generated = generateStressTestBodies(needed, liveBodies);
        try {
          addBodiesRef.current(generated);
        } catch (err) {
          console.warn(err);
        }
      }

      setBenchmarkStep((prev) => (prev !== null ? prev + 1 : null));
    }, 1400);

    return () => clearTimeout(timer);
  }, [isRunning, benchmarkStep, mode]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          color: colors.white,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> {t('stressTest.title')}
            </h2>
            <p style={{ fontSize: '12px', color: colors.textMuted, margin: '4px 0 0 0' }}>{t('stressTest.subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textMuted,
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Live Status Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>Current Workload:</span>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{activeBodyCount} Bodies</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>Live Frame Rate:</span>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: fps >= 55 ? '#2ed573' : fps >= 30 ? '#feca57' : '#ff6b6b',
              }}
            >
              {fps} FPS
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isRunning ? (
            <button
              onClick={startBenchmark}
              style={{
                background: 'linear-gradient(135deg, #00d2d3, #54a0ff)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 210, 211, 0.3)',
                transition: 'transform 0.1s ease',
              }}
            >
              {t('stressTest.startBenchmark')}
            </button>
          ) : (
            <button
              onClick={stopBenchmark}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('stressTest.stopBenchmark')} ({statusText})
            </button>
          )}

          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>{t('stressTest.quickSpawn')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[50, 100, 250, 500].map((num) => (
                <button
                  key={num}
                  onClick={() => spawnBulkBodies(num)}
                  disabled={isRunning}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: colors.white,
                    borderRadius: '8px',
                    padding: '8px 4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                  }}
                >
                  +{num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Benchmark Results Display */}
        {thresholdResult && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>🎯 {t('stressTest.resultsTitle')}</div>
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              {t('stressTest.thresholdFound')}{' '}
              <strong style={{ color: '#fff', fontSize: '16px', fontFamily: "'JetBrains Mono', monospace" }}>
                {thresholdResult.bodyCount} {t('stressTest.bodies')}
              </strong>{' '}
              ({t('stressTest.avgFps')}: <span style={{ color: '#f87171', fontWeight: 700 }}>{thresholdResult.avgFps} FPS</span>)
            </div>
          </div>
        )}

        {/* Stage Log Table */}
        {stages.length > 0 && (
          <div data-testid="benchmark-log-history" style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', padding: '12px', maxHeight: '160px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px', fontWeight: 600 }}>Benchmark Log History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              {stages.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: st.status === 'dropping' ? '#ff6b6b' : '#2ed573' }}>
                  <span>{st.bodyCount} Bodies</span>
                  <span>{st.avgFps} FPS</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: colors.white,
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {t('stressTest.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
