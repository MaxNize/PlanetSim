import { useCallback } from 'react';
import { SandboxBody, SimulationMode } from '../types';
import { SimulationState } from '../services/wasmBridge';

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
        setSandboxBodies(initialSandbox);
        const nextState = { ...currentState, bodies: initialSandbox };
        setCurrentState(nextState);
        if (simulator) {
          try {
            simulator.setState(nextState);
          } catch (e) {
            console.error(e);
          }
        }
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
      const latestBodies = currentState.bodies || [];
      for (const other of latestBodies) {
        const dx = body.position[0] - other.position[0];
        const dy = body.position[1] - other.position[1];
        if (Math.hypot(dx, dy) < body.radius + other.radius) {
          throw new Error('Overlap detected with another body');
        }
      }
      const updatedSandbox = sandboxBodies.map((sb, idx) => {
        const simBody = latestBodies[idx];
        if (simBody) {
          return {
            ...sb,
            position: simBody.position,
            velocity: simBody.velocity,
          };
        }
        return sb;
      });
      const nextSandboxBodies = [...updatedSandbox, body];
      setSandboxBodies(nextSandboxBodies);
      const nextState = { ...currentState, bodies: nextSandboxBodies };
      setCurrentState(nextState);
      if (simulator) {
        try {
          simulator.setState(nextState);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [sandboxBodies, currentState, simulator, setSandboxBodies, setCurrentState],
  );

  const removeBody = useCallback(
    (id: string) => {
      const latestBodies = currentState.bodies || [];
      const updatedSandbox = sandboxBodies
        .map((sb, idx) => {
          const simBody = latestBodies[idx];
          if (simBody) {
            return {
              ...sb,
              position: simBody.position,
              velocity: simBody.velocity,
            };
          }
          return sb;
        })
        .filter((b) => b.id !== id);
      setSandboxBodies(updatedSandbox);
      const nextState = { ...currentState, bodies: updatedSandbox };
      setCurrentState(nextState);
      if (simulator) {
        try {
          simulator.setState(nextState);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [sandboxBodies, currentState, simulator, setSandboxBodies, setCurrentState],
  );

  const updateBody = useCallback(
    (id: string, updates: Partial<SandboxBody>) => {
      const latestBodies = currentState.bodies || [];
      const updatedSandbox = sandboxBodies.map((sb, idx) => {
        const simBody = latestBodies[idx];
        const currentBody = simBody ? { ...sb, position: simBody.position, velocity: simBody.velocity } : sb;
        return sb.id === id ? { ...currentBody, ...updates } : currentBody;
      });
      setSandboxBodies(updatedSandbox);
      const nextState = { ...currentState, bodies: updatedSandbox };
      setCurrentState(nextState);
      if (simulator) {
        try {
          simulator.setState(nextState);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [sandboxBodies, currentState, simulator, setSandboxBodies, setCurrentState],
  );

  return { setMode, addBody, removeBody, updateBody };
}
