import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';

interface StressTestActionsProps {
  isRunning: boolean;
  statusText: string | null;
  startBenchmark: () => void;
  stopBenchmark: () => void;
  spawnBulkBodies: (count: number) => void;
}

const QUICK_SPAWN_COUNTS = [50, 100, 250, 500];

/** Benchmark start/stop control and the quick-spawn body count grid. */
export function StressTestActions({ isRunning, statusText, startBenchmark, stopBenchmark, spawnBulkBodies }: StressTestActionsProps) {
  const { t } = useI18n();

  return (
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
          {QUICK_SPAWN_COUNTS.map((num) => (
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
  );
}
