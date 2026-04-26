import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SupplierPayments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
    status: 'completed'
  });

  const canManagePayments = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeletePayments = ['admin', 'manager'].includes(user?.role);

  const queryClient = useQueryClient();

  // Real-time supplier payments data
  const { data: paymentsData, isLoading, refetch } = useQuery(
    'supplierPayments',
    () => {
      const storedPayments = localStorage.getItem('supplierPayments');
      if (storedPayments) {
        return JSON.parse(storedPayments);
      }
      
      return [
        {
          _id: 'PAY_001',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          amount: 6249.85,
          paymentMethod: 'bank_transfer',
          paymentDate: '2024-04-23',
          referenceNumber: 'TXN_001234567',
          status: 'completed',
          notes: 'Payment for PO-2024-001',
          processedBy: 'John Smith',
          createdAt: '2024-04-23T10:30:00Z',
          updatedAt: '2024-04-23T10:30:00Z'
        },
        {
          _id: 'PAY_002',
          supplierId: 'SUP_002',
          supplierName: 'Office Furniture Co.',
          amount: 1169.97,
          paymentMethod: 'credit_card',
          paymentDate: '2024-04-20',
          referenceNumber: 'TXN_001234568',
          status: 'completed',
          notes: 'Payment for PO-2024-002',
          processedBy: 'Sarah Johnson',
          createdAt: '2024-04-20T14:15:00Z',
          updatedAt: '2024-04-20T14:15:00Z'
        },
        {
          _id: 'PAY_003',
          supplierId: 'SUP_003',
          supplierName: 'Stationery World',
          amount: 559.30,
          paymentMethod: 'upi',
          paymentDate: '2024-04-22',
          referenceNumber: 'TXN_001234569',
          status: 'completed',
          notes: 'Partial payment for PO-2024-003',
          processedBy: 'Mike Wilson',
          createdAt: '2024-04-22T09:45:00Z',
          updatedAt: '2024-04-22T09:45:00Z'
        },
        {
          _id: 'PAY_004',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          amount: 1799.98,
          paymentMethod: 'cash',
          paymentDate: '2024-04-24',
          referenceNumber: 'TXN_001234570',
          status: 'pending',
          notes: 'Payment for PO-2024-004',
          processedBy: 'John Smith',
          createdAt: '2024-04-24T11:20:00Z',
          updatedAt: '2024-04-24T11:20:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Supplier payments data refreshed:', data);
      }
    }
  );

  // Get suppliers data for dropdown
  const { data: suppliersData } = useQuery(
    'suppliers',
    () => {
      const storedSuppliers = localStorage.getItem('suppliers');
      return storedSuppliers ? JSON.parse(storedSuppliers) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Mutation for recording payment
  const recordPaymentMutation = useMutation(
    async (paymentData) => {
      const payments = paymentsData || [];
      const newPayment = {
        ...paymentData,
        _id: `PAY_${Date.now()}`,
        referenceNumber: paymentData.referenceNumber || `TXN_${Date.now()}`,
        supplierName: suppliersData.find(s => s._id === paymentData.supplierId)?.name || 'Unknown Supplier',
        processedBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedPayments = [...payments, newPayment];
      localStorage.setItem('supplierPayments', JSON.stringify(updatedPayments));
      queryClient.setQueryData('supplierPayments', updatedPayments);
      
      // Real-time logging
      const logEntry = {
        action: 'record_payment',
        paymentId: newPayment._id,
        supplierId: paymentData.supplierId,
        amount: paymentData.amount,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierPaymentLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierPaymentLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierPaymentRecorded', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierPaymentsActivityUpdate', { detail: logEntry }));
      
      console.log('💰 Real-time: Supplier payment recorded', logEntry);
      
      return newPayment;
    },
    {
      onSuccess: () => {
        toast.success('Payment recorded successfully');
        setShowPaymentModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to record payment');
      }
    }
  );

  // Mutation for updating payment status
  const updatePaymentStatusMutation = useMutation(
    async ({ paymentId, status }) => {
      const payments = paymentsData || [];
      const updatedPayments = payments.map(payment => 
        payment._id === paymentId ? {
          ...payment,
          status,
          updatedAt: new Date().toISOString()
        } : payment
      );
      localStorage.setItem('supplierPayments', JSON.stringify(updatedPayments));
      queryClient.setQueryData('supplierPayments', updatedPayments);
      
      // Real-time logging
      const logEntry = {
        action: 'update_payment_status',
        paymentId,
        status,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierPaymentLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierPaymentLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierPaymentStatusUpdated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierPaymentsActivityUpdate', { detail: logEntry }));
      
      console.log('🔄 Real-time: Supplier payment status updated', logEntry);
      
      return updatedPayments;
    },
    {
      onSuccess: () => {
        toast.success('Payment status updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update payment status');
      }
    }
  );

  const payments = paymentsData || [];
  const suppliers = suppliersData || [];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    const matchesSupplier = filterSupplier === 'all' || payment.supplierId === filterSupplier;
    
    return matchesSearch && matchesStatus && matchesMethod && matchesSupplier;
  });

  const resetForm = () => {
    setFormData({
      supplierId: '',
      amount: 0,
      paymentMethod: 'bank_transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: '',
      status: 'completed'
    });
  };

  const openDetailsModal = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const openPaymentModal = () => {
    resetForm();
    setShowPaymentModal(true);
  };

  const handleRecordPayment = () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!formData.paymentDate) {
      toast.error('Payment date is required');
      return;
    }

    recordPaymentMutation.mutate(formData);
  };

  const handleUpdateStatus = (status) => {
    if (!selectedPayment) return;

    updatePaymentStatusMutation.mutate({
      paymentId: selectedPayment._id,
      status
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Supplier payments data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'credit_card':
        return 'bg-blue-100 text-blue-800';
      case 'debit_card':
        return 'bg-purple-100 text-purple-800';
      case 'upi':
        return 'bg-orange-100 text-orange-800';
      case 'bank_transfer':
        return 'bg-gray-100 text-gray-800';
      case 'check':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'credit_card':
      case 'debit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'upi':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'bank_transfer':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'check':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const completedPayments = payments.filter(payment => payment.status === 'completed').length;
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedAmount = payments.filter(payment => payment.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const todayPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate).toDateString();
    const today = new Date().toDateString();
    return paymentDate === today;
  }).length;

  // Payment method breakdown
  const methodBreakdown = payments.reduce((acc, payment) => {
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
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
            <h1 className="page-title">Supplier Payments</h1>
            <p className="page-subtitle">Record payments made, Payment methods (UPI, bank, cash), Payment history</p>
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
            <button 
              onClick={openPaymentModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Record Payment</span>
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
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedPayments}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Method Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {Object.entries(methodBreakdown).map(([method, count]) => (
          <div key={method} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getMethodIcon(method)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(method)}`}>
                  {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
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
                placeholder="Search payments..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              className="input"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
            </select>
            
            <select
              className="input"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Payments Table */}
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
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.referenceNumber}</div>
                      <div className="text-xs text-gray-500">Processed by: {payment.processedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.supplierName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(payment.paymentMethod)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(payment.paymentMethod)}`}>
                          {payment.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + payment.paymentMethod.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.paymentDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(payment)}
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

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleRecordPayment();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    className="input"
                    placeholder="Transaction reference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this payment"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={recordPaymentMutation.isLoading}
                >
                  {recordPaymentMutation.isLoading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
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
              <h3 className="text-lg font-semibold text-gray-900">Payment Details - {selectedPayment.referenceNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Reference Number</p>
                <p className="text-sm text-gray-900">{selectedPayment.referenceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedPayment.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-sm font-medium text-gray-900">${selectedPayment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <div className="flex items-center space-x-2">
                  {getMethodIcon(selectedPayment.paymentMethod)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(selectedPayment.paymentMethod)}`}>
                    {selectedPayment.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + selectedPayment.paymentMethod.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Date</p>
                <p className="text-sm text-gray-900">{selectedPayment.paymentDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processed By</p>
                <p className="text-sm text-gray-900">{selectedPayment.processedBy}</p>
              </div>
            </div>

            {selectedPayment.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedPayment.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedPayment.createdAt).toLocaleString()}
                {selectedPayment.updatedAt !== selectedPayment.createdAt && (
                  <span> | Updated: {new Date(selectedPayment.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                {selectedPayment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('completed')}
                      className="btn btn-primary btn-sm"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('failed')}
                      className="btn btn-outline btn-sm"
                    >
                      Mark Failed
                    </button>
                  </>
                )}
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

export default SupplierPayments;
