/**
 * @file useLookup.js
 * @description Lookup Hooks - Sistem lookup verileri yönetimi için custom hook'lar
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm lookup (referans) verilerini
 * yöneten custom hook'ları içerir. React Query kullanılarak veri fetch,
 * cache ve state yönetimi sağlanır.
 * 
 * Ana Hook'lar:
 * 1. useLookup: Tüm lookup verilerini içeren ana hook
 * 2. useSpecialties: Sadece uzmanlık alanları için hook
 * 3. useSubspecialties: Sadece yan dal uzmanlıklar için hook
 * 4. useCities: Sadece şehirler için hook
 * 5. useEducationTypes: Sadece eğitim türleri için hook
 * 6. useLanguageLevels: Sadece dil seviyeleri için hook
 * 7. useLanguages: Sadece diller için hook
 * 8. useCertificateTypes: Sadece sertifika türleri için hook
 * 9. useJobStatuses: Sadece iş durumları için hook
 * 10. useApplicationStatuses: Sadece başvuru durumları için hook
 * 
 * Lookup Verileri:
 * - specialties: Uzmanlık alanları (Ana dal/branş)
 * - subspecialties: Yan dal uzmanlıklar (Ana dala bağlı)
 * - cities: Şehirler
 * - doctor_education_types: Doktor eğitim türleri
 * - language_levels: Dil seviyeleri (Başlangıç, Orta, İleri vb.)
 * - languages: Diller
 * - certificate_types: Sertifika türleri
 * - job_statuses: İş ilanı durumları (Aktif, Pasif vb.)
 * - application_statuses: Başvuru durumları (Başvuruldu, Kabul Edildi vb.)
 * 
 * Ana Özellikler:
 * - React Query entegrasyonu: Otomatik cache ve refetch yönetimi
 * - Data transformation: Backend verilerini frontend formatına dönüştürme
 * - Utility fonksiyonlar: ID'ye göre arama, filtreleme fonksiyonları
 * - Loading states: Her lookup için ayrı loading state
 * - Error handling: Her lookup için ayrı error state
 * - Refetch fonksiyonlar: Manuel veri yenileme
 * - Cache yönetimi: 30 dakika stale time, 1 saat cache time
 * - Retry mekanizması: 3 kez otomatik retry
 * 
 * Backend Uyumluluk:
 * - Backend lookupService.js ile tam uyumlu
 * - Backend lookupController.js ile tam uyumlu
 * - Backend lookupRoutes.js ile tam uyumlu
 * - Backend lookupSchemas.js ile validasyon desteği
 * 
 * Data Format:
 * - Backend format: { id, name, ... }
 * - Frontend format: { id, name, label, value, ... }
 * - transformLookupData fonksiyonu ile dönüşüm yapılır
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * import useLookup, { useCities, useSpecialties } from '@/hooks/useLookup';
 * 
 * // Tüm lookup verileri
 * const { data, loading, error, refetch } = useLookup();
 * const { specialties, cities } = data;
 * 
 * // Sadece şehirler
 * const { data: cities, isLoading, error } = useCities();
 * 
 * // Sadece uzmanlıklar
 * const { data: specialties, isLoading } = useSpecialties();
 * ```
 * 
 * Utility Fonksiyonlar:
 * - getSpecialtyById: ID'ye göre uzmanlık bulma
 * - getSubspecialtiesBySpecialty: Branşa göre yan dalları getirme
 * - getCityById: ID'ye göre şehir bulma
 * - getRequiredEducationTypes: Zorunlu eğitim türlerini getirme
 * - vb.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../services/http/client';
import { ENDPOINTS } from '@config/api.js';
import { 
  transformLookupData, 
  formatValidationErrors 
} from '@config/validation.js';
import logger from '../utils/logger';

/**
 * ============================================================================
 * USE LOOKUP HOOK - Ana lookup verileri hook'u
 * ============================================================================
 * 
 * Tüm lookup verilerini yöneten ana hook
 * Tüm lookup türlerini paralel olarak fetch eder ve tek bir hook'ta birleştirir
 * 
 * Dönüş:
 * @returns {Object} Lookup verileri, durumlar ve utility fonksiyonlar
 * - data: {Object} Tüm lookup verileri (transform edilmiş)
 *   - specialties, subspecialties, cities, educationTypes, vb.
 * - rawData: {Object} Ham backend verileri (transform edilmemiş)
 * - loading: {Object} Loading durumları
 *   - isLoading: Genel loading durumu
 *   - specialtiesLoading, citiesLoading, vb.: Bireysel loading durumları
 * - error: {Object} Hata durumları
 *   - error: Genel hata durumu
 *   - specialtiesError, citiesError, vb.: Bireysel hata durumları
 * - refetch: {Object} Yeniden yükleme fonksiyonları
 *   - refetchAll: Tüm verileri yeniden yükle
 *   - refetchSpecialties, refetchCities, vb.: Bireysel refetch fonksiyonları
 * - utils: {Object} Yardımcı fonksiyonlar
 *   - getSpecialtyById, getCityById, getSubspecialtiesBySpecialty, vb.
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { 
 *   data: { specialties, cities, educationTypes },
 *   loading: { isLoading, specialtiesLoading },
 *   error: { error, specialtiesError },
 *   refetch: { refetchAll, refetchSpecialties },
 *   utils: { getSpecialtyById, getCityById }
 * } = useLookup();
 * ```
 * 
 * Query Configuration:
 * - staleTime: 30 dakika (30 * 60 * 1000)
 * - cacheTime: 1 saat (60 * 60 * 1000)
 * - retry: 3 kez otomatik retry
 * - retryDelay: Exponential backoff (1000 * 2^attemptIndex, max 30000ms)
 */
export const useLookup = () => {
  // ============================================================================
  // QUERY CONFIGURATION - React Query konfigürasyonu
  // ============================================================================
  
  /**
   * Ortak query konfigürasyonu
   * Tüm lookup query'leri için aynı cache ve retry ayarları kullanılır
   */
  
  const queryConfig = {
    staleTime: 30 * 60 * 1000, // 30 dakika cache
    cacheTime: 60 * 60 * 1000, // 1 saat cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Lookup data fetch error:', error);
      logger.error('Lookup data fetch error:', error);
    }
  };

  // ============================================================================
  // INDIVIDUAL QUERIES - Bireysel lookup query'leri
  // ============================================================================

  /**
   * Uzmanlık Alanları Query
   * 
   * Backend'den uzmanlık alanlarını (ana dal/branş) getirir
   * React Query cache'i kullanır, otomatik retry yapar
   * 
   * Query Key: ['lookup', 'specialties']
   * Endpoint: ENDPOINTS.LOOKUP.SPECIALTIES
   */
  const { 
    data: specialtiesRaw, 
    isLoading: specialtiesLoading, 
    error: specialtiesError,
    refetch: refetchSpecialties 
  } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.SPECIALTIES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * Yan Dal Uzmanlıklar Query
   * 
   * Backend'den yan dal uzmanlıklarını getirir
   * Ana dal'a bağlı olarak filtrelenebilir
   * 
   * Query Key: ['lookup', 'subspecialties']
   * Endpoint: ENDPOINTS.LOOKUP.SUBSPECIALTIES
   */
  const { 
    data: subspecialtiesRaw, 
    isLoading: subspecialtiesLoading, 
    error: subspecialtiesError,
    refetch: refetchSubspecialties 
  } = useQuery({
    queryKey: ['lookup', 'subspecialties'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.SUBSPECIALTIES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * Şehirler Query
   * 
   * Backend'den şehir listesini getirir
   * Türkiye şehirleri ve diğer ülkelerin şehirlerini içerir
   * 
   * Query Key: ['lookup', 'cities']
   * Endpoint: ENDPOINTS.LOOKUP.CITIES
   */
  const { 
    data: citiesRaw, 
    isLoading: citiesLoading, 
    error: citiesError,
    refetch: refetchCities 
  } = useQuery({
    queryKey: ['lookup', 'cities'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.CITIES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * Doktor Eğitim Türleri Query
   * 
   * Backend'den doktor eğitim türlerini getirir
   * Lisans, Yüksek Lisans, Doktora, Tıp Fakültesi vb.
   * 
   * Query Key: ['lookup', 'doctor-education-types']
   * Endpoint: ENDPOINTS.LOOKUP.DOCTOR_EDUCATION_TYPES
   */
  const { 
    data: educationTypesRaw, 
    isLoading: educationTypesLoading, 
    error: educationTypesError,
    refetch: refetchEducationTypes 
  } = useQuery({
    queryKey: ['lookup', 'doctor-education-types'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.DOCTOR_EDUCATION_TYPES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * Dil Seviyeleri Query
   * 
   * Backend'den dil seviyelerini getirir
   * Başlangıç, Orta, İleri, Anadil seviyesi vb.
   * 
   * Query Key: ['lookup', 'language-levels']
   * Endpoint: ENDPOINTS.LOOKUP.LANGUAGE_LEVELS
   */
  const { 
    data: languageLevelsRaw, 
    isLoading: languageLevelsLoading, 
    error: languageLevelsError,
    refetch: refetchLanguageLevels 
  } = useQuery({
    queryKey: ['lookup', 'language-levels'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.LANGUAGE_LEVELS);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * Diller Query
   * 
   * Backend'den dil listesini getirir
   * Türkçe, İngilizce, Almanca, Fransızca vb.
   * 
   * Query Key: ['lookup', 'languages']
   * Endpoint: ENDPOINTS.LOOKUP.LANGUAGES
   */
  const { 
    data: languagesRaw, 
    isLoading: languagesLoading, 
    error: languagesError,
    refetch: refetchLanguages 
  } = useQuery({
    queryKey: ['lookup', 'languages'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.LANGUAGES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * Sertifika Türleri Query
   * 
   * Backend'den sertifika türlerini getirir
   * BLS, ACLS, PALS, vb. tıbbi sertifikalar
   * 
   * Query Key: ['lookup', 'certificate-types']
   * Endpoint: ENDPOINTS.LOOKUP.CERTIFICATE_TYPES
   */
  const { 
    data: certificateTypesRaw, 
    isLoading: certificateTypesLoading, 
    error: certificateTypesError,
    refetch: refetchCertificateTypes 
  } = useQuery({
    queryKey: ['lookup', 'certificate-types'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.CERTIFICATE_TYPES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * İş Durumları Query
   * 
   * Backend'den iş ilanı durumlarını getirir
   * Aktif, Pasif, Taslak, Kapatıldı vb.
   * 
   * Query Key: ['lookup', 'job-statuses']
   * Endpoint: ENDPOINTS.LOOKUP.JOB_STATUSES
   */
  const { 
    data: jobStatusesRaw, 
    isLoading: jobStatusesLoading, 
    error: jobStatusesError,
    refetch: refetchJobStatuses 
  } = useQuery({
    queryKey: ['lookup', 'job-statuses'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.JOB_STATUSES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  /**
   * Başvuru Durumları Query
   * 
   * Backend'den başvuru durumlarını getirir
   * Başvuruldu (1), İnceleniyor (2), Kabul Edildi (3), Red Edildi (4), Geri Çekildi (5)
   * 
   * Query Key: ['lookup', 'application-statuses']
   * Endpoint: ENDPOINTS.LOOKUP.APPLICATION_STATUSES
   */
  const { 
    data: applicationStatusesRaw, 
    isLoading: applicationStatusesLoading, 
    error: applicationStatusesError,
    refetch: refetchApplicationStatuses 
  } = useQuery({
    queryKey: ['lookup', 'application-statuses'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.APPLICATION_STATUSES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    ...queryConfig
  });

  // ============================================================================
  // DATA TRANSFORMATION - Veri dönüşümü
  // ============================================================================

  /**
   * Raw backend verilerini frontend formatına dönüştür
   * 
   * transformLookupData fonksiyonu ile backend formatından frontend formatına
   * dönüşüm yapılır. Her öğeye label ve value eklenir.
   * 
   * Backend Format: { id, name, ... }
   * Frontend Format: { id, name, label, value, ... }
   */
  const specialties = transformLookupData(specialtiesRaw || []);
  const subspecialties = transformLookupData(subspecialtiesRaw || []);
  const cities = transformLookupData(citiesRaw || []);
  const educationTypes = transformLookupData(educationTypesRaw || []);
  const languageLevels = transformLookupData(languageLevelsRaw || []);
  const languages = transformLookupData(languagesRaw || []);
  const certificateTypes = transformLookupData(certificateTypesRaw || []);
  const jobStatuses = transformLookupData(jobStatusesRaw || []);
  const applicationStatuses = transformLookupData(applicationStatusesRaw || []);

  // ============================================================================
  // LOADING STATES - Yükleme durumları
  // ============================================================================

  /**
   * Genel loading durumu
   * Herhangi bir lookup verisi yükleniyorsa true döner
   */
  const isLoading = specialtiesLoading || subspecialtiesLoading || citiesLoading || educationTypesLoading || 
                   languageLevelsLoading || languagesLoading || certificateTypesLoading ||
                   jobStatusesLoading || applicationStatusesLoading;

  // ============================================================================
  // ERROR STATES - Hata durumları
  // ============================================================================

  /**
   * Genel hata durumu
   * Herhangi bir lookup verisi fetch'inde hata varsa error objesi döner
   */
  const error = specialtiesError || subspecialtiesError || citiesError || educationTypesError ||
               languageLevelsError || languagesError || certificateTypesError ||
               jobStatusesError || applicationStatusesError;

  // ============================================================================
  // REFETCH FUNCTIONS - Yeniden yükleme fonksiyonları
  // ============================================================================

  /**
   * Tüm lookup verilerini yeniden yükle
   * 
   * Tüm lookup query'lerinin refetch fonksiyonlarını çağırır
   * Cache'den okumak yerine backend'den fresh data çeker
   */
  const refetchAll = () => {
    refetchSpecialties();
    refetchSubspecialties();
    refetchCities();
    refetchEducationTypes();
    refetchLanguageLevels();
    refetchLanguages();
    refetchCertificateTypes();
    refetchJobStatuses();
    refetchApplicationStatuses();
  };

  // ============================================================================
  // UTILITY FUNCTIONS - Yardımcı fonksiyonlar
  // ============================================================================

  /**
   * ID'ye göre uzmanlık alanı bul
   * 
   * Parametreler:
   * @param {number} id - Uzmanlık alanı ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Uzmanlık alanı objesi (bulunamazsa null)
   */
  const getSpecialtyById = (id) => {
    return specialties.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre yan dal bul
   * 
   * Parametreler:
   * @param {number} id - Yan dal ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Yan dal objesi (bulunamazsa null)
   */
  const getSubspecialtyById = (id) => {
    return subspecialties.find(item => item.value === id) || null;
  };

  /**
   * Branşa göre yan dalları getir
   * 
   * Belirtilen ana dal/branşa bağlı tüm yan dalları döndürür
   * 
   * Parametreler:
   * @param {number} specialtyId - Ana dal/branş ID'si
   * 
   * Dönüş:
   * @returns {Array} Yan dallar listesi (bulunamazsa boş array)
   */
  const getSubspecialtiesBySpecialty = (specialtyId) => {
    return subspecialties.filter(item => item.specialty_id === specialtyId);
  };

  /**
   * ID'ye göre şehir bul
   * 
   * Parametreler:
   * @param {number} id - Şehir ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Şehir objesi (bulunamazsa null)
   */
  const getCityById = (id) => {
    return cities.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre eğitim türü bul
   * 
   * Parametreler:
   * @param {number} id - Eğitim türü ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Eğitim türü objesi (bulunamazsa null)
   */
  const getEducationTypeById = (id) => {
    return educationTypes.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre dil seviyesi bul
   * 
   * Parametreler:
   * @param {number} id - Dil seviyesi ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Dil seviyesi objesi (bulunamazsa null)
   */
  const getLanguageLevelById = (id) => {
    return languageLevels.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre dil bul
   * 
   * Parametreler:
   * @param {number} id - Dil ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Dil objesi (bulunamazsa null)
   */
  const getLanguageById = (id) => {
    return languages.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre sertifika türü bul
   * 
   * Parametreler:
   * @param {number} id - Sertifika türü ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Sertifika türü objesi (bulunamazsa null)
   */
  const getCertificateTypeById = (id) => {
    return certificateTypes.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre iş durumu bul
   * 
   * Parametreler:
   * @param {number} id - İş durumu ID'si
   * 
   * Dönüş:
   * @returns {Object|null} İş durumu objesi (bulunamazsa null)
   */
  const getJobStatusById = (id) => {
    return jobStatuses.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre başvuru durumu bul
   * 
   * Parametreler:
   * @param {number} id - Başvuru durumu ID'si
   * 
   * Dönüş:
   * @returns {Object|null} Başvuru durumu objesi (bulunamazsa null)
   */
  const getApplicationStatusById = (id) => {
    return applicationStatuses.find(item => item.value === id) || null;
  };

  /**
   * Zorunlu eğitim türlerini getir
   * 
   * is_required flag'i true olan eğitim türlerini filtreler
   * 
   * Dönüş:
   * @returns {Array} Zorunlu eğitim türleri listesi
   */
  const getRequiredEducationTypes = () => {
    return educationTypes.filter(item => item.is_required);
  };

  /**
   * Zorunlu sertifika türlerini getir
   * 
   * is_required flag'i true olan sertifika türlerini filtreler
   * 
   * Dönüş:
   * @returns {Array} Zorunlu sertifika türleri listesi
   */
  const getRequiredCertificateTypes = () => {
    return certificateTypes.filter(item => item.is_required);
  };

  /**
   * Türkiye şehirlerini getir
   * 
   * country field'ı 'Turkey' olan şehirleri filtreler
   * 
   * Dönüş:
   * @returns {Array} Türkiye şehirleri listesi
   */
  const getTurkeyCities = () => {
    return cities.filter(item => item.country === 'Turkey');
  };

  // ============================================================================
  // RETURN OBJECT - Hook dönüş değerleri
  // ============================================================================

  /**
   * Hook dönüş objesi
   * 
   * Tüm lookup verileri, loading/error durumları, refetch fonksiyonları
   * ve utility fonksiyonları içerir
   */
  return {
    // Transformed data
    data: {
      specialties,
      subspecialties,
      cities,
      educationTypes,
      languageLevels,
      languages,
      certificateTypes,
      jobStatuses,
      applicationStatuses
    },
    
    // Raw data (for advanced usage)
    rawData: {
      specialties: specialtiesRaw || [],
      subspecialties: subspecialtiesRaw || [],
      cities: citiesRaw || [],
      educationTypes: educationTypesRaw || [],
      languageLevels: languageLevelsRaw || [],
      languages: languagesRaw || [],
      certificateTypes: certificateTypesRaw || [],
      jobStatuses: jobStatusesRaw || [],
      applicationStatuses: applicationStatusesRaw || []
    },
    
    // Loading states
    loading: {
      isLoading,
      specialtiesLoading,
      subspecialtiesLoading,
      citiesLoading,
      educationTypesLoading,
      languageLevelsLoading,
      languagesLoading,
      certificateTypesLoading,
      jobStatusesLoading,
      applicationStatusesLoading
    },
    
    // Error states
    error: {
      error,
      specialtiesError,
      subspecialtiesError,
      citiesError,
      educationTypesError,
      languageLevelsError,
      languagesError,
      certificateTypesError,
      jobStatusesError,
      applicationStatusesError
    },
    
    // Refetch functions
    refetch: {
      refetchAll,
      refetchSpecialties,
      refetchSubspecialties,
      refetchCities,
      refetchEducationTypes,
      refetchLanguageLevels,
      refetchLanguages,
      refetchCertificateTypes,
      refetchJobStatuses,
      refetchApplicationStatuses
    },
    
    // Utility functions
    utils: {
      getSpecialtyById,
      getSubspecialtyById,
      getSubspecialtiesBySpecialty,
      getCityById,
      getEducationTypeById,
      getLanguageLevelById,
      getLanguageById,
      getCertificateTypeById,
      getJobStatusById,
      getApplicationStatusById,
      getRequiredEducationTypes,
      getRequiredCertificateTypes,
      getTurkeyCities
    }
  };
};

// ============================================================================
// INDIVIDUAL LOOKUP HOOKS - Bireysel lookup hook'ları
// ============================================================================

/**
 * ============================================================================
 * USE SPECIALTIES HOOK - Sadece uzmanlık alanları hook'u
 * ============================================================================
 * 
 * Sadece uzmanlık alanlarını (ana dal/branş) getiren hook
 * useLookup hook'unun sadece specialties kısmına odaklanmış versiyonu
 * 
 * Dönüş:
 * @returns {Object} Uzmanlık alanları verisi ve durumları
 * - data: {Array} Transform edilmiş uzmanlık alanları listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: specialties, isLoading, error, refetch } = useSpecialties();
 * ```
 */
export const useSpecialties = () => {
  const { 
    data: specialtiesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.SPECIALTIES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(specialtiesRaw || []),
    rawData: specialtiesRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE SUBSPECIALTIES HOOK - Yan dal uzmanlıklar hook'u
 * ============================================================================
 * 
 * Yan dal uzmanlıklarını getiren hook
 * Opsiyonel olarak specialtyId'ye göre filtreleme yapabilir
 * 
 * Parametreler:
 * @param {number|null} specialtyId - Ana dal/branş ID'si (opsiyonel)
 *                                   Belirtilirse sadece o branşa ait yan dalları getirir
 * 
 * Dönüş:
 * @returns {Object} Yan dal uzmanlıklar verisi ve durumları
 * - data: {Array} Transform edilmiş yan dal uzmanlıkları listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * // Tüm yan dallar
 * const { data: subspecialties } = useSubspecialties();
 * 
 * // Sadece belirli branşa ait yan dallar
 * const { data: subspecialties } = useSubspecialties(5);
 * ```
 */
export const useSubspecialties = (specialtyId = null) => {
  const { 
    data: subspecialtiesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'subspecialties', specialtyId],
    queryFn: async () => {
      const url = specialtyId 
        ? `${ENDPOINTS.LOOKUP.SUBSPECIALTIES}?specialtyId=${specialtyId}`
        : ENDPOINTS.LOOKUP.SUBSPECIALTIES;
      const response = await apiRequest.get(url);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3,
    enabled: true // specialtyId olmasa bile çalışsın
  });

  return {
    data: transformLookupData(subspecialtiesRaw || []),
    rawData: subspecialtiesRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE CITIES HOOK - Şehirler hook'u
 * ============================================================================
 * 
 * Sadece şehir listesini getiren hook
 * 
 * Dönüş:
 * @returns {Object} Şehirler verisi ve durumları
 * - data: {Array} Transform edilmiş şehirler listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: cities, isLoading, error, refetch } = useCities();
 * ```
 */
export const useCities = () => {
  const { 
    data: citiesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'cities'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.CITIES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(citiesRaw || []),
    rawData: citiesRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE EDUCATION TYPES HOOK - Doktor eğitim türleri hook'u
 * ============================================================================
 * 
 * Sadece doktor eğitim türlerini getiren hook
 * 
 * Dönüş:
 * @returns {Object} Eğitim türleri verisi ve durumları
 * - data: {Array} Transform edilmiş eğitim türleri listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: educationTypes, isLoading, error, refetch } = useEducationTypes();
 * ```
 */
export const useEducationTypes = () => {
  const { 
    data: educationTypesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'doctor-education-types'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.DOCTOR_EDUCATION_TYPES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(educationTypesRaw || []),
    rawData: educationTypesRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE LANGUAGE LEVELS HOOK - Dil seviyeleri hook'u
 * ============================================================================
 * 
 * Sadece dil seviyelerini getiren hook
 * 
 * Dönüş:
 * @returns {Object} Dil seviyeleri verisi ve durumları
 * - data: {Array} Transform edilmiş dil seviyeleri listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: languageLevels, isLoading, error, refetch } = useLanguageLevels();
 * ```
 */
export const useLanguageLevels = () => {
  const { 
    data: languageLevelsRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'language-levels'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.LANGUAGE_LEVELS);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(languageLevelsRaw || []),
    rawData: languageLevelsRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE LANGUAGES HOOK - Diller hook'u
 * ============================================================================
 * 
 * Sadece dil listesini getiren hook
 * 
 * Dönüş:
 * @returns {Object} Diller verisi ve durumları
 * - data: {Array} Transform edilmiş diller listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: languages, isLoading, error, refetch } = useLanguages();
 * ```
 */
export const useLanguages = () => {
  const { 
    data: languagesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'languages'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.LANGUAGES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(languagesRaw || []),
    rawData: languagesRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE CERTIFICATE TYPES HOOK - Sertifika türleri hook'u
 * ============================================================================
 * 
 * Sadece sertifika türlerini getiren hook
 * 
 * Dönüş:
 * @returns {Object} Sertifika türleri verisi ve durumları
 * - data: {Array} Transform edilmiş sertifika türleri listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: certificateTypes, isLoading, error, refetch } = useCertificateTypes();
 * ```
 */
export const useCertificateTypes = () => {
  const { 
    data: certificateTypesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'certificate-types'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.CERTIFICATE_TYPES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(certificateTypesRaw || []),
    rawData: certificateTypesRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE JOB STATUSES HOOK - İş durumları hook'u
 * ============================================================================
 * 
 * Sadece iş ilanı durumlarını getiren hook
 * 
 * Dönüş:
 * @returns {Object} İş durumları verisi ve durumları
 * - data: {Array} Transform edilmiş iş durumları listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: jobStatuses, isLoading, error, refetch } = useJobStatuses();
 * ```
 */
export const useJobStatuses = () => {
  const { 
    data: jobStatusesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'job-statuses'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.JOB_STATUSES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(jobStatusesRaw || []),
    rawData: jobStatusesRaw || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * ============================================================================
 * USE APPLICATION STATUSES HOOK - Başvuru durumları hook'u
 * ============================================================================
 * 
 * Sadece başvuru durumlarını getiren hook
 * 
 * Dönüş:
 * @returns {Object} Başvuru durumları verisi ve durumları
 * - data: {Array} Transform edilmiş başvuru durumları listesi
 * - rawData: {Array} Ham backend verisi
 * - isLoading: {boolean} Yükleme durumu
 * - error: {Error|null} Hata durumu
 * - refetch: {Function} Yeniden yükleme fonksiyonu
 * 
 * Kullanım Örneği:
 * ```jsx
 * const { data: applicationStatuses, isLoading, error, refetch } = useApplicationStatuses();
 * ```
 */
export const useApplicationStatuses = () => {
  const { 
    data: applicationStatusesRaw, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['lookup', 'application-statuses'],
    queryFn: async () => {
      const response = await apiRequest.get(ENDPOINTS.LOOKUP.APPLICATION_STATUSES);
      const data = response.data?.data || response.data || [];
      
      return data;
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: 3
  });

  return {
    data: transformLookupData(applicationStatusesRaw || []),
    rawData: applicationStatusesRaw || [],
    isLoading,
    error,
    refetch
  };
};

export default useLookup;
