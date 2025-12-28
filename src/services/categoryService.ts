import api from './api';
import type { CategoryResponse } from '@/api/models';
import { logger } from '@/lib/logger';

interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Fetch a single category by ID
 */
export const getCategoryById = async (
  id: number
): Promise<ServiceResult<CategoryResponse>> => {
  try {
    const response = await api.get(`/categories/${id}`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      message: "Failed to fetch category",
    };
  } catch (error: any) {
    logger.error("❌ Category fetch failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch category",
    };
  }
};

/**
 * Fetch all categories
 */
export const getAllCategories = async (): Promise<ServiceResult<CategoryResponse[]>> => {
  try {
    const response = await api.get('/categories');

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      message: "Failed to fetch categories",
    };
  } catch (error: any) {
    logger.error("❌ Categories fetch failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch categories",
    };
  }
};
