import api from "./api";

class OrderService {
  /**
   * Generate order token (for idempotency)
   * @returns {Promise} Response with order token
   */
  async generateIdempotencyToken() {
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
   * Create a new order (fake payment)
   * @param {Object} orderData - Order information including addressId, comment, etc.
   * @param {string} orderToken - Pre-generated idempotency token
   * @returns {Promise} Response with order details
   */
  async createOrder(orderData, orderToken) {
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
   * @param {string} orderId - Order ID
   * @returns {Promise} Response with order details
   */
  async getOrderById(orderId) {
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
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @param {number} status - Order status filter (optional)
   * @returns {Promise} Response with list of orders
   */
  async getUserOrders(page = 0, size = 10, status = null) {
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
   * @param {number} orderId - Order ID
   * @returns {Promise} Response with success message
   */
  async payOrder(orderId) {
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
   * @param {number} orderId - Order ID
   * @returns {Promise} Response with success message
   */
  async cancelOrder(orderId) {
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
   * @returns {number|null} User ID or null if not found
   */
  getUserId() {
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
