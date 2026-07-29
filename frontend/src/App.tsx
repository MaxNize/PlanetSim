import { SimulationProvider } from './context/SimulationContext';
import { I18nProvider } from './context/I18nContext';
import { Layout } from './components/Layout/Layout';

/**
 * Root application component for the planet simulation.
 * Sets up global state context provider and mounts the layout.
 *
 * @returns The main application view.
 */
export default function App() {
  return (
    <I18nProvider>
      <SimulationProvider>
        <Layout />
      </SimulationProvider>
    </I18nProvider>
  );
}
