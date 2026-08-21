import { useRef, useEffect, useState } from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { useSimulationAnimation } from '../../context/SimulationAnimationContext';
import { CanvasRenderer, ViewportConfig } from '../../services/CanvasRenderer';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';

interface MiniviewCanvasProps {
  bodyId: string;
  onClose: () => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;

/** Computes a tight viewport centered on the body, scaled to fill roughly a quarter of the frame at zoomFactor 1. */
function computeFocusViewport(body: { position: [number, number]; radius: number }, canvasWidth: number, canvasHeight: number, zoomFactor: number): ViewportConfig {
  const targetRadiusPx = Math.min(canvasWidth, canvasHeight) * 0.25;
  return { scale: (targetRadiusPx / Math.max(body.radius, 1)) * zoomFactor, pan: { x: body.position[0], y: body.position[1] } };
}

/**
 * Small fixed secondary canvas showing one body zoomed in ("in focus"), independent of and
 * simultaneous with the freely user-controlled main viewport (FP-37). Scroll-wheel zooms the
 * miniview in/out independently of the main viewport's zoom.
 */
export function MiniviewCanvas({ bodyId, onClose }: MiniviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const { selectedBodyId } = useSimulationContext();
  const { currentState, trailHistory, lagrangePoints } = useSimulationAnimation();
  const { t } = useI18n();
  const [zoomFactor, setZoomFactor] = useState(1);

  const body = currentState.bodies?.find((b) => b.id === bodyId);

  useEffect(() => {
    // Switching to a different body resets zoom rather than carrying over an unrelated scale.
    setZoomFactor(1);
  }, [bodyId]);

  useEffect(() => {
    if (!canvasRef.current || !body) return;
    if (!rendererRef.current) rendererRef.current = new CanvasRenderer(canvasRef.current);

    const rect = canvasRef.current.getBoundingClientRect();
    const focusViewport = computeFocusViewport(body, rect.width, rect.height, zoomFactor);
    rendererRef.current.draw(currentState, trailHistory, false, lagrangePoints, focusViewport, undefined, selectedBodyId, bodyId);
  }, [currentState, body, trailHistory, lagrangePoints, selectedBodyId, bodyId, zoomFactor]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const step = e.deltaY > 0 ? 0.85 : 1.15;
    setZoomFactor((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * step)));
  };

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
      <canvas ref={canvasRef} onWheel={handleWheel} aria-label="Body miniview" style={{ display: 'block', width: '220px', height: '160px', cursor: 'ns-resize' }} />
    </div>
  );
}
