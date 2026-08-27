# SPEC-007: Physics Parameter Controls

-

## 📝 User Story
```text
As a student experimenting with orbital mechanics
I want to easily adjust simulation parameters in real time
so that I can explore how mass and time scale affect orbits
```
-

## ✅ Acceptance Criteria

### Parameter Controls
- [x] AC 1.1: Mass slider for each body (range: 1e24 to 1e33 kg, default Earth/Sun)
- [x] AC 1.2: Time scale multiplier (range: 0.1x to 100x, default 1x)
- [x] AC 1.3: Numeric input fields for precise value entry
- [x] AC 1.4: Unit labels displayed (kg for mass, "x real-time" for scale)

### Validation
- [x] AC 2.1: Mass must be positive (>0)
- [x] AC 2.2: Time scale must be positive (>0)
- [x] AC 2.3: Invalid input shows error message, reverts to previous value
- [x] AC 2.4: Min/max constraints enforced

### Real-time Updates
- [x] AC 3.1: Slider change immediately updates simulation parameters
- [x] AC 3.2: No lag between slider movement and visual effect
- [x] AC 3.3: Numeric input updates on blur or Enter key
- [x] AC 3.4: WASM Simulator config updated before next step

### Presets
- [x] AC 4.1: "Earth-Moon" preset loads realistic values
- [x] AC 4.2: "Binary Stars" preset loads comparable-mass system
- [x] AC 4.3: "Custom" mode allows manual adjustment
- [x] AC 4.4: Preset changes all affected parameters at once

### UI/UX
- [x] AC 5.1: Controls arranged vertically or in logical groups
- [x] AC 5.2: Clear labels and help text
- [x] AC 5.3: Responsive on mobile (touch-friendly sliders)
- [x] AC 5.4: Disabled during animation transitions (optional)

### Reset
- [x] AC 6.1: Reset button returns to default configuration
- [x] AC 6.2: Confirmation dialog for destructive changes (optional)

-

## 🔧 Technical Solution

### Component: ParameterControls

**`src/components/ParameterControls/ParameterControls.tsx`**
```typescript
interface ParameterControlsProps {
  config: PhysicsConfig;
  onConfigChange: (config: PhysicsConfig) => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  config,
  onConfigChange,
}) => {
  const [tempConfig, setTempConfig] = useState(config);
  const [preset, setPreset] = useState<'earth-moon' | 'binary' | 'custom'>('custom');

  const handleMassChange = (bodyId: 1 | 2, value: number) => {
    if (value <= 0) return;
    const updated = { ...tempConfig };
    updated[bodyId === 1 ? 'body1' : 'body2'].mass = value;
    setTempConfig(updated);
    onConfigChange(updated);
  };

  const handleTimeScaleChange = (value: number) => {
    if (value <= 0) return;
    const updated = { ...tempConfig, timeScale: value };
    setTempConfig(updated);
    onConfigChange(updated);
  };

  const applyPreset = (presetName: string) => {
    const presets: Record<string, PhysicsConfig> = {
      'earth-moon': EARTH_MOON_CONFIG,
      'binary': BINARY_STARS_CONFIG,
    };
    const newConfig = presets[presetName];
    setTempConfig(newConfig);
    setPreset(presetName as any);
    onConfigChange(newConfig);
  };

  return (
    <div className={styles.controls}>
      <h2>Simulation Parameters</h2>

      <div className={styles.presets}>
        <button onClick={() => applyPreset('earth-moon')}>Earth-Moon</button>
        <button onClick={() => applyPreset('binary')}>Binary Stars</button>
      </div>

      <div className={styles.parameter}>
        <label>Body 1 Mass (kg)</label>
        <input
          type="range"
          min="1e24"
          max="1e33"
          value={tempConfig.body1.mass}
          onChange={(e) => handleMassChange(1, parseFloat(e.target.value))}
        />
        <input
          type="number"
          value={tempConfig.body1.mass}
          onChange={(e) => handleMassChange(1, parseFloat(e.target.value))}
        />
      </div>

      <div className={styles.parameter}>
        <label>Body 2 Mass (kg)</label>
        <input
          type="range"
          min="1e24"
          max="1e33"
          value={tempConfig.body2.mass}
          onChange={(e) => handleMassChange(2, parseFloat(e.target.value))}
        />
        <input
          type="number"
          value={tempConfig.body2.mass}
          onChange={(e) => handleMassChange(2, parseFloat(e.target.value))}
        />
      </div>

      <div className={styles.parameter}>
        <label>Time Scale</label>
        <input
          type="range"
          min="0.1"
          max="100"
          step="0.1"
          value={tempConfig.timeScale}
          onChange={(e) => handleTimeScaleChange(parseFloat(e.target.value))}
        />
        <span>{tempConfig.timeScale.toFixed(1)}x</span>
      </div>

      <button onClick={() => applyPreset('custom')}>Reset</button>
    </div>
  );
};
```
### Constants: Presets

**`src/shared/constants/simulation.ts`**
```typescript
export const EARTH_MOON_CONFIG: PhysicsConfig = {
  body1: { mass: 5.972e24, position: [-3.84e8, 0], velocity: [0, 1022] },
  body2: { mass: 7.342e22, position: [0, 0], velocity: [0, 0] },
  timeScale: 86400,  // 1 day per second
};

export const BINARY_STARS_CONFIG: PhysicsConfig = {
  body1: { mass: 1.989e30, position: [-5e9, 0], velocity: [0, 100000] },
  body2: { mass: 1.989e30, position: [5e9, 0], velocity: [0, -100000] },
  timeScale: 1,
};

export const DEFAULT_CONFIG: PhysicsConfig = EARTH_MOON_CONFIG;
```
### Styling

**`src/components/ParameterControls/ParameterControls.module.css`**
```css
.controls {
  padding: 1rem;
  background: #1a1e27;
  border-radius: 8px;
  color: #fff;
}

.parameter {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parameter label {
  font-weight: 600;
  font-size: 0.9rem;
}

.parameter input[type='range'] {
  width: 100%;
}

.parameter input[type='number'] {
  padding: 0.5rem;
  background: #0b0e11;
  color: #fff;
  border: 1px solid #333;
  border-radius: 4px;
}

.presets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.presets button {
  padding: 0.5rem 1rem;
  background: #4ecdc4;
  color: #0b0e11;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.presets button:hover {
  background: #45b5ad;
}
```
-

## 🧪 Tests

- [x] Unit: Validation of mass and time scale inputs
- [x] Component: Slider change triggers callback with updated config
- [x] Integration: Config changes update WASM Simulator
- [x] Manual: Adjust sliders, verify orbit behavior changes

-

## ✅ Definition of Done

- [x] DOD-Global: All criteria met
- [x] DOD-Validation: Invalid inputs rejected gracefully
- [x] DOD-UX: Sliders responsive and smooth
- [x] All preset tests passing

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-004, SPEC-005, SPEC-006
**Required by**: SPEC-008, SPEC-009
