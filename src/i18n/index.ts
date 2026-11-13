/**
 * i18next setup. Resources come straight from the Designer's copy deck (OMX-024 AC6) —
 * `design/copy-deck.json` is the single source of truth for every UI string.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import deck from '../../design/copy-deck.json';
import type { Language } from '../domain/types';

export function detectLanguage(): Language {
  const first =
    (typeof navigator !== 'undefined' && (navigator.languages?.[0] ?? navigator.language)) || '';
  return first.toLowerCase().startsWith('th') ? 'th' : 'en';
}

export function initI18n(lang: Language): typeof i18n {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources: { th: { translation: deck.th }, en: { translation: deck.en } },
      lng: lang,
      fallbackLng: false,
      interpolation: { escapeValue: false }, // React escapes
      returnNull: false,
      saveMissing: false,
      missingKeyHandler: (_lngs, _ns, key) => console.warn(`[i18n] missing key: ${key}`),
    });
  } else if (i18n.language !== lang) {
    void i18n.changeLanguage(lang);
  }
  document.documentElement.lang = lang;
  return i18n;
}

export default i18n;
