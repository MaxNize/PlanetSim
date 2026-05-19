import { useSimulationControls } from '../hooks/useSimulationControls';
import { calculateOrbitalVelocity } from '../utils/calculateOrbitalVelocity';

/**
 * Renders the initial simulation shell and a tiny physics summary.
 *
 * @returns The simulation shell UI.
 */
export function SimulationShell() {
  const { massM1, distanceR, setMassM1, setDistanceR } = useSimulationControls();
  const orbitalVelocity = calculateOrbitalVelocity(massM1, distanceR);

  return (
    <section>
      <h1>Planet Simulation</h1>
      <p>
        Welcome — run <code>npm run dev</code> to start.
      </p>
      <p>Example orbital velocity: {orbitalVelocity.toFixed(2)} m/s</p>
      <label>
        Mass 1
        <input aria-label="Mass 1" type="number" value={massM1} onChange={(event) => setMassM1(Number(event.target.value))} />
      </label>
      <label>
        Distance
        <input aria-label="Distance" type="number" value={distanceR} onChange={(event) => setDistanceR(Number(event.target.value))} />
      </label>
    </section>
  );
}
