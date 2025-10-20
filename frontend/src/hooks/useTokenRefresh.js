import { useEffect, useRef, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { apiRequest } from '../services/http/client';
import { ENDPOINTS } from '@config/api.js';
import logger from '../utils/logger';
import { jwtDecode } from 'jwt-decode';

/**
 * Token geçerliliğini kontrol eden yardımcı fonksiyon
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
 * Automatic Token Refresh Hook
 * Token süresini takip eder ve otomatik olarak yeniler
 * Expiration tabanlı yenileme - sadece token süresi dolmaya yaklaştığında yeniler
 */
export const useTokenRefresh = () => {
  const refreshTimeoutRef = useRef(null);
  const { 
    token, 
    refreshToken, 
    isAuthenticated, 
    updateTokens, 
    clearAuthState,
    isTokenExpired,
    shouldRefreshToken 
  } = useAuthStore();

  // Token yenileme fonksiyonu
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

  // Token durumunu kontrol et ve expiration tabanlı yenileme zamanla
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

  // Token monitoring başlat (expiration tabanlı)
  const startTokenMonitoring = useCallback(() => {
    // Mevcut timeout'u temizle
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Expiration tabanlı yenileme zamanla
    scheduleTokenRefresh();
    logger.debug('Token monitoring started (expiration-based)');
  }, [scheduleTokenRefresh]);

  // Monitoring durdur
  const stopTokenMonitoring = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
      logger.debug('Token monitoring stopped');
    }
  }, []);

  // Component mount/unmount ve auth state değişikliklerinde monitoring'i yönet
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

  // Visibility change ile token kontrolü - güvenli hale getirildi
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
  }, [isAuthenticated, token, clearAuthState]); // logout dependency'sini ekledik

  // Focus ile token kontrolü - güvenli hale getirildi
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
  }, [isAuthenticated, token, clearAuthState]); // logout dependency'sini ekledik

  return {
    refreshTokens,
    scheduleTokenRefresh,
    startTokenMonitoring,
    stopTokenMonitoring
  };
};

/**
 * Session Timeout Hook
 * Kullanıcı aktivitesini takip eder ve session timeout yönetir
 */
export const useSessionTimeout = (timeoutMinutes = 30) => {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const { isAuthenticated, clearAuthState } = useAuthStore();

  // Session timeout
  const handleSessionTimeout = useCallback(() => {
    logger.warn('Session timeout, clearing auth state');
    clearAuthState();
  }, [clearAuthState]);

  // Timeout uyarısı
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

  // Activity reset
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

  // User activity events
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

  return {
    resetTimeout
  };
};

// Throttle utility
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
