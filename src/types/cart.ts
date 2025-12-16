import { ApiResponse } from './api';
import { Product } from './Product';

/**
 * Cart item structure
 */
export interface CartItem {
  id: number;
  cartItemId?: number;
  userId: number;
  productId: number;
  product: Product;
  quantity: number;
  selected: number; // 1 = selected, 0 = not selected
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Cart structure
 */
export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

/**
 * Cart state for CartContext
 */
export interface CartState extends Cart {
  isLoading: boolean;
  error: string | null;
}

/**
 * Cart action types
 */
export type CartAction =
  | { type: 'ADD_ITEM'; payload: Cart }
  | { type: 'REMOVE_ITEM'; payload: Cart }
  | { type: 'UPDATE_QUANTITY'; payload: Cart }
  | { type: 'UPDATE_ITEM_SELECTION' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart }
  | { type: 'ADD_ITEM_FAILURE'; payload: { message: string } }
  | { type: 'REMOVE_ITEM_FAILURE'; payload: { message: string } }
  | { type: 'UPDATE_QUANTITY_FAILURE'; payload: { message: string } }
  | { type: 'CLEAR_CART_FAILURE'; payload: { message: string } }
  | { type: 'LOAD_CART_FAILURE'; payload: { message: string } }
  | { type: 'UPDATE_ITEM_SELECTION_FAILURE'; payload: { message: string } };

/**
 * Cart context value exposed to components
 */
export interface CartContextValue extends CartState {
  addItem: (product: Product) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  updateItemSelection: (cartItemId: number, selected: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
}

/**
 * Add to cart request
 */
export interface AddToCartRequest {
  productId: number;
  quantity: number;
  selected: number;
}

/**
 * Cart response from API
 */
export type CartResponse = ApiResponse<Cart>;
