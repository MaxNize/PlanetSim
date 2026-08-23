import { SimulationState, LagrangePointSet, Body, SimulatorBridge } from '../services/wasmBridge';
import { SimulationMode, SandboxBody } from '../types';

/** Merges optional custom metadata (name, color, locked status) into a single body state. */
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

/** Merges custom sandbox body fields (name, color, locked status) into physics step body array. */
export function enrichBodies(
  bodies: (Body & { id?: string; name?: string; color?: string; locked?: boolean })[],
  sandboxBodies: SandboxBody[],
): (Body & { id: string; name?: string; color?: string; locked?: boolean })[] {
  return bodies.map((b, idx) => enrichSingleBody(b, sandboxBodies[idx], idx));
}

/** Recomputes Lagrange points from the WASM simulator instance. */
export function refreshLagrangePoints(simulator: SimulatorBridge, setLagrangePoints: (points: LagrangePointSet | null) => void): void {
  try {
    setLagrangePoints(simulator.getLagrangePoints());
  } catch (err) {
    console.error(err);
  }
}

/** Processes a raw simulation step result, enriching sandbox metadata and recording trail history. */
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

/** Triggers Lagrange point refresh if the current mode is 3body. */
export function updateLagrange(simulator: SimulatorBridge | null, mode: SimulationMode, setLagrangePoints: (points: LagrangePointSet | null) => void): void {
  if (simulator && mode === '3body') {
    refreshLagrangePoints(simulator, setLagrangePoints);
  }
}
