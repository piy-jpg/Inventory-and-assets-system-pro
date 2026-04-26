import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  ServerIcon,
  Cog6ToothIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AllAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const queryClient = useQueryClient();

  // Real-time alerts data - aggregate from all sub-pages
  const { data: alertsData, isLoading, refetch } = useQuery(
    'all-alerts-aggregated',
    () => {
      // Get alerts from all sub-pages
      const inventoryAlerts = JSON.parse(localStorage.getItem('inventoryAlerts') || '[]');
      const paymentAlerts = JSON.parse(localStorage.getItem('paymentAlerts') || '[]');
      const assetAlerts = JSON.parse(localStorage.getItem('assetAlerts') || '[]');
      const expiryAlerts = JSON.parse(localStorage.getItem('expiryAlerts') || '[]');
      const userActivityAlerts = JSON.parse(localStorage.getItem('userActivityAlerts') || '[]');
      const systemAlerts = JSON.parse(localStorage.getItem('systemAlerts') || '[]');
      
      // Transform each alert to include source type
      const transformedInventory = inventoryAlerts.map(a => ({ ...a, type: 'inventory', source: 'inventoryAlerts' }));
      const transformedPayment = paymentAlerts.map(a => ({ ...a, type: 'payment', source: 'paymentAlerts' }));
      const transformedAsset = assetAlerts.map(a => ({ ...a, type: 'asset', source: 'assetAlerts' }));
      const transformedExpiry = expiryAlerts.map(a => ({ ...a, type: 'expiry', source: 'expiryAlerts' }));
      const transformedUserActivity = userActivityAlerts.map(a => ({ ...a, type: 'user_activity', source: 'userActivityAlerts' }));
      const transformedSystem = systemAlerts.map(a => ({ ...a, type: 'system', source: 'systemAlerts' }));
      
      // Combine all alerts
      const allAlerts = [
        ...transformedInventory,
        ...transformedPayment,
        ...transformedAsset,
        ...transformedExpiry,
        ...transformedUserActivity,
        ...transformedSystem
      ];
      
      // Sort by timestamp (newest first)
      allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return allAlerts;
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('All alerts data refreshed:', data);
      }
    }
  );

  // Mutation for updating alert status - updates the source sub-page
  const updateAlertStatusMutation = useMutation(
    async ({ alertId, status, action, source }) => {
      // Get the specific source alerts
      const sourceAlerts = JSON.parse(localStorage.getItem(source) || '[]');
      const updatedAlerts = sourceAlerts.map(alert => 
        alert._id === alertId ? {
          ...alert,
          status,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : alert.resolvedAt,
          actionTaken: action || alert.actionTaken
        } : alert
      );
      localStorage.setItem(source, JSON.stringify(updatedAlerts));
      
      // Invalidate all alert queries to sync across pages
      queryClient.invalidateQueries('all-alerts-aggregated');
      queryClient.invalidateQueries('inventoryAlerts');
      queryClient.invalidateQueries('paymentAlerts');
      queryClient.invalidateQueries('assetAlerts');
      queryClient.invalidateQueries('expiryAlerts');
      queryClient.invalidateQueries('userActivityAlerts');
      queryClient.invalidateQueries('systemAlerts');
      
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

  // Mutation for deleting alerts - deletes from the source sub-page
  const deleteAlertMutation = useMutation(
    async ({ alertId, source }) => {
      // Get the specific source alerts
      const sourceAlerts = JSON.parse(localStorage.getItem(source) || '[]');
      const updatedAlerts = sourceAlerts.filter(alert => alert._id !== alertId);
      localStorage.setItem(source, JSON.stringify(updatedAlerts));
      
      // Invalidate all alert queries to sync across pages
      queryClient.invalidateQueries('all-alerts-aggregated');
      queryClient.invalidateQueries('inventoryAlerts');
      queryClient.invalidateQueries('paymentAlerts');
      queryClient.invalidateQueries('assetAlerts');
      queryClient.invalidateQueries('expiryAlerts');
      queryClient.invalidateQueries('userActivityAlerts');
      queryClient.invalidateQueries('systemAlerts');
      
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
    const matchesSearch = alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.message?.toLowerCase().includes(searchTerm.toLowerCase());
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
      action,
      source: selectedAlert.source
    });
  };

  const handleDelete = (alertId, source) => {
    if (window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      deleteAlertMutation.mutate({ alertId, source });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Alerts data refreshed');
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'inventory':
        return <CubeIcon className="h-4 w-4" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'asset':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'expiry':
        return <CalendarIcon className="h-4 w-4" />;
      case 'user_activity':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'system':
        return <ServerIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'inventory':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'asset':
        return 'bg-orange-100 text-orange-800';
      case 'expiry':
        return 'bg-red-100 text-red-800';
      case 'user_activity':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(alert => alert.status === 'unread').length;
  const errorAlerts = alerts.filter(alert => alert.severity === 'error').length;
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning').length;
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length;

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
            <h1 className="page-title">All Alerts</h1>
            <p className="page-subtitle">View all system alerts in one place, Filter by type and status</p>
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
              <p className="text-sm font-medium text-gray-600">Error Alerts</p>
              <p className="text-2xl font-bold text-red-600">{errorAlerts}</p>
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
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
      >
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon(type)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{count}</p>
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
              <option value="inventory">Inventory</option>
              <option value="payment">Payment</option>
              <option value="asset">Asset</option>
              <option value="expiry">Expiry</option>
              <option value="user_activity">User Activity</option>
              <option value="system">System</option>
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
                  Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                      <div className="text-xs text-gray-500">{alert.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(alert.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                          {alert.type.replace('_', ' ').charAt(0).toUpperCase() + alert.type.replace('_', ' ').slice(1)}
                        </span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(alert.timestamp).toLocaleString()}</div>
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
                          onClick={() => handleDelete(alert._id, alert.source)}
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
              <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Title</p>
                <p className="text-sm text-gray-900">{selectedAlert.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Message</p>
                <p className="text-sm text-gray-900">{selectedAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedAlert.type)}
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
                <p className="text-sm font-medium text-gray-600 mb-2">Metadata</p>
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
                  onClick={() => handleDelete(selectedAlert._id, selectedAlert.source)}
                  className="btn btn-danger btn-sm"
                  disabled={deleteAlertMutation.isLoading}
                >
                  {deleteAlertMutation.isLoading ? 'Deleting...' : 'Delete Alert'}
                </button>
                {selectedAlert.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('resolved', 'Alert marked as resolved')}
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

export default AllAlerts;
