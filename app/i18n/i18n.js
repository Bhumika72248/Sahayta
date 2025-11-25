import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import hi from './hi.json';
import regional from './regional.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  regional: { translation: regional }
};

export const initializeI18n = () => {
  const locale = Localization.locale || 'en-US';
  const language = locale.split('-')[0] || 'en';
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
};

export default i18n;