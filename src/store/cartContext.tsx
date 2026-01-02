import React, { createContext, useContext, useReducer, useEffect } from "react";
import cartService from "../services/cartService";
import type { CartState, CartAction, CartContextValue } from "@/types";
import type { CartItemRequest } from "@/api/models";
import { logger } from "@/lib/logger";
import { useAuth } from "./authContext";
import { toast } from "sonner";

// Define all possible cart actions
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  UPDATE_ITEM_SELECTION: "UPDATE_ITEM_SELECTION",
  CLEAR_CART: "CLEAR_CART",
  LOAD_CART: "LOAD_CART",
  ADD_ITEM_FAILURE: "ADD_ITEM_FAILURE",
  REMOVE_ITEM_FAILURE: "REMOVE_ITEM_FAILURE",
  UPDATE_QUANTITY_FAILURE: "UPDATE_QUANTITY_FAILURE",
  CLEAR_CART_FAILURE: "CLEAR_CART_FAILURE",
  LOAD_CART_FAILURE: "LOAD_CART_FAILURE",
  UPDATE_ITEM_SELECTION_FAILURE: "UPDATE_ITEM_SELECTION_FAILURE",
} as const;

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  selectedAmount: 0,
  selectedCount: 0,
  isLoading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  // Some actions carry different payload shapes; log the whole action safely.
  logger.log("action", action);
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalAmount: action.payload.totalAmount || 0,
        selectedAmount: action.payload.selectedAmount || 0,
        selectedCount: action.payload.selectedCount || 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalAmount: action.payload.totalAmount || 0,
        selectedAmount: action.payload.selectedAmount || 0,
        selectedCount: action.payload.selectedCount || 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalAmount: action.payload.totalAmount || 0,
        selectedAmount: action.payload.selectedAmount || 0,
        selectedCount: action.payload.selectedCount || 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.UPDATE_ITEM_SELECTION:
      // Update the specific item's selection status
      const updatedItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, selected: action.payload.selected }
          : item
      );

      // Recalculate selected totals
      const selectedAmount = updatedItems.reduce((sum, item) =>
        item.selected === 1 ? sum + ((item.productPrice ?? 0) * (item.quantity ?? 0)) : sum, 0
      );
      const selectedCount = updatedItems.filter(item => item.selected === 1).length;

      return {
        ...state,
        items: updatedItems,
        selectedAmount,
        selectedCount,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        selectedAmount: 0,
        selectedCount: 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalAmount: action.payload.totalAmount || 0,
        selectedAmount: action.payload.selectedAmount || 0,
        selectedCount: action.payload.selectedCount || 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_ITEM_FAILURE:
    case CART_ACTIONS.REMOVE_ITEM_FAILURE:
    case CART_ACTIONS.UPDATE_QUANTITY_FAILURE:
    case CART_ACTIONS.CLEAR_CART_FAILURE:
    case CART_ACTIONS.LOAD_CART_FAILURE:
    case CART_ACTIONS.UPDATE_ITEM_SELECTION_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.message,
      };

    default:
      return state;
  }
}

// Create the Context
const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Sync cart with authentication state
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      // Clear local cart state on logout
      dispatch({
        type: CART_ACTIONS.CLEAR_CART,
        payload: { message: "Logged out" }
      });
    }
  }, [isAuthenticated]);

  const addItem: CartContextValue["addItem"] = async (req: CartItemRequest) => {
    try {
      const result = await cartService.addToCart(req);

      if (result.success && result.data) {
        dispatch({
          type: CART_ACTIONS.ADD_ITEM,
          payload: result.data,
        });
        return { success: true, message: result.message };
      }

      const errorMessage = result.message ?? "Add item failed. Please try again.";
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        errors: result.errors,
      };
    } catch {
      const errorMessage = "Add item failed. Please try again.";
      toast.error(errorMessage);

      dispatch({
        type: CART_ACTIONS.ADD_ITEM_FAILURE,
        payload: { message: errorMessage },
      });

      return { success: false, message: errorMessage };
    }
  };

  const removeItem: CartContextValue["removeItem"] = async (productId: number) => {
    try {
      const result = await cartService.removeFromCart(productId);

      if (result.success && result.data) {
        dispatch({
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: result.data,
        });
        return { success: true, message: result.message };
      }

      const errorMessage = result.message ?? "Remove item failed. Please try again.";
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        errors: result.errors,
      };
    } catch {
      const errorMessage = "remove item failed. Please try again.";
      toast.error(errorMessage);

      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM_FAILURE,
        payload: { message: errorMessage },
      });

      return { success: false, message: errorMessage };
    }
  };

  const updateQuantity: CartContextValue["updateQuantity"] = async (
    cartItemId: number,
    quantity: number
  ) => {
    try {
      const result = await cartService.updateQuantity(cartItemId, quantity);
      logger.log("updateQuantity result", result);
      if (result.success && result.data) {
        dispatch({
          type: CART_ACTIONS.UPDATE_QUANTITY,
          payload: result.data,
        });
        return { success: true, message: result.message };
      }

      const errorMessage = result.message ?? "Update quantity failed. Please try again.";
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        errors: result.errors,
      };
    } catch {
      const errorMessage = "Update quantity failed. Please try again.";
      toast.error(errorMessage);

      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY_FAILURE,
        payload: { message: errorMessage },
      });

      return { success: false, message: errorMessage };
    }
  };


  const updateItemSelection: CartContextValue["updateItemSelection"] = async (
    cartItemId: number,
    selected: number
  ) => {
    try {
      // Optimistically update local state
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_SELECTION,
        payload: { itemId: cartItemId, selected }
      });

      const result = await cartService.updateItemSelection(cartItemId, selected);
      logger.log("updateItemSelection result", result);

      if (result.success) {
        return { success: true, message: result.message };
      }

      // If API call failed, reload cart to revert optimistic update
      await loadCart();
      return {
        success: false,
        message: result.message ?? "Update item selection failed. Please try again.",
        errors: result.errors,
      };
    } catch {
      const errorMessage = "Update item selection failed. Please try again.";

      // Reload cart to revert optimistic update
      await loadCart();

      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_SELECTION_FAILURE,
        payload: { message: errorMessage },
      });

      return { success: false, message: errorMessage };
    }
  };

  const loadCart: CartContextValue["loadCart"] = async () => {
    try {
      const result = await cartService.loadCart();
      logger.log("loadCartresult", result);
      if (result.success && result.data) {
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: result.data,
        });
        return { success: true, message: result.message, data: result.data };
      }

      const errorMessage = result.message ?? "Load cart failed. Please try again.";
      dispatch({
        type: CART_ACTIONS.LOAD_CART_FAILURE,
        payload: { message: errorMessage },
      });
      return { success: false, message: errorMessage, errors: result.errors };
    } catch {
      const errorMessage = "Load cart failed. Please try again.";
      dispatch({
        type: CART_ACTIONS.LOAD_CART_FAILURE,
        payload: { message: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  const clearCart: CartContextValue["clearCart"] = async () => {
    try {
      const result = await cartService.clearCart();
      if (result.success) {
        dispatch({
          type: CART_ACTIONS.CLEAR_CART,
          payload: { message: result.message ?? "Cart cleared" }
        });
        return { success: true, message: result.message };
      }

      const errorMessage = result.message ?? "Clear cart failed. Please try again.";
      dispatch({
        type: CART_ACTIONS.CLEAR_CART_FAILURE,
        payload: { message: errorMessage },
      });
      return { success: false, message: errorMessage, errors: result.errors };
    } catch {
      const errorMessage = "Clear cart failed. Please try again.";
      dispatch({
        type: CART_ACTIONS.CLEAR_CART_FAILURE,
        payload: { message: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  const value: CartContextValue = {
    items: state.items,
    totalItems: state.totalItems,
    totalAmount: state.totalAmount,
    selectedAmount: state.selectedAmount,
    selectedCount: state.selectedCount,
    isLoading: state.isLoading,
    error: state.error,
    addItem,
    removeItem,
    updateQuantity,
    updateItemSelection,
    clearCart,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within an cartProvider");
  }

  return context;
}

// Export the context for advanced use cases
export { CartContext };
// const getCartTotal
