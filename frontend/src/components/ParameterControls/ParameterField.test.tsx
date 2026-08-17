import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterField } from './ParameterField';

function renderField(overrides: Partial<Parameters<typeof ParameterField>[0]> = {}) {
  const props = {
    label: 'Mass',
    value: '1.000e+24',
    onChangeText: vi.fn(),
    onCommit: vi.fn(),
    sliderMin: 21,
    sliderMax: 33,
    sliderVal: 24,
    onSliderChange: vi.fn(),
    ...overrides,
  };
  render(<ParameterField {...props} />);
  return props;
}

describe('ParameterField', () => {
  it('renders the label and hint when provided', () => {
    renderField({ hint: '1.000 M⊕' });
    expect(screen.getByText('Mass')).toBeDefined();
    expect(screen.getByText('≈ 1.000 M⊕')).toBeDefined();
  });

  it('omits the hint element when none is provided', () => {
    renderField();
    expect(screen.queryByText(/≈/)).toBeNull();
  });

  it('calls onChangeText as the text input changes', () => {
    const props = renderField();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '2.000e+24' } });
    expect(props.onChangeText).toHaveBeenCalledWith('2.000e+24');
  });

  it('commits on blur', () => {
    const props = renderField();
    fireEvent.blur(screen.getByRole('textbox'));
    expect(props.onCommit).toHaveBeenCalled();
  });

  it('commits and blurs on Enter', () => {
    const props = renderField();
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(props.onCommit).toHaveBeenCalled();
  });

  it('does not commit on other keys', () => {
    const props = renderField();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(props.onCommit).not.toHaveBeenCalled();
  });

  it('calls onSliderChange with a parsed numeric value', () => {
    const props = renderField();
    const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '27.5' } });
    expect(props.onSliderChange).toHaveBeenCalledWith(27.5);
  });
});
