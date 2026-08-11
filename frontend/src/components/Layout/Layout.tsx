import React from 'react';
import { Simulator } from '../Simulator/Simulator';
import { useI18n } from '../../context/I18nContext';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';

/**
 * Layout component providing a responsive structure for the application.
 */
export function Layout() {
  const { t } = useI18n();

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#05070a',
        fontFamily: 'sans-serif',
      }}
    >
      <header
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          zIndex: 10,
          background: 'rgba(5, 7, 10, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '420px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{t('header.title')}</h1>
          <LanguageSelector />
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>{t('header.subtitle')}</p>
      </header>

      <Simulator />
    </main>
  );
}
