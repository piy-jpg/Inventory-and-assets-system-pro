import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ServerIcon,
  ShieldCheckIcon,
  BellIcon,
  CpuChipIcon,
  TrashIcon,
  KeyIcon,
  Cog6ToothIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const BackupLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const queryClient = useQueryClient();

  // Role-based access control
  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'viewer';
  };

  const userRole = getUserRole();

  const hasPermission = (action) => {
    const permissions = {
      admin: ['view', 'create', 'delete', 'restore', 'manage_settings'],
      manager: ['view', 'create', 'delete', 'restore'],
      operator: ['view', 'create'],
      viewer: ['view']
    };
    return permissions[userRole]?.includes(action) || false;
  };

  // Real-time backup logs data
  const { data: logsData, isLoading, refetch } = useQuery(
    'backupLogs',
    () => {
      const storedLogs = localStorage.getItem('backupLogs');
      if (storedLogs) {
        return JSON.parse(storedLogs);
      }
      
      return [
        {
          _id: 'LOG_001',
          action: 'backup_created',
          description: 'Daily full backup completed successfully',
          user: 'system',
          userId: 'system',
          timestamp: '2024-04-23T02:00:00Z',
          ip: '127.0.0.1',
          status: 'success',
          details: {
            backupId: 'BACKUP_001',
            backupType: 'full',
            backupSize: '2.4 GB',
            duration: '5m 23s',
            location: 'cloud',
            provider: 'AWS S3',
            modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
            checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
            integrity: 'verified'
          },
          userAgent: 'Mozilla/5.0 (System)',
          sessionId: 'sess_123456789',
          requestId: 'req_987654321'
        },
        {
          _id: 'LOG_002',
          action: 'backup_failed',
          description: 'Backup failed due to connection timeout',
          user: 'system',
          userId: 'system',
          timestamp: '2024-04-20T02:00:00Z',
          ip: '127.0.0.1',
          status: 'failed',
          details: {
            backupId: 'BACKUP_004',
            backupType: 'full',
            error: 'Connection timeout to AWS S3',
            errorCode: 'TIMEOUT',
            retryAttempts: 3,
            duration: '3m 12s',
            location: 'cloud',
            provider: 'AWS S3'
          },
          userAgent: 'Mozilla/5.0 (System)',
          sessionId: 'sess_123456789',
          requestId: 'req_987654322'
        },
        {
          _id: 'LOG_003',
          action: 'backup_restored',
          description: 'System restored from backup BACKUP_005',
          user: 'admin',
          userId: 'admin_001',
          timestamp: '2024-04-18T14:30:00Z',
          ip: '192.168.1.100',
          status: 'success',
          details: {
            backupId: 'BACKUP_005',
            restoreType: 'full',
            restoreSize: '2.6 GB',
            duration: '8m 45s',
            modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
            integrity: 'verified',
            conflicts: 0
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_123456790',
          requestId: 'req_987654323'
        },
        {
          _id: 'LOG_004',
          action: 'encryption_key_rotated',
          description: 'Encryption key rotated successfully',
          user: 'admin',
          userId: 'admin_001',
          timestamp: '2024-04-20T14:20:00Z',
          ip: '192.168.1.100',
          status: 'success',
          details: {
            oldKeyId: 'key_20240120',
            newKeyId: 'key_20240420',
            algorithm: 'AES-256',
            rotationReason: 'scheduled',
            affectedBackups: 47
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_123456791',
          requestId: 'req_987654324'
        },
        {
          _id: 'LOG_005',
          action: 'access_denied',
          description: 'Unauthorized access attempt to backup settings',
          user: 'unknown',
          userId: null,
          timestamp: '2024-04-22T23:45:00Z',
          ip: '192.168.1.200',
          status: 'failed',
          details: {
            attemptedAction: 'delete_backup',
            targetBackupId: 'BACKUP_001',
            reason: 'insufficient_permissions',
            requiredRole: 'admin',
            userRole: 'guest'
          },
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          sessionId: 'sess_123456792',
          requestId: 'req_987654325'
        },
        {
          _id: 'LOG_006',
          action: 'backup_downloaded',
          description: 'Backup file downloaded by admin',
          user: 'admin',
          userId: 'admin_001',
          timestamp: '2024-04-19T10:15:00Z',
          ip: '192.168.1.100',
          status: 'success',
          details: {
            backupId: 'BACKUP_002',
            fileName: 'Daily_Full_Backup_20240422.sql',
            fileSize: '2.3 GB',
            downloadTime: '45s',
            downloadLocation: '/Users/admin/Downloads/'
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_123456793',
          requestId: 'req_987654326'
        },
        {
          _id: 'LOG_007',
          action: 'backup_deleted',
          description: 'Old backup deleted as per retention policy',
          user: 'system',
          userId: 'system',
          timestamp: '2024-04-15T02:00:00Z',
          ip: '127.0.0.1',
          status: 'success',
          details: {
            backupId: 'BACKUP_999',
            fileName: 'Monthly_Archive_20240201.zip',
            fileSize: '3.8 GB',
            deletionReason: 'retention_policy',
            retentionDays: 365,
            deletionTime: '2s'
          },
          userAgent: 'Mozilla/5.0 (System)',
          sessionId: 'sess_123456794',
          requestId: 'req_987654327'
        },
        {
          _id: 'LOG_008',
          action: 'storage_tested',
          description: 'Storage connection test completed',
          user: 'admin',
          userId: 'admin_001',
          timestamp: '2024-04-23T09:15:00Z',
          ip: '192.168.1.100',
          status: 'success',
          details: {
            storageId: 'STORAGE_001',
            provider: 'AWS S3',
            testType: 'connectivity',
            latency: '45ms',
            bandwidth: '125 Mbps',
            availableSpace: '920.5 GB',
            totalSpace: '1 TB'
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_123456795',
          requestId: 'req_987654328'
        },
        {
          _id: 'LOG_009',
          action: 'password_changed',
          description: 'Admin password changed successfully',
          user: 'admin',
          userId: 'admin_001',
          timestamp: '2024-04-23T10:30:00Z',
          ip: '192.168.1.100',
          status: 'success',
          details: {
            previousPasswordHash: 'old_hash_12345',
            newPasswordHash: 'new_hash_67890',
            passwordStrength: 'strong',
            changeReason: 'routine_security_update',
            sessionId: 'sess_123456796'
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_123456796',
          requestId: 'req_987654329'
        },
        {
          _id: 'LOG_010',
          action: 'settings_updated',
          description: 'Backup security settings updated',
          user: 'admin',
          userId: 'admin_001',
          timestamp: '2024-04-18T09:15:00Z',
          ip: '192.168.1.100',
          status: 'success',
          details: {
            previousSettings: {
              encryptionEnabled: false,
              passwordProtection: false
            },
            newSettings: {
              encryptionEnabled: true,
              passwordProtection: true,
              encryptionAlgorithm: 'AES-256',
              passwordComplexity: 'medium'
            },
            affectedBackups: 0,
            changes: ['encryption_enabled', 'password_protection', 'encryption_algorithm', 'password_complexity']
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_123456797',
          requestId: 'req_987654330'
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Backup logs data refreshed:', data);
      }
    }
  );

  const logs = logsData || [];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.ip?.includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const logDate = new Date(log.timestamp).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const weekAgo = new Date(Date.now() - 604800000).toDateString();
      
      switch (filterDate) {
        case 'today':
          matchesDate = logDate === today;
          break;
        case 'yesterday':
          matchesDate = logDate === yesterday;
          break;
        case 'week':
          matchesDate = new Date(log.timestamp) >= new Date(weekAgo);
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesAction && matchesStatus && matchesDate;
  });

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'timestamp':
        comparison = new Date(a.timestamp) - new Date(b.timestamp);
        break;
      case 'user':
        comparison = a.user.localeCompare(b.user);
        break;
      case 'action':
        comparison = a.action.localeCompare(b.action);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
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
    toast.success('Backup logs data refreshed');
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

  const getActionColor = (action) => {
    switch (action) {
      case 'backup_created':
        return 'bg-blue-100 text-blue-800';
      case 'backup_failed':
        return 'bg-red-100 text-red-800';
      case 'backup_restored':
        return 'bg-purple-100 text-purple-800';
      case 'backup_downloaded':
        return 'bg-green-100 text-green-800';
      case 'backup_deleted':
        return 'bg-orange-100 text-orange-800';
      case 'encryption_key_rotated':
        return 'bg-indigo-100 text-indigo-800';
      case 'password_changed':
        return 'bg-teal-100 text-teal-800';
      case 'settings_updated':
        return 'bg-gray-100 text-gray-800';
      case 'access_denied':
        return 'bg-red-100 text-red-800';
      case 'storage_tested':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'backup_created':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'backup_failed':
        return <XCircleIcon className="h-4 w-4" />;
      case 'backup_restored':
        return <ArrowPathIcon className="h-4 w-4" />;
      case 'backup_downloaded':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'backup_deleted':
        return <TrashIcon className="h-4 w-4" />;
      case 'encryption_key_rotated':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'password_changed':
        return <KeyIcon className="h-4 w-4" />;
      case 'settings_updated':
        return <Cog6ToothIcon className="h-4 w-4" />;
      case 'access_denied':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'storage_tested':
        return <ServerIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalLogs = logs.length;
  const successLogs = logs.filter(log => log.status === 'success').length;
  const failedLogs = logs.filter(log => log.status === 'failed').length;
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  // Action breakdown
  const actionBreakdown = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Backup Logs</h1>
            <p className="page-subtitle">Detailed logs, Who created backup, Who restored data, Time & IP address</p>
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
              <p className="text-sm font-medium text-gray-600">Success</p>
              <p className="text-2xl font-bold text-green-600">{successLogs}</p>
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
              <XCircleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-blue-600">{todayLogs}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
      >
        {Object.entries(actionBreakdown).map(([action, count]) => (
          <div key={action} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getActionIcon(action)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {action.replace('_', ' ')}
                </span>
              </div>
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
                placeholder="Search backup logs..."
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
              <option value="backup_created">Backup Created</option>
              <option value="backup_failed">Backup Failed</option>
              <option value="backup_restored">Backup Restored</option>
              <option value="backup_downloaded">Backup Downloaded</option>
              <option value="backup_deleted">Backup Deleted</option>
              <option value="encryption_key_rotated">Key Rotated</option>
              <option value="password_changed">Password Changed</option>
              <option value="settings_updated">Settings Updated</option>
              <option value="access_denied">Access Denied</option>
              <option value="storage_tested">Storage Tested</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
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
                    onClick={() => handleSort('user')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>User</span>
                    {sortBy === 'user' && (
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
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No logs found
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
                          <div className="text-sm text-gray-900">{log.user}</div>
                          {log.userId && (
                            <div className="text-xs text-gray-500">ID: {log.userId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.ip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
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
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User</p>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{selectedLog.user}</p>
                      {selectedLog.userId && (
                        <p className="text-xs text-gray-500">ID: {selectedLog.userId}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">IP Address</p>
                  <p className="text-sm text-gray-900">{selectedLog.ip}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-sm text-gray-900">{selectedLog.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Session ID</p>
                  <p className="text-sm text-gray-900">{selectedLog.sessionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Request ID</p>
                  <p className="text-sm text-gray-900">{selectedLog.requestId}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">User Agent</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700 break-all">{selectedLog.userAgent}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Additional Details</p>
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
                  className="btn btn-secondary btn-sm"
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

export default BackupLogs;
