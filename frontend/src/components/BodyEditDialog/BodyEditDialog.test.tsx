import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BodyEditDialog } from './BodyEditDialog';
import { SandboxBody } from '../../types';
import { I18nProvider } from '../../context/I18nContext';

const mockBody: SandboxBody = {
  id: 'body-test',
  name: 'Alpha Planet',
  position: [1e8, 0],
  velocity: [0, 30000],
  mass: 5.9722e24,
  radius: 6.371e6,
  color: '#00a8ff',
  locked: false,
};

describe('BodyEditDialog Component', () => {
  it('renders initial body properties in dialog inputs', () => {
    render(
      <I18nProvider>
        <BodyEditDialog body={mockBody} onConfirm={vi.fn()} onCancel={vi.fn()} />
      </I18nProvider>,
    );

    expect(screen.getByDisplayValue('Alpha Planet')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5.9722e+24')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30000')).toBeInTheDocument();
  });

  it('calls onConfirm with modified values on form submission', () => {
    const handleConfirm = vi.fn();

    render(
      <I18nProvider>
        <BodyEditDialog body={mockBody} onConfirm={handleConfirm} onCancel={vi.fn()} />
      </I18nProvider>,
    );

    const nameInput = screen.getByDisplayValue('Alpha Planet');
    fireEvent.change(nameInput, { target: { value: 'Beta Star' } });

    const lockCheckbox = screen.getByLabelText(/Locked/i);
    fireEvent.click(lockCheckbox);

    fireEvent.click(screen.getByText('Confirm'));

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'body-test',
        name: 'Beta Star',
        locked: true,
      }),
    );
  });

  it('calls onCancel when Cancel button or Escape key is pressed', () => {
    const handleCancel = vi.fn();

    render(
      <I18nProvider>
        <BodyEditDialog body={mockBody} onConfirm={vi.fn()} onCancel={handleCancel} />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(2);
  });
});
