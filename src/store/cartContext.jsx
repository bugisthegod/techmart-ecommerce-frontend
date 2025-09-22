import React, { createContext, useContext, useReducer, useEffect } from "react";

// Define all possible cart actions
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  LOAD_CART: "LOAD_CART",
};

function cartReducer (state, action){
    switch(action.type){
        case CART_ACTIONS.ADD_ITEM:
        case CART_ACTIONS.REMOVE_ITEM:
        case CART_ACTIONS.UPDATE_QUANTITY:
        case CART_ACTIONS.CLEAR_CART:
        case CART_ACTIONS.LOAD_CART:

        
    }
}