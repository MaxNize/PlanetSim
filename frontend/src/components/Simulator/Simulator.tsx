import React, { useCallback, useState } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { ParameterControls } from '../ParameterControls/ParameterControls';
import { StateDisplay } from '../StateDisplay/StateDisplay';
import { Canvas } from '../Canvas/Canvas';
import { Toast } from '../Toast/Toast';
import { SimulatorLegend } from './SimulatorLegend';
import { SandboxBody } from '../../types';
import { colors } from '../../styles/tokens';

/** Maps a thrown addBody error to a localized, user-facing message (FP-38). */
function resolveCreateBodyErrorMessage(err: unknown, t: (key: string) => string): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.startsWith('Maximum')) return t('sandbox.maxBodiesReached');
  if (raw.startsWith('Overlap')) return t('sandbox.overlapDetected');
  return raw;
}

const CARD_STYLE = {
  background: 'rgba(5, 7, 10, 0.75)',
  backdropFilter: 'blur(8px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: colors.white,
  overflow: 'hidden',
  flexShrink: 0,
} as const;

/**
 * Container component that connects the global simulation context to presentational children.
 */
export function Simulator() {
  const {
    initialState,
    setInitialState,
    currentState,
    stepResult,
    isPaused,
    setIsPaused,
    speedMultiplier,
    setSpeedMultiplier,
    lagrangePoints,
    resetSimulation,
    error,
    preset,
    setPreset,
    mode,
    addBody,
  } = useSimulationContext();
  const { t } = useI18n();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateBody = useCallback(
    (body: SandboxBody) => {
      try {
        addBody(body);
      } catch (err) {
        setToastMessage(resolveCreateBodyErrorMessage(err, t));
      }
    },
    [addBody, t],
  );

  const setMassM1 = useCallback(
    (m: number) => {
      setInitialState({
        ...initialState,
        primary: { ...initialState.primary, mass: m },
      });
    },
    [initialState, setInitialState],
  );

  const setMassM2 = useCallback(
    (m: number) => {
      setInitialState({
        ...initialState,
        secondary: { ...initialState.secondary, mass: m },
      });
    },
    [initialState, setInitialState],
  );

  const setDistanceR = useCallback(
    (d: number) => {
      setInitialState({
        ...initialState,
        secondary: { ...initialState.secondary, position: [d, 0.0] },
        testParticle: { ...initialState.testParticle, position: [d * 0.78, 0.0] },
      });
    },
    [initialState, setInitialState],
  );

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Simulation Area (Fullscreen Background Canvas) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Canvas showTrail={true} onPlacementComplete={handleCreateBody} />
      </div>

      {/* Floating Legend Overlay */}
      <SimulatorLegend mode={mode} hasLagrangePoints={!!lagrangePoints} />
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

      {/* Floating Control Sidebar */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          bottom: '24px',
          width: '320px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          padding: '4px',
        }}
      >
        <div style={CARD_STYLE}>
          <ParameterControls
            massM1={initialState.primary.mass}
            setMassM1={setMassM1}
            massM2={initialState.secondary.mass}
            setMassM2={setMassM2}
            distanceR={initialState.secondary.position[0]}
            setDistanceR={setDistanceR}
            speedMultiplier={speedMultiplier}
            setSpeedMultiplier={setSpeedMultiplier}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onReset={resetSimulation}
            preset={preset}
            setPreset={setPreset}
          />
        </div>

        <div style={CARD_STYLE}>
          <StateDisplay
            time={currentState.time}
            primaryPos={currentState.primary.position}
            primaryVel={currentState.primary.velocity}
            secondaryPos={currentState.secondary.position}
            secondaryVel={currentState.secondary.velocity}
            testParticlePos={currentState.testParticle.position}
            testParticleVel={currentState.testParticle.velocity}
            kineticEnergy={stepResult?.kineticEnergy}
            potentialEnergy={stepResult?.potentialEnergy}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
