import { describe, it, expect, vi, beforeEach } from 'vitest';
import orderService from '@/services/orderService';
import { createMockUser, createMockOrderRequest, setupAuthenticatedUser } from '@/test/helpers';

// Mock the api module
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('OrderService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getUserId', () => {
    it('extracts user ID from localStorage', () => {
      const mockUser = createMockUser({ id: 123 });
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      const userId = orderService.getUserId();
      expect(userId).toBe(123);
    });

    it('returns null when no user data', () => {
      const userId = orderService.getUserId();
      expect(userId).toBeNull();
    });
  });

  describe('generateIdempotencyToken', () => {
    it('generates and stores idempotency token', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockToken = 'mock-idempotency-token-12345';
      const mockResponse = {
        data: mockToken,
      };
      vi.mocked(api.default.post).mockResolvedValue(mockResponse);

      const result = await orderService.generateIdempotencyToken();

      expect(result.data).toBe(mockToken);
      expect(localStorage.getItem('Idempotency-Token')).toBe(mockToken);
      expect(api.default.post).toHaveBeenCalledWith(
        '/orders/generateOrderToken?userId=1'
      );
    });

    it('handles API error during token generation', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.post).mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      await expect(orderService.generateIdempotencyToken()).rejects.toThrow();
    });
  });

  describe('createOrder', () => {
    it('creates order with idempotency token header', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const orderData = createMockOrderRequest();
      const token = 'test-idempotency-token';
      const mockResponse = {
        orderId: 123,
        status: 'PENDING',
      };
      vi.mocked(api.default.post).mockResolvedValue(mockResponse);

      const result = await orderService.createOrder(orderData, token);

      expect(result.orderId).toBe(123);
      expect(api.default.post).toHaveBeenCalledWith(
        '/orders?userId=1',
        orderData,
        {
          headers: {
            'Idempotency-Token': token,
          },
        }
      );
    });

    it('throws error when token is missing', async () => {
      setupAuthenticatedUser(createMockUser({ id: 1 }));
      const orderData = createMockOrderRequest();

      await expect(orderService.createOrder(orderData, '')).rejects.toThrow(
        'Order token is required for idempotency'
      );
    });

    it('handles duplicate submission error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.post).mockRejectedValue({
        status: 409,
        message: 'Duplicate order',
      });

      const orderData = createMockOrderRequest();
      await expect(
        orderService.createOrder(orderData, 'test-token')
      ).rejects.toThrow();
    });
  });

  describe('getOrderById', () => {
    it('fetches order by ID', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockOrder = {
        orderId: 123,
        totalAmount: 99.99,
        status: 'PENDING',
      };
      vi.mocked(api.default.get).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(123);

      expect(result.orderId).toBe(123);
      expect(api.default.get).toHaveBeenCalledWith('/orders/123?userId=1');
    });

    it('handles order not found', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.get).mockRejectedValue({
        status: 404,
        message: 'Order not found',
      });

      await expect(orderService.getOrderById(999)).rejects.toThrow();
    });
  });

  describe('getUserOrders', () => {
    it('fetches paginated orders with defaults', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockOrders = {
        content: [],
        totalPages: 0,
        totalElements: 0,
      };
      vi.mocked(api.default.get).mockResolvedValue(mockOrders);

      const result = await orderService.getUserOrders();

      expect(api.default.get).toHaveBeenCalledWith(
        '/orders?userId=1&page=0&size=10'
      );
    });

    it('fetches orders with custom pagination', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockOrders = {
        content: [],
        totalPages: 5,
      };
      vi.mocked(api.default.get).mockResolvedValue(mockOrders);

      await orderService.getUserOrders(2, 20);

      expect(api.default.get).toHaveBeenCalledWith(
        '/orders?userId=1&page=2&size=20'
      );
    });

    it('filters by order status', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockOrders = { content: [] };
      vi.mocked(api.default.get).mockResolvedValue(mockOrders);

      await orderService.getUserOrders(0, 10, 1); // status = PENDING

      expect(api.default.get).toHaveBeenCalledWith(
        '/orders?userId=1&page=0&size=10&status=1'
      );
    });

    it('handles empty results', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockEmptyResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
      };
      vi.mocked(api.default.get).mockResolvedValue(mockEmptyResponse);

      const result = await orderService.getUserOrders();

      expect(result.content).toHaveLength(0);
    });
  });

  describe('payOrder', () => {
    it('marks order as paid', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        orderId: 123,
        status: 'PAID',
      };
      vi.mocked(api.default.put).mockResolvedValue(mockResponse);

      const result = await orderService.payOrder(123);

      expect(result.status).toBe('PAID');
      expect(api.default.put).toHaveBeenCalledWith(
        '/orders/123/pay?userId=1'
      );
    });

    it('handles payment error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.put).mockRejectedValue({
        status: 400,
        message: 'Payment failed',
      });

      await expect(orderService.payOrder(123)).rejects.toThrow();
    });
  });

  describe('cancelOrder', () => {
    it('cancels order successfully', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        orderId: 123,
        status: 'CANCELLED',
      };
      vi.mocked(api.default.put).mockResolvedValue(mockResponse);

      const result = await orderService.cancelOrder(123);

      expect(result.status).toBe('CANCELLED');
      expect(api.default.put).toHaveBeenCalledWith(
        '/orders/123/cancel?userId=1'
      );
    });

    it('handles already cancelled order', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.put).mockRejectedValue({
        status: 400,
        message: 'Order already cancelled',
      });

      await expect(orderService.cancelOrder(123)).rejects.toThrow();
    });
  });

  describe('generateOrderToken (alias)', () => {
    it('calls generateIdempotencyToken', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockToken = 'test-token';
      vi.mocked(api.default.post).mockResolvedValue({ data: mockToken });

      const result = await orderService.generateOrderToken();

      expect(api.default.post).toHaveBeenCalled();
      expect(localStorage.getItem('Idempotency-Token')).toBe(mockToken);
    });
  });
});
