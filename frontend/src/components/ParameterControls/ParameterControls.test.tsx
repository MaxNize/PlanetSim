import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterControls } from './ParameterControls';

vi.mock('../../context/SimulationContext', () => ({
  useSimulationContext: () => ({
    showTrail: true,
    setShowTrail: vi.fn(),
    trailLength: 1000,
    setTrailLength: vi.fn(),
    clearTrailHistory: vi.fn(),
  }),
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
});
