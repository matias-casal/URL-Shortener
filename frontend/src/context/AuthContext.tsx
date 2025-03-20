import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

/**
 * User data interface
 */
interface User {
  id: string;
  email: string;
}

/**
 * Shortened URL data structure
 */
interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  qrCode: string;
  visitCount: number;
}

/**
 * Authentication context interface
 * Defines all available methods and state for authentication
 */
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  tempUrl: ShortenedUrl | null;
  setTempUrl: (url: ShortenedUrl | null) => void;
  clearTempUrl: () => void;
}

/**
 * Authentication context with default values
 */
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => {
    // Default implementation - will be overridden by provider
    console.debug('Default login called');
  },
  register: async () => {
    // Default implementation - will be overridden by provider
    console.debug('Default register called');
  },
  logout: () => {
    // Default implementation - will be overridden by provider
    console.debug('Default logout called');
  },
  loading: false,
  error: null,
  tempUrl: null,
  setTempUrl: () => {
    // Default implementation - will be overridden by provider
    console.debug('Default setTempUrl called');
  },
  clearTempUrl: () => {
    // Default implementation - will be overridden by provider
    console.debug('Default clearTempUrl called');
  }
});

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Manages authentication state and provides methods for login, register, and logout
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState<ShortenedUrl | null>(() => {
    const savedUrl = localStorage.getItem('tempUrl');
    return savedUrl ? JSON.parse(savedUrl) : null;
  });
  
  // Set up axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  
  /**
   * Configure authentication header for API requests
   */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  /**
   * Persist temporary URL in localStorage
   */
  useEffect(() => {
    if (tempUrl) {
      localStorage.setItem('tempUrl', JSON.stringify(tempUrl));
    } else {
      localStorage.removeItem('tempUrl');
    }
  }, [tempUrl]);
  
  /**
   * Load user data on startup or token change
   */
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const { data } = await axios.get('/api/auth/me');
        setUser(data.data.attributes);
        setLoading(false);
        
        // If there's a tempUrl and the user is authenticated, assign it to the user
        if (tempUrl) {
          await assignUrlToUser(tempUrl.id);
        }
      } catch (err) {
        console.error('Error fetching user', err);
        setToken(null);
        localStorage.removeItem('token');
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [token]);
  
  /**
   * Assign a URL to the authenticated user
   */
  const assignUrlToUser = async (urlId: string) => {
    try {
      await axios.put(`/api/urls/${urlId}/assign-to-user`);
      clearTempUrl();
    } catch (err) {
      console.error('Error assigning URL to user', err);
    }
  };
  
  /**
   * Clear temporary URL from state and storage
   */
  const clearTempUrl = () => {
    setTempUrl(null);
    localStorage.removeItem('tempUrl');
  };
  
  /**
   * User login with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      setToken(data.data.meta.token);
      localStorage.setItem('token', data.data.meta.token);
      setUser({
        id: data.data.id,
        email: data.data.attributes.email
      });
      
      // If there's a tempUrl, assign it to the user
      if (tempUrl) {
        await assignUrlToUser(tempUrl.id);
      }
      
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors[0].detail);
      } else {
        setError('An error occurred while logging in');
      }
      throw err;
    }
  };
  
  /**
   * User registration with email and password
   */
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('/api/auth/register', {
        email,
        password
      });
      
      setToken(data.data.meta.token);
      localStorage.setItem('token', data.data.meta.token);
      setUser({
        id: data.data.id,
        email: data.data.attributes.email
      });
      
      // If there's a tempUrl, assign it to the user
      if (tempUrl) {
        await assignUrlToUser(tempUrl.id);
      }
      
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors[0].detail);
      } else {
        setError('An error occurred while registering');
      }
      throw err;
    }
  };
  
  /**
   * User logout
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        login,
        register,
        logout,
        loading,
        error,
        tempUrl,
        setTempUrl,
        clearTempUrl
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 