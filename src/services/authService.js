import api from "./api";

/**
 * Authentication Service
 *
 * This service handles all authentication-related operations including:
 * - User registration and login
 * - JWT token management
 * - User session persistence
 * - Authentication state checking
 *
 * Think of this as your application's security department that handles
 * all user identity verification and access control.
 */

class AuthService {
  /**
   * User Registration
   * Creates a new user account in the system
   *
   * @param {Object} userData - The registration information
   * @param {string} userData.username - Unique username
   * @param {string} userData.password - User password
   * @param {string} userData.email - User email address
   * @param {string} userData.phone - User phone number (optional)
   * @returns {Promise<Object>} Registration response with user data
   */
  async register(userData) {
    try {
      console.log("🔐 Attempting user registration for:", userData.username);

      // Send registration request to your Spring Boot backend
      // This corresponds to: POST /api/users/register
      const response = await api.post("/users/register", {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        phone: userData.phone || null,
      });

      if (response.status !== 200) {
        throw new Error(`Register failed: ${response.msg}`);
      }

      console.log("✅ Registration successful");
      return {
        success: true,
        message: "Registration successful! Please log in.",
        data: response.data,
      };
    } catch (error) {
      console.error("❌ Registration failed:", error);

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
   *
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} Login response with JWT token and user data
   */
  async login(username, password) {
    try {
      console.log("🔐 Attempting login for user:", username);

      // Send login request to your Spring Boot backend
      // This corresponds to: POST /api/users/login
      const response = await api.post("/users/login", {
        username,
        password,
      });

      // Check if the response status is successful
      if (response.status !== 200) {
        throw new Error(`Login failed: ${response.msg}`);
      }

      // Extract the JWT token from the response
      // Your Spring Boot backend returns this in the LoginResponse DTO
      const { token, userInfo } = response.data;

      if (token && userInfo) {
        // Store the JWT token for future API requests
        // The api.js interceptor will automatically include this in future requests
        localStorage.setItem("jwt_token", token);

        // Store user information for easy access throughout the application
        localStorage.setItem("user_data", JSON.stringify(userInfo));

        console.log("✅ Login successful for user:", userInfo.username);

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
    } catch (error) {
      console.error("❌ Login failed:", error);

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
  logout() {
    console.log("🔐 Logging out user");

    const token = localStorage.getItem("jwt_token");
    const response = api.post("/users/logout", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log("is successful remove token", response);

    // Check if the response status is successful
    // if (response.status !== 200) {
    //   throw new Error(`Login failed: ${response.msg}`);
    // }
    // Clear all authentication-related data from localStorage
    this.clearAuthData();

    // You could also make an API call to invalidate the token on the server
    // await api.post('/users/logout');
    console.log("✅ Logout completed");

    return {
      success: true,
      message: "Logged out successfully",
    };
  }

  /**
   * Check if user is currently authenticated
   *
   * @returns {boolean} True if user has a valid token, false otherwise
   */
  isAuthenticated() {
    const token = localStorage.getItem("jwt_token");
    const userData = localStorage.getItem("user_data");

    // Basic check - in a production app, you might want to verify token expiration
    const isLoggedIn = !!(token && userData);

    console.log(
      "🔍 Authentication check:",
      isLoggedIn ? "Authenticated" : "Not authenticated"
    );

    return isLoggedIn;
  }

  /**
   * Get current user data
   *
   * @returns {Object|null} Current user data or null if not authenticated
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
      // Clear corrupted data
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Get current JWT token
   *
   * @returns {string|null} Current JWT token or null if not authenticated
   */
  getToken() {
    return localStorage.getItem("jwt_token");
  }

  /**
   * Update user profile information
   *
   * @param {Object} updatedUserData - New user information
   * @returns {Promise<Object>} Update response
   */
  async updateProfile(updatedUserData) {
    try {
      console.log("🔐 Updating user profile");

      // This would correspond to a PUT endpoint in your Spring Boot backend
      // You might need to implement this in your UserController
      const response = await api.put("/users/profile", updatedUserData);

      // Update stored user data with new information
      const currentUser = this.getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem("user_data", JSON.stringify(updatedUser));

      console.log("✅ Profile updated successfully");

      return {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      };
    } catch (error) {
      console.error("❌ Profile update failed:", error);

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
  clearAuthData() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
  }
}

// Create and export a single instance of the AuthService
// This ensures that all parts of your application use the same authentication state
const authService = new AuthService();
export default authService;
