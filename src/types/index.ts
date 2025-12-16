/**
 * Central export point for all type definitions
 * Import types from here: import { User, Product, CartItem } from '@/types'
 */

// API types
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  PagedResponse,
} from './api';

// Auth types
export type {
  User,
  RegisterData,
  LoginCredentials,
  LoginResponseData,
  LoginResponse,
  AuthState,
  AuthAction,
  AuthContextValue,
  AuthResult,
  JwtPayload,
} from './auth';

// Product types
export type {
  Product,
  ProductFilterParams,
  ProductPaginationResponse,
  ProductSearchResponse,
} from './Product';

// Cart types
export type {
  CartItem,
  Cart,
  CartState,
  CartAction,
  CartContextValue,
  AddToCartRequest,
  CartResponse,
} from './cart';

// Order types
export {
  OrderStatus,
} from './order';

export type {
  OrderItem,
  Order,
  CreateOrderRequest,
  OrderFilterParams,
  OrderResponse,
  OrdersPaginationResponse,
} from './order';

// Address types
export type {
  Address,
  AddressFormData,
  AddressResponse,
  AddressesResponse,
} from './address';
