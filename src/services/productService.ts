import api from "./api";
import type { ProductFilterParams, PagedResponse, Product } from "@/types";

interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const productPagination = async (
  params: ProductFilterParams = {}
): Promise<ServiceResult<PagedResponse<Product>>> => {
  try {
    console.log("params", params);
    const response = await api.get("/products", {
      params: {
        page: params.current || 1,
        size: params.pageSize || 10,
        categoryId: params.categoryId || null,
        status: params.status || 1,
        sortBy: params.sortBy || "createdAt",
        sortDir: params.sortDir || "desc",
      }
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      message: "Failed to fetch products",
    };
  } catch (error: any) {
    console.error("❌ Product pagination failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch products",
    };
  }
};

export const searchProductByName = async (
  name: string
): Promise<ServiceResult<Product[]>> => {
  try {
    const response = await api.get(`/products/search`, {
      params: { name },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      message: "Failed to search products",
    };
  } catch (error: any) {
    console.error("❌ Product search failed:", error);
    return {
      success: false,
      message: error.message || "Failed to search products",
    };
  }
};

export const getProductById = async (
  id: number
): Promise<ServiceResult<Product>> => {
  try {
    const response = await api.get(`/products/${id}`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      message: "Failed to fetch product",
    };
  } catch (error: any) {
    console.error("❌ Product fetch failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch product",
    };
  }
};
