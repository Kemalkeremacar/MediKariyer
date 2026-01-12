/**
 * @file useProfileCore.ts
 * @description Ana profil bilgileri ve doluluk oranı hook'u
 * @author MediKariyer Development Team
 * @version 3.0.0
 * 
 * **AMAÇ:**
 * Sadece ana profil bilgilerini (ad, soyad, fotoğraf, unvan) ve doluluk oranını çeker.
 * Domain-Driven Design prensibi ile profil modülü parçalandı.
 * 
 * **CACHE YAPISI:**
 * - Core profil: ['profile', 'core'] - 5 dakika stale time
 * - Doluluk oranı: ['profile', 'completion'] - 2 dakika stale time
 * 
 * **İLGİLİ HOOK'LAR:**
 * - useEducations: Eğitim bilgileri
 * - useExperiences: Deneyim bilgileri
 * - useCertificates: Sertifika bilgileri
 * - useLanguages: Dil bilgileri
 * 
 * **KULLANIM ÖRNEĞİ:**
 * ```typescript
 * const { data: profile, isLoading } = useProfileCore();
 * const { data: completion } = useProfileCompletion();
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { profileCoreService } from '@/api/services/profile/profile.core.service';

/**
 * Ana profil bilgilerini çeken hook
 * 
 * **DÖNEN VERİLER:**
 * - Ad, soyad
 * - Profil fotoğrafı
 * - Unvan (Dr., Uz. Dr., vb.)
 * - Uzmanlık alanı
 * 
 * **CACHE:** ['profile', 'core'] - 5 dakika stale time
 * 
 * @returns {UseQueryResult} React Query sonucu
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
 * Profil doluluk oranını çeken hook
 * 
 * **DÖNEN VERİLER:**
 * - Doluluk yüzdesi (0-100)
 * - Eksik alanlar listesi
 * - Tamamlanmış alanlar listesi
 * 
 * **CACHE:** ['profile', 'completion'] - 2 dakika stale time
 * 
 * **NOT:** Completion sık değişebilir (kullanıcı profil güncellerken),
 * bu yüzden stale time daha kısa tutuldu.
 * 
 * @returns {UseQueryResult} React Query sonucu
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

