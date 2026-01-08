/**
 * useProfileCore Hook - Stabilizasyon Faz 3
 * 
 * Sadece Ana Profil (Ad, Soyad, Fotoğraf, Unvan) ve Doluluk Oranı verilerini çeker
 * Cache key: ['profile', 'core']
 * 
 * Domain-Driven Design: Profil modülü parçalandı
 * - Core profil bilgileri (bu hook)
 * - Eğitimler (useEducations)
 * - Deneyimler (useExperiences)
 * - Sertifikalar (useCertificates)
 * - Diller (useLanguages)
 */

import { useQuery } from '@tanstack/react-query';
import { profileCoreService } from '@/api/services/profile/profile.core.service';

/**
 * Hook for fetching core profile data (name, photo, title, specialty)
 * Cache key: ['profile', 'core']
 */
export const useProfileCore = () => {
  return useQuery({
    queryKey: ['profile', 'core'],
    queryFn: () => profileCoreService.getProfile(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 dakika (profil sık değişmez)
    gcTime: 10 * 60 * 1000, // 10 dakika cache
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Window focus'ta refetch yapma (performans)
    refetchOnReconnect: true,
  });
};

/**
 * Hook for fetching profile completion status
 * Cache key: ['profile', 'completion']
 */
export const useProfileCompletion = () => {
  return useQuery({
    queryKey: ['profile', 'completion'],
    queryFn: () => profileCoreService.getProfileCompletion(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000, // 2 dakika (completion sık değişebilir)
    gcTime: 5 * 60 * 1000, // 5 dakika cache
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

