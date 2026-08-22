import { de } from './locales/de';
import { en } from './locales/en';
import { it } from './locales/it';
import { tlh } from './locales/tlh';

export type Language = 'en' | 'de' | 'it' | 'tlh';

export const translations: Record<Language, Record<string, string>> = {
  en,
  de,
  it,
  tlh,
};
