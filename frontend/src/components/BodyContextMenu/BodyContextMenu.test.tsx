import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BodyContextMenu } from './BodyContextMenu';
import { SandboxBody } from '../../types';
import { I18nProvider } from '../../context/I18nContext';

const mockBody: SandboxBody = {
  id: 'test-body-1',
  name: 'Planet X',
  position: [0, 0],
  velocity: [0, 0],
  mass: 5.9722e24,
  radius: 6.371e6,
  color: '#00a8ff',
  locked: false,
};

describe('BodyContextMenu Component', () => {
  it('renders menu items and body title correctly', () => {
    render(
      <I18nProvider>
        <BodyContextMenu
          body={mockBody}
          position={{ x: 100, y: 100 }}
          onEdit={vi.fn()}
          onLockToggle={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />
      </I18nProvider>,
    );

    expect(screen.getByText('Planet X')).toBeInTheDocument();
    expect(screen.getByText('✏️ Edit')).toBeInTheDocument();
    expect(screen.getByText('🔒 Lock')).toBeInTheDocument();
    expect(screen.getByText('❌ Delete')).toBeInTheDocument();
  });

  it('triggers onEdit callback when clicking edit option', () => {
    const handleEdit = vi.fn();
    const handleClose = vi.fn();

    render(
      <I18nProvider>
        <BodyContextMenu
          body={mockBody}
          position={{ x: 100, y: 100 }}
          onEdit={handleEdit}
          onLockToggle={vi.fn()}
          onDelete={vi.fn()}
          onClose={handleClose}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByText('✏️ Edit'));
    expect(handleEdit).toHaveBeenCalledWith(mockBody);
    expect(handleClose).toHaveBeenCalled();
  });

  it('triggers onLockToggle callback when clicking lock option', () => {
    const handleLock = vi.fn();

    render(
      <I18nProvider>
        <BodyContextMenu
          body={mockBody}
          position={{ x: 100, y: 100 }}
          onEdit={vi.fn()}
          onLockToggle={handleLock}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByText('🔒 Lock'));
    expect(handleLock).toHaveBeenCalledWith(mockBody);
  });

  it('disables delete button when body is locked', () => {
    const handleDelete = vi.fn();

    render(
      <I18nProvider>
        <BodyContextMenu
          body={{ ...mockBody, locked: true }}
          position={{ x: 100, y: 100 }}
          onEdit={vi.fn()}
          onLockToggle={vi.fn()}
          onDelete={handleDelete}
          onClose={vi.fn()}
        />
      </I18nProvider>,
    );

    const deleteBtn = screen.getByText('❌ Delete');
    expect(deleteBtn).toBeDisabled();
    fireEvent.click(deleteBtn);
    expect(handleDelete).not.toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    const handleClose = vi.fn();

    render(
      <I18nProvider>
        <BodyContextMenu
          body={mockBody}
          position={{ x: 100, y: 100 }}
          onEdit={vi.fn()}
          onLockToggle={vi.fn()}
          onDelete={vi.fn()}
          onClose={handleClose}
        />
      </I18nProvider>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});
