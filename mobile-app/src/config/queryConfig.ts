/**
 * React Query Configuration
 * Default options for React Query client
 */

import { QueryClient } from '@tanstack/react-query';
import { CACHE_STALE_TIME, CACHE_TIME, MAX_RETRY_ATTEMPTS } from './constants';

export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_TIME,
      gcTime: CACHE_TIME, // Previously cacheTime in v4
      retry: MAX_RETRY_ATTEMPTS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
};

export const createQueryClient = () => new QueryClient(queryConfig);
