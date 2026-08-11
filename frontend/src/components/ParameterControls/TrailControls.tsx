import React from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';

const HEADER_STYLE = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#fff',
  marginTop: '16px',
  marginBottom: '16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  paddingBottom: '8px',
} as const;

const LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#94a3b8',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
} as const;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  userSelect: 'none',
} as const;

const CLEAR_BUTTON_STYLE = {
  padding: '8px 14px',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#e2e8f0',
  fontWeight: 500,
  fontSize: '12px',
  cursor: 'pointer',
  outline: 'none',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
} as const;

/**
 * Modular component that handles the UI controls for trajectory trails
 * (toggling display, setting point limits, clearing trail buffers).
 */
export function TrailControls() {
  const { showTrail, setShowTrail, trailLength, setTrailLength, clearTrailHistory } = useSimulationContext();
  const { t } = useI18n();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={HEADER_STYLE}>{t('controls.showTrail')}</h3>

      <label style={ROW_STYLE}>
        <input type="checkbox" checked={showTrail} onChange={(e) => setShowTrail(e.target.checked)} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#e2e8f0' }}>{t('controls.showTrail')}</span>
      </label>

      {showTrail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={LABEL_STYLE}>
            <span>{t('controls.trailLength')}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fff' }}>{trailLength} pts</span>
          </div>
          <input type="range" min={100} max={5000} step={100} value={trailLength} onChange={(e) => setTrailLength(parseInt(e.target.value, 10))} style={{ cursor: 'pointer' }} />
        </div>
      )}

      <button onClick={clearTrailHistory} style={CLEAR_BUTTON_STYLE}>
        🗑️ {t('controls.clearTrail')}
      </button>
    </div>
  );
}
