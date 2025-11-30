/**
 * Custom hook for authentication state management.
 * @module hooks/useAuth
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Authentication state and handlers.
 */
interface UseAuthReturn {
  /** Whether auth check is in progress */
  checkingAuth: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Handle successful login */
  handleLogin: (token: string) => void;
  /** Handle logout */
  handleLogout: () => void;
}

/**
 * Hook for managing authentication state via cookies.
 * Checks for existing auth token on mount and provides login/logout handlers.
 * 
 * @returns Authentication state and handler functions
 * 
 * @example
 * const { isAuthenticated, checkingAuth, handleLogin, handleLogout } = useAuth();
 * 
 * if (checkingAuth) return <Loading />;
 * if (!isAuthenticated) return <LoginForm onLogin={handleLogin} />;
 * return <Dashboard onLogout={handleLogout} />;
 */
export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for existing cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  /**
   * Handles successful login by setting auth cookie.
   */
  const handleLogin = useCallback((token: string) => {
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
    setIsAuthenticated(true);
  }, []);

  /**
   * Handles logout by clearing auth cookie.
   */
  const handleLogout = useCallback(() => {
    document.cookie = "auth_token=; path=/; max-age=0";
    setIsAuthenticated(false);
  }, []);

  return {
    checkingAuth,
    isAuthenticated,
    handleLogin,
    handleLogout,
  };
};
