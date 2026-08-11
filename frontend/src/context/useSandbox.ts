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

/** True when a new body at this position/radius would overlap any existing body. */
function hasOverlap(body: SandboxBody, existing: { position: [number, number]; radius: number }[]): boolean {
  return existing.some((other) => {
    const dx = body.position[0] - other.position[0];
    const dy = body.position[1] - other.position[1];
    return Math.hypot(dx, dy) < body.radius + other.radius;
  });
}

/** Resolves a sandbox body's current kinematics: its live simulated state if present, else its own last-known values. */
function resolveCurrentKinematics(sb: SandboxBody, latestBodies: LatestBody[], idx: number): { position: [number, number]; velocity: [number, number] } {
  const simBody = latestBodies.find((b) => b.id === sb.id) || latestBodies[idx];
  return simBody ? { position: simBody.position, velocity: simBody.velocity } : { position: sb.position, velocity: sb.velocity };
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
      if (hasOverlap(body, latestBodies)) throw new Error('Overlap detected with another body');
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
        const { position, velocity } = resolveCurrentKinematics(sb, latestBodies, idx);
        if (sb.id !== id) return { ...sb, position, velocity };
        return { ...sb, ...updates, position, velocity: updates.velocity !== undefined ? updates.velocity : velocity };
      });
      commitSandboxBodies(updatedSandbox, currentState, setSandboxBodies, setCurrentState, simulator);
    },
    [sandboxBodies, currentState, simulator, setSandboxBodies, setCurrentState],
  );

  return { setMode, addBody, removeBody, updateBody };
}
