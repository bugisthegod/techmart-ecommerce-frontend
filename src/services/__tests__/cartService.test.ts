import { describe, it, expect, vi, beforeEach } from 'vitest';
import cartService from '@/services/cartService';
import { createMockUser, createMockCartResponse, setupAuthenticatedUser } from '@/test/helpers';

// Mock the api module
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CartService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getUserId', () => {
    it('extracts user ID from localStorage', () => {
      const mockUser = createMockUser({ id: 123 });
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      const userId = cartService.getUserId();
      expect(userId).toBe(123);
    });

    it('returns null when no user data in localStorage', () => {
      const userId = cartService.getUserId();
      expect(userId).toBeNull();
    });

    it('returns null on JSON parse error', () => {
      localStorage.setItem('user_data', 'invalid json');

      const userId = cartService.getUserId();
      expect(userId).toBeNull();
    });

    it('returns null when id field is missing', () => {
      localStorage.setItem('user_data', JSON.stringify({ username: 'test' }));

      const userId = cartService.getUserId();
      expect(userId).toBeNull();
    });
  });

  describe('addToCart', () => {
    it('adds item to cart successfully', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse(),
      };
      vi.mocked(api.default.post).mockResolvedValue(mockResponse);

      const result = await cartService.addToCart({
        productId: 101,
        quantity: 2,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('successful');
      expect(api.default.post).toHaveBeenCalledWith(
        '/cart/add',
        {
          productId: 101,
          quantity: 2,
          selected: 1,
        },
        { params: { userId: 1 } }
      );
    });

    it('uses selected value from request', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse(),
      };
      vi.mocked(api.default.post).mockResolvedValue(mockResponse);

      await cartService.addToCart({
        productId: 101,
        quantity: 2,
        selected: 0,
      });

      expect(api.default.post).toHaveBeenCalledWith(
        '/cart/add',
        expect.objectContaining({
          selected: 0,
        }),
        expect.any(Object)
      );
    });

    it('defaults selected to 1 when not provided', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse(),
      };
      vi.mocked(api.default.post).mockResolvedValue(mockResponse);

      await cartService.addToCart({
        productId: 101,
        quantity: 2,
      });

      expect(api.default.post).toHaveBeenCalledWith(
        '/cart/add',
        expect.objectContaining({
          selected: 1,
        }),
        expect.any(Object)
      );
    });

    it('handles API error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.post).mockRejectedValue({
        status: 400,
        message: 'Invalid product',
      });

      const result = await cartService.addToCart({
        productId: 999,
        quantity: 1,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('removeFromCart', () => {
    it('removes item from cart successfully', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse({ items: [] }),
      };
      vi.mocked(api.default.delete).mockResolvedValue(mockResponse);

      const result = await cartService.removeFromCart(5);

      expect(result.success).toBe(true);
      expect(api.default.delete).toHaveBeenCalledWith('/cart/remove/5', {
        params: { userId: 1 },
      });
    });

    it('handles item not found error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.delete).mockRejectedValue({
        status: 404,
        message: 'Item not found',
      });

      const result = await cartService.removeFromCart(999);

      expect(result.success).toBe(false);
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity successfully', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse(),
      };
      vi.mocked(api.default.put).mockResolvedValue(mockResponse);

      const result = await cartService.updateQuantity(5, 3);

      expect(result.success).toBe(true);
      expect(api.default.put).toHaveBeenCalledWith(
        '/cart/update/5',
        {},
        { params: { userId: 1, quantity: 3 } }
      );
    });

    it('handles invalid quantity error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.put).mockRejectedValue({
        status: 400,
        message: 'Invalid quantity',
      });

      const result = await cartService.updateQuantity(5, -1);

      expect(result.success).toBe(false);
    });
  });

  describe('updateItemSelection', () => {
    it('updates item selection successfully', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse(),
      };
      vi.mocked(api.default.put).mockResolvedValue(mockResponse);

      const result = await cartService.updateItemSelection(5, 0);

      expect(result.success).toBe(true);
      expect(api.default.put).toHaveBeenCalledWith(
        '/cart/select/5',
        {},
        { params: { userId: 1, selected: 0 } }
      );
    });

    it('handles API error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.put).mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      const result = await cartService.updateItemSelection(5, 1);

      expect(result.success).toBe(false);
    });
  });

  describe('loadCart', () => {
    it('loads cart successfully', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse(),
      };
      vi.mocked(api.default.get).mockResolvedValue(mockResponse);

      const result = await cartService.loadCart();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(api.default.get).toHaveBeenCalledWith('/cart', {
        params: { userId: 1 },
      });
    });

    it('handles empty cart', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      const mockResponse = {
        status: 200,
        data: createMockCartResponse({ items: [], totalAmount: 0, totalCount: 0 }),
      };
      vi.mocked(api.default.get).mockResolvedValue(mockResponse);

      const result = await cartService.loadCart();

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(0);
    });

    it('handles unauthorized error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.get).mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
      });

      const result = await cartService.loadCart();

      expect(result.success).toBe(false);
    });
  });

  describe('clearCart', () => {
    it('clears cart successfully', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));
      localStorage.setItem('items', JSON.stringify([{ id: 1 }]));

      const mockResponse = {
        status: 200,
        data: { msg: 'Cart cleared' },
      };
      vi.mocked(api.default.delete).mockResolvedValue(mockResponse);

      const result = await cartService.clearCart();

      expect(result.success).toBe(true);
      expect(api.default.delete).toHaveBeenCalledWith('/cart/clear', {
        params: { userId: 1 },
      });
      expect(localStorage.getItem('items')).toBeNull();
    });

    it('handles API error', async () => {
      const api = await import('@/services/api');
      setupAuthenticatedUser(createMockUser({ id: 1 }));

      vi.mocked(api.default.delete).mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      const result = await cartService.clearCart();

      expect(result.success).toBe(false);
    });
  });
});
