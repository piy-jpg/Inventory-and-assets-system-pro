import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CubeIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const InventoryAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const queryClient = useQueryClient();

  // Real-time inventory alerts data
  const { data: alertsData, isLoading, refetch } = useQuery(
    'inventoryAlerts',
    () => {
      const storedAlerts = localStorage.getItem('inventoryAlerts');
      if (storedAlerts) {
        return JSON.parse(storedAlerts);
      }
      
      return [
        {
          _id: 'INV_ALERT_001',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: 'Laptop Pro 15" is running low on stock (5 units remaining)',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-23T10:30:00Z',
          productId: 'PROD_001',
          productName: 'Laptop Pro 15"',
          location: 'Warehouse A',
          currentStock: 5,
          threshold: 10,
          unit: 'units',
          lastRestock: '2024-04-01',
          reorderLevel: 15,
          supplier: 'Tech Supplies Inc.',
          metadata: {
            sku: 'LP-15-001',
            category: 'Electronics',
            reorderQuantity: 20,
            leadTime: '7 days'
          }
        },
        {
          _id: 'INV_ALERT_002',
          type: 'out_of_stock',
          title: 'Out of Stock Alert',
          message: 'Wireless Mouse is completely out of stock',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-23T09:15:00Z',
          productId: 'PROD_002',
          productName: 'Wireless Mouse',
          location: 'Warehouse B',
          currentStock: 0,
          threshold: 5,
          unit: 'units',
          lastRestock: '2024-04-10',
          reorderLevel: 10,
          supplier: 'Gadget World',
          metadata: {
            sku: 'WM-001',
            category: 'Accessories',
            reorderQuantity: 25,
            leadTime: '5 days',
            backorders: 8
          }
        },
        {
          _id: 'INV_ALERT_003',
          type: 'overstock',
          title: 'Overstock Alert',
          message: 'USB-C Cables have exceeded maximum stock levels (500 units)',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-22T14:20:00Z',
          productId: 'PROD_003',
          productName: 'USB-C Cable',
          location: 'Warehouse C',
          currentStock: 500,
          threshold: 300,
          unit: 'units',
          lastRestock: '2024-04-15',
          reorderLevel: 100,
          supplier: 'Cable Masters',
          metadata: {
            sku: 'USB-C-001',
            category: 'Accessories',
            maxStock: 300,
            averageMonthlySales: 50,
            excessValue: 2500
          }
        },
        {
          _id: 'INV_ALERT_004',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: 'Office Chair Black is running low on stock (3 units remaining)',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-21T11:45:00Z',
          productId: 'PROD_004',
          productName: 'Office Chair Black',
          location: 'Warehouse A',
          currentStock: 3,
          threshold: 8,
          unit: 'units',
          lastRestock: '2024-03-28',
          reorderLevel: 12,
          supplier: 'Furniture Plus',
          metadata: {
            sku: 'OC-BLK-001',
            category: 'Furniture',
            reorderQuantity: 15,
            leadTime: '14 days'
          }
        },
        {
          _id: 'INV_ALERT_005',
          type: 'stock_movement',
          title: 'High Stock Movement Alert',
          message: 'Monitor Stand 24" has high movement rate (50 units sold in 24 hours)',
          severity: 'info',
          status: 'unread',
          timestamp: '2024-04-20T16:30:00Z',
          productId: 'PROD_005',
          productName: 'Monitor Stand 24"',
          location: 'Warehouse B',
          currentStock: 25,
          threshold: 30,
          unit: 'units',
          lastRestock: '2024-04-18',
          reorderLevel: 40,
          supplier: 'Display Solutions',
          metadata: {
            sku: 'MS-24-001',
            category: 'Accessories',
            dailyAverage: 10,
            movementRate: 500,
            trend: 'increasing'
          }
        },
        {
          _id: 'INV_ALERT_006',
          type: 'quality_issue',
          title: 'Quality Issue Alert',
          message: 'Batch of Keyboards has reported quality issues (10 defective units)',
          severity: 'error',
          status: 'resolved',
          timestamp: '2024-04-19T08:00:00Z',
          productId: 'PROD_006',
          productName: 'Mechanical Keyboard',
          location: 'Warehouse A',
          currentStock: 45,
          threshold: 20,
          unit: 'units',
          lastRestock: '2024-04-05',
          reorderLevel: 30,
          supplier: 'Input Devices Co.',
          metadata: {
            sku: 'KB-MECH-001',
            category: 'Electronics',
            batchId: 'BATCH-2024-04-001',
            defectiveCount: 10,
            qualityScore: 2.5,
            resolvedAt: '2024-04-19T15:30:00Z'
          }
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Inventory alerts data refreshed:', data);
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
      localStorage.setItem('inventoryAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('inventoryAlerts', updatedAlerts);
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
      localStorage.setItem('inventoryAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('inventoryAlerts', updatedAlerts);
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
    const matchesSearch = alert.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
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
    toast.success('Inventory alerts data refreshed');
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
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'overstock':
        return 'bg-orange-100 text-orange-800';
      case 'stock_movement':
        return 'bg-blue-100 text-blue-800';
      case 'quality_issue':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockLevelColor = (current, threshold) => {
    if (current === 0) return 'text-red-600';
    if (current <= threshold * 0.5) return 'text-orange-600';
    if (current <= threshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(alert => alert.status === 'unread').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'error').length;
  const outOfStockAlerts = alerts.filter(alert => alert.type === 'out_of_stock').length;
  const lowStockAlerts = alerts.filter(alert => alert.type === 'low_stock').length;

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
            <h1 className="page-title">Inventory Alerts</h1>
            <p className="page-subtitle">Low stock alerts, Out-of-stock warnings, Overstock notifications</p>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
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
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <CubeIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <CubeIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
      >
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ')}
                </p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CubeIcon className="h-4 w-4 text-blue-600" />
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
                placeholder="Search inventory alerts..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
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
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
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
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No inventory alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.productName}</div>
                      <div className="text-xs text-gray-500">SKU: {alert.metadata?.sku || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                        {alert.type.replace('_', ' ').charAt(0).toUpperCase() + alert.type.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {alert.currentStock} {alert.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Threshold: {alert.threshold} {alert.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.location}</div>
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
              <h3 className="text-lg font-semibold text-gray-900">Inventory Alert Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">Product Name</p>
                  <p className="text-sm text-gray-900">{selectedAlert.productName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">SKU</p>
                  <p className="text-sm text-gray-900">{selectedAlert.metadata?.sku || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Stock</p>
                  <p className={`text-sm font-medium ${getStockLevelColor(selectedAlert.currentStock, selectedAlert.threshold)}`}>
                    {selectedAlert.currentStock} {selectedAlert.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Threshold</p>
                  <p className="text-sm text-gray-900">{selectedAlert.threshold} {selectedAlert.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reorder Level</p>
                  <p className="text-sm text-gray-900">{selectedAlert.reorderLevel} {selectedAlert.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{selectedAlert.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Supplier</p>
                  <p className="text-sm text-gray-900">{selectedAlert.supplier}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Restock</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAlert.lastRestock).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Alert Message</p>
                <p className="text-sm text-gray-900">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert Type</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedAlert.type)}`}>
                    {selectedAlert.type.replace('_', ' ').charAt(0).toUpperCase() + selectedAlert.type.replace('_', ' ').slice(1)}
                  </span>
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
                      onClick={() => handleUpdateStatus('resolved', 'Inventory alert marked as resolved')}
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

export default InventoryAlerts;
