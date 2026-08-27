# SPEC-008: Trajectory Visualization

-

## 📝 User Story
```text
As a student learning orbital mechanics
I want to see the paths that bodies trace over time
so that I can understand and predict planetary motion patterns
```
-

## ✅ Acceptance Criteria

### Trail Rendering
- [ ] AC 1.1: Trail displays as line connecting past positions
- [ ] AC 1.2: Trail length configurable (max points, time window, or distance)
- [ ] AC 1.3: Trail has distinct color per body
- [ ] AC 1.4: Trail line width tunable (default 1-2px)

### Trail Controls
- [ ] AC 2.1: Toggle trail visibility (checkbox or button)
- [ ] AC 2.2: Clear trail history (reset button)
- [ ] AC 2.3: Adjust trail length via slider (range: 100-5000 points)
- [ ] AC 2.4: Visual feedback when trail is enabled/disabled

### Performance
- [ ] AC 3.1: 5000-point trail renders at 60 FPS
- [ ] AC 3.2: Memory usage capped (circular buffer, oldest points discarded)
- [ ] AC 3.3: No frame drops when adding new trail points

### Visual Clarity
- [ ] AC 4.1: Trail fades (alpha gradient) for older segments (optional)
- [ ] AC 4.2: Trail does not obscure body rendering
- [ ] AC 4.3: Trail visible against background
- [ ] AC 4.4: Trail labels (Body 1, Body 2) or legend

### Edge Cases
- [ ] AC 5.1: Trail clears on parameter reset
- [ ] AC 5.2: Trail renders correctly after pause/resume
- [ ] AC 5.3: Trail accuracy matches body position (no lag)

-

## 🔧 Technical Solution

### Trail Management

**`src/services/TrailManager.ts`**
```typescript
export interface TrailPoint {
  position: [number, number];
  time: number;
}

export class TrailManager {
  private trails: Map<string, TrailPoint[]> = new Map();
  private maxPoints: number;

  constructor(maxPoints: number = 1000) {
    this.maxPoints = maxPoints;
    this.trails.set('body1', []);
    this.trails.set('body2', []);
  }

  addPoint(bodyId: string, position: [number, number], time: number) {
    const trail = this.trails.get(bodyId);
    if (!trail) return;

    trail.push({ position, time });

    // Maintain max size with circular buffer
    if (trail.length > this.maxPoints) {
      trail.shift();
    }
  }

  getTrail(bodyId: string): TrailPoint[] {
    return this.trails.get(bodyId) || [];
  }

  clearTrail(bodyId?: string) {
    if (bodyId) {
      this.trails.set(bodyId, []);
    } else {
      this.trails.forEach((_, key) => this.trails.set(key, []));
    }
  }

  setMaxPoints(maxPoints: number) {
    this.maxPoints = maxPoints;
    this.trails.forEach((trail) => {
      while (trail.length > maxPoints) {
        trail.shift();
      }
    });
  }
}
```
### Canvas Rendering

**`src/services/CanvasRenderer.ts` (enhanced)**
```typescript
export class CanvasRenderer {
  // ... existing code ...

  renderTrail(bodyId: string, trail: TrailPoint[], color: string, showFade: boolean = true) {
    const ctx = this.ctx;
    if (trail.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    trail.forEach((point, index) => {
      const { x, y } = this.worldToCanvas(point.position);

      if (showFade) {
        // Fade older points
        const alpha = (index + 1) / trail.length;
        ctx.globalAlpha = alpha * 0.7;
      }

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.globalAlpha = 1;
    ctx.stroke();
  }
}
```
### Component: TrailControls

**`src/components/TrailControls/TrailControls.tsx`**
```typescript
interface TrailControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  maxPoints: number;
  onMaxPointsChange: (count: number) => void;
  onClear: () => void;
}

export const TrailControls: React.FC<TrailControlsProps> = ({
  enabled,
  onToggle,
  maxPoints,
  onMaxPointsChange,
  onClear,
}) => {
  return (
    <div className={styles.trailControls}>
      <div className={styles.toggle}>
        <input
          type="checkbox"
          id="trail-toggle"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <label htmlFor="trail-toggle">Show Trails</label>
      </div>

      {enabled && (
        <>
          <div className={styles.trailLength}>
            <label>Trail Length</label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={maxPoints}
              onChange={(e) => onMaxPointsChange(parseInt(e.target.value))}
            />
            <span>{maxPoints} points</span>
          </div>

          <button onClick={onClear} className={styles.clearBtn}>
            Clear Trail History
          </button>
        </>
      )}
    </div>
  );
};
```
### Integration with Simulator Hook

**`src/hooks/useSimulation.ts` (enhanced)**
```typescript
export function useSimulation(config: PhysicsConfig, trailEnabled: boolean, maxPoints: number) {
  const [simulator, setSimulator] = useState<SimulatorBridge | null>(null);
  const trailManager = useRef(new TrailManager(maxPoints));

  useEffect(() => {
    if (!simulator) return;

    // On step, add trail points
    const stepFn = () => {
      const state = simulator.getState();
      trailManager.current.addPoint('body1', state.body1.position, state.time);
      trailManager.current.addPoint('body2', state.body2.position, state.time);
    };

    // Hook into animation frame loop
    return () => stepFn();
  }, [simulator, trailEnabled]);

  useEffect(() => {
    trailManager.current.setMaxPoints(maxPoints);
  }, [maxPoints]);

  return {
    simulator,
    trails: trailManager.current,
  };
}
```
-

## 🧪 Tests

- [ ] Unit: TrailManager adds/clears points correctly
- [ ] Unit: TrailManager respects maxPoints circular buffer
- [ ] Performance: 5000-point trail renders at 60 FPS
- [ ] Integration: Trail updates when simulator steps
- [ ] Manual: Enable trail, watch it draw, verify smoothness

-

## 🚀 Implementation Flow

1. Spec Review → TrailManager (RED) → Canvas rendering (GREEN) → TrailControls UI → Performance optimization

-

## ✅ Definition of Done

- [ ] DOD-Global: All criteria met
- [ ] DOD-Perf: Trail rendering < 5% frame time
- [ ] DOD-Accuracy: Trail positions match body path
- [ ] TrailManager tests passing

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-004, SPEC-005, SPEC-006
**Required by**: SPEC-009 (optional for Sandbox mode)
