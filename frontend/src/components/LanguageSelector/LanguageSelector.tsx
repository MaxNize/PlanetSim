import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { Language } from '../../i18n/translations';

const SELECTOR_STYLE = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '6px',
  color: '#ffffff',
  padding: '4px 8px',
  fontSize: '12px',
  fontFamily: "'Outfit', sans-serif",
  cursor: 'pointer',
  outline: 'none',
} as const;

/** Renders a dropdown component for selecting the application language (EN, DE, IT). */
export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} style={SELECTOR_STYLE} aria-label="Language selector">
      <option value="en" style={{ background: '#0f172a' }}>
        🇬🇧 English
      </option>
      <option value="de" style={{ background: '#0f172a' }}>
        🇩🇪 Deutsch
      </option>
      <option value="it" style={{ background: '#0f172a' }}>
        🇮🇹 Italiano
      </option>
    </select>
  );
}
