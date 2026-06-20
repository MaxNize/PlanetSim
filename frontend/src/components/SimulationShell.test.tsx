import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimulationShell } from './SimulationShell';

describe('SimulationShell', () => {
  it('should render headers and description', () => {
    render(<SimulationShell />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Planet Simulation');
    expect(screen.getByText(/Welcome — run/i)).toBeInTheDocument();
  });

  it('should render default parameters and calculate initial velocity', () => {
    render(<SimulationShell />);

    const massInput = screen.getByLabelText('Mass 1');
    const distanceInput = screen.getByLabelText('Distance');

    expect(massInput).toHaveValue(1e24);
    expect(distanceInput).toHaveValue(1e8);
    expect(screen.getByText('Example orbital velocity: 816.96 m/s')).toBeInTheDocument();
  });

  it('should recalculate orbital velocity when mass changes', () => {
    render(<SimulationShell />);

    const massInput = screen.getByLabelText('Mass 1');

    // Change mass from 1e24 to 2e24
    fireEvent.change(massInput, { target: { value: '2e24' } });

    expect(massInput).toHaveValue(2e24);
    // V = sqrt(6.6743e-11 * 2e24 / 1e8) = sqrt(1.33486e6) ≈ 1155.36 m/s
    expect(screen.getByText('Example orbital velocity: 1155.36 m/s')).toBeInTheDocument();
  });

  it('should recalculate orbital velocity when distance changes', () => {
    render(<SimulationShell />);

    const distanceInput = screen.getByLabelText('Distance');

    // Change distance from 1e8 to 2e8
    fireEvent.change(distanceInput, { target: { value: '2e8' } });

    expect(distanceInput).toHaveValue(2e8);
    // V = sqrt(6.6743e-11 * 1e24 / 2e8) = sqrt(3.33715e5) ≈ 577.68 m/s
    expect(screen.getByText('Example orbital velocity: 577.68 m/s')).toBeInTheDocument();
  });

  it('should show error message when distance is negative or zero', () => {
    render(<SimulationShell />);

    const distanceInput = screen.getByLabelText('Distance');

    // Change distance to 0
    fireEvent.change(distanceInput, { target: { value: '0' } });

    expect(distanceInput).toHaveValue(0);
    expect(screen.getByLabelText('error-message')).toHaveTextContent('Error: distanceR must be positive');
  });
});
