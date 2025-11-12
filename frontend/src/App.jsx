/**
 * @file App.jsx
 * @description Ana uygulama bileşeni - Router ve provider yapılandırması
 */

import React, { useEffect, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

// Routes
import AppRoutes from './routes/index';

// Middleware
import ErrorBoundary from './middleware/ErrorBoundary';

// Styles
import './index.css';

// Hooks
import useScrollToTop from './hooks/useScrollToTop';
import { useTokenRefresh, useSessionTimeout } from './hooks/useTokenRefresh';
import { useNotificationStream } from './features/notifications/api/useNotifications';

// Components
import { PageLoader } from './components/ui/LoadingSpinner';
import GlobalModalManager from './components/ui/GlobalModalManager';

// Store
import useUIStore from './store/uiStore';
import useAuthStore from './store/authStore';

// Utils
import logger from './utils/logger';

function App() {
  // Store hooks
  const { setTheme, theme, closeAllModals } = useUIStore();
  const { initializeFromToken, user, clearStorage } = useAuthStore();
  const location = useLocation();

  // Custom hooks - Sayfa değişiminde scroll to top
  useScrollToTop();
  // Otomatik token yenileme
  useTokenRefresh();
  // 30 dakika session timeout
  useSessionTimeout(30);
  // SSE real-time bildirim stream
  useNotificationStream();

  // Uygulama başlatma ve global hata yakalama
  useEffect(() => {
    // Başlangıç logu
    logger.info('Application started', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });

    // Token'dan auth bilgisini yükle
    initializeFromToken();

    // Tema ayarını yükle
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Global hata yakalayıcı
    const handleGlobalError = (event) => {
      logger.captureError(event.error, 'Global Error Handler', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        route: window.location.pathname
      });
    };

    // Promise rejection yakalayıcı
    const handleUnhandledRejection = (event) => {
      logger.captureError(event.reason, 'Unhandled Promise Rejection', {
        route: window.location.pathname
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      logger.debug('Application cleanup completed');
    };
  }, [setTheme]);

  // Rota değişiminde modalları kapat
  useEffect(() => {
    closeAllModals();
  }, [location.pathname, closeAllModals]);

  // Tema değişikliğinde Toaster'ı güncelle
  useEffect(() => {
    const toasterRoot = document.getElementById('toaster-root');
    if (toasterRoot) {
      // Tema değişikliğini localStorage'a kaydet
      localStorage.setItem('theme', theme);
      // Toaster'ı yeniden render et (main.jsx'deki root'u kullan)
      const event = new CustomEvent('theme-changed', { detail: { theme } });
      window.dispatchEvent(event);
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <div className="App bg-gray-50">
        {/* 🔑 Lazy componentler için Suspense fallback */}
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>

        {/* ✅ Global Modals */}
        <GlobalModalManager />
      </div>
    </ErrorBoundary>
  );
}

export default App;
