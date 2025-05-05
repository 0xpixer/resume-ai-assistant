'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ success: true }),
  signUp: async () => ({ success: true }),
  signOut: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to parse cookies
  const getCookieValue = (name: string): string | null => {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
  };

  // Improved function to check user from cookies
  const checkUserFromCookies = () => {
    try {
      const authCookieValue = getCookieValue('auth');
      
      if (authCookieValue) {
        const userData = JSON.parse(decodeURIComponent(authCookieValue));
        if (userData && userData.isAuthenticated) {
          setUser({
            email: userData.email,
            name: userData.name
          });
          return true;
        }
      }
      setUser(null);
      return false;
    } catch (e) {
      console.error('Error parsing auth cookie:', e);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check user status on initial load and when cookie changes
  useEffect(() => {
    // Initial check
    checkUserFromCookies();
    
    // Set up an interval to check the cookie every second (if needed for testing)
    // This is optional and can be removed in production
    const interval = setInterval(() => {
      checkUserFromCookies();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // This supports our login functionality
  const signIn = async (email: string, password: string) => {
    try {
      // Use our login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Set user state immediately
      if (data.user) {
        setUser({
          email: data.user.email,
          name: data.user.name
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Immediately check user state
      setTimeout(checkUserFromCookies, 100);
      
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear cookies
      document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'subscription=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Clear user state
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // In a real app, this would call a password reset API
      console.log('Password reset requested for:', email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
} 