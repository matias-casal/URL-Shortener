import React, { createContext, useState, useEffect, ReactNode } from 'react';

/**
 * Theme context interface
 * Provides dark mode state and toggle function
 */
interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

/**
 * Theme context with default values
 */
export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {
    // Default implementation - will be overridden by provider
    console.debug('Default toggleTheme called');
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component
 * Manages theme state and syncs with system preferences
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Check system preference for dark mode
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  /**
   * Initialize state with system preference or stored preference
   */
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme !== null
      ? JSON.parse(savedTheme)
      : prefersDarkMode;
  });

  /**
   * Listen for changes in system color scheme preference
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
      localStorage.setItem('darkMode', JSON.stringify(e.matches));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Update DOM and localStorage when theme changes
   */
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Add or remove dark-mode class from body
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 