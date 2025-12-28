import api from "./api";
import type { CartItemRequest, CartResponse } from "@/api/models";
import { logger } from "@/lib/logger";

interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

class CartService {
  async addToCart(
  req: CartItemRequest
  ): Promise<ServiceResult<CartResponse>> {
    try {
      const userId = this.getUserId();
      const response = await api.post(
        "/cart/add",
        {
      productId: req.productId,
      quantity: req.quantity,
      selected: req.selected ?? 1,
        },
        { params: { userId } }
      );

      if (response.status != 200) {
        throw new Error(`Add cartItem failed: ${response.data.msg}`);
      }

      logger.log("Add cartItem successful");
      return {
        success: true,
        message: "Add cartItem successful!",
        data: response.data,
      };
    } catch (error: any) {
      logger.log("Add cartItem Failed: ", error);

      return {
        success: false,
        message: error.message || "Add cartItem failed. Please try again.",
        errors: error.data || null,
      };
    }
  }

  async removeFromCart(cartItemId: number): Promise<ServiceResult<CartResponse>> {
    try {
      const userId = this.getUserId();
      const response = await api.delete(`/cart/remove/${cartItemId}`, {
        params: { userId },
      });

      if (response.status !== 200) {
        throw new Error(`Item removed from cart failed: ${response.data.msg}`);
      }

      logger.log("Item removed from cart successfully");

      return {
        success: true,
        message: "Remove cartItem successful!",
        data: response.data,
      };
    } catch (error: any) {
      logger.error("❌ Item removed from cart failed:", error);

      return {
        success: false,
        message: error.message || "Item removed from cart failed",
        errors: error.data || null,
      };
    }
  }

  async updateQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<ServiceResult<CartResponse>> {
    try {
      const userId = this.getUserId();
      const response = await api.put(
        `/cart/update/${cartItemId}`,
        {},
        { params: { userId, quantity } }
      );

      if (response.status !== 200) {
        throw new Error(
          `Update Cart item quantity failed: ${response.data.msg}`
        );
      }
      logger.log("Update cart item quantity successful");
      return {
        success: true,
        message: "Update cart item quantity successful!",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Update cart item quantity failed. Please try again.",
        errors: error.data || null,
      };
    }
  }

  async updateItemSelection(
    cartItemId: number,
    selected: number
  ): Promise<ServiceResult<CartResponse>> {
    try {
      const userId = this.getUserId();
      const response = await api.put(
        `/cart/select/${cartItemId}`,
        {},
        { params: { userId, selected } }
      );

      if (response.status !== 200) {
        throw new Error(
          `Update Cart item selection failed: ${response.data.msg}`
        );
      }
      logger.log("Update cart item selection successful");
      return {
        success: true,
        message: "Update cart item selection successful!",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Update cart item selection failed. Please try again.",
        errors: error.data || null,
      };
    }
  }

  async loadCart(): Promise<ServiceResult<CartResponse>> {
    try {
      const userId = this.getUserId();
      const response = await api.get("/cart", { params: { userId: userId } });

      if (response.status !== 200) {
        throw new Error(`Load Cart failed: ${response.data.msg}`);
      }

      logger.log("Load cart successful!");
      return {
        success: true,
        message: "Load cart successful!",
        data: response.data,
      };
    } catch (error: any) {
      logger.error("❌ Load cart failed:", error);

      // Return a standardized error format that your components can handle consistently
      return {
        success: false,
        message: error.message || "Load cart. Please try again.",
        errors: error.data || null,
      };
    }
  }

  /**
   * Get current user ID from localStorage
   */
  getUserId(): number | null {
    const userData = localStorage.getItem("user_data");
    if (!userData) {
      logger.error("User data not found in localStorage");
      return null;
    }
    try {
      return JSON.parse(userData).id || null;
    } catch (error) {
      logger.error("Error parsing user data:", error);
      return null;
    }
  }

  /**
   * Clear all items in user cart
   */
  async clearCart(): Promise<ServiceResult> {
    try {
      const userId = this.getUserId();
      const response = await api.delete("/cart/clear", { params: { userId } });

      if (response.status !== 200) {
        throw new Error(`Clear Cart failed: ${response.data.msg}`);
      }

      localStorage.removeItem("items");
      logger.log("Clear cart successful!");
      return {
        success: true,
        message: "Clear cart successful!",
        data: response.data,
      };
    } catch (error: any) {
      logger.error("❌ Clear cart failed:", error);

      return {
        success: false,
        message: error.message || "Clear cart. Please try again.",
        errors: error.data || null,
      };
    }
  }
}

// Create and export a single instance of the CartService
// It ensures that all parts of my application use the same cart state
const cartService = new CartService();
export default cartService;
