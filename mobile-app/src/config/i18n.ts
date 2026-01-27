/**
 * @file i18n.ts
 * @description i18next konfigürasyonu - Minimal çoklu dil desteği
 * 
 * Desteklenen Diller:
 * - tr: Türkçe (varsayılan)
 * - en: İngilizce
 * 
 * Kapsam:
 * - Auth ekranları (Login, Register, ForgotPassword)
 * - Onboarding ekranları
 * - Error mesajları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation dosyaları
import tr from '../locales/tr.json';
import en from '../locales/en.json';

// Storage key
const LANGUAGE_KEY = 'app_language';

// Cihaz dilini al ve desteklenen dillere map et
const getDeviceLanguage = (): string => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'tr'; // "tr", "en"
  
  // Desteklenen diller
  const supportedLanguages = ['tr', 'en'];
  
  // Cihaz dili destekleniyorsa kullan, yoksa Türkçe
  return supportedLanguages.includes(deviceLocale) ? deviceLocale : 'tr';
};

// Kaydedilmiş dili al veya cihaz dilini kullan
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || getDeviceLanguage();
  } catch {
    return getDeviceLanguage();
  }
};

// i18next konfigürasyonu
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        tr: { translation: tr },
        en: { translation: en },
      },
      lng: initialLanguage,
      fallbackLng: 'tr',
      interpolation: {
        escapeValue: false, // React zaten XSS koruması yapıyor
      },
      react: {
        useSuspense: false, // React Native için suspense kapalı
      },
    });
};

// Dil değiştirme fonksiyonu
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

// Mevcut dili al
export const getCurrentLanguage = (): string => {
  return i18n.language || 'tr';
};

// i18n'i başlat
initI18n();

export default i18n;
