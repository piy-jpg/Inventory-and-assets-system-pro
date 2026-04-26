import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  UserGroupIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  EyeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ServerIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  BellIcon,
  ArchiveBoxIcon,
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  MinusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  KeyIcon,
  LockClosedIcon,
  UserCircleIcon,
  CogIcon,
  FolderIcon,
  TagIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const UserActivityLogs = () => {
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, cards, timeline
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(25);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);

  const queryClient = useQueryClient();

  // Real-time user activity logs
  const { data: activityLogsData, isLoading, refetch } = useQuery(
    'userActivityLogs',
    () => {
      const storedLogs = localStorage.getItem('userActivityLogs');
      if (storedLogs) {
        return JSON.parse(storedLogs);
      }
      
      return [
        {
          _id: 'LOG_001',
          userId: 'USR_001',
          userName: 'John Smith',
          userEmail: 'john.smith@company.com',
          userRole: 'admin',
          action: 'login',
          module: 'system',
          details: 'User logged in from Chrome on Windows',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-23T10:30:00Z',
          status: 'success',
          severity: 'low',
          sessionId: 'SES_001',
          duration: 0,
          location: 'New York, US',
          device: 'desktop'
        },
        {
          _id: 'LOG_002',
          userId: 'USR_002',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          userRole: 'manager',
          action: 'create',
          module: 'assets',
          details: 'Created new asset: Laptop Pro 15" - Asset ID: AST_011',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-23T09:45:00Z',
          status: 'success',
          severity: 'medium',
          sessionId: 'SES_002',
          duration: 120,
          location: 'San Francisco, US',
          device: 'desktop'
        },
        {
          _id: 'LOG_003',
          userId: 'USR_003',
          userName: 'Mike Wilson',
          userEmail: 'mike.wilson@company.com',
          userRole: 'employee',
          action: 'delete',
          module: 'inventory',
          details: 'Deleted product: Wireless Mouse - SKU: WM_002',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-23T08:30:00Z',
          status: 'success',
          severity: 'high',
          sessionId: 'SES_003',
          duration: 45,
          location: 'Chicago, US',
          device: 'desktop'
        },
        {
          _id: 'LOG_004',
          userId: 'USR_001',
          userName: 'John Smith',
          userEmail: 'john.smith@company.com',
          userRole: 'admin',
          action: 'edit',
          module: 'users',
          details: 'Updated user profile: Sarah Johnson - Role changed to Senior Manager',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-22T16:20:00Z',
          status: 'success',
          severity: 'medium',
          sessionId: 'SES_001',
          duration: 180,
          location: 'New York, US',
          device: 'desktop'
        },
        {
          _id: 'LOG_005',
          userId: 'USR_004',
          userName: 'Emily Davis',
          userEmail: 'emily.davis@company.com',
          userRole: 'employee',
          action: 'failed_login',
          module: 'system',
          details: 'Failed login attempt - invalid password (3rd attempt)',
          ipAddress: '192.168.1.103',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
          timestamp: '2024-04-22T14:15:00Z',
          status: 'failed',
          severity: 'high',
          sessionId: null,
          duration: 0,
          location: 'Los Angeles, US',
          device: 'mobile'
        },
        {
          _id: 'LOG_006',
          userId: 'USR_002',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          userRole: 'manager',
          action: 'export',
          module: 'reports',
          details: 'Exported asset depreciation report - 1,245 records',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-22T11:30:00Z',
          status: 'success',
          severity: 'low',
          sessionId: 'SES_002',
          duration: 300,
          location: 'San Francisco, US',
          device: 'desktop'
        },
        {
          _id: 'LOG_007',
          userId: 'USR_003',
          userName: 'Mike Wilson',
          userEmail: 'mike.wilson@company.com',
          userRole: 'employee',
          action: 'logout',
          module: 'system',
          details: 'User logged out - Session duration: 4h 32m',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-22T17:45:00Z',
          status: 'success',
          severity: 'low',
          sessionId: 'SES_003',
          duration: 16320,
          location: 'Chicago, US',
          device: 'desktop'
        },
        {
          _id: 'LOG_008',
          userId: 'USR_001',
          userName: 'John Smith',
          userEmail: 'john.smith@company.com',
          userRole: 'admin',
          action: 'create',
          module: 'users',
          details: 'Created new user: David Brown - Role: Inventory Manager',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-21T13:20:00Z',
          status: 'success',
          severity: 'medium',
          sessionId: 'SES_001',
          duration: 240,
          location: 'New York, US',
          device: 'desktop'
        },
        {
          _id: 'LOG_009',
          userId: 'USR_005',
          userName: 'David Brown',
          userEmail: 'david.brown@company.com',
          userRole: 'employee',
          action: 'view',
          module: 'inventory',
          details: 'Viewed inventory report - 3,456 items',
          ipAddress: '192.168.1.104',
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
          timestamp: '2024-04-21T11:15:00Z',
          status: 'success',
          severity: 'low',
          sessionId: 'SES_004',
          duration: 90,
          location: 'Boston, US',
          device: 'tablet'
        },
        {
          _id: 'LOG_010',
          userId: 'USR_002',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          userRole: 'manager',
          action: 'update',
          module: 'assets',
          details: 'Updated asset maintenance schedule - 15 assets affected',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          timestamp: '2024-04-21T09:30:00Z',
          status: 'success',
          severity: 'medium',
          sessionId: 'SES_002',
          duration: 150,
          location: 'San Francisco, US',
          device: 'desktop'
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('User activity logs data refreshed:', data);
      }
    }
  );

  const logs = Array.isArray(activityLogsData) ? activityLogsData : [];

  // Enhanced filtering with multiple criteria
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName?.toLowerCase().includes(searchLower) ||
        log.userEmail?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.ipAddress?.includes(searchLower) ||
        log.module?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower)
      );
    }
    
    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }
    
    // Module filter
    if (filterModule !== 'all') {
      filtered = filtered.filter(log => log.module === filterModule);
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }
    
    // User filter
    if (filterUser !== 'all') {
      filtered = filtered.filter(log => log.userId === filterUser);
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case '24h':
          filterDate.setHours(filterDate.getHours() - 24);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(filterDate.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'userName':
          aValue = a.userName?.toLowerCase() || '';
          bValue = b.userName?.toLowerCase() || '';
          break;
        case 'action':
          aValue = a.action?.toLowerCase() || '';
          bValue = b.action?.toLowerCase() || '';
          break;
        case 'module':
          aValue = a.module?.toLowerCase() || '';
          bValue = b.module?.toLowerCase() || '';
          break;
        case 'severity':
          const severityOrder = { high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
          break;
        default:
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [logs, searchTerm, filterAction, filterModule, filterStatus, filterUser, dateRange, sortBy, sortOrder]);

  const handleRefresh = () => {
    refetch();
    toast.success('Activity logs refreshed');
  };

  // Enhanced icon functions with more visual variety
  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return <KeyIcon className="h-4 w-4 text-green-600" />;
      case 'logout':
        return <LockClosedIcon className="h-4 w-4 text-gray-600" />;
      case 'create':
        return <PlusIcon className="h-4 w-4 text-blue-600" />;
      case 'edit':
      case 'update':
        return <PencilSquareIcon className="h-4 w-4 text-yellow-600" />;
      case 'delete':
        return <TrashIcon className="h-4 w-4 text-red-600" />;
      case 'export':
        return <ArrowDownTrayIcon className="h-4 w-4 text-purple-600" />;
      case 'import':
        return <ArrowUpTrayIcon className="h-4 w-4 text-indigo-600" />;
      case 'view':
        return <EyeIcon className="h-4 w-4 text-gray-600" />;
      case 'failed_login':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'archive':
        return <ArchiveBoxIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create':
        return 'bg-blue-100 text-blue-800';
      case 'edit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'export':
        return 'bg-purple-100 text-purple-800';
      case 'failed_login':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced module icons with better visual distinction
  const getModuleIcon = (module) => {
    switch (module) {
      case 'users':
        return <UsersIcon className="h-4 w-4" />;
      case 'assets':
        return <CubeIcon className="h-4 w-4" />;
      case 'inventory':
        return <ShoppingCartIcon className="h-4 w-4" />;
      case 'reports':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'system':
        return <ServerIcon className="h-4 w-4" />;
      case 'purchases':
        return <TruckIcon className="h-4 w-4" />;
      case 'sales':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'suppliers':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'settings':
        return <CogIcon className="h-4 w-4" />;
      case 'categories':
        return <TagIcon className="h-4 w-4" />;
      default:
        return <FolderIcon className="h-4 w-4" />;
    }
  };

  // Device type icons
  const getDeviceIcon = (device) => {
    switch (device) {
      case 'desktop':
        return <ComputerDesktopIcon className="h-4 w-4" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      case 'tablet':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      default:
        return <GlobeAltIcon className="h-4 w-4" />;
    }
  };

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        totalLogs: 0,
        successfulLogs: 0,
        failedLogs: 0,
        uniqueUsers: 0,
        topActions: [],
        topModules: [],
        hourlyActivity: [],
        severityDistribution: { high: 0, medium: 0, low: 0 },
        deviceDistribution: { desktop: 0, mobile: 0, tablet: 0 },
        locationActivity: [],
        sessionStats: { avgDuration: 0, totalSessions: 0 }
      };
    }

    const successfulLogs = logs.filter(log => log.status === 'success').length;
    const failedLogs = logs.filter(log => log.status === 'failed').length;
    const uniqueUsers = [...new Set(logs.map(log => log.userId))].length;
    
    // Top actions
    const actionCounts = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    const topActions = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));
    
    // Top modules
    const moduleCounts = {};
    logs.forEach(log => {
      moduleCounts[log.module] = (moduleCounts[log.module] || 0) + 1;
    });
    const topModules = Object.entries(moduleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([module, count]) => ({ module, count }));
    
    // Severity distribution
    const severityDistribution = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
    
    // Device distribution
    const deviceDistribution = logs.reduce((acc, log) => {
      acc[log.device] = (acc[log.device] || 0) + 1;
      return acc;
    }, { desktop: 0, mobile: 0, tablet: 0 });
    
    // Session statistics
    const sessionsWithDuration = logs.filter(log => log.duration > 0);
    const avgDuration = sessionsWithDuration.length > 0 
      ? sessionsWithDuration.reduce((sum, log) => sum + log.duration, 0) / sessionsWithDuration.length 
      : 0;
    const totalSessions = [...new Set(logs.filter(log => log.sessionId).map(log => log.sessionId))].length;

    return {
      totalLogs: logs.length,
      successfulLogs,
      failedLogs,
      uniqueUsers,
      topActions,
      topModules,
      severityDistribution,
      deviceDistribution,
      sessionStats: { avgDuration, totalSessions }
    };
  }, [logs]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  // Get unique users for filter
  const uniqueUsers = [...new Set(logs.map(log => log.userId))].map(userId => {
    const user = logs.find(log => log.userId === userId);
    return { userId, userName: user.userName, userEmail: user.userEmail };
  });

  // Calculate statistics
  const totalLogs = logs.length;
  const successfulLogs = logs.filter(log => log.status === 'success').length;
  const failedLogs = logs.filter(log => log.status === 'failed').length;
  const loginAttempts = logs.filter(log => log.action === 'login' || log.action === 'failed_login').length;
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">User Activity Logs</h1>
            <p className="page-subtitle">Login/logout history and actions performed with timestamp + IP tracking</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{totalLogs}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{successfulLogs}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedLogs}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Activities</p>
              <p className="text-2xl font-bold text-blue-600">{todayLogs}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="edit">Edit</option>
              <option value="delete">Delete</option>
              <option value="export">Export</option>
              <option value="failed_login">Failed Login</option>
            </select>
            
            <select
              className="input"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user.userId} value={user.userId}>
                  {user.userName}
                </option>
              ))}
            </select>

            <select
              className="input"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Activity Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">{log.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ').charAt(0).toUpperCase() + log.action.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getModuleIcon(log.module)}
                        <span className="text-sm text-gray-900 capitalize">{log.module}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{log.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {log.status === 'success' ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          log.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
      >
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Failed Logins</h3>
          <div className="space-y-3">
            {logs
              .filter(log => log.action === 'failed_login')
              .slice(0, 3)
              .map(log => (
                <div key={log._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                    <p className="text-xs text-gray-500">{log.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{log.ipAddress}</p>
                  </div>
                </div>
              ))}
            {logs.filter(log => log.action === 'failed_login').length === 0 && (
              <p className="text-sm text-gray-500">No failed login attempts</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {Object.entries(
              logs.reduce((acc, log) => {
                acc[log.userId] = (acc[log.userId] || 0) + 1;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([userId, count]) => {
                const user = logs.find(log => log.userId === userId);
                return (
                  <div key={userId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                      <p className="text-xs text-gray-500">{user.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{count} actions</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserActivityLogs;
