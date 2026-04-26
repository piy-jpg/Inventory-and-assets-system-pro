import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  MapPinIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const UserActivityAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const queryClient = useQueryClient();

  // Real-time user activity alerts data
  const { data: alertsData, isLoading, refetch } = useQuery(
    'userActivityAlerts',
    () => {
      const storedAlerts = localStorage.getItem('userActivityAlerts');
      if (storedAlerts) {
        return JSON.parse(storedAlerts);
      }
      
      return [
        {
          _id: 'USER_ALERT_001',
          type: 'suspicious_login',
          title: 'Suspicious Login Attempt',
          message: 'Multiple failed login attempts for user john.smith@example.com',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-23T10:30:00Z',
          userId: 'USR_001',
          userEmail: 'john.smith@example.com',
          userName: 'John Smith',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          failedAttempts: 5,
          lastAttempt: '2024-04-23T10:30:00Z',
          metadata: {
            location: 'New York, US',
            deviceType: 'Desktop',
            browser: 'Chrome',
            riskScore: 85,
            actionRequired: 'immediate'
          }
        },
        {
          _id: 'USER_ALERT_002',
          type: 'multiple_failed_logins',
          title: 'Multiple Failed Logins',
          message: 'User sarah.johnson@example.com has 10 failed login attempts in 1 hour',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-23T09:15:00Z',
          userId: 'USR_002',
          userEmail: 'sarah.johnson@example.com',
          userName: 'Sarah Johnson',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          failedAttempts: 10,
          lastAttempt: '2024-04-23T09:15:00Z',
          metadata: {
            location: 'Los Angeles, US',
            deviceType: 'Desktop',
            browser: 'Safari',
            riskScore: 92,
            timeWindow: '1 hour',
            accountLocked: true
          }
        },
        {
          _id: 'USER_ALERT_003',
          type: 'unauthorized_access',
          title: 'Unauthorized Access Attempt',
          message: 'User mike.wilson@example.com attempted to access admin panel',
          severity: 'error',
          status: 'read',
          timestamp: '2024-04-22T14:20:00Z',
          userId: 'USR_003',
          userEmail: 'mike.wilson@example.com',
          userName: 'Mike Wilson',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          failedAttempts: 1,
          lastAttempt: '2024-04-22T14:20:00Z',
          metadata: {
            location: 'Chicago, US',
            deviceType: 'Desktop',
            browser: 'Firefox',
            riskScore: 75,
            attemptedResource: '/admin/settings',
            userRole: 'sales_executive'
          }
        },
        {
          _id: 'USER_ALERT_004',
          type: 'unusual_location',
          title: 'Unusual Login Location',
          message: 'Login from unusual location for emily.davis@example.com',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-21T11:45:00Z',
          userId: 'USR_004',
          userEmail: 'emily.davis@example.com',
          userName: 'Emily Davis',
          ipAddress: '203.45.67.89',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          failedAttempts: 0,
          lastAttempt: '2024-04-21T11:45:00Z',
          metadata: {
            location: 'London, UK',
            deviceType: 'Mobile',
            browser: 'Safari',
            riskScore: 60,
            usualLocations: ['New York, US', 'Boston, US'],
            distance: 5585,
            verified: false
          }
        },
        {
          _id: 'USER_ALERT_005',
          type: 'privilege_escalation',
          title: 'Privilege Escalation Attempt',
          message: 'User robert.brown@example.com attempted to escalate privileges',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-20T16:30:00Z',
          userId: 'USR_005',
          userEmail: 'robert.brown@example.com',
          userName: 'Robert Brown',
          ipAddress: '192.168.1.104',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          failedAttempts: 3,
          lastAttempt: '2024-04-20T16:30:00Z',
          metadata: {
            location: 'Houston, US',
            deviceType: 'Desktop',
            browser: 'Edge',
            riskScore: 88,
            attemptedAction: 'modify_user_permissions',
            currentRole: 'customer_support',
            targetRole: 'administrator'
          }
        },
        {
          _id: 'USER_ALERT_006',
          type: 'account_lockout',
          title: 'Account Lockout',
          message: 'User account locked due to excessive failed attempts',
          severity: 'warning',
          status: 'resolved',
          timestamp: '2024-04-19T08:00:00Z',
          userId: 'USR_006',
          userEmail: 'alex.martin@example.com',
          userName: 'Alex Martin',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          failedAttempts: 15,
          lastAttempt: '2024-04-19T08:00:00Z',
          metadata: {
            location: 'Seattle, US',
            deviceType: 'Desktop',
            browser: 'Chrome',
            riskScore: 95,
            lockoutDuration: '30 minutes',
            resolvedAt: '2024-04-19T08:30:00Z',
            actionTaken: 'Account unlocked by admin'
          }
        },
        {
          _id: 'USER_ALERT_007',
          type: 'concurrent_sessions',
          title: 'Concurrent Sessions Alert',
          message: 'User has 5 active sessions from different locations',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-18T13:15:00Z',
          userId: 'USR_007',
          userEmail: 'lisa.anderson@example.com',
          userName: 'Lisa Anderson',
          ipAddress: '192.168.1.106',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          failedAttempts: 0,
          lastAttempt: '2024-04-18T13:15:00Z',
          metadata: {
            location: 'Miami, US',
            deviceType: 'Desktop',
            browser: 'Chrome',
            riskScore: 45,
            activeSessions: 5,
            sessionLocations: ['Miami, US', 'New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU'],
            maxAllowedSessions: 3
          }
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('User activity alerts data refreshed:', data);
      }
    }
  );

  // Mutation for updating alert status
  const updateAlertStatusMutation = useMutation(
    async ({ alertId, status, action }) => {
      const alerts = alertsData || [];
      const updatedAlerts = alerts.map(alert => 
        alert._id === alertId ? {
          ...alert,
          status,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : alert.resolvedAt,
          actionTaken: action || alert.actionTaken
        } : alert
      );
      localStorage.setItem('userActivityAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('userActivityAlerts', updatedAlerts);
      queryClient.invalidateQueries('all-alerts-aggregated');
      return updatedAlerts;
    },
    {
      onSuccess: () => {
        toast.success('Alert status updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update alert status');
      }
    }
  );

  // Mutation for deleting alerts
  const deleteAlertMutation = useMutation(
    async (alertId) => {
      const alerts = alertsData || [];
      const updatedAlerts = alerts.filter(alert => alert._id !== alertId);
      localStorage.setItem('userActivityAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('userActivityAlerts', updatedAlerts);
      queryClient.invalidateQueries('all-alerts-aggregated');
      return updatedAlerts;
    },
    {
      onSuccess: () => {
        toast.success('Alert deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete alert');
      }
    }
  );

  const alerts = alertsData || [];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.ipAddress?.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const openDetailsModal = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (status, action = '') => {
    if (!selectedAlert) return;

    updateAlertStatusMutation.mutate({
      alertId: selectedAlert._id,
      status,
      action
    });
  };

  const handleDelete = (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      deleteAlertMutation.mutate(alertId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('User activity alerts data refreshed');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'suspicious_login':
        return 'bg-red-100 text-red-800';
      case 'multiple_failed_logins':
        return 'bg-red-100 text-red-800';
      case 'unauthorized_access':
        return 'bg-red-100 text-red-800';
      case 'unusual_location':
        return 'bg-yellow-100 text-yellow-800';
      case 'privilege_escalation':
        return 'bg-red-100 text-red-800';
      case 'account_lockout':
        return 'bg-orange-100 text-orange-800';
      case 'concurrent_sessions':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'suspicious_login':
      case 'multiple_failed_logins':
      case 'unauthorized_access':
        return <LockClosedIcon className="h-4 w-4" />;
      case 'privilege_escalation':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'unusual_location':
        return <MapPinIcon className="h-4 w-4" />;
      case 'account_lockout':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'concurrent_sessions':
        return <UserGroupIcon className="h-4 w-4" />;
      default:
        return <UserGroupIcon className="h-4 w-4" />;
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-600';
    if (riskScore >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(alert => alert.status === 'unread').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'error').length;
  const highRiskAlerts = alerts.filter(alert => alert.metadata?.riskScore >= 80).length;
  const lockedAccounts = alerts.filter(alert => alert.type === 'account_lockout').length;

  // Alert type breakdown
  const typeBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
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
            <h1 className="page-title">User Activity Alerts</h1>
            <p className="page-subtitle">Suspicious login attempts, Multiple failed logins, Unauthorized access</p>
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
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{unreadAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{highRiskAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6"
      >
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getActivityIcon(type)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ').slice(0, 15)}
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
                placeholder="Search user activity alerts..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="suspicious_login">Suspicious Login</option>
              <option value="multiple_failed_logins">Multiple Failed Logins</option>
              <option value="unauthorized_access">Unauthorized Access</option>
              <option value="unusual_location">Unusual Location</option>
              <option value="privilege_escalation">Privilege Escalation</option>
              <option value="account_lockout">Account Lockout</option>
              <option value="concurrent_sessions">Concurrent Sessions</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Alerts Table */}
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No user activity alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.userName}</div>
                      <div className="text-xs text-gray-500">{alert.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(alert.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                          {alert.type.replace('_', ' ').charAt(0).toUpperCase() + alert.type.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.ipAddress}</div>
                      <div className="text-xs text-gray-500">{alert.metadata?.location || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.failedAttempts}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getRiskColor(alert.metadata?.riskScore || 0)}`}>
                        {alert.metadata?.riskScore || 0}/100
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(alert)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(alert._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Alert"
                          disabled={deleteAlertMutation.isLoading}
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Alert Details Modal */}
      {showDetailsModal && selectedAlert && (
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
              <h3 className="text-lg font-semibold text-gray-900">User Activity Alert Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">User Name</p>
                  <p className="text-sm text-gray-900">{selectedAlert.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User Email</p>
                  <p className="text-sm text-gray-900">{selectedAlert.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <p className="text-sm text-gray-900">{selectedAlert.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">IP Address</p>
                  <p className="text-sm text-gray-900">{selectedAlert.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
                  <p className="text-sm text-gray-900">{selectedAlert.failedAttempts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Attempt</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAlert.lastAttempt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Alert Message</p>
                <p className="text-sm text-gray-900">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert Type</p>
                  <div className="flex items-center space-x-2">
                    {getActivityIcon(selectedAlert.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedAlert.type)}`}>
                      {selectedAlert.type.replace('_', ' ').charAt(0).toUpperCase() + selectedAlert.type.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Severity</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status.charAt(0).toUpperCase() + selectedAlert.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Timestamp</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Risk Score</p>
                  <p className={`text-sm font-medium ${getRiskColor(selectedAlert.metadata?.riskScore || 0)}`}>
                    {selectedAlert.metadata?.riskScore || 0}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User Agent</p>
                  <p className="text-sm text-gray-900 truncate">{selectedAlert.userAgent}</p>
                </div>
              </div>
            </div>

            {selectedAlert.metadata && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Additional Information</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDelete(selectedAlert._id)}
                  className="btn btn-danger btn-sm"
                  disabled={deleteAlertMutation.isLoading}
                >
                  {deleteAlertMutation.isLoading ? 'Deleting...' : 'Delete Alert'}
                </button>
                {selectedAlert.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('resolved', 'User activity alert marked as resolved')}
                      className="btn btn-primary btn-sm"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('read', 'Alert marked as read')}
                      className="btn btn-secondary btn-sm"
                    >
                      Mark Read
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-outline btn-sm"
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

export default UserActivityAlerts;
