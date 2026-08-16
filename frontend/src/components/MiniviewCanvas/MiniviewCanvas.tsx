import { useRef, useEffect } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { CanvasRenderer, ViewportConfig } from '../../services/CanvasRenderer';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';

interface MiniviewCanvasProps {
  bodyId: string;
  onClose: () => void;
}

/** Computes a tight viewport centered on and scaled to the given body, so it fills roughly a quarter of the frame. */
function computeFocusViewport(body: { position: [number, number]; radius: number }, canvasWidth: number, canvasHeight: number): ViewportConfig {
  const targetRadiusPx = Math.min(canvasWidth, canvasHeight) * 0.25;
  return { scale: targetRadiusPx / Math.max(body.radius, 1), pan: { x: body.position[0], y: body.position[1] } };
}

/**
 * Small fixed secondary canvas showing one body zoomed in ("in focus"), independent of and
 * simultaneous with the freely user-controlled main viewport (FP-37).
 */
export function MiniviewCanvas({ bodyId, onClose }: MiniviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const { currentState, trailHistory, lagrangePoints, selectedBodyId } = useSimulationContext();
  const { t } = useI18n();

  const body = currentState.bodies?.find((b) => b.id === bodyId);

  useEffect(() => {
    if (!canvasRef.current || !body) return;
    if (!rendererRef.current) rendererRef.current = new CanvasRenderer(canvasRef.current);

    const rect = canvasRef.current.getBoundingClientRect();
    const focusViewport = computeFocusViewport(body, rect.width, rect.height);
    rendererRef.current.draw(currentState, trailHistory, false, lagrangePoints, focusViewport, undefined, selectedBodyId, bodyId);
  }, [currentState, body, trailHistory, lagrangePoints, selectedBodyId, bodyId]);

  if (!body) return null;

  return (
    <div
      style={{
        // Stacked above the bottom-left SimulatorLegend so the two fixed overlays don't collide;
        // top-left is already taken by the app header and the right side by the control sidebar.
        position: 'fixed',
        bottom: '80px',
        left: '24px',
        zIndex: 900,
        background: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', fontSize: '11px', color: colors.textMuted }}>
        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🔍 {body.name || t('sandbox.defaultBodyName')}</span>
        <button
          onClick={onClose}
          aria-label={t('contextMenu.hideMiniview')}
          style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '13px', padding: '0 0 0 8px' }}
        >
          ✕
        </button>
      </div>
      <canvas ref={canvasRef} aria-label="Body miniview" style={{ display: 'block', width: '220px', height: '160px' }} />
    </div>
  );
}
