import React, { createContext, useContext, useReducer, useEffect } from "react";
import cartService from "../services/cartService";
import { message } from "antd";

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

function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
    case CART_ACTIONS.REMOVE_ITEM:
    case CART_ACTIONS.UPDATE_QUANTITY:
    case CART_ACTIONS.CLEAR_CART:
    case CART_ACTIONS.LOAD_CART:
  }
}

const addItem = async (product) => {
  try {
    const result = await cartService.addToCart(product);

    if (result.success) {
      dispatch({ type: CART_ACTIONS.ADD_ITEM });
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

const updateQuantity = async (productId, cartItemId, quantity) => {
  try {
    const result = await cartService.updateQuantity(
      productId,
      cartItemId,
      quantity
    );

    if (result.success) {
      dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY });
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
    if (result.success) {
      dispatch({ type: CART_ACTIONS.LOAD_CART });
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

// const getCartTotal
