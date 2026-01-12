/**
 * @file useLanguages.ts
 * @description Dil CRUD işlemleri hook'u
 * @author MediKariyer Development Team
 * @version 3.0.0
 * 
 * **AMAÇ:**
 * Doktorun yabancı dil bilgilerini yönetir (listeleme, ekleme, güncelleme, silme).
 * 
 * **CACHE:** ['profile', 'language'] - 2 dakika stale time
 * 
 * **KULLANIM ÖRNEĞİ:**
 * ```typescript
 * // Listeleme
 * const { data: languages, isLoading } = useLanguages();
 * 
 * // CRUD işlemleri
 * const { create, update, remove } = useLanguage();
 * 
 * create.mutate({
 *   language_id: 1, // İngilizce
 *   proficiency_level: 'İleri Seviye'
 * });
 * ```
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
 * Dil listesini çeken hook
 * 
 * **DÖNEN VERİLER:**
 * - Dil adı (İngilizce, Almanca, vb.)
 * - Yeterlilik seviyesi (Başlangıç, Orta, İleri)
 * 
 * **CACHE:** ['profile', 'language'] - 2 dakika stale time
 * 
 * @returns {UseQueryResult} React Query sonucu
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
 * Dil CRUD işlemleri için mutation hook
 * 
 * **İŞLEMLER:**
 * - create: Yeni dil ekle
 * - update: Mevcut dili güncelle
 * - remove: Dili sil
 * 
 * **CACHE YÖNETİMİ:**
 * Sadece ['profile', 'language'] cache'i invalidate edilir.
 * Diğer profil domain'leri etkilenmez.
 * 
 * @returns {Object} create, update, remove mutation'ları
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

