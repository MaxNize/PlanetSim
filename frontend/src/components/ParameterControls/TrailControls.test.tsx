import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrailControls } from './TrailControls';

const contextMock = {
  showTrail: true,
  setShowTrail: vi.fn(),
  trailLength: 1000,
  setTrailLength: vi.fn(),
  clearTrailHistory: vi.fn(),
};

vi.mock('../../context/SimulationContext', () => ({
  useSimulationContext: () => contextMock,
}));

describe('TrailControls', () => {
  it('shows the trail-length slider and toggles the checkbox when trails are enabled', () => {
    contextMock.showTrail = true;
    render(<TrailControls />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(contextMock.setShowTrail).toHaveBeenCalledWith(false);

    const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '2500' } });
    expect(contextMock.setTrailLength).toHaveBeenCalledWith(2500);
  });

  it('hides the trail-length slider when trails are disabled', () => {
    contextMock.showTrail = false;
    render(<TrailControls />);

    expect(document.querySelector('input[type="range"]')).toBeNull();
    contextMock.showTrail = true;
  });

  it('calls clearTrailHistory when the clear button is clicked', () => {
    render(<TrailControls />);
    fireEvent.click(screen.getByText(/clearTrail|Clear/i));
    expect(contextMock.clearTrailHistory).toHaveBeenCalled();
  });
});
