/**
 * Generic API response wrapper
 * The backend returns responses in a consistent format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API error structure
 */
export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Paginated response structure
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
