import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useMockAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data
  const mockUser = {
    user_id: 'USR_jaanu_1',
    username: 'jaanu@1',
    email: 'jaanu@example.com',
    firstName: 'Jaanu',
    lastName: 'User',
    role: 'admin',
    department: 'IT',
    phone: '+1234567890',
    profilePhoto: null,
    permissions: [
      'inventory_read', 'inventory_write',
      'assets_read', 'assets_write',
      'transactions_read', 'transactions_write',
      'users_read', 'users_write',
      'reports_read', 'reports_write',
      'settings_read', 'settings_write'
    ]
  };

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('mockUser');
    const storedToken = localStorage.getItem('mockToken');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Support multiple users
      let userData = null;
      
      if (username === 'jaanu@1' && password === '123456') {
        userData = { ...mockUser, token: 'mock-jwt-token-' + Date.now() };
      } else if (username === 'admin' && password === 'password123') {
        userData = { 
          ...mockUser, 
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          token: 'mock-jwt-token-admin-' + Date.now()
        };
      } else if (username === 'admin@example.com' && password === 'password123') {
        userData = { 
          ...mockUser, 
          username: 'admin@example.com',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          token: 'mock-jwt-token-admin-email-' + Date.now()
        };
      }
      
      if (userData) {
        // Store in localStorage
        localStorage.setItem('mockUser', JSON.stringify(userData));
        localStorage.setItem('mockToken', userData.token);
        
        setUser(userData);
        toast.success('Login successful!');
        return { success: true, data: { user: userData, token: userData.token } };
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const register = async (userData) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // For demo purposes, we'll auto-login the user
      const token = 'mock-jwt-token-' + Date.now();
      const newUserData = { ...mockUser, ...userData, token };
      
      localStorage.setItem('mockUser', JSON.stringify(newUserData));
      localStorage.setItem('mockToken', token);
      
      setUser(newUserData);
      toast.success('Registration successful!');
      return { success: true, data: { user: newUserData, token } };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Password change failed');
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    login,
    logout,
    register,
    changePassword,
    isLoading,
    isAuthenticated: !!user,
  };
};

export default useMockAuth;
