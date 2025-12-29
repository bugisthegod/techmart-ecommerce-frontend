import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import type { AuthState, AuthAction, AuthContextValue } from '@/types';
import type { UserRegisterRequest } from '@/api/models';
import { logger } from '@/lib/logger';

/**
 * Authentication Context
 *
 * This creates a global state management system for user authentication.
 * Any component in your application can access and modify authentication state
 * without needing to pass props down through multiple component levels.
 *
 * Think of this as a central broadcasting station for authentication information.
 */

// Define all possible authentication actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  RESTORE_SESSION: 'RESTORE_SESSION',
  CLEAR_ERROR: 'CLEAR_ERROR'
} as const;

// Define the initial state when the app starts
const initialState: AuthState = {
  user: null,                    // Current user information
  token: null,                   // JWT token
  isAuthenticated: false,        // Whether user is logged in
  isLoading: false,             // Whether an auth operation is in progress
  error: null                   // Any authentication error messages
};

/**
 * Authentication Reducer
 *
 * This function determines how the authentication state changes in response to actions.
 * It's like a rulebook that says "when this happens, change the state like this."
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.message
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null
        // Note: After registration, user still needs to log in
        // So we don't set user/token here
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Create the Context (this is like creating the radio frequency)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication Provider Component
 *
 * This component wraps your entire application and provides authentication
 * state and methods to all child components.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Restore user session on app startup
   * Check if user was previously logged in and restore their session
   */
  useEffect(() => {
    const restoreSession = () => {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        const token = authService.getToken();
        
        if (user && token) {
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: { user, token }
          });
        }
      }
    };

    restoreSession();
  }, []);

  /**
   * Login function that components can call
   */
  const login = async (username: string, password: string) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const result = await authService.login(username, password);

      logger.log("After login success:", result);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: result.data.userInfo,
            token: result.data.token
          }
        });
        
        return { success: true, message: 'Login successful!' };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { message: result.message }
        });
        
        return { success: false, message: result.message };
      }
    } catch {
      const errorMessage = 'Login failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { message: errorMessage }
      });
      
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Registration function that components can call
   */
  const register = async (userData: UserRegisterRequest) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
        return { success: true, message: result.message };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: { message: result.message }
        });
        return { success: false, message: result.message };
      }
    } catch {
      const errorMessage = 'Registration failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { message: errorMessage }
      });
      
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Logout function that components can call
   */
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      // Even if logout fails, still clear local auth state
      logger.error("Logout error in context:", error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  /**
   * Clear any authentication errors
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // The value object contains everything that child components can access
  const value: AuthContextValue = {
    // Current state
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Functions that components can call
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use authentication context
 *
 * This is a convenience function that components can use to access
 * authentication state and functions. It also includes error checking
 * to ensure the hook is used within an AuthProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export the context for advanced use cases
export { AuthContext };