import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Security Validation and Sanitization Utilities
 *
 * This module provides:
 * - Zod schemas for validating API responses
 * - Sanitization functions for user input and storage data
 * - JWT token format validation
 * - Data type validation helpers
 */

// ============================================
// Zod Schemas for API Response Validation
// ============================================

/**
 * User Response Schema
 * Validates the structure of user data from the backend
 */
export const userResponseSchema = z.object({
  id: z.number().positive(),
  username: z.string().min(1).max(50),
  email: z.string().email().max(100),
  phone: z.string().max(20).nullable().optional(),
  avatar: z.string().nullable().optional(),
  status: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Login Data Schema
 * Validates the actual login data structure
 */
const loginDataSchema = z.object({
  token: z.string().min(1),
  userInfo: userResponseSchema,
  expiresIn: z.number().positive().optional(),
});

/**
 * Login Response Schema
 * Validates the login API response structure wrapped in ResponseResult
 */
export const loginResponseSchema = z.object({
  status: z.number().optional(),
  msg: z.string().optional(),
  data: loginDataSchema,
});

/**
 * Register Response Schema
 * Validates the registration API response
 */
export const registerResponseSchema = z.object({
  status: z.number(),
  msg: z.string(),
  data: z.any().optional(),
});

// ============================================
// Sanitization Functions
// ============================================

/**
 * Strip HTML tags from a string
 * Prevents XSS attacks from stored data
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize username
 * Only allows alphanumeric characters, underscores, and hyphens
 */
export function sanitizeUsername(username: string): string {
  const stripped = stripHtmlTags(username);
  const alphanumeric = stripped.replace(/[^a-zA-Z0-9_-]/g, '');
  return alphanumeric.slice(0, 50); // Max length 50
}

/**
 * Sanitize email address
 * Removes HTML and limits length
 */
export function sanitizeEmail(email: string): string {
  const stripped = stripHtmlTags(email);
  return stripped.slice(0, 100); // Max length 100
}

/**
 * Sanitize phone number
 * Only allows digits, spaces, hyphens, parentheses, and plus sign
 */
export function sanitizePhone(phone: string): string {
  const stripped = stripHtmlTags(phone);
  const cleaned = stripped.replace(/[^0-9\s\-()+ ]/g, '');
  return cleaned.slice(0, 20); // Max length 20
}

/**
 * Sanitize user data object before storing
 * Applies appropriate sanitization to each field
 */
export function sanitizeUserData(userData: any): any {
  if (!userData || typeof userData !== 'object') {
    return null;
  }

  return {
    id: typeof userData.id === 'number' ? userData.id : 0,
    username: sanitizeUsername(String(userData.username || '')),
    email: sanitizeEmail(String(userData.email || '')),
    phone: userData.phone ? sanitizePhone(String(userData.phone)) : null,
    avatar: userData.avatar || undefined,
    status: userData.status || undefined,
    createdAt: userData.createdAt || undefined,
    updatedAt: userData.updatedAt || undefined,
  };
}

// ============================================
// JWT Token Validation
// ============================================

/**
 * Validate JWT token format
 * Checks basic structure without decoding
 */
export function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT format: header.payload.signature (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be base64url encoded (alphanumeric, -, _)
  const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => part.length > 0 && base64UrlPattern.test(part));
}

/**
 * Validate JWT token expiration with clock skew tolerance
 * @param exp - Expiration timestamp in seconds (from JWT payload)
 * @param clockSkewSeconds - Tolerance for clock differences (default: 30 seconds)
 */
export function isTokenExpiredWithSkew(exp: number, clockSkewSeconds: number = 30): boolean {
  if (!exp || typeof exp !== 'number') {
    return true; // Missing expiration = expired
  }

  // Current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);

  // Allow some tolerance for clock skew (grace period)
  return exp + clockSkewSeconds < currentTime;
}

// ============================================
// Storage Validation
// ============================================

/**
 * Validate data before storing in localStorage/sessionStorage
 * Prevents storing invalid or potentially malicious data
 */
export function validateStorageData(key: string, value: any): boolean {
  // Don't allow undefined or null values
  if (value === undefined || value === null) {
    return false;
  }

  // Validate specific storage keys
  switch (key) {
    case 'jwt_token':
      return isValidJwtFormat(value);

    case 'user_data':
      // Must be a valid JSON string
      try {
        const parsed = JSON.parse(value);
        const validated = userResponseSchema.safeParse(parsed);
        return validated.success;
      } catch {
        return false;
      }

    default:
      // For other keys, just ensure it's a string
      return typeof value === 'string' && value.length > 0;
  }
}

/**
 * Safely get and validate data from localStorage
 * Returns null if data is invalid or missing
 */
export function getValidatedStorageItem(key: string): string | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return null;
    }

    // Validate before returning
    if (!validateStorageData(key, value)) {
      // Remove invalid data
      localStorage.removeItem(key);
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

/**
 * Safely set data in localStorage with validation
 * Returns true if successful, false if validation fails
 */
export function setValidatedStorageItem(key: string, value: string): boolean {
  try {
    if (!validateStorageData(key, value)) {
      logger.error(`Validation failed for storage key: ${key}`);
      return false;
    }

    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Input Validation Patterns (for Zod schemas)
// ============================================

/**
 * Regular expressions for strict input validation
 */
export const validationPatterns = {
  // Username: alphanumeric, underscores, hyphens only
  username: /^[a-zA-Z0-9_-]+$/,

  // Phone: digits, spaces, hyphens, parentheses, plus sign
  phone: /^[\d\s\-()+ ]+$/,

  // Strong password: min 8 chars, at least one letter and one number
  strongPassword: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
};

/**
 * Enhanced Zod schema for login form
 * Includes strict validation patterns
 */
export const loginFormSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(validationPatterns.username, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Enhanced Zod schema for registration form
 * Includes strict validation for all fields
 */
export const registerFormSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(validationPatterns.username, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  phone: z.string()
    .regex(validationPatterns.phone, "Invalid phone number format")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal('')),
});
