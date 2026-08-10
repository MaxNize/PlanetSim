import React from 'react';
import { SandboxControlsProps } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';

const SECTION_HEADER_STYLE = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#fff',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  paddingBottom: '8px',
  margin: 0,
} as const;

const ADD_BUTTON_STYLE = (active: boolean) =>
  ({
    width: '100%',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    border: active ? '1px solid #10b981' : 'none',
    background: active ? 'rgba(16, 185, 129, 0.15)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: active ? '#10b981' : '#fff',
    boxShadow: active ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
    outline: 'none',
  }) as const;

const BODY_ITEM_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '12px',
} as const;

const DELETE_BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '0 4px',
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
} as const;

/**
 * Renders sandbox specific panel controls including custom bodies listing and active toggling.
 */
export function SandboxControls({ placementActive, setPlacementActive }: SandboxControlsProps) {
  const { sandboxBodies, removeBody, setMode } = useSimulationContext();
  const { t } = useI18n();

  const handleReset = () => {
    if (window.confirm(t('sandbox.resetConfirm'))) {
      setMode('3body');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={SECTION_HEADER_STYLE}>{t('sandbox.creatorTitle')}</h3>

      <button onClick={() => setPlacementActive(!placementActive)} style={ADD_BUTTON_STYLE(placementActive)}>
        {placementActive ? t('sandbox.placingActive') : t('sandbox.addBody')}
      </button>

      {placementActive && <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>{t('sandbox.helpText')}</div>}

      <h3 style={SECTION_HEADER_STYLE}>
        {t('sandbox.bodiesTitle')} ({sandboxBodies.length}/10)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
        {sandboxBodies.map((b) => (
          <div key={b.id} style={BODY_ITEM_STYLE}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: b.color }} />
              <span style={{ fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name || t('sandbox.defaultBodyName')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#94a3b8' }}>{(b.mass / 5.9722e24).toFixed(1)} M⊕</span>
              <button onClick={() => removeBody(b.id)} style={DELETE_BUTTON_STYLE} title={t('sandbox.deleteBody')}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {sandboxBodies.length >= 6 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#f59e0b' }}>
          {t('sandbox.highCountWarning')}
        </div>
      )}

      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          outline: 'none',
        }}
      >
        {t('sandbox.exitSandbox')}
      </button>
    </div>
  );
}
