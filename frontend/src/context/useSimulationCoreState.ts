import { useState } from 'react';
import { SimulationState, LagrangePointSet } from '../services/wasmBridge';
import { SimulationMode, SandboxBody } from '../types';
import { DEFAULT_INITIAL_STATE, PresetType } from './presets';

/** Core React state variables for the simulation provider. */
export function useSimulationCoreState() {
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

  return {
    mode,
    setModeState,
    sandboxBodies,
    setSandboxBodies,
    selectedBodyId,
    setSelectedBodyId,
    initialState,
    setInitialState,
    currentState,
    setCurrentState,
    isPaused,
    setIsPaused,
    speedMultiplier,
    setSpeedMultiplier,
    showTrail,
    setShowTrail,
    lagrangePoints,
    setLagrangePoints,
    resetCounter,
    setResetCounter,
    preset,
    setPresetState,
  };
}
