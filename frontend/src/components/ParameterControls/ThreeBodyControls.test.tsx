import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThreeBodyControls } from './ThreeBodyControls';

function renderControls(overrides: Partial<Parameters<typeof ThreeBodyControls>[0]> = {}) {
  const props = {
    massM1: 5.97e24,
    setMassM1: vi.fn(),
    massM2: 7.35e22,
    setMassM2: vi.fn(),
    distanceR: 3.84e8,
    setDistanceR: vi.fn(),
    ...overrides,
  };
  render(<ThreeBodyControls {...props} />);
  return props;
}

describe('ThreeBodyControls', () => {
  it('renders one text input per parameter, seeded from the current values', () => {
    const props = renderControls();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(3);
    expect(inputs[0].value).toBe(props.massM1.toExponential(3));
    expect(inputs[1].value).toBe(props.massM2.toExponential(3));
    expect(inputs[2].value).toBe(props.distanceR.toExponential(3));
  });

  it('commits a valid mass1 value within [1e21, 1e33] on blur', () => {
    const props = renderControls();
    const [m1] = screen.getAllByRole('textbox');
    fireEvent.change(m1, { target: { value: '3e24' } });
    fireEvent.blur(m1);
    expect(props.setMassM1).toHaveBeenCalledWith(3e24);
  });

  it('rejects a non-numeric mass1 and reverts the field on blur', () => {
    const props = renderControls();
    const [m1] = screen.getAllByRole('textbox');
    fireEvent.change(m1, { target: { value: 'not-a-number' } });
    fireEvent.blur(m1);
    expect(props.setMassM1).not.toHaveBeenCalled();
    expect(m1.value).toBe(props.massM1.toExponential(3));
  });

  it('rejects a mass1 below the lower bound and reverts the field', () => {
    const props = renderControls();
    const [m1] = screen.getAllByRole('textbox');
    fireEvent.change(m1, { target: { value: '1e20' } });
    fireEvent.blur(m1);
    expect(props.setMassM1).not.toHaveBeenCalled();
    expect(m1.value).toBe(props.massM1.toExponential(3));
  });

  it('rejects a mass1 above the upper bound and reverts the field', () => {
    const props = renderControls();
    const [m1] = screen.getAllByRole('textbox');
    fireEvent.change(m1, { target: { value: '1e34' } });
    fireEvent.blur(m1);
    expect(props.setMassM1).not.toHaveBeenCalled();
    expect(m1.value).toBe(props.massM1.toExponential(3));
  });

  it('commits a valid mass2 value on blur', () => {
    const props = renderControls();
    const [, m2] = screen.getAllByRole('textbox');
    fireEvent.change(m2, { target: { value: '4e22' } });
    fireEvent.blur(m2);
    expect(props.setMassM2).toHaveBeenCalledWith(4e22);
  });

  it('rejects an out-of-range mass2 and reverts the field', () => {
    const props = renderControls();
    const [, m2] = screen.getAllByRole('textbox');
    fireEvent.change(m2, { target: { value: '1e40' } });
    fireEvent.blur(m2);
    expect(props.setMassM2).not.toHaveBeenCalled();
    expect(m2.value).toBe(props.massM2.toExponential(3));
  });

  it('commits a valid distance value within [1e6, 1e11] on blur', () => {
    const props = renderControls();
    const [, , dist] = screen.getAllByRole('textbox');
    fireEvent.change(dist, { target: { value: '5e8' } });
    fireEvent.blur(dist);
    expect(props.setDistanceR).toHaveBeenCalledWith(5e8);
  });

  it('rejects an out-of-range distance and reverts the field', () => {
    const props = renderControls();
    const [, , dist] = screen.getAllByRole('textbox');
    fireEvent.change(dist, { target: { value: '1e2' } });
    fireEvent.blur(dist);
    expect(props.setDistanceR).not.toHaveBeenCalled();
    expect(dist.value).toBe(props.distanceR.toExponential(3));
  });

  it('converts slider drags to linear values via the log scale', () => {
    const props = renderControls();
    const sliders = document.querySelectorAll('input[type="range"]');
    fireEvent.change(sliders[0], { target: { value: '25' } });
    expect(props.setMassM1).toHaveBeenCalledWith(1e25);

    fireEvent.change(sliders[2], { target: { value: '9' } });
    expect(props.setDistanceR).toHaveBeenCalledWith(1e9);
  });
});
