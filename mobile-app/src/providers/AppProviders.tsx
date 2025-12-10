import React, { PropsWithChildren } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from './ToastProvider';
import { CACHE_STALE_TIME, CACHE_TIME, MAX_RETRY_ATTEMPTS } from '@/config/constants';

/**
 * Centralized QueryClient instance
 * All React Query configuration is managed here
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_TIME, // 5 minutes
      gcTime: CACHE_TIME, // 10 minutes (previously cacheTime in v4)
      retry: MAX_RETRY_ATTEMPTS, // 2 retries
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

