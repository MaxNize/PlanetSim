import React from 'react';
import { StateDisplayProps } from '../../types';

/**
 * Presentational component to display coordinates, velocities, energies, and error states.
 */
export function StateDisplay({ time, primaryPos, primaryVel, secondaryPos, secondaryVel, testParticlePos, testParticleVel, kineticEnergy, potentialEnergy, error }: StateDisplayProps) {
  const totalEnergy = kineticEnergy !== undefined && potentialEnergy !== undefined ? kineticEnergy + potentialEnergy : undefined;

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '16px' }}>
      <h3>Simulation Telemetry</h3>

      {error && <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '12px' }}>⚠️ Error: {error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace' }}>
        <div>
          <strong>Elapsed Time:</strong> {time.toFixed(1)} s ({(time / 3600).toFixed(2)} h)
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

        <div>
          <strong>Primary Body (M1):</strong>
          <div style={{ paddingLeft: '12px' }}>
            Pos: [{primaryPos[0].toExponential(3)}, {primaryPos[1].toExponential(3)}] m<br />
            Vel: [{primaryVel[0].toFixed(2)}, {primaryVel[1].toFixed(2)}] m/s
          </div>
        </div>

        <div>
          <strong>Secondary Body (M2):</strong>
          <div style={{ paddingLeft: '12px' }}>
            Pos: [{secondaryPos[0].toExponential(3)}, {secondaryPos[1].toExponential(3)}] m<br />
            Vel: [{secondaryVel[0].toFixed(2)}, {secondaryVel[1].toFixed(2)}] m/s
          </div>
        </div>

        <div>
          <strong>Test Particle:</strong>
          <div style={{ paddingLeft: '12px' }}>
            Pos: [{testParticlePos[0].toExponential(3)}, {testParticlePos[1].toExponential(3)}] m<br />
            Vel: [{testParticleVel[0].toFixed(2)}, {testParticleVel[1].toFixed(2)}] m/s
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

        <div>
          <strong>Energies:</strong>
          <div style={{ paddingLeft: '12px' }}>
            Kinetic: {kineticEnergy !== undefined ? kineticEnergy.toExponential(4) : 'N/A'} J<br />
            Potential: {potentialEnergy !== undefined ? potentialEnergy.toExponential(4) : 'N/A'} J<br />
            Total: {totalEnergy !== undefined ? totalEnergy.toExponential(4) : 'N/A'} J
          </div>
        </div>
      </div>
    </div>
  );
}
