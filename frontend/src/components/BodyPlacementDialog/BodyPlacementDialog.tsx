import { useState, useEffect } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, BUTTON_STYLE } from './styles';
import { BodyFieldsForm, BodyPresetOption } from '../BodyFieldsForm/BodyFieldsForm';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleConfirm = () => {
    const rad = radiusFromMass(mass);
    const radAngle = (velDir * Math.PI) / 180;
    const vx = velMag * Math.cos(radAngle);
    const vy = velMag * Math.sin(radAngle);
    onConfirm({ id: `body-${Date.now()}`, position, velocity: [vx, vy], mass, radius: rad, color, name, locked: false });
  };

  const presetOptions: BodyPresetOption[] = [
    { value: 'earth', label: t('dialog.presets.earth') },
    { value: 'sun', label: t('dialog.presets.sun') },
    { value: 'jupiter', label: t('dialog.presets.jupiter') },
    { value: 'moon', label: t('dialog.presets.moon') },
    { value: 'asteroid', label: t('dialog.presets.asteroid') },
    { value: 'custom', label: t('dialog.presets.custom') },
  ];

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

        <BodyFieldsForm
          labels={{
            name: t('dialog.name'),
            presetTemplate: t('dialog.presetTemplate'),
            mass: t('dialog.mass'),
            velMag: t('dialog.velMag'),
            velDir: t('dialog.velDir'),
            color: t('dialog.color'),
          }}
          name={name}
          onNameChange={(n) => {
            setName(n);
            setPreset('custom');
          }}
          preset={preset}
          presetOptions={presetOptions}
          onPresetChange={(p) => setPreset(p as keyof typeof CONFIRM_PRESETS | 'custom')}
          mass={mass}
          onMassChange={(m) => {
            setMass(m);
            setPreset('custom');
          }}
          velMag={velMag}
          onVelMagChange={setVelMag}
          velDir={velDir}
          onVelDirChange={setVelDir}
          color={color}
          onColorChange={(c) => {
            setColor(c);
            setPreset('custom');
          }}
        />

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
