import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const ExpiryAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const queryClient = useQueryClient();

  // Real-time expiry alerts data
  const { data: alertsData, isLoading, refetch } = useQuery(
    'expiryAlerts',
    () => {
      const storedAlerts = localStorage.getItem('expiryAlerts');
      if (storedAlerts) {
        return JSON.parse(storedAlerts);
      }
      
      return [
        {
          _id: 'EXP_ALERT_001',
          type: 'product_expiry',
          title: 'Product Expiry Alert',
          message: 'Batch of Medicine X expires in 15 days (50 units)',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-23T10:30:00Z',
          productId: 'PROD_045',
          productName: 'Medicine X',
          batchId: 'BATCH_001',
          quantity: 50,
          expiryDate: '2024-05-08',
          daysToExpiry: 15,
          category: 'Pharmaceuticals',
          location: 'Warehouse A',
          value: 2500,
          metadata: {
            sku: 'MED-X-001',
            batchNumber: 'BATCH-2024-001',
            manufactureDate: '2023-05-08',
            storageConditions: 'Room Temperature',
            regulatoryCompliance: 'FDA Approved',
            disposalMethod: 'Incineration'
          }
        },
        {
          _id: 'EXP_ALERT_002',
          type: 'batch_expiry',
          title: 'Batch Expiry Alert',
          message: 'Food Products batch expires in 7 days (100 units)',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-23T09:15:00Z',
          productId: 'PROD_078',
          productName: 'Organic Honey',
          batchId: 'BATCH_003',
          quantity: 100,
          expiryDate: '2024-04-30',
          daysToExpiry: 7,
          category: 'Food & Beverages',
          location: 'Warehouse B',
          value: 1500,
          metadata: {
            sku: 'HNY-ORG-001',
            batchNumber: 'BATCH-2024-003',
            manufactureDate: '2023-10-30',
            storageConditions: 'Cool Dry Place',
            regulatoryCompliance: 'FSSAI Certified',
            shelfLife: '18 months'
          }
        },
        {
          _id: 'EXP_ALERT_003',
          type: 'near_expiry',
          title: 'Near-Expiry Warning',
          message: 'Cosmetics batch expires in 30 days (25 units)',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-22T14:20:00Z',
          productId: 'PROD_023',
          productName: 'Face Cream Premium',
          batchId: 'BATCH_005',
          quantity: 25,
          expiryDate: '2024-05-23',
          daysToExpiry: 30,
          category: 'Cosmetics',
          location: 'Warehouse C',
          value: 1250,
          metadata: {
            sku: 'FC-001',
            batchNumber: 'BATCH-2024-005',
            manufactureDate: '2022-05-23',
            storageConditions: 'Cool Place',
            regulatoryCompliance: 'ISO Certified',
            ingredients: 'Natural Ingredients'
          }
        },
        {
          _id: 'EXP_ALERT_004',
          type: 'expired',
          title: 'Expired Product Alert',
          message: 'Cleaning Supplies batch expired 5 days ago (30 units)',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-21T11:45:00Z',
          productId: 'PROD_089',
          productName: 'All-Purpose Cleaner',
          batchId: 'BATCH_007',
          quantity: 30,
          expiryDate: '2024-04-18',
          daysToExpiry: -5,
          category: 'Cleaning Supplies',
          location: 'Warehouse A',
          value: 300,
          metadata: {
            sku: 'CLN-001',
            batchNumber: 'BATCH-2024-007',
            manufactureDate: '2022-04-18',
            storageConditions: 'Room Temperature',
            regulatoryCompliance: 'EPA Approved',
            hazardous: false
          }
        },
        {
          _id: 'EXP_ALERT_005',
          type: 'product_expiry',
          title: 'Product Expiry Alert',
          message: 'Vitamin Supplements expire in 20 days (75 units)',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-20T16:30:00Z',
          productId: 'PROD_034',
          productName: 'Vitamin C 1000mg',
          batchId: 'BATCH_009',
          quantity: 75,
          expiryDate: '2024-05-13',
          daysToExpiry: 20,
          category: 'Health Supplements',
          location: 'Warehouse B',
          value: 1125,
          metadata: {
            sku: 'VIT-C-001',
            batchNumber: 'BATCH-2024-009',
            manufactureDate: '2023-05-13',
            storageConditions: 'Cool Dry Place',
            regulatoryCompliance: 'GMP Certified',
            dosage: '1000mg'
          }
        },
        {
          _id: 'EXP_ALERT_006',
          type: 'critical_expiry',
          title: 'Critical Expiry Alert',
          message: 'Emergency Medical Supplies expire in 3 days (10 units)',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-19T08:00:00Z',
          productId: 'PROD_099',
          productName: 'Emergency First Aid Kit',
          batchId: 'BATCH_011',
          quantity: 10,
          expiryDate: '2024-04-26',
          daysToExpiry: 3,
          category: 'Medical Supplies',
          location: 'Medical Room',
          value: 500,
          metadata: {
            sku: 'FAK-001',
            batchNumber: 'BATCH-2024-011',
            manufactureDate: '2023-04-26',
            storageConditions: 'Room Temperature',
            regulatoryCompliance: 'WHO Approved',
            criticalItem: true,
            replacementRequired: true
          }
        },
        {
          _id: 'EXP_ALERT_007',
          type: 'batch_expiry',
          title: 'Batch Expiry Alert',
          message: 'Dairy Products batch expires in 2 days (20 units)',
          severity: 'error',
          status: 'resolved',
          timestamp: '2024-04-18T13:15:00Z',
          productId: 'PROD_067',
          productName: 'Organic Milk',
          batchId: 'BATCH_013',
          quantity: 20,
          expiryDate: '2024-04-25',
          daysToExpiry: 2,
          category: 'Dairy Products',
          location: 'Cold Storage',
          value: 80,
          metadata: {
            sku: 'MLK-ORG-001',
            batchNumber: 'BATCH-2024-013',
            manufactureDate: '2024-04-18',
            storageConditions: 'Refrigerated (2-4°C)',
            regulatoryCompliance: 'FSSAI Certified',
            resolvedAt: '2024-04-18T15:30:00Z',
            actionTaken: 'Products transferred to discount section'
          }
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Expiry alerts data refreshed:', data);
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
      localStorage.setItem('expiryAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('expiryAlerts', updatedAlerts);
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
      localStorage.setItem('expiryAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('expiryAlerts', updatedAlerts);
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
                        alert.batchId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
    toast.success('Expiry alerts data refreshed');
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
      case 'product_expiry':
        return 'bg-yellow-100 text-yellow-800';
      case 'batch_expiry':
        return 'bg-orange-100 text-orange-800';
      case 'near_expiry':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'critical_expiry':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryColor = (daysToExpiry) => {
    if (daysToExpiry < 0) return 'text-red-600';
    if (daysToExpiry <= 7) return 'text-red-600';
    if (daysToExpiry <= 15) return 'text-orange-600';
    if (daysToExpiry <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getExpiryIcon = (type) => {
    switch (type) {
      case 'product_expiry':
      case 'batch_expiry':
        return <CalendarIcon className="h-4 w-4" />;
      case 'near_expiry':
        return <ClockIcon className="h-4 w-4" />;
      case 'expired':
      case 'critical_expiry':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(alert => alert.status === 'unread').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'error').length;
  const expiredAlerts = alerts.filter(alert => alert.daysToExpiry < 0).length;
  const nearExpiryAlerts = alerts.filter(alert => alert.daysToExpiry > 0 && alert.daysToExpiry <= 15).length;
  const totalValue = alerts
    .filter(alert => alert.status !== 'resolved')
    .reduce((sum, alert) => sum + alert.value, 0);

  // Alert type breakdown
  const typeBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});

  // Category breakdown
  const categoryBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.category] = (acc[alert.category] || 0) + 1;
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
            <h1 className="page-title">Expiry Alerts</h1>
            <p className="page-subtitle">Product expiry dates, Batch expiry tracking, Near-expiry warnings</p>
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
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{expiredAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-orange-600">${totalValue.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-orange-600" />
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
              <div className="flex items-center space-x-2">
                {getExpiryIcon(type)}
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

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6"
      >
        {Object.entries(categoryBreakdown).map(([category, count]) => (
          <div key={category} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{category}</p>
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
        transition={{ delay: 0.4 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search expiry alerts..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Pharmaceuticals">Pharmaceuticals</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Cosmetics">Cosmetics</option>
              <option value="Cleaning Supplies">Cleaning Supplies</option>
              <option value="Health Supplements">Health Supplements</option>
              <option value="Medical Supplies">Medical Supplies</option>
              <option value="Dairy Products">Dairy Products</option>
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
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days to Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
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
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                    No expiry alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.productName}</div>
                      <div className="text-xs text-gray-500">{alert.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.batchId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.quantity} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(alert.expiryDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getExpiryColor(alert.daysToExpiry)}`}>
                        {alert.daysToExpiry > 0 ? `${alert.daysToExpiry} days` : `${Math.abs(alert.daysToExpiry)} days ago`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${alert.value.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getExpiryIcon(alert.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </span>
                      </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Expiry Alert Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">Product ID</p>
                  <p className="text-sm text-gray-900">{selectedAlert.productId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Batch ID</p>
                  <p className="text-sm text-gray-900">{selectedAlert.batchId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <p className="text-sm text-gray-900">{selectedAlert.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantity</p>
                  <p className="text-sm text-gray-900">{selectedAlert.quantity} units</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{selectedAlert.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAlert.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Days to Expiry</p>
                  <p className={`text-sm font-medium ${getExpiryColor(selectedAlert.daysToExpiry)}`}>
                    {selectedAlert.daysToExpiry > 0 ? `${selectedAlert.daysToExpiry} days` : `${Math.abs(selectedAlert.daysToExpiry)} days ago`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Value</p>
                  <p className="text-sm text-gray-900">${selectedAlert.value.toLocaleString()}</p>
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
                    {getExpiryIcon(selectedAlert.type)}
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
                      onClick={() => handleUpdateStatus('resolved', 'Expiry alert marked as resolved')}
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

export default ExpiryAlerts;
