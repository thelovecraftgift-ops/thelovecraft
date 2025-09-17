
import React, { createContext, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<{ success: boolean; user?: any; error?: string }>;
  loginWithData: (userObj: any, token?: string) => void; // For direct login (signup)
  logout: () => void;
  updateUser: (userObj: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  loginWithData: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Try to load from localStorage - check both storage keys
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('user_token') || localStorage.getItem('token');
        const adminUser = localStorage.getItem('admin_user');
        const adminToken = localStorage.getItem('admin_token');
        
        let userData = null;
        let userToken = null;
        
        if (storedUser) {
          userData = JSON.parse(storedUser);
          userToken = storedToken;
        } else if (adminUser) {
          userData = JSON.parse(adminUser);
          userToken = adminToken || storedToken;
        }
        
        if (userData) {
          // Ensure user has token property
          if (userToken && !userData.token) {
            userData.token = userToken;
          }
          
          setUser(userData);
          console.log('✅ Restored user session:', {
            email: userData.email,
            role: userData.role,
            hasToken: !!userData.token
          });
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
      }
    };

    initializeAuth();

    // Listen for storage events (multi-tab sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'admin_user' || e.key === 'user_token') {
        const stored = localStorage.getItem("user") || localStorage.getItem("admin_user");
        if (stored) {
          const userData = JSON.parse(stored);
          const token = localStorage.getItem('user_token') || localStorage.getItem('token');
          if (token && !userData.token) {
            userData.token = token;
          }
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Regular email/password login
  const login = async (credentials: any) => {
    try {
      console.log('🔍 Attempting login with credentials:', { email: credentials.email });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      // ✅ FIXED: Your backend returns { reply: {...}, accessToken: "...", message: "..." }
      const userWithToken = {
        ...data.reply, // ✅ Use data.reply instead of data.user
        token: data.accessToken
      };

      setUser(userWithToken);
      
      // ✅ FIXED: Store with consistent key names
      if (userWithToken.role === 'admin') {
        localStorage.setItem('admin_user', JSON.stringify(userWithToken));
        localStorage.setItem('admin_token', data.accessToken);
      } else {
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('user_token', data.accessToken); // ✅ Use user_token for consistency
      }
      
      console.log('✅ User logged in successfully:', {
        email: userWithToken.email,
        role: userWithToken.role,
        hasToken: !!userWithToken.token
      });
      
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // For direct user data login (used by signup flow)
  const loginWithData = (userObj: any, token?: string) => {
    console.log('🔍 Logging in with user data:', {
      email: userObj.email,
      role: userObj.role,
      hasToken: !!(token || userObj.token)
    });
    
    const userWithToken = {
      ...userObj,
      token: token || userObj.token
    };

    setUser(userWithToken);
    
    // ✅ FIXED: Store with consistent key names based on role
    if (userWithToken.role === 'admin') {
      localStorage.setItem('admin_user', JSON.stringify(userWithToken));
      if (token) {
        localStorage.setItem('admin_token', token);
      }
    } else {
      localStorage.setItem('user', JSON.stringify(userWithToken));
      if (token) {
        localStorage.setItem('user_token', token); // ✅ Consistent with signup
      }
    }
    
    console.log('✅ User data login successful');
  };

  const updateUser = (userObj: any) => {
    console.log('🔍 Updating user:', userObj.email);
    
    // Preserve existing token if not provided
    const updatedUser = {
      ...userObj,
      token: userObj.token || user?.token
    };
    
    setUser(updatedUser);
    
    // Store in appropriate location based on role
    if (updatedUser.role === 'admin') {
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    } else {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    console.log('✅ User updated successfully');
  };

  const logout = async () => {
    try {
      console.log('🔍 Logging out user');
      
      // Call backend logout endpoint
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }
    
    // Clear local state and storage
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("user_token");
    localStorage.removeItem("token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_token");
    
    console.log('✅ User logged out successfully');
  };

  // isAuthenticated is true if user exists and has a token
  const isAuthenticated = Boolean(user && user.token);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      loginWithData, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
