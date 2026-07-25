import { SimulationProvider } from './context/SimulationContext';
import { Layout } from './components/Layout/Layout';

/**
 * Root application component for the planet simulation.
 * Sets up global state context provider and mounts the layout.
 *
 * @returns The main application view.
 */
export default function App() {
  return (
    <SimulationProvider>
      <Layout />
    </SimulationProvider>
  );
}
