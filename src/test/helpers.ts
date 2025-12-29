import type { UserResponse, LoginResponse, CartResponse, OrderRequest } from '@/api/models';

/**
 * Test fixtures and helper functions
 */

// Mock User Data
export const createMockUser = (overrides?: Partial<UserResponse>): UserResponse => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  phone: '1234567890',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Helper function for base64 encoding in Node.js
const base64Encode = (str: string): string => {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// Mock JWT Token (valid format, expires in 1 hour by default)
export const createMockJWT = (expiresInSeconds: number = 3600): string => {
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Encode(
    JSON.stringify({
      sub: 'testuser',
      userId: 1,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  );
  const signature = base64Encode('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Mock expired JWT
export const createExpiredJWT = (): string => {
  return createMockJWT(-3600); // Expired 1 hour ago
};

// Mock invalid JWT (malformed)
export const createInvalidJWT = (): string => {
  return 'invalid.token'; // Only 2 parts
};

// Mock Login Response (wrapped in ResponseResult structure)
export const createMockLoginResponse = (): any => ({
  status: 200,
  msg: 'Login successful',
  data: {
    token: createMockJWT(),
    userInfo: createMockUser(),
    expiresIn: 3600,
  },
});

// Mock Cart Response
export const createMockCartResponse = (overrides?: Partial<CartResponse>): CartResponse => ({
  items: [
    {
      id: 1,
      productId: 101,
      productName: 'Test Product',
      price: 29.99,
      quantity: 2,
      selected: 1,
      imageUrl: 'https://example.com/image.jpg',
    },
  ],
  totalAmount: 59.98,
  totalCount: 2,
  selectedAmount: 59.98,
  selectedCount: 2,
  ...overrides,
});

// Mock Order Request
export const createMockOrderRequest = (overrides?: Partial<OrderRequest>): OrderRequest => ({
  receiverName: 'John Doe',
  receiverPhone: '1234567890',
  receiverAddress: '123 Test Street',
  ...overrides,
});

// Mock API Error Response
export const createMockApiError = (status: number, message: string) => ({
  status,
  message,
  data: null,
});

// Helper to setup authenticated user in localStorage
export const setupAuthenticatedUser = (user?: UserResponse, token?: string): void => {
  localStorage.setItem('jwt_token', token || createMockJWT());
  localStorage.setItem('user_data', JSON.stringify(user || createMockUser()));
};

// Helper to clear authentication
export const clearAuth = (): void => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_data');
};
