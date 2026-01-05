/**
 * useExperiences Hook - Stabilizasyon Faz 3
 * 
 * Deneyim CRUD işlemleri
 * Cache key: ['profile', 'experience']
 * 
 * Domain-Driven Design: Deneyim domain'i ayrı hook
 */

import { useQuery } from '@tanstack/react-query';
import { useCRUDMutation } from '@/hooks/useCRUDMutation';
import { experienceService } from '@/api/services/profile/experience.service';
import type {
  CreateExperiencePayload,
  UpdateExperiencePayload,
  DoctorExperience,
} from '@/types/profile';

/**
 * Hook for fetching experience list
 * Cache key: ['profile', 'experience']
 */
export const useExperiences = () => {
  return useQuery({
    queryKey: ['profile', 'experience'],
    queryFn: () => experienceService.getExperiences(),
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
 * Hook for managing experience entries (CRUD)
 * Sadece kendi cache key'ini invalidate eder: ['profile', 'experience']
 */
export const useExperience = () => {
  return useCRUDMutation<CreateExperiencePayload, UpdateExperiencePayload, DoctorExperience>({
    entityName: 'Deneyim bilgisi',
    queryKey: ['profile', 'experience'],
    endpoint: '/doctor/experiences',
    service: {
      create: experienceService.createExperience,
      update: experienceService.updateExperience,
      delete: experienceService.deleteExperience,
    },
  });
};

