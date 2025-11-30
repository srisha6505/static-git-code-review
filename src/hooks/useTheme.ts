/**
 * Custom hook for theme management.
 * @module hooks/useTheme
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Theme type.
 */
export type Theme = 'dark' | 'light';

/**
 * Theme state and handlers.
 */
interface UseThemeReturn {
  /** Current theme */
  theme: Theme;
  /** Toggle between dark and light themes */
  toggleTheme: () => void;
}

/**
 * Hook for managing application theme (dark/light mode).
 * Syncs theme preference with document attribute for CSS variable support.
 * 
 * @param initialTheme - Initial theme value (defaults to 'dark')
 * @returns Current theme and toggle function
 * 
 * @example
 * const { theme, toggleTheme } = useTheme();
 * 
 * <button onClick={toggleTheme}>
 *   {theme === 'dark' ? <Sun /> : <Moon />}
 * </button>
 */
export const useTheme = (initialTheme: Theme = 'dark'): UseThemeReturn => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /**
   * Toggles between dark and light themes.
   */
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return {
    theme,
    toggleTheme,
  };
};
