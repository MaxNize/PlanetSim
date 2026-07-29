import React from 'react';
import { StateDisplayProps } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';

interface BodyDisplayProps {
  name: string;
  color: string;
  position: [number, number];
  velocity: [number, number];
  posLabel: string;
  velLabel: string;
}

/**
 * Presentational component to display name, position, and velocity for a celestial body.
 */
function BodyDisplay({ name, color, position, velocity, posLabel, velLabel }: BodyDisplayProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e2e8f0' }}>{name}</span>
      </div>
      <div style={{ paddingLeft: '14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>
        {posLabel}: [{position[0].toExponential(3)}, {position[1].toExponential(3)}] m<br />
        {velLabel}: [{velocity[0].toFixed(2)}, {velocity[1].toFixed(2)}] m/s
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
  const { mode, currentState } = useSimulationContext();
  const { t } = useI18n();
  const totalEnergy = kineticEnergy !== undefined && potentialEnergy !== undefined ? kineticEnergy + potentialEnergy : undefined;
  const posLabel = t('telemetry.position');
  const velLabel = t('telemetry.velocity');

  return (
    <div style={{ padding: '20px', fontFamily: 'inherit' }}>
      <h3
        style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#fff',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '8px',
        }}
      >
        {t('telemetry.title')}
      </h3>

      {error && (
        <div
          style={{
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '16px',
          }}
        >
          ⚠️ Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>{t('telemetry.time')}:</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
            {time.toFixed(1)} s <span style={{ fontSize: '12px', fontWeight: 400, color: '#94a3b8' }}>({(time / 3600).toFixed(2)} h)</span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
          {mode === 'sandbox' && currentState.bodies ? (
            currentState.bodies.map((b: any, idx: number) => (
              <BodyDisplay
                key={b.id || `body-${idx}`}
                name={b.name || `Body ${idx + 1}`}
                color={b.color || '#fff'}
                position={b.position}
                velocity={b.velocity}
                posLabel={posLabel}
                velLabel={velLabel}
              />
            ))
          ) : (
            <>
              <BodyDisplay name={t('telemetry.primary')} color="#f0932b" position={primaryPos} velocity={primaryVel} posLabel={posLabel} velLabel={velLabel} />
              <BodyDisplay name={t('telemetry.secondary')} color="#48dbfb" position={secondaryPos} velocity={secondaryVel} posLabel={posLabel} velLabel={velLabel} />
              <BodyDisplay name={t('telemetry.testParticle')} color="#2ed573" position={testParticlePos} velocity={testParticleVel} posLabel={posLabel} velLabel={velLabel} />
            </>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>{t('telemetry.systemEnergies')}</span>
          <div style={{ marginTop: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>
            {t('telemetry.kinetic')}: {formatEnergy(kineticEnergy)} J<br />
            {t('telemetry.potential')}: {formatEnergy(potentialEnergy)} J<br />
            {t('telemetry.total')}: {formatEnergy(totalEnergy)} J
          </div>
        </div>
      </div>
    </div>
  );
}
