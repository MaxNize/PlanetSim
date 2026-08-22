import { useSimulationAnimation } from '../../context/SimulationAnimationContext';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';

const STATUS_COLORS: Record<'smooth' | 'moderate' | 'lag', string> = {
  smooth: '#2ed573',
  moderate: '#feca57',
  lag: '#ff6b6b',
};

const STATUS_KEYS: Record<'smooth' | 'moderate' | 'lag', string> = {
  smooth: 'telemetry.statusSmooth',
  moderate: 'telemetry.statusModerate',
  lag: 'telemetry.statusLag',
};

/**
 * Displays live FPS, frame time, and a status indicator, with an optional stress-test launcher.
 */
// fallow-ignore-next-line complexity
export function PerformanceDisplay({ onOpenStressTest }: { onOpenStressTest?: () => void }) {
  const { fps, frameTimeMs, fpsStatus } = useSimulationAnimation();
  const { t } = useI18n();

  const statusColor = STATUS_COLORS[fpsStatus] || STATUS_COLORS.smooth;
  const statusLabel = t(STATUS_KEYS[fpsStatus] || STATUS_KEYS.smooth);
  const displayFps = fps ?? 60;
  const displayFrameMs = frameTimeMs !== undefined ? frameTimeMs.toFixed(1) : '16.7';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>{t('telemetry.performance')}:</span>
        {onOpenStressTest && (
          <button
            onClick={onOpenStressTest}
            style={{
              background: 'rgba(0, 210, 211, 0.15)',
              border: '1px solid rgba(0, 210, 211, 0.35)',
              color: '#00d2d3',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('controls.stressTest')}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: statusColor }}>
          {displayFps} {t('telemetry.fps')}
        </div>
        <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: colors.textMuted }}>{displayFrameMs} ms</span>
      </div>
      <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: 500, color: statusColor }}>{statusLabel}</div>
    </div>
  );
}
