import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SandboxBodyItem, SandboxBodyItemLabels } from './SandboxBodyItem';
import { SandboxBody } from '../../types';

const labels: SandboxBodyItemLabels = {
  edit: 'Edit',
  delete: 'Delete',
  defaultName: 'Body',
  locked: 'Locked',
  track: 'Track',
  untrack: 'Untrack',
  showMiniview: 'Show miniview',
  hideMiniview: 'Hide miniview',
};

function makeBody(overrides: Partial<SandboxBody> = {}): SandboxBody {
  return {
    id: 'body-1',
    position: [0, 0],
    velocity: [0, 0],
    mass: 5.9722e24,
    radius: 6.371e6,
    color: '#fff',
    ...overrides,
  };
}

function renderItem(overrides: Partial<SandboxBody> = {}, propOverrides: Partial<Parameters<typeof SandboxBodyItem>[0]> = {}) {
  const handlers = {
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onTrackToggle: vi.fn(),
    onMiniviewToggle: vi.fn(),
  };
  const body = makeBody(overrides);
  render(<SandboxBodyItem body={body} isSelected={false} isTracked={false} isInMiniview={false} labels={labels} {...handlers} {...propOverrides} />);
  return { body, ...handlers };
}

describe('SandboxBodyItem', () => {
  it('falls back to the default name when the body has none', () => {
    renderItem();
    expect(screen.getByText('Body')).toBeDefined();
  });

  it('shows the given name and a lock indicator when locked', () => {
    renderItem({ name: 'Alpha', locked: true });
    expect(screen.getByText('Alpha')).toBeDefined();
    expect(screen.getByTitle('Locked')).toBeDefined();
  });

  it('selects the body when the row is clicked', () => {
    const { onSelect, body } = renderItem();
    fireEvent.click(screen.getByTestId(`body-item-${body.id}`));
    expect(onSelect).toHaveBeenCalledWith(body.id);
  });

  it('toggles tracking without bubbling to the row select handler', () => {
    const { onSelect, onTrackToggle, body } = renderItem();
    fireEvent.click(screen.getByTestId(`track-btn-${body.id}`));
    expect(onTrackToggle).toHaveBeenCalledWith(body);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('toggles the miniview without bubbling to the row select handler', () => {
    const { onSelect, onMiniviewToggle, body } = renderItem();
    fireEvent.click(screen.getByTestId(`miniview-btn-${body.id}`));
    expect(onMiniviewToggle).toHaveBeenCalledWith(body);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('opens the edit handler without bubbling to the row select handler', () => {
    const { onSelect, onEdit, body } = renderItem();
    fireEvent.click(screen.getByTestId(`edit-btn-${body.id}`));
    expect(onEdit).toHaveBeenCalledWith(body);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('deletes an unlocked body', () => {
    const { onDelete, body } = renderItem({ locked: false });
    fireEvent.click(screen.getByTestId(`delete-btn-${body.id}`));
    expect(onDelete).toHaveBeenCalledWith(body.id);
  });

  it('does not delete a locked body', () => {
    const { onDelete, body } = renderItem({ locked: true });
    fireEvent.click(screen.getByTestId(`delete-btn-${body.id}`));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('shows the untrack/hide-miniview titles when already tracked and in the miniview', () => {
    const { body } = renderItem({}, { isTracked: true, isInMiniview: true });
    expect(screen.getByTitle('Untrack')).toBeDefined();
    expect(screen.getByTitle('Hide miniview')).toBeDefined();
    expect(body).toBeDefined();
  });
});
