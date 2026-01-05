/**
 * useEducations Hook - Stabilizasyon Faz 3
 * 
 * Eğitim CRUD işlemleri
 * Cache key: ['profile', 'education']
 * 
 * Domain-Driven Design: Eğitim domain'i ayrı hook
 */

import { useQuery } from '@tanstack/react-query';
import { useCRUDMutation } from '@/hooks/useCRUDMutation';
import { educationService } from '@/api/services/profile/education.service';
import type {
  CreateEducationPayload,
  UpdateEducationPayload,
  DoctorEducation,
} from '@/types/profile';

/**
 * Hook for fetching education list
 * Cache key: ['profile', 'education']
 */
export const useEducations = () => {
  return useQuery({
    queryKey: ['profile', 'education'],
    queryFn: () => educationService.getEducations(),
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
 * Hook for managing education entries (CRUD)
 * Sadece kendi cache key'ini invalidate eder: ['profile', 'education']
 */
export const useEducation = () => {
  return useCRUDMutation<CreateEducationPayload, UpdateEducationPayload, DoctorEducation>({
    entityName: 'Eğitim bilgisi',
    queryKey: ['profile', 'education'],
    endpoint: '/doctor/educations',
    service: {
      create: educationService.createEducation,
      update: educationService.updateEducation,
      delete: educationService.deleteEducation,
    },
  });
};

