import api from "./api";

const orderService = {
    /**
     * Generate order token (for idempotency)
     * @returns {Promise} Response with order token
     */
    generateOrderToken: async () => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.post(`/orders/generateOrderToken?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Generate order token error:", error);
            throw error;
        }
    },

    /**
     * Create a new order (fake payment)
     * @param {Object} orderData - Order information including addressId, comment, etc.
     * @returns {Promise} Response with order details
     */
    createOrder: async (orderData) => {
        try {
            const userId = localStorage.getItem("userId");

            // First generate order token
            const tokenResponse = await orderService.generateOrderToken();
            const orderToken = tokenResponse.data;

            // Create order with token in header
            const response = await api.post(`/orders?userId=${userId}`, orderData, {
                headers: {
                    'Idempotency-Token': orderToken
                }
            });
            return response;
        } catch (error) {
            console.error("Create order error:", error);
            throw error;
        }
    },

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     * @returns {Promise} Response with order details
     */
    getOrderById: async (orderId) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.get(`/orders/${orderId}?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Get order error:", error);
            throw error;
        }
    },

    /**
     * Get all orders for the current user
     * @param {number} page - Page number (0-based)
     * @param {number} size - Page size
     * @param {number} status - Order status filter (optional)
     * @returns {Promise} Response with list of orders
     */
    getUserOrders: async (page = 0, size = 10, status = null) => {
        try {
            const userId = localStorage.getItem("userId");
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
    },

    /**
     * Pay for an order (fake payment)
     * @param {number} orderId - Order ID
     * @returns {Promise} Response with success message
     */
    payOrder: async (orderId) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.put(`/orders/${orderId}/pay?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Pay order error:", error);
            throw error;
        }
    },

    /**
     * Cancel an order
     * @param {number} orderId - Order ID
     * @returns {Promise} Response with success message
     */
    cancelOrder: async (orderId) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.put(`/orders/${orderId}/cancel?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Cancel order error:", error);
            throw error;
        }
    },
};

export default orderService;
