import api from "./api";
import { jwtDecode } from "jwt-decode";
import type { AuthResult, JwtPayload } from "@/types";
import type { UserRegisterRequest } from "@/api/models/userRegisterRequest";
import type { UserResponse } from "@/api/models/userResponse";
import type { LoginResponse } from "@/api/models/loginResponse";
import { logger } from "@/lib/logger";

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

      if (response.status !== 200) {
        throw new Error(`Register failed: ${response.data.msg}`);
      }

      logger.log("✅ Registration successful");
      return {
        success: true,
        message: "Registration successful! Please log in.",
        data: response.data,
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

      // Check if the response status is successful
      if (response.status !== 200) {
        throw new Error(`Login failed: ${response.data.msg}`);
      }

      // Extract the JWT token from the response
      // Your Spring Boot backend returns this in the LoginResponse DTO
      const { token, userInfo } = response.data as LoginResponse;

      if (token && userInfo) {
        // Store the JWT token for future API requests
        // The api.js interceptor will automatically include this in future requests
        localStorage.setItem("jwt_token", token);

        // Store user information for easy access throughout the application
        localStorage.setItem("user_data", JSON.stringify(userInfo));

        logger.log("✅ Login successful for user:", userInfo.username);

        return {
          success: true,
          message: "Login successful!",
          data: {
            token,
            userInfo,
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
   * This is a client-side logout that clears stored tokens.
   * In a production application, you might also want to invalidate
   * the token on the server side for enhanced security.
   */
  logout(): AuthServiceResult {
    logger.log("🔐 Logging out user");

    const token = localStorage.getItem("jwt_token");
    const response = api.post("/users/logout", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    logger.log("is successful remove token", response);

    // Check if the response status is successful
    // if (response.status !== 200) {
    //   throw new Error(`Login failed: ${response.msg}`);
    // }
    // Clear all authentication-related data from localStorage
    this.clearAuthData();

    // You could also make an API call to invalidate the token on the server
    // await api.post('/users/logout');
    logger.log("✅ Logout completed");

    return {
      success: true,
      message: "Logged out successfully",
    };
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
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (!decoded.exp) {
        // If token doesn't have expiration, consider it invalid
        logger.warn("⚠️ Token missing expiration claim");
        return true;
      }

      // JWT exp is in seconds, Date.now() is in milliseconds
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime;

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

      // Update stored user data with new information
      const currentUser = this.getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data };
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
