/**
 * @file App.jsx
 * @description Ana Uygulama Bileşeni - MediKariyer Frontend Root Component
 * 
 * Bu dosya, MediKariyer uygulamasının ana bileşenidir. Tüm provider'ları,
 * routing yapısını, global middleware'leri ve temel uygulama mantığını içerir.
 * 
 * Ana Özellikler:
 * - React Router yapılandırması
 * - Error Boundary ile hata yönetimi
 * - Suspense ile lazy loading
 * - Global modal yönetimi
 * - Authentication hooks
 * - Notification stream
 * - Session timeout yönetimi
 * - Scroll to top functionality
 * 
 * Hooks:
 * - useTokenRefresh: Otomatik token yenileme
 * - useSessionTimeout: Session timeout kontrolü
 * - useNotificationStream: Real-time bildirimler
 * - useScrollToTop: Sayfa geçişlerinde scroll reset
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
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

  // Tema değişikliğini localStorage'a kaydet (gelecekte dark mode için hazır)
  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme);
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
