import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  BanknotesIcon,
  CalendarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const PaymentAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const queryClient = useQueryClient();

  // Real-time payment alerts data
  const { data: alertsData, isLoading, refetch } = useQuery(
    'paymentAlerts',
    () => {
      const storedAlerts = localStorage.getItem('paymentAlerts');
      if (storedAlerts) {
        return JSON.parse(storedAlerts);
      }
      
      return [
        {
          _id: 'PAY_ALERT_001',
          type: 'overdue_payment',
          title: 'Overdue Payment Alert',
          message: 'Invoice INV-2024-001 from Tech Supplies Inc. is overdue by 7 days',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-23T10:30:00Z',
          invoiceId: 'INV_2024_001',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          amount: 6249.85,
          dueDate: '2024-04-16',
          overdueDays: 7,
          paymentMethod: 'bank_transfer',
          metadata: {
            invoiceNumber: 'INV-2024-001',
            purchaseOrder: 'PO-2024-015',
            category: 'Electronics',
            lateFee: 62.50,
            contactPerson: 'John Smith',
            email: 'john.smith@techsupplies.com'
          }
        },
        {
          _id: 'PAY_ALERT_002',
          type: 'pending_payment',
          title: 'Pending Payment Alert',
          message: '3 payments due this week totaling $12,456.78',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-23T09:15:00Z',
          invoiceId: 'MULTIPLE',
          supplierId: 'MULTIPLE',
          supplierName: 'Multiple Suppliers',
          amount: 12456.78,
          dueDate: '2024-04-24',
          overdueDays: 0,
          paymentMethod: 'mixed',
          metadata: {
            paymentCount: 3,
            suppliers: ['Tech Supplies Inc.', 'Gadget World', 'Furniture Plus'],
            categories: ['Electronics', 'Accessories', 'Furniture'],
            urgency: 'high'
          }
        },
        {
          _id: 'PAY_ALERT_003',
          type: 'supplier_dues',
          title: 'Supplier Dues Reminder',
          message: 'Stationery World has outstanding dues of $3,245.67',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-22T14:20:00Z',
          invoiceId: 'INV_2024_034',
          supplierId: 'SUP_003',
          supplierName: 'Stationery World',
          amount: 3245.67,
          dueDate: '2024-04-20',
          overdueDays: 3,
          paymentMethod: 'upi',
          metadata: {
            invoiceNumber: 'INV-2024-034',
            purchaseOrder: 'PO-2024-028',
            category: 'Stationery',
            creditLimit: 5000,
            creditUsed: 3245.67,
            contactPerson: 'Sarah Johnson',
            email: 'sarah@stationeryworld.com'
          }
        },
        {
          _id: 'PAY_ALERT_004',
          type: 'payment_failed',
          title: 'Payment Failed Alert',
          message: 'Payment attempt failed for invoice INV-2024-022',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-21T11:45:00Z',
          invoiceId: 'INV_2024_022',
          supplierId: 'SUP_002',
          supplierName: 'Gadget World',
          amount: 1876.43,
          dueDate: '2024-04-18',
          overdueDays: 3,
          paymentMethod: 'credit_card',
          metadata: {
            invoiceNumber: 'INV-2024-022',
            purchaseOrder: 'PO-2024-019',
            category: 'Accessories',
            failureReason: 'Insufficient funds',
            retryAttempts: 2,
            nextRetryDate: '2024-04-22'
          }
        },
        {
          _id: 'PAY_ALERT_005',
          type: 'upcoming_payment',
          title: 'Upcoming Payment Reminder',
          message: 'Payment of $4,567.89 due to Cable Masters in 3 days',
          severity: 'info',
          status: 'read',
          timestamp: '2024-04-20T16:30:00Z',
          invoiceId: 'INV_2024_041',
          supplierId: 'SUP_004',
          supplierName: 'Cable Masters',
          amount: 4567.89,
          dueDate: '2024-04-25',
          overdueDays: -2,
          paymentMethod: 'bank_transfer',
          metadata: {
            invoiceNumber: 'INV-2024-041',
            purchaseOrder: 'PO-2024-032',
            category: 'Accessories',
            autoPayment: true,
            bankAccount: '****1234'
          }
        },
        {
          _id: 'PAY_ALERT_006',
          type: 'credit_limit',
          title: 'Credit Limit Alert',
          message: 'Tech Supplies Inc. has used 85% of credit limit',
          severity: 'warning',
          status: 'resolved',
          timestamp: '2024-04-19T08:00:00Z',
          invoiceId: 'CREDIT_ALERT',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          amount: 85000,
          dueDate: null,
          overdueDays: 0,
          paymentMethod: 'credit',
          metadata: {
            creditLimit: 100000,
            creditUsed: 85000,
            creditAvailable: 15000,
            utilizationRate: 85,
            resolvedAt: '2024-04-19T15:30:00Z'
          }
        },
        {
          _id: 'PAY_ALERT_007',
          type: 'payment_dispute',
          title: 'Payment Dispute Alert',
          message: 'Payment dispute raised for invoice INV-2024-018',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-18T13:15:00Z',
          invoiceId: 'INV_2024_018',
          supplierId: 'SUP_005',
          supplierName: 'Display Solutions',
          amount: 2345.67,
          dueDate: '2024-04-15',
          overdueDays: 3,
          paymentMethod: 'bank_transfer',
          metadata: {
            invoiceNumber: 'INV-2024-018',
            disputeReason: 'Goods not delivered as specified',
            disputeDate: '2024-04-18',
            status: 'under_review',
            caseId: 'DISPUTE-2024-001'
          }
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Payment alerts data refreshed:', data);
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
      localStorage.setItem('paymentAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('paymentAlerts', updatedAlerts);
      queryClient.invalidateQueries('all-alerts-aggregated');
      
      // Sync with DuePayments - if alert is resolved, mark corresponding payment as paid
      if (status === 'resolved') {
        const alert = alerts.find(a => a._id === alertId);
        if (alert && alert.invoiceId) {
          const duePayments = JSON.parse(localStorage.getItem('duePayments') || '[]');
          const updatedPayments = duePayments.map(p => 
            p._id === alert.invoiceId || p._id === alert.invoiceId.replace('PAY_DUE_', '') 
              ? { ...p, status: 'paid' } 
              : p
          );
          localStorage.setItem('duePayments', JSON.stringify(updatedPayments));
          queryClient.invalidateQueries('all-due-payments');
        }
      }
      
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
      const alert = alerts.find(a => a._id === alertId);
      const updatedAlerts = alerts.filter(alert => alert._id !== alertId);
      localStorage.setItem('paymentAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('paymentAlerts', updatedAlerts);
      queryClient.invalidateQueries('all-alerts-aggregated');
      
      // Sync with DuePayments - if alert is deleted, mark corresponding payment as paid
      if (alert && alert.invoiceId) {
        const duePayments = JSON.parse(localStorage.getItem('duePayments') || '[]');
        const updatedPayments = duePayments.map(p => 
          p._id === alert.invoiceId || p._id === alert.invoiceId.replace('PAY_DUE_', '') 
            ? { ...p, status: 'paid' } 
            : p
        );
        localStorage.setItem('duePayments', JSON.stringify(updatedPayments));
        queryClient.invalidateQueries('all-due-payments');
      }
      
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
    const matchesSearch = alert.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase());
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
    toast.success('Payment alerts data refreshed');
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
      case 'overdue_payment':
        return 'bg-red-100 text-red-800';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'supplier_dues':
        return 'bg-orange-100 text-orange-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      case 'upcoming_payment':
        return 'bg-blue-100 text-blue-800';
      case 'credit_limit':
        return 'bg-purple-100 text-purple-800';
      case 'payment_dispute':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'bank_transfer':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'upi':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  const getAmountColor = (overdueDays) => {
    if (overdueDays > 7) return 'text-red-600';
    if (overdueDays > 0) return 'text-orange-600';
    if (overdueDays < 0) return 'text-blue-600';
    return 'text-gray-600';
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(alert => alert.status === 'unread').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'error').length;
  const overdueAlerts = alerts.filter(alert => alert.type === 'overdue_payment').length;
  const totalOverdueAmount = alerts
    .filter(alert => alert.type === 'overdue_payment')
    .reduce((sum, alert) => sum + alert.amount, 0);

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
            <h1 className="page-title">Payment Alerts</h1>
            <p className="page-subtitle">Pending payments, Overdue invoices, Supplier dues reminders</p>
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
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">${totalOverdueAmount.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-red-600" />
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
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ')}
                </p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
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
                placeholder="Search payment alerts..."
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
              <option value="overdue_payment">Overdue Payment</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="supplier_dues">Supplier Dues</option>
              <option value="payment_failed">Payment Failed</option>
              <option value="upcoming_payment">Upcoming Payment</option>
              <option value="credit_limit">Credit Limit</option>
              <option value="payment_dispute">Payment Dispute</option>
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
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
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
                    No payment alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.supplierName}</div>
                      <div className="text-xs text-gray-500">ID: {alert.supplierId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                        {alert.type.replace('_', ' ').charAt(0).toUpperCase() + alert.type.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getAmountColor(alert.overdueDays)}`}>
                        ${alert.amount.toLocaleString()}
                      </div>
                      {alert.overdueDays > 0 && (
                        <div className="text-xs text-red-500">
                          {alert.overdueDays} days overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {alert.dueDate ? new Date(alert.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(alert.paymentMethod)}
                        <span className="text-sm text-gray-900 capitalize">
                          {alert.paymentMethod.replace('_', ' ')}
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
              <h3 className="text-lg font-semibold text-gray-900">Payment Alert Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">Supplier Name</p>
                  <p className="text-sm text-gray-900">{selectedAlert.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Supplier ID</p>
                  <p className="text-sm text-gray-900">{selectedAlert.supplierId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Invoice ID</p>
                  <p className="text-sm text-gray-900">{selectedAlert.invoiceId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <p className={`text-sm font-medium ${getAmountColor(selectedAlert.overdueDays)}`}>
                    ${selectedAlert.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Date</p>
                  <p className="text-sm text-gray-900">
                    {selectedAlert.dueDate ? new Date(selectedAlert.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(selectedAlert.paymentMethod)}
                    <span className="text-sm text-gray-900 capitalize">
                      {selectedAlert.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
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
                      onClick={() => handleUpdateStatus('resolved', 'Payment alert marked as resolved')}
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

export default PaymentAlerts;
