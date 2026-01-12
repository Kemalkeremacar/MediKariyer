/**
 * @file api.ts
 * @description API yanıt tipleri - Backend Mobile API endpoint'lerinden dönen yanıtlar için
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Backend Yanıt Formatı:**
 * ```json
 * {
 *   "success": boolean,
 *   "message": string (opsiyonel),
 *   "data": T,
 *   "pagination": PaginationMeta (bazı endpoint'lerde)
 * }
 * ```
 */

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Genel API yanıt yapısı
 * 
 * @template T - Yanıt data tipi
 */
export interface ApiResponse<T> {
  /** İşlem başarılı mı? */
  success: boolean;
  /** Opsiyonel mesaj (hata veya bilgi mesajı) */
  message?: string;
  /** Yanıt verisi */
  data: T;
  /** Pagination metadata (bazı endpoint'lerde meta olarak gelir) */
  meta?: PaginationMeta;
  /** Pagination metadata (bazı endpoint'lerde pagination olarak gelir) */
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata yapısı
 */
export interface PaginationMeta {
  /** Mevcut sayfa numarası */
  current_page: number;
  /** Sayfa başına öğe sayısı */
  per_page: number;
  /** Toplam öğe sayısı */
  total: number;
  /** Toplam sayfa sayısı */
  total_pages: number;
  /** Sonraki sayfa var mı? */
  has_next: boolean;
  /** Önceki sayfa var mı? */
  has_prev: boolean;
}

/**
 * API hata yanıt yapısı
 */
export interface ApiError {
  /** İşlem başarısız (false) */
  success: boolean;
  /** Hata mesajı */
  message: string;
  /** Detaylı hata açıklaması */
  error?: string;
  /** Validasyon hataları (field bazlı veya genel) */
  errors?: Record<string, string[]> | string[];
  /** Hata kodu */
  errorCode?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Sayfalanmış yanıtlar için yardımcı tip
 * 
 * @template T - Liste öğesi tipi
 */
export interface PaginatedResponse<T> {
  /** Veri listesi */
  data: T[];
  /** Pagination bilgisi */
  pagination: PaginationMeta;
}
