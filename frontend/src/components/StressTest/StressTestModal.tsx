import React from 'react';
import { useSimulationAnimation } from '../../context/SimulationAnimationContext';
import { useI18n } from '../../context/I18nContext';
import { useStressTestBenchmark } from './useStressTestBenchmark';
import { StressTestStatus } from './StressTestStatus';
import { StressTestActions } from './StressTestActions';
import { StressTestHistoryTable } from './StressTestHistoryTable';
import { colors } from '../../styles/tokens';

interface StressTestModalProps {
  onClose: () => void;
}

/** Modal for running body-count stress benchmarks and inspecting live FPS. */
export function StressTestModal({ onClose }: StressTestModalProps) {
  const { fps } = useSimulationAnimation();
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

        <StressTestStatus activeBodyCount={activeBodyCount} fps={fps} />

        <StressTestActions isRunning={isRunning} statusText={statusText} startBenchmark={startBenchmark} stopBenchmark={stopBenchmark} spawnBulkBodies={spawnBulkBodies} />

        <StressTestHistoryTable thresholdResult={thresholdResult} stages={stages} />

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
