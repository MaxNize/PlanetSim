import React, { useCallback, useState } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { ParameterControls } from '../ParameterControls/ParameterControls';
import { StateDisplay } from '../StateDisplay/StateDisplay';
import { Canvas } from '../Canvas/Canvas';

const LEGEND_STYLE = {
  position: 'absolute',
  bottom: '24px',
  left: '24px',
  zIndex: 10,
  background: 'rgba(5, 7, 10, 0.75)',
  backdropFilter: 'blur(8px)',
  padding: '12px 18px',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  gap: '16px',
  fontSize: '12px',
  color: '#ccc',
  fontFamily: 'sans-serif',
} as const;

interface SimulatorLegendProps {
  mode: 'sandbox' | '3body';
  hasLagrangePoints: boolean;
}

function SimulatorLegend({ mode, hasLagrangePoints }: SimulatorLegendProps) {
  return (
    <div style={LEGEND_STYLE}>
      {mode === 'sandbox' ? (
        <span>🌌 Custom Bodies Active (Verlet N-Body Simulator)</span>
      ) : (
        <>
          <span>🟡 M1 (Primary)</span>
          <span>🔵 M2 (Secondary)</span>
          <span>🟢 Test Particle</span>
          {hasLagrangePoints && <span>🔴 Lagrange Points (L1-L5 computed)</span>}
        </>
      )}
    </div>
  );
}

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

  const [placementActive, setPlacementActive] = useState(false);

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
        <Canvas
          showTrail={true}
          placementActive={placementActive}
          onPlacementCancel={() => setPlacementActive(false)}
          onPlacementComplete={(body) => {
            addBody(body);
            setPlacementActive(false);
          }}
        />
      </div>

      {/* Floating Legend Overlay */}
      <SimulatorLegend mode={mode} hasLagrangePoints={!!lagrangePoints} />

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
        <div
          style={{
            background: 'rgba(5, 7, 10, 0.75)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
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
            placementActive={placementActive}
            setPlacementActive={setPlacementActive}
          />
        </div>

        <div
          style={{
            background: 'rgba(5, 7, 10, 0.75)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
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
