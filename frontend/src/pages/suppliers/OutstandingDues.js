import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PlusIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const OutstandingDues = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDue, setSelectedDue] = useState(null);
  const [formData, setFormData] = useState({
    dueId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time outstanding dues data
  const { data: duesData, isLoading, refetch } = useQuery(
    'outstandingDues',
    () => {
      const storedDues = localStorage.getItem('outstandingDues');
      if (storedDues) {
        return JSON.parse(storedDues);
      }
      
      // Combine data from purchase orders and supplier payments
      const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
      const supplierPayments = JSON.parse(localStorage.getItem('supplierPayments') || '[]');
      const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
      
      const outstandingDues = purchaseOrders
        .filter(order => order.status !== 'received' && order.status !== 'cancelled')
        .map(order => {
          const supplier = suppliers.find(s => s._id === order.supplierId);
          const totalPaid = supplierPayments
            .filter(payment => payment.supplierId === order.supplierId && payment.status === 'completed')
            .reduce((sum, payment) => sum + payment.amount, 0);
          
          const amountDue = order.totalAmount - totalPaid;
          const daysOverdue = Math.max(0, Math.floor((new Date() - new Date(order.expectedDeliveryDate)) / (1000 * 60 * 60 * 24)));
          
          return {
            _id: `DUE_${order._id}`,
            orderId: order._id,
            orderNumber: order.orderNumber,
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            totalAmount: order.totalAmount,
            amountPaid: totalPaid,
            amountDue: Math.max(0, amountDue),
            dueDate: order.expectedDeliveryDate,
            daysOverdue: daysOverdue,
            status: daysOverdue > 0 ? 'overdue' : 'pending',
            priority: daysOverdue > 30 ? 'high' : daysOverdue > 14 ? 'medium' : 'low',
            orderStatus: order.status,
            notes: order.notes,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          };
        });

      return outstandingDues.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.daysOverdue - a.daysOverdue;
      });
    },
    {
      refetchInterval: 12000, // Real-time refresh every 12 seconds
      onSuccess: (data) => {
        console.log('Outstanding dues data refreshed:', data);
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
      // Create payment record
      const payments = JSON.parse(localStorage.getItem('supplierPayments') || '[]');
      const newPayment = {
        _id: `PAY_${Date.now()}`,
        supplierId: paymentData.supplierId,
        supplierName: suppliersData.find(s => s._id === paymentData.supplierId)?.name || 'Unknown Supplier',
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate,
        referenceNumber: `TXN_${Date.now()}`,
        notes: paymentData.notes,
        status: 'completed',
        processedBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedPayments = [...payments, newPayment];
      localStorage.setItem('supplierPayments', JSON.stringify(updatedPayments));
      queryClient.setQueryData('supplierPayments', updatedPayments);
      
      // Trigger refetch of outstanding dues
      queryClient.invalidateQueries('outstandingDues');
      
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

  const dues = duesData || [];
  const suppliers = suppliersData || [];

  const filteredDues = dues.filter(due => {
    const matchesSearch = due.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        due.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || due.status === filterStatus;
    const matchesSupplier = filterSupplier === 'all' || due.supplierId === filterSupplier;
    const matchesPriority = filterPriority === 'all' || due.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesPriority;
  });

  const resetForm = () => {
    setFormData({
      dueId: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      notes: ''
    });
  };

  const openDetailsModal = (due) => {
    setSelectedDue(due);
    setShowDetailsModal(true);
  };

  const openPaymentModal = (due) => {
    setSelectedDue(due);
    setFormData(prev => ({
      ...prev,
      dueId: due._id,
      supplierId: due.supplierId,
      amount: due.amountDue,
      paymentDate: new Date().toISOString().split('T')[0]
    }));
    setShowPaymentModal(true);
  };

  const handleRecordPayment = () => {
    if (!formData.dueId) {
      toast.error('Due ID is required');
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

  const handleRefresh = () => {
    refetch();
    toast.success('Outstanding dues data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalDues = dues.length;
  const overdueDues = dues.filter(due => due.status === 'overdue').length;
  const pendingDues = dues.filter(due => due.status === 'pending').length;
  const totalAmountDue = dues.reduce((sum, due) => sum + (due.amountDue || 0), 0);
  const overdueAmount = dues.filter(due => due.status === 'overdue').reduce((sum, due) => sum + (due.amountDue || 0), 0);
  const highPriorityDues = dues.filter(due => due.priority === 'high').length;

  // Get unique suppliers
  const uniqueSuppliers = [...new Set(dues.map(due => due.supplierId))];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Outstanding Dues</h1>
            <p className="page-subtitle">Pending payments to suppliers, Overdue alerts, Credit tracking</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
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
              <p className="text-sm font-medium text-gray-600">Total Dues</p>
              <p className="text-2xl font-bold text-gray-900">{totalDues}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueDues}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount Due</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmountDue.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{highPriorityDues}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Priority Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-xl font-bold text-red-600">
                {dues.filter(due => due.priority === 'high').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Priority</p>
              <p className="text-xl font-bold text-orange-600">
                {dues.filter(due => due.priority === 'medium').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Priority</p>
              <p className="text-xl font-bold text-green-600">
                {dues.filter(due => due.priority === 'low').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
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
                placeholder="Search dues..."
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
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
            
            <select
              className="input"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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

      {/* Dues Table */}
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
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
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
              {filteredDues.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No outstanding dues found
                  </td>
                </tr>
              ) : (
                filteredDues.map((due) => (
                  <tr key={due._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{due.orderNumber}</div>
                      <div className="text-xs text-gray-500">Order Status: {due.orderStatus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{due.supplierName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${(due.amountDue || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Total: ${(due.totalAmount || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Paid: ${(due.amountPaid || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{due.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${due.daysOverdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {due.daysOverdue > 0 ? `${due.daysOverdue} days` : 'On time'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(due.priority)}`}>
                        {due.priority.charAt(0).toUpperCase() + due.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(due.status)}`}>
                        {due.status.charAt(0).toUpperCase() + due.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(due)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openPaymentModal(due)}
                          className="text-green-600 hover:text-green-900"
                          title="Make Payment"
                        >
                          <PlusIcon className="h-4 w-4" />
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

      {/* Payment Modal */}
      {showPaymentModal && selectedDue && (
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

            <div className="mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedDue.orderNumber}</p>
                <p className="text-sm text-gray-600">{selectedDue.supplierName}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  Amount to Pay: <span className="text-red-600">${(selectedDue.amountDue || 0).toFixed(2)}</span>
                </p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleRecordPayment();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="input"
                    placeholder="0.00"
                    max={selectedDue.amountDue}
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

      {/* Due Details Modal */}
      {showDetailsModal && selectedDue && (
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
              <h3 className="text-lg font-semibold text-gray-900">Due Details - {selectedDue.orderNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Order Number</p>
                <p className="text-sm text-gray-900">{selectedDue.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedDue.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-sm text-gray-900">${(selectedDue.totalAmount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                <p className="text-sm text-gray-900">${(selectedDue.amountPaid || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Due</p>
                <p className="text-sm font-medium text-red-600">${(selectedDue.amountDue || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-sm text-gray-900">{selectedDue.dueDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Days Overdue</p>
                <p className={`text-sm font-medium ${selectedDue.daysOverdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {selectedDue.daysOverdue > 0 ? `${selectedDue.daysOverdue} days` : 'On time'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Priority</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedDue.priority)}`}>
                  {selectedDue.priority.charAt(0).toUpperCase() + selectedDue.priority.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDue.status)}`}>
                  {selectedDue.status.charAt(0).toUpperCase() + selectedDue.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Order Status</p>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedDue.orderStatus.charAt(0).toUpperCase() + selectedDue.orderStatus.slice(1)}
                </span>
              </div>
            </div>

            {selectedDue.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedDue.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedDue.createdAt).toLocaleString()}
                {selectedDue.updatedAt !== selectedDue.createdAt && (
                  <span> | Updated: {new Date(selectedDue.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openPaymentModal(selectedDue);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Make Payment
                </button>
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

export default OutstandingDues;
