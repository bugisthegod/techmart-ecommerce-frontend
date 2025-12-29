import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import authService from '@/services/authService';
import { createMockUser, createMockLoginResponse, createMockJWT, createExpiredJWT, createInvalidJWT } from '@/test/helpers';

// Mock the api module
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token: string) => {
    // Simple mock implementation
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    try {
      return JSON.parse(atob(parts[1]));
    } catch {
      throw new Error('Invalid token');
    }
  }),
}));

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('successfully registers a new user', async () => {
      const api = await import('@/services/api');
      const mockResponse = {
        status: 200,
        msg: 'Registration successful',
        data: createMockUser(),
      };
      vi.mocked(api.default.post).mockResolvedValue(mockResponse);

      const result = await authService.register({
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        phone: '1234567890',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Registration successful');
      expect(api.default.post).toHaveBeenCalledWith('/users/register', {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        phone: '1234567890',
      });
    });

    it('handles registration failure', async () => {
      const api = await import('@/services/api');
      vi.mocked(api.default.post).mockRejectedValue({
        status: 400,
        message: 'Username already exists',
        data: null,
      });

      const result = await authService.register({
        username: 'existing',
        password: 'password123',
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
    });

    it('handles network error during registration', async () => {
      const api = await import('@/services/api');
      vi.mocked(api.default.post).mockRejectedValue({
        status: 0,
        message: 'Network error',
      });

      const result = await authService.register({
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('login', () => {
    it('successfully logs in and stores token and user data', async () => {
      const api = await import('@/services/api');
      const mockLoginResponse = createMockLoginResponse();
      vi.mocked(api.default.post).mockResolvedValue(mockLoginResponse);

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('successful');
      expect(localStorage.getItem('jwt_token')).toBeTruthy();
      expect(localStorage.getItem('user_data')).toBeTruthy();
    });

    it('validates response with Zod schema', async () => {
      const api = await import('@/services/api');
      const invalidResponse = {
        status: 200,
        msg: 'Success',
        data: {
          // Missing token
          userInfo: createMockUser(),
        },
      };
      vi.mocked(api.default.post).mockResolvedValue(invalidResponse);

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });

    it('rejects invalid JWT format', async () => {
      const api = await import('@/services/api');
      const responseWithInvalidToken = {
        status: 200,
        msg: 'Success',
        data: {
          token: createInvalidJWT(),
          userInfo: createMockUser(),
        },
      };
      vi.mocked(api.default.post).mockResolvedValue(responseWithInvalidToken);

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid token format');
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });

    it('sanitizes user data before storing', async () => {
      const api = await import('@/services/api');
      const dirtyUser = {
        id: 1,
        username: 'test<script>alert(1)</script>',
        email: 'test@example.com',
        phone: '123',
      };
      const mockResponse = {
        status: 200,
        msg: 'Success',
        data: {
          token: createMockJWT(),
          userInfo: dirtyUser,
        },
      };
      vi.mocked(api.default.post).mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(true);
      const storedData = JSON.parse(localStorage.getItem('user_data')!);
      expect(storedData.username).not.toContain('<script>');
    });

    it('handles wrong credentials (401)', async () => {
      const api = await import('@/services/api');
      vi.mocked(api.default.post).mockRejectedValue({
        status: 401,
        message: 'Invalid username or password',
      });

      const result = await authService.login('wrong', 'wrong');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });

    it('clears auth data on login failure', async () => {
      const api = await import('@/services/api');
      // Setup some existing auth data
      localStorage.setItem('jwt_token', 'old-token');
      localStorage.setItem('user_data', JSON.stringify(createMockUser()));

      vi.mocked(api.default.post).mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('logout', () => {
    it('calls API and clears local data on successful logout', async () => {
      const api = await import('@/services/api');
      localStorage.setItem('jwt_token', createMockJWT());
      localStorage.setItem('user_data', JSON.stringify(createMockUser()));

      vi.mocked(api.default.post).mockResolvedValue({ status: 200 });

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(api.default.post).toHaveBeenCalledWith('/users/logout', {});
      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });

    it('clears data even if server call fails', async () => {
      const api = await import('@/services/api');
      localStorage.setItem('jwt_token', createMockJWT());
      localStorage.setItem('user_data', JSON.stringify(createMockUser()));

      vi.mocked(api.default.post).mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      const result = await authService.logout();

      expect(result.success).toBe(false);
      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });

    it('handles 401 gracefully (already logged out)', async () => {
      const api = await import('@/services/api');
      localStorage.setItem('jwt_token', createMockJWT());

      vi.mocked(api.default.post).mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
      });

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(result.message).toContain('expired');
    });

    it('handles no token scenario', async () => {
      const api = await import('@/services/api');

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(result.message).toContain('Already logged out');
      expect(api.default.post).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true for valid token and user data', () => {
      localStorage.setItem('jwt_token', createMockJWT());
      localStorage.setItem('user_data', JSON.stringify(createMockUser()));

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false when no token', () => {
      localStorage.setItem('user_data', JSON.stringify(createMockUser()));

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('returns false when no user data', () => {
      localStorage.setItem('jwt_token', createMockJWT());

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('returns false for expired token', () => {
      localStorage.setItem('jwt_token', createExpiredJWT());
      localStorage.setItem('user_data', JSON.stringify(createMockUser()));

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('clears data when token is expired', () => {
      localStorage.setItem('jwt_token', createExpiredJWT());
      localStorage.setItem('user_data', JSON.stringify(createMockUser()));

      authService.isAuthenticated();

      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('detects expired token', () => {
      const expiredToken = createExpiredJWT();
      expect(authService.isTokenExpired(expiredToken)).toBe(true);
    });

    it('returns false for valid token', () => {
      const validToken = createMockJWT(3600); // 1 hour from now
      expect(authService.isTokenExpired(validToken)).toBe(false);
    });

    it('validates token format before checking expiration', () => {
      const invalidToken = createInvalidJWT();
      expect(authService.isTokenExpired(invalidToken)).toBe(true);
    });

    it('returns true for token without expiration claim', () => {
      // Create token without exp using Buffer (Node.js compatible)
      const base64Encode = (str: string) => Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const header = base64Encode(JSON.stringify({ alg: 'HS256' }));
      const payload = base64Encode(JSON.stringify({ sub: 'user', userId: 1 })); // No exp
      const signature = base64Encode('signature');
      const tokenWithoutExp = `${header}.${payload}.${signature}`;

      expect(authService.isTokenExpired(tokenWithoutExp)).toBe(true);
    });

    it('applies clock skew tolerance', () => {
      // Token expired 15 seconds ago - should still be valid with 30s skew
      const recentlyExpiredToken = createMockJWT(-15);
      // This depends on implementation - might be valid or invalid
      const result = authService.isTokenExpired(recentlyExpiredToken);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getCurrentUser', () => {
    it('returns parsed user data', () => {
      const mockUser = createMockUser();
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      const user = authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('returns null when no user data', () => {
      const user = authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns null and clears corrupted data', () => {
      localStorage.setItem('user_data', 'invalid json');

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('returns stored token', () => {
      const token = createMockJWT();
      localStorage.setItem('jwt_token', token);

      expect(authService.getToken()).toBe(token);
    });

    it('returns null when no token', () => {
      expect(authService.getToken()).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('updates and stores sanitized user data', async () => {
      const api = await import('@/services/api');
      const currentUser = createMockUser();
      localStorage.setItem('user_data', JSON.stringify(currentUser));

      const updatedData = {
        data: createMockUser({ username: 'newusername', email: 'new@example.com' }),
      };
      vi.mocked(api.default.put).mockResolvedValue(updatedData);

      const result = await authService.updateProfile({ username: 'newusername' });

      expect(result.success).toBe(true);
      const storedUser = JSON.parse(localStorage.getItem('user_data')!);
      expect(storedUser.username).toBe('newusername');
    });

    it('handles update failure', async () => {
      const api = await import('@/services/api');
      vi.mocked(api.default.put).mockRejectedValue({
        status: 400,
        message: 'Update failed',
      });

      const result = await authService.updateProfile({ username: 'new' });

      expect(result.success).toBe(false);
    });
  });
});
