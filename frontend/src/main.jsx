/**
 * @file main.jsx
 * @description Uygulama Giriş Noktası - React DOM Render ve Provider Setup
 * 
 * Bu dosya, MediKariyer React uygulamasının giriş noktasıdır. React DOM'u
 * başlatır, tüm provider'ları yapılandırır ve uygulamayı DOM'a render eder.
 * 
 * Ana Özellikler:
 * - React 18 createRoot API kullanımı
 * - BrowserRouter ile client-side routing
 * - React Query provider ile server state yönetimi
 * - Sonner toast provider ile bildirim sistemi
 * - React Query DevTools (development ortamında)
 * 
 * Provider Hiyerarşisi:
 * 1. BrowserRouter - URL routing
 * 2. QueryClientProvider - Server state management
 * 3. Toaster - Global toast notifications
 * 4. App - Ana uygulama bileşeni
 * 
 * Toast Sistemi:
 * - Sonner kütüphanesi ile modern toast sistemi
 * - CSS ile tam kontrol (JavaScript pozisyon güncellemesi YOK)
 * - position: fixed ile viewport'a sabitlenmiş
 * - Scroll'dan tamamen bağımsız
 * - Performanslı ve temiz kod
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
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
// NOT: Global default'lar minimal - her hook kendi stratejisini belirler (queryConfig.js)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Minimal global defaults - hook'lar kendi config'lerini kullanır
      retry: (failureCount, error) => {
        // Auth hatalarında retry yapma
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2; // Maksimum 2 retry
      },
      refetchInterval: false, // Otomatik polling kapalı (manuel olarak eklenir)
      // staleTime, cacheTime, refetchOnMount, refetchOnWindowFocus → hook'larda belirlenir
    },
    mutations: {
      retry: 0, // Mutation'larda retry yapma
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// QueryClient'ı global olarak erişilebilir yap (auth store için)
if (typeof window !== 'undefined') {
  window.queryClient = queryClient;
  window.__REACT_QUERY_CLIENT__ = queryClient; // Alternatif key (authStore için)
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
