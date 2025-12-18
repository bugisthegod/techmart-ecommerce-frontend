import { ApiResponse, PagedResponse } from './api';

/**
 * Product information structure
 */
export interface Product {
  id: number;
  productId?: number; // Some responses use productId
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  status: number; // 1 = active, 0 = inactive
  mainImage: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Product filter/search parameters
 */
export interface ProductFilterParams {
  current?: number;
  pageSize?: number;
  categoryId?: number | null;
  status?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Product pagination response
 */
export type ProductPaginationResponse = ApiResponse<PagedResponse<Product>>;

/**
 * Product search response
 */
export type ProductSearchResponse = ApiResponse<Product[]>;
