import { ApiResponse } from './api';

/**
 * User information structure
 */
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: number; // 1 = active, 0 = inactive
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User registration data
 */
export interface RegisterData {
  username: string;
  password: string;
  email: string;
  phone?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponseData {
  token: string;
  userInfo: User;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

/**
 * Authentication state for AuthContext
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication action types
 */
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: { message: string } }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS' }
  | { type: 'REGISTER_FAILURE'; payload: { message: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } }
  | { type: 'CLEAR_ERROR' };

/**
 * Auth context value exposed to components
 */
export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Result returned by auth operations
 */
export interface AuthResult {
  success: boolean;
  message: string;
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
