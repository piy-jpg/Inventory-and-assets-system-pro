import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(response => {
          setUser(response.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    console.log('useAuth login called with:', credentials);
    try {
      const response = await authAPI.login(credentials);
      console.log('Login API response:', response);
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      console.log('Login successful, user set:', user);
      return { success: true };
    } catch (error) {
      console.error('Login API error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    console.log('useAuth register called with:', userData);
    try {
      const response = await authAPI.register(userData);
      console.log('Register API response:', response);
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      console.log('Registration successful, user set:', user);
      return { success: true };
    } catch (error) {
      console.error('Register API error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
