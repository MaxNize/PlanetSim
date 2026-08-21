import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';
import type { BenchmarkStage } from './useStressTestBenchmark';

interface StressTestHistoryTableProps {
  thresholdResult: { bodyCount: number; avgFps: number } | null;
  stages: BenchmarkStage[];
}

/** Threshold-found banner and the per-stage FPS log from a completed/running benchmark. */
export function StressTestHistoryTable({ thresholdResult, stages }: StressTestHistoryTableProps) {
  const { t } = useI18n();

  return (
    <>
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

      {stages.length > 0 && (
        <div data-testid="benchmark-log-history" style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', padding: '12px', maxHeight: '160px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px', fontWeight: 600 }}>{t('stressTest.logHistory')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
            {stages.map((st, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: st.status === 'dropping' ? '#ff6b6b' : '#2ed573' }}>
                <span>
                  {st.bodyCount} {t('stressTest.bodies')}
                </span>
                <span>{st.avgFps} FPS</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
