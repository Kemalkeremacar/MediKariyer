/**
 * @file useExperiences.ts
 * @description Deneyim CRUD işlemleri hook'u
 * @author MediKariyer Development Team
 * @version 3.0.0
 * 
 * **AMAÇ:**
 * Doktorun iş deneyimi bilgilerini yönetir (listeleme, ekleme, güncelleme, silme).
 * 
 * **CACHE:** ['profile', 'experience'] - 2 dakika stale time
 * 
 * **KULLANIM ÖRNEĞİ:**
 * ```typescript
 * // Listeleme
 * const { data: experiences, isLoading } = useExperiences();
 * 
 * // CRUD işlemleri
 * const { create, update, remove } = useExperience();
 * 
 * create.mutate({
 *   hospital_name: 'Acıbadem Hastanesi',
 *   position: 'Kardiyoloji Uzmanı',
 *   start_date: '2018-01-01',
 *   end_date: null, // Halen çalışıyor
 *   is_current: true
 * });
 * ```
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
 * Deneyim listesini çeken hook
 * 
 * **DÖNEN VERİLER:**
 * - Hastane/kurum adı
 * - Pozisyon
 * - Başlangıç ve bitiş tarihleri
 * - Halen çalışıyor mu (is_current)
 * 
 * **CACHE:** ['profile', 'experience'] - 2 dakika stale time
 * 
 * @returns {UseQueryResult} React Query sonucu
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
 * Deneyim CRUD işlemleri için mutation hook
 * 
 * **İŞLEMLER:**
 * - create: Yeni deneyim ekle
 * - update: Mevcut deneyimi güncelle
 * - remove: Deneyimi sil
 * 
 * **CACHE YÖNETİMİ:**
 * Sadece ['profile', 'experience'] cache'i invalidate edilir.
 * Diğer profil domain'leri etkilenmez.
 * 
 * @returns {Object} create, update, remove mutation'ları
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

