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
 * JWT token payload structure
 */
export interface JwtPayload {
  sub: string;
  exp: number;
  iat?: number;
  [key: string]: unknown;
}
