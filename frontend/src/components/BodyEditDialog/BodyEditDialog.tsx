import React, { useState, useEffect } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, FIELD_STYLE, LABEL_STYLE, INPUT_STYLE, BUTTON_STYLE } from '../BodyPlacementDialog/styles';

interface BodyEditDialogProps {
  body: SandboxBody;
  onConfirm: (updatedBody: SandboxBody) => void;
  onCancel: () => void;
}

const CONFIRM_PRESETS = {
  sun: { mass: 1.989e30, radius: 6.9634e8, color: '#fbc531' },
  jupiter: { mass: 1.898e27, radius: 7.1492e7, color: '#e1b12c' },
  earth: { mass: 5.9722e24, radius: 6.371e6, color: '#00a8ff' },
  moon: { mass: 7.348e22, radius: 1.737e6, color: '#dcdde1' },
  asteroid: { mass: 1.0e15, radius: 1.0e4, color: '#7f8fa6' },
} as const;

const radiusFromMass = (mass: number) => {
  if (mass >= 1e30) return 6.9634e8 * Math.pow(mass / 1.989e30, 1 / 3);
  if (mass >= 1e27) return 7.1492e7 * Math.pow(mass / 1.898e27, 1 / 3);
  return 6.371e6 * Math.pow(mass / 5.9722e24, 1 / 3);
};

/**
 * Renders a properties dialog modal for editing an existing body's parameters.
 */
export function BodyEditDialog({ body, onConfirm, onCancel }: BodyEditDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(body.name || t('sandbox.defaultBodyName'));
  const [preset, setPreset] = useState<keyof typeof CONFIRM_PRESETS | 'custom'>('custom');
  const [mass, setMass] = useState(body.mass);
  const [velMag, setVelMag] = useState(() => Math.hypot(...body.velocity));
  const [velDir, setVelDir] = useState(() => {
    const angle = Math.atan2(body.velocity[1], body.velocity[0]) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
  });
  const [color, setColor] = useState(body.color);
  const [locked, setLocked] = useState(Boolean(body.locked));

  useEffect(() => {
    if (preset !== 'custom') {
      const data = CONFIRM_PRESETS[preset];
      setMass(data.mass);
      setColor(data.color);
    }
  }, [preset]);

  const handleConfirm = () => {
    const rad = radiusFromMass(mass);
    const radAngle = (velDir * Math.PI) / 180;
    const vx = velMag * Math.cos(radAngle);
    const vy = velMag * Math.sin(radAngle);
    onConfirm({
      ...body,
      name,
      mass,
      radius: rad,
      velocity: [vx, vy],
      color,
      locked,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div style={OVERLAY_STYLE} onClick={onCancel} data-testid="body-edit-dialog">
      <div style={DIALOG_STYLE} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '12px',
          }}
        >
          {t('editDialog.editTitle')}
        </h3>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.name')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={INPUT_STYLE}
          />
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.presetTemplate')}</span>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as any)}
            style={{ ...INPUT_STYLE, cursor: 'pointer' }}
          >
            <option value="custom" style={{ background: '#0f172a' }}>{t('dialog.presets.custom')}</option>
            <option value="earth" style={{ background: '#0f172a' }}>{t('dialog.presets.earth')}</option>
            <option value="sun" style={{ background: '#0f172a' }}>{t('dialog.presets.sun')}</option>
            <option value="jupiter" style={{ background: '#0f172a' }}>{t('dialog.presets.jupiter')}</option>
            <option value="moon" style={{ background: '#0f172a' }}>{t('dialog.presets.moon')}</option>
            <option value="asteroid" style={{ background: '#0f172a' }}>{t('dialog.presets.asteroid')}</option>
          </select>
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.mass')}</span>
          <input
            type="number"
            step="any"
            value={mass}
            onChange={(e) => {
              setMass(parseFloat(e.target.value) || 0);
              setPreset('custom');
            }}
            style={INPUT_STYLE}
          />
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.velMag')}</span>
          <input
            type="number"
            step="any"
            value={velMag}
            onChange={(e) => setVelMag(parseFloat(e.target.value) || 0)}
            style={INPUT_STYLE}
          />
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.velDir')}</span>
          <input
            type="number"
            min="0"
            max="360"
            step="1"
            value={velDir}
            onChange={(e) => setVelDir(parseFloat(e.target.value) || 0)}
            style={INPUT_STYLE}
          />
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.color')}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setPreset('custom');
              }}
              style={{ ...INPUT_STYLE, padding: '2px 4px', width: '48px', height: '36px', cursor: 'pointer' }}
            />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#94a3b8' }}>{color}</span>
          </div>
        </div>

        <div style={{ ...FIELD_STYLE, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="lockCheckbox"
            checked={locked}
            onChange={(e) => setLocked(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="lockCheckbox" style={{ ...LABEL_STYLE, cursor: 'pointer' }}>
            🔒 {t('editDialog.locked')}
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            style={{ ...BUTTON_STYLE, flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}
          >
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{ ...BUTTON_STYLE, flex: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff' }}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
