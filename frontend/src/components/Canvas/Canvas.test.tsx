import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { simulationContext, DEFAULT_INITIAL_STATE } from '../../context/SimulationContext';
import { simulationAnimationContext } from '../../context/SimulationAnimationContext';
import { Canvas } from './Canvas';
import { SandboxBody, SimulationMode } from '../../types';

const baseContextValue = {
  initialState: DEFAULT_INITIAL_STATE,
  setInitialState: vi.fn(),
  currentState: DEFAULT_INITIAL_STATE,
  stepResult: null,
  isPaused: true,
  setIsPaused: vi.fn(),
  speedMultiplier: 1000.0,
  setSpeedMultiplier: vi.fn(),
  lagrangePoints: null,
  history: [] as [number, number][],
  clearHistory: vi.fn(),
  resetSimulation: vi.fn(),
  error: null,
  preset: 'earth-moon' as const,
  setPreset: vi.fn(),
  mode: '3body' as SimulationMode,
  setMode: vi.fn(),
  sandboxBodies: [],
  addBody: vi.fn(),
  removeBody: vi.fn(),
  updateBody: vi.fn(),
  selectedBodyId: null,
  setSelectedBodyId: vi.fn(),
};

/** Provides a real stateful trackedBodyId/miniviewBodyId (live toggling, as SimulationProvider does in production) around static test overrides. */
function TestProvider({ overrides, children }: { overrides: Partial<typeof baseContextValue>; children: React.ReactNode }) {
  const [trackedBodyId, setTrackedBodyId] = useState<string | null>(null);
  const [miniviewBodyId, setMiniviewBodyId] = useState<string | null>(null);
  const toggleTracking = (body: SandboxBody) => setTrackedBodyId((prev) => (prev === body.id ? null : body.id));
  const toggleMiniview = (body: SandboxBody) => setMiniviewBodyId((prev) => (prev === body.id ? null : body.id));

  const value = { ...baseContextValue, ...overrides, trackedBodyId, setTrackedBodyId, toggleTracking, miniviewBodyId, setMiniviewBodyId, toggleMiniview };
  return (
    <simulationContext.Provider value={value as any}>
      <simulationAnimationContext.Provider value={value as any}>{children}</simulationAnimationContext.Provider>
    </simulationContext.Provider>
  );
}

describe('Canvas component', () => {
  it('should render canvas element with appropriate attributes', () => {
    render(
      <TestProvider overrides={{}}>
        <Canvas showTrail={true} />
      </TestProvider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    expect(canvasElement).toBeDefined();
    expect(canvasElement.tagName).toBe('CANVAS');
  });

  it('should only show Track (not edit/lock/delete) in the context menu in preset (3body) mode', () => {
    const bodies = [
      { ...DEFAULT_INITIAL_STATE.primary, id: 'body-0', name: 'Primary' },
      { ...DEFAULT_INITIAL_STATE.secondary, id: 'body-1', name: 'Secondary' },
      { ...DEFAULT_INITIAL_STATE.testParticle, id: 'body-2', name: 'Test' },
    ];
    render(
      <TestProvider overrides={{ mode: '3body', currentState: { ...DEFAULT_INITIAL_STATE, bodies } }}>
        <Canvas showTrail={true} />
      </TestProvider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    // Primary body sits at world (0, 0); with default viewport (scale 1e-6, pan {x:1.5e8,y:0})
    // and a zero-size jsdom bounding rect, clientX -150 / clientY 0 maps back to world (0, 0).
    fireEvent.contextMenu(canvasElement, { clientX: -150, clientY: 0 });

    // Menu opens (Track works in every mode, FP-36) but Edit/Lock/Delete stay sandbox-only (FP-39).
    expect(screen.queryByTestId('body-context-menu')).not.toBeNull();
    expect(screen.getByText(/Track/)).toBeDefined();
    expect(screen.queryByText('✏️ Edit')).toBeNull();
  });

  it('should open the body context menu in sandbox mode', () => {
    const bodies = [{ ...DEFAULT_INITIAL_STATE.primary, id: 'body-0', name: 'Primary', color: '#fff' }];
    render(
      <TestProvider overrides={{ mode: 'sandbox', currentState: { ...DEFAULT_INITIAL_STATE, bodies } }}>
        <Canvas showTrail={true} />
      </TestProvider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    fireEvent.contextMenu(canvasElement, { clientX: -150, clientY: 0 });

    expect(screen.queryByTestId('body-context-menu')).not.toBeNull();
  });

  it('should create a body directly on click-drag-release of empty sandbox canvas, without any mode button (FP-38)', () => {
    render(
      <TestProvider overrides={{ mode: 'sandbox' }}>
        <Canvas showTrail={true} />
      </TestProvider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    // Far from any existing body (there are none here) — just a plain empty-space click-drag-release.
    fireEvent.mouseDown(canvasElement, { button: 0, clientX: 1000, clientY: 1000 });
    fireEvent.mouseMove(canvasElement, { clientX: 1050, clientY: 950 });
    fireEvent.mouseUp(canvasElement, { clientX: 1050, clientY: 950 });

    expect(screen.getByText('Configure New Body')).toBeDefined();
  });

  it('should not start body creation when mousedown hits an existing body (selects instead)', () => {
    const bodies = [{ ...DEFAULT_INITIAL_STATE.primary, id: 'body-0', name: 'Primary', color: '#fff' }];
    const setSelectedBodyId = vi.fn();
    render(
      <TestProvider overrides={{ mode: 'sandbox', currentState: { ...DEFAULT_INITIAL_STATE, bodies }, setSelectedBodyId }}>
        <Canvas showTrail={true} />
      </TestProvider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    // Primary body sits at world (0, 0), reachable via clientX -150 / clientY 0 (see comment above).
    fireEvent.mouseDown(canvasElement, { button: 0, clientX: -150, clientY: 0 });
    fireEvent.mouseUp(canvasElement, { clientX: -150, clientY: 0 });

    expect(setSelectedBodyId).toHaveBeenCalledWith('body-0');
    expect(screen.queryByText('Configure New Body')).toBeNull();
  });

  it('should cancel an in-progress body creation when the mouse leaves the canvas', () => {
    render(
      <TestProvider overrides={{ mode: 'sandbox' }}>
        <Canvas showTrail={true} />
      </TestProvider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    fireEvent.mouseDown(canvasElement, { button: 0, clientX: 1000, clientY: 1000 });
    fireEvent.mouseLeave(canvasElement);
    fireEvent.mouseUp(canvasElement, { clientX: 1000, clientY: 1000 });

    expect(screen.queryByText('Configure New Body')).toBeNull();
  });

  it('should open a Miniview for a body via the context menu, independent of tracking (FP-37)', () => {
    const bodies = [{ ...DEFAULT_INITIAL_STATE.primary, id: 'body-0', name: 'Primary', color: '#fff' }];
    render(
      <TestProvider overrides={{ mode: 'sandbox', currentState: { ...DEFAULT_INITIAL_STATE, bodies } }}>
        <Canvas showTrail={true} />
      </TestProvider>,
    );

    const canvasElement = screen.getByLabelText('Celestial simulation rendering area');
    expect(screen.queryByLabelText('Body miniview')).toBeNull();

    fireEvent.contextMenu(canvasElement, { clientX: -150, clientY: 0 });
    fireEvent.click(screen.getByText(/Miniview/));

    expect(screen.getByLabelText('Body miniview')).toBeDefined();
    expect(screen.getByText(/Primary/)).toBeDefined();
  });
});
