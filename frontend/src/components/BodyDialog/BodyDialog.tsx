import { useState, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, FIELD_STYLE, LABEL_STYLE, BUTTON_STYLE } from '../BodyPlacementDialog/styles';
import { BodyFieldsForm, BodyPresetOption } from '../BodyFieldsForm/BodyFieldsForm';
import { BodyDialogProps, isEditProps, CONFIRM_PRESETS, EDIT_PRESET_OPTIONS, PLACE_PRESET_OPTIONS, getInitialFormState, buildConfirmedBody } from './bodyDialogLogic';

export type { BodyDialogProps };

/**
 * Renders a properties dialog modal for editing an existing sandbox body, or configuring a newly placed one.
 * The two modes share nearly all field markup and confirm math; they differ only in initial values, preset
 * option order, whether the locked checkbox is shown, and a couple of button/testid details.
 */
export function BodyDialog(props: BodyDialogProps) {
  const { onConfirm, onCancel } = props;
  const { t } = useI18n();

  const [initial] = useState(() => getInitialFormState(props, t));
  const [name, setName] = useState(initial.name);
  const [preset, setPreset] = useState(initial.preset);
  const [mass, setMass] = useState(initial.mass);
  const [velMag, setVelMag] = useState(initial.velMag);
  const [velDir, setVelDir] = useState(initial.velDir);
  const [color, setColor] = useState(initial.color);
  const [locked, setLocked] = useState(initial.locked);

  useEffect(() => {
    if (preset !== 'custom') {
      const data = CONFIRM_PRESETS[preset];
      setMass(data.mass);
      setColor(data.color);
      if (!isEditProps(props)) setName(t(`dialog.presets.${preset}`));
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
    onConfirm(buildConfirmedBody(props, { name, mass, velMag, velDir, color, locked }));
  };

  const presetOptionValues = isEditProps(props) ? EDIT_PRESET_OPTIONS : PLACE_PRESET_OPTIONS;
  const presetOptions: BodyPresetOption[] = presetOptionValues.map((value) => ({ value, label: t(`dialog.presets.${value}`) }));

  return (
    <div style={OVERLAY_STYLE} onClick={onCancel} data-testid={isEditProps(props) ? 'body-edit-dialog' : undefined}>
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
          {isEditProps(props) ? t('editDialog.editTitle') : t('dialog.title')}
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
            if (!isEditProps(props)) setPreset('custom');
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

        {isEditProps(props) && (
          <div style={{ ...FIELD_STYLE, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="lockCheckbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <label htmlFor="lockCheckbox" style={{ ...LABEL_STYLE, cursor: 'pointer' }}>
              🔒 {t('editDialog.locked')}
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onCancel} style={{ ...BUTTON_STYLE, flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: isEditProps(props) ? '#94a3b8' : '#fff' }}>
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...BUTTON_STYLE,
              flex: 1,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              ...(isEditProps(props) ? {} : { boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }),
            }}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
