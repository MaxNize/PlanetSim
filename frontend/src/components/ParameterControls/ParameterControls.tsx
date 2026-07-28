import React, { useState, useEffect } from 'react';
import { ParameterControlsProps } from '../../types';
import { ParameterField } from './ParameterField';

const toLogValue = (val: number) => Math.log10(val);
const fromLogValue = (logVal: number) => Math.pow(10, logVal);

const CONTAINER_STYLE = { padding: '20px', fontFamily: 'inherit' } as const;
const HEADER_STYLE = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#fff',
  marginBottom: '16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  paddingBottom: '8px',
} as const;
const PRESETS_CONTAINER_STYLE = { display: 'flex', gap: '8px', marginBottom: '16px' } as const;
const BUTTONS_ROW_STYLE = { display: 'flex', gap: '8px', marginBottom: '20px' } as const;
const CONTROLS_LIST_STYLE = { display: 'flex', flexDirection: 'column', gap: '16px' } as const;

const PLAY_BUTTON_STYLE = (isPaused: boolean) => ({
  flex: 1,
  padding: '10px 16px',
  borderRadius: '6px',
  border: isPaused ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
  background: isPaused ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(255, 255, 255, 0.1)',
  color: '#fff',
  fontWeight: 500,
  fontSize: '13px',
  cursor: 'pointer',
  boxShadow: isPaused ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  outline: 'none',
});

const RESET_BUTTON_STYLE = {
  flex: 1,
  padding: '10px 16px',
  borderRadius: '6px',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#f87171',
  fontWeight: 500,
  fontSize: '13px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  outline: 'none',
};

/**
 * Renders the slider and text input controls for adjusting physics parameters
 * such as mass, distance, and speed multiplier, alongside preset configuration buttons.
 */
export function ParameterControls({
  massM1,
  setMassM1,
  massM2,
  setMassM2,
  distanceR,
  setDistanceR,
  speedMultiplier,
  setSpeedMultiplier,
  isPaused,
  setIsPaused,
  onReset,
  preset,
  setPreset,
}: ParameterControlsProps) {
  const [localM1, setLocalM1] = useState('');
  const [localM2, setLocalM2] = useState('');
  const [localDist, setLocalDist] = useState('');
  const [localSpeed, setLocalSpeed] = useState('');

  useEffect(() => {
    setLocalM1(massM1.toExponential(3));
    setLocalM2(massM2.toExponential(3));
    setLocalDist(distanceR.toExponential(3));
    setLocalSpeed(speedMultiplier.toFixed(0));
  }, [massM1, massM2, distanceR, speedMultiplier]);

  const commitM1 = () => {
    const val = parseFloat(localM1);
    if (!isNaN(val) && val > 0 && val >= 1e21 && val <= 1e33) setMassM1(val);
    else setLocalM1(massM1.toExponential(3));
  };

  const commitM2 = () => {
    const val = parseFloat(localM2);
    if (!isNaN(val) && val > 0 && val >= 1e21 && val <= 1e33) setMassM2(val);
    else setLocalM2(massM2.toExponential(3));
  };

  const commitDist = () => {
    const val = parseFloat(localDist);
    if (!isNaN(val) && val > 0 && val >= 1e6 && val <= 1e11) setDistanceR(val);
    else setLocalDist(distanceR.toExponential(3));
  };

  const commitSpeed = () => {
    const val = parseFloat(localSpeed);
    if (!isNaN(val) && val > 0 && val >= 1 && val <= 100000) setSpeedMultiplier(val);
    else setLocalSpeed(speedMultiplier.toFixed(0));
  };

  const presetStyle = (p: typeof preset) => ({
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: preset === p ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
    background: preset === p ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    color: preset === p ? '#3b82f6' : '#94a3b8',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  });

  return (
    <div style={CONTAINER_STYLE}>
      <h3 style={HEADER_STYLE}>Simulation System</h3>

      <div style={PRESETS_CONTAINER_STYLE}>
        <button onClick={() => setPreset('earth-moon')} style={presetStyle('earth-moon')}>
          🌍 Earth-Moon
        </button>
        <button onClick={() => setPreset('binary-stars')} style={presetStyle('binary-stars')}>
          ✨ Binary Stars
        </button>
      </div>

      <div style={BUTTONS_ROW_STYLE}>
        <button onClick={() => setIsPaused(!isPaused)} style={PLAY_BUTTON_STYLE(isPaused)}>
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
        <button onClick={onReset} style={RESET_BUTTON_STYLE}>
          🔄 Reset
        </button>
      </div>

      <div style={CONTROLS_LIST_STYLE}>
        <ParameterField
          label="Mass 1 (Primary, kg)"
          value={localM1}
          onChangeText={setLocalM1}
          onCommit={commitM1}
          sliderMin={21}
          sliderMax={33}
          sliderVal={toLogValue(massM1)}
          onSliderChange={(val) => setMassM1(fromLogValue(val))}
        />
        <ParameterField
          label="Mass 2 (Secondary, kg)"
          value={localM2}
          onChangeText={setLocalM2}
          onCommit={commitM2}
          sliderMin={21}
          sliderMax={33}
          sliderVal={toLogValue(massM2)}
          onSliderChange={(val) => setMassM2(fromLogValue(val))}
        />
        <ParameterField
          label="Distance R (m)"
          value={localDist}
          onChangeText={setLocalDist}
          onCommit={commitDist}
          sliderMin={6}
          sliderMax={11}
          sliderVal={toLogValue(distanceR)}
          onSliderChange={(val) => setDistanceR(fromLogValue(val))}
        />
        <ParameterField
          label="Speed Multiplier (time scale)"
          value={localSpeed}
          onChangeText={setLocalSpeed}
          onCommit={commitSpeed}
          sliderMin={0}
          sliderMax={5}
          sliderVal={toLogValue(speedMultiplier)}
          onSliderChange={(val) => setSpeedMultiplier(fromLogValue(val))}
        />
      </div>
    </div>
  );
}
