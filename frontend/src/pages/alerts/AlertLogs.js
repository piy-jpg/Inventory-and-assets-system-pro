import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  ServerIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AlertLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const queryClient = useQueryClient();

  // Real-time alert logs data
  const { data: logsData, isLoading, refetch } = useQuery(
    'alertLogs',
    () => {
      const storedLogs = localStorage.getItem('alertLogs');
      if (storedLogs) {
        return JSON.parse(storedLogs);
      }
      
      return [
        {
          _id: 'LOG_001',
          alertId: 'ALERT_001',
          type: 'inventory',
          title: 'Low Stock Alert',
          message: 'Laptop Pro 15" is running low on stock (5 units remaining)',
          severity: 'warning',
          status: 'resolved',
          timestamp: '2024-04-23T10:30:00Z',
          actionTaken: 'Restocked 20 units from supplier',
          resolvedAt: '2024-04-23T11:45:00Z',
          resolvedBy: 'john.smith@example.com',
          metadata: {
            productId: 'PROD_001',
            productName: 'Laptop Pro 15"',
            location: 'Warehouse A',
            currentStock: 25,
            threshold: 10,
            supplier: 'Tech Supplies Inc.'
          }
        },
        {
          _id: 'LOG_002',
          alertId: 'ALERT_002',
          type: 'payment',
          title: 'Overdue Payment Alert',
          message: 'Invoice INV-2024-001 from Tech Supplies Inc. is overdue by 7 days',
          severity: 'error',
          status: 'pending',
          timestamp: '2024-04-23T09:15:00Z',
          actionTaken: null,
          resolvedAt: null,
          resolvedBy: null,
          metadata: {
            invoiceId: 'INV_2024_001',
            supplierId: 'SUP_001',
            amount: 6249.85,
            dueDate: '2024-04-16',
            overdueDays: 7
          }
        },
        {
          _id: 'LOG_003',
          alertId: 'ALERT_003',
          type: 'asset',
          title: 'Maintenance Due Alert',
          message: 'Server Room AC Unit requires maintenance (last service: 2023-10-15)',
          severity: 'warning',
          status: 'resolved',
          timestamp: '2024-04-22T14:20:00Z',
          actionTaken: 'Scheduled maintenance for next week',
          resolvedAt: '2024-04-22T16:30:00Z',
          resolvedBy: 'sarah.johnson@example.com',
          metadata: {
            assetId: 'ASSET_001',
            assetName: 'Server Room AC Unit',
            location: 'Server Room',
            maintenanceType: 'routine',
            estimatedCost: 850
          }
        },
        {
          _id: 'LOG_004',
          alertId: 'ALERT_004',
          type: 'expiry',
          title: 'Product Expiry Alert',
          message: 'Batch of Medicine X expires in 15 days (50 units)',
          severity: 'warning',
          status: 'pending',
          timestamp: '2024-04-21T11:45:00Z',
          actionTaken: null,
          resolvedAt: null,
          resolvedBy: null,
          metadata: {
            batchId: 'BATCH_001',
            productId: 'PROD_045',
            productName: 'Medicine X',
            expiryDate: '2024-05-08',
            quantity: 50,
            daysToExpiry: 15
          }
        },
        {
          _id: 'LOG_005',
          alertId: 'ALERT_005',
          type: 'user_activity',
          title: 'Suspicious Login Attempt',
          message: 'Multiple failed login attempts for user john.smith@example.com',
          severity: 'error',
          status: 'resolved',
          timestamp: '2024-04-20T16:30:00Z',
          actionTaken: 'Account locked and user notified',
          resolvedAt: '2024-04-20T17:00:00Z',
          resolvedBy: 'admin@inventory.com',
          metadata: {
            userId: 'USR_001',
            email: 'john.smith@example.com',
            failedAttempts: 5,
            ipAddress: '192.168.1.100',
            accountLocked: true
          }
        },
        {
          _id: 'LOG_006',
          alertId: 'ALERT_006',
          type: 'system',
          title: 'Backup Failure Alert',
          message: 'Daily backup failed to complete successfully',
          severity: 'error',
          status: 'resolved',
          timestamp: '2024-04-19T08:00:00Z',
          actionTaken: 'Increased disk space and restarted backup',
          resolvedAt: '2024-04-19T10:30:00Z',
          resolvedBy: 'admin@inventory.com',
          metadata: {
            backupType: 'daily',
            failureReason: 'Insufficient disk space',
            scheduledTime: '2024-04-19T02:00:00Z',
            backupSize: '15.2 GB'
          }
        },
        {
          _id: 'LOG_007',
          alertId: 'ALERT_007',
          type: 'inventory',
          title: 'Out of Stock Alert',
          message: 'Wireless Mouse is completely out of stock',
          severity: 'error',
          status: 'pending',
          timestamp: '2024-04-18T13:15:00Z',
          actionTaken: null,
          resolvedAt: null,
          resolvedBy: null,
          metadata: {
            productId: 'PROD_002',
            productName: 'Wireless Mouse',
            location: 'Warehouse B',
            currentStock: 0,
            threshold: 5,
            backorders: 8
          }
        },
        {
          _id: 'LOG_008',
          alertId: 'ALERT_008',
          type: 'payment',
          title: 'Pending Payment Alert',
          message: '3 payments due this week totaling $12,456.78',
          severity: 'warning',
          status: 'resolved',
          timestamp: '2024-04-17T09:45:00Z',
          actionTaken: 'Processed 2 payments, 1 still pending',
          resolvedAt: '2024-04-18T14:20:00Z',
          resolvedBy: 'mike.wilson@example.com',
          metadata: {
            paymentCount: 3,
            totalAmount: 12456.78,
            dueDate: '2024-04-24',
            processedAmount: 8456.78
          }
        },
        {
          _id: 'LOG_009',
          alertId: 'ALERT_009',
          type: 'asset',
          title: 'Warranty Expiry Alert',
          message: 'Laptops batch warranty expires in 30 days',
          severity: 'warning',
          status: 'pending',
          timestamp: '2024-04-16T10:30:00Z',
          actionTaken: null,
          resolvedAt: null,
          resolvedBy: null,
          metadata: {
            assetCount: 25,
            warrantyExpiry: '2024-05-16',
            warrantyProvider: 'Tech Supplies Inc.',
            replacementValue: 75000
          }
        },
        {
          _id: 'LOG_010',
          alertId: 'ALERT_010',
          type: 'system',
          title: 'SSL Certificate Alert',
          message: 'SSL certificate expiring in 7 days',
          severity: 'warning',
          status: 'resolved',
          timestamp: '2024-04-15T08:15:00Z',
          actionTaken: 'Certificate renewed automatically',
          resolvedAt: '2024-04-15T09:30:00Z',
          resolvedBy: 'system',
          metadata: {
            domain: 'inventory.example.com',
            certificateIssuer: 'Let\'s Encrypt',
            expiryDate: '2024-04-22',
            autoRenewal: true
          }
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Alert logs data refreshed:', data);
      }
    }
  );

  const logs = logsData || [];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.actionTaken?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
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
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const openDetailsModal = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Alert logs data refreshed');
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'ignored':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getResolutionTime = (timestamp, resolvedAt) => {
    if (!resolvedAt) return null;
    const start = new Date(timestamp);
    const end = new Date(resolvedAt);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  // Calculate statistics
  const totalLogs = logs.length;
  const pendingLogs = logs.filter(log => log.status === 'pending').length;
  const resolvedLogs = logs.filter(log => log.status === 'resolved').length;
  const criticalLogs = logs.filter(log => log.severity === 'error').length;
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  // Type breakdown
  const typeBreakdown = logs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {});

  // Status breakdown
  const statusBreakdown = logs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
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
            <h1 className="page-title">Alert Logs</h1>
            <p className="page-subtitle">Past alerts, Timestamp, Action taken</p>
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
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingLogs}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedLogs}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{criticalLogs}</p>
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
              <p className="text-2xl font-bold text-blue-600">{todayLogs}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Type Distribution */}
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
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {Object.entries(statusBreakdown).map(([status, count]) => (
          <div key={status} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
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
                placeholder="Search alert logs..."
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
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
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
        transition={{ delay: 0.5 }}
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
                  Action Taken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolution Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No alert logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.title}</div>
                      <div className="text-xs text-gray-500">ID: {log.alertId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(log.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                          {log.type.replace('_', ' ').charAt(0).toUpperCase() + log.type.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status.replace('_', ' ').charAt(0).toUpperCase() + log.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.actionTaken || 'No action taken'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(log.timestamp).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getResolutionTime(log.timestamp, log.resolvedAt) || 'N/A'}
                      </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Alert Log Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">Alert Title</p>
                  <p className="text-sm text-gray-900">{selectedLog.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert ID</p>
                  <p className="text-sm text-gray-900">{selectedLog.alertId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert Type</p>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedLog.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedLog.type)}`}>
                      {selectedLog.type.replace('_', ' ').charAt(0).toUpperCase() + selectedLog.type.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Severity</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedLog.severity)}`}>
                    {selectedLog.severity.charAt(0).toUpperCase() + selectedLog.severity.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status.replace('_', ' ').charAt(0).toUpperCase() + selectedLog.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Timestamp</p>
                  <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                {selectedLog.resolvedAt && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved At</p>
                      <p className="text-sm text-gray-900">{new Date(selectedLog.resolvedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved By</p>
                      <p className="text-sm text-gray-900">{selectedLog.resolvedBy}</p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Alert Message</p>
                <p className="text-sm text-gray-900">{selectedLog.message}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Action Taken</p>
                <p className="text-sm text-gray-900">{selectedLog.actionTaken || 'No action taken'}</p>
              </div>

              {getResolutionTime(selectedLog.timestamp, selectedLog.resolvedAt) && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Time</p>
                  <p className="text-sm text-gray-900">{getResolutionTime(selectedLog.timestamp, selectedLog.resolvedAt)}</p>
                </div>
              )}
            </div>

            {selectedLog.metadata && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Alert Metadata</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

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

export default AlertLogs;
