import React from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { useStressTestBenchmark } from './useStressTestBenchmark';
import { colors } from '../../styles/tokens';

interface StressTestModalProps {
  onClose: () => void;
}

/**
 *
 */
// fallow-ignore-next-line complexity
export function StressTestModal({ onClose }: StressTestModalProps) {
  const { fps } = useSimulationContext();
  const { t } = useI18n();

  const { isRunning, activeBodyCount, stages, thresholdResult, statusText, startBenchmark, stopBenchmark, spawnBulkBodies } = useStressTestBenchmark();

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
