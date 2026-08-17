import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BodyFieldsForm, BodyPresetOption } from './BodyFieldsForm';

const labels = {
  name: 'Name',
  presetTemplate: 'Preset Template',
  mass: 'Mass (kg)',
  velMag: 'Velocity Magnitude (m/s)',
  velDir: 'Velocity Angle (degrees)',
  color: 'Body Color',
};

const presetOptions: BodyPresetOption[] = [
  { value: 'earth', label: 'Earth-like Planet' },
  { value: 'sun', label: 'Sun-like Star' },
];

function renderForm(overrides: Partial<Parameters<typeof BodyFieldsForm>[0]> = {}) {
  const props = {
    labels,
    name: 'Alpha',
    onNameChange: vi.fn(),
    preset: 'earth',
    presetOptions,
    onPresetChange: vi.fn(),
    mass: 5.97e24,
    onMassChange: vi.fn(),
    velMag: 1000,
    onVelMagChange: vi.fn(),
    velDir: 90,
    onVelDirChange: vi.fn(),
    color: '#ff0000',
    onColorChange: vi.fn(),
    ...overrides,
  };
  render(<BodyFieldsForm {...props} />);
  return props;
}

describe('BodyFieldsForm', () => {
  it('renders every field label and the preset options', () => {
    renderForm();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Preset Template')).toBeDefined();
    expect(screen.getByText('Mass (kg)')).toBeDefined();
    expect(screen.getByText('Velocity Magnitude (m/s)')).toBeDefined();
    expect(screen.getByText('Velocity Angle (degrees)')).toBeDefined();
    expect(screen.getByText('Body Color')).toBeDefined();
    expect(screen.getByText('Earth-like Planet')).toBeDefined();
    expect(screen.getByText('Sun-like Star')).toBeDefined();
    expect(screen.getByText('#ff0000')).toBeDefined();
  });

  it('propagates the name field change', () => {
    const props = renderForm();
    fireEvent.change(screen.getByDisplayValue('Alpha'), { target: { value: 'Beta' } });
    expect(props.onNameChange).toHaveBeenCalledWith('Beta');
  });

  it('propagates the preset selection change', () => {
    const props = renderForm();
    fireEvent.change(screen.getByDisplayValue('Earth-like Planet'), { target: { value: 'sun' } });
    expect(props.onPresetChange).toHaveBeenCalledWith('sun');
  });

  it('parses a valid numeric mass input', () => {
    const props = renderForm();
    fireEvent.change(screen.getByDisplayValue('5.97e+24'), { target: { value: '3e23' } });
    expect(props.onMassChange).toHaveBeenCalledWith(3e23);
  });

  it('falls back to 0 for a non-numeric mass input', () => {
    const props = renderForm();
    fireEvent.change(screen.getByDisplayValue('5.97e+24'), { target: { value: '' } });
    expect(props.onMassChange).toHaveBeenCalledWith(0);
  });

  it('propagates velocity magnitude and direction changes', () => {
    const props = renderForm();
    fireEvent.change(screen.getByDisplayValue('1000'), { target: { value: '2500' } });
    expect(props.onVelMagChange).toHaveBeenCalledWith(2500);

    fireEvent.change(screen.getByDisplayValue('90'), { target: { value: '180' } });
    expect(props.onVelDirChange).toHaveBeenCalledWith(180);
  });

  it('propagates the color change', () => {
    const props = renderForm();
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });
    expect(props.onColorChange).toHaveBeenCalledWith('#00ff00');
  });
});
