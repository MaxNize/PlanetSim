# Fallow Duplication & Complexity Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the remaining `npm run check:fallow` findings on branch `dev` (3 duplication clone groups, 23 complexity findings) by extracting repeated markup/logic into small shared functions, hooks, and presentational subcomponents — without changing any user-visible behavior.

**Architecture:** No new architectural patterns. Every task follows patterns already established in this codebase: presentational subcomponents (already used for `BodyDisplay` inside `StateDisplay.tsx`), extracted custom hooks (already used for `useSandbox`, `useSimulation`, `useSimulationStep`), and pure helper functions colocated with their caller. Each task is a pure refactor: move existing code verbatim (or with mechanical parameterization) into a new named location; do not change any rendered output, styling, or control-flow order.

**Tech Stack:** React 18 + TypeScript (frontend), Vitest + React Testing Library for tests, `fallow audit` (v3.9.1) as the CI quality gate.

## Global Constraints

- No behavior change unless explicitly called out in a task (two are: Task 2 removes duplicate JSX by consolidating five of six form fields into a shared component, initially leaving VelDir controls dialog-specific; Task 14, a later follow-up, reversed that and unified VelDir into the shared `BodyFieldsForm`, changing `BodyPlacementDialog`'s VelDir control from a slider to a number input — see Task 14 below).
- Every task must leave `npm --prefix frontend run test`, `npm --prefix frontend run lint`, and `cd frontend && npx tsc --noEmit` green before moving to the next task.
- Do not change any exported prop types consumed outside the file being edited (`SimulationContextType`, `ParameterControlsProps`, `StateDisplayProps`, `SandboxControlsProps` all keep their existing shape).
- Preserve all existing `data-testid` attributes verbatim — tests query by them.
- Base commit for this plan: `dev` branch, after the circular-dependency fix (`SimulationContext.tsx` no longer re-exports `SimulationProvider`).

---

## File Structure

| File | Change |
|---|---|
| `frontend/src/context/useSandbox.ts` | Modify — extract `syncBodyKinematics` + `commitSandboxBodies` helpers, dedupe |
| `frontend/src/components/BodyFieldsForm/BodyFieldsForm.tsx` | Create — shared Name/Preset/Mass/VelMag/Color fields |
| `frontend/src/components/BodyEditDialog/BodyEditDialog.tsx` | Modify — use `BodyFieldsForm` |
| `frontend/src/components/BodyPlacementDialog/BodyPlacementDialog.tsx` | Modify — use `BodyFieldsForm` |
| `frontend/src/components/BodyContextMenu/BodyContextMenu.tsx` | Modify — extract `MenuItem` subcomponent |
| `frontend/src/components/ParameterControls/SandboxControls.tsx` | Modify — extract `SandboxBodyItem` subcomponent, simplify `ADD_BUTTON_STYLE` |
| `frontend/src/components/StateDisplay/StateDisplay.tsx` | Modify — extract `BodyList` subcomponent |
| `frontend/src/services/canvasHelpers.ts` | Modify — extract `drawTrailSection` helper |
| `frontend/src/services/CanvasRenderer.ts` | Modify — extract `drawSandboxBodies` + `drawVelocityArrow` private methods |
| `frontend/src/hooks/useCanvasInteraction.ts` | Modify — split `handleMouseDown` into `handlePlacementClick` + `handleSelectionOrDrag` |
| `frontend/src/components/Canvas/Canvas.tsx` | Modify — extract `computePlacementPreview` helper |
| `frontend/src/components/ParameterControls/ParameterControls.tsx` | Modify — extract `PresetSelector` subcomponent |
| `frontend/src/components/Simulator/Simulator.tsx` | Modify — extract `SimulatorLegend` subcomponent |
| `frontend/src/context/useTrailHistory.ts` | Create — extracted trail-history hook |
| `frontend/src/context/SimulationProvider.tsx` | Modify — use `useTrailHistory`, extract `enrichBodies` helper |

---

### Task 1: Dedupe `useSandbox.ts`

**Files:**
- Modify: `frontend/src/context/useSandbox.ts`
- Test: `frontend/src/context/SimulationContext.test.tsx` (exercises `addBody`/`removeBody`/`updateBody`/`setMode` through the provider)

**Interfaces:**
- Produces: `useSandbox(...)` returns `{ setMode, addBody, removeBody, updateBody }` — unchanged signature, consumed by `SimulationProvider.tsx`.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- SimulationContext`
Expected: PASS (existing behavior)

- [ ] **Step 2: Replace the file contents**

Replace the full contents of `frontend/src/context/useSandbox.ts` with:

```ts
import { useCallback } from 'react';
import { SandboxBody, SimulationMode } from '../types';
import { SimulationState } from '../services/wasmBridge';

interface LatestBody {
  id?: string;
  position: [number, number];
  velocity: [number, number];
}

/** Reconciles sandbox body definitions with their latest simulated position/velocity. */
function syncBodyKinematics(sandboxBodies: SandboxBody[], latestBodies: LatestBody[]): SandboxBody[] {
  return sandboxBodies.map((sb, idx) => {
    const simBody = latestBodies.find((b) => b.id === sb.id) || latestBodies[idx];
    if (!simBody) return sb;
    return { ...sb, position: simBody.position, velocity: simBody.velocity };
  });
}

/** Persists a new sandbox body list into both React state and the running simulator. */
function commitSandboxBodies(
  bodies: SandboxBody[],
  currentState: SimulationState,
  setSandboxBodies: React.Dispatch<React.SetStateAction<SandboxBody[]>>,
  setCurrentState: React.Dispatch<React.SetStateAction<SimulationState>>,
  simulator: any,
): void {
  setSandboxBodies(bodies);
  const nextState = { ...currentState, bodies };
  setCurrentState(nextState);
  if (simulator) {
    try {
      simulator.setState(nextState);
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Hook that manages the state transitions and body updates for the Sandbox simulation mode.
 */
export function useSandbox(
  sandboxBodies: SandboxBody[],
  setSandboxBodies: React.Dispatch<React.SetStateAction<SandboxBody[]>>,
  currentState: SimulationState,
  setCurrentState: React.Dispatch<React.SetStateAction<SimulationState>>,
  setInitialState: React.Dispatch<React.SetStateAction<SimulationState>>,
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>,
  setStepResult: React.Dispatch<React.SetStateAction<any>>,
  setModeState: React.Dispatch<React.SetStateAction<SimulationMode>>,
  simulator: any,
) {
  const setMode = useCallback(
    (newMode: SimulationMode) => {
      setModeState(newMode);
      setIsPaused(true);
      setStepResult(null);
      if (newMode === 'sandbox') {
        const initialSandbox: SandboxBody[] = [
          {
            id: 'primary',
            position: currentState.primary.position,
            velocity: currentState.primary.velocity,
            mass: currentState.primary.mass,
            radius: currentState.primary.radius,
            color: '#f0932b',
            name: 'Primary Star',
            locked: false,
          },
          {
            id: 'secondary',
            position: currentState.secondary.position,
            velocity: currentState.secondary.velocity,
            mass: currentState.secondary.mass,
            radius: currentState.secondary.radius,
            color: '#48dbfb',
            name: 'Secondary Planet',
            locked: false,
          },
          {
            id: 'testParticle',
            position: currentState.testParticle.position,
            velocity: currentState.testParticle.velocity,
            mass: currentState.testParticle.mass,
            radius: currentState.testParticle.radius,
            color: '#2ed573',
            name: 'Test Particle',
            locked: false,
          },
        ];
        commitSandboxBodies(initialSandbox, currentState, setSandboxBodies, setCurrentState, simulator);
      } else {
        const nextState = { ...currentState, bodies: undefined };
        setCurrentState(nextState);
        if (simulator) {
          try {
            simulator.setState(nextState);
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
    [currentState, simulator, setModeState, setIsPaused, setStepResult, setSandboxBodies, setCurrentState],
  );

  const addBody = useCallback(
    (body: SandboxBody) => {
      if (sandboxBodies.length >= 10) throw new Error('Maximum 10 bodies reached');
      const latestBodies = currentState.bodies || sandboxBodies;
      for (const other of latestBodies) {
        const dx = body.position[0] - other.position[0];
        const dy = body.position[1] - other.position[1];
        if (Math.hypot(dx, dy) < body.radius + other.radius) {
          throw new Error('Overlap detected with another body');
        }
      }
      const updatedSandbox = syncBodyKinematics(sandboxBodies, latestBodies);
      commitSandboxBodies([...updatedSandbox, body], currentState, setSandboxBodies, setCurrentState, simulator);
    },
    [sandboxBodies, currentState, simulator, setSandboxBodies, setCurrentState],
  );

  const removeBody = useCallback(
    (id: string) => {
      const latestBodies = currentState.bodies || sandboxBodies;
      const updatedSandbox = syncBodyKinematics(sandboxBodies, latestBodies).filter((b) => b.id !== id);
      commitSandboxBodies(updatedSandbox, currentState, setSandboxBodies, setCurrentState, simulator);
    },
    [sandboxBodies, currentState, simulator, setSandboxBodies, setCurrentState],
  );

  const updateBody = useCallback(
    (id: string, updates: Partial<SandboxBody>) => {
      const latestBodies = currentState.bodies || sandboxBodies;
      const updatedSandbox = sandboxBodies.map((sb, idx) => {
        const simBody = latestBodies.find((b) => b.id === sb.id) || latestBodies[idx];
        const currentPos = simBody ? simBody.position : sb.position;
        const currentVel = simBody ? simBody.velocity : sb.velocity;

        if (sb.id !== id) {
          return { ...sb, position: currentPos, velocity: currentVel };
        }
        return {
          ...sb,
          ...updates,
          position: currentPos,
          velocity: updates.velocity !== undefined ? updates.velocity : currentVel,
        };
      });
      commitSandboxBodies(updatedSandbox, currentState, setSandboxBodies, setCurrentState, simulator);
    },
    [sandboxBodies, currentState, simulator, setSandboxBodies, setCurrentState],
  );

  return { setMode, addBody, removeBody, updateBody };
}
```

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- SimulationContext`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/context/useSandbox.ts
git commit -m "refactor(sandbox): extract shared body-sync/commit helpers to remove duplication"
```

---

### Task 2: Extract shared `BodyFieldsForm`

**Files:**
- Create: `frontend/src/components/BodyFieldsForm/BodyFieldsForm.tsx`
- Modify: `frontend/src/components/BodyEditDialog/BodyEditDialog.tsx`
- Modify: `frontend/src/components/BodyPlacementDialog/BodyPlacementDialog.tsx`
- Test: `frontend/src/components/BodyEditDialog/BodyEditDialog.test.tsx`

**Interfaces:**
- Produces: `BodyFieldsForm` component and `BodyPresetOption` type, exported from `frontend/src/components/BodyFieldsForm/BodyFieldsForm.tsx`.
- Note: covers Name, Preset, Mass, VelMag, and Color fields only. VelDir is intentionally excluded — `BodyEditDialog` uses a precise number input, `BodyPlacementDialog` uses a slider, and `BodyPlacementDialog` has no dedicated test file, so its control is left untouched to avoid an unverifiable UI change.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- BodyEditDialog`
Expected: PASS

- [ ] **Step 2: Create the shared form component**

Create `frontend/src/components/BodyFieldsForm/BodyFieldsForm.tsx`:

```tsx
import { FIELD_STYLE, LABEL_STYLE, INPUT_STYLE } from '../BodyPlacementDialog/styles';

export interface BodyPresetOption {
  value: string;
  label: string;
}

interface BodyFieldsFormProps {
  labels: {
    name: string;
    presetTemplate: string;
    mass: string;
    velMag: string;
    color: string;
  };
  name: string;
  onNameChange: (value: string) => void;
  preset: string;
  presetOptions: BodyPresetOption[];
  onPresetChange: (value: string) => void;
  mass: number;
  onMassChange: (value: number) => void;
  velMag: number;
  onVelMagChange: (value: number) => void;
  color: string;
  onColorChange: (value: string) => void;
}

/**
 * Shared labeled-field layout for configuring a celestial body's name, preset, mass, and velocity magnitude.
 */
export function BodyFieldsForm({
  labels,
  name,
  onNameChange,
  preset,
  presetOptions,
  onPresetChange,
  mass,
  onMassChange,
  velMag,
  onVelMagChange,
  color,
  onColorChange,
}: BodyFieldsFormProps) {
  return (
    <>
      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.name}</span>
        <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.presetTemplate}</span>
        <select value={preset} onChange={(e) => onPresetChange(e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
          {presetOptions.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0f172a' }}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.mass}</span>
        <input type="number" step="any" value={mass} onChange={(e) => onMassChange(parseFloat(e.target.value) || 0)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.velMag}</span>
        <input type="number" step="any" value={velMag} onChange={(e) => onVelMagChange(parseFloat(e.target.value) || 0)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.color}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{ ...INPUT_STYLE, padding: '2px 4px', width: '48px', height: '36px', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#94a3b8' }}>{color}</span>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Rewrite `BodyEditDialog.tsx`**

Replace the full contents of `frontend/src/components/BodyEditDialog/BodyEditDialog.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, FIELD_STYLE, LABEL_STYLE, BUTTON_STYLE } from '../BodyPlacementDialog/styles';
import { BodyFieldsForm, BodyPresetOption } from '../BodyFieldsForm/BodyFieldsForm';

interface BodyEditDialogProps {
  body: SandboxBody;
  onConfirm: (updatedBody: SandboxBody) => void;
  onCancel: () => void;
}

const CONFIRM_PRESETS = {
  sun: { mass: 1.989e30, radius: 6.9634e8, color: '#fbc531' },
  jupiter: { mass: 1.898e27, radius: 7.1492e7, color: '#e1b12c' },
  earth: { mass: 5.9722e24, radius: 6.371e6, color: '#00a8ff' },
  moon: { mass: 7.348e22, radius: 1.737e6, color: '#dcdde1' },
  asteroid: { mass: 1.0e15, radius: 1.0e4, color: '#7f8fa6' },
} as const;

const radiusFromMass = (mass: number) => {
  if (mass >= 1e30) return 6.9634e8 * Math.pow(mass / 1.989e30, 1 / 3);
  if (mass >= 1e27) return 7.1492e7 * Math.pow(mass / 1.898e27, 1 / 3);
  return 6.371e6 * Math.pow(mass / 5.9722e24, 1 / 3);
};

/**
 * Renders a properties dialog modal for editing an existing body's parameters.
 */
export function BodyEditDialog({ body, onConfirm, onCancel }: BodyEditDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(body.name || t('sandbox.defaultBodyName'));
  const [preset, setPreset] = useState<keyof typeof CONFIRM_PRESETS | 'custom'>('custom');
  const [mass, setMass] = useState(body.mass);
  const [velMag, setVelMag] = useState(() => Math.hypot(...body.velocity));
  const [velDir, setVelDir] = useState(() => {
    const angle = Math.atan2(body.velocity[1], body.velocity[0]) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
  });
  const [color, setColor] = useState(body.color);
  const [locked, setLocked] = useState(Boolean(body.locked));

  useEffect(() => {
    if (preset !== 'custom') {
      const data = CONFIRM_PRESETS[preset];
      setMass(data.mass);
      setColor(data.color);
    }
  }, [preset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleConfirm = () => {
    const rad = radiusFromMass(mass);
    const radAngle = (velDir * Math.PI) / 180;
    const vx = velMag * Math.cos(radAngle);
    const vy = velMag * Math.sin(radAngle);
    onConfirm({ ...body, name, mass, radius: rad, velocity: [vx, vy], color, locked });
  };

  const presetOptions: BodyPresetOption[] = [
    { value: 'custom', label: t('dialog.presets.custom') },
    { value: 'earth', label: t('dialog.presets.earth') },
    { value: 'sun', label: t('dialog.presets.sun') },
    { value: 'jupiter', label: t('dialog.presets.jupiter') },
    { value: 'moon', label: t('dialog.presets.moon') },
    { value: 'asteroid', label: t('dialog.presets.asteroid') },
  ];

  return (
    <div style={OVERLAY_STYLE} onClick={onCancel} data-testid="body-edit-dialog">
      <div style={DIALOG_STYLE} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '12px',
          }}
        >
          {t('editDialog.editTitle')}
        </h3>

        <BodyFieldsForm
          labels={{
            name: t('dialog.name'),
            presetTemplate: t('dialog.presetTemplate'),
            mass: t('dialog.mass'),
            velMag: t('dialog.velMag'),
            color: t('dialog.color'),
          }}
          name={name}
          onNameChange={setName}
          preset={preset}
          presetOptions={presetOptions}
          onPresetChange={(p) => setPreset(p as keyof typeof CONFIRM_PRESETS | 'custom')}
          mass={mass}
          onMassChange={(m) => {
            setMass(m);
            setPreset('custom');
          }}
          velMag={velMag}
          onVelMagChange={setVelMag}
          color={color}
          onColorChange={(c) => {
            setColor(c);
            setPreset('custom');
          }}
        />

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.velDir')}</span>
          <input
            type="number"
            min="0"
            max="360"
            step="1"
            value={velDir}
            onChange={(e) => setVelDir(parseFloat(e.target.value) || 0)}
            style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', color: '#ffffff', padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ ...FIELD_STYLE, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="lockCheckbox"
            checked={locked}
            onChange={(e) => setLocked(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="lockCheckbox" style={{ ...LABEL_STYLE, cursor: 'pointer' }}>
            🔒 {t('editDialog.locked')}
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            style={{ ...BUTTON_STYLE, flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}
          >
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{ ...BUTTON_STYLE, flex: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff' }}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

Note: the VelDir `<input>` style is inlined verbatim (equal to the original `INPUT_STYLE` object) instead of importing `INPUT_STYLE`, since `INPUT_STYLE` is no longer imported directly in this file (it's used inside `BodyFieldsForm` now). If you prefer, import `INPUT_STYLE` from `'../BodyPlacementDialog/styles'` alongside `FIELD_STYLE`/`LABEL_STYLE`/`BUTTON_STYLE` instead of inlining — both are equivalent; importing is cleaner:

```tsx
import { OVERLAY_STYLE, DIALOG_STYLE, FIELD_STYLE, LABEL_STYLE, INPUT_STYLE, BUTTON_STYLE } from '../BodyPlacementDialog/styles';
```
and use `style={INPUT_STYLE}` on the VelDir input. Prefer this cleaner version.

- [ ] **Step 4: Rewrite `BodyPlacementDialog.tsx`**

Replace the full contents of `frontend/src/components/BodyPlacementDialog/BodyPlacementDialog.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, FIELD_STYLE, LABEL_STYLE, BUTTON_STYLE } from './styles';
import { BodyFieldsForm, BodyPresetOption } from '../BodyFieldsForm/BodyFieldsForm';

interface BodyPlacementDialogProps {
  position: [number, number];
  onConfirm: (body: SandboxBody) => void;
  onCancel: () => void;
  initialVelocity?: [number, number];
}

const CONFIRM_PRESETS = {
  sun: { mass: 1.989e30, radius: 6.9634e8, color: '#fbc531', name: 'Sun-like Star' },
  jupiter: { mass: 1.898e27, radius: 7.1492e7, color: '#e1b12c', name: 'Gas Giant' },
  earth: { mass: 5.9722e24, radius: 6.371e6, color: '#00a8ff', name: 'Terrestrial Planet' },
  moon: { mass: 7.348e22, radius: 1.737e6, color: '#dcdde1', name: 'Moon-like Satellite' },
  asteroid: { mass: 1.0e15, radius: 1.0e4, color: '#7f8fa6', name: 'Asteroid' },
} as const;

const radiusFromMass = (mass: number) => {
  if (mass >= 1e30) return 6.9634e8 * Math.pow(mass / 1.989e30, 1 / 3);
  if (mass >= 1e27) return 7.1492e7 * Math.pow(mass / 1.898e27, 1 / 3);
  return 6.371e6 * Math.pow(mass / 5.9722e24, 1 / 3);
};

/**
 * Renders a properties dialog modal for configuring a new body's parameters.
 */
export function BodyPlacementDialog({ position, onConfirm, onCancel, initialVelocity = [0, 0] }: BodyPlacementDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(() => t('dialog.defaultBodyName'));
  const [preset, setPreset] = useState<keyof typeof CONFIRM_PRESETS | 'custom'>('earth');
  const [mass, setMass] = useState(5.9722e24);
  const [velMag, setVelMag] = useState(() => Math.hypot(...initialVelocity));
  const [velDir, setVelDir] = useState(() => {
    const angle = Math.atan2(initialVelocity[1], initialVelocity[0]) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
  });
  const [color, setColor] = useState('#00a8ff');

  useEffect(() => {
    if (preset !== 'custom') {
      const data = CONFIRM_PRESETS[preset];
      setMass(data.mass);
      setColor(data.color);
      setName(t(`dialog.presets.${preset}`));
    }
  }, [preset, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleConfirm = () => {
    const rad = radiusFromMass(mass);
    const radAngle = (velDir * Math.PI) / 180;
    const vx = velMag * Math.cos(radAngle);
    const vy = velMag * Math.sin(radAngle);
    onConfirm({ id: `body-${Date.now()}`, position, velocity: [vx, vy], mass, radius: rad, color, name, locked: false });
  };

  const presetOptions: BodyPresetOption[] = [
    { value: 'earth', label: t('dialog.presets.earth') },
    { value: 'sun', label: t('dialog.presets.sun') },
    { value: 'jupiter', label: t('dialog.presets.jupiter') },
    { value: 'moon', label: t('dialog.presets.moon') },
    { value: 'asteroid', label: t('dialog.presets.asteroid') },
    { value: 'custom', label: t('dialog.presets.custom') },
  ];

  return (
    <div style={OVERLAY_STYLE} onClick={onCancel}>
      <div style={DIALOG_STYLE} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '12px',
          }}
        >
          {t('dialog.title')}
        </h3>

        <BodyFieldsForm
          labels={{
            name: t('dialog.name'),
            presetTemplate: t('dialog.presetTemplate'),
            mass: t('dialog.mass'),
            velMag: t('dialog.velMag'),
            color: t('dialog.color'),
          }}
          name={name}
          onNameChange={(n) => {
            setName(n);
            setPreset('custom');
          }}
          preset={preset}
          presetOptions={presetOptions}
          onPresetChange={(p) => setPreset(p as keyof typeof CONFIRM_PRESETS | 'custom')}
          mass={mass}
          onMassChange={(m) => {
            setMass(m);
            setPreset('custom');
          }}
          velMag={velMag}
          onVelMagChange={setVelMag}
          color={color}
          onColorChange={(c) => {
            setColor(c);
            setPreset('custom');
          }}
        />

        <div style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>{t('dialog.velDir')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="range" min={0} max={360} value={velDir} onChange={(e) => setVelDir(parseInt(e.target.value, 10))} style={{ flex: 1, cursor: 'pointer' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', width: '45px', textAlign: 'right' }}>{Math.round(velDir)}°</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onCancel} style={{ ...BUTTON_STYLE, flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}>
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...BUTTON_STYLE,
              flex: 1,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify tests still pass**

Run: `npm --prefix frontend run test -- BodyEditDialog Canvas Simulator`
Expected: PASS (Canvas/Simulator tests exercise `BodyPlacementDialog` indirectly through the placement flow)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/BodyFieldsForm frontend/src/components/BodyEditDialog/BodyEditDialog.tsx frontend/src/components/BodyPlacementDialog/BodyPlacementDialog.tsx
git commit -m "refactor(dialogs): extract shared BodyFieldsForm to remove BodyEditDialog/BodyPlacementDialog duplication"
```

---

### Task 3: Extract `MenuItem` in `BodyContextMenu.tsx`

**Files:**
- Modify: `frontend/src/components/BodyContextMenu/BodyContextMenu.tsx`
- Test: `frontend/src/components/BodyContextMenu/BodyContextMenu.test.tsx`

**Interfaces:**
- Produces: local (non-exported) `MenuItem` component within the same file.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- BodyContextMenu`
Expected: PASS

- [ ] **Step 2: Replace the file contents**

Replace the full contents of `frontend/src/components/BodyContextMenu/BodyContextMenu.tsx` with:

```tsx
import { useEffect, useRef } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';

interface BodyContextMenuProps {
  body: SandboxBody;
  position: { x: number; y: number };
  onEdit: (body: SandboxBody) => void;
  onLockToggle: (body: SandboxBody) => void;
  onDelete: (body: SandboxBody) => void;
  onClose: () => void;
}

interface MenuItemProps {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  hoverColor: string;
  children: React.ReactNode;
}

function MenuItem({ onClick, disabled = false, color, hoverColor, children }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '8px 14px',
        background: 'none',
        border: 'none',
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  );
}

/**
 * Renders a context menu for editing, locking, or deleting a sandbox body.
 */
export function BodyContextMenu({
  body,
  position,
  onEdit,
  onLockToggle,
  onDelete,
  onClose,
}: BodyContextMenuProps) {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const adjustedX = Math.min(position.x, window.innerWidth - 180);
  const adjustedY = Math.min(position.y, window.innerHeight - 160);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        zIndex: 1000,
        minWidth: '160px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        padding: '6px 0',
        color: '#f8fafc',
        fontSize: '13px',
        userSelect: 'none',
      }}
      data-testid="body-context-menu"
    >
      <div
        style={{
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#94a3b8',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: body.color,
            display: 'inline-block',
          }}
        />
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {body.name || t('sandbox.defaultBodyName')}
        </span>
      </div>

      <MenuItem
        onClick={() => {
          onEdit(body);
          onClose();
        }}
        color="#f8fafc"
        hoverColor="rgba(59, 130, 246, 0.2)"
      >
        {t('contextMenu.edit')}
      </MenuItem>

      <MenuItem
        onClick={() => {
          onLockToggle(body);
          onClose();
        }}
        color={body.locked ? '#f59e0b' : '#f8fafc'}
        hoverColor="rgba(59, 130, 246, 0.2)"
      >
        {body.locked ? t('contextMenu.unlock') : t('contextMenu.lock')}
      </MenuItem>

      <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

      <MenuItem
        onClick={() => {
          if (!body.locked) {
            onDelete(body);
            onClose();
          }
        }}
        disabled={body.locked}
        color={body.locked ? '#64748b' : '#ef4444'}
        hoverColor="rgba(239, 68, 68, 0.2)"
      >
        {t('contextMenu.delete')}
      </MenuItem>
    </div>
  );
}
```

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- BodyContextMenu`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/BodyContextMenu/BodyContextMenu.tsx
git commit -m "refactor(BodyContextMenu): extract MenuItem subcomponent to reduce size/complexity"
```

---

### Task 4: Extract `SandboxBodyItem` and simplify `ADD_BUTTON_STYLE` in `SandboxControls.tsx`

**Files:**
- Modify: `frontend/src/components/ParameterControls/SandboxControls.tsx`
- Test: no dedicated test file exists for `SandboxControls`; verify via `frontend/src/components/ParameterControls/ParameterControls.test.tsx` and `frontend/src/components/SimulationShell.test.tsx` (sandbox flows)

**Interfaces:**
- Produces: local (non-exported) `SandboxBodyItem` component within the same file.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- ParameterControls SimulationShell`
Expected: PASS

- [ ] **Step 2: Replace the file contents**

Replace the full contents of `frontend/src/components/ParameterControls/SandboxControls.tsx` with:

```tsx
import { useState } from 'react';
import { SandboxControlsProps, SandboxBody } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';

const SECTION_HEADER_STYLE = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#fff',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  paddingBottom: '8px',
  margin: 0,
} as const;

const ADD_BUTTON_BASE_STYLE = {
  width: '100%',
  padding: '10px 16px',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
  outline: 'none',
} as const;

const ADD_BUTTON_ACTIVE_STYLE = {
  ...ADD_BUTTON_BASE_STYLE,
  border: '1px solid #10b981',
  background: 'rgba(16, 185, 129, 0.15)',
  color: '#10b981',
  boxShadow: 'none',
} as const;

const ADD_BUTTON_INACTIVE_STYLE = {
  ...ADD_BUTTON_BASE_STYLE,
  border: 'none',
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
} as const;

const ADD_BUTTON_STYLE = (active: boolean) => (active ? ADD_BUTTON_ACTIVE_STYLE : ADD_BUTTON_INACTIVE_STYLE);

const BODY_ITEM_STYLE = (selected: boolean) =>
  ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: selected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
    border: selected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }) as const;

const ACTION_BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  borderRadius: '4px',
} as const;

interface SandboxBodyItemProps {
  body: SandboxBody;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (body: SandboxBody) => void;
  onDelete: (id: string) => void;
  editLabel: string;
  deleteLabel: string;
  defaultNameLabel: string;
  lockedLabel: string;
}

function SandboxBodyItem({ body, isSelected, onSelect, onEdit, onDelete, editLabel, deleteLabel, defaultNameLabel, lockedLabel }: SandboxBodyItemProps) {
  return (
    <div style={BODY_ITEM_STYLE(isSelected)} onClick={() => onSelect(body.id)} data-testid={`body-item-${body.id}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: body.color }} />
        <span style={{ fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? '#38bdf8' : '#fff' }}>
          {body.name || defaultNameLabel}
        </span>
        {body.locked && (
          <span title={lockedLabel} style={{ fontSize: '11px' }}>
            🔒
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#94a3b8' }}>{(body.mass / 5.9722e24).toFixed(1)} M⊕</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(body);
          }}
          style={ACTION_BUTTON_STYLE}
          title={editLabel}
          data-testid={`edit-btn-${body.id}`}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!body.locked) onDelete(body.id);
          }}
          disabled={body.locked}
          style={{
            ...ACTION_BUTTON_STYLE,
            color: body.locked ? '#64748b' : '#ef4444',
            cursor: body.locked ? 'not-allowed' : 'pointer',
            opacity: body.locked ? 0.4 : 1,
          }}
          title={deleteLabel}
          data-testid={`delete-btn-${body.id}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Renders sandbox specific panel controls including custom bodies listing, selection, editing, and active toggling.
 */
export function SandboxControls({ placementActive, setPlacementActive, selectedBodyId: propsSelectedId, onSelectBody }: SandboxControlsProps) {
  const { sandboxBodies, removeBody, updateBody, setMode, selectedBodyId: contextSelectedId, setSelectedBodyId } = useSimulationContext();
  const { t } = useI18n();
  const [editingBody, setEditingBody] = useState<SandboxBody | null>(null);

  const activeSelectedId = propsSelectedId !== undefined ? propsSelectedId : contextSelectedId;

  const handleSelect = (id: string) => {
    const nextId = activeSelectedId === id ? null : id;
    if (onSelectBody) onSelectBody(nextId);
    if (setSelectedBodyId) setSelectedBodyId(nextId);
  };

  const handleReset = () => {
    if (window.confirm(t('sandbox.resetConfirm'))) {
      setMode('3body');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={SECTION_HEADER_STYLE}>{t('sandbox.creatorTitle')}</h3>

      <button onClick={() => setPlacementActive(!placementActive)} style={ADD_BUTTON_STYLE(placementActive)}>
        {placementActive ? t('sandbox.placingActive') : t('sandbox.addBody')}
      </button>

      {placementActive && <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>{t('sandbox.helpText')}</div>}

      <h3 style={SECTION_HEADER_STYLE}>
        {t('sandbox.bodiesTitle')} ({sandboxBodies.length}/10)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {sandboxBodies.map((b) => (
          <SandboxBodyItem
            key={b.id}
            body={b}
            isSelected={activeSelectedId === b.id}
            onSelect={handleSelect}
            onEdit={setEditingBody}
            onDelete={removeBody}
            editLabel={t('sandbox.editBody')}
            deleteLabel={t('sandbox.deleteBody')}
            defaultNameLabel={t('sandbox.defaultBodyName')}
            lockedLabel={t('editDialog.locked')}
          />
        ))}
      </div>

      {editingBody && (
        <BodyEditDialog
          body={editingBody}
          onConfirm={(updated) => {
            updateBody(updated.id, updated);
            setEditingBody(null);
          }}
          onCancel={() => setEditingBody(null)}
        />
      )}

      {sandboxBodies.length >= 6 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#f59e0b' }}>
          {t('sandbox.highCountWarning')}
        </div>
      )}

      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          outline: 'none',
        }}
      >
        {t('sandbox.exitSandbox')}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- ParameterControls SimulationShell`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ParameterControls/SandboxControls.tsx
git commit -m "refactor(SandboxControls): extract SandboxBodyItem, simplify ADD_BUTTON_STYLE branching"
```

---

### Task 5: Extract `BodyList` in `StateDisplay.tsx`

**Files:**
- Modify: `frontend/src/components/StateDisplay/StateDisplay.tsx`
- Test: `frontend/src/components/StateDisplay/StateDisplay.test.tsx`

**Interfaces:**
- Produces: local (non-exported) `BodyList` component within the same file.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- StateDisplay`
Expected: PASS

- [ ] **Step 2: Replace the file contents**

Replace the full contents of `frontend/src/components/StateDisplay/StateDisplay.tsx` with:

```tsx
import { StateDisplayProps } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { SimulationMode } from '../../types';

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
        {posLabel}: [{position[0].toExponential(3)}, {position[1].toExponential(3)}] m<br />
        {velLabel}: [{velocity[0].toFixed(2)}, {velocity[1].toFixed(2)}] m/s
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
            color={b.color || '#fff'}
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

function formatEnergy(value: number | undefined): string {
  return value !== undefined ? value.toExponential(4) : 'N/A';
}

/**
 * Presentational component to display coordinates, velocities, energies, and error states.
 */
export function StateDisplay({ time, primaryPos, primaryVel, secondaryPos, secondaryVel, testParticlePos, testParticleVel, kineticEnergy, potentialEnergy, error }: StateDisplayProps) {
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
          color: '#fff',
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
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>{t('telemetry.time')}:</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
            {time.toFixed(1)} s <span style={{ fontSize: '12px', fontWeight: 400, color: '#94a3b8' }}>({(time / 3600).toFixed(2)} h)</span>
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
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>{t('telemetry.systemEnergies')}</span>
          <div style={{ marginTop: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>
            {t('telemetry.kinetic')}: {formatEnergy(kineticEnergy)} J<br />
            {t('telemetry.potential')}: {formatEnergy(potentialEnergy)} J<br />
            {t('telemetry.total')}: {formatEnergy(totalEnergy)} J
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- StateDisplay`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/StateDisplay/StateDisplay.tsx
git commit -m "refactor(StateDisplay): extract BodyList subcomponent to reduce cognitive complexity"
```

---

### Task 6: Extract `drawTrailSection` in `canvasHelpers.ts`

**Files:**
- Modify: `frontend/src/services/canvasHelpers.ts`
- Test: `frontend/src/services/CanvasRenderer.test.ts` (exercises `drawTrail` indirectly via `CanvasRenderer.draw`)

**Interfaces:**
- Produces: local (non-exported) `drawTrailSection` helper within the same file.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- CanvasRenderer`
Expected: PASS

**Important:** merely moving the section-drawing body into a helper does not by itself reduce `drawTrail`'s own cyclomatic count — that count comes from the `if (len < 2) return`, the `for` loop, and the `if (startIdx >= endIdx) continue`, none of which move. To actually reduce it, replace the imperative `for`/`continue` loop with a `map`+`filter`+`forEach` pipeline, which moves the "skip degenerate sections" branch into its own (separately-scored, trivial) predicate function while preserving the exact original alpha gradient (computed from the original slot index `s` out of `numSections`, not the filtered array's index).

- [ ] **Step 2: Replace `drawTrail`**

In `frontend/src/services/canvasHelpers.ts`, replace the `drawTrail` function (lines 1-34) with:

```ts
import { LagrangePointSet, SimulationState } from './wasmBridge';

function drawTrailSection(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  startIdx: number,
  endIdx: number,
  color: string,
  alpha: number,
  worldToCanvas: (pos: [number, number]) => { x: number; y: number },
): void {
  ctx.beginPath();
  const firstPoint = worldToCanvas(points[startIdx]);
  ctx.moveTo(firstPoint.x, firstPoint.y);

  for (let i = startIdx + 1; i <= endIdx; i++) {
    const pt = worldToCanvas(points[i]);
    ctx.lineTo(pt.x, pt.y);
  }

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/**
 * Draws a fading trajectory trail for a celestial body.
 */
export function drawTrail(ctx: CanvasRenderingContext2D, history: [number, number][], color: string, worldToCanvas: (pos: [number, number]) => { x: number; y: number }): void {
  const len = history.length;
  if (len < 2) return;

  const numSections = Math.min(10, len - 1);
  const sectionSize = Math.ceil(len / numSections);

  const sections = Array.from({ length: numSections }, (_, s) => ({
    s,
    startIdx: s * sectionSize,
    endIdx: Math.min(len - 1, (s + 1) * sectionSize),
  })).filter(({ startIdx, endIdx }) => startIdx < endIdx);

  sections.forEach(({ s, startIdx, endIdx }) => {
    drawTrailSection(ctx, history, startIdx, endIdx, color, ((s + 1) / numSections) * 0.45, worldToCanvas);
  });

  ctx.globalAlpha = 1.0;
}
```

Leave `drawLagrangePoints`, `drawOverlay`, and `drawBodyLabel` (the rest of the file) unchanged.

**Verify the alpha gradient is unchanged:** for a history of length `len`, `numSections = min(10, len-1)` is identical before and after; each retained section still computes `alpha = ((s + 1) / numSections) * 0.45` from its original slot index `s`, exactly as the original `for` loop did — only degenerate (empty) sections are skipped, exactly as the original `continue` did.

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- CanvasRenderer`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/canvasHelpers.ts
git commit -m "refactor(canvasHelpers): extract drawTrailSection to reduce drawTrail complexity"
```

---

### Task 7: Extract `drawSandboxBodies` and `drawVelocityArrow` in `CanvasRenderer.ts`

**Files:**
- Modify: `frontend/src/services/CanvasRenderer.ts`
- Test: `frontend/src/services/CanvasRenderer.test.ts`

**Interfaces:**
- Produces: private methods `drawSandboxBodies` and `drawVelocityArrow` on the `CanvasRenderer` class.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- CanvasRenderer`
Expected: PASS

- [ ] **Step 2: Replace the `draw` method and add two private methods**

In `frontend/src/services/CanvasRenderer.ts`, replace the `draw` method (originally lines 21-95) with:

```ts
  /** Main render method that coordinates drawing the entire simulation state. */
  public draw(
    state: SimulationState,
    trailHistory: TrailHistory,
    showTrail: boolean,
    lagrangePoints: LagrangePointSet | null,
    viewport: ViewportConfig,
    placementPreview?: { position: [number, number]; velocity: [number, number]; radius: number; color: string },
    selectedBodyId?: string | null,
  ): void {
    const { width, height } = this.resize();
    this.clear();
    const ctx = this.ctx;
    if (!ctx) return;

    const wtc = (pos: [number, number]) => this.worldToCanvas(pos, viewport, width, height);

    if (lagrangePoints) {
      drawLagrangePoints(ctx, lagrangePoints, wtc);
    }

    if (state.bodies) {
      this.drawSandboxBodies(ctx, state.bodies, trailHistory, showTrail, viewport, width, height, selectedBodyId, wtc);
    } else {
      if (showTrail) {
        drawTrail(ctx, trailHistory.primary, '#f0932b', wtc);
        drawTrail(ctx, trailHistory.secondary, '#48dbfb', wtc);
        drawTrail(ctx, trailHistory.testParticle, '#2ed573', wtc);
      }
      this.drawBody(state.primary.position, state.primary.radius, '#f0932b', viewport, width, height, false, selectedBodyId === 'primary');
      this.drawBody(state.secondary.position, state.secondary.radius, '#48dbfb', viewport, width, height, false, selectedBodyId === 'secondary');
      this.drawBody(state.testParticle.position, state.testParticle.radius, '#2ed573', viewport, width, height, false, selectedBodyId === 'testParticle');
    }

    if (placementPreview) {
      const p = placementPreview;
      this.drawBody(p.position, p.radius, p.color, viewport, width, height);

      const velMag = Math.hypot(...p.velocity);
      if (velMag > 0) {
        const start = wtc(p.position);
        const scaleVel = 1e1;
        const endPos: [number, number] = [p.position[0] + p.velocity[0] * scaleVel, p.position[1] + p.velocity[1] * scaleVel];
        this.drawVelocityArrow(ctx, start, wtc(endPos));
      }
    }

    drawOverlay(ctx, state, viewport.scale);
  }

  /** Renders each sandbox body's trail, disc, and optional name label. */
  private drawSandboxBodies(
    ctx: CanvasRenderingContext2D,
    bodies: (import('./wasmBridge').Body & { id?: string; name?: string; color?: string; locked?: boolean })[],
    trailHistory: TrailHistory,
    showTrail: boolean,
    viewport: ViewportConfig,
    width: number,
    height: number,
    selectedBodyId: string | null | undefined,
    wtc: (pos: [number, number]) => { x: number; y: number },
  ): void {
    bodies.forEach((b, idx) => {
      const bodyId = b.id || `body-${idx}`;
      const isSelected = selectedBodyId === bodyId;
      if (showTrail && trailHistory.customBodies && trailHistory.customBodies[bodyId]) {
        drawTrail(ctx, trailHistory.customBodies[bodyId], b.color || '#fff', wtc);
      }
      this.drawBody(b.position, b.radius, b.color || '#fff', viewport, width, height, false, isSelected, b.locked);
      if (b.name) {
        drawBodyLabel(ctx, b.position, b.name, wtc);
      }
    });
  }

  /** Draws a directional arrow representing a velocity vector preview. */
  private drawVelocityArrow(ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }): void {
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.fillStyle = '#3b82f6';
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - 8 * Math.cos(angle - Math.PI / 6), end.y - 8 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - 8 * Math.cos(angle + Math.PI / 6), end.y - 8 * Math.sin(angle + Math.PI / 6));
    ctx.fill();
  }
```

Note: the `import('./wasmBridge').Body` inline type import avoids adding a new top-level import; if preferred, instead add `Body` to the existing `import { SimulationState, LagrangePointSet } from './wasmBridge';` at the top of the file (making it `import { SimulationState, LagrangePointSet, Body } from './wasmBridge';`) and reference `Body` directly in the method signature — this is the cleaner option, prefer it.

Leave `resize`, `clear`, `worldToCanvas`, `canvasToWorld`, and `drawBody` unchanged.

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- CanvasRenderer`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/CanvasRenderer.ts
git commit -m "refactor(CanvasRenderer): extract drawSandboxBodies/drawVelocityArrow to reduce draw() complexity"
```

---

### Task 8: Split `handleMouseDown` in `useCanvasInteraction.ts`

**Files:**
- Modify: `frontend/src/hooks/useCanvasInteraction.ts`
- Test: `frontend/src/components/Canvas/Canvas.test.tsx` (exercises mouse-down interactions)

**Interfaces:**
- Produces: `handlePlacementClick` and `handleSelectionOrDrag` local functions within `useCanvasInteraction`; `handleMouseDown`'s exported shape and behavior is unchanged.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- Canvas`
Expected: PASS

- [ ] **Step 2: Replace `handleMouseDown`**

In `frontend/src/hooks/useCanvasInteraction.ts`, replace the `handleMouseDown` function (originally lines 88-110) with:

```ts
  const handlePlacementClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = screenToWorld(e.clientX, e.clientY);
    if (placementStage === 'idle') {
      setPlacedWorldPos(pos);
      setPlacementStage('velocity');
    } else if (placementStage === 'velocity') {
      setPlacementStage('idle');
      setShowDialog(true);
    }
  };

  const handleSelectionOrDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && !isSpacePressed) {
      const hit = findBodyAtPosition(screenToWorld(e.clientX, e.clientY));
      setSelectedBodyId(hit ? hit.id : null);
    }
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu(null);
    if (placementActive) {
      handlePlacementClick(e);
      return;
    }
    handleSelectionOrDrag(e);
  };
```

Leave everything else in the file (including `findBodyAtPosition`, `handleContextMenu`, `handleMouseMove`, `handleWheel`, and the returned object) unchanged.

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- Canvas`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/useCanvasInteraction.ts
git commit -m "refactor(useCanvasInteraction): split handleMouseDown into handlePlacementClick/handleSelectionOrDrag"
```

---

### Task 9: Extract `computePlacementPreview` in `Canvas.tsx`

**Files:**
- Modify: `frontend/src/components/Canvas/Canvas.tsx`
- Test: `frontend/src/components/Canvas/Canvas.test.tsx`

**Interfaces:**
- Produces: module-level pure function `computePlacementPreview` in the same file.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- Canvas`
Expected: PASS

- [ ] **Step 2: Add the helper and update the effect**

In `frontend/src/components/Canvas/Canvas.tsx`, add this function above the `Canvas` component definition:

```ts
function computePlacementPreview(
  placementActive: boolean,
  placedWorldPos: [number, number] | null,
  draggedVel: [number, number],
  hoverWorldPos: [number, number] | null,
): { position: [number, number]; velocity: [number, number]; radius: number; color: string } | undefined {
  if (placementActive && placedWorldPos) {
    return { position: placedWorldPos, velocity: draggedVel, radius: 6.371e6, color: '#3b82f6' };
  }
  if (placementActive && hoverWorldPos) {
    return { position: hoverWorldPos, velocity: [0, 0], radius: 6.371e6, color: 'rgba(59, 130, 246, 0.4)' };
  }
  return undefined;
}
```

Then replace the `useEffect` block (originally lines 58-78) with:

```ts
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) rendererRef.current = new CanvasRenderer(canvasRef.current);

    const preview = computePlacementPreview(placementActive, placedWorldPos, draggedVel, hoverWorldPos);

    rendererRef.current.draw(
      currentState,
      trailHistory,
      activeShowTrail,
      lagrangePoints,
      viewport,
      preview,
      selectedBodyId,
    );
  }, [currentState, viewport, trailHistory, activeShowTrail, lagrangePoints, dimensions, placementActive, hoverWorldPos, placedWorldPos, draggedVel, selectedBodyId]);
```

Leave the rest of the component (imports, props, hook usage, JSX) unchanged.

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- Canvas`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Canvas/Canvas.tsx
git commit -m "refactor(Canvas): extract computePlacementPreview helper out of render effect"
```

---

### Task 10: Extract `PresetSelector` in `ParameterControls.tsx`

**Files:**
- Modify: `frontend/src/components/ParameterControls/ParameterControls.tsx`
- Test: `frontend/src/components/ParameterControls/ParameterControls.test.tsx`

**Interfaces:**
- Produces: local (non-exported) `PresetSelector` component and `presetButtonStyle` function within the same file.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- ParameterControls`
Expected: PASS

- [ ] **Step 2: Add the subcomponent and update usage**

In `frontend/src/components/ParameterControls/ParameterControls.tsx`, add above the `ParameterControls` component:

```tsx
function presetButtonStyle(active: boolean) {
  return {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: active ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
    background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    color: active ? '#3b82f6' : '#94a3b8',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
  } as const;
}

interface PresetSelectorProps {
  preset: 'earth-moon' | 'binary-stars' | 'custom';
  setPreset: (preset: 'earth-moon' | 'binary-stars' | 'custom') => void;
  earthMoonLabel: string;
  binaryStarsLabel: string;
}

function PresetSelector({ preset, setPreset, earthMoonLabel, binaryStarsLabel }: PresetSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <button onClick={() => setPreset('earth-moon')} style={presetButtonStyle(preset === 'earth-moon')}>
        {earthMoonLabel}
      </button>
      <button onClick={() => setPreset('binary-stars')} style={presetButtonStyle(preset === 'binary-stars')}>
        {binaryStarsLabel}
      </button>
    </div>
  );
}
```

Then inside `ParameterControls`, remove the `presetStyle` closure (originally lines 68-79) and replace the preset-buttons block (originally lines 94-103):

```tsx
      {mode === '3body' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setPreset('earth-moon')} style={presetStyle('earth-moon')}>
            {t('presets.earthMoon')}
          </button>
          <button onClick={() => setPreset('binary-stars')} style={presetStyle('binary-stars')}>
            {t('presets.binaryStars')}
          </button>
        </div>
      )}
```

with:

```tsx
      {mode === '3body' && (
        <PresetSelector preset={preset} setPreset={setPreset} earthMoonLabel={t('presets.earthMoon')} binaryStarsLabel={t('presets.binaryStars')} />
      )}
```

Leave everything else in the file unchanged.

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- ParameterControls`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ParameterControls/ParameterControls.tsx
git commit -m "refactor(ParameterControls): extract PresetSelector subcomponent to reduce cognitive complexity"
```

---

### Task 11: Extract `SimulatorLegend` in `Simulator.tsx`

**Files:**
- Modify: `frontend/src/components/Simulator/Simulator.tsx`
- Test: `frontend/src/components/Simulator/Simulator.test.tsx`

**Interfaces:**
- Produces: local (non-exported) `SimulatorLegend` component within the same file.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- Simulator`
Expected: PASS

- [ ] **Step 2: Add the subcomponent and update usage**

In `frontend/src/components/Simulator/Simulator.tsx`, add above the `Simulator` component:

```tsx
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

function SimulatorLegend({ mode, hasLagrangePoints }: SimulatorLegendProps) {
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
}
```

Then replace the "Floating Legend Overlay" block (originally lines 77-106):

```tsx
      {/* Floating Legend Overlay */}
      <div
        style={{
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
        }}
      >
        {mode === 'sandbox' ? (
          <span>🌌 Custom Bodies Active (Verlet N-Body Simulator)</span>
        ) : (
          <>
            <span>🟡 M1 (Primary)</span>
            <span>🔵 M2 (Secondary)</span>
            <span>🟢 Test Particle</span>
            {lagrangePoints && <span>🔴 Lagrange Points (L1-L5 computed)</span>}
          </>
        )}
      </div>
```

with:

```tsx
      {/* Floating Legend Overlay */}
      <SimulatorLegend mode={mode} hasLagrangePoints={!!lagrangePoints} />
```

Leave everything else in the file (Canvas usage, sidebar, `setMassM1`/`setMassM2`/`setDistanceR` callbacks) unchanged.

- [ ] **Step 3: Verify tests still pass**

Run: `npm --prefix frontend run test -- Simulator`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Simulator/Simulator.tsx
git commit -m "refactor(Simulator): extract SimulatorLegend subcomponent"
```

---

### Task 12: Extract `useTrailHistory` and `enrichBodies` in `SimulationProvider.tsx`

**Files:**
- Create: `frontend/src/context/useTrailHistory.ts`
- Modify: `frontend/src/context/SimulationProvider.tsx`
- Test: `frontend/src/context/SimulationContext.test.tsx`, `frontend/src/components/Simulator/Simulator.test.tsx`, `frontend/src/components/SimulationShell.test.tsx`

**Interfaces:**
- Produces: `useTrailHistory(initialState: SimulationState)` returning `{ trailHistory, trailLength, recordStep, resetTrail, setTrailLength }`, consumed only by `SimulationProvider.tsx`.
- The `SimulationContextType` shape exposed to consumers (`trailHistory`, `trailLength`, `setTrailLength`, `clearTrailHistory`, `history`, `clearHistory`) is unchanged.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- SimulationContext Simulator SimulationShell`
Expected: PASS

- [ ] **Step 2: Create `useTrailHistory.ts`**

Create `frontend/src/context/useTrailHistory.ts`:

```ts
import { useCallback, useState } from 'react';
import { SimulationState } from '../services/wasmBridge';
import { TrailHistory } from '../types';

const initTrail = (s: SimulationState): TrailHistory => ({
  primary: [s.primary.position],
  secondary: [s.secondary.position],
  testParticle: [s.testParticle.position],
  customBodies: {},
});

/**
 * Hook that manages trajectory trail history for all bodies (primary/secondary/test particle and sandbox custom bodies).
 */
export function useTrailHistory(initialState: SimulationState) {
  const [trailHistory, setTrailHistory] = useState<TrailHistory>(() => initTrail(initialState));
  const [trailLength, setTrailLengthState] = useState<number>(1000);

  const resetTrail = useCallback((state: SimulationState) => {
    setTrailHistory(initTrail(state));
  }, []);

  const recordStep = useCallback(
    (enriched: SimulationState) => {
      setTrailHistory((prev) => {
        const nextCustom: { [bodyId: string]: [number, number][] } = { ...(prev.customBodies || {}) };
        if (enriched.bodies) {
          enriched.bodies.forEach((b: any) => {
            nextCustom[b.id] = [...(nextCustom[b.id] || []), b.position].slice(-trailLength);
          });
        }
        return {
          primary: [...prev.primary, enriched.primary.position].slice(-trailLength),
          secondary: [...prev.secondary, enriched.secondary.position].slice(-trailLength),
          testParticle: [...prev.testParticle, enriched.testParticle.position].slice(-trailLength),
          customBodies: nextCustom,
        };
      });
    },
    [trailLength],
  );

  const setTrailLength = useCallback((len: number) => {
    setTrailLengthState(len);
    setTrailHistory((prev) => {
      const nextCustom: { [bodyId: string]: [number, number][] } = {};
      if (prev.customBodies) {
        Object.keys(prev.customBodies).forEach((k) => {
          nextCustom[k] = prev.customBodies![k].slice(-len);
        });
      }
      return {
        primary: prev.primary.slice(-len),
        secondary: prev.secondary.slice(-len),
        testParticle: prev.testParticle.slice(-len),
        customBodies: nextCustom,
      };
    });
  }, []);

  return { trailHistory, trailLength, recordStep, resetTrail, setTrailLength };
}
```

- [ ] **Step 3: Rewrite `SimulationProvider.tsx`**

Replace the full contents of `frontend/src/context/SimulationProvider.tsx` with:

```tsx
import React, { useState, useCallback, useEffect } from 'react';
import { SimulationState, StepResult, LagrangePointSet, Body } from '../services/wasmBridge';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStep } from '../hooks/useSimulationStep';
import { SimulationMode, SandboxBody } from '../types';
import { DEFAULT_INITIAL_STATE, PresetType, getPresetState } from './presets';
import { simulationContext } from './SimulationContext';
import { useSandbox } from './useSandbox';
import { useTrailHistory } from './useTrailHistory';

/** Overlays each enriched body's persisted sandbox id/name/color/locked onto the raw simulator output. */
function enrichBodies(
  bodies: (Body & { id?: string; name?: string; color?: string; locked?: boolean })[],
  sandboxBodies: SandboxBody[],
): (Body & { id: string; name?: string; color?: string; locked?: boolean })[] {
  return bodies.map((b, idx) => ({
    ...b,
    id: sandboxBodies[idx]?.id || `body-${idx}`,
    name: sandboxBodies[idx]?.name || b.name,
    color: sandboxBodies[idx]?.color || b.color,
    locked: sandboxBodies[idx]?.locked ?? b.locked,
  }));
}

/**
 * Context provider that manages the simulation engine state and lifecycle.
 */
export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SimulationMode>('3body');
  const [sandboxBodies, setSandboxBodies] = useState<SandboxBody[]>([]);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [currentState, setCurrentState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(10000.0);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [lagrangePoints, setLagrangePoints] = useState<LagrangePointSet | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [preset, setPresetState] = useState<PresetType>('earth-moon');

  const { simulator, error } = useSimulation(initialState, resetCounter);
  const { trailHistory, trailLength, recordStep, resetTrail, setTrailLength } = useTrailHistory(DEFAULT_INITIAL_STATE);

  useEffect(() => {
    if (selectedBodyId && !sandboxBodies.some((b) => b.id === selectedBodyId)) {
      setSelectedBodyId(null);
    }
  }, [sandboxBodies, selectedBodyId]);

  useEffect(() => {
    setCurrentState(initialState);
    resetTrail(initialState);
    if (simulator && mode === '3body') {
      try {
        setLagrangePoints(simulator.getLagrangePoints());
      } catch (err) {
        console.error(err);
      }
    } else {
      setLagrangePoints(null);
    }
  }, [simulator, mode, initialState, resetTrail]);

  const handleStep = useCallback(
    (result: StepResult) => {
      const enriched = { ...result.newState };
      if (enriched.bodies) {
        enriched.bodies = enrichBodies(enriched.bodies, sandboxBodies);
      }
      setCurrentState(enriched);
      recordStep(enriched);
      if (simulator && mode === '3body') {
        try {
          setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error(err);
        }
      }
    },
    [simulator, sandboxBodies, mode, recordStep],
  );

  const { stepResult, setStepResult } = useSimulationStep(simulator, isPaused, speedMultiplier, handleStep);

  const clearTrailHistory = useCallback(() => resetTrail(currentState), [currentState, resetTrail]);

  const resetSimulation = useCallback(() => {
    resetTrail(initialState);
    setStepResult(null);
    setResetCounter((prev) => prev + 1);
  }, [initialState, setStepResult, resetTrail]);

  const setPreset = useCallback(
    (p: PresetType) => {
      const data = getPresetState(p);
      if (!data) return;
      setPresetState(p);
      setSpeedMultiplier(data.speed);
      setInitialState(data.state);
      setCurrentState(data.state);
      resetTrail(data.state);
      setIsPaused(true);
      setStepResult(null);
      setResetCounter((prev) => prev + 1);
    },
    [setStepResult, resetTrail],
  );

  const setInitialStateAndSync = useCallback(
    (state: SimulationState) => {
      setPresetState('custom');
      setInitialState(state);
      setCurrentState(state);
      if (simulator) {
        try {
          simulator.setState(state);
          if (mode === '3body') setLagrangePoints(simulator.getLagrangePoints());
        } catch (err) {
          console.error(err);
        }
      }
    },
    [simulator, mode],
  );

  const { setMode, addBody, removeBody, updateBody } = useSandbox(sandboxBodies, setSandboxBodies, currentState, setCurrentState, setInitialState, setIsPaused, setStepResult, setModeState, simulator);

  return (
    <simulationContext.Provider
      value={{
        initialState,
        setInitialState: setInitialStateAndSync,
        currentState,
        stepResult,
        isPaused,
        setIsPaused,
        speedMultiplier,
        setSpeedMultiplier,
        lagrangePoints,
        trailHistory,
        clearTrailHistory,
        history: trailHistory.testParticle,
        clearHistory: clearTrailHistory,
        showTrail,
        setShowTrail,
        trailLength,
        setTrailLength,
        resetSimulation,
        error,
        preset,
        setPreset,
        mode,
        setMode,
        sandboxBodies,
        addBody,
        removeBody,
        updateBody,
        selectedBodyId,
        setSelectedBodyId,
      }}
    >
      {children}
    </simulationContext.Provider>
  );
}
```

- [ ] **Step 4: Verify tests still pass**

Run: `npm --prefix frontend run test -- SimulationContext Simulator SimulationShell`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/context/useTrailHistory.ts frontend/src/context/SimulationProvider.tsx
git commit -m "refactor(SimulationProvider): extract useTrailHistory hook and enrichBodies helper"
```

---

### Task 13: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full frontend test suite**

Run: `npm --prefix frontend run test`
Expected: all tests PASS

- [ ] **Step 2: Run lint and typecheck**

Run: `npm --prefix frontend run lint && (cd frontend && npx tsc --noEmit)`
Expected: no errors

- [ ] **Step 3: Re-run the fallow audit**

Run: `npm run check:fallow`
Expected: exit code 0. If any duplication or complexity findings remain, evaluate case-by-case:
- If a small residual clone/complexity finding remains that a further extraction would meaningfully help, add a follow-up task.
- If a finding is inherent to the domain (e.g., a React context provider naturally aggregating many hooks) and further splitting would reduce readability rather than improve it, suppress it with a one-line `// fallow-ignore-next-line complexity` comment directly above the flagged line, with a short comment explaining why.

**Known candidates for suppression rather than further splitting:** cyclomatic/cognitive complexity is scored on a function's own branches (`||`, `??`, `?:`, `if`, loop conditions), not on which file or how deeply it's nested. Tasks 7 and 12 relocate the `state.bodies.forEach(...)` callback and the body-enrichment map callback into their own named functions (`drawSandboxBodies`'s inner callback and `enrichBodies`) — this shrinks the *outer* function (`draw`, `handleStep`) and fixes their "large function"/CRAP findings, but does **not** by itself reduce the *relocated* callback's own branch count, since the `||`/`??`/`&&` fallback chains inside it are unchanged and are inherent to "merge two data sources field-by-field with graceful fallbacks" logic. If `fallow` still flags `enrichBodies` or the `drawSandboxBodies` forEach callback individually after Tasks 7/12, that is expected — suppress those two specifically with `// fallow-ignore-next-line complexity` rather than further fragmenting a 4-field merge into smaller pieces, which would hurt readability more than it helps. Similarly, `Canvas.tsx`'s remaining complexity after Task 9 (the three-way cursor style ternary and the three conditional dialog renders) is a case-by-case judgment call: only split further if `fallow` still flags it and a clean extraction (e.g. a `getCursorStyle(...)` helper) is available without changing behavior.

- [ ] **Step 4: Sanity-check the Rust suite is still green (untouched by this plan, but part of the full CI gate)**

Run: `cd wasm && cargo test`
Expected: all tests PASS

- [ ] **Step 5: Manually smoke-test the app**

Run: `npm run dev` (from repo root) and in the browser:
- Switch to Sandbox mode, add a body via the placement dialog (confirm slider VelDir still works), edit a body via the context menu / SandboxControls edit button (confirm number VelDir still works), lock/delete a body.
- Switch back to 3-body mode, confirm trails, Lagrange points, and the legend render correctly.
- Confirm the ParameterControls preset buttons (Earth-Moon / Binary Stars) still switch presets correctly.

- [ ] **Step 6: Commit if any follow-up fixes were made in this task**

```bash
git add -A
git commit -m "chore: final fallow verification pass"
```

(Skip this step if Steps 1-5 required no changes.)

---

### Task 14 (follow-up, added after fallow re-check): Unify VelDir into BodyFieldsForm

**Context:** After Tasks 1-13, `npm run check:fallow` still reports 3 duplication clone groups (276 lines) concentrated entirely in `BodyEditDialog.tsx`/`BodyPlacementDialog.tsx`, centered on the VelDir input block that Task 2 deliberately left dialog-specific. The human has approved unifying VelDir into the shared `BodyFieldsForm`, using `BodyEditDialog`'s existing number-input control (min=0, max=360, step=1) for both dialogs. This means `BodyPlacementDialog`'s VelDir control changes from a `type="range"` slider with a rounded-degree readout to a `type="number"` input — a deliberate, approved UI change, consistent with the visual-unification precedent already accepted in Task 2. No existing test asserts on the slider's control type (confirmed via grep across `Canvas.test.tsx` and `SimulationShell.test.tsx`), so this is safe to change.

**Files:**
- Modify: `frontend/src/components/BodyFieldsForm/BodyFieldsForm.tsx`
- Modify: `frontend/src/components/BodyEditDialog/BodyEditDialog.tsx`
- Modify: `frontend/src/components/BodyPlacementDialog/BodyPlacementDialog.tsx`
- Test: `frontend/src/components/BodyEditDialog/BodyEditDialog.test.tsx`, `frontend/src/components/Canvas/Canvas.test.tsx`, `frontend/src/components/SimulationShell.test.tsx`

**Interfaces:**
- `BodyFieldsFormProps` gains `labels.velDir: string`, `velDir: number`, `onVelDirChange: (value: number) => void`.

- [ ] **Step 1: Confirm green baseline**

Run: `npm --prefix frontend run test -- BodyEditDialog Canvas SimulationShell`
Expected: PASS

- [ ] **Step 2: Replace `BodyFieldsForm.tsx`**

Replace the full contents of `frontend/src/components/BodyFieldsForm/BodyFieldsForm.tsx` with:

```tsx
import { FIELD_STYLE, LABEL_STYLE, INPUT_STYLE } from '../BodyPlacementDialog/styles';

export interface BodyPresetOption {
  value: string;
  label: string;
}

interface BodyFieldsFormProps {
  labels: {
    name: string;
    presetTemplate: string;
    mass: string;
    velMag: string;
    velDir: string;
    color: string;
  };
  name: string;
  onNameChange: (value: string) => void;
  preset: string;
  presetOptions: BodyPresetOption[];
  onPresetChange: (value: string) => void;
  mass: number;
  onMassChange: (value: number) => void;
  velMag: number;
  onVelMagChange: (value: number) => void;
  velDir: number;
  onVelDirChange: (value: number) => void;
  color: string;
  onColorChange: (value: string) => void;
}

/**
 * Shared labeled-field layout for configuring a celestial body's name, preset, mass, and velocity.
 */
export function BodyFieldsForm({
  labels,
  name,
  onNameChange,
  preset,
  presetOptions,
  onPresetChange,
  mass,
  onMassChange,
  velMag,
  onVelMagChange,
  velDir,
  onVelDirChange,
  color,
  onColorChange,
}: BodyFieldsFormProps) {
  return (
    <>
      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.name}</span>
        <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.presetTemplate}</span>
        <select value={preset} onChange={(e) => onPresetChange(e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
          {presetOptions.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0f172a' }}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.mass}</span>
        <input type="number" step="any" value={mass} onChange={(e) => onMassChange(parseFloat(e.target.value) || 0)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.velMag}</span>
        <input type="number" step="any" value={velMag} onChange={(e) => onVelMagChange(parseFloat(e.target.value) || 0)} style={INPUT_STYLE} />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.velDir}</span>
        <input
          type="number"
          min="0"
          max="360"
          step="1"
          value={velDir}
          onChange={(e) => onVelDirChange(parseFloat(e.target.value) || 0)}
          style={INPUT_STYLE}
        />
      </div>

      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{labels.color}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{ ...INPUT_STYLE, padding: '2px 4px', width: '48px', height: '36px', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#94a3b8' }}>{color}</span>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Replace `BodyEditDialog.tsx`**

Replace the full contents of `frontend/src/components/BodyEditDialog/BodyEditDialog.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, FIELD_STYLE, LABEL_STYLE, BUTTON_STYLE } from '../BodyPlacementDialog/styles';
import { BodyFieldsForm, BodyPresetOption } from '../BodyFieldsForm/BodyFieldsForm';

interface BodyEditDialogProps {
  body: SandboxBody;
  onConfirm: (updatedBody: SandboxBody) => void;
  onCancel: () => void;
}

const CONFIRM_PRESETS = {
  sun: { mass: 1.989e30, radius: 6.9634e8, color: '#fbc531' },
  jupiter: { mass: 1.898e27, radius: 7.1492e7, color: '#e1b12c' },
  earth: { mass: 5.9722e24, radius: 6.371e6, color: '#00a8ff' },
  moon: { mass: 7.348e22, radius: 1.737e6, color: '#dcdde1' },
  asteroid: { mass: 1.0e15, radius: 1.0e4, color: '#7f8fa6' },
} as const;

const radiusFromMass = (mass: number) => {
  if (mass >= 1e30) return 6.9634e8 * Math.pow(mass / 1.989e30, 1 / 3);
  if (mass >= 1e27) return 7.1492e7 * Math.pow(mass / 1.898e27, 1 / 3);
  return 6.371e6 * Math.pow(mass / 5.9722e24, 1 / 3);
};

/**
 * Renders a properties dialog modal for editing an existing body's parameters.
 */
export function BodyEditDialog({ body, onConfirm, onCancel }: BodyEditDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(body.name || t('sandbox.defaultBodyName'));
  const [preset, setPreset] = useState<keyof typeof CONFIRM_PRESETS | 'custom'>('custom');
  const [mass, setMass] = useState(body.mass);
  const [velMag, setVelMag] = useState(() => Math.hypot(...body.velocity));
  const [velDir, setVelDir] = useState(() => {
    const angle = Math.atan2(body.velocity[1], body.velocity[0]) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
  });
  const [color, setColor] = useState(body.color);
  const [locked, setLocked] = useState(Boolean(body.locked));

  useEffect(() => {
    if (preset !== 'custom') {
      const data = CONFIRM_PRESETS[preset];
      setMass(data.mass);
      setColor(data.color);
    }
  }, [preset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleConfirm = () => {
    const rad = radiusFromMass(mass);
    const radAngle = (velDir * Math.PI) / 180;
    const vx = velMag * Math.cos(radAngle);
    const vy = velMag * Math.sin(radAngle);
    onConfirm({ ...body, name, mass, radius: rad, velocity: [vx, vy], color, locked });
  };

  const presetOptions: BodyPresetOption[] = [
    { value: 'custom', label: t('dialog.presets.custom') },
    { value: 'earth', label: t('dialog.presets.earth') },
    { value: 'sun', label: t('dialog.presets.sun') },
    { value: 'jupiter', label: t('dialog.presets.jupiter') },
    { value: 'moon', label: t('dialog.presets.moon') },
    { value: 'asteroid', label: t('dialog.presets.asteroid') },
  ];

  return (
    <div style={OVERLAY_STYLE} onClick={onCancel} data-testid="body-edit-dialog">
      <div style={DIALOG_STYLE} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '12px',
          }}
        >
          {t('editDialog.editTitle')}
        </h3>

        <BodyFieldsForm
          labels={{
            name: t('dialog.name'),
            presetTemplate: t('dialog.presetTemplate'),
            mass: t('dialog.mass'),
            velMag: t('dialog.velMag'),
            velDir: t('dialog.velDir'),
            color: t('dialog.color'),
          }}
          name={name}
          onNameChange={setName}
          preset={preset}
          presetOptions={presetOptions}
          onPresetChange={(p) => setPreset(p as keyof typeof CONFIRM_PRESETS | 'custom')}
          mass={mass}
          onMassChange={(m) => {
            setMass(m);
            setPreset('custom');
          }}
          velMag={velMag}
          onVelMagChange={setVelMag}
          velDir={velDir}
          onVelDirChange={setVelDir}
          color={color}
          onColorChange={(c) => {
            setColor(c);
            setPreset('custom');
          }}
        />

        <div style={{ ...FIELD_STYLE, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="lockCheckbox"
            checked={locked}
            onChange={(e) => setLocked(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="lockCheckbox" style={{ ...LABEL_STYLE, cursor: 'pointer' }}>
            🔒 {t('editDialog.locked')}
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            style={{ ...BUTTON_STYLE, flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}
          >
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{ ...BUTTON_STYLE, flex: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff' }}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

Note: `INPUT_STYLE` is dropped from the import list (it was only used by the standalone VelDir block, now removed — leaving it imported would be an unused-import lint error).

- [ ] **Step 4: Replace `BodyPlacementDialog.tsx`**

Replace the full contents of `frontend/src/components/BodyPlacementDialog/BodyPlacementDialog.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { OVERLAY_STYLE, DIALOG_STYLE, BUTTON_STYLE } from './styles';
import { BodyFieldsForm, BodyPresetOption } from '../BodyFieldsForm/BodyFieldsForm';

interface BodyPlacementDialogProps {
  position: [number, number];
  onConfirm: (body: SandboxBody) => void;
  onCancel: () => void;
  initialVelocity?: [number, number];
}

const CONFIRM_PRESETS = {
  sun: { mass: 1.989e30, radius: 6.9634e8, color: '#fbc531', name: 'Sun-like Star' },
  jupiter: { mass: 1.898e27, radius: 7.1492e7, color: '#e1b12c', name: 'Gas Giant' },
  earth: { mass: 5.9722e24, radius: 6.371e6, color: '#00a8ff', name: 'Terrestrial Planet' },
  moon: { mass: 7.348e22, radius: 1.737e6, color: '#dcdde1', name: 'Moon-like Satellite' },
  asteroid: { mass: 1.0e15, radius: 1.0e4, color: '#7f8fa6', name: 'Asteroid' },
} as const;

const radiusFromMass = (mass: number) => {
  if (mass >= 1e30) return 6.9634e8 * Math.pow(mass / 1.989e30, 1 / 3);
  if (mass >= 1e27) return 7.1492e7 * Math.pow(mass / 1.898e27, 1 / 3);
  return 6.371e6 * Math.pow(mass / 5.9722e24, 1 / 3);
};

/**
 * Renders a properties dialog modal for configuring a new body's parameters.
 */
export function BodyPlacementDialog({ position, onConfirm, onCancel, initialVelocity = [0, 0] }: BodyPlacementDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(() => t('dialog.defaultBodyName'));
  const [preset, setPreset] = useState<keyof typeof CONFIRM_PRESETS | 'custom'>('earth');
  const [mass, setMass] = useState(5.9722e24);
  const [velMag, setVelMag] = useState(() => Math.hypot(...initialVelocity));
  const [velDir, setVelDir] = useState(() => {
    const angle = Math.atan2(initialVelocity[1], initialVelocity[0]) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
  });
  const [color, setColor] = useState('#00a8ff');

  useEffect(() => {
    if (preset !== 'custom') {
      const data = CONFIRM_PRESETS[preset];
      setMass(data.mass);
      setColor(data.color);
      setName(t(`dialog.presets.${preset}`));
    }
  }, [preset, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleConfirm = () => {
    const rad = radiusFromMass(mass);
    const radAngle = (velDir * Math.PI) / 180;
    const vx = velMag * Math.cos(radAngle);
    const vy = velMag * Math.sin(radAngle);
    onConfirm({ id: `body-${Date.now()}`, position, velocity: [vx, vy], mass, radius: rad, color, name, locked: false });
  };

  const presetOptions: BodyPresetOption[] = [
    { value: 'earth', label: t('dialog.presets.earth') },
    { value: 'sun', label: t('dialog.presets.sun') },
    { value: 'jupiter', label: t('dialog.presets.jupiter') },
    { value: 'moon', label: t('dialog.presets.moon') },
    { value: 'asteroid', label: t('dialog.presets.asteroid') },
    { value: 'custom', label: t('dialog.presets.custom') },
  ];

  return (
    <div style={OVERLAY_STYLE} onClick={onCancel}>
      <div style={DIALOG_STYLE} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '12px',
          }}
        >
          {t('dialog.title')}
        </h3>

        <BodyFieldsForm
          labels={{
            name: t('dialog.name'),
            presetTemplate: t('dialog.presetTemplate'),
            mass: t('dialog.mass'),
            velMag: t('dialog.velMag'),
            velDir: t('dialog.velDir'),
            color: t('dialog.color'),
          }}
          name={name}
          onNameChange={(n) => {
            setName(n);
            setPreset('custom');
          }}
          preset={preset}
          presetOptions={presetOptions}
          onPresetChange={(p) => setPreset(p as keyof typeof CONFIRM_PRESETS | 'custom')}
          mass={mass}
          onMassChange={(m) => {
            setMass(m);
            setPreset('custom');
          }}
          velMag={velMag}
          onVelMagChange={setVelMag}
          velDir={velDir}
          onVelDirChange={setVelDir}
          color={color}
          onColorChange={(c) => {
            setColor(c);
            setPreset('custom');
          }}
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onCancel} style={{ ...BUTTON_STYLE, flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}>
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...BUTTON_STYLE,
              flex: 1,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

Note: `FIELD_STYLE` and `LABEL_STYLE` are dropped from the import list (they were only used by the standalone VelDir slider block, now removed).

- [ ] **Step 5: Verify tests still pass**

Run: `npm --prefix frontend run test -- BodyEditDialog Canvas SimulationShell`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/BodyFieldsForm/BodyFieldsForm.tsx frontend/src/components/BodyEditDialog/BodyEditDialog.tsx frontend/src/components/BodyPlacementDialog/BodyPlacementDialog.tsx
git commit -m "refactor(dialogs): unify VelDir into shared BodyFieldsForm to finish deduplicating BodyEditDialog/BodyPlacementDialog"
```
