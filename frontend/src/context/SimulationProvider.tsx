import React from 'react';
import { simulationContext } from './SimulationContext';
import { simulationAnimationContext } from './SimulationAnimationContext';
import { useSimulationProviderState } from './useSimulationProviderState';

/**
 * Context provider managing the simulation engine state and lifecycle. This is the app's single
 * top-level state provider. State management logic is decomposed into useSimulationProviderState
 * to keep component line counts and cyclomatic complexity strictly compliant with project guardrails.
 */
export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const { uiContextValue, animationContextValue } = useSimulationProviderState();

  return (
    <simulationContext.Provider value={uiContextValue}>
      <simulationAnimationContext.Provider value={animationContextValue}>{children}</simulationAnimationContext.Provider>
    </simulationContext.Provider>
  );
}
