import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ServerIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  WifiIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const SystemAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const queryClient = useQueryClient();

  // Real-time system alerts data
  const { data: alertsData, isLoading, refetch } = useQuery(
    'systemAlerts',
    () => {
      const storedAlerts = localStorage.getItem('systemAlerts');
      if (storedAlerts) {
        return JSON.parse(storedAlerts);
      }
      
      return [
        {
          _id: 'SYS_ALERT_001',
          type: 'backup_failure',
          title: 'Backup Failure Alert',
          message: 'Daily backup failed to complete successfully',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-23T10:30:00Z',
          component: 'backup_system',
          componentId: 'BACKUP_001',
          location: 'Primary Server',
          failureReason: 'Insufficient disk space',
          scheduledTime: '2024-04-23T02:00:00Z',
          metadata: {
            backupType: 'daily',
            backupSize: '15.2 GB',
            availableSpace: '2.1 GB',
            requiredSpace: '18.5 GB',
            lastSuccessfulBackup: '2024-04-22T02:00:00Z',
            retentionPolicy: '30 days',
            backupPath: '/backup/daily'
          }
        },
        {
          _id: 'SYS_ALERT_002',
          type: 'server_downtime',
          title: 'Server Downtime Alert',
          message: 'Web server is experiencing high response times',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-23T09:15:00Z',
          component: 'web_server',
          componentId: 'WEB_001',
          location: 'Server Room',
          failureReason: 'High CPU usage',
          scheduledTime: null,
          metadata: {
            serverName: 'web-01',
            cpuUsage: '92%',
            memoryUsage: '78%',
            diskUsage: '45%',
            responseTime: '2.5s',
            uptime: '15 days',
            loadAverage: '3.2'
          }
        },
        {
          _id: 'SYS_ALERT_003',
          type: 'database_error',
          title: 'Database Error Alert',
          message: 'Database connection pool exhausted',
          severity: 'error',
          status: 'read',
          timestamp: '2024-04-22T14:20:00Z',
          component: 'database',
          componentId: 'DB_001',
          location: 'Database Server',
          failureReason: 'Connection pool exhaustion',
          scheduledTime: null,
          metadata: {
            databaseName: 'inventory_db',
            maxConnections: 100,
            activeConnections: 100,
            queuedConnections: 25,
            errorCount: 15,
            lastRestart: '2024-04-20T08:30:00Z'
          }
        },
        {
          _id: 'SYS_ALERT_004',
          type: 'api_error',
          title: 'API Error Alert',
          message: 'API rate limit exceeded for external service',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-21T11:45:00Z',
          component: 'api_gateway',
          componentId: 'API_001',
          location: 'Application Server',
          failureReason: 'Rate limit exceeded',
          scheduledTime: null,
          metadata: {
            serviceName: 'payment_gateway',
            requestCount: 1500,
            rateLimit: 1000,
            timeWindow: '1 minute',
            errorRate: '15%',
            avgResponseTime: '850ms'
          }
        },
        {
          _id: 'SYS_ALERT_005',
          type: 'disk_space',
          title: 'Disk Space Alert',
          message: 'System disk space running low (85% used)',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-20T16:30:00Z',
          component: 'storage',
          componentId: 'STORAGE_001',
          location: 'Primary Server',
          failureReason: 'Low disk space',
          scheduledTime: null,
          metadata: {
            mountPoint: '/var/log',
            totalSpace: '500 GB',
            usedSpace: '425 GB',
            availableSpace: '75 GB',
            usagePercentage: 85,
            criticalThreshold: 90
          }
        },
        {
          _id: 'SYS_ALERT_006',
          type: 'network_issue',
          title: 'Network Issue Alert',
          message: 'Network connectivity issues detected',
          severity: 'error',
          status: 'resolved',
          timestamp: '2024-04-19T08:00:00Z',
          component: 'network',
          componentId: 'NET_001',
          location: 'Network Infrastructure',
          failureReason: 'Packet loss detected',
          scheduledTime: null,
          metadata: {
            interface: 'eth0',
            packetLoss: '12%',
            latency: '45ms',
            bandwidth: '850 Mbps',
            uptime: '30 days',
            resolvedAt: '2024-04-19T10:30:00Z',
            actionTaken: 'Network interface reset'
          }
        },
        {
          _id: 'SYS_ALERT_007',
          type: 'memory_usage',
          title: 'Memory Usage Alert',
          message: 'Application memory usage exceeding threshold',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-18T13:15:00Z',
          component: 'application',
          componentId: 'APP_001',
          location: 'Application Server',
          failureReason: 'High memory usage',
          scheduledTime: null,
          metadata: {
            processName: 'inventory_app',
            memoryUsage: '8.2 GB',
            totalMemory: '16 GB',
            usagePercentage: 51,
            threshold: 80,
            heapSize: '6.5 GB',
            nonHeapSize: '1.7 GB'
          }
        },
        {
          _id: 'SYS_ALERT_008',
          type: 'ssl_certificate',
          title: 'SSL Certificate Alert',
          message: 'SSL certificate expiring in 7 days',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-17T09:45:00Z',
          component: 'security',
          componentId: 'SSL_001',
          location: 'Web Server',
          failureReason: 'Certificate expiry',
          scheduledTime: null,
          metadata: {
            domain: 'inventory.example.com',
            certificateIssuer: 'Let\'s Encrypt',
            expiryDate: '2024-04-24',
            daysToExpiry: 7,
            autoRenewal: true,
            renewalStatus: 'pending'
          }
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('System alerts data refreshed:', data);
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
      localStorage.setItem('systemAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('systemAlerts', updatedAlerts);
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
      localStorage.setItem('systemAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('systemAlerts', updatedAlerts);
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
    const matchesSearch = alert.component?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.failureReason?.toLowerCase().includes(searchTerm.toLowerCase());
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
    toast.success('System alerts data refreshed');
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
      case 'backup_failure':
        return 'bg-red-100 text-red-800';
      case 'server_downtime':
        return 'bg-orange-100 text-orange-800';
      case 'database_error':
        return 'bg-red-100 text-red-800';
      case 'api_error':
        return 'bg-yellow-100 text-yellow-800';
      case 'disk_space':
        return 'bg-orange-100 text-orange-800';
      case 'network_issue':
        return 'bg-red-100 text-red-800';
      case 'memory_usage':
        return 'bg-yellow-100 text-yellow-800';
      case 'ssl_certificate':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSystemIcon = (type) => {
    switch (type) {
      case 'backup_failure':
        return <ServerIcon className="h-4 w-4" />;
      case 'server_downtime':
        return <ServerIcon className="h-4 w-4" />;
      case 'database_error':
        return <CpuChipIcon className="h-4 w-4" />;
      case 'api_error':
        return <WifiIcon className="h-4 w-4" />;
      case 'disk_space':
        return <ServerIcon className="h-4 w-4" />;
      case 'network_issue':
        return <WifiIcon className="h-4 w-4" />;
      case 'memory_usage':
        return <CpuChipIcon className="h-4 w-4" />;
      case 'ssl_certificate':
        return <ServerIcon className="h-4 w-4" />;
      default:
        return <ServerIcon className="h-4 w-4" />;
    }
  };

  const getComponentIcon = (component) => {
    switch (component) {
      case 'backup_system':
        return <ServerIcon className="h-4 w-4" />;
      case 'web_server':
      case 'database':
      case 'application':
        return <ServerIcon className="h-4 w-4" />;
      case 'api_gateway':
        return <WifiIcon className="h-4 w-4" />;
      case 'storage':
        return <ServerIcon className="h-4 w-4" />;
      case 'network':
        return <WifiIcon className="h-4 w-4" />;
      case 'security':
        return <ServerIcon className="h-4 w-4" />;
      default:
        return <ServerIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(alert => alert.status === 'unread').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'error').length;
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length;

  // Alert type breakdown
  const typeBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});

  // Component breakdown
  const componentBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.component] = (acc[alert.component] || 0) + 1;
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
            <h1 className="page-title">System Alerts</h1>
            <p className="page-subtitle">Backup failure, Server issues, API errors</p>
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
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
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
                {getSystemIcon(type)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ').slice(0, 12)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Component Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6"
      >
        {Object.entries(componentBreakdown).map(([component, count]) => (
          <div key={component} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getComponentIcon(component)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {component.replace('_', ' ')}
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
        transition={{ delay: 0.4 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search system alerts..."
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
              <option value="backup_failure">Backup Failure</option>
              <option value="server_downtime">Server Downtime</option>
              <option value="database_error">Database Error</option>
              <option value="api_error">API Error</option>
              <option value="disk_space">Disk Space</option>
              <option value="network_issue">Network Issue</option>
              <option value="memory_usage">Memory Usage</option>
              <option value="ssl_certificate">SSL Certificate</option>
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
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failure Reason
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
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No system alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getComponentIcon(alert.component)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{alert.component}</div>
                          <div className="text-xs text-gray-500">ID: {alert.componentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getSystemIcon(alert.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                          {alert.type.replace('_', ' ').charAt(0).toUpperCase() + alert.type.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.failureReason}</div>
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
              <h3 className="text-lg font-semibold text-gray-900">System Alert Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">Component</p>
                  <div className="flex items-center space-x-2">
                    {getComponentIcon(selectedAlert.component)}
                    <span className="text-sm text-gray-900">{selectedAlert.component}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Component ID</p>
                  <p className="text-sm text-gray-900">{selectedAlert.componentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{selectedAlert.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Failure Reason</p>
                  <p className="text-sm text-gray-900">{selectedAlert.failureReason}</p>
                </div>
                {selectedAlert.scheduledTime && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled Time</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedAlert.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Alert Message</p>
                <p className="text-sm text-gray-900">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert Type</p>
                  <div className="flex items-center space-x-2">
                    {getSystemIcon(selectedAlert.type)}
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
              </div>
            </div>

            {selectedAlert.metadata && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Technical Details</p>
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
                      onClick={() => handleUpdateStatus('resolved', 'System alert marked as resolved')}
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

export default SystemAlerts;
