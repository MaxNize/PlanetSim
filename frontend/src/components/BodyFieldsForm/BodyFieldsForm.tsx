import { FIELD_STYLE, LABEL_STYLE, INPUT_STYLE } from '../BodyPlacementDialog/styles';

export interface BodyPresetOption {
  value: string;
  label: string;
}

interface BodyFieldsFormProps {
  labels: {
    name: string;
    presetTemplate: string;
    mass: string;
    velMag: string;
    velDir: string;
    color: string;
  };
  name: string;
  onNameChange: (value: string) => void;
  preset: string;
  presetOptions: BodyPresetOption[];
  onPresetChange: (value: string) => void;
  mass: number;
  onMassChange: (value: number) => void;
  velMag: number;
  onVelMagChange: (value: number) => void;
  velDir: number;
  onVelDirChange: (value: number) => void;
  color: string;
  onColorChange: (value: string) => void;
}

/**
 * Shared labeled-field layout for configuring a celestial body's name, preset, mass, and velocity.
 */
export function BodyFieldsForm({
  labels,
  name,
  onNameChange,
  preset,
  presetOptions,
  onPresetChange,
  mass,
  onMassChange,
  velMag,
  onVelMagChange,
  velDir,
  onVelDirChange,
  color,
  onColorChange,
}: BodyFieldsFormProps) {
  return (
    <>
      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.name}</span>
        <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.presetTemplate}</span>
        <select value={preset} onChange={(e) => onPresetChange(e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
          {presetOptions.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0f172a' }}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.mass}</span>
        <input type="number" step="any" value={mass} onChange={(e) => onMassChange(parseFloat(e.target.value) || 0)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.velMag}</span>
        <input type="number" step="any" value={velMag} onChange={(e) => onVelMagChange(parseFloat(e.target.value) || 0)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.velDir}</span>
        <input
          type="number"
          min="0"
          max="360"
          step="1"
          value={velDir}
          onChange={(e) => onVelDirChange(parseFloat(e.target.value) || 0)}
          style={INPUT_STYLE}
        />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.color}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{ ...INPUT_STYLE, padding: '2px 4px', width: '48px', height: '36px', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#94a3b8' }}>{color}</span>
        </div>
      </div>
    </>
  );
}
