# SPEC-009: Sandbox Mode - Interactive Object Placement

---

## 📝 User Story
```
As an advanced user
I want to create custom planetary configurations by placing objects interactively
so that I can explore unique orbital scenarios and creative simulations
```

---

## ✅ Acceptance Criteria

### Object Placement
- [ ] AC 1.1: Click on canvas to place new body
- [ ] AC 1.2: Placement preview shows before confirming
- [ ] AC 1.3: Body properties dialog appears after placement (mass, velocity)
- [ ] AC 1.4: Cancel placement before confirming (Esc key)

### Sandbox Limits
- [ ] AC 2.1: Maximum 10 bodies (configurable, extensible to N-body later)
- [ ] AC 2.2: Minimum spacing between bodies (prevents overlaps)
- [ ] AC 2.3: Bounds checking (bodies within viewport limits)
- [ ] AC 2.4: Error message if limit reached

### Body Configuration
- [ ] AC 3.1: Mass input with predefined presets (small, medium, large, Jupiter, Sun)
- [ ] AC 3.2: Initial velocity input (magnitude and direction)
- [ ] AC 3.3: Body color selection
- [ ] AC 3.4: Preview body before confirming placement

### Simulation Restart
- [ ] AC 4.1: Sandbox configuration persists until reset
- [ ] AC 4.2: Reset button clears all custom bodies, returns to 2-body mode
- [ ] AC 4.3: Confirmation dialog before destructive reset

### Performance
- [ ] AC 5.1: Physics calculations adapt to N bodies (still aim for 60 FPS with ≤ 5 bodies)
- [ ] AC 5.2: No lag when adding/removing bodies
- [ ] AC 5.3: Clear performance warning if adding many bodies

### UI Transitions
- [ ] AC 6.1: Toggle between "2-Body Mode" and "Sandbox Mode"
- [ ] AC 6.2: Mode labels clear and understandable
- [ ] AC 6.3: Switching modes stops simulation and resets view

---

## 🔧 Technical Solution

### State Management

**`src/context/SimulationContext.tsx` (enhanced)**
```typescript
export type SimulationMode = '2body' | 'sandbox';

export interface SimulationContextType {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  bodies: Body[];
  addBody: (body: Body) => void;
  removeBody: (id: string) => void;
  updateBody: (id: string, updates: Partial<Body>) => void;
  resetBodies: () => void;
}

export const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<SimulationMode>('2body');
  const [bodies, setBodies] = useState<Body[]>([]);

  const addBody = (body: Body) => {
    if (mode !== 'sandbox') return;
    if (bodies.length >= 10) throw new Error('Maximum 10 bodies reached');
    setBodies([...bodies, body]);
  };

  const removeBody = (id: string) => {
    setBodies(bodies.filter((b) => b.id !== id));
  };

  // ... other methods ...

  return (
    <SimulationContext.Provider value={{ mode, setMode, bodies, addBody, removeBody, /* ... */ }}>
      {children}
    </SimulationContext.Provider>
  );
};
```

### Canvas Click Handler

**`src/components/Canvas/Canvas.tsx` (enhanced)**
```typescript
export const Canvas: React.FC<CanvasProps> = ({
  simulationState,
  viewportConfig,
  onBodyPlace,  // New callback
  sandboxMode,  // New prop
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [placementPreview, setPlacementPreview] = useState<{ x: number; y: number } | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sandboxMode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // Convert canvas coords to world coords
    const worldPos = canvasToWorld(
      { x: canvasX, y: canvasY },
      viewportConfig
    );

    // Trigger dialog or emit event
    onBodyPlace(worldPos);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className={sandboxMode ? styles.interactiveCanvas : styles.staticCanvas}
    />
  );
};
```

### Body Placement Dialog

**`src/components/BodyPlacementDialog/BodyPlacementDialog.tsx`**
```typescript
interface BodyPlacementDialogProps {
  position: [number, number];
  onConfirm: (body: Body) => void;
  onCancel: () => void;
}

export const BodyPlacementDialog: React.FC<BodyPlacementDialogProps> = ({
  position,
  onConfirm,
  onCancel,
}) => {
  const [mass, setMass] = useState(5.972e24);  // Earth mass default
  const [velocityMag, setVelocityMag] = useState(0);
  const [velocityDir, setVelocityDir] = useState(0);
  const [color, setColor] = useState('#FF6B6B');

  const handleConfirm = () => {
    const vx = velocityMag * Math.cos(velocityDir);
    const vy = velocityMag * Math.sin(velocityDir);

    onConfirm({
      id: `body-${Date.now()}`,
      position,
      velocity: [vx, vy],
      mass,
      radius: radiusFromMass(mass),
      color,
    });
  };

  return (
    <dialog open className={styles.dialog}>
      <h3>Configure New Body</h3>

      <div className={styles.field}>
        <label>Mass (kg)</label>
        <select onChange={(e) => setMass(parseFloat(e.target.value))}>
          <option value="5.972e24">Earth (5.972e24)</option>
          <option value="1.989e30">Sun (1.989e30)</option>
          <option value="1.898e27">Jupiter (1.898e27)</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>Velocity Magnitude (m/s)</label>
        <input
          type="number"
          value={velocityMag}
          onChange={(e) => setVelocityMag(parseFloat(e.target.value))}
        />
      </div>

      <div className={styles.field}>
        <label>Velocity Direction (degrees)</label>
        <input
          type="range"
          min="0"
          max="360"
          value={velocityDir}
          onChange={(e) => setVelocityDir(parseFloat(e.target.value))}
        />
      </div>

      <div className={styles.field}>
        <label>Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </dialog>
  );
};
```

### Rust: N-Body Physics (Future)

**`src/physics/n_body.rs`** (stub for future)
```rust
pub fn calculate_acceleration(bodies: &[Body], body_index: usize) -> (f64, f64) {
  let mut ax = 0.0;
  let mut ay = 0.0;

  for (i, other) in bodies.iter().enumerate() {
    if i == body_index {
      continue;
    }

    let (fx, fy) = force_between_vectors(
      bodies[body_index].position,
      other.position,
      bodies[body_index].mass,
      other.mass,
    );

    ax += fx / bodies[body_index].mass;
    ay += fy / bodies[body_index].mass;
  }

  (ax, ay)
}
```

---

## 🧪 Tests

- [ ] Unit: Canvas click → world coordinate conversion
- [ ] Unit: Body validation (mass > 0, unique IDs)
- [ ] Component: Placement dialog renders and accepts input
- [ ] Integration: Add body → appears in simulation → physics updates
- [ ] Manual: Click canvas, place 3-5 bodies, verify orbits

---

## 🚀 Implementation Flow

1. Spec Review → Click handler + coordinate conversion (RED) → Dialog component (GREEN) → State management → Physics updates → Manual testing

---

## ✅ Definition of Done

- [ ] DOD-Global: All criteria met
- [ ] DOD-Sandbox: Body placement works, dialog confirms/cancels correctly
- [ ] DOD-Performance: No lag with 5+ bodies
- [ ] Manual test: Place objects and verify simulation behavior

---

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-008
**Required by**: SPEC-010 (Object manipulation)

**Future Enhancement**: Extend to full N-body physics (beyond 2-body)
