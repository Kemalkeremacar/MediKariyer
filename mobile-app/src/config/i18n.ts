/**
 * @file i18n.ts
 * @description i18next konfigürasyonu - Sadece Türkçe dil desteği
 * 
 * Desteklenen Diller:
 * - tr: Türkçe (varsayılan ve tek dil)
 * 
 * Not: Uygulama sadece Türkçe dilinde hizmet vermektedir.
 * Cihaz dili ne olursa olsun, uygulama Türkçe görüntülenir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation dosyaları
import tr from '../locales/tr.json';

// i18next konfigürasyonu
const initI18n = async () => {
  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        tr: { translation: tr },
      },
      lng: 'tr', // Her zaman Türkçe
      fallbackLng: 'tr', // Fallback da Türkçe
      interpolation: {
        escapeValue: false, // React zaten XSS koruması yapıyor
      },
      react: {
        useSuspense: false, // React Native için suspense kapalı
      },
    });
};

// Mevcut dili al (her zaman Türkçe)
export const getCurrentLanguage = (): string => {
  return 'tr';
};

// i18n'i başlat
initI18n();

export default i18n;
