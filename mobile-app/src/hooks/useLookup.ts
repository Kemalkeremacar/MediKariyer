/**
 * Lookup Hooks
 * Lookup verilerini getiren React Query hooks
 * ARCH-003: queryKeys factory pattern uygulandı
 * 
 * Cache Strategy:
 * - staleTime: 24 saat - Lookup verileri nadiren değişir
 * - gcTime: 48 saat - Memory'den temizlenmeden önce bekle
 * - Bu sayede uygulama boyunca lookup verileri cache'te kalır
 */

import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { queryKeys } from '@/api/queryKeys';

// Lookup verileri için cache süreleri
const LOOKUP_STALE_TIME = 1000 * 60 * 60 * 24; // 24 saat
const LOOKUP_GC_TIME = 1000 * 60 * 60 * 48; // 48 saat

/**
 * Uzmanlık alanlarını getir
 */
export const useSpecialties = () => {
  return useQuery({
    queryKey: queryKeys.lookup.specialties(),
    queryFn: lookupService.getSpecialties,
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
  });
};

/**
 * Yan dal alanlarını getir
 */
export const useSubspecialties = (specialtyId?: number) => {
  return useQuery({
    queryKey: queryKeys.lookup.subspecialties(specialtyId),
    queryFn: () => lookupService.getSubspecialties(specialtyId),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: specialtyId !== undefined,
  });
};

/**
 * Şehirleri getir
 */
export const useCities = () => {
  return useQuery({
    queryKey: queryKeys.lookup.cities(),
    queryFn: lookupService.getCities,
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
  });
};

/**
 * Doktor eğitim türlerini getir
 */
export const useEducationTypes = () => {
  return useQuery({
    queryKey: queryKeys.lookup.educationTypes(),
    queryFn: lookupService.getEducationTypes,
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
  });
};

/**
 * Dilleri getir (lookup data)
 * Not: Profile languages ile karıştırılmaması için "lookup" prefix'i kullanılabilir
 */
export const useLanguages = () => {
  return useQuery({
    queryKey: queryKeys.lookup.languages(),
    queryFn: lookupService.getLanguages,
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
  });
};

/**
 * Dil seviyelerini getir
 */
export const useLanguageLevels = () => {
  return useQuery({
    queryKey: queryKeys.lookup.languageLevels(),
    queryFn: lookupService.getLanguageLevels,
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
  });
};

/**
 * Sertifika türlerini getir
 */
export const useCertificateTypes = () => {
  return useQuery({
    queryKey: queryKeys.lookup.certificateTypes(),
    queryFn: lookupService.getCertificateTypes,
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
  });
};

/**
 * Başvuru durumlarını getir
 */
export const useApplicationStatuses = () => {
  return useQuery({
    queryKey: queryKeys.lookup.applicationStatuses(),
    queryFn: lookupService.getApplicationStatuses,
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
  });
};
