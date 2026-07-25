import React, { useCallback } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { ParameterControls } from '../ParameterControls/ParameterControls';
import { StateDisplay } from '../StateDisplay/StateDisplay';

/**
 * Container component that connects the global simulation context to presentational children.
 */
export function Simulator() {
  const { initialState, setInitialState, currentState, stepResult, isPaused, setIsPaused, speedMultiplier, setSpeedMultiplier, lagrangePoints, resetSimulation, error } = useSimulationContext();

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
      // When distanceR changes, update secondary body position x coordinate
      setInitialState({
        ...initialState,
        secondary: { ...initialState.secondary, position: [d, 0.0] },
        testParticle: { ...initialState.testParticle, position: [d * 0.78, 0.0] }, // shift test particle position proportionally
      });
    },
    [initialState, setInitialState],
  );

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* Simulation Area */}
      <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          aria-label="Simulation Canvas Placeholder"
          style={{
            height: '400px',
            background: '#1e1e1e',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#888',
          }}
        >
          [Canvas Rendering Area Placeholder (SPEC-006)]
        </div>

        {/* Simple inline legend */}
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px', color: '#555' }}>
          <span>🟡 M1 (Primary)</span>
          <span>🔵 M2 (Secondary)</span>
          <span>🟢 Test Particle</span>
          {lagrangePoints && <span>🔴 Lagrange Points (L1-L5 computed)</span>}
        </div>
      </div>

      {/* Control Sidebar */}
      <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column' }}>
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
        />

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
  );
}
