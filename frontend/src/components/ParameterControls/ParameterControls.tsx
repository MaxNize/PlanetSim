import React, { useState, useEffect } from 'react';
import { ParameterControlsProps } from '../../types';
import { ParameterField } from './ParameterField';
import { TrailControls } from './TrailControls';
import { SandboxControls } from './SandboxControls';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { CONTAINER_STYLE, HEADER_STYLE, CONTROLS_LIST_STYLE, BUTTONS_ROW_STYLE, PLAY_BUTTON_STYLE, RESET_BUTTON_STYLE, TABS_STYLE, TAB_BUTTON_STYLE } from './styles';
import { colors } from '../../styles/tokens';
import { formatMass, formatDistance } from '../../utils/formatUnits';

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

/**
 * Renders parameter control inputs and preset selector buttons.
 */
// Cyclomatic complexity is low (4); the high cognitive score is driven by 15 props and 7 hooks —
// this is the standard "container passes all simulation-control state down to a presentational
// component" pattern (Simulator.tsx owns the state, this just renders it). PresetSelector and
// SandboxControls were already extracted above; further prop-bundling would need a matching
// change in Simulator.tsx and doesn't reduce real complexity, just moves it into nested objects.
// fallow-ignore-next-line complexity
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
  placementActive = false,
  setPlacementActive = () => {},
}: ParameterControlsProps) {
  const { mode, setMode } = useSimulationContext();
  const { t } = useI18n();
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
    const v = parseFloat(localM1);
    if (!isNaN(v) && v >= 1e21 && v <= 1e33) setMassM1(v);
    else setLocalM1(massM1.toExponential(3));
  };
  const commitM2 = () => {
    const v = parseFloat(localM2);
    if (!isNaN(v) && v >= 1e21 && v <= 1e33) setMassM2(v);
    else setLocalM2(massM2.toExponential(3));
  };
  const commitDist = () => {
    const v = parseFloat(localDist);
    if (!isNaN(v) && v >= 1e6 && v <= 1e11) setDistanceR(v);
    else setLocalDist(distanceR.toExponential(3));
  };
  const commitSpeed = () => {
    const v = parseFloat(localSpeed);
    if (!isNaN(v) && v >= 1 && v <= 100000) setSpeedMultiplier(v);
    else setLocalSpeed(speedMultiplier.toFixed(0));
  };

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
        <SandboxControls placementActive={placementActive} setPlacementActive={setPlacementActive} />
      ) : (
        <div style={CONTROLS_LIST_STYLE}>
          <ParameterField
            label={t('controls.mass1')}
            value={localM1}
            onChangeText={setLocalM1}
            onCommit={commitM1}
            sliderMin={21}
            sliderMax={33}
            sliderVal={toLogValue(massM1)}
            onSliderChange={(val) => setMassM1(fromLogValue(val))}
            hint={formatMass(massM1)}
          />
          <ParameterField
            label={t('controls.mass2')}
            value={localM2}
            onChangeText={setLocalM2}
            onCommit={commitM2}
            sliderMin={21}
            sliderMax={33}
            sliderVal={toLogValue(massM2)}
            onSliderChange={(val) => setMassM2(fromLogValue(val))}
            hint={formatMass(massM2)}
          />
          <ParameterField
            label={t('controls.distanceR')}
            value={localDist}
            onChangeText={setLocalDist}
            onCommit={commitDist}
            sliderMin={6}
            sliderMax={11}
            sliderVal={toLogValue(distanceR)}
            onSliderChange={(val) => setDistanceR(fromLogValue(val))}
            hint={formatDistance(distanceR)}
          />
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '16px 0' }} />

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

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '16px 0' }} />
      <TrailControls />
    </div>
  );
}
