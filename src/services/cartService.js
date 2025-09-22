import { message } from "antd";
import api from "./api";
import { data } from "react-router-dom";

class CartService {
  async addItem(product) {
    try {
      console.log(" Adding product in cart");
      const userData = localStorage.getItem("user_data");
      const response = await api.post("/cart/add", {
        userId: JSON.parse(userData).id,
        productId: product.id,
        quantity: product.quantity || 1,
        selected: product.selected || 1,
      });

      if (response.status != 200) {
        throw new Error(`Add cartItem failed: ${response.msg}`);
      }

      console.log("Add cartItem successful");
      return {
        success: true,
        message: "Add cartItem successful!",
        data: response.data,
      };
    } catch (error) {
      console.log("Add cartItem Failed: ", error);

      return {
        success: false,
        message: error.message || "Add cartItem failed. Please try again.",
        errors: error.data || null,
      };
    }
  }

  /**
   * Clear all items in user cart
   */
  clearCart() {
    localStorage.removeItem("items");
  }
}

// Create and export a single instance of the CartService
// It ensures that all parts of my application use the same cart state
const cartService = new CartService();
export default cartService;
