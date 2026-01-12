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
      retry: MAX_RETRY_ATTEMPTS, // 2 yeniden deneme
      refetchOnWindowFocus: false, // Pencere focus olduğunda yeniden getirme
      refetchOnReconnect: true, // İnternet bağlantısı geri geldiğinde yeniden getir
      refetchOnMount: true, // Component mount olduğunda yeniden getir
    },
    mutations: {
      retry: false, // Mutation'lar için yeniden deneme yok
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

