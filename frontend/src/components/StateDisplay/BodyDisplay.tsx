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
export function BodyDisplay({ name, color, position, velocity, posLabel, velLabel }: BodyDisplayProps) {
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
  selectedBodyId: string | null;
  primary: { pos: [number, number]; vel: [number, number] };
  secondary: { pos: [number, number]; vel: [number, number] };
  testParticle: { pos: [number, number]; vel: [number, number] };
  labels: { primary: string; secondary: string; testParticle: string; pos: string; vel: string; selectBodyHint: string };
}

/**
 * Renders the position/velocity readout for either the fixed 3-body set, or — in sandbox mode —
 * just the selected body. Live telemetry sits inside SimulationAnimationContext's 60Hz-updating
 * subtree; React re-walks that whole subtree on every context update (the Provider wraps the
 * entire Simulator tree), so its cost scales with everything rendered under the provider, not
 * just with what actually reads the context. Rendering one row per sandbox body — up to 1000 of
 * them — dwarfed the physics step itself. The interactive, editable list in SandboxControls
 * (which only updates on add/remove/edit, not every step) already covers browsing all bodies.
 */
export function BodyList({ mode, sandboxBodies, selectedBodyId, primary, secondary, testParticle, labels }: BodyListProps) {
  if (mode === 'sandbox' && sandboxBodies) {
    const idx = sandboxBodies.findIndex((b) => b.id === selectedBodyId);
    if (idx === -1) {
      return <span style={{ fontSize: '11px', fontStyle: 'italic', color: colors.textMuted }}>{labels.selectBodyHint}</span>;
    }
    const b = sandboxBodies[idx];
    return <BodyDisplay name={b.name || `Body ${idx + 1}`} color={b.color || colors.white} position={b.position} velocity={b.velocity} posLabel={labels.pos} velLabel={labels.vel} />;
  }
  return (
    <>
      <BodyDisplay name={labels.primary} color="#f0932b" position={primary.pos} velocity={primary.vel} posLabel={labels.pos} velLabel={labels.vel} />
      <BodyDisplay name={labels.secondary} color="#48dbfb" position={secondary.pos} velocity={secondary.vel} posLabel={labels.pos} velLabel={labels.vel} />
      <BodyDisplay name={labels.testParticle} color="#2ed573" position={testParticle.pos} velocity={testParticle.vel} posLabel={labels.pos} velLabel={labels.vel} />
    </>
  );
}
