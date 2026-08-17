import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SandboxControls } from './SandboxControls';
import { SandboxBody } from '../../types';
import { MAX_SANDBOX_BODIES } from '../../context/useSandbox';

const contextMock = {
  sandboxBodies: [] as SandboxBody[],
  removeBody: vi.fn(),
  updateBody: vi.fn(),
  setMode: vi.fn(),
  selectedBodyId: null as string | null,
  setSelectedBodyId: vi.fn(),
  trackedBodyId: null as string | null,
  toggleTracking: vi.fn(),
  miniviewBodyId: null as string | null,
  toggleMiniview: vi.fn(),
};

vi.mock('../../context/SimulationContext', () => ({
  useSimulationContext: () => contextMock,
}));

function makeBody(id: string, overrides: Partial<SandboxBody> = {}): SandboxBody {
  return { id, name: id, position: [0, 0], velocity: [0, 0], mass: 1, radius: 1, color: '#fff', ...overrides };
}

describe('SandboxControls', () => {
  beforeEach(() => {
    contextMock.sandboxBodies = [];
    contextMock.selectedBodyId = null;
    contextMock.trackedBodyId = null;
    contextMock.miniviewBodyId = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders one row per sandbox body and the body count', () => {
    contextMock.sandboxBodies = [makeBody('a'), makeBody('b')];
    render(<SandboxControls />);
    expect(screen.getByText(`2/${MAX_SANDBOX_BODIES}`, { exact: false })).toBeDefined();
    expect(screen.getByTestId('body-item-a')).toBeDefined();
    expect(screen.getByTestId('body-item-b')).toBeDefined();
  });

  it('shows the high-count warning once at least half the cap is reached', () => {
    contextMock.sandboxBodies = Array.from({ length: Math.ceil(MAX_SANDBOX_BODIES * 0.5) }, (elementIgnored, i) => makeBody(`b${i}`));
    render(<SandboxControls />);
    expect(screen.getByText(/High body count/)).toBeDefined();
  });

  it('uses the controlled selectedBodyId prop over context state when provided', () => {
    contextMock.sandboxBodies = [makeBody('a')];
    contextMock.selectedBodyId = null;
    const onSelectBody = vi.fn();
    render(<SandboxControls selectedBodyId="a" onSelectBody={onSelectBody} />);

    fireEvent.click(screen.getByTestId('body-item-a'));
    expect(onSelectBody).toHaveBeenCalledWith(null);
    expect(contextMock.setSelectedBodyId).toHaveBeenCalledWith(null);
  });

  it('deselects via context state when no controlled prop is given and the same body is re-selected', () => {
    contextMock.sandboxBodies = [makeBody('a')];
    contextMock.selectedBodyId = 'a';
    render(<SandboxControls />);

    fireEvent.click(screen.getByTestId('body-item-a'));
    expect(contextMock.setSelectedBodyId).toHaveBeenCalledWith(null);
  });

  it('opens and cancels the edit dialog for a body', () => {
    contextMock.sandboxBodies = [makeBody('a')];
    render(<SandboxControls />);

    fireEvent.click(screen.getByTestId('edit-btn-a'));
    expect(screen.getByText('Edit Celestial Body')).toBeDefined();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Edit Celestial Body')).toBeNull();
  });

  it('resets to 3-body mode when the reset button is confirmed', () => {
    contextMock.sandboxBodies = [];
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SandboxControls />);

    fireEvent.click(screen.getByText('Exit Sandbox'));
    expect(contextMock.setMode).toHaveBeenCalledWith('3body');
  });

  it('does not reset when the confirmation is declined', () => {
    contextMock.sandboxBodies = [];
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<SandboxControls />);

    fireEvent.click(screen.getByText('Exit Sandbox'));
    expect(contextMock.setMode).not.toHaveBeenCalled();
  });
});
