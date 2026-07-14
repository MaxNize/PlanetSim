# SPEC-006: Canvas Rendering System

-

## 📝 User Story
```text
As a user
I want smooth, high-performance visualization of planetary motion
so that I can intuitively understand orbital mechanics in real time
```
-

## ✅ Acceptance Criteria

### Canvas Setup
- [ ] AC 1.1: Canvas element renders full viewport (responsive)
- [ ] AC 1.2: Canvas resolution scales with device pixel ratio (sharp on high-DPI)
- [ ] AC 1.3: WebGL or 2D context chosen (performance target: 60 FPS)

### Coordinate System
- [ ] AC 2.1: Physical coordinates (meters) map to canvas coordinates (pixels)
- [ ] AC 2.2: Scaling adjustable (zoom in/out to see orbits)
- [ ] AC 2.3: Pan/translate support (move view around simulation)
- [ ] AC 2.4: Origin centered or configurable

### Body Rendering
- [ ] AC 3.1: Each body drawn as circle with radius proportional to size
- [ ] AC 3.2: Body colors distinct and consistent (configurable palette)
- [ ] AC 3.3: Layering correct (no z-order issues)
- [ ] AC 3.4: Rendering accurate within canvas resolution

### Trail/Trajectory Rendering
- [ ] AC 4.1: Trail drawn as connected line segments following path
- [ ] AC 4.2: Trail length configurable (max points to store)
- [ ] AC 4.3: Trail fades or clears when disabled
- [ ] AC 4.4: Performance stable even with long trails (1000+ points)

### Text Overlay
- [ ] AC 5.1: Display current simulation time
- [ ] AC 5.2: Display body labels (e.g., "Body 1", "Body 2")
- [ ] AC 5.3: Display current zoom level (optional)
- [ ] AC 5.4: Text readable, non-intrusive

### Performance
- [ ] AC 6.1: Frame time < 16.67ms for 60 FPS target
- [ ] AC 6.2: No frame drops during normal simulation
- [ ] AC 6.3: Memory usage stable (no leaks after canvas re-renders)
- [ ] AC 6.4: Render optimized (batch draw calls, avoid expensive operations)

### Accessibility
- [ ] AC 7.1: ARIA labels for canvas (fallback text description)
- [ ] AC 7.2: Keyboard shortcuts documented (if pan/zoom via keyboard)

-

## 🔧 Technical Solution

### Canvas Component Structure

**`src/components/Canvas/Canvas.tsx`**
```typescript
interface CanvasProps {
  simulationState: SimulationState;
  viewportConfig: ViewportConfig;
  showTrail: boolean;
  trailLength: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  simulationState,
  viewportConfig,
  showTrail,
  trailLength,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new CanvasRenderer(canvasRef.current, viewportConfig);
    rendererRef.current = renderer;

    renderer.render(simulationState, showTrail ? trailLength : 0);
  }, [simulationState, viewportConfig, showTrail, trailLength]);

  return (
    <canvas
      ref={canvasRef}
      className="simulator-canvas"
      aria-label="Orbital mechanics simulation"
    />
  );
};
```
### Renderer Abstraction

**`src/services/CanvasRenderer.ts`**
```typescript
export interface ViewportConfig {
  scale: number;           // pixels per meter
  pan: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: ViewportConfig;
  private trails: Map<string, Point[]> = new Map();

  constructor(canvas: HTMLCanvasElement, viewport: ViewportConfig) {
    this.ctx = canvas.getContext('2d')!;
    this.viewport = viewport;
    this.handleDevicePixelRatio(canvas);
  }

  private handleDevicePixelRatio(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  render(state: SimulationState, trailLength: number) {
    this.clear();

    this.drawBody(state.body1, '#FF6B6B');
    this.drawBody(state.body2, '#4ECDC4');

    if (trailLength > 0) {
      this.updateTrail('body1', state.body1.position, trailLength);
      this.updateTrail('body2', state.body2.position, trailLength);
      this.drawTrails();
    }

    this.drawOverlay(state);
  }

  private drawBody(body: Body, color: string) {
    const { x, y } = this.worldToCanvas(body.position);
    const radius = Math.max(3, body.radius * this.viewport.scale);

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawTrails() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;

    for (const trail of this.trails.values()) {
      if (trail.length < 2) continue;

      this.ctx.beginPath();
      trail.forEach((point, i) => {
        const canvas = this.worldToCanvas(point);
        i === 0 ? this.ctx.moveTo(canvas.x, canvas.y) : this.ctx.lineTo(canvas.x, canvas.y);
      });
      this.ctx.stroke();
    }
  }

  private worldToCanvas(pos: [number, number]): { x: number; y: number } {
    const centerX = this.viewport.canvasWidth / 2;
    const centerY = this.viewport.canvasHeight / 2;
    return {
      x: centerX + (pos[0] - this.viewport.pan.x) * this.viewport.scale,
      y: centerY - (pos[1] - this.viewport.pan.y) * this.viewport.scale,
    };
  }

  private clear() {
    this.ctx.fillStyle = '#0B0E11';
    this.ctx.fillRect(0, 0, this.viewport.canvasWidth, this.viewport.canvasHeight);
  }

  private drawOverlay(state: SimulationState) {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`Time: ${state.time.toFixed(2)}s`, 10, 20);
    this.ctx.fillText(`Scale: ${this.viewport.scale.toFixed(2)}px/m`, 10, 35);
  }
}
```
### Styling
```css
/* Canvas.module.css */
.simulatorCanvas {
  display: block;
  width: 100%;
  height: 100vh;
  background: #0b0e11;
  cursor: grab;
}

.simulatorCanvas:active {
  cursor: grabbing;
}
```
-

## 🧪 Tests

- [ ] Unit: WorldToCanvas coordinate conversion
- [ ] Integration: Renderer updates when simulation state changes
- [ ] Performance: 1000-point trail renders without frame drops
- [ ] Manual: Visualize simulation, verify body positions and trails

-

## 🚀 Implementation Flow

1. Spec Review → Basic circle rendering (RED) → Coordinate mapping (GREEN) → Trails → Performance optimization → Manual visual verification

-

## ✅ Definition of Done

- [ ] DOD-Global: All criteria met
- [ ] DOD-Perf: Maintains 60 FPS (frame time < 16.67ms)
- [ ] DOD-Visual: Bodies and trails render correctly
- [ ] No canvas-related console warnings

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-002, SPEC-004, SPEC-005
**Required by**: SPEC-007, SPEC-008
