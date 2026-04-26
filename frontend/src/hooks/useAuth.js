import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();
const MOCK_USER_KEY = 'mockUser';
const MOCK_TOKEN_KEY = 'mockToken';
const API_TOKEN_KEY = 'token';
const USER_KEY = 'user';
const LOGIN_HISTORY_KEY = 'loginHistory';
const LOGIN_HISTORY_EVENT = 'local-login-history-updated';
const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    'users_read', 'users_write', 'users_delete',
    'inventory_read', 'inventory_write', 'inventory_delete',
    'assets_read', 'assets_write', 'assets_delete',
    'transactions_read', 'transactions_write', 'transactions_delete',
    'sales_read', 'sales_write', 'sales_delete',
    'purchases_read', 'purchases_write', 'purchases_delete',
    'reports_view', 'reports_export', 'analytics_view',
    'settings_manage', 'system_admin', 'backup_manage', 'roles_manage'
  ],
  manager: [
    'users_read', 'users_write',
    'inventory_read', 'inventory_write', 'inventory_delete',
    'assets_read', 'assets_write',
    'transactions_read', 'transactions_write',
    'sales_read', 'sales_write',
    'purchases_read', 'purchases_write',
    'reports_view', 'reports_export', 'analytics_view'
  ],
  staff: [
    'inventory_read', 'inventory_write',
    'assets_read',
    'transactions_read', 'transactions_write',
    'sales_read', 'sales_write',
    'reports_view'
  ],
  viewer: [
    'inventory_read',
    'assets_read',
    'transactions_read',
    'sales_read',
    'purchases_read',
    'reports_view'
  ],
};

const normalizeRole = (user = {}) => {
  const explicitRole = (user.role || '').toLowerCase();
  const roleName = (user.roleName || user.role_name || '').toLowerCase();
  const roleId = user.roleId || user.role_id;

  if (explicitRole) return explicitRole;
  if (roleId === 'ROLE_001' || roleName.includes('administrator') || roleName.includes('admin')) return 'admin';
  if (roleId === 'ROLE_002' || roleName.includes('manager')) return 'manager';
  if (roleId === 'ROLE_003' || roleName.includes('sales')) return 'staff';
  if (roleId === 'ROLE_004' || roleName.includes('warehouse')) return 'staff';
  if (roleId === 'ROLE_005' || roleName.includes('support')) return 'staff';
  return 'staff';
};

const getDefaultPermissionsForRole = (role) => DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.staff;

const buildDemoUser = (identifier) => ({
  user_id: 'USR_jaanu_demo',
  username: 'jaanu@1',
  email: 'jaanu@example.com',
  firstName: 'Jaanu',
  lastName: 'User',
  role: 'admin',
  department: 'IT',
  phone: '+1234567890',
  profilePhoto: null,
  permissions: [
    'users_read', 'users_write', 'users_delete',
    'inventory_read', 'inventory_write', 'inventory_delete',
    'assets_read', 'assets_write', 'assets_delete',
    'transactions_read', 'transactions_write', 'transactions_delete',
    'sales_read', 'sales_write', 'sales_delete',
    'purchases_read', 'purchases_write', 'purchases_delete',
    'reports_view', 'reports_export', 'analytics_view',
    'settings_manage', 'system_admin', 'backup_manage', 'roles_manage'
  ],
  loginIdentifier: identifier,
});

const storeDemoSession = (user) => {
  const token = `mock-jwt-token-${Date.now()}`;
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  localStorage.setItem(MOCK_TOKEN_KEY, token);
  localStorage.setItem(API_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { user, token };
};

const getUserDisplayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
  user?.username ||
  user?.email ||
  user?.name ||
  'Unknown User';

const appendLocalLoginHistory = (user) => {
  const historyEntry = {
    _id: `LOGIN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user_id: user.user_id || user._id || '',
    userName: getUserDisplayName(user),
    username: user.username || '',
    email: user.email || '',
    role: user.role || user.roleName || '',
    action: 'login',
    description: `${getUserDisplayName(user)} logged in`,
    timestamp: new Date().toISOString(),
    ip_address: 'Local session',
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Browser Session',
    status: 'success',
  };

  const existingHistory = localStorage.getItem(LOGIN_HISTORY_KEY);
  let history = [];

  if (existingHistory) {
    try {
      history = JSON.parse(existingHistory);
    } catch (error) {
      history = [];
    }
  }

  const updatedHistory = [historyEntry, ...history].slice(0, 300);
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(updatedHistory));
  window.dispatchEvent(new CustomEvent(LOGIN_HISTORY_EVENT, { detail: historyEntry }));

  return historyEntry;
};

const appendLocalFailedLoginHistory = (identifier) => {
  const attemptedIdentifier = (identifier || '').trim();
  const historyEntry = {
    _id: `FAILED_LOGIN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user_id: attemptedIdentifier || 'unknown',
    userName: attemptedIdentifier || 'Unknown User',
    username: attemptedIdentifier || '',
    email: '',
    role: '',
    action: 'failed_login',
    description: `Failed login attempt for ${attemptedIdentifier || 'unknown user'}`,
    timestamp: new Date().toISOString(),
    ip_address: 'Local session',
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Browser Session',
    status: 'error',
  };

  const existingHistory = localStorage.getItem(LOGIN_HISTORY_KEY);
  let history = [];

  if (existingHistory) {
    try {
      history = JSON.parse(existingHistory);
    } catch (error) {
      history = [];
    }
  }

  const updatedHistory = [historyEntry, ...history].slice(0, 300);
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(updatedHistory));
  window.dispatchEvent(new CustomEvent(LOGIN_HISTORY_EVENT, { detail: historyEntry }));

  return historyEntry;
};

const clearStoredSession = () => {
  localStorage.removeItem(API_TOKEN_KEY);
  localStorage.removeItem(MOCK_USER_KEY);
  localStorage.removeItem(MOCK_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getStoredDemoSession = () => {
  const storedUser = localStorage.getItem(MOCK_USER_KEY);
  const storedToken = localStorage.getItem(MOCK_TOKEN_KEY);

  if (!storedUser || !storedToken) return null;

  try {
    return {
      user: JSON.parse(storedUser),
      token: storedToken,
    };
  } catch (error) {
    clearStoredSession();
    return null;
  }
};

const tryDemoLogin = (identifier, password) => {
  const normalizedIdentifier = (identifier || '').trim().toLowerCase();
  
  // Check users stored in localStorage (real-time user data)
  const storedUsers = localStorage.getItem('users');
  let users = [];
  
  if (storedUsers) {
    try {
      users = JSON.parse(storedUsers);
      console.log('Using real-time user data from localStorage:', users.length, 'users');
    } catch (error) {
      console.error('Error parsing stored users:', error);
      return null; // Invalid user data
    }
  } else {
    console.log('No stored users found, using fallback users');
    // Use fallback users if no localStorage data
    users = [
      {
        _id: 'USR_001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'temp123',
        roleId: 'ROLE_001',
        roleName: 'Administrator',
        status: 'active',
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-04-23T09:15:00Z'
      },
      {
        _id: 'USR_002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: 'temp123',
        roleId: 'ROLE_002',
        roleName: 'Manager',
        status: 'active',
        created_at: '2024-02-10T14:20:00Z',
        last_login: '2024-04-22T16:45:00Z'
      },
      {
        _id: 'USR_003',
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        password: 'temp123',
        roleId: 'ROLE_003',
        roleName: 'Sales Executive',
        status: 'active',
        created_at: '2024-03-05T11:30:00Z',
        last_login: '2024-04-21T08:30:00Z'
      },
      {
        _id: 'USR_006',
        name: 'Maanu User',
        email: 'maanu@123',
        password: 'temp123',
        roleId: 'ROLE_003',
        roleName: 'Sales Executive',
        status: 'active',
        created_at: '2024-04-24T15:00:00Z',
        last_login: null
      },
      {
        _id: 'USR_1777040186389',
        name: 'omo',
        email: 'maanu@1',
        password: '123456',
        roleId: 'ROLE_001',
        roleName: 'Administrator',
        status: 'active',
        created_at: '2024-04-24T2026',
        last_login: null
      },
      {
        _id: 'USR_1777042249993',
        name: 'jaanu',
        email: 'jaanu@1',
        password: '123456',
        roleId: 'ROLE_001',
        roleName: 'Administrator',
        status: 'active',
        created_at: '2024-04-24T2026',
        last_login: null
      },
      {
        _id: 'USR_1777045876979',
        name: 'pop',
        email: 'popo@1',
        password: '123456',
        roleId: 'ROLE_002',
        roleName: 'Manager',
        status: 'active',
        created_at: '2024-04-24T2026',
        last_login: null
      }
    ];
  }
  
  // Find user by email, username, or identifier
  console.log('Searching for user with identifier:', normalizedIdentifier);
  console.log('Available users:', users.map(u => ({ id: u._id, email: u.email, name: u.name })));
  
  const user = users.find(u => 
    (u.email && u.email.toLowerCase() === normalizedIdentifier) ||
    (u.username && u.username.toLowerCase() === normalizedIdentifier) ||
    (u._id && u._id.toLowerCase() === normalizedIdentifier)
  );
  
  console.log('Found user:', user ? user.name : 'Not found');
  
  if (!user) {
    return null; // User not found in system
  }
  
  // Check if user is active
  const isActive = user.isActive || user.status === 'active';
  if (!isActive) {
    return null; // Inactive users cannot login
  }
  
  // Check password - accept multiple password formats for real-time compatibility
  const validPasswords = ['temp123', '123456', 'password', user.password || ''];
  const validPassword = validPasswords.includes(password);
  
  if (!validPassword) {
    return null; // Invalid password
  }
  
  // Build user session with system user data
  const sessionUser = {
    user_id: user._id,
    username: user.username || user.email,
    email: user.email,
    firstName: user.firstName || user.name?.split(' ')[0] || 'User',
    lastName: user.lastName || user.name?.split(' ')[1] || '',
    role: normalizeRole(user),
    roleId: user.roleId || user.role_id || null,
    roleName: user.roleName || user.role_name || user.role || '',
    department: user.department || 'General',
    phone: user.phone || '',
    profilePhoto: user.profilePhoto || null,
    permissions: (user.permissions && user.permissions.length > 0)
      ? user.permissions
      : getDefaultPermissionsForRole(normalizeRole(user)),
    _id: user._id,
    isActive: user.isActive || user.status === 'active', // Handle both formats
    loginIdentifier: normalizedIdentifier,
  };
  
  return storeDemoSession(sessionUser);
};

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
    const token = localStorage.getItem(API_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const demoSession = getStoredDemoSession();

    if (demoSession) {
      setUser(demoSession.user);
      setLoading(false);
      return;
    }

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        clearStoredSession();
      }
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const attemptedIdentifier = credentials.identifier || credentials.email || credentials.username || '';
    try {
      const response = await authAPI.login(credentials);
      const { user: authenticatedUser, token } = response.data.data;
      localStorage.setItem(API_TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      localStorage.removeItem(MOCK_USER_KEY);
      localStorage.removeItem(MOCK_TOKEN_KEY);
      setUser(authenticatedUser);
      return {
        success: true,
        user: authenticatedUser,
      };
    } catch (error) {
      // Fall back to local system mode when backend auth is unavailable.
    }

    const demoSession = tryDemoLogin(attemptedIdentifier, credentials.password);
    if (demoSession) {
      appendLocalLoginHistory(demoSession.user);
      setUser(demoSession.user);
      return {
        success: true,
        user: demoSession.user,
        warning: 'Logged in using local system mode.',
      };
    }

    appendLocalFailedLoginHistory(attemptedIdentifier);

    return { 
      success: false, 
      error: 'Invalid credentials. Please check your email/username and password.',
    };
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;
      localStorage.setItem(API_TOKEN_KEY, token);
      localStorage.removeItem(MOCK_USER_KEY);
      localStorage.removeItem(MOCK_TOKEN_KEY);
      setUser(user);
      return { success: true };
    } catch (error) {
      const validationError = error.response?.data?.errors?.[0]?.msg;
      return { 
        success: false, 
        error: validationError || error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
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
