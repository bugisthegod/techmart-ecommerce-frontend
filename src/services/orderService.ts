import api from "./api";
import type { OrderRequest } from "@/api/models";

class OrderService {
  /**
   * Generate order token (for idempotency)
   */
  async generateIdempotencyToken(): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.post(
        `/orders/generateOrderToken?userId=${userId}`
      );

      // Store Idempotency-Token in localStorage
      localStorage.setItem("Idempotency-Token", response.data);
      return response;
    } catch (error) {
      console.error("Generate order token error:", error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(
    orderData: OrderRequest,
    orderToken: string
  ): Promise<any> {
    try {
      const userId = this.getUserId();

      if (!orderToken) {
        throw new Error("Order token is required for idempotency");
      }

      // Create order with token in header
      const response = await api.post(`/orders?userId=${userId}`, orderData, {
        headers: {
          "Idempotency-Token": orderToken,
        },
      });
      return response;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string | number): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.get(`/orders/${orderId}?userId=${userId}`);
      return response;
    } catch (error) {
      console.error("Get order error:", error);
      throw error;
    }
  }

  /**
   * Get all orders for the current user
   */
  async getUserOrders(
    page: number = 0,
    size: number = 10,
    status: number | null = null
  ): Promise<any> {
    try {
      const userId = this.getUserId();
      let url = `/orders?userId=${userId}&page=${page}&size=${size}`;
      if (status !== null) {
        url += `&status=${status}`;
      }
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error("Get user orders error:", error);
      throw error;
    }
  }

  /**
   * Pay for an order (fake payment)
   */
  async payOrder(orderId: number): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.put(`/orders/${orderId}/pay?userId=${userId}`);
      return response;
    } catch (error) {
      console.error("Pay order error:", error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: number): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.put(
        `/orders/${orderId}/cancel?userId=${userId}`
      );
      return response;
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  }

  /**
   * Get current user ID from localStorage
   */
  getUserId(): number | null {
    const userData = localStorage.getItem("user_data");
    if (!userData) {
      console.error("User data not found in localStorage");
      return null;
    }
    try {
      return JSON.parse(userData).id || null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  // Alias method for generateIdempotencyToken (for backward compatibility)
  async generateOrderToken() {
    return this.generateIdempotencyToken();
  }
}

const orderService = new OrderService();

export default orderService;
