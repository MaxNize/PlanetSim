import { useState } from 'react';

/**
 * Returns the minimal simulation controls used by the demo shell.
 *
 * @returns Mass and distance values plus setters.
 */
export function useSimulationControls() {
  const [massM1, setMassM1] = useState(1e24);
  const [distanceR, setDistanceR] = useState(1e8);

  return {
    massM1,
    distanceR,
    setMassM1,
    setDistanceR,
  };
}
