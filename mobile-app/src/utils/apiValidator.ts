/**
 * @file apiValidator.ts
 * @description API Response Validation Utilities
 * 
 * Runtime validation for API responses to prevent silent failures.
 * Provides type-safe validation without external dependencies.
 * 
 * Features:
 * - Response structure validation
 * - Data field validation
 * - Pagination validation
 * - User-friendly error messages
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { ApiResponse, PaginationMeta } from '@/types/api';
import { devLog } from './devLogger';

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export class ApiValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate basic API response structure
 * @param response - API response to validate
 * @param endpoint - Endpoint name for error messages
 * @throws ApiValidationError if validation fails
 */
export function validateApiResponse<T>(
  response: unknown,
  endpoint: string
): asserts response is ApiResponse<T> {
  if (!response || typeof response !== 'object') {
    devLog.error(`❌ Invalid response from ${endpoint}:`, response);
    throw new ApiValidationError(
      'Sunucudan geçersiz yanıt alındı. Lütfen tekrar deneyin.'
    );
  }

  const resp = response as Record<string, unknown>;

  // Check success field
  if (typeof resp.success !== 'boolean') {
    devLog.error(`❌ Missing success field from ${endpoint}:`, response);
    throw new ApiValidationError(
      'Sunucu yanıtı beklenen formatta değil.'
    );
  }

  // If success is false, check for error message
  if (resp.success === false) {
    const message = typeof resp.message === 'string' 
      ? resp.message 
      : 'İşlem başarısız oldu.';
    throw new ApiValidationError(message);
  }

  // Check data field exists (can be null for some endpoints)
  if (!('data' in resp)) {
    devLog.error(`❌ Missing data field from ${endpoint}:`, response);
    throw new ApiValidationError(
      'Sunucu yanıtında veri bulunamadı.'
    );
  }
}

/**
 * Validate API response data is not null/undefined
 * @param response - Validated API response
 * @param endpoint - Endpoint name for error messages
 * @throws ApiValidationError if data is null/undefined
 */
export function validateResponseData<T>(
  response: ApiResponse<T>,
  endpoint: string
): asserts response is ApiResponse<NonNullable<T>> {
  if (response.data === null || response.data === undefined) {
    devLog.error(`❌ Null/undefined data from ${endpoint}:`, response);
    throw new ApiValidationError(
      'Sunucudan veri alınamadı. Lütfen tekrar deneyin.'
    );
  }
}

/**
 * Validate pagination metadata
 * @param pagination - Pagination object to validate
 * @param endpoint - Endpoint name for error messages
 * @throws ApiValidationError if validation fails
 */
export function validatePagination(
  pagination: unknown,
  endpoint: string
): asserts pagination is PaginationMeta {
  if (!pagination || typeof pagination !== 'object') {
    devLog.error(`❌ Invalid pagination from ${endpoint}:`, pagination);
    throw new ApiValidationError(
      'Sayfalama bilgisi alınamadı.'
    );
  }

  const page = pagination as Record<string, unknown>;

  const requiredFields = [
    'current_page',
    'per_page',
    'total',
    'total_pages',
    'has_next',
    'has_prev',
  ];

  for (const field of requiredFields) {
    if (!(field in page)) {
      devLog.error(`❌ Missing pagination field '${field}' from ${endpoint}:`, pagination);
      throw new ApiValidationError(
        'Sayfalama bilgisi eksik.',
        field
      );
    }
  }

  // Type checks
  if (typeof page.current_page !== 'number' ||
      typeof page.per_page !== 'number' ||
      typeof page.total !== 'number' ||
      typeof page.total_pages !== 'number' ||
      typeof page.has_next !== 'boolean' ||
      typeof page.has_prev !== 'boolean') {
    devLog.error(`❌ Invalid pagination field types from ${endpoint}:`, pagination);
    throw new ApiValidationError(
      'Sayfalama bilgisi geçersiz formatta.'
    );
  }
}

/**
 * Validate array response data
 * @param data - Data to validate as array
 * @param endpoint - Endpoint name for error messages
 * @throws ApiValidationError if not an array
 */
export function validateArrayData<T>(
  data: unknown,
  endpoint: string
): asserts data is T[] {
  if (!Array.isArray(data)) {
    devLog.error(`❌ Expected array from ${endpoint}, got:`, typeof data);
    throw new ApiValidationError(
      'Sunucudan liste formatında veri bekleniyor.'
    );
  }
}

// ============================================================================
// COMBINED VALIDATORS (for common patterns)
// ============================================================================

/**
 * Validate paginated list response (common pattern)
 * @param response - API response
 * @param endpoint - Endpoint name
 * @returns Validated data and pagination
 */
export function validatePaginatedResponse<T>(
  response: unknown,
  endpoint: string
): { data: T[]; pagination: PaginationMeta } {
  // Validate basic structure
  validateApiResponse<T[]>(response, endpoint);
  
  const resp = response as ApiResponse<T[]>;
  
  // Validate data exists and is array
  validateResponseData(resp, endpoint);
  validateArrayData(resp.data, endpoint);
  
  // Validate pagination
  const pagination = resp.pagination || resp.meta;
  validatePagination(pagination, endpoint);
  
  return {
    data: resp.data,
    pagination: pagination as PaginationMeta,
  };
}

/**
 * Validate single item response (common pattern)
 * @param response - API response
 * @param endpoint - Endpoint name
 * @returns Validated data
 */
export function validateSingleItemResponse<T>(
  response: unknown,
  endpoint: string
): T {
  // Validate basic structure
  validateApiResponse<T>(response, endpoint);
  
  const resp = response as ApiResponse<T>;
  
  // Validate data exists
  validateResponseData(resp, endpoint);
  
  return resp.data;
}

/**
 * Safe validator - returns null instead of throwing
 * Useful for optional data or graceful degradation
 */
export function safeValidate<T>(
  validator: () => T,
  fallback: T
): T {
  try {
    return validator();
  } catch (error) {
    if (error instanceof ApiValidationError) {
      devLog.warn('⚠️ Validation failed, using fallback:', error.message);
      return fallback;
    }
    throw error;
  }
}
