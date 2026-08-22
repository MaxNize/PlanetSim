import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BodyDialog } from './BodyDialog';
import { SandboxBody } from '../../types';

const editBody: SandboxBody = {
  id: 'body-1',
  name: 'Alpha',
  position: [1e8, 0],
  velocity: [100, 0],
  mass: 5.9722e24,
  radius: 6.371e6,
  color: '#00a8ff',
  locked: false,
};

describe('BodyDialog edit mode', () => {
  it('seeds fields from the existing body and confirms an update', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<BodyDialog mode="edit" body={editBody} onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByTestId('body-edit-dialog')).toBeDefined();
    expect(screen.getByDisplayValue('Alpha')).toBeDefined();

    fireEvent.click(screen.getByText(/confirm/i));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: 'body-1', name: 'Alpha' }));
  });

  it('applies a non-custom preset, overwriting mass and color', () => {
    const onConfirm = vi.fn();
    render(<BodyDialog mode="edit" body={editBody} onConfirm={onConfirm} onCancel={vi.fn()} />);

    const presetSelect = screen.getByDisplayValue(/custom/i);
    fireEvent.change(presetSelect, { target: { value: 'moon' } });

    fireEvent.click(screen.getByText(/confirm/i));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ mass: 7.348e22, color: '#dcdde1' }));
  });

  it('toggles the locked checkbox', () => {
    const onConfirm = vi.fn();
    render(<BodyDialog mode="edit" body={editBody} onConfirm={onConfirm} onCancel={vi.fn()} />);

    const checkbox = screen.getByRole<HTMLInputElement>('checkbox');
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    fireEvent.click(screen.getByText(/confirm/i));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ locked: true }));
  });

  it('closes without confirming on Escape or overlay click', () => {
    const onCancel = vi.fn();
    render(<BodyDialog mode="edit" body={editBody} onConfirm={vi.fn()} onCancel={onCancel} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/cancel/i));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});

describe('BodyDialog place mode', () => {
  it('seeds defaults for a newly placed body and confirms creation', () => {
    const onConfirm = vi.fn();
    render(<BodyDialog mode="place" position={[2e8, 3e8]} initialVelocity={[100, 200]} onConfirm={onConfirm} onCancel={vi.fn()} />);

    expect(screen.queryByTestId('body-edit-dialog')).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();

    fireEvent.click(screen.getByText(/confirm/i));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ position: [2e8, 3e8] }));
  });

  it('resets the preset to custom when the name is edited manually', () => {
    const onConfirm = vi.fn();
    render(<BodyDialog mode="place" position={[0, 0]} onConfirm={onConfirm} onCancel={vi.fn()} />);

    const nameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(nameInput, { target: { value: 'My Custom Planet' } });

    fireEvent.click(screen.getByText(/confirm/i));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ name: 'My Custom Planet' }));
  });
});
