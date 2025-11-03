/**
 * @file main.jsx
 * @description Uygulama giriş noktası - React DOM render işlemi
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

// React DOM render
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* DevTools - sadece development modunda görünür */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
