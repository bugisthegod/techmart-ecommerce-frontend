import { OperationResultPromise } from "./utils";
import type { UserResponse, UserRegisterRequest, CartItemRequest, CartResponse, CartItemResponse } from "@/api/models";

/**
 * Authentication state for AuthContext
 */
export interface AuthState {
  user: UserResponse | null;
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
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserResponse; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: { message: string } }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS' }
  | { type: 'REGISTER_FAILURE'; payload: { message: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: UserResponse; token: string } }
  | { type: 'CLEAR_ERROR' };

/**
 * Auth context value exposed to components
 */
export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (userData: UserRegisterRequest) => Promise<AuthResult>;
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
 * Cart state for CartContext
 */
export interface CartState {
  items: CartItemResponse[];
  totalItems: number;
  totalAmount?: number;
  selectedAmount?: number;
  selectedCount?: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Cart action types
 */
export type CartAction =
  | { type: "ADD_ITEM"; payload: CartResponse }
  | { type: "REMOVE_ITEM"; payload: CartResponse }
  | { type: "UPDATE_QUANTITY"; payload: CartResponse }
  | { type: "UPDATE_ITEM_SELECTION"; payload: { message: string } }
  | { type: "CLEAR_CART"; payload: { message: string } }
  | { type: "LOAD_CART"; payload: CartResponse }
  | { type: "ADD_ITEM_FAILURE"; payload: { message: string } }
  | { type: "REMOVE_ITEM_FAILURE"; payload: { message: string } }
  | { type: "UPDATE_QUANTITY_FAILURE"; payload: { message: string } }
  | { type: "CLEAR_CART_FAILURE"; payload: { message: string } }
  | { type: "LOAD_CART_FAILURE"; payload: { message: string } }
  | { type: "UPDATE_ITEM_SELECTION_FAILURE"; payload: { message: string } };

/**
 * Cart context value exposed to components
 */
export interface CartContextValue extends CartState {
  /** Add an item to the cart (cart request shape, not a Product). */
  addItem: (req: CartItemRequest) => OperationResultPromise;

  /** Remove an item from the cart by cartItemId. */
  removeItem: (cartItemId: number) => OperationResultPromise;

  /** Update quantity of a cart item. */
  updateQuantity: (cartItemId: number, quantity: number) => OperationResultPromise;

  /** Toggle selection state for a cart item. */
  updateItemSelection: (cartItemId: number, selected: number) => OperationResultPromise;

  /** Clear the entire cart. */
  clearCart: () => OperationResultPromise;

  /** Load cart from backend. */
  loadCart: () => OperationResultPromise<CartResponse>;
}
