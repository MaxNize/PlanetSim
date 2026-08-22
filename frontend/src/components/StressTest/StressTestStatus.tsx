import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';

interface StressTestStatusProps {
  activeBodyCount: number;
  fps: number;
}

/** Live workload/FPS readout shown at the top of the stress test modal. */
export function StressTestStatus({ activeBodyCount, fps }: StressTestStatusProps) {
  const { t } = useI18n();

  return (
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
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>{t('stressTest.currentWorkload')}</span>
        <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
          {activeBodyCount} {t('stressTest.bodies')}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>{t('stressTest.liveFrameRate')}</span>
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
  );
}
