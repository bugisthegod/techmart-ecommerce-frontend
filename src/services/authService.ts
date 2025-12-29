import api from "./api";
import { jwtDecode } from "jwt-decode";
import type { AuthResult, JwtPayload } from "@/types";
import type { UserRegisterRequest } from "@/api/models/userRegisterRequest";
import type { UserResponse } from "@/api/models/userResponse";
import type { LoginResponse } from "@/api/models/loginResponse";
import { logger } from "@/lib/logger";
import {
  loginResponseSchema,
  sanitizeUserData,
  isValidJwtFormat,
  isTokenExpiredWithSkew,
} from "@/lib/validation";

/**
 * Authentication Service
 *
 * This service handles all authentication-related operations including:
 * - User registration and login
 * - JWT token management
 * - User session persistence
 * - Authentication state checking
 * - Token expiration validation
 *
 * Think of this as your application's security department that handles
 * all user identity verification and access control.
 */

interface AuthServiceResult extends AuthResult {
  data?: any;
  errors?: any;
}

class AuthService {
  /**
   * User Registration
   * Creates a new user account in the system
   */
  async register(userData: UserRegisterRequest): Promise<AuthServiceResult> {
    try {
      logger.log("🔐 Attempting user registration for:", userData.username);

      // Send registration request to your Spring Boot backend
      // This corresponds to: POST /api/users/register
      const response = await api.post("/users/register", {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        phone: userData.phone || null,
      });

      // Note: api interceptor unwraps response.data, so response IS the data
      logger.log("✅ Registration successful");
      return {
        success: true,
        message: "Registration successful! Please log in.",
        data: response,
      };
    } catch (error: any) {
      logger.error("❌ Registration failed:", error);

      // Return a standardized error format that your components can handle consistently
      return {
        success: false,
        message: error.message || "Registration failed. Please try again.",
        errors: error.data || null,
      };
    }
  }

  /**
   * User Login
   * Authenticates a user and establishes a session
   */
  async login(username: string, password: string): Promise<AuthServiceResult> {
    try {
      logger.log("🔐 Attempting login for user:", username);

      // Send login request to your Spring Boot backend
      // This corresponds to: POST /api/users/login
      const response = await api.post("/users/login", {
        username,
        password,
      });

      // Note: api interceptor unwraps response.data, so response IS the data
      // Validate response structure with Zod schema first
      const validationResult = loginResponseSchema.safeParse(response);

      if (!validationResult.success) {
        logger.error("❌ Invalid login response structure:", validationResult.error);
        throw new Error("Invalid response from server");
      }

      const { token, userInfo } = validationResult.data.data;

      if (token && userInfo) {
        // Validate JWT token format before storing
        if (!isValidJwtFormat(token)) {
          logger.error("❌ Invalid JWT token format");
          throw new Error("Invalid token format");
        }

        // Sanitize user data before storing
        const sanitizedUserInfo = sanitizeUserData(userInfo);

        if (!sanitizedUserInfo) {
          logger.error("❌ Failed to sanitize user data");
          throw new Error("Invalid user data");
        }

        // Store the JWT token for future API requests
        // The api.js interceptor will automatically include this in future requests
        localStorage.setItem("jwt_token", token);

        // Store sanitized user information for easy access throughout the application
        localStorage.setItem("user_data", JSON.stringify(sanitizedUserInfo));

        logger.log("✅ Login successful for user:", sanitizedUserInfo.username, "| User ID:", sanitizedUserInfo.id);

        return {
          success: true,
          message: "Login successful!",
          data: {
            token,
            userInfo: sanitizedUserInfo,
          },
        };
      } else {
        throw new Error("Invalid response: missing token or user information");
      }
    } catch (error: any) {
      logger.error("❌ Login failed:", error);

      // Clear any existing authentication data on login failure
      this.clearAuthData();

      return {
        success: false,
        message: error.message || "Invalid username or password",
        errors: error.data || null,
      };
    }
  }

  /**
   * User Logout
   * Clears user session and authentication data
   *
   * This is an async logout that invalidates the token on the server side
   * before clearing local data for enhanced security.
   */
  async logout(): Promise<AuthServiceResult> {
    logger.log("🔐 Logging out user");

    try {
      const token = this.getToken();

      // If no token exists, user is already logged out
      if (!token) {
        this.clearAuthData();
        logger.log("✅ Already logged out (no token found)");
        return {
          success: true,
          message: "Already logged out",
        };
      }

      // Attempt to invalidate token on server (blacklist via Redis)
      // Note: request interceptor automatically adds Authorization header
      await api.post("/users/logout", {});

      logger.log("✅ Server-side logout successful");

      // Clear local data after successful server-side invalidation
      this.clearAuthData();

      return {
        success: true,
        message: "Logged out successfully",
      };

    } catch (error: any) {
      // Defensive approach: clear local data even if server call fails
      this.clearAuthData();

      // Handle 401 gracefully (token already expired/invalid)
      if (error.status === 401) {
        logger.log("✅ Logout completed (token was already invalid)");
        return {
          success: true,
          message: "Session already expired",
        };
      }

      // Handle network errors or other failures
      logger.error("⚠️ Server-side logout failed, but local data cleared:", error);
      return {
        success: false,
        message: "Logout completed locally, but server notification failed",
      };
    }
  }

  /**
   * Check if user is currently authenticated
   * Validates both token existence AND expiration
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("jwt_token");
    const userData = localStorage.getItem("user_data");

    // First check if token and user data exist
    if (!token || !userData) {
      logger.log("🔍 Authentication check: No token or user data found");
      return false;
    }

    // Validate token expiration
    if (this.isTokenExpired(token)) {
      logger.log("🔍 Authentication check: Token has expired");
      // Clear expired token and user data
      this.clearAuthData();
      return false;
    }

    logger.log("🔍 Authentication check: Authenticated with valid token");
    return true;
  }

  /**
   * Check if JWT token is expired
   * Includes format validation and clock skew tolerance
   */
  isTokenExpired(token: string): boolean {
    try {
      // First validate token format
      if (!isValidJwtFormat(token)) {
        logger.warn("⚠️ Invalid JWT token format");
        return true;
      }

      const decoded = jwtDecode<JwtPayload>(token);

      if (!decoded.exp) {
        // If token doesn't have expiration, consider it invalid
        logger.warn("⚠️ Token missing expiration claim");
        return true;
      }

      // Use clock skew tolerance (30 seconds)
      const isExpired = isTokenExpiredWithSkew(decoded.exp, 30);

      if (isExpired) {
        const expirationDate = new Date(decoded.exp * 1000);
        logger.log(`⏰ Token expired at: ${expirationDate.toLocaleString()}`);
      }

      return isExpired;
    } catch (error) {
      logger.error("❌ Error decoding token:", error);
      // If we can't decode the token, consider it invalid
      return true;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): UserResponse | null {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error("❌ Error parsing user data:", error);
      // Clear corrupted data
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Get current JWT token
   */
  getToken(): string | null {
    return localStorage.getItem("jwt_token");
  }

  /**
   * Update user profile information
   */
  async updateProfile(updatedUserData: Partial<UserResponse>): Promise<AuthServiceResult> {
    try {
      logger.log("🔐 Updating user profile");

      // This would correspond to a PUT endpoint in your Spring Boot backend
      // You might need to implement this in your UserController
      const response = await api.put("/users/profile", updatedUserData);

      // Sanitize and validate the updated user data
      const sanitizedUpdate = sanitizeUserData(response.data);

      if (!sanitizedUpdate) {
        throw new Error("Invalid user data received from server");
      }

      // Update stored user data with new sanitized information
      const currentUser = this.getCurrentUser();
      const updatedUser = { ...currentUser, ...sanitizedUpdate };
      localStorage.setItem("user_data", JSON.stringify(updatedUser));

      logger.log("✅ Profile updated successfully");

      return {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      };
    } catch (error: any) {
      logger.error("❌ Profile update failed:", error);

      return {
        success: false,
        message: error.message || "Failed to update profile",
        errors: error.data || null,
      };
    }
  }

  /**
   * Clear all authentication data from localStorage
   *
   * Private helper method used by logout and error handling
   */
  clearAuthData(): void {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
  }
}

// Create and export a single instance of the AuthService
// This ensures that all parts of your application use the same authentication state
const authService = new AuthService();
export default authService;
