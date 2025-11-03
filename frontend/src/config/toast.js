/**
 * @file toast.js
 * @description Toast Configuration - Bildirim toast ayarları ve konfigürasyonları
 * 
 * Bu dosya, uygulama genelinde kullanılan toast (bildirim) bileşeninin
 * konfigürasyonlarını içerir. Sonner kütüphanesi kullanılarak toast bildirimleri
 * gösterilir. Light ve dark tema desteği sağlanır.
 * 
 * Ana Özellikler:
 * - Toast pozisyonu: Sağ üst köşe (top-right)
 * - Rich colors: Daha canlı renkler
 * - Close button: Kapatma butonu desteği
 * - Expand: Uzun mesajlarda kutunun genişlemesi
 * - Duration: Varsayılan 5 saniye gösterim süresi
 * - Offset: Viewport'un üstünden 20px boşluk
 * - Visible toasts: Maksimum 5 toast aynı anda görünür
 * - Glassmorphism: Modern blur efekti
 * - Fixed position: Sabit pozisyon ile scroll'dan bağımsız
 * - Theme support: Light ve dark tema desteği
 * 
 * Tema Desteği:
 * - Light mode: Açık arka plan, koyu metin
 * - Dark mode: Koyu arka plan, açık metin
 * - Auto mode: Sistem temasına göre otomatik seçim
 * 
 * Kullanım:
 * ```jsx
 * import { toastConfig, darkToastConfig, getToastConfig } from '@config/toast';
 * 
 * // Light tema için
 * <Toaster {...toastConfig} />
 * 
 * // Dark tema için
 * <Toaster {...darkToastConfig} />
 * 
 * // Otomatik tema seçimi
 * <Toaster {...getToastConfig('auto')} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * TOAST CONFIGURATION - Light tema toast ayarları
 * ============================================================================
 * 
 * Sonner Toaster bileşeni için varsayılan (light tema) ayarlar
 */
export const toastConfig = {
  position: "top-right", // Sağ üst köşeye taşı
  richColors: true, // daha canlı renkler
  closeButton: true,
  expand: true, // uzun mesajlarda kutuyu büyüt
  duration: 5000, // Varsayılan süre 5 saniye
  offset: "20px", // Viewport'un üstünden 20px
  // Toast'ların sabit kalması için
  visibleToasts: 5, // Maksimum görünür toast sayısı
  // Sonner'ın kendi viewport sabitleme özelliğini kullan
  toastOptions: {
    style: {
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      backdropFilter: "blur(10px)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      transition: "all 0.3s ease",
      maxWidth: "400px", // Daha kompakt
      minWidth: "300px", // Daha kompakt
      fontSize: "14px", // Biraz küçük font
      padding: "12px 16px", // Daha az padding
      position: "fixed", // Sabit pozisyon
      zIndex: 9999, // En üstte kalması için
    },
  },
};

/**
 * ============================================================================
 * DARK TOAST CONFIGURATION - Dark tema toast ayarları
 * ============================================================================
 * 
 * Dark mode için özelleştirilmiş toast konfigürasyonu
 * Light tema ayarlarını extend eder ve dark tema stillerini uygular
 */
export const darkToastConfig = {
  ...toastConfig,
  toastOptions: {
    ...toastConfig.toastOptions,
    style: {
      ...toastConfig.toastOptions.style,
      backgroundColor: "rgba(31, 41, 55, 0.95)", // Dark background
      border: "1px solid rgba(75, 85, 99, 0.3)",
      color: "rgba(243, 244, 246, 0.9)", // Light text
      position: "fixed", // Sabit pozisyon
      zIndex: 9999, // En üstte kalması için
    },
  },
};

/**
 * ============================================================================
 * TOAST CONFIG HELPER - Tema bazlı toast konfigürasyonu getirme
 * ============================================================================
 * 
 * Belirtilen temaya göre uygun toast konfigürasyonunu döndürür
 * 
 * Parametreler:
 * @param {string} theme - Tema tipi ('light', 'dark', 'auto')
 *                        - 'light': Açık tema konfigürasyonu
 *                        - 'dark': Koyu tema konfigürasyonu
 *                        - 'auto': Sistem temasına göre otomatik seçim (varsayılan)
 * 
 * Dönüş:
 * @returns {object} Toast konfigürasyon objesi
 * 
 * Örnek:
 * ```jsx
 * const config = getToastConfig('dark');
 * <Toaster {...config} />
 * ```
 */
export const getToastConfig = (theme = 'auto') => {
  if (theme === 'dark') {
    return darkToastConfig;
  }
  
  if (theme === 'auto') {
    // Sistem temasını kontrol et
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? darkToastConfig : toastConfig;
  }
  
  return toastConfig;
};

export default toastConfig;
