export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  pagination?: PaginationMeta; // Backend'den pagination olarak gelebilir
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
  errorCode?: string;
}

