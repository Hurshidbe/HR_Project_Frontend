import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginDto, AuthContextType, UserRole } from '../types';
import apiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to decode JWT token
const decodeJWT = (token: string): any => {
  try {
    console.log('Attempting to decode JWT token');
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid JWT format - no payload section');
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    console.log('Base64 payload:', base64.substring(0, 20) + '...');
    
    // Use atob to decode base64
    const decodedString = atob(base64);
    console.log('Decoded string:', decodedString);
    
    // Parse the JSON payload
    const jsonPayload = JSON.parse(decodedString);
    console.log('Parsed JWT payload:', jsonPayload);
    
    return jsonPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token by checking JWT structure and expiration
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      console.log('Validating token:', token.substring(0, 20) + '...');
      
      // Decode the JWT to check if it's valid
      const decodedToken = decodeJWT(token);
      console.log('Decoded token:', decodedToken);
      
      if (!decodedToken) {
        console.log('Failed to decode JWT token');
        return false;
      }
      
      // Check if token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('Token has expired. Exp:', decodedToken.exp, 'Current:', currentTime);
        return false;
      }
      
      // Set the token in the API service for subsequent calls
      apiService.setAuthToken(token);
      
      console.log('Token validation successful');
      // Token is valid if we can decode it and it hasn't expired
      return true;
    } catch (error) {
      console.log('Token validation failed:', error);
      return false;
    }
  };

  // Check if user is superadmin
  const isSuperAdmin = (): boolean => {
    return user?.role === UserRole.SuperAdmin;
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return user?.role === UserRole.Admin || user?.role === UserRole.SuperAdmin;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Validate the stored token
          const isValid = await validateToken(storedToken);
          
          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Clear invalid token and user data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            apiService.removeAuthToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any stored data on error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        apiService.removeAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Periodic token validation
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const interval = setInterval(async () => {
      try {
        const isValid = await validateToken(token);
        if (!isValid) {
          console.log('Token expired during session, logging out');
          logout();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  const login = async (username: string, password: string) => {
    try {
      console.log('Login attempt for username:', username);
      const response = await apiService.login({ username, password });
      console.log('Login response:', response);
      
      if (response.success) {
        const { token: authToken } = response.data;
        console.log('Auth token received:', authToken ? authToken.substring(0, 20) + '...' : 'null');
        
        // Decode JWT to get user info
        const decodedToken = decodeJWT(authToken);
        console.log('Decoded token from login:', decodedToken);
        
        if (!decodedToken) {
          throw new Error('Invalid token received');
        }
        
        // Validate the new token
        const isValid = await validateToken(authToken);
        console.log('Token validation result:', isValid);
        
        if (!isValid) {
          throw new Error('Token validation failed');
        }
        
        // Store token and user info
        localStorage.setItem('token', authToken);
        apiService.setAuthToken(authToken);
        
        // Create user object from decoded token
        const userInfo: User = {
          _id: decodedToken.id || 'temp-id',
          username: decodedToken.username,
          role: decodedToken.role as UserRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        console.log('Created user info:', userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        setToken(authToken);
        setUser(userInfo);
        setIsAuthenticated(true);
        console.log('Login successful, user authenticated');
      } else {
        throw new Error(response.errors?.[0] || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiService.removeAuthToken();
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
  };

  // Don't render children until auth initialization is complete
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
