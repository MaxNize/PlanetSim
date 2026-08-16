import React from 'react';
import { colors } from '../../styles/tokens';

const INPUT_STYLE = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '6px',
  color: colors.white,
  padding: '8px 12px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '13px',
  outline: 'none',
};

const FIELD_LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: colors.textMuted,
  marginBottom: '6px',
} as const;

interface ParameterFieldProps {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  onCommit: () => void;
  sliderMin: number;
  sliderMax: number;
  sliderVal: number;
  onSliderChange: (val: number) => void;
}

/**
 * Renders an individual parameter input field with a label, a text box,
 * and a range slider, coordinating typing and dragging behaviors.
 */
export function ParameterField({ label, value, onChangeText, onCommit, sliderMin, sliderMax, sliderVal, onSliderChange }: ParameterFieldProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommit();
      e.currentTarget.blur();
    }
  };
  return (
    <label style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={FIELD_LABEL_STYLE}>{label}</span>
      <input type="text" value={value} onChange={(e) => onChangeText(e.target.value)} onBlur={onCommit} onKeyDown={handleKeyDown} style={INPUT_STYLE} />
      <input type="range" min={sliderMin} max={sliderMax} step={0.01} value={sliderVal} onChange={(e) => onSliderChange(parseFloat(e.target.value))} />
    </label>
  );
}
