import React, { createContext, useContext, useReducer, useEffect } from "react";
import cartService from "../services/cartService";
import { message } from "antd";
import authService from "../services/authService";

// Define all possible cart actions
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  LOAD_CART: "LOAD_CART",
  ADD_ITEM_FAILURE: "ADD_ITEM_FAILURE",
  REMOVE_ITEM_FAILURE: "REMOVE_ITEM_FAILURE",
  UPDATE_QUANTITY_FAILURE: "UPDATE_QUANTITY_FAILURE",
  CLEAR_CART_FAILURE: "CLEAR_CART_FAILURE",
  LOAD_CART_FAILURE: "LOAD_CART_FAILURE",
  CLEAR_CART_FAILURE: "CLEAR_CART_FAILURE",
};

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

function cartReducer(state, action) {
  console.log("action",action.payload);
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalPrice: action.payload.totalPrice || 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_ITEM_FAILURE:
    case CART_ACTIONS.REMOVE_ITEM_FAILURE:
    case CART_ACTIONS.UPDATE_QUANTITY_FAILURE:
    case CART_ACTIONS.CLEAR_CART_FAILURE:
    case CART_ACTIONS.LOAD_CART_FAILURE:
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
const CartContext = createContext();

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadCart();
    }
  }, []);

  const addItem = async (product) => {
    try {
      const result = await cartService.addToCart(product);

      if (result.success) {
        dispatch({
          type: CART_ACTIONS.ADD_ITEM,
          payload: result.data,
        });
        return { success: true, message: result.message };
      }
    } catch (error) {
      const errorMessage = "Add item failed. Please try again.";

      dispatch({
        type: CART_ACTIONS.ADD_ITEM_FAILURE,
        payload: { message: errorMessage },
      });

      return { success: false, message: errorMessage };
    }
  };

  const removeItem = async (productId) => {
    try {
      const result = await cartService.removeFromCart(productId);

      if (result.success) {
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM });
        return { success: true, message: result.message };
      }
    } catch (error) {
      const errorMessage = "remove item failed. Please try again.";

      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM_FAILURE,
        payload: { message: errorMessage },
      });

      return { success: false, message: errorMessage };
    }
  };

  const updateQuantity = async ( cartItemId, quantity) => {
    try {
      const result = await cartService.updateQuantity(
        cartItemId,
        quantity
      );
      console.log("updateQuantity result",result);
      if (result.success) {
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY ,payload:{items:result.data}});
        return { success: true, message: result.message };
      }
    } catch (error) {
      const errorMessage = "Update quantity failed. Please try again.";

      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY_FAILURE,
        payload: { message: errorMessage },
      });

      return { success: false, message: errorMessage };
    }
  };

  const loadCart = async () => {
    try {
      const result = await cartService.loadCart();
      console.log("result",result);
      if (result.success) {
        dispatch({ type: CART_ACTIONS.LOAD_CART,
          payload:{items:result.data.items}
         });
        return { success: true, message: result.message };
      }
    } catch (error) {
      const errorMessage = "Load cart failed. Please try again.";
      dispatch({
        type: CART_ACTIONS.LOAD_CART_FAILURE,
        payload: { message: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  const clearCart = async () => {
    try {
      const result = await cartService.clearCart();
      if (result.success) {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        return { success: true, message: result.message };
      }
    } catch (error) {
      const errorMessage = "Clear cart failed. Please try again.";
      dispatch({
        type: CART_ACTIONS.CLEAR_CART_FAILURE,
        payload: { message: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

    const value = {
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within an cartProvider");
  }

  return context;
}

// Export the context for advanced use cases
export { CartContext };
// const getCartTotal
