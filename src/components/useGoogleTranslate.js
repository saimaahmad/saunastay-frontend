import { useEffect } from 'react';

export default function useGoogleTranslate() {
  useEffect(() => {
    const initTranslate = () => {
      if (
        window.google &&
        window.google.translate &&
        typeof window.google.translate.TranslateElement === 'function'
      ) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fi,sv,et',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      }
    };

    // Wait a bit to ensure the DOM element exists
    const timeout = setTimeout(() => {
      initTranslate();
    }, 500); // Delay slightly to wait for DOM to be ready

    return () => clearTimeout(timeout);
  }, []);
}
