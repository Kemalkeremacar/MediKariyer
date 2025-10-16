/**
 * Lookup Hook - Sistem lookup verileri için hook
 * 
 * Bu hook sistem genelinde kullanılan lookup verilerini sağlar:
 * - Uzmanlık alanları (specialties)
 * - Şehirler (cities) 
 * - Doktor eğitim türleri (doctor_education_types)
 * - Dil seviyeleri (language_levels)
 * - Diller (languages)
 * - Sertifika türleri (certificate_types)
 * - İş durumları (job_statuses)
 * - Başvuru durumları (application_statuses)
 * 
 * Bu veriler doktor/hastane profilleri oluştururken, iş ilanları oluştururken
 * ve admin sayfalarında dropdown/select bileşenleri için kullanılır.
 * 
 * Backend Uyumluluğu:
 * - Backend lookupService.js ile tam uyumlu
 * - Backend lookupController.js ile tam uyumlu
 * - Backend lookupRoutes.js ile tam uyumlu
 * - Frontend lookupSchemas.js ile validasyon desteği
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
 * Ana Lookup Hook
 * @description Tüm lookup verilerini yöneten ana hook
 * 
 * @returns {Object} Lookup verileri ve durumları
 * @returns {Object} data - Tüm lookup verileri
 * @returns {Object} loading - Loading durumları
 * @returns {Object} error - Hata durumları
 * @returns {Object} refetch - Yeniden yükleme fonksiyonları
 * @returns {Object} utils - Yardımcı fonksiyonlar
 * 
 * @example
 * const { 
 *   data: { specialties, cities, educationTypes },
 *   loading: { isLoading, specialtiesLoading },
 *   error: { error, specialtiesError },
 *   refetch: { refetchAll, refetchSpecialties },
 *   utils: { getSpecialtyById, getCityById }
 * } = useLookup();
 */
export const useLookup = () => {
  // ==================== QUERY CONFIGURATION ====================
  
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

  // ==================== INDIVIDUAL QUERIES ====================

  /**
   * Uzmanlık Alanları Query
   * @description Uzmanlık alanlarını getirir ve validasyon yapar
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
   * Yan Dal Alanları Query
   * @description Yan dal alanlarını getirir ve validasyon yapar
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
   * @description Şehirleri getirir ve validasyon yapar
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
   * @description Doktor eğitim türlerini getirir ve validasyon yapar
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
   * @description Dil seviyelerini getirir ve validasyon yapar
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
   * @description Dilleri getirir ve validasyon yapar
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
   * @description Sertifika türlerini getirir ve validasyon yapar
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
   * @description İş durumlarını getirir ve validasyon yapar
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
   * @description Başvuru durumlarını getirir ve validasyon yapar
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

  // ==================== DATA TRANSFORMATION ====================

  /**
   * Raw verileri frontend formatına çevir
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

  // ==================== LOADING STATES ====================

  const isLoading = specialtiesLoading || subspecialtiesLoading || citiesLoading || educationTypesLoading || 
                   languageLevelsLoading || languagesLoading || certificateTypesLoading ||
                   jobStatusesLoading || applicationStatusesLoading;

  // ==================== ERROR STATES ====================

  const error = specialtiesError || subspecialtiesError || citiesError || educationTypesError ||
               languageLevelsError || languagesError || certificateTypesError ||
               jobStatusesError || applicationStatusesError;

  // ==================== REFETCH FUNCTIONS ====================

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

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * ID'ye göre uzmanlık alanı bul
   * @param {number} id - Uzmanlık alanı ID'si
   * @returns {Object|null} Uzmanlık alanı objesi
   */
  const getSpecialtyById = (id) => {
    return specialties.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre yan dal bul
   * @param {number} id - Yan dal ID'si
   * @returns {Object|null} Yan dal objesi
   */
  const getSubspecialtyById = (id) => {
    return subspecialties.find(item => item.value === id) || null;
  };

  /**
   * Branşa göre yan dalları getir
   * @param {number} specialtyId - Branş ID'si
   * @returns {Array} Yan dallar listesi
   */
  const getSubspecialtiesBySpecialty = (specialtyId) => {
    return subspecialties.filter(item => item.specialty_id === specialtyId);
  };

  /**
   * ID'ye göre şehir bul
   * @param {number} id - Şehir ID'si
   * @returns {Object|null} Şehir objesi
   */
  const getCityById = (id) => {
    return cities.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre eğitim türü bul
   * @param {number} id - Eğitim türü ID'si
   * @returns {Object|null} Eğitim türü objesi
   */
  const getEducationTypeById = (id) => {
    return educationTypes.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre dil seviyesi bul
   * @param {number} id - Dil seviyesi ID'si
   * @returns {Object|null} Dil seviyesi objesi
   */
  const getLanguageLevelById = (id) => {
    return languageLevels.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre dil bul
   * @param {number} id - Dil ID'si
   * @returns {Object|null} Dil objesi
   */
  const getLanguageById = (id) => {
    return languages.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre sertifika türü bul
   * @param {number} id - Sertifika türü ID'si
   * @returns {Object|null} Sertifika türü objesi
   */
  const getCertificateTypeById = (id) => {
    return certificateTypes.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre iş durumu bul
   * @param {number} id - İş durumu ID'si
   * @returns {Object|null} İş durumu objesi
   */
  const getJobStatusById = (id) => {
    return jobStatuses.find(item => item.value === id) || null;
  };

  /**
   * ID'ye göre başvuru durumu bul
   * @param {number} id - Başvuru durumu ID'si
   * @returns {Object|null} Başvuru durumu objesi
   */
  const getApplicationStatusById = (id) => {
    return applicationStatuses.find(item => item.value === id) || null;
  };

  /**
   * Zorunlu eğitim türlerini getir
   * @returns {Array} Zorunlu eğitim türleri
   */
  const getRequiredEducationTypes = () => {
    return educationTypes.filter(item => item.is_required);
  };

  /**
   * Zorunlu sertifika türlerini getir
   * @returns {Array} Zorunlu sertifika türleri
   */
  const getRequiredCertificateTypes = () => {
    return certificateTypes.filter(item => item.is_required);
  };

  /**
   * Türkiye şehirlerini getir
   * @returns {Array} Türkiye şehirleri
   */
  const getTurkeyCities = () => {
    return cities.filter(item => item.country === 'Turkey');
  };

  // ==================== RETURN OBJECT ====================

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

// ==================== INDIVIDUAL LOOKUP HOOKS ====================

/**
 * Uzmanlık Alanları Hook
 * @description Sadece uzmanlık alanlarını getiren hook
 * 
 * @returns {Object} Uzmanlık alanları verisi ve durumları
 * 
 * @example
 * const { data: specialties, isLoading, error, refetch } = useSpecialties();
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
 * Yan Dal Uzmanlıklar Hook
 * @description Yan dal uzmanlıklarını getiren hook (specialtyId'ye göre filtrelenebilir)
 * 
 * @param {number|null} specialtyId - Uzmanlık ID'si (opsiyonel, filtreleme için)
 * @returns {Object} Yan dal uzmanlıklar verisi ve durumları
 * 
 * @example
 * const { data: subspecialties, isLoading, error, refetch } = useSubspecialties(5);
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
 * Şehirler Hook
 * @description Sadece şehirleri getiren hook
 * 
 * @returns {Object} Şehirler verisi ve durumları
 * 
 * @example
 * const { data: cities, isLoading, error, refetch } = useCities();
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
 * Doktor Eğitim Türleri Hook
 * @description Sadece doktor eğitim türlerini getiren hook
 * 
 * @returns {Object} Eğitim türleri verisi ve durumları
 * 
 * @example
 * const { data: educationTypes, isLoading, error, refetch } = useEducationTypes();
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
 * Dil Seviyeleri Hook
 * @description Sadece dil seviyelerini getiren hook
 * 
 * @returns {Object} Dil seviyeleri verisi ve durumları
 * 
 * @example
 * const { data: languageLevels, isLoading, error, refetch } = useLanguageLevels();
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
 * Diller Hook
 * @description Sadece dilleri getiren hook
 * 
 * @returns {Object} Diller verisi ve durumları
 * 
 * @example
 * const { data: languages, isLoading, error, refetch } = useLanguages();
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
 * Sertifika Türleri Hook
 * @description Sadece sertifika türlerini getiren hook
 * 
 * @returns {Object} Sertifika türleri verisi ve durumları
 * 
 * @example
 * const { data: certificateTypes, isLoading, error, refetch } = useCertificateTypes();
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
 * İş Durumları Hook
 * @description Sadece iş durumlarını getiren hook
 * 
 * @returns {Object} İş durumları verisi ve durumları
 * 
 * @example
 * const { data: jobStatuses, isLoading, error, refetch } = useJobStatuses();
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
 * Başvuru Durumları Hook
 * @description Sadece başvuru durumlarını getiren hook
 * 
 * @returns {Object} Başvuru durumları verisi ve durumları
 * 
 * @example
 * const { data: applicationStatuses, isLoading, error, refetch } = useApplicationStatuses();
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
