import { StateDisplayProps } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useSimulationAnimation } from '../../context/SimulationAnimationContext';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';
import { BodyList } from './BodyDisplay';
import { PerformanceDisplay } from './PerformanceDisplay';

function formatEnergy(value: number | undefined): string {
  return value !== undefined ? value.toExponential(4) : 'N/A';
}

/**
 * Presentational component to display coordinates, velocities, energies, and error states.
 */
export function StateDisplay({
  time,
  primaryPos,
  primaryVel,
  secondaryPos,
  secondaryVel,
  testParticlePos,
  testParticleVel,
  kineticEnergy,
  potentialEnergy,
  error,
  onOpenStressTest,
}: StateDisplayProps) {
  const { mode } = useSimulationContext();
  const { currentState } = useSimulationAnimation();
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
          color: colors.white,
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
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>{t('telemetry.time')}:</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.white, marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
            {time.toFixed(1)} s <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted }}>({(time / 3600).toFixed(2)} h)</span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
          <BodyList
            mode={mode}
            sandboxBodies={currentState.bodies}
            primary={{ pos: primaryPos, vel: primaryVel }}
            secondary={{ pos: secondaryPos, vel: secondaryVel }}
            testParticle={{ pos: testParticlePos, vel: testParticleVel }}
            labels={{ primary: t('telemetry.primary'), secondary: t('telemetry.secondary'), testParticle: t('telemetry.testParticle'), pos: posLabel, vel: velLabel }}
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>{t('telemetry.systemEnergies')}</span>
          <div style={{ marginTop: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>
            {t('telemetry.kinetic')}: {formatEnergy(kineticEnergy)} J<br />
            {t('telemetry.potential')}: {formatEnergy(potentialEnergy)} J<br />
            {t('telemetry.total')}: {formatEnergy(totalEnergy)} J
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

        <PerformanceDisplay onOpenStressTest={onOpenStressTest} />
      </div>
    </div>
  );
}
