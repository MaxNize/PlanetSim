import { StateDisplayProps } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { SimulationMode } from '../../types';
import { colors } from '../../styles/tokens';
import { formatDistance, formatVelocity } from '../../utils/formatUnits';

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
        {posLabel}: [{formatDistance(position[0])}, {formatDistance(position[1])}]<br />
        {velLabel}: [{formatVelocity(velocity[0])}, {formatVelocity(velocity[1])}]
      </div>
    </div>
  );
}

interface BodyListProps {
  mode: SimulationMode;
  sandboxBodies?: { id?: string; name?: string; color?: string; position: [number, number]; velocity: [number, number] }[];
  primary: { pos: [number, number]; vel: [number, number] };
  secondary: { pos: [number, number]; vel: [number, number] };
  testParticle: { pos: [number, number]; vel: [number, number] };
  labels: { primary: string; secondary: string; testParticle: string; pos: string; vel: string };
}

/**
 * Renders the position/velocity readout for either the sandbox custom bodies or the fixed 3-body set.
 */
function BodyList({ mode, sandboxBodies, primary, secondary, testParticle, labels }: BodyListProps) {
  if (mode === 'sandbox' && sandboxBodies) {
    return (
      <>
        {sandboxBodies.map((b, idx) => (
          <BodyDisplay
            key={b.id || `body-${idx}`}
            name={b.name || `Body ${idx + 1}`}
            color={b.color || colors.white}
            position={b.position}
            velocity={b.velocity}
            posLabel={labels.pos}
            velLabel={labels.vel}
          />
        ))}
      </>
    );
  }
  return (
    <>
      <BodyDisplay name={labels.primary} color="#f0932b" position={primary.pos} velocity={primary.vel} posLabel={labels.pos} velLabel={labels.vel} />
      <BodyDisplay name={labels.secondary} color="#48dbfb" position={secondary.pos} velocity={secondary.vel} posLabel={labels.pos} velLabel={labels.vel} />
      <BodyDisplay name={labels.testParticle} color="#2ed573" position={testParticle.pos} velocity={testParticle.vel} posLabel={labels.pos} velLabel={labels.vel} />
    </>
  );
}

const STATUS_COLORS: Record<'smooth' | 'moderate' | 'lag', string> = {
  smooth: '#2ed573',
  moderate: '#feca57',
  lag: '#ff6b6b',
};

const STATUS_KEYS: Record<'smooth' | 'moderate' | 'lag', string> = {
  smooth: 'telemetry.statusSmooth',
  moderate: 'telemetry.statusModerate',
  lag: 'telemetry.statusLag',
};

// fallow-ignore-next-line complexity
function PerformanceDisplay({ onOpenStressTest }: { onOpenStressTest?: () => void }) {
  const { fps, frameTimeMs, fpsStatus } = useSimulationContext();
  const { t } = useI18n();

  const statusColor = STATUS_COLORS[fpsStatus] || STATUS_COLORS.smooth;
  const statusLabel = t(STATUS_KEYS[fpsStatus] || STATUS_KEYS.smooth);
  const displayFps = fps ?? 60;
  const displayFrameMs = frameTimeMs !== undefined ? frameTimeMs.toFixed(1) : '16.7';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }}>{t('telemetry.performance')}:</span>
        {onOpenStressTest && (
          <button
            onClick={onOpenStressTest}
            style={{
              background: 'rgba(0, 210, 211, 0.15)',
              border: '1px solid rgba(0, 210, 211, 0.35)',
              color: '#00d2d3',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('controls.stressTest')}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: statusColor }}>
          {displayFps} {t('telemetry.fps')}
        </div>
        <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: colors.textMuted }}>{displayFrameMs} ms</span>
      </div>
      <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: 500, color: statusColor }}>{statusLabel}</div>
    </div>
  );
}

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
