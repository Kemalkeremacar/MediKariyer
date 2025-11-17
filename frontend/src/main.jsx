/**
 * @file main.jsx
 * @description Uygulama giriş noktası - React DOM render işlemi
 * 
 * Modern ve temiz toast sistemi:
 * - Sonner kütüphanesi ile basit setup
 * - CSS ile tam kontrol (JavaScript ile pozisyon güncellemesi YOK)
 * - position: fixed ile viewport'a sabitlenmiş
 * - Scroll'dan tamamen bağımsız
 * - Performanslı ve temiz kod
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// ✅ Custom Toast - Viewport-aware, basit ve güvenilir (Sonner yerine)
import { CustomToaster } from './components/ui/CustomToast.jsx';
import App from './App.jsx';

// React Query client - API çağrıları için cache ve state yönetimi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika - veri fresh kalma süresi
      cacheTime: 10 * 60 * 1000, // 10 dakika - cache'de kalma süresi
      retry: (failureCount, error) => {
        // Auth hatalarında retry yapma
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2; // Maksimum 2 retry
      },
      refetchOnWindowFocus: false, // Pencere focus'unda yeniden çekme
      refetchInterval: false, // Otomatik yenileme kapalı
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// QueryClient'ı global olarak erişilebilir yap (auth store için)
if (typeof window !== 'undefined') {
  window.queryClient = queryClient;
}

// Ana uygulama root'u
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
        {/* ✅ Custom Toast Container - Viewport-aware, scroll'dan bağımsız */}
        <CustomToaster />
        {/* DevTools - sadece development modunda görünür */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
