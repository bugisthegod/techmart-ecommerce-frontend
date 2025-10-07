import api from "./api";

const addressService = {
    /**
     * Get all addresses for current user
     * @returns {Promise} Response with list of addresses
     */
    getUserAddresses: async () => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.get(`/addresses?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Get user addresses error:", error);
            throw error;
        }
    },

    /**
     * Get default address for current user
     * @returns {Promise} Response with default address
     */
    getDefaultAddress: async () => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.get(`/addresses/default?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Get default address error:", error);
            throw error;
        }
    },

    /**
     * Create a new address
     * @param {Object} addressData - Address information
     * @returns {Promise} Response with created address
     */
    createAddress: async (addressData) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.post(`/addresses?userId=${userId}`, addressData);
            return response;
        } catch (error) {
            console.error("Create address error:", error);
            throw error;
        }
    },

    /**
     * Update an existing address
     * @param {number} addressId - Address ID
     * @param {Object} addressData - Updated address information
     * @returns {Promise} Response with updated address
     */
    updateAddress: async (addressId, addressData) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.put(`/addresses/${addressId}?userId=${userId}`, addressData);
            return response;
        } catch (error) {
            console.error("Update address error:", error);
            throw error;
        }
    },

    /**
     * Delete an address
     * @param {number} addressId - Address ID
     * @returns {Promise} Response with success message
     */
    deleteAddress: async (addressId) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.delete(`/addresses/${addressId}?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Delete address error:", error);
            throw error;
        }
    },

    /**
     * Set an address as default
     * @param {number} addressId - Address ID
     * @returns {Promise} Response with success message
     */
    setDefaultAddress: async (addressId) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await api.put(`/addresses/${addressId}/default?userId=${userId}`);
            return response;
        } catch (error) {
            console.error("Set default address error:", error);
            throw error;
        }
    },
};

export default addressService;
