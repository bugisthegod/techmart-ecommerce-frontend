import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import type { NavigateFunction } from "react-router-dom";
import { ApiError } from "@/types";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

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
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api",
  timeout: 10000, // 10 second timeout for requests
  headers: {
    "Content-Type": "application/json",
  },
});

// PERSISTENT storage navigateFunction
// api.ts is not a React component, so you need to store navigate (React's hook) from App.tsx (React component)
let navigateFunction: NavigateFunction | null = null;

export const setNavigate = (navigate: NavigateFunction): void => {
  navigateFunction = navigate;
}

/**
 * Request Interceptor
 * This runs before every API request is sent
 * Purpose: Automatically add JWT token to requests if user is logged in
 */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get JWT token from localStorage (we'll implement auth later)
    const token = localStorage.getItem("jwt_token");

    if (token) {
      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the outgoing request for debugging (token presence only, not value)
    logger.log("🚀 API Request:", config.method?.toUpperCase(), config.url, "| Auth:", !!token);

    return config;
  },
  (error: AxiosError) => {
    // Handle request configuration errors
    logger.error("❌ Request Error:", error);
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
    logger.log("✅ API Response:", response.status, response.config.url);

    // Return the response data directly (unwrap the axios wrapper)
    return response.data;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    logger.error(
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
          logger.warn("🔒 Authentication failed - redirecting to login");
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please login again.");
          if(navigateFunction) navigateFunction("/login");
          break;

        case 403:
          // Forbidden - user doesn't have permission
          logger.warn("🚫 Access forbidden");
          break;

        case 404:
          // Not found
          logger.warn("🔍 Resource not found");
          break;

        case 500:
          // Server error
          logger.error("🔥 Server error occurred");
          break;

        default:
          logger.error("💥 Unexpected error:", status);
      }

      // Return a structured error object
      const apiError: ApiError = {
        status,
        message: (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string')
          ? data.message
          : "An error occurred",
        data: data,
      };
      return Promise.reject(apiError);
    }

    // Network error or request timeout
    if (error.request) {
      logger.error("🌐 Network error - backend might be down");
      const apiError: ApiError = {
        status: 0,
        message: "Network error - please check your connection",
      };
      return Promise.reject(apiError);
    }

    // Something else happened
    const apiError: ApiError = {
      status: -1,
      message: error.message || "Unknown error occurred",
    };
    return Promise.reject(apiError);
  }
);

// Export the configured axios instance
export default api;

// Mutator function for orval-generated code
export const customAxiosInstance = <T>(config: AxiosRequestConfig): Promise<T> & { cancel?: () => void } => {
  const source = axios.CancelToken.source();

  // Strip /api prefix from orval-generated URLs since our baseURL already includes it
  const modifiedConfig = {
    ...config,
    url: config.url?.replace(/^\/api/, ''),
    cancelToken: source.token
  };

  const promise = api.request<any, T>(modifiedConfig) as Promise<T> & { cancel?: () => void };
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };
  return promise;
};
