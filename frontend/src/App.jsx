/**
 * App Component - Ana uygulama bileşeni
 * Router ve provider yapılandırması
 */

import React, { useEffect, Suspense } from 'react';
import { Toaster } from 'sonner'; // ✅ sonner kullanıyoruz

// Routes
import AppRoutes from './routes/index';

// Middleware
import ErrorBoundary from './middleware/ErrorBoundary';

// Styles
import './index.css';

// Hooks
import useScrollToTop from './hooks/useScrollToTop';
import { useTokenRefresh, useSessionTimeout } from './hooks/useTokenRefresh';

// Components
import { PageLoader } from './components/ui/LoadingSpinner';
import ConfirmationModal from './components/ui/ConfirmationModal';

// Store
import useUIStore from './store/uiStore';
import useAuthStore from './store/authStore';

// Utils
import logger from './utils/logger';
import { getToastConfig } from '@config/toast.js'; // ✅ toast ayarlarını aldık

function App() {
  // Store hooks
  const { setTheme, theme } = useUIStore();
  const { initializeFromToken, user, clearStorage } = useAuthStore();

  // Custom hooks
  useScrollToTop();
  useTokenRefresh(); // Automatic token refresh - aktif edildi
  useSessionTimeout(30); // 30 dakika session timeout - aktif edildi

  // Toast config'i tema göre al
  const toastConfig = getToastConfig(theme);

  useEffect(() => {
    // Uygulama başlatıldığında log
    logger.info('Application started', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      version: '2.0.0' // Route düzenlemesi sonrası versiyon
    });

    // Initialize auth from stored token
    initializeFromToken();

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Global error handler
    const handleGlobalError = (event) => {
      logger.captureError(event.error, 'Global Error Handler', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        route: window.location.pathname
      });
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event) => {
      logger.captureError(event.reason, 'Unhandled Promise Rejection', {
        route: window.location.pathname
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      logger.debug('Application cleanup completed');
    };
  }, [setTheme]);

  return (
    <ErrorBoundary>
      <div className="App bg-gray-50">
        {/* 🔑 Lazy componentler için Suspense fallback */}
        <Suspense fallback={<PageLoader text="Sayfa yükleniyor..." />}>
          <AppRoutes />
        </Suspense>

        {/* ✅ Sonner Toaster - Sabit pozisyonlu */}
        <Toaster 
          {...toastConfig} 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
        />

        {/* ✅ Confirmation Modal */}
        <ConfirmationModal />
      </div>
    </ErrorBoundary>
  );
}

export default App;
