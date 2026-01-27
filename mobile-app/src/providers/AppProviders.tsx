/**
 * @file AppProviders.tsx
 * @description Uygulama Seviyesi Provider'lar
 * 
 * Tüm global provider'ları tek bir yerde toplar.
 * Provider hiyerarşisi:
 * - QueryClientProvider (React Query)
 * - ThemeProvider (Tema yönetimi)
 * - AlertProvider (Alert/Dialog yönetimi)
 * - ToastProvider (Toast bildirimleri)
 * - AuthInitializer (Auth başlatma)
 * 
 * ÖNEMLİ NOT: BottomSheetModalProvider burada DEĞİL!
 * BottomSheetModalProvider, App.tsx'te ROOT seviyesinde yer alır.
 * Bu sayede BottomSheetModal bileşenleri (Select gibi) NavigationContainer
 * üzerinde render edilebilir.
 * 
 * Provider Hiyerarşisi (App.tsx'te):
 * PortalProvider → BottomSheetModalProvider → AppProviders → NavigationContainer
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { PropsWithChildren } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from './ToastProvider';
import { AlertProvider } from './AlertProvider';
import { AuthInitializer } from './AuthInitializer';
import { CACHE_STALE_TIME, CACHE_TIME, MAX_RETRY_ATTEMPTS } from '@/config/constants';

/**
 * Merkezi QueryClient instance'ı
 * @description Tüm React Query yapılandırması burada yönetilir
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_TIME, // 5 dakika - veriler bu süre boyunca fresh kabul edilir
      gcTime: CACHE_TIME, // 10 dakika - memory'den temizlenmeden önce bekle (v5'te cacheTime yerine gcTime)
      // Akıllı retry stratejisi - network error'larda retry yap, validation error'larda yapma
      retry: (failureCount, error: any) => {
        // Network error (no response) - retry yap
        if (!error?.response) {
          return failureCount < MAX_RETRY_ATTEMPTS;
        }
        
        const status = error?.response?.status;
        
        // 5xx (server errors) - retry yap
        if (status >= 500) {
          return failureCount < MAX_RETRY_ATTEMPTS;
        }
        
        // 408 (timeout) ve 429 (rate limit) - retry yap
        if (status === 408 || status === 429) {
          return failureCount < MAX_RETRY_ATTEMPTS;
        }
        
        // 4xx (client errors) - retry yapma (validation, auth errors)
        if (status >= 400 && status < 500) {
          return false;
        }
        
        // Diğer durumlar - retry yap
        return failureCount < MAX_RETRY_ATTEMPTS;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
      refetchOnWindowFocus: false, // Pencere focus olduğunda yeniden getirme
      refetchOnReconnect: true, // İnternet bağlantısı geri geldiğinde yeniden getir
      refetchOnMount: true, // Component mount olduğunda yeniden getir (stale ise)
    },
    mutations: {
      // FIXED: Enable retry for mutations to handle transient network errors
      retry: (failureCount, error: any) => {
        // Network error (no response) - retry yap
        if (!error?.response) {
          return failureCount < 2;
        }
        
        const status = error?.response?.status;
        
        // Don't retry on validation errors (4xx except 408, 429)
        if (status >= 400 && status < 500) {
          // Retry on timeout (408) and rate limit (429)
          if (status === 408 || status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        // Retry on network errors and 5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
    },
  },
});

/**
 * AppProviders - Uygulama seviyesi provider'lar
 * @description Tüm global provider'ları içerir
 */
export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AlertProvider>
          <ToastProvider>
            <AuthInitializer />
            {children}
          </ToastProvider>
        </AlertProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

