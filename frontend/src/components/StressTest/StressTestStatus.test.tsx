import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StressTestStatus } from './StressTestStatus';

describe('StressTestStatus', () => {
  it('renders the active body count and fps', () => {
    render(<StressTestStatus activeBodyCount={42} fps={60} />);
    expect(screen.getByText(/42/)).toBeDefined();
    expect(screen.getByText(/60 FPS/)).toBeDefined();
  });

  it('colors the fps green when smooth (>= 55)', () => {
    render(<StressTestStatus activeBodyCount={0} fps={60} />);
    expect(screen.getByText('60 FPS').style.color).toBe('rgb(46, 213, 115)');
  });

  it('colors the fps yellow when moderate (30-54)', () => {
    render(<StressTestStatus activeBodyCount={0} fps={40} />);
    expect(screen.getByText('40 FPS').style.color).toBe('rgb(254, 202, 87)');
  });

  it('colors the fps red when laggy (< 30)', () => {
    render(<StressTestStatus activeBodyCount={0} fps={10} />);
    expect(screen.getByText('10 FPS').style.color).toBe('rgb(255, 107, 107)');
  });
});
