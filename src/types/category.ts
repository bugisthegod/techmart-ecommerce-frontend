import { ApiResponse, PagedResponse } from './api';

/**
 * Category information structure
 */
export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  icon?: string;
  sortOrder: number;
  status: number; // 1 = active, 0 = inactive
  createdAt: string;
  updatedAt: string;
}

/**
 * Category filter/search parameters
 */
export interface CategoryFilterParams {
  current?: number;
  pageSize?: number;
  parentId?: number | null;
  status?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Category pagination response
 */
export type CategoryPaginationResponse = ApiResponse<PagedResponse<Category>>;

/**
 * Category list response
 */
export type CategoryListResponse = ApiResponse<Category[]>;

/**
 * Single category response
 */
export type CategoryResponse = ApiResponse<Category>;