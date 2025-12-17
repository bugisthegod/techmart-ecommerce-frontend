import { ApiResponse } from './api';

/**
 * Address structure
 */
export interface Address {
  id: number;
  userId: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault: number; // 1 = default, 0 = not default
  createdAt?: string;
  updatedAt?: string;
  postalCode: string;
}

/**
 * Address form data (for creating/updating addresses)
 */
export interface AddressFormData {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: number;
  postalCode: string;
}

/**
 * Address response from API
 */
export type AddressResponse = ApiResponse<Address>;

/**
 * Addresses list response from API
 */
export type AddressesResponse = ApiResponse<Address[]>;
