/**
 * useCertificates Hook - Stabilizasyon Faz 3
 * 
 * Sertifika CRUD işlemleri
 * Cache key: ['profile', 'certificate']
 * 
 * Domain-Driven Design: Sertifika domain'i ayrı hook
 */

import { useQuery } from '@tanstack/react-query';
import { useCRUDMutation } from '@/hooks/useCRUDMutation';
import { certificateService } from '@/api/services/profile/certificate.service';
import type {
  CreateCertificatePayload,
  UpdateCertificatePayload,
  DoctorCertificate,
} from '@/types/profile';

/**
 * Hook for fetching certificate list
 * Cache key: ['profile', 'certificate']
 */
export const useCertificates = () => {
  return useQuery({
    queryKey: ['profile', 'certificate'],
    queryFn: () => certificateService.getCertificates(),
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
 * Hook for managing certificate entries (CRUD)
 * Sadece kendi cache key'ini invalidate eder: ['profile', 'certificate']
 */
export const useCertificate = () => {
  return useCRUDMutation<CreateCertificatePayload, UpdateCertificatePayload, DoctorCertificate>({
    entityName: 'Sertifika bilgisi',
    queryKey: ['profile', 'certificate'],
    endpoint: '/doctor/certificates',
    service: {
      create: certificateService.createCertificate,
      update: certificateService.updateCertificate,
      delete: certificateService.deleteCertificate,
    },
  });
};

