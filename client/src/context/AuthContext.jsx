import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerStudent, loginStudent, fetchProfile } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecopulse_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and restore session from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ecopulse_token');
      if (storedToken) {
        try {
          const data = await fetchProfile();
          if (data && data.user) {
            setUser(data.user);
            setToken(storedToken);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('ecopulse_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register student
  const register = async (formData) => {
    setAuthError(null);
    try {
      const data = await registerStudent(formData);
      if (data && data.token && data.user) {
        localStorage.setItem('ecopulse_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Login student
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await loginStudent(credentials);
      if (data && data.token && data.user) {
        localStorage.setItem('ecopulse_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Login failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('ecopulse_token');
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
