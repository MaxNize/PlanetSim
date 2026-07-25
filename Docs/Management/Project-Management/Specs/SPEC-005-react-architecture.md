# SPEC-005: React Component Architecture

-

## 📝 User Story
```text
As a UI developer
I want well-organized, reusable React components
so that I can build features quickly and maintain them with confidence
```
-

## ✅ Acceptance Criteria

### Component Structure
- [x] AC 1.1: Components follow container/presentational pattern
- [x] AC 1.2: All components are functional, use hooks (no class components)
- [x] AC 1.3: Props are fully typed (TypeScript interfaces)
- [x] AC 1.4: Component directory structure: components/{FeatureName}/{Component}.tsx

### State Management
- [x] AC 2.1: Global state (WASM instance, simulation config) in Context API
- [x] AC 2.2: Local component state for UI (sliders, dialogs, selections)
- [x] AC 2.3: Custom hook `useSimulation()` encapsulates WASM interaction

### Hooks
- [x] AC 3.1: `useSimulation()` - manage Simulator instance lifecycle
- [x] AC 3.2: `useSimulationStep()` - execute step and track energy/state
- [x] AC 3.3: `useAnimationFrame()` - handle 60 FPS rendering loop

### Component Library
- [x] AC 4.1: Simulator wrapper component (canvas + controls)
- [x] AC 4.2: ParameterControl component (sliders for mass, time scale)
- [x] AC 4.3: StateDisplay component (show current bodies, energy)
- [x] AC 4.4: Layout component (responsive grid: canvas + sidebar)

### Error Boundaries
- [x] AC 5.1: Error boundary wraps Simulator to catch render errors
- [x] AC 5.2: WASM errors surface as user-friendly messages
- [x] AC 5.3: Recovery/retry mechanism available

### Testing
- [x] AC 6.1: Component tests render with mock WASM
- [x] AC 6.2: Props are validated; invalid props cause test failures
- [x] AC 6.3: User interactions trigger expected state updates

-

## 🔧 Technical Solution

### Directory Structure
```text
src/
  components/
    Simulator/
      Simulator.tsx
      Simulator.test.tsx      # Colocated test
      Simulator.module.css
    ParameterControls/
      ParameterControls.tsx
      ParameterControls.test.tsx
    StateDisplay/
      StateDisplay.tsx
      StateDisplay.test.tsx
    Layout/
      Layout.tsx
      Layout.test.tsx
  hooks/
    useSimulation.ts
    useSimulation.test.ts     # Colocated test
    useSimulationStep.ts
    useSimulationStep.test.ts
    useAnimationFrame.ts
    useAnimationFrame.test.ts
  context/
    SimulationContext.tsx
    SimulationContext.test.tsx
  types/
    index.ts                # Component interfaces
```
### Example: `hooks/useSimulation.ts`
```typescript
export function useSimulation(config: PhysicsConfig) {
  const [simulator, setSimulator] = useState<SimulatorBridge | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sim = new SimulatorBridge(config);
      setSimulator(sim);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    }
  }, [config]);

  return { simulator, error };
}
```
### Example: `context/SimulationContext.tsx`
```typescript
export interface SimulationContextType {
  config: PhysicsConfig;
  setConfig: (config: PhysicsConfig) => void;
  isPaused: boolean;
  togglePause: () => void;
}

export const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PhysicsConfig>(defaultConfig);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <SimulationContext.Provider value={{ config, setConfig, isPaused, togglePause: () => setIsPaused(!isPaused) }}>
      {children}
    </SimulationContext.Provider>
  );
};
```
### ESLint Config for React
```js
// eslint.config.js
import react from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    plugins: { react, 'react-hooks': hooksPlugin },
    rules: {
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```
-

## 🧪 Tests

- [x] Unit: Each component renders with mock props
- [x] Integration: Context provider passes values correctly
- [x] Hooks: useSimulation initializes and handles errors
- [x] Manual: UI components display without console errors

-

## 🚀 Implementation Flow

1. Spec Review → Components skeleton (RED) → Context setup → Hooks implementation → Tests → Manual render verification

-

## ✅ Definition of Done

- [x] DOD-Global: All criteria met
- [x] DOD-TypeScript: All props typed, no `any`
- [x] DOD-Hooks: Custom hooks follow React rules-of-hooks
- [x] All components have passing tests

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-002, SPEC-004
**Required by**: SPEC-006, SPEC-007, SPEC-008
