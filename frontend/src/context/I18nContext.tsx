import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, translations } from '../i18n/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const defaultT = (key: string): string => translations.en[key] || key;

const i18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: defaultT,
});

/** Provider component that manages the active language state and translation resolution. */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[language];
      if (dict && dict[key] !== undefined) {
        return dict[key];
      }
      return translations.en[key] || key;
    },
    [language],
  );

  return <i18nContext.Provider value={{ language, setLanguage, t }}>{children}</i18nContext.Provider>;
}

/** Hook to consume the i18n context values. */
export function useI18n() {
  return useContext(i18nContext);
}
