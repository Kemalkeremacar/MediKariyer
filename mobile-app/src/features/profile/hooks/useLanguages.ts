/**
 * useLanguages Hook - Stabilizasyon Faz 3
 * 
 * Dil CRUD işlemleri
 * Cache key: ['profile', 'language']
 * 
 * Domain-Driven Design: Dil domain'i ayrı hook
 */

import { useQuery } from '@tanstack/react-query';
import { useCRUDMutation } from '@/hooks/useCRUDMutation';
import { languageService } from '@/api/services/profile/language.service';
import type {
  CreateLanguagePayload,
  UpdateLanguagePayload,
  DoctorLanguage,
} from '@/types/profile';

/**
 * Hook for fetching language list
 * Cache key: ['profile', 'language']
 */
export const useLanguages = () => {
  return useQuery({
    queryKey: ['profile', 'language'],
    queryFn: () => languageService.getLanguages(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika cache
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook for managing language entries (CRUD)
 * Sadece kendi cache key'ini invalidate eder: ['profile', 'language']
 */
export const useLanguage = () => {
  return useCRUDMutation<CreateLanguagePayload, UpdateLanguagePayload, DoctorLanguage>({
    entityName: 'Dil bilgisi',
    queryKey: ['profile', 'language'],
    endpoint: '/doctor/languages',
    service: {
      create: languageService.createLanguage,
      update: languageService.updateLanguage,
      delete: languageService.deleteLanguage,
    },
  });
};

