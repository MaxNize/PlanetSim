import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { I18nProvider, useI18n } from './I18nContext';

function TestComponent() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="title">{t('header.title')}</span>
      <button data-testid="btn-de" onClick={() => setLanguage('de')}>
        DE
      </button>
      <button data-testid="btn-it" onClick={() => setLanguage('it')}>
        IT
      </button>
      <button data-testid="btn-tlh" onClick={() => setLanguage('tlh')}>
        TLH
      </button>
    </div>
  );
}

describe('I18nContext and I18nProvider', () => {
  it('should provide default english translations and support language switching', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>,
    );

    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('title').textContent).toBe('Restricted 3-Body Planet Simulation');

    act(() => {
      screen.getByTestId('btn-de').click();
    });

    expect(screen.getByTestId('lang').textContent).toBe('de');
    expect(screen.getByTestId('title').textContent).toBe('Eingeschränkte 3-Körper-Planeten-Simulation');

    act(() => {
      screen.getByTestId('btn-it').click();
    });

    expect(screen.getByTestId('lang').textContent).toBe('it');
    expect(screen.getByTestId('title').textContent).toBe('Simulazione a 3 Corpi Ristretta');

    act(() => {
      screen.getByTestId('btn-tlh').click();
    });

    expect(screen.getByTestId('lang').textContent).toBe('tlh');
    expect(screen.getByTestId('title').textContent).toBe('3-Hov System SeHlaw Quj');
  });

  it('returns the raw key when it is missing from both the active language and English', () => {
    function MissingKeyComponent() {
      const { t } = useI18n();
      return <span data-testid="missing">{t('this.key.does.not.exist')}</span>;
    }

    render(
      <I18nProvider>
        <MissingKeyComponent />
      </I18nProvider>,
    );

    expect(screen.getByTestId('missing').textContent).toBe('this.key.does.not.exist');
  });
});
