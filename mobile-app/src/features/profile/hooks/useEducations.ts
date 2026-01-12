/**
 * @file useEducations.ts
 * @description Eğitim CRUD işlemleri hook'u
 * @author MediKariyer Development Team
 * @version 3.0.0
 * 
 * **AMAÇ:**
 * Doktorun eğitim bilgilerini yönetir (listeleme, ekleme, güncelleme, silme).
 * 
 * **CACHE:** ['profile', 'education'] - 2 dakika stale time
 * 
 * **KULLANIM ÖRNEĞİ:**
 * ```typescript
 * // Listeleme
 * const { data: educations, isLoading } = useEducations();
 * 
 * // CRUD işlemleri
 * const { create, update, remove } = useEducation();
 * 
 * create.mutate({
 *   institution: 'İstanbul Üniversitesi Tıp Fakültesi',
 *   degree: 'Tıp Doktoru',
 *   field_of_study: 'Tıp',
 *   start_date: '2010-09-01',
 *   end_date: '2016-06-30'
 * });
 * ```
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
 * Eğitim listesini çeken hook
 * 
 * **DÖNEN VERİLER:**
 * - Kurum adı
 * - Derece (Lisans, Yüksek Lisans, vb.)
 * - Alan (Tıp, Kardiyoloji, vb.)
 * - Başlangıç ve bitiş tarihleri
 * 
 * **CACHE:** ['profile', 'education'] - 2 dakika stale time
 * 
 * @returns {UseQueryResult} React Query sonucu
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
 * Eğitim CRUD işlemleri için mutation hook
 * 
 * **İŞLEMLER:**
 * - create: Yeni eğitim ekle
 * - update: Mevcut eğitimi güncelle
 * - remove: Eğitimi sil
 * 
 * **CACHE YÖNETİMİ:**
 * Sadece ['profile', 'education'] cache'i invalidate edilir.
 * Diğer profil domain'leri etkilenmez.
 * 
 * @returns {Object} create, update, remove mutation'ları
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

