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

function renderMenu(overrides: Partial<React.ComponentProps<typeof BodyContextMenu>> = {}) {
  const props: React.ComponentProps<typeof BodyContextMenu> = {
    body: mockBody,
    position: { x: 100, y: 100 },
    showFullMenu: true,
    isTracked: false,
    onTrackToggle: vi.fn(),
    onEdit: vi.fn(),
    onLockToggle: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(
    <I18nProvider>
      <BodyContextMenu {...props} />
    </I18nProvider>,
  );
  return props;
}

describe('BodyContextMenu Component', () => {
  it('renders menu items and body title correctly', () => {
    renderMenu();

    expect(screen.getByText('Planet X')).toBeInTheDocument();
    expect(screen.getByText('✏️ Edit')).toBeInTheDocument();
    expect(screen.getByText('🔒 Lock')).toBeInTheDocument();
    expect(screen.getByText('❌ Delete')).toBeInTheDocument();
  });

  it('triggers onEdit callback when clicking edit option', () => {
    const props = renderMenu();

    fireEvent.click(screen.getByText('✏️ Edit'));
    expect(props.onEdit).toHaveBeenCalledWith(mockBody);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('triggers onLockToggle callback when clicking lock option', () => {
    const props = renderMenu();

    fireEvent.click(screen.getByText('🔒 Lock'));
    expect(props.onLockToggle).toHaveBeenCalledWith(mockBody);
  });

  it('disables delete button when body is locked', () => {
    const props = renderMenu({ body: { ...mockBody, locked: true } });

    const deleteBtn = screen.getByText('❌ Delete');
    expect(deleteBtn).toBeDisabled();
    fireEvent.click(deleteBtn);
    expect(props.onDelete).not.toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    const props = renderMenu();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('shows Track and triggers onTrackToggle when not yet tracked (FP-36)', () => {
    const props = renderMenu({ isTracked: false });

    fireEvent.click(screen.getByText(/Track/));
    expect(props.onTrackToggle).toHaveBeenCalledWith(mockBody);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('shows Untrack when already tracked', () => {
    renderMenu({ isTracked: true });

    expect(screen.getByText(/Untrack/)).toBeInTheDocument();
  });

  it('hides Edit/Lock/Delete and only shows Track when showFullMenu is false (preset mode, FP-36)', () => {
    renderMenu({ showFullMenu: false });

    expect(screen.getByText(/Track/)).toBeInTheDocument();
    expect(screen.queryByText('✏️ Edit')).toBeNull();
    expect(screen.queryByText('🔒 Lock')).toBeNull();
    expect(screen.queryByText('❌ Delete')).toBeNull();
  });
});
