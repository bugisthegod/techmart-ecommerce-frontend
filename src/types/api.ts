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
 * Generic operation result used by frontend services/contexts.
 *
 * Unlike ApiResponse<T>, this is meant for *client-side functions* that may fail
 * due to network/runtime issues, so the `data` field is optional.
 */
export type OperationResult<T = void> = {
  success: boolean;
  message?: string;
  errors?: unknown;
  data?: T;
};

/** Convenience helper for async operations. */
export type OperationResultPromise<T = void> = Promise<OperationResult<T>>;

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
