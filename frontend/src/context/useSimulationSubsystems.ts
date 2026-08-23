import { StepResult, SimulatorBridge } from '../services/wasmBridge';
import { useSandbox } from './useSandbox';
import { useBodyTracking } from '../hooks/useBodyTracking';
import { useMiniview } from '../hooks/useMiniview';
import { useFps } from '../hooks/useFps';
import { useSimulationCoreState } from './useSimulationCoreState';

export function useSimulationSubsystems(core: ReturnType<typeof useSimulationCoreState>, simulator: SimulatorBridge | null, setStepResult: React.Dispatch<React.SetStateAction<StepResult | null>>) {
  const sandbox = useSandbox(core.sandboxBodies, core.setSandboxBodies, core.currentState, core.setCurrentState, core.setInitialState, core.setIsPaused, setStepResult, core.setModeState, simulator);
  const tracking = useBodyTracking(core.currentState, core.mode);
  const miniview = useMiniview(core.currentState, core.mode);
  const fps = useFps(!core.isPaused);

  return { sandbox, tracking, miniview, fps };
}
