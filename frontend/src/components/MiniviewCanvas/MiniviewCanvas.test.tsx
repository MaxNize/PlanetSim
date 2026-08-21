import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { simulationContext, DEFAULT_INITIAL_STATE } from '../../context/SimulationContext';
import { simulationAnimationContext } from '../../context/SimulationAnimationContext';
import { MiniviewCanvas } from './MiniviewCanvas';
import * as CanvasRendererModule from '../../services/CanvasRenderer';

const body = { ...DEFAULT_INITIAL_STATE.primary, id: 'body-0', name: 'Focus Body', color: '#fff' };

function renderMiniview() {
  const mockContextValue = {
    currentState: { ...DEFAULT_INITIAL_STATE, bodies: [body] },
    trailHistory: { primary: [], secondary: [], testParticle: [] },
    lagrangePoints: null,
    selectedBodyId: null,
  };
  render(
    <simulationContext.Provider value={mockContextValue as any}>
      <simulationAnimationContext.Provider value={mockContextValue as any}>
        <MiniviewCanvas bodyId="body-0" onClose={vi.fn()} />
      </simulationAnimationContext.Provider>
    </simulationContext.Provider>,
  );
}

describe('MiniviewCanvas (FP-37)', () => {
  it('renders the body name and a canvas', () => {
    renderMiniview();
    expect(screen.getByLabelText('Body miniview')).toBeDefined();
    expect(screen.getByText(/Focus Body/)).toBeDefined();
  });

  it('zooms out on wheel-down and back in on wheel-up', () => {
    const rectSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ width: 220, height: 160, left: 0, top: 0, right: 220, bottom: 160, x: 0, y: 0, toJSON: () => ({}) });
    const drawSpy = vi.spyOn(CanvasRendererModule.CanvasRenderer.prototype, 'draw').mockImplementation(() => {});
    renderMiniview();
    const canvasElement = screen.getByLabelText('Body miniview');

    const initialScale = drawSpy.mock.calls[drawSpy.mock.calls.length - 1][4].scale;

    fireEvent.wheel(canvasElement, { deltaY: 100 });
    const zoomedOutScale = drawSpy.mock.calls[drawSpy.mock.calls.length - 1][4].scale;
    expect(zoomedOutScale).toBeLessThan(initialScale);

    fireEvent.wheel(canvasElement, { deltaY: -100 });
    fireEvent.wheel(canvasElement, { deltaY: -100 });
    const zoomedInScale = drawSpy.mock.calls[drawSpy.mock.calls.length - 1][4].scale;
    expect(zoomedInScale).toBeGreaterThan(zoomedOutScale);

    drawSpy.mockRestore();
    rectSpy.mockRestore();
  });
});
