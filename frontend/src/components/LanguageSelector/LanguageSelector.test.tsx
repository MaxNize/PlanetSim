import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from './LanguageSelector';
import { I18nProvider } from '../../context/I18nContext';

describe('LanguageSelector', () => {
  it('renders all supported languages with English selected by default', () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>,
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- required for tsc; getByLabelText's declared return type is the broader HTMLElement.
    const select = screen.getByLabelText('Language selector') as HTMLSelectElement;
    expect(select.value).toBe('en');
    expect(screen.getByText(/Deutsch/)).toBeDefined();
    expect(screen.getByText(/Italiano/)).toBeDefined();
    expect(screen.getByText(/Klingon/)).toBeDefined();
  });

  it('switches the active language when a different option is selected', () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>,
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- required for tsc; getByLabelText's declared return type is the broader HTMLElement.
    const select = screen.getByLabelText('Language selector') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: 'de' } });

    expect(select.value).toBe('de');
  });
});
