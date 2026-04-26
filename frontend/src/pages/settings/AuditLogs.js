import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const queryClient = useQueryClient();

  // Mock audit logs data
  const { data: auditData, isLoading, refetch } = useQuery(
    'auditLogs',
    () => {
      const storedLogs = localStorage.getItem('auditLogs');
      if (storedLogs) {
        return JSON.parse(storedLogs);
      }
      
      return {
        logs: [
          {
            _id: 'AUDIT_001',
            action: 'user_login',
            category: 'security',
            description: 'User john.doe logged in from 192.168.1.100',
            userId: 'user_001',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            userRole: 'admin',
            timestamp: '2024-04-23T10:30:00Z',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456789',
            requestId: 'req_987654321',
            status: 'success',
            severity: 'low',
            details: {
              loginMethod: 'password',
              mfaUsed: false,
              deviceFingerprint: 'fp_123456789',
              location: 'New York, USA',
              previousLogin: '2024-04-22T18:45:00Z'
            },
            changes: null,
            oldValue: null,
            newValue: null
          },
          {
            _id: 'AUDIT_002',
            action: 'settings_updated',
            category: 'system',
            description: 'System settings updated by admin',
            userId: 'user_001',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            userRole: 'admin',
            timestamp: '2024-04-23T09:15:00Z',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456789',
            requestId: 'req_987654322',
            status: 'success',
            severity: 'medium',
            details: {
              section: 'general',
              fieldsUpdated: ['companyName', 'currency', 'timezone'],
              oldValue: {
                companyName: 'Old Company Name',
                currency: 'EUR',
                timezone: 'Europe/London'
              },
              newValue: {
                companyName: 'Smart Inventory System',
                currency: 'USD',
                timezone: 'America/New_York'
              }
            },
            changes: ['companyName', 'currency', 'timezone'],
            oldValue: {
              companyName: 'Old Company Name',
              currency: 'EUR',
              timezone: 'Europe/London'
            },
            newValue: {
              companyName: 'Smart Inventory System',
              currency: 'USD',
              timezone: 'America/New_York'
            }
          },
          {
            _id: 'AUDIT_003',
            action: 'product_created',
            category: 'inventory',
            description: 'New product "Laptop Pro" created by admin',
            userId: 'user_001',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            userRole: 'admin',
            timestamp: '2024-04-23T08:45:00Z',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456789',
            requestId: 'req_987654323',
            status: 'success',
            severity: 'low',
            details: {
              productId: 'prod_001',
              productName: 'Laptop Pro',
              category: 'Electronics',
              price: 1299.99,
              stock: 50
            },
            changes: null,
            oldValue: null,
            newValue: {
              productId: 'prod_001',
              productName: 'Laptop Pro',
              category: 'Electronics',
              price: 1299.99,
              stock: 50
            }
          },
          {
            _id: 'AUDIT_004',
            action: 'user_deleted',
            category: 'security',
            description: 'User "jane.smith" deleted by admin',
            userId: 'user_001',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            userRole: 'admin',
            timestamp: '2024-04-22T16:30:00Z',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456789',
            requestId: 'req_987654324',
            status: 'success',
            severity: 'high',
            details: {
              deletedUserId: 'user_002',
              deletedUserName: 'Jane Smith',
              deletedUserEmail: 'jane.smith@example.com',
              deletedUserRole: 'user',
              reason: 'Account cleanup'
            },
            changes: null,
            oldValue: {
              userId: 'user_002',
              userName: 'Jane Smith',
              userEmail: 'jane.smith@example.com',
              userRole: 'user'
            },
            newValue: null
          },
          {
            _id: 'AUDIT_005',
            action: 'backup_completed',
            category: 'system',
            description: 'Daily backup completed successfully',
            userId: 'system',
            userName: 'System',
            userEmail: 'system@smartinventory.com',
            userRole: 'system',
            timestamp: '2024-04-23T02:00:00Z',
            ip: '127.0.0.1',
            userAgent: 'System/1.0',
            sessionId: 'system_session',
            requestId: 'req_987654325',
            status: 'success',
            severity: 'low',
            details: {
              backupType: 'daily',
              backupSize: '2.4 GB',
              backupDuration: '5m 23s',
              backupLocation: 'cloud',
              backupProvider: 'AWS S3',
              filesBackedUp: 15680,
              checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
            },
            changes: null,
            oldValue: null,
            newValue: {
              backupId: 'backup_001',
              backupSize: '2.4 GB',
              backupDuration: '5m 23s'
            }
          },
          {
            _id: 'AUDIT_006',
            action: 'permission_denied',
            category: 'security',
            description: 'Access denied to user management for non-admin user',
            userId: 'user_003',
            userName: 'Bob Johnson',
            userEmail: 'bob.johnson@example.com',
            userRole: 'user',
            timestamp: '2024-04-22T14:20:00Z',
            ip: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            sessionId: 'sess_123456790',
            requestId: 'req_987654326',
            status: 'failed',
            severity: 'medium',
            details: {
              attemptedAction: 'access_user_management',
              requiredRole: 'admin',
              userRole: 'user',
              endpoint: '/api/users',
              method: 'GET'
            },
            changes: null,
            oldValue: null,
            newValue: null
          },
          {
            _id: 'AUDIT_007',
            action: 'data_export',
            category: 'data',
            description: 'Customer data exported by admin',
            userId: 'user_001',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            userRole: 'admin',
            timestamp: '2024-04-22T11:30:00Z',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456789',
            requestId: 'req_987654327',
            status: 'success',
            severity: 'medium',
            details: {
              exportType: 'customers',
              exportFormat: 'csv',
              recordCount: 345,
              fileSize: '2.3 MB',
              exportDuration: '15s',
              downloadUrl: '/exports/customers_20240422.csv'
            },
            changes: null,
            oldValue: null,
            newValue: {
              exportId: 'export_001',
              recordCount: 345,
              fileSize: '2.3 MB'
            }
          },
          {
            _id: 'AUDIT_008',
            action: 'api_key_generated',
            category: 'security',
            description: 'New API key generated for admin',
            userId: 'user_001',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            userRole: 'admin',
            timestamp: '2024-04-21T15:45:00Z',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456789',
            requestId: 'req_987654328',
            status: 'success',
            severity: 'high',
            details: {
              apiKeyId: 'key_001',
              keyType: 'read_write',
              expiresAt: '2025-04-21T15:45:00Z',
              permissions: ['read', 'write', 'delete'],
              rateLimit: 1000
            },
            changes: null,
            oldValue: null,
            newValue: {
              apiKeyId: 'key_001',
              keyType: 'read_write',
              expiresAt: '2025-04-21T15:45:00Z'
            }
          }
        ],
        statistics: {
          totalLogs: 8,
          successLogs: 7,
          failedLogs: 1,
          highSeverityLogs: 2,
          mediumSeverityLogs: 3,
          lowSeverityLogs: 3,
          todayLogs: 3,
          uniqueUsers: 3,
          uniqueActions: 8,
          categories: {
            security: 3,
            system: 2,
            inventory: 1,
            data: 1,
            user: 1
          }
        }
      };
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Audit logs data refreshed:', data);
      }
    }
  );

  const audit = auditData || {};
  const logs = audit.logs || [];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesUser = filterUser === 'all' || log.userId === filterUser;
    const matchesDate = filterDate === 'all' || (() => {
      const logDate = new Date(log.timestamp).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const weekAgo = new Date(Date.now() - 604800000).toDateString();
      
      switch (filterDate) {
        case 'today':
          return logDate === today;
        case 'yesterday':
          return logDate === yesterday;
        case 'week':
          return new Date(log.timestamp) >= new Date(weekAgo);
        default:
          return true;
      }
    })();
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    
    return matchesSearch && matchesAction && matchesUser && matchesDate && matchesCategory;
  });

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'timestamp':
        comparison = new Date(a.timestamp) - new Date(b.timestamp);
        break;
      case 'userName':
        comparison = a.userName.localeCompare(b.userName);
        break;
      case 'action':
        comparison = a.action.localeCompare(b.action);
        break;
      case 'severity':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const openDetailsModal = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Audit logs data refreshed');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'security':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'inventory':
        return 'bg-blue-100 text-blue-800';
      case 'data':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_login':
        return <UserIcon className="h-4 w-4" />;
      case 'user_logout':
        return <UserIcon className="h-4 w-4" />;
      case 'user_created':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'user_deleted':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'settings_updated':
        return <Cog6ToothIcon className="h-4 w-4" />;
      case 'product_created':
        return <ServerIcon className="h-4 w-4" />;
      case 'backup_completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'permission_denied':
        return <XCircleIcon className="h-4 w-4" />;
      case 'data_export':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'api_key_generated':
        return <ShieldCheckIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  // Get unique users for filter
  const uniqueUsers = [...new Set(logs.map(log => log.userId).filter(Boolean))];
  
  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map(log => log.action).filter(Boolean))];
  
  // Get unique categories for filter
  const uniqueCategories = [...new Set(logs.map(log => log.category).filter(Boolean))];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Audit & Logs</h1>
            <p className="page-subtitle">System changes history, user tracking, and timestamp tracking</p>
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
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{audit.statistics?.totalLogs || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {audit.statistics?.totalLogs > 0 
                  ? Math.round((audit.statistics?.successLogs / audit.statistics?.totalLogs) * 100) 
                  : 0}%
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600">{audit.statistics?.highSeverityLogs || 0}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-blue-600">{audit.statistics?.todayLogs || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
      >
        {Object.entries(audit.statistics?.categories || {}).map(([category, count]) => (
          <div key={category} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                {category}
              </span>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              className="input"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            
            <select
              className="input"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((userId) => {
                const user = logs.find(log => log.userId === userId);
                return (
                  <option key={userId} value={userId}>
                    {user?.userName || userId}
                  </option>
                );
              })}
            </select>
            
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              className="input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Timestamp</span>
                    {sortBy === 'timestamp' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('userName')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>User</span>
                    {sortBy === 'userName' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('action')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Action</span>
                    {sortBy === 'action' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.userRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm text-gray-900 capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.ip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(log)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Log ID</p>
                    <p className="text-sm text-gray-900">{selectedLog._id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Timestamp</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Action</p>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(selectedLog.action)}
                      <span className="text-sm text-gray-900 capitalize">
                        {selectedLog.action.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedLog.category)}`}>
                      {selectedLog.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Severity</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedLog.severity)}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">IP Address</p>
                    <p className="text-sm text-gray-900">{selectedLog.ip}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Request ID</p>
                    <p className="text-sm text-gray-900">{selectedLog.requestId}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">User Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">User ID</p>
                    <p className="text-sm text-gray-900">{selectedLog.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Name</p>
                    <p className="text-sm text-gray-900">{selectedLog.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Email</p>
                    <p className="text-sm text-gray-900">{selectedLog.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Role</p>
                    <p className="text-sm text-gray-900">{selectedLog.userRole}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Description</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedLog.description}</p>
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Technical Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Agent</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-700 break-all">{selectedLog.userAgent}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Session ID</p>
                    <p className="text-sm text-gray-900">{selectedLog.sessionId}</p>
                  </div>
                </div>
              </div>

              {/* Changes */}
              {selectedLog.changes && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Changes Made</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Fields changed:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.changes.map((change, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {change}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Old and New Values */}
              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Value Changes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.oldValue && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Previous Value</p>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <pre className="text-xs text-red-700 whitespace-pre-wrap">
                            {JSON.stringify(selectedLog.oldValue, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    {selectedLog.newValue && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">New Value</p>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <pre className="text-xs text-green-700 whitespace-pre-wrap">
                            {JSON.stringify(selectedLog.newValue, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {selectedLog.details && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Additional Details</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Log ID: {selectedLog._id}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AuditLogs;
