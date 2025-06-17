import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fi from './locales/fi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fi: { translation: fi }
    },
    fallbackLng: 'en',

        detection: {
      // Auto-detect browser language first, fallback to en
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']  // Saves chosen language in browser
    },
    interpolation: {
      escapeValue: false
    }
  });

  
// Set the <html lang="xx"> tag dynamically
document.documentElement.lang = i18n.language;

export default i18n;
