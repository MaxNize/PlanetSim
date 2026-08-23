import { SimulationState, LagrangePointSet, Body, SimulatorBridge } from '../services/wasmBridge';
import { SimulationMode, SandboxBody } from '../types';

export function enrichSingleBody(
  b: Body & { id?: string; name?: string; color?: string; locked?: boolean },
  sb: SandboxBody | undefined,
  idx: number,
): Body & { id: string; name?: string; color?: string; locked?: boolean } {
  if (!sb) {
    return { ...b, id: b.id ?? `body-${idx}` };
  }
  return {
    ...b,
    id: sb.id,
    name: sb.name,
    color: sb.color,
    locked: sb.locked,
  };
}

export function enrichBodies(
  bodies: (Body & { id?: string; name?: string; color?: string; locked?: boolean })[],
  sandboxBodies: SandboxBody[],
): (Body & { id: string; name?: string; color?: string; locked?: boolean })[] {
  return bodies.map((b, idx) => enrichSingleBody(b, sandboxBodies[idx], idx));
}

export function refreshLagrangePoints(simulator: SimulatorBridge, setLagrangePoints: (points: LagrangePointSet | null) => void): void {
  try {
    setLagrangePoints(simulator.getLagrangePoints());
  } catch (err) {
    console.error(err);
  }
}

export function processStepState(rawState: SimulationState, sandboxBodies: SandboxBody[], showTrail: boolean, recordStep: (s: SimulationState) => void): SimulationState {
  const enriched = { ...rawState };
  if (enriched.bodies) {
    enriched.bodies = enrichBodies(enriched.bodies, sandboxBodies);
  }
  if (showTrail) {
    recordStep(enriched);
  }
  return enriched;
}

export function updateLagrange(simulator: SimulatorBridge | null, mode: SimulationMode, setLagrangePoints: (points: LagrangePointSet | null) => void): void {
  if (simulator && mode === '3body') {
    refreshLagrangePoints(simulator, setLagrangePoints);
  }
}
