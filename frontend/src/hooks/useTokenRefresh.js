/**
 * @file useTokenRefresh.js
 * @description Token Refresh Hooks - JWT token yönetimi ve otomatik yenileme
 * 
 * Bu dosya, uygulama genelinde kullanılan JWT token yönetimi için custom hook'ları içerir.
 * Token'ların otomatik yenilenmesi, session timeout yönetimi ve token geçerliliği
 * kontrolleri sağlar.
 * 
 * Hook'lar:
 * 1. useTokenRefresh: Otomatik token yenileme ve monitoring
 * 2. useSessionTimeout: Kullanıcı aktivitesi takibi ve session timeout yönetimi
 * 
 * Ana Özellikler:
 * - Otomatik token yenileme: Token süresi dolmadan önce otomatik yenileme
 * - Expiration tabanlı yenileme: Token expiration time'a göre akıllı yenileme
 * - Visibility change kontrolü: Tab değişikliğinde token geçerliliği kontrolü
 * - Focus kontrolü: Window focus'da token geçerliliği kontrolü
 * - Session timeout: Kullanıcı aktivitesi takibi ile session yönetimi
 * - Activity tracking: Mouse, keyboard, scroll, touch event'leri ile aktivite takibi
 * - Throttling: Event handler'lar için throttling ile performans optimizasyonu
 * 
 * Token Yenileme Stratejisi:
 * - Token expiration time'dan 10 dakika önce otomatik yenileme
 * - JWT payload'dan expiration time okunur
 * - setTimeout ile yenileme zamanlanır
 * - Her token değişikliğinde yeni zamanlama yapılır
 * 
 * Güvenlik Özellikleri:
 * - Token geçerliliği kontrolü (JWT decode ile)
 * - Expired token kontrolü
 * - Otomatik logout (token geçersizse)
 * - Clear auth state (güvenlik ihlali durumunda)
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * import { useTokenRefresh, useSessionTimeout } from '@/hooks/useTokenRefresh';
 * 
 * function App() {
 *   useTokenRefresh();
 *   useSessionTimeout(30); // 30 dakika
 *   return <div>App</div>;
 * }
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import { useEffect, useRef, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { apiRequest } from '../services/http/client';
import { ENDPOINTS } from '@config/api.js';
import logger from '../utils/logger';
import { jwtDecode } from 'jwt-decode';

// ============================================================================
// UTILITY FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

/**
 * Token geçerliliğini kontrol eden yardımcı fonksiyon
 * 
 * JWT token'ı decode eder ve expiration time'ını kontrol eder
 * 
 * Parametreler:
 * @param {string} token - JWT token string
 * 
 * Dönüş:
 * @returns {boolean} Token geçerli ise true, geçersiz ise false
 * 
 * Validasyon:
 * - Token null/undefined kontrolü
 * - JWT decode hatası kontrolü
 * - Expiration time kontrolü (exp < currentTime)
 */
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Token'ın süresi dolmuş mu kontrol et
    if (decoded.exp && decoded.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Token validation error:', error);
    return false;
  }
};

/**
 * ============================================================================
 * USE TOKEN REFRESH HOOK - Otomatik token yenileme hook'u
 * ============================================================================
 * 
 * JWT token'ların otomatik yenilenmesini ve monitoring'ini yöneten ana hook
 * 
 * Ana Özellikler:
 * - Expiration tabanlı yenileme: Token expiration time'dan 10 dakika önce yenileme
 * - Token monitoring: Auth state değişikliklerinde otomatik monitoring başlatma/durdurma
 * - Visibility change kontrolü: Tab değişikliğinde token geçerliliği kontrolü
 * - Window focus kontrolü: Window focus'da token geçerliliği kontrolü
 * - Cleanup: Component unmount'ta timeout'ları temizleme
 * 
 * Dönüş:
 * @returns {Object} Token yönetimi fonksiyonları
 * - refreshTokens: Manuel token yenileme fonksiyonu
 * - scheduleTokenRefresh: Token yenileme zamanlama fonksiyonu
 * - startTokenMonitoring: Monitoring başlatma fonksiyonu
 * - stopTokenMonitoring: Monitoring durdurma fonksiyonu
 * 
 * Kullanım:
 * ```jsx
 * import { useTokenRefresh } from '@/hooks/useTokenRefresh';
 * 
 * function App() {
 *   const { refreshTokens } = useTokenRefresh();
 *   // Otomatik olarak çalışır, manuel refresh için refreshTokens() kullanılabilir
 * }
 * ```
 * 
 * Token Yenileme Zamanlaması:
 * - Token expiration time'dan 10 dakika önce otomatik yenileme
 * - JWT payload'dan exp alanı okunur
 * - setTimeout ile yenileme zamanlanır
 * - Her token/auth state değişikliğinde yeni zamanlama
 */
export const useTokenRefresh = () => {
  /**
   * ============================================================================
   * REFS VE STATE
   * ============================================================================
   */
  
  /**
   * Token yenileme timeout referansı
   * Component unmount'ta temizlenmek için kullanılır
   */
  const refreshTimeoutRef = useRef(null);
  
  /**
   * Auth store'dan gerekli state ve fonksiyonlar
   */
  const { 
    token, 
    refreshToken, 
    isAuthenticated, 
    updateTokens, 
    clearAuthState,
    isTokenExpired,
    shouldRefreshToken 
  } = useAuthStore();

  // ============================================================================
  // TOKEN REFRESH FUNCTIONS - Token yenileme fonksiyonları
  // ============================================================================

  /**
   * Token yenileme fonksiyonu
   * 
   * Refresh token kullanarak yeni access token ve refresh token alır
   * Başarılı olursa auth store'u günceller, başarısız olursa auth state'i temizler
   * 
   * Dönüş:
   * @returns {Promise<boolean>} Yenileme başarılı ise true, başarısız ise false
   * 
   * Error Handling:
   * - Refresh token yoksa: Warning log, false döner
   * - API hatası: Error log, auth state temizlenir, false döner
   * - Invalid response: Error log, auth state temizlenir, false döner
   */
  const refreshTokens = useCallback(async () => {
    if (!refreshToken) {
      logger.warn('No refresh token available');
      return false;
    }

    try {
      logger.info('Attempting automatic token refresh');
      const response = await apiRequest.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
      const result = response.data;

      if (result && result.success && result.data) {
        updateTokens({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken || refreshToken
        });
        logger.info('Token refresh successful');
        return true;
      }

      logger.error('Token refresh failed', result?.message);
      clearAuthState();
      return false;
    } catch (error) {
      logger.captureError(error, 'Token Refresh');
      clearAuthState();
      return false;
    }
  }, [refreshToken, updateTokens, clearAuthState]);

  /**
   * Token yenileme zamanlama fonksiyonu
   * 
   * Token expiration time'ını kontrol eder ve expiration'dan 10 dakika önce
   * yenileme zamanlar. JWT payload'dan exp alanını okur ve setTimeout ile
   * yenileme zamanlaması yapar.
   * 
   * Mantık:
   * - Token geçersizse: Auth state temizlenir
   * - Token geçerliyse: Expiration time'dan 10 dakika önce yenileme zamanlanır
   * - Mevcut timeout varsa temizlenir
   * 
   * Teknik Detaylar:
   * - JWT payload base64 decode edilir
   * - exp (expiration time) alanı okunur
   * - currentTime ile karşılaştırılır
   * - refreshTime = (exp - currentTime - 600) * 1000 (10 dakika önce)
   * - setTimeout ile yenileme zamanlanır
   */
  const scheduleTokenRefresh = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Token süresi dolmuşsa state'i temizle
    if (isTokenExpired()) {
      logger.warn('Token expired, clearing auth state');
      clearAuthState();
      return;
    }

    try {
      // JWT'den expiration time'ı al
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Token'ın süresi dolmadan 10 dakika önce yenile (daha az sık yenileme)
      const refreshTime = Math.max(0, (timeUntilExpiry - 600) * 1000); // 10 dakika önce
      
      logger.debug(`Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
      
      // Mevcut timeout'u temizle
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      // Yeni timeout ayarla
      refreshTimeoutRef.current = setTimeout(async () => {
        logger.info('Token refresh triggered by expiration');
        await refreshTokens();
      }, refreshTime);
      
    } catch (error) {
      logger.error('Error scheduling token refresh:', error);
      clearAuthState();
    }
  }, [isAuthenticated, token, isTokenExpired, clearAuthState, refreshTokens]);

  /**
   * Token monitoring başlatma fonksiyonu
   * 
   * Token yenileme monitoring'ini başlatır ve ilk yenileme zamanlamasını yapar
   * Mevcut timeout varsa temizler ve yeni zamanlama yapar
   */
  const startTokenMonitoring = useCallback(() => {
    // Mevcut timeout'u temizle
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Expiration tabanlı yenileme zamanla
    scheduleTokenRefresh();
    logger.debug('Token monitoring started (expiration-based)');
  }, [scheduleTokenRefresh]);

  /**
   * Token monitoring durdurma fonksiyonu
   * 
   * Tüm aktif timeout'ları temizler ve monitoring'i durdurur
   * Component unmount veya logout durumlarında çağrılır
   */
  const stopTokenMonitoring = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
      logger.debug('Token monitoring stopped');
    }
  }, []);

  // ============================================================================
  // EFFECTS - Side effect'ler
  // ============================================================================

  /**
   * Component mount/unmount ve auth state değişikliklerinde monitoring'i yönet
   * 
   * Auth state veya token değiştiğinde monitoring'i başlatır veya durdurur
   * Component unmount'ta monitoring'i durdurur ve timeout'ları temizler
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      startTokenMonitoring();
    } else {
      stopTokenMonitoring();
    }

    return () => {
      stopTokenMonitoring();
    };
  }, [isAuthenticated, token, startTokenMonitoring, stopTokenMonitoring]);

  /**
   * Visibility change event listener
   * 
   * Tab değişikliğinde (visibilitychange) token geçerliliğini kontrol eder
   * Tab aktif hale geldiğinde ve kullanıcı authenticate ise token kontrolü yapılır
   * Geçersiz token varsa auth state temizlenir
   * 
   * Güvenlik:
   * - Sadece tab aktif hale geldiğinde kontrol yapılır (document.hidden === false)
   * - Sadece authenticate kullanıcılar için kontrol yapılır
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && token) {
        // Visibility change'de sadece token geçerliliğini kontrol et
        const isValid = isTokenValid(token);
        if (!isValid) {
          logger.warn('Token invalid on visibility change, clearing auth state');
          clearAuthState();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, token, clearAuthState]);

  /**
   * Window focus event listener
   * 
   * Window focus olduğunda token geçerliliğini kontrol eder
   * Kullanıcı başka tab'dan geri döndüğünde token kontrolü yapılır
   * Geçersiz token varsa auth state temizlenir
   * 
   * Güvenlik:
   * - Sadece authenticate kullanıcılar için kontrol yapılır
   * - Focus event'i ile tab değişiklikleri yakalanır
   */
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && token) {
        // Focus'da sadece token geçerliliğini kontrol et
        const isValid = isTokenValid(token);
        if (!isValid) {
          logger.warn('Token invalid on focus, clearing auth state');
          clearAuthState();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, token, clearAuthState]);

  /**
   * Hook dönüş değerleri
   * 
   * Token yönetimi için manuel kontrol fonksiyonları sağlar
   */
  return {
    refreshTokens,
    scheduleTokenRefresh,
    startTokenMonitoring,
    stopTokenMonitoring
  };
};

/**
 * ============================================================================
 * USE SESSION TIMEOUT HOOK - Session timeout yönetimi hook'u
 * ============================================================================
 * 
 * Kullanıcı aktivitesini takip eder ve belirtilen süre içinde aktivite yoksa
 * oturumu sonlandırır. Session timeout uyarısı ve otomatik logout sağlar.
 * 
 * Ana Özellikler:
 * - Aktivite takibi: Mouse, keyboard, scroll, touch event'leri ile aktivite tespiti
 * - Timeout yönetimi: Belirtilen süre sonra otomatik logout
 * - Uyarı sistemi: Timeout'tan 5 dakika önce kullanıcıya uyarı gösterimi
 * - Throttling: Event handler'lar için throttling ile performans optimizasyonu
 * - Otomatik reset: Her aktivitede timeout sıfırlanır
 * 
 * Parametreler:
 * @param {number} timeoutMinutes - Session timeout süresi (dakika, varsayılan: 30)
 * 
 * Dönüş:
 * @returns {Object} Session yönetimi fonksiyonları
 * - resetTimeout: Manuel timeout sıfırlama fonksiyonu
 * 
 * Kullanım:
 * ```jsx
 * import { useSessionTimeout } from '@/hooks/useTokenRefresh';
 * 
 * function App() {
 *   useSessionTimeout(30); // 30 dakika timeout
 *   // Otomatik olarak çalışır
 * }
 * ```
 * 
 * Aktivite Event'leri:
 * - mousedown: Mouse tıklama
 * - mousemove: Mouse hareketi
 * - keypress: Klavye basma
 * - scroll: Sayfa scroll
 * - touchstart: Dokunmatik ekran dokunma
 * - click: Tıklama
 * 
 * Timeout Süreleri:
 * - Warning timeout: timeoutMinutes - 5 dakika (5 dakika önce uyarı)
 * - Session timeout: timeoutMinutes (otomatik logout)
 * 
 * Throttling:
 * - Event handler'lar 30 saniyede bir throttle edilir
 * - Performans optimizasyonu için gereksiz timeout reset'leri önlenir
 */
export const useSessionTimeout = (timeoutMinutes = 30) => {
  /**
   * ============================================================================
   * REFS VE STATE
   * ============================================================================
   */
  
  /**
   * Session timeout referansı
   * Timeout'u temizlemek için kullanılır
   */
  const timeoutRef = useRef(null);
  
  /**
   * Warning timeout referansı
   * Uyarı timeout'unu temizlemek için kullanılır
   */
  const warningRef = useRef(null);
  
  /**
   * Auth store'dan gerekli state ve fonksiyonlar
   */
  const { isAuthenticated, clearAuthState } = useAuthStore();

  // ============================================================================
  // SESSION TIMEOUT FUNCTIONS - Session timeout fonksiyonları
  // ============================================================================

  /**
   * Session timeout handler
   * 
   * Session timeout süresi dolduğunda çağrılır
   * Auth state'i temizler ve kullanıcıyı logout eder
   */
  const handleSessionTimeout = useCallback(() => {
    logger.warn('Session timeout, clearing auth state');
    clearAuthState();
  }, [clearAuthState]);

  /**
   * Timeout uyarı handler
   * 
   * Session timeout'tan 5 dakika önce kullanıcıya uyarı gösterir
   * Toast notification ile uyarı mesajı gösterilir
   */
  const handleTimeoutWarning = useCallback(() => {
    logger.info('Session timeout warning');
    
    // Kullanıcıya timeout uyarısı göster
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast.warning('Oturumunuz yakında sona erecek. Lütfen sayfayı yenileyin.', {
        duration: 10000, // 10 saniye
        id: 'session-timeout-warning'
      });
    }
  }, []);

  /**
   * Timeout sıfırlama fonksiyonu
   * 
   * Kullanıcı aktivitesi olduğunda çağrılır ve timeout'ları sıfırlar
   * Warning timeout ve session timeout'u yeniden zamanlar
   * 
   * Zamanlama:
   * - Warning timeout: (timeoutMinutes - 5) * 60 * 1000
   * - Session timeout: timeoutMinutes * 60 * 1000
   */
  const resetTimeout = useCallback(() => {
    if (!isAuthenticated) return;

    // Mevcut timeout'ları temizle
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Yeni timeout'ları ayarla
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - 5) * 60 * 1000; // 5 dakika önce uyar

    warningRef.current = setTimeout(handleTimeoutWarning, warningMs);
    timeoutRef.current = setTimeout(handleSessionTimeout, timeoutMs);

    logger.debug('Session timeout reset', { timeoutMinutes });
  }, [isAuthenticated, timeoutMinutes, handleTimeoutWarning, handleSessionTimeout]);

  /**
   * User activity event listeners
   * 
   * Kullanıcı aktivitesini takip eden event listener'ları ekler
   * Her aktivitede timeout'ları sıfırlar (throttled)
   * Component mount'ta ilk timeout'u ayarlar
   * Component unmount'ta event listener'ları ve timeout'ları temizler
   * 
   * Event'ler:
   * - mousedown, mousemove, keypress, scroll, touchstart, click
   * 
   * Throttling:
   * - Event handler'lar 30 saniyede bir throttle edilir
   * - Gereksiz timeout reset'leri önlenir
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const throttledResetTimeout = throttle(resetTimeout, 30000); // 30 saniyede bir

    events.forEach(event => {
      document.addEventListener(event, throttledResetTimeout, true);
    });

    // İlk timeout ayarla
    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledResetTimeout, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [isAuthenticated, resetTimeout]);

  /**
   * Hook dönüş değerleri
   * 
   * Session yönetimi için manuel kontrol fonksiyonları sağlar
   */
  return {
    resetTimeout
  };
};

// ============================================================================
// UTILITY FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

/**
 * Throttle Utility Function
 * 
 * Fonksiyon çağrılarını belirtilen süre içinde sınırlar
 * Performans optimizasyonu için kullanılır
 * 
 * Parametreler:
 * @param {Function} func - Throttle edilecek fonksiyon
 * @param {number} limit - Minimum çağrı aralığı (milisaniye)
 * 
 * Dönüş:
 * @returns {Function} Throttled fonksiyon
 * 
 * Mantık:
 * - İlk çağrı hemen çalışır
 * - Sonraki çağrılar limit süresi içinde ignore edilir
 * - Limit süresi geçtikten sonra tekrar çağrı yapılabilir
 * 
 * Örnek:
 * ```js
 * const throttledFn = throttle(() => console.log('Called'), 1000);
 * throttledFn(); // Çalışır
 * throttledFn(); // Ignore edilir (1 saniye içinde)
 * setTimeout(() => throttledFn(), 1100); // Çalışır (1 saniye geçti)
 * ```
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default useTokenRefresh;
