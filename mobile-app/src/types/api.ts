/**
 * API Response Types - Stabilizasyon Faz 1
 * Backend Mobile API endpoint'lerinden dönen yanıtlar için tip tanımları
 * 
 * Backend Response Format:
 * {
 *   success: boolean,
 *   message?: string,
 *   data: T,
 *   pagination?: PaginationMeta  // Bazı endpoint'lerde
 * }
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  // Backend'den pagination olarak gelebilir (tutarlılık için her ikisini de destekle)
  meta?: PaginationMeta;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  success: boolean;
  message: string;
  error?: string;
  errors?: Record<string, string[]> | string[];
  errorCode?: string;
}

/**
 * Helper type for paginated responses
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
