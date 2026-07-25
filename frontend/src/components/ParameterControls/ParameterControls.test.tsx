import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterControls } from './ParameterControls';

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
    };

    render(<ParameterControls {...props} />);

    // Assert headings
    expect(screen.getByText('Simulation Controls')).toBeDefined();

    // Assert buttons
    expect(screen.getByText('▶ Play')).toBeDefined();
    expect(screen.getByText('🔄 Reset')).toBeDefined();

    // Assert inputs
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(4); // 4 numeric inputs
  });

  it('should trigger callbacks when sliders or buttons are interacted with', () => {
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
    };

    render(<ParameterControls {...props} />);

    // Trigger Play/Pause click
    fireEvent.click(screen.getByText('▶ Play'));
    expect(props.setIsPaused).toHaveBeenCalledWith(false);

    // Trigger Reset click
    fireEvent.click(screen.getByText('🔄 Reset'));
    expect(props.onReset).toHaveBeenCalled();
  });
});
