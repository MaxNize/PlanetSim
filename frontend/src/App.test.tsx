import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('mounts the providers and layout without crashing', () => {
    const { container } = render(<App />);
    expect(container.querySelector('main')).not.toBeNull();
  });
});
