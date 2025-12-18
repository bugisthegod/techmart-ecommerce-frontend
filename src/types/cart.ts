import { ApiResponse, OperationResultPromise } from "./api";
import { Product } from "./Product";

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
  | { type: "ADD_ITEM"; payload: Cart }
  | { type: "REMOVE_ITEM"; payload: Cart }
  | { type: "UPDATE_QUANTITY"; payload: Cart }
  | { type: "UPDATE_ITEM_SELECTION"; payload: { message: string } }
  | { type: "CLEAR_CART"; payload: { message: string } }
  | { type: "LOAD_CART"; payload: Cart }
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
  addItem: (req: AddToCartRequest) => OperationResultPromise;

  /** Remove an item from the cart by cartItemId. */
  removeItem: (cartItemId: number) => OperationResultPromise;

  /** Update quantity of a cart item. */
  updateQuantity: (cartItemId: number, quantity: number) => OperationResultPromise;

  /** Toggle selection state for a cart item. */
  updateItemSelection: (cartItemId: number, selected: number) => OperationResultPromise;

  /** Clear the entire cart. */
  clearCart: () => OperationResultPromise;

  /** Load cart from backend. */
  loadCart: () => OperationResultPromise<Cart>;
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
