import axios from "axios";

/**
 * Base API configuration for the e-commerce application
 * This creates a centralized HTTP client that handles:
 * - Base URL configuration
 * - Request/Response interceptors
 * - Authentication token management
 * - Error handling
 */

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:8080/api", // my backend URL
  timeout: 10000, // 10 second timeout for requests
  headers: {
    "Content-Type": "application/json",
  },
});

// PERSISTENT storage navigateFunction
// api.js is not a React component, so you need to store navigate (React's hook) from App.jsx (React component)
let navigateFunction = null;
export const setNavigate = (navigate) =>{
  navigateFunction = navigate;
}

/**
 * Request Interceptor
 * This runs before every API request is sent
 * Purpose: Automatically add JWT token to requests if user is logged in
 */

api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage (we'll implement auth later)
    const token = localStorage.getItem("jwt_token");

    if (token) {
      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("token:",token)

    // Log the outgoing request for debugging (remove in production)
    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    // Handle request configuration errors
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * This runs after every API response is received
 * Purpose: Handle common response scenarios and errors
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log("✅ API Response:", response.status, response.config.url);

    // Return the response data directly (unwrap the axios wrapper)
    return response.data;
  },
  (error) => {
    // Handle different types of errors
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data
    );

    // Handle specific HTTP status codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.warn("🔒 Authentication failed - redirecting to login");
          localStorage.removeItem("jwt_token");
          // We'll implement proper redirect logic later
          if(navigateFunction) navigateFunction("/login");
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.warn("🚫 Access forbidden");
          break;

        case 404:
          // Not found
          console.warn("🔍 Resource not found");
          break;

        case 500:
          // Server error
          console.error("🔥 Server error occurred");
          break;

        default:
          console.error("💥 Unexpected error:", status);
      }

      // Return a structured error object
      return Promise.reject({
        status,
        message: data?.message || "An error occurred",
        data: data,
      });
    }

    // Network error or request timeout
    if (error.request) {
      console.error("🌐 Network error - backend might be down");
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
      });
    }

    // Something else happened
    return Promise.reject({
      status: -1,
      message: error.message || "Unknown error occurred",
    });
  }
);

// Export the configured axios instance
export default api;
