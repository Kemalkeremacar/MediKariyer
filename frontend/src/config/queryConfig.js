/**
 * @file queryConfig.js
 * @description React Query Configuration Factory
 * 
 * Merkezi cache ve refetch stratejisi yönetimi.
 * Büyük projelerde kullanılan best practice yaklaşımı.
 * 
 * Stratejiler:
 * 1. REALTIME: Gerçek zamanlı veri (dashboard, profil, bildirimler)
 * 2. SEMI_REALTIME: Yarı gerçek zamanlı (listeler, tablolar)
 * 3. STATIC: Nadiren değişen veri (lookup tables, settings)
 * 4. INFINITE: Infinite scroll için
 * 5. CUSTOM: Özel durumlar için
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// QUERY STRATEGIES - Veri tipine göre cache stratejileri
// ============================================================================

/**
 * Query Stratejileri
 * Her veri tipi için optimize edilmiş cache ve refetch ayarları
 */
export const QUERY_STRATEGIES = {
  /**
   * REALTIME: Gerçek zamanlı veri gereksinimi
   * Kullanım: Profil fotoğrafı, dashboard, başvuru durumları, bildirimler
   * 
   * Özellikler:
   * - staleTime: 0 → Her zaman fresh data
   * - refetchOnMount: true → Her mount'ta yenile
   * - refetchOnWindowFocus: true → Pencere focus'unda yenile
   * - cacheTime: 5 min → Background'da cache tut
   */
  REALTIME: {
    staleTime: 0,
    cacheTime: 5 * 60 * 1000, // 5 dakika
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  },
  /**
   * LIVE: Tamamen canlı veri
   * Kullanım: Başvurular, onay süreçleri gibi anlık değişen veriler
   * - staleTime: 0 → Her zaman fresh
   * - cacheTime: 0 → Query kullanılmadığında hemen sil
   */
  LIVE: {
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 0,
  },

  /**
   * SEMI_REALTIME: Orta sıklıkta güncellenen veri
   * Kullanım: İş ilanı listeleri, başvuru listeleri (filtreli)
   * 
   * Özellikler:
   * - staleTime: 30s → 30 saniye cache
   * - refetchOnMount: false → Cache'den kullan
   * - refetchOnWindowFocus: false → Focus'ta yenileme yok
   * - cacheTime: 5 min → Background'da cache tut
   */
  SEMI_REALTIME: {
    staleTime: 30 * 1000, // 30 saniye
    cacheTime: 5 * 60 * 1000, // 5 dakika
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  },

  /**
   * STATIC: Nadiren değişen veri
   * Kullanım: Lookup tables (şehirler, uzmanlıklar, diller)
   * 
   * Özellikler:
   * - staleTime: 30 min → 30 dakika cache
   * - refetchOnMount: false → Cache'den kullan
   * - refetchOnWindowFocus: false → Focus'ta yenileme yok
   * - cacheTime: 60 min → Background'da uzun süre tut
   */
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 dakika
    cacheTime: 60 * 60 * 1000, // 60 dakika
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  },

  /**
   * INFINITE: Infinite scroll için
   * Kullanım: Sonsuz scroll listeler
   * 
   * Özellikler:
   * - staleTime: 1 min → 1 dakika cache
   * - getNextPageParam: Manuel olarak eklenmeli
   */
  INFINITE: {
    staleTime: 60 * 1000, // 1 dakika
    cacheTime: 10 * 60 * 1000, // 10 dakika
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  },

  /**
   * NO_CACHE: Cache kullanma
   * Kullanım: Hassas veriler, tek kullanımlık sorgular
   */
  NO_CACHE: {
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 0,
  },
};

// ============================================================================
// QUERY CONFIG FACTORY - Query ayarları oluşturma fonksiyonları
// ============================================================================

/**
 * Query config oluşturur
 * @param {string} strategy - Strateji adı (REALTIME, SEMI_REALTIME, STATIC, INFINITE, NO_CACHE)
 * @param {Object} overrides - Varsayılan değerleri ezecek ayarlar
 * @returns {Object} Query config objesi
 * 
 * @example
 * const config = createQueryConfig('REALTIME', { retry: 2 });
 */
export const createQueryConfig = (strategy = 'SEMI_REALTIME', overrides = {}) => {
  const baseConfig = QUERY_STRATEGIES[strategy] || QUERY_STRATEGIES.SEMI_REALTIME;
  
  return {
    ...baseConfig,
    ...overrides,
  };
};

/**
 * Profil query config'i (fotoğraf, kişisel bilgiler)
 * REALTIME strateji - Her zaman güncel olmalı
 */
export const profileQueryConfig = (overrides = {}) => 
  createQueryConfig('REALTIME', overrides);

/**
 * Dashboard query config'i
 * REALTIME strateji - İstatistikler güncel olmalı
 */
export const dashboardQueryConfig = (overrides = {}) => 
  createQueryConfig('REALTIME', overrides);

/**
 * Liste query config'i (iş ilanları, başvurular)
 * SEMI_REALTIME strateji - Performans odaklı
 */
export const listQueryConfig = (overrides = {}) => 
  createQueryConfig('SEMI_REALTIME', overrides);

/**
 * Detay query config'i (iş ilanı detayı, başvuru detayı)
 * SEMI_REALTIME strateji - Orta sıklıkta güncelleme
 */
export const detailQueryConfig = (overrides = {}) => 
  createQueryConfig('SEMI_REALTIME', overrides);

/**
 * Lookup query config'i (şehirler, uzmanlıklar)
 * STATIC strateji - Nadiren değişir
 */
export const lookupQueryConfig = (overrides = {}) => 
  createQueryConfig('STATIC', overrides);

/**
 * Bildirim query config'i
 * REALTIME strateji - Bildirimler hemen görünmeli
 */
export const notificationQueryConfig = (overrides = {}) => 
  createQueryConfig('REALTIME', overrides);

/**
 * Admin query config'i
 * REALTIME strateji - Admin tüm değişiklikleri hemen görmeli
 */
export const adminQueryConfig = (overrides = {}) => 
  createQueryConfig('REALTIME', overrides);

/**
 * Photo request query config'i
 * REALTIME strateji - Fotoğraf durumu hemen güncellensin
 */
export const photoQueryConfig = (overrides = {}) => 
  createQueryConfig('REALTIME', overrides);

/**
 * Live query config'i
 * Tamamen cache'siz ve her seferinde yenilenen sorgular için
 */
export const liveQueryConfig = (overrides = {}) => 
  createQueryConfig('LIVE', overrides);

// ============================================================================
// MUTATION CONFIG - Mutation ayarları
// ============================================================================

/**
 * Standart mutation config'i
 */
export const mutationConfig = {
  retry: 0, // Mutation'larda retry yapma (kullanıcı tekrar denesin)
  onError: (error) => {
    console.error('Mutation error:', error);
  },
};

// ============================================================================
// CONDITIONAL CONFIG - Koşullu ayarlar
// ============================================================================

/**
 * Koşullu query config oluşturur
 * @param {boolean} isEnabled - Query aktif mi?
 * @param {string} strategy - Strateji adı
 * @param {Object} overrides - Ek ayarlar
 * @returns {Object} Query config
 * 
 * @example
 * const config = createConditionalQueryConfig(isDoctor, 'REALTIME');
 */
export const createConditionalQueryConfig = (isEnabled, strategy = 'SEMI_REALTIME', overrides = {}) => ({
  ...createQueryConfig(strategy, overrides),
  enabled: isEnabled,
});

// ============================================================================
// HELPER FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

/**
 * Query stratejisini veri tipine göre otomatik seçer
 * @param {string} dataType - Veri tipi (profile, dashboard, list, detail, lookup, notification, admin)
 * @returns {Object} Query config
 * 
 * @example
 * const config = getQueryConfigByDataType('profile');
 */
export const getQueryConfigByDataType = (dataType) => {
  const configMap = {
    profile: profileQueryConfig(),
    dashboard: dashboardQueryConfig(),
    list: listQueryConfig(),
    detail: detailQueryConfig(),
    lookup: lookupQueryConfig(),
    notification: notificationQueryConfig(),
    admin: adminQueryConfig(),
    photo: photoQueryConfig(),
  };

  return configMap[dataType] || listQueryConfig();
};

/**
 * Debug için query config'i loga yazar
 * @param {string} hookName - Hook adı
 * @param {Object} config - Query config
 */
export const logQueryConfig = (hookName, config) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Query Config: ${hookName}`);
    console.table({
      staleTime: `${config.staleTime / 1000}s`,
      cacheTime: `${config.cacheTime / 1000}s`,
      refetchOnMount: config.refetchOnMount,
      refetchOnWindowFocus: config.refetchOnWindowFocus,
      retry: config.retry,
    });
    console.groupEnd();
  }
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  QUERY_STRATEGIES,
  createQueryConfig,
  profileQueryConfig,
  dashboardQueryConfig,
  listQueryConfig,
  detailQueryConfig,
  lookupQueryConfig,
  notificationQueryConfig,
  adminQueryConfig,
  photoQueryConfig,
  mutationConfig,
  createConditionalQueryConfig,
  getQueryConfigByDataType,
  logQueryConfig,
};

