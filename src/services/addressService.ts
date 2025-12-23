import api from "./api";
import type { AddressRequest } from "@/api/models";

class AddressService {
  /**
   * Get all addresses for current user
   */
  async getUserAddresses(): Promise<any> {
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
   */
  async getDefaultAddress(): Promise<any> {
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
   */
  async createAddress(addressData: AddressRequest): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.post(
        `/addresses?userId=${userId}`,
        addressData
      );
      return response;
    } catch (error) {
      console.error("Create address error:", error);
      throw error;
    }
  }

  /**
   * Update an existing address
   */
  async updateAddress(
    addressId: number,
    addressData: AddressRequest
  ): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.put(
        `/addresses/${addressId}?userId=${userId}`,
        addressData
      );
      return response;
    } catch (error) {
      console.error("Update address error:", error);
      throw error;
    }
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: number): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.delete(
        `/addresses/${addressId}?userId=${userId}`
      );
      return response;
    } catch (error) {
      console.error("Delete address error:", error);
      throw error;
    }
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(addressId: number): Promise<any> {
    try {
      const userId = this.getUserId();
      const response = await api.put(
        `/addresses/${addressId}/default?userId=${userId}`
      );
      return response;
    } catch (error) {
      console.error("Set default address error:", error);
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
}

// Create and export a single instance
const addressService = new AddressService();

export default addressService;
