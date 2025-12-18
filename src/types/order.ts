import { ApiResponse, PagedResponse } from './api';

/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 0,
  PAID = 1,
  SHIPPED = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

/**
 * Order item structure
 */
export interface OrderItem {
  id: number;
  orderId: number;
  orderNo: string;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  createdAt?: string;
}

/**
 * Order structure
 */
export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  totalAmount: number;
  payAmount: number;
  freightAmount?: number;
  status: OrderStatus;
  paymentTime?: string;
  deliveryTime?: string;
  receiveTime?: string;
  comment?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}



/**
 * Create order request data
 */
export interface CreateOrderRequest {
  /** Selected shipping address id (preferred by current frontend flow) */
  addressId: string;

  /** Delivery method / freight option */
  freightType: string;

  /** Optional legacy receiver fields (kept for compatibility) */
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;

  comment?: string;
}

/**
 * Order pagination parameters
 */
export interface OrderFilterParams {
  page?: number;
  size?: number;
  status?: OrderStatus | null;
}

/**
 * Order response from API
 */
export type OrderResponse = ApiResponse<Order>;

/**
 * Orders pagination response
 */
export type OrdersPaginationResponse = ApiResponse<PagedResponse<Order>>;
