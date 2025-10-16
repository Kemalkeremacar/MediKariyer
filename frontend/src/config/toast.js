/**
 * Toast Configuration
 * Toast ayarları ve konfigürasyonları
 */

/**
 * Toast konfigürasyonu
 * Sonner Toaster bileşeni için ayarlar
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
 * Dark mode için toast konfigürasyonu
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
 * Toast konfigürasyonunu tema göre döndürür
 * @param {string} theme - Tema ('light', 'dark', 'auto')
 * @returns {object} - Toast konfigürasyonu
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
