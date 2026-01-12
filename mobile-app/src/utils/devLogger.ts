/**
 * @file devLogger.ts
 * @description Sadece development modunda loglama utility'si
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Loglar sadece __DEV__ true olduğunda çıktı verir
 * - Production build'lerinde otomatik olarak kaldırılır
 * 
 * **Gereksinimler:**
 * - 9.3: Development modunda lifecycle event'lerini loglama
 * - 9.5: Production build'lerinde logların kaldırılmasını sağlama
 */

// ============================================================================
// DEV LOGGER CLASS
// ============================================================================

class DevLogger {
  private enabled: boolean;

  constructor() {
    this.enabled = __DEV__;
  }

  /**
   * Genel log mesajı
   */
  log(...args: any[]): void {
    if (this.enabled) {
      console.log('[DEV]', ...args);
    }
  }

  /**
   * Bilgi mesajı
   */
  info(...args: any[]): void {
    if (this.enabled) {
      console.info('[DEV]', ...args);
    }
  }

  /**
   * Uyarı mesajı
   */
  warn(...args: any[]): void {
    if (this.enabled) {
      console.warn('[DEV]', ...args);
    }
  }

  /**
   * Hata mesajı
   */
  error(...args: any[]): void {
    if (this.enabled) {
      console.error('[DEV]', ...args);
    }
  }

  /**
   * Debug mesajı
   */
  debug(...args: any[]): void {
    if (this.enabled) {
      console.debug('[DEV]', ...args);
    }
  }

  /**
   * Koşullu loglama - özel koşul ile
   */
  logIf(condition: boolean, ...args: any[]): void {
    if (this.enabled && condition) {
      console.log('[DEV]', ...args);
    }
  }
}

export const devLog = new DevLogger();

// ============================================================================
// OVERLAY SYSTEM LOGGING UTILITIES
// ============================================================================

/**
 * Overlay System Development Loglama Utility'leri
 * 
 * Bu utility'ler overlay sistemi (Alert, Toast, Modal) için
 * sadece development modunda loglama sağlar. Özellikleri:
 * - Lifecycle event'lerini loglar (show, hide, callback execution)
 * - Production build'lerinde tamamen kaldırılır
 * - Sistem prefix'i ile tutarlı formatlama sağlar
 * 
 * **Gereksinimler:**
 * - 9.3: Development modunda lifecycle event'lerini loglama
 * - 9.5: Production build'lerinde logların kaldırılmasını sağlama
 */

/**
 * Overlay sistemi için sadece development modunda log fonksiyonu
 * [Overlay System] prefix'i ile bilgi mesajları loglar
 * 
 * @param message - Loglanacak mesaj
 * @param data - Opsiyonel ek veri
 */
export const overlayDevLog = (message: string, data?: unknown): void => {
  if (__DEV__) {
    if (data !== undefined) {
      console.log(`[Overlay System] ${message}`, data);
    } else {
      console.log(`[Overlay System] ${message}`);
    }
  }
};

/**
 * Overlay sistemi için sadece development modunda uyarı fonksiyonu
 * [Overlay System] prefix'i ile uyarı mesajları loglar
 * 
 * @param message - Uyarı mesajı
 * @param data - Opsiyonel ek veri
 */
export const overlayDevWarn = (message: string, data?: unknown): void => {
  if (__DEV__) {
    if (data !== undefined) {
      console.warn(`[Overlay System] ${message}`, data);
    } else {
      console.warn(`[Overlay System] ${message}`);
    }
  }
};

/**
 * Overlay sistemi için sadece development modunda hata fonksiyonu
 * [Overlay System] prefix'i ile hata mesajları loglar
 * 
 * @param message - Hata mesajı
 * @param error - Opsiyonel hata objesi
 */
export const overlayDevError = (message: string, error?: unknown): void => {
  if (__DEV__) {
    if (error !== undefined) {
      console.error(`[Overlay System] ${message}`, error);
    } else {
      console.error(`[Overlay System] ${message}`);
    }
  }
};
