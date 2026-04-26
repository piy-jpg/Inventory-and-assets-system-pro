import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AlertsNotifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [showEditAlertModal, setShowEditAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'backup_success',
    trigger: 'immediate',
    channels: ['email'],
    recipients: [],
    enabled: true,
    conditions: {},
    message: ''
  });

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

  // Real-time alerts data
  const { data: alertsData, isLoading, refetch } = useQuery(
    'backupAlerts',
    () => {
      const storedAlerts = localStorage.getItem('backupAlerts');
      if (storedAlerts) {
        return JSON.parse(storedAlerts);
      }
      
      return {
        alerts: [
          {
            _id: 'ALERT_001',
            name: 'Daily Backup Success',
            type: 'backup_success',
            trigger: 'immediate',
            channels: ['email', 'in_app'],
            recipients: ['admin@example.com', 'ops@example.com'],
            enabled: true,
            conditions: {
              backupType: 'daily',
              status: 'success'
            },
            message: 'Daily backup completed successfully',
            lastTriggered: '2024-04-23T02:00:00Z',
            triggerCount: 47,
            successCount: 44,
            failureCount: 3
          },
          {
            _id: 'ALERT_002',
            name: 'Backup Failure Alert',
            type: 'backup_failure',
            trigger: 'immediate',
            channels: ['email', 'sms', 'in_app'],
            recipients: ['admin@example.com', 'ops@example.com', 'manager@example.com'],
            enabled: true,
            conditions: {
              status: 'failed',
              retryAttempts: 3
            },
            message: 'Backup failed - immediate attention required',
            lastTriggered: '2024-04-20T02:00:00Z',
            triggerCount: 3,
            successCount: 3,
            failureCount: 0
          },
          {
            _id: 'ALERT_003',
            name: 'Storage Space Warning',
            type: 'storage_warning',
            trigger: 'daily',
            channels: ['email'],
            recipients: ['admin@example.com'],
            enabled: true,
            conditions: {
              threshold: 80,
              metric: 'percentage_used'
            },
            message: 'Storage space is running low',
            lastTriggered: '2024-04-18T10:00:00Z',
            triggerCount: 5,
            successCount: 5,
            failureCount: 0
          },
          {
            _id: 'ALERT_004',
            name: 'Weekly Backup Summary',
            type: 'backup_summary',
            trigger: 'weekly',
            channels: ['email'],
            recipients: ['admin@example.com', 'manager@example.com'],
            enabled: true,
            conditions: {
              day: 'sunday',
              time: '09:00'
            },
            message: 'Weekly backup performance summary',
            lastTriggered: '2024-04-21T09:00:00Z',
            triggerCount: 12,
            successCount: 12,
            failureCount: 0
          },
          {
            _id: 'ALERT_005',
            name: 'Security Alert',
            type: 'security',
            trigger: 'immediate',
            channels: ['email', 'sms', 'in_app'],
            recipients: ['admin@example.com', 'security@example.com'],
            enabled: true,
            conditions: {
              events: ['access_denied', 'password_changed', 'encryption_key_rotated']
            },
            message: 'Security event detected',
            lastTriggered: '2024-04-23T10:30:00Z',
            triggerCount: 8,
            successCount: 8,
            failureCount: 0
          },
          {
            _id: 'ALERT_006',
            name: 'Monthly Archive Reminder',
            type: 'backup_reminder',
            trigger: 'monthly',
            channels: ['email'],
            recipients: ['admin@example.com'],
            enabled: false,
            conditions: {
              day: 1,
              time: '08:00'
            },
            message: 'Monthly archive backup reminder',
            lastTriggered: '2024-03-01T08:00:00Z',
            triggerCount: 0,
            successCount: 0,
            failureCount: 0
          }
        ],
        notifications: [
          {
            _id: 'NOTIF_001',
            alertId: 'ALERT_001',
            title: 'Daily Backup Completed',
            message: 'Daily backup completed successfully. Size: 2.4 GB, Duration: 5m 23s',
            type: 'success',
            channel: 'in_app',
            timestamp: '2024-04-23T02:00:00Z',
            read: false,
            priority: 'normal'
          },
          {
            _id: 'NOTIF_002',
            alertId: 'ALERT_005',
            title: 'Password Changed',
            message: 'Admin password changed successfully',
            type: 'info',
            channel: 'in_app',
            timestamp: '2024-04-23T10:30:00Z',
            read: false,
            priority: 'normal'
          },
          {
            _id: 'NOTIF_003',
            alertId: 'ALERT_002',
            title: 'Backup Failed',
            message: 'Backup failed due to connection timeout. Retry attempts: 3',
            type: 'error',
            channel: 'in_app',
            timestamp: '2024-04-20T02:00:00Z',
            read: true,
            priority: 'high'
          },
          {
            _id: 'NOTIF_004',
            alertId: 'ALERT_003',
            title: 'Storage Space Warning',
            message: 'Cloud storage usage is at 85% capacity',
            type: 'warning',
            channel: 'in_app',
            timestamp: '2024-04-18T10:00:00Z',
            read: true,
            priority: 'medium'
          }
        ]
      };
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Backup alerts data refreshed:', data);
      }
    }
  );

  // Mutation for adding alert
  const addAlertMutation = useMutation(
    async (alertData) => {
      const alerts = alertsData?.alerts || [];
      const newAlert = {
        ...alertData,
        _id: `ALERT_${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastTriggered: null,
        triggerCount: 0,
        successCount: 0,
        failureCount: 0
      };
      const updatedAlerts = {
        ...alertsData,
        alerts: [...alerts, newAlert]
      };
      localStorage.setItem('backupAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('backupAlerts', updatedAlerts);
      return newAlert;
    },
    {
      onSuccess: () => {
        toast.success('Alert created successfully');
        setShowAddAlertModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create alert');
      }
    }
  );

  // Mutation for updating alert
  const updateAlertMutation = useMutation(
    async (updatedAlert) => {
      const alerts = alertsData?.alerts || [];
      const updatedAlerts = alerts.map(alert => 
        alert._id === updatedAlert._id ? {
          ...updatedAlert,
          updatedAt: new Date().toISOString()
        } : alert
      );
      const updatedAlertsData = {
        ...alertsData,
        alerts: updatedAlerts
      };
      localStorage.setItem('backupAlerts', JSON.stringify(updatedAlertsData));
      queryClient.setQueryData('backupAlerts', updatedAlertsData);
      return updatedAlertsData;
    },
    {
      onSuccess: () => {
        toast.success('Alert updated successfully');
        setShowEditAlertModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update alert');
      }
    }
  );

  // Mutation for deleting alert
  const deleteAlertMutation = useMutation(
    async (alertId) => {
      const alerts = alertsData?.alerts || [];
      const updatedAlerts = alerts.filter(alert => alert._id !== alertId);
      const updatedAlertsData = {
        ...alertsData,
        alerts: updatedAlerts
      };
      localStorage.setItem('backupAlerts', JSON.stringify(updatedAlertsData));
      queryClient.setQueryData('backupAlerts', updatedAlertsData);
      return updatedAlertsData;
    },
    {
      onSuccess: () => {
        toast.success('Alert deleted successfully');
        setShowEditAlertModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete alert');
      }
    }
  );

  const alerts = alertsData?.alerts || [];
  const notifications = alertsData?.notifications || [];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                        (filterStatus === 'enabled' && alert.enabled) ||
                        (filterStatus === 'disabled' && !alert.enabled);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'backup_success',
      trigger: 'immediate',
      channels: ['email'],
      recipients: [],
      enabled: true,
      conditions: {},
      message: ''
    });
  };

  const openAddAlertModal = () => {
    resetForm();
    setShowAddAlertModal(true);
  };

  const openEditAlertModal = (alert) => {
    setSelectedAlert(alert);
    setFormData({
      name: alert.name,
      type: alert.type,
      trigger: alert.trigger,
      channels: alert.channels,
      recipients: alert.recipients,
      enabled: alert.enabled,
      conditions: alert.conditions,
      message: alert.message
    });
    setShowEditAlertModal(true);
  };

  const handleAddAlert = () => {
    if (!formData.name.trim()) {
      toast.error('Alert name is required');
      return;
    }

    if (formData.recipients.length === 0) {
      toast.error('At least one recipient is required');
      return;
    }

    addAlertMutation.mutate(formData);
  };

  const handleUpdateAlert = () => {
    if (!selectedAlert) return;

    const updatedAlert = {
      ...selectedAlert,
      ...formData
    };

    updateAlertMutation.mutate(updatedAlert);
  };

  const handleDeleteAlert = (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      deleteAlertMutation.mutate(alertId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Alerts data refreshed');
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleRecipientChange = (value) => {
    const emails = value.split(',').map(email => email.trim()).filter(email => email);
    setFormData(prev => ({ ...prev, recipients: emails }));
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
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'backup_success':
        return 'bg-green-100 text-green-800';
      case 'backup_failure':
        return 'bg-red-100 text-red-800';
      case 'storage_warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'backup_summary':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-purple-100 text-purple-800';
      case 'backup_reminder':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      case 'in_app':
        return <BellIcon className="h-4 w-4" />;
      case 'webhook':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const enabledAlerts = alerts.filter(alert => alert.enabled).length;
  const disabledAlerts = alerts.filter(alert => !alert.enabled).length;
  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Alerts & Notifications</h1>
            <p className="page-subtitle">Backup success/failure alerts, Email/SMS notifications, Reminder if backup not done</p>
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
            {hasPermission('create') && (
              <button 
                onClick={openAddAlertModal}
                className="btn btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Alert</span>
              </button>
            )}
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
              <p className="text-sm font-medium text-gray-600">Enabled</p>
              <p className="text-2xl font-bold text-green-600">{enabledAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disabled</p>
              <p className="text-2xl font-bold text-gray-600">{disabledAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600">{unreadNotifications}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          <BellIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <BellIcon className={`h-4 w-4 ${
                      !notification.read ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.type)}`}>
                    {notification.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {notification.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
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
                placeholder="Search alerts..."
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
              <option value="backup_success">Backup Success</option>
              <option value="backup_failure">Backup Failure</option>
              <option value="storage_warning">Storage Warning</option>
              <option value="backup_summary">Backup Summary</option>
              <option value="security">Security</option>
              <option value="backup_reminder">Backup Reminder</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
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
                  Alert Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channels
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Triggered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.name}</div>
                      <div className="text-xs text-gray-500">{alert.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                        {alert.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{alert.trigger}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {alert.channels.map((channel, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {alert.recipients.length > 0 ? alert.recipients[0] : 'No recipients'}
                      </div>
                      {alert.recipients.length > 1 && (
                        <div className="text-xs text-gray-500">
                          +{alert.recipients.length - 1} more
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {alert.lastTriggered ? new Date(alert.lastTriggered).toLocaleDateString() : 'Never'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {alert.triggerCount} triggers
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {hasPermission('manage_settings') && (
                          <button
                            onClick={() => openEditAlertModal(alert)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('delete') && (
                          <button
                            onClick={() => handleDeleteAlert(alert._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Alert Modal */}
      {showAddAlertModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddAlertModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Alert</h3>
              <button
                onClick={() => setShowAddAlertModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddAlert();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter alert name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="backup_success">Backup Success</option>
                      <option value="backup_failure">Backup Failure</option>
                      <option value="storage_warning">Storage Warning</option>
                      <option value="backup_summary">Backup Summary</option>
                      <option value="security">Security</option>
                      <option value="backup_reminder">Backup Reminder</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trigger *</label>
                    <select
                      value={formData.trigger}
                      onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Channels *</label>
                  <div className="space-y-2">
                    {['email', 'sms', 'in_app', 'webhook'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={() => handleChannelToggle(channel)}
                          className="mr-2"
                        />
                        <div className="flex items-center space-x-2">
                          {getChannelIcon(channel)}
                          <span className="text-sm text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients *</label>
                  <textarea
                    value={formData.recipients.join(', ')}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Enter email addresses separated by commas"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple email addresses with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder="Enter custom message (optional)"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enable alert</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddAlertModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addAlertMutation.isLoading}
                >
                  {addAlertMutation.isLoading ? 'Adding...' : 'Add Alert'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Alert Modal */}
      {showEditAlertModal && selectedAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditAlertModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Alert</h3>
              <button
                onClick={() => setShowEditAlertModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateAlert();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter alert name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="backup_success">Backup Success</option>
                      <option value="backup_failure">Backup Failure</option>
                      <option value="storage_warning">Storage Warning</option>
                      <option value="backup_summary">Backup Summary</option>
                      <option value="security">Security</option>
                      <option value="backup_reminder">Backup Reminder</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trigger *</label>
                    <select
                      value={formData.trigger}
                      onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Channels *</label>
                  <div className="space-y-2">
                    {['email', 'sms', 'in_app', 'webhook'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={() => handleChannelToggle(channel)}
                          className="mr-2"
                        />
                        <div className="flex items-center space-x-2">
                          {getChannelIcon(channel)}
                          <span className="text-sm text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients *</label>
                  <textarea
                    value={formData.recipients.join(', ')}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Enter email addresses separated by commas"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple email addresses with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder="Enter custom message (optional)"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enable alert</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditAlertModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateAlertMutation.isLoading}
                >
                  {updateAlertMutation.isLoading ? 'Updating...' : 'Update Alert'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AlertsNotifications;
