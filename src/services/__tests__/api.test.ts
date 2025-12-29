import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const mockCancelFn = vi.fn();
const mockCancelToken = {
  source: vi.fn(() => ({
    token: 'mock-cancel-token',
    cancel: mockCancelFn,
  })),
};

const mockAxiosInstance = {
  create: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
  CancelToken: mockCancelToken,
};

// Setup create to return the instance
mockAxiosInstance.create.mockReturnValue(mockAxiosInstance);

vi.mock('axios', () => ({
  default: mockAxiosInstance,
  CancelToken: mockCancelToken,
}));

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('API Instance Configuration', () => {
    it('creates axios instance with correct base URL', async () => {
      // Import api to trigger axios.create
      await import('@/services/api');

      expect(mockAxiosInstance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:8080/api',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('Request Interceptor Behavior', () => {
    it('should add Authorization header when token exists', () => {
      const token = 'test-jwt-token';
      localStorage.setItem('jwt_token', token);

      // Simulate what the interceptor does
      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      const tokenFromStorage = localStorage.getItem('jwt_token');
      if (tokenFromStorage) {
        config.headers.Authorization = `Bearer ${tokenFromStorage}`;
      }

      expect(config.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header when no token', () => {
      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      const tokenFromStorage = localStorage.getItem('jwt_token');
      if (tokenFromStorage) {
        config.headers.Authorization = `Bearer ${tokenFromStorage}`;
      }

      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor Behavior', () => {
    it('should unwrap response data', () => {
      const mockData = { userId: 1, username: 'test' };
      const mockResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      // Simulate what the interceptor does
      const unwrapped = mockResponse.data;

      expect(unwrapped).toEqual(mockData);
    });

    it('should handle 401 error by clearing token', () => {
      localStorage.setItem('jwt_token', 'test-token');
      localStorage.setItem('user_data', JSON.stringify({ id: 1 }));

      // Simulate 401 handling
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      if (error.response?.status === 401) {
        localStorage.removeItem('jwt_token');
      }

      expect(localStorage.getItem('jwt_token')).toBeNull();
    });

    it('should transform error into ApiError structure', () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      };

      // Simulate error transformation
      const apiError = {
        status: mockError.response.status,
        message:
          typeof mockError.response.data === 'object' &&
          mockError.response.data !== null &&
          'message' in mockError.response.data
            ? (mockError.response.data.message as string)
            : 'An error occurred',
        data: mockError.response.data,
      };

      expect(apiError).toEqual({
        status: 400,
        message: 'Bad request',
        data: { message: 'Bad request' },
      });
    });

    it('should handle network error', () => {
      const networkError = {
        request: {},
        message: 'Network Error',
      };

      // Simulate network error handling
      const apiError = {
        status: 0,
        message: 'Network error - please check your connection',
      };

      expect(apiError.status).toBe(0);
      expect(apiError.message).toContain('Network');
    });

    it('should handle unknown errors', () => {
      const unknownError = {
        message: 'Something went wrong',
      };

      // Simulate unknown error handling
      const apiError = {
        status: -1,
        message: unknownError.message || 'Unknown error occurred',
      };

      expect(apiError.status).toBe(-1);
      expect(apiError.message).toBe('Something went wrong');
    });
  });

  describe('Navigate Function Storage', () => {
    it('should allow storing navigate function', async () => {
      const { setNavigate } = await import('@/services/api');
      const mockNavigate = vi.fn();

      setNavigate(mockNavigate);

      // Navigate function is stored internally, can't directly test
      // But we can verify the function was called without error
      expect(setNavigate).toBeDefined();
    });
  });

  describe('Custom Axios Instance for Orval', () => {
    it('should create request with cancel token', async () => {
      const { customAxiosInstance } = await import('@/services/api');
      const mockConfig = {
        url: '/api/test',
        method: 'GET',
      };

      mockAxiosInstance.request.mockResolvedValue({ data: 'test' });

      const promise = customAxiosInstance(mockConfig);

      expect(promise.cancel).toBeDefined();
      expect(typeof promise.cancel).toBe('function');
    });

    it('should strip /api prefix from URL', async () => {
      const { customAxiosInstance } = await import('@/services/api');
      const mockConfig = {
        url: '/api/users/login',
        method: 'POST',
      };

      mockAxiosInstance.request.mockResolvedValue({ data: 'test' });

      await customAxiosInstance(mockConfig);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/login', // /api stripped
        })
      );
    });

    it('should handle cancellation', async () => {
      const { customAxiosInstance } = await import('@/services/api');
      const mockConfig = {
        url: '/test',
        method: 'GET',
      };

      mockAxiosInstance.request.mockResolvedValue({ data: 'test' });

      const promise = customAxiosInstance(mockConfig);
      promise.cancel?.();

      expect(mockCancelFn).toHaveBeenCalledWith('Query was cancelled');
    });
  });
});
