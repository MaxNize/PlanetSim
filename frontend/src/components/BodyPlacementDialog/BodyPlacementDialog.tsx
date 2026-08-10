import React, { useState, useEffect } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, FIELD_STYLE, LABEL_STYLE, INPUT_STYLE, BUTTON_STYLE } from './styles';

interface BodyPlacementDialogProps {
  position: [number, number];
  onConfirm: (body: SandboxBody) => void;
  onCancel: () => void;
  initialVelocity?: [number, number];
}

const CONFIRM_PRESETS = {
  sun: { mass: 1.989e30, radius: 6.9634e8, color: '#fbc531', name: 'Sun-like Star' },
  jupiter: { mass: 1.898e27, radius: 7.1492e7, color: '#e1b12c', name: 'Gas Giant' },
  earth: { mass: 5.9722e24, radius: 6.371e6, color: '#00a8ff', name: 'Terrestrial Planet' },
  moon: { mass: 7.348e22, radius: 1.737e6, color: '#dcdde1', name: 'Moon-like Satellite' },
  asteroid: { mass: 1.0e15, radius: 1.0e4, color: '#7f8fa6', name: 'Asteroid' },
} as const;

const radiusFromMass = (mass: number) => {
  if (mass >= 1e30) return 6.9634e8 * Math.pow(mass / 1.989e30, 1 / 3);
  if (mass >= 1e27) return 7.1492e7 * Math.pow(mass / 1.898e27, 1 / 3);
  return 6.371e6 * Math.pow(mass / 5.9722e24, 1 / 3);
};

/**
 * Renders a properties dialog modal for configuring a new body's parameters.
 */
export function BodyPlacementDialog({ position, onConfirm, onCancel, initialVelocity = [0, 0] }: BodyPlacementDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(() => t('dialog.defaultBodyName'));
  const [preset, setPreset] = useState<keyof typeof CONFIRM_PRESETS | 'custom'>('earth');
  const [mass, setMass] = useState(5.9722e24);
  const [velMag, setVelMag] = useState(() => Math.hypot(...initialVelocity));
  const [velDir, setVelDir] = useState(() => {
    const angle = Math.atan2(initialVelocity[1], initialVelocity[0]) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
  });
  const [color, setColor] = useState('#00a8ff');

  useEffect(() => {
    if (preset !== 'custom') {
      const data = CONFIRM_PRESETS[preset];
      setMass(data.mass);
      setColor(data.color);
      setName(t(`dialog.presets.${preset}`));
    }
  }, [preset, t]);

  const handleConfirm = () => {
    const rad = radiusFromMass(mass);
    const radAngle = (velDir * Math.PI) / 180;
    const vx = velMag * Math.cos(radAngle);
    const vy = velMag * Math.sin(radAngle);
    onConfirm({
      id: `body-${Date.now()}`,
      position,
      velocity: [vx, vy],
      mass,
      radius: rad,
      color,
      name,
      locked: false,
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
    <div style={OVERLAY_STYLE} onClick={onCancel}>
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
          {t('dialog.title')}
        </h3>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.name')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setPreset('custom');
            }}
            style={INPUT_STYLE}
          />
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.presetTemplate')}</span>
          <select value={preset} onChange={(e) => setPreset(e.target.value as any)} style={{ ...INPUT_STYLE, background: 'rgba(15, 23, 42, 0.95)', cursor: 'pointer' }}>
            <option value="earth">{t('dialog.presets.earth')}</option>
            <option value="sun">{t('dialog.presets.sun')}</option>
            <option value="jupiter">{t('dialog.presets.jupiter')}</option>
            <option value="moon">{t('dialog.presets.moon')}</option>
            <option value="asteroid">{t('dialog.presets.asteroid')}</option>
            <option value="custom">{t('dialog.presets.custom')}</option>
          </select>
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.mass')}</span>
          <input
            type="number"
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
          <input type="number" value={velMag} onChange={(e) => setVelMag(parseFloat(e.target.value) || 0)} style={INPUT_STYLE} />
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.velDir')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="range" min={0} max={360} value={velDir} onChange={(e) => setVelDir(parseInt(e.target.value, 10))} style={{ flex: 1, cursor: 'pointer' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', width: '45px', textAlign: 'right' }}>{Math.round(velDir)}°</span>
          </div>
        </div>

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.color')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setPreset('custom');
              }}
              style={{ cursor: 'pointer', border: 'none', background: 'none', width: '32px', height: '32px', padding: 0 }}
            />
            <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>{color.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onCancel} style={{ ...BUTTON_STYLE, flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}>
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...BUTTON_STYLE,
              flex: 1,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
