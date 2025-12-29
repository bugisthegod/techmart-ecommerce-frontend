import { describe, it, expect, beforeEach } from 'vitest';
import {
  userResponseSchema,
  loginResponseSchema,
  loginFormSchema,
  registerFormSchema,
  stripHtmlTags,
  sanitizeUsername,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUserData,
  isValidJwtFormat,
  isTokenExpiredWithSkew,
  validateStorageData,
  getValidatedStorageItem,
  setValidatedStorageItem,
} from '@/lib/validation';
import { createMockUser, createMockJWT, createExpiredJWT, createInvalidJWT } from '@/test/helpers';

describe('Zod Schemas', () => {
  describe('userResponseSchema', () => {
    it('validates correct user structure', () => {
      const validUser = createMockUser();
      const result = userResponseSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('rejects negative id', () => {
      const invalidUser = createMockUser({ id: -1 });
      const result = userResponseSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const invalidUser = createMockUser({ email: 'not-an-email' });
      const result = userResponseSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('allows optional phone', () => {
      const userWithoutPhone = createMockUser({ phone: null });
      const result = userResponseSchema.safeParse(userWithoutPhone);
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const incomplete = { id: 1 };
      const result = userResponseSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });
  });

  describe('loginResponseSchema', () => {
    it('validates correct login response', () => {
      const validLogin = {
        status: 200,
        msg: 'Success',
        data: {
          token: createMockJWT(),
          userInfo: createMockUser(),
        },
      };
      const result = loginResponseSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('rejects missing token', () => {
      const invalidLogin = {
        status: 200,
        msg: 'Success',
        data: {
          userInfo: createMockUser(),
        },
      };
      const result = loginResponseSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });

    it('rejects invalid userInfo', () => {
      const invalidLogin = {
        status: 200,
        msg: 'Success',
        data: {
          token: createMockJWT(),
          userInfo: { invalid: 'data' },
        },
      };
      const result = loginResponseSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });

  describe('loginFormSchema', () => {
    it('validates correct login form', () => {
      const validForm = {
        username: 'testuser',
        password: 'password123',
      };
      const result = loginFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('rejects username too short', () => {
      const invalid = { username: 'ab', password: 'password123' };
      const result = loginFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects special characters in username', () => {
      const invalid = { username: 'user@test', password: 'password123' };
      const result = loginFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects password too short', () => {
      const invalid = { username: 'testuser', password: '12345' };
      const result = loginFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('registerFormSchema', () => {
    it('validates correct registration form', () => {
      const validForm = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
      };
      const result = registerFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('allows empty phone', () => {
      const valid = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '',
      };
      const result = registerFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const invalid = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };
      const result = registerFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

describe('Sanitization Functions', () => {
  describe('stripHtmlTags', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = stripHtmlTags(input);
      expect(result).toBe('alert("xss")Hello');
      expect(result).not.toContain('<script>');
    });

    it('removes img tags', () => {
      const input = '<img src="x" onerror="alert(1)">Test';
      const result = stripHtmlTags(input);
      expect(result).toBe('Test');
    });

    it('removes all HTML tags', () => {
      const input = '<div><p>Hello</p><span>World</span></div>';
      const result = stripHtmlTags(input);
      expect(result).toBe('HelloWorld');
    });

    it('preserves plain text', () => {
      const input = 'Just plain text';
      const result = stripHtmlTags(input);
      expect(result).toBe('Just plain text');
    });
  });

  describe('sanitizeUsername', () => {
    it('allows alphanumeric, underscore, hyphen', () => {
      const input = 'user_name-123';
      const result = sanitizeUsername(input);
      expect(result).toBe('user_name-123');
    });

    it('removes special characters', () => {
      const input = 'user@#$%name';
      const result = sanitizeUsername(input);
      expect(result).toBe('username');
    });

    it('strips HTML tags first', () => {
      const input = '<script>alert("xss")</script>username';
      const result = sanitizeUsername(input);
      // HTML tags are completely removed, only text content remains
      expect(result).toBe('alertxssusername');
    });

    it('enforces max length of 50', () => {
      const input = 'a'.repeat(100);
      const result = sanitizeUsername(input);
      expect(result.length).toBe(50);
    });

    it('removes spaces', () => {
      const input = 'user name';
      const result = sanitizeUsername(input);
      expect(result).toBe('username');
    });
  });

  describe('sanitizeEmail', () => {
    it('strips HTML tags', () => {
      const input = '<script>test@example.com</script>';
      const result = sanitizeEmail(input);
      expect(result).not.toContain('<script>');
    });

    it('enforces max length of 100', () => {
      const input = 'a'.repeat(150) + '@example.com';
      const result = sanitizeEmail(input);
      expect(result.length).toBe(100);
    });

    it('preserves valid email', () => {
      const input = 'test@example.com';
      const result = sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('allows digits, spaces, hyphens, parentheses, plus', () => {
      const input = '+1 (234) 567-8900';
      const result = sanitizePhone(input);
      expect(result).toBe('+1 (234) 567-8900');
    });

    it('removes letters', () => {
      const input = '123abc456';
      const result = sanitizePhone(input);
      expect(result).toBe('123456');
    });

    it('strips HTML', () => {
      const input = '<script>1234567890</script>';
      const result = sanitizePhone(input);
      expect(result).toBe('1234567890');
    });

    it('enforces max length of 20', () => {
      const input = '1'.repeat(50);
      const result = sanitizePhone(input);
      expect(result.length).toBe(20);
    });
  });

  describe('sanitizeUserData', () => {
    it('sanitizes all user fields', () => {
      const dirtyUser = {
        id: 1,
        username: 'user@#$name',
        email: '<script>test@example.com</script>',
        phone: '123-ABC-456',
      };
      const result = sanitizeUserData(dirtyUser);
      expect(result.username).toBe('username');
      expect(result.email).not.toContain('<script>');
      expect(result.phone).toBe('123--456');
    });

    it('returns null for non-object input', () => {
      expect(sanitizeUserData(null)).toBeNull();
      expect(sanitizeUserData(undefined)).toBeNull();
      expect(sanitizeUserData('string')).toBeNull();
    });

    it('handles missing fields gracefully', () => {
      const partial = {
        id: 1,
        username: 'test',
      };
      const result = sanitizeUserData(partial);
      expect(result.id).toBe(1);
      expect(result.username).toBe('test');
      expect(result.email).toBe('');
    });

    it('converts non-number id to 0', () => {
      const invalid = {
        id: 'not-a-number',
        username: 'test',
        email: 'test@example.com',
      };
      const result = sanitizeUserData(invalid);
      expect(result.id).toBe(0);
    });
  });
});

describe('JWT Validation', () => {
  describe('isValidJwtFormat', () => {
    it('accepts valid JWT with 3 parts', () => {
      const validToken = createMockJWT();
      expect(isValidJwtFormat(validToken)).toBe(true);
    });

    it('rejects token with only 2 parts', () => {
      const invalid = createInvalidJWT();
      expect(isValidJwtFormat(invalid)).toBe(false);
    });

    it('rejects token with 4 parts', () => {
      const invalid = 'part1.part2.part3.part4';
      expect(isValidJwtFormat(invalid)).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidJwtFormat('')).toBe(false);
    });

    it('rejects non-string input', () => {
      expect(isValidJwtFormat(null as any)).toBe(false);
      expect(isValidJwtFormat(undefined as any)).toBe(false);
      expect(isValidJwtFormat(123 as any)).toBe(false);
    });

    it('rejects tokens with empty parts', () => {
      const invalid = 'part1..part3';
      expect(isValidJwtFormat(invalid)).toBe(false);
    });

    it('rejects tokens with invalid base64url characters', () => {
      const invalid = 'part1!.part2@.part3#';
      expect(isValidJwtFormat(invalid)).toBe(false);
    });
  });

  describe('isTokenExpiredWithSkew', () => {
    it('returns false for future expiration', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      expect(isTokenExpiredWithSkew(futureExp)).toBe(false);
    });

    it('returns true for past expiration', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      expect(isTokenExpiredWithSkew(pastExp)).toBe(true);
    });

    it('applies clock skew tolerance', () => {
      const recentlyExpired = Math.floor(Date.now() / 1000) - 15; // 15 seconds ago
      // With default 30 second skew, should still be valid
      expect(isTokenExpiredWithSkew(recentlyExpired, 30)).toBe(false);
    });

    it('returns true when expired beyond skew tolerance', () => {
      const expired = Math.floor(Date.now() / 1000) - 60; // 60 seconds ago
      // With 30 second skew, should be expired
      expect(isTokenExpiredWithSkew(expired, 30)).toBe(true);
    });

    it('returns true for missing expiration', () => {
      expect(isTokenExpiredWithSkew(null as any)).toBe(true);
      expect(isTokenExpiredWithSkew(undefined as any)).toBe(true);
    });

    it('returns true for non-number expiration', () => {
      expect(isTokenExpiredWithSkew('not-a-number' as any)).toBe(true);
    });
  });
});

describe('Storage Validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('validateStorageData', () => {
    it('validates correct JWT token format', () => {
      const validToken = createMockJWT();
      expect(validateStorageData('jwt_token', validToken)).toBe(true);
    });

    it('rejects invalid JWT format', () => {
      const invalid = createInvalidJWT();
      expect(validateStorageData('jwt_token', invalid)).toBe(false);
    });

    it('validates correct user_data', () => {
      const validUser = JSON.stringify(createMockUser());
      expect(validateStorageData('user_data', validUser)).toBe(true);
    });

    it('rejects invalid user_data JSON', () => {
      const invalid = 'not valid json';
      expect(validateStorageData('user_data', invalid)).toBe(false);
    });

    it('rejects user_data with invalid schema', () => {
      const invalid = JSON.stringify({ invalid: 'data' });
      expect(validateStorageData('user_data', invalid)).toBe(false);
    });

    it('rejects null values', () => {
      expect(validateStorageData('jwt_token', null)).toBe(false);
    });

    it('rejects undefined values', () => {
      expect(validateStorageData('jwt_token', undefined)).toBe(false);
    });

    it('allows any string for unknown keys', () => {
      expect(validateStorageData('other_key', 'some value')).toBe(true);
    });

    it('rejects empty strings for unknown keys', () => {
      expect(validateStorageData('other_key', '')).toBe(false);
    });
  });

  describe('getValidatedStorageItem', () => {
    it('returns valid token from storage', () => {
      const token = createMockJWT();
      localStorage.setItem('jwt_token', token);
      expect(getValidatedStorageItem('jwt_token')).toBe(token);
    });

    it('returns null for missing item', () => {
      expect(getValidatedStorageItem('jwt_token')).toBeNull();
    });

    it('removes and returns null for invalid token', () => {
      const invalid = createInvalidJWT();
      localStorage.setItem('jwt_token', invalid);
      expect(getValidatedStorageItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });

    it('removes and returns null for corrupted user_data', () => {
      localStorage.setItem('user_data', 'not valid json');
      expect(getValidatedStorageItem('user_data')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('setValidatedStorageItem', () => {
    it('stores valid JWT token', () => {
      const token = createMockJWT();
      const result = setValidatedStorageItem('jwt_token', token);
      expect(result).toBe(true);
      expect(localStorage.getItem('jwt_token')).toBe(token);
    });

    it('rejects invalid JWT token', () => {
      const invalid = createInvalidJWT();
      const result = setValidatedStorageItem('jwt_token', invalid);
      expect(result).toBe(false);
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });

    it('stores valid user_data', () => {
      const userData = JSON.stringify(createMockUser());
      const result = setValidatedStorageItem('user_data', userData);
      expect(result).toBe(true);
      expect(localStorage.getItem('user_data')).toBe(userData);
    });

    it('rejects invalid user_data', () => {
      const invalid = 'not valid json';
      const result = setValidatedStorageItem('user_data', invalid);
      expect(result).toBe(false);
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });
});
