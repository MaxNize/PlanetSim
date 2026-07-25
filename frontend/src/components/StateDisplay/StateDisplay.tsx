import React from 'react';
import { StateDisplayProps } from '../../types';

interface BodyDisplayProps {
  name: string;
  position: [number, number];
  velocity: [number, number];
}

/**
 * Presentational component to display name, position, and velocity for a celestial body.
 */
function BodyDisplay({ name, position, velocity }: BodyDisplayProps) {
  return (
    <div>
      <strong>{name}:</strong>
      <div style={{ paddingLeft: '12px' }}>
        Pos: [{position[0].toExponential(3)}, {position[1].toExponential(3)}] m<br />
        Vel: [{velocity[0].toFixed(2)}, {velocity[1].toFixed(2)}] m/s
      </div>
    </div>
  );
}

function formatEnergy(value: number | undefined): string {
  return value !== undefined ? value.toExponential(4) : 'N/A';
}

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

        <BodyDisplay name="Primary Body (M1)" position={primaryPos} velocity={primaryVel} />
        <BodyDisplay name="Secondary Body (M2)" position={secondaryPos} velocity={secondaryVel} />
        <BodyDisplay name="Test Particle" position={testParticlePos} velocity={testParticleVel} />

        <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

        <div>
          <strong>Energies:</strong>
          <div style={{ paddingLeft: '12px' }}>
            Kinetic: {formatEnergy(kineticEnergy)} J<br />
            Potential: {formatEnergy(potentialEnergy)} J<br />
            Total: {formatEnergy(totalEnergy)} J
          </div>
        </div>
      </div>
    </div>
  );
}
