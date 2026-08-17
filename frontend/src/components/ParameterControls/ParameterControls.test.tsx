import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterControls } from './ParameterControls';

const contextMock = {
  showTrail: true,
  setShowTrail: vi.fn(),
  trailLength: 1000,
  setTrailLength: vi.fn(),
  clearTrailHistory: vi.fn(),
  mode: '3body' as '3body' | 'sandbox',
  setMode: vi.fn(),
  sandboxBodies: [] as unknown[],
  removeBody: vi.fn(),
  updateBody: vi.fn(),
  selectedBodyId: null,
  setSelectedBodyId: vi.fn(),
  trackedBodyId: null,
  toggleTracking: vi.fn(),
  miniviewBodyId: null,
  toggleMiniview: vi.fn(),
};

vi.mock('../../context/SimulationContext', () => ({
  useSimulationContext: () => contextMock,
}));

describe('ParameterControls component', () => {
  it('should render all inputs and buttons with correct values', () => {
    const props = {
      massM1: 1e24,
      setMassM1: vi.fn(),
      massM2: 1e22,
      setMassM2: vi.fn(),
      distanceR: 1e8,
      setDistanceR: vi.fn(),
      speedMultiplier: 1000,
      setSpeedMultiplier: vi.fn(),
      isPaused: true,
      setIsPaused: vi.fn(),
      onReset: vi.fn(),
      preset: 'earth-moon' as const,
      setPreset: vi.fn(),
    };

    render(<ParameterControls {...props} />);

    // Assert headings
    expect(screen.getByText('Simulation System')).toBeDefined();

    // Assert buttons
    expect(screen.getByText('▶ Play')).toBeDefined();
    expect(screen.getByText('🔄 Reset')).toBeDefined();
    expect(screen.getByText('🌍 Earth-Moon')).toBeDefined();
    expect(screen.getByText('✨ Binary Stars')).toBeDefined();

    // Assert text inputs (role textbox)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(4);
  });

  it('should trigger callbacks when sliders, buttons, or presets are interacted with', () => {
    const props = {
      massM1: 1e24,
      setMassM1: vi.fn(),
      massM2: 1e22,
      setMassM2: vi.fn(),
      distanceR: 1e8,
      setDistanceR: vi.fn(),
      speedMultiplier: 1000,
      setSpeedMultiplier: vi.fn(),
      isPaused: true,
      setIsPaused: vi.fn(),
      onReset: vi.fn(),
      preset: 'earth-moon' as const,
      setPreset: vi.fn(),
    };

    render(<ParameterControls {...props} />);

    // Trigger Play/Pause click
    fireEvent.click(screen.getByText('▶ Play'));
    expect(props.setIsPaused).toHaveBeenCalledWith(false);

    // Trigger Reset click
    fireEvent.click(screen.getByText('🔄 Reset'));
    expect(props.onReset).toHaveBeenCalled();

    // Trigger Preset click
    fireEvent.click(screen.getByText('✨ Binary Stars'));
    expect(props.setPreset).toHaveBeenCalledWith('binary-stars');
  });

  const props = {
    massM1: 1e24,
    setMassM1: vi.fn(),
    massM2: 1e22,
    setMassM2: vi.fn(),
    distanceR: 1e8,
    setDistanceR: vi.fn(),
    speedMultiplier: 1000,
    setSpeedMultiplier: vi.fn(),
    isPaused: true,
    setIsPaused: vi.fn(),
    onReset: vi.fn(),
    preset: 'earth-moon' as const,
    setPreset: vi.fn(),
  };

  it('switches to sandbox mode when the sandbox tab is clicked', () => {
    render(<ParameterControls {...props} />);
    fireEvent.click(screen.getByText('Sandbox Mode'));
    expect(contextMock.setMode).toHaveBeenCalledWith('sandbox');
  });

  it('renders SandboxControls instead of the mass/distance fields in sandbox mode', () => {
    contextMock.mode = 'sandbox';
    render(<ParameterControls {...props} />);
    expect(screen.getByText('Sandbox Creator')).toBeDefined();
    expect(screen.queryByText('Mass 1 (Primary, kg)')).toBeNull();
    contextMock.mode = '3body';
  });

  it('rejects an out-of-range mass and reverts to the last valid value on blur', () => {
    render(<ParameterControls {...props} />);
    const massInput = screen.getAllByRole('textbox')[0] as HTMLInputElement;

    fireEvent.change(massInput, { target: { value: 'not-a-number' } });
    fireEvent.blur(massInput);

    expect(props.setMassM1).not.toHaveBeenCalled();
    expect(massInput.value).toBe(props.massM1.toExponential(3));
  });

  it('commits a valid mass value on blur', () => {
    render(<ParameterControls {...props} />);
    const massInput = screen.getAllByRole('textbox')[0] as HTMLInputElement;

    fireEvent.change(massInput, { target: { value: '2e24' } });
    fireEvent.blur(massInput);

    expect(props.setMassM1).toHaveBeenCalledWith(2e24);
  });
});
