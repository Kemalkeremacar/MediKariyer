/**
 * React Query Client Instance
 * Configured QueryClient with appropriate cache and retry settings
 */

import { QueryClient } from '@tanstack/react-query';
import { CACHE_STALE_TIME, CACHE_TIME, MAX_RETRY_ATTEMPTS } from '@/config/constants';

export const queryClient = new QueryClient({
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
