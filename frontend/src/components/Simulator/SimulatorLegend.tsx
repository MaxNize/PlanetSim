import { memo } from 'react';

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

/**
 * Floating legend explaining the canvas's current color coding.
 * Memoized: `hasLagrangePoints` is a boolean derived from the 60Hz lagrangePoints state upstream,
 * so without React.memo this would re-render every animation frame despite its own props rarely
 * changing value (see ParameterControls for the same pattern).
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- React.memo(Component) is the standard PascalCase idiom; the rule has no carve-out for it.
export const SimulatorLegend = memo(function SimulatorLegend({ mode, hasLagrangePoints }: SimulatorLegendProps) {
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
});
