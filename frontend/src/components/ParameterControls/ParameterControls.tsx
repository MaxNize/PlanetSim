import React, { useState, useEffect } from 'react';
import { ParameterControlsProps } from '../../types';
import { ParameterField } from './ParameterField';
import { TrailControls } from './TrailControls';
import { SandboxControls } from './SandboxControls';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { CONTAINER_STYLE, HEADER_STYLE, CONTROLS_LIST_STYLE, BUTTONS_ROW_STYLE, PLAY_BUTTON_STYLE, RESET_BUTTON_STYLE, TABS_STYLE, TAB_BUTTON_STYLE } from './styles';
import { colors } from '../../styles/tokens';

const toLogValue = (val: number) => Math.log10(val);
const fromLogValue = (logVal: number) => Math.pow(10, logVal);

function presetButtonStyle(active: boolean) {
  return {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: active ? `1px solid ${colors.accent}` : '1px solid rgba(255, 255, 255, 0.12)',
    background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    color: active ? colors.accent : colors.textMuted,
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
  } as const;
}

interface PresetSelectorProps {
  preset: 'earth-moon' | 'binary-stars' | 'custom';
  setPreset: (preset: 'earth-moon' | 'binary-stars' | 'custom') => void;
  earthMoonLabel: string;
  binaryStarsLabel: string;
}

function PresetSelector({ preset, setPreset, earthMoonLabel, binaryStarsLabel }: PresetSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <button onClick={() => setPreset('earth-moon')} style={presetButtonStyle(preset === 'earth-moon')}>
        {earthMoonLabel}
      </button>
      <button onClick={() => setPreset('binary-stars')} style={presetButtonStyle(preset === 'binary-stars')}>
        {binaryStarsLabel}
      </button>
    </div>
  );
}

import { ThreeBodyControls } from './ThreeBodyControls';

interface SpeedControlProps {
  speedMultiplier: number;
  setSpeedMultiplier: (v: number) => void;
}

function SpeedControl({ speedMultiplier, setSpeedMultiplier }: SpeedControlProps) {
  const { t } = useI18n();
  const [localSpeed, setLocalSpeed] = useState('');

  useEffect(() => {
    setLocalSpeed(speedMultiplier.toFixed(0));
  }, [speedMultiplier]);

  const commitSpeed = () => {
    const v = parseFloat(localSpeed);
    if (!isNaN(v) && v >= 1 && v <= 100000) setSpeedMultiplier(v);
    else setLocalSpeed(speedMultiplier.toFixed(0));
  };

  return (
    <div style={CONTROLS_LIST_STYLE}>
      <ParameterField
        label={t('controls.speedMultiplier')}
        value={localSpeed}
        onChangeText={setLocalSpeed}
        onCommit={commitSpeed}
        sliderMin={0}
        sliderMax={5}
        sliderVal={toLogValue(speedMultiplier)}
        onSliderChange={(val) => setSpeedMultiplier(fromLogValue(val))}
      />
    </div>
  );
}

/**
 * Renders parameter control inputs and preset selector buttons.
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
  onOpenStressTest,
}: ParameterControlsProps) {
  const { mode, setMode } = useSimulationContext();
  const { t } = useI18n();

  return (
    <div style={CONTAINER_STYLE}>
      <h2 style={HEADER_STYLE}>{t('controls.title')}</h2>

      <div style={TABS_STYLE}>
        <button onClick={() => setMode('3body')} style={TAB_BUTTON_STYLE(mode === '3body')}>
          {t('tabs.threeBody')}
        </button>
        <button onClick={() => setMode('sandbox')} style={TAB_BUTTON_STYLE(mode === 'sandbox')}>
          {t('tabs.sandbox')}
        </button>
      </div>

      {mode === '3body' && <PresetSelector preset={preset} setPreset={setPreset} earthMoonLabel={t('presets.earthMoon')} binaryStarsLabel={t('presets.binaryStars')} />}

      <div style={BUTTONS_ROW_STYLE}>
        <button onClick={() => setIsPaused(!isPaused)} style={PLAY_BUTTON_STYLE(isPaused)}>
          {isPaused ? t('controls.play') : t('controls.pause')}
        </button>
        <button onClick={onReset} style={RESET_BUTTON_STYLE}>
          {t('controls.reset')}
        </button>
      </div>

      {mode === 'sandbox' ? (
        <SandboxControls onOpenStressTest={onOpenStressTest} />
      ) : (
        <ThreeBodyControls massM1={massM1} setMassM1={setMassM1} massM2={massM2} setMassM2={setMassM2} distanceR={distanceR} setDistanceR={setDistanceR} />
      )}

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '16px 0' }} />

      <SpeedControl speedMultiplier={speedMultiplier} setSpeedMultiplier={setSpeedMultiplier} />

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '16px 0' }} />
      <TrailControls />
    </div>
  );
}
