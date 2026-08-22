import React, { useState, useEffect } from 'react';
import { ParameterField } from './ParameterField';
import { useI18n } from '../../context/I18nContext';
import { CONTROLS_LIST_STYLE } from './styles';
import { formatMass, formatDistance } from '../../utils/formatUnits';

const toLogValue = (val: number) => Math.log10(val);
const fromLogValue = (logVal: number) => Math.pow(10, logVal);

interface ThreeBodyControlsProps {
  massM1: number;
  setMassM1: (v: number) => void;
  massM2: number;
  setMassM2: (v: number) => void;
  distanceR: number;
  setDistanceR: (v: number) => void;
}

/**
 * Presentational component for 3-body system parameter controls (masses and distance).
 */
export function ThreeBodyControls({ massM1, setMassM1, massM2, setMassM2, distanceR, setDistanceR }: ThreeBodyControlsProps) {
  const { t } = useI18n();
  const [localM1, setLocalM1] = useState('');
  const [localM2, setLocalM2] = useState('');
  const [localDist, setLocalDist] = useState('');

  useEffect(() => {
    setLocalM1(massM1.toExponential(3));
    setLocalM2(massM2.toExponential(3));
    setLocalDist(distanceR.toExponential(3));
  }, [massM1, massM2, distanceR]);

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

  return (
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
  );
}
