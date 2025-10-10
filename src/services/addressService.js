import api from "./api";

class AddressService {
    /**
     * Get all addresses for current user
     * @returns {Promise} Response with list of addresses
     */
    async getUserAddresses() {
        try {
            const userId = this.getUserId();
            const response = await api.get(`/addresses?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Get user addresses error:", error);
            throw error;
        }
    }

    /**
     * Get default address for current user
     * @returns {Promise} Response with default address
     */
    async getDefaultAddress() {
        try {
            const userId = this.getUserId();
            const response = await api.get(`/addresses/default?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Get default address error:", error);
            throw error;
        }
    }

    /**
     * Create a new address
     * @param {Object} addressData - Address information
     * @returns {Promise} Response with created address
     */
    async createAddress(addressData) {
        try {
            const userId = this.getUserId();
            const response = await api.post(`/addresses?userId=${userId}`, addressData);
            return response;
        } catch (error) {
            console.error("Create address error:", error);
            throw error;
        }
    }

    /**
     * Update an existing address
     * @param {number} addressId - Address ID
     * @param {Object} addressData - Updated address information
     * @returns {Promise} Response with updated address
     */
    async updateAddress(addressId, addressData) {
        try {
            const userId = this.getUserId();
            const response = await api.put(`/addresses/${addressId}?userId=${userId}`, addressData);
            return response;
        } catch (error) {
            console.error("Update address error:", error);
            throw error;
        }
    }

    /**
     * Delete an address
     * @param {number} addressId - Address ID
     * @returns {Promise} Response with success message
     */
    async deleteAddress(addressId) {
        try {
            const userId = this.getUserId();
            const response = await api.delete(`/addresses/${addressId}?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Delete address error:", error);
            throw error;
        }
    }

    /**
     * Set an address as default
     * @param {number} addressId - Address ID
     * @returns {Promise} Response with success message
     */
    async setDefaultAddress(addressId) {
        try {
            const userId = this.getUserId();
            const response = await api.put(`/addresses/${addressId}/default?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Set default address error:", error);
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
}

// Create and export a single instance
const addressService = new AddressService();

export default addressService;
