/**
 * @file useCertificates.ts
 * @description Sertifika CRUD işlemleri hook'u
 * @author MediKariyer Development Team
 * @version 3.0.0
 * 
 * **AMAÇ:**
 * Doktorun sertifika bilgilerini yönetir (listeleme, ekleme, güncelleme, silme).
 * 
 * **CACHE:** ['profile', 'certificate'] - 2 dakika stale time
 * 
 * **KULLANIM ÖRNEĞİ:**
 * ```typescript
 * // Listeleme
 * const { data: certificates, isLoading } = useCertificates();
 * 
 * // CRUD işlemleri
 * const { create, update, remove } = useCertificate();
 * 
 * create.mutate({
 *   certificate_name: 'ACLS Sertifikası',
 *   institution: 'Türk Kardiyoloji Derneği',
 *   issue_date: '2023-01-15',
 *   expiry_date: '2025-01-15'
 * });
 * ```
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
 * Sertifika listesini çeken hook
 * 
 * **DÖNEN VERİLER:**
 * - Sertifika adı
 * - Veren kurum
 * - Veriliş tarihi
 * - Son geçerlilik tarihi
 * 
 * **CACHE:** ['profile', 'certificate'] - 2 dakika stale time
 * 
 * @returns {UseQueryResult} React Query sonucu
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
 * Sertifika CRUD işlemleri için mutation hook
 * 
 * **İŞLEMLER:**
 * - create: Yeni sertifika ekle
 * - update: Mevcut sertifikayı güncelle
 * - remove: Sertifikayı sil
 * 
 * **CACHE YÖNETİMİ:**
 * Sadece ['profile', 'certificate'] cache'i invalidate edilir.
 * Diğer profil domain'leri etkilenmez.
 * 
 * **KULLANIM:**
 * useCRUDMutation hook'u ile generic CRUD işlemleri sağlanır.
 * 
 * @returns {Object} create, update, remove mutation'ları
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

