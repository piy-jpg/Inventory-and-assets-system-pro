import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const PendingDuePayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time pending and due payments data
  const { data: paymentsData, isLoading, refetch } = useQuery(
    'pendingDuePayments',
    () => {
      const storedPayments = localStorage.getItem('pendingDuePayments');
      if (storedPayments) {
        return JSON.parse(storedPayments);
      }
      
      // Combine outstanding invoices and pending payments from all sources
      const salesTransactions = JSON.parse(localStorage.getItem('salesTransactions') || '[]');
      const purchaseTransactions = JSON.parse(localStorage.getItem('purchaseTransactions') || '[]');
      const invoicesBilling = JSON.parse(localStorage.getItem('invoicesBilling') || '[]');
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');

      const allPayments = [
        // Outstanding sales invoices
        ...salesTransactions
          .filter(sale => sale.status === 'pending')
          .map(sale => ({
            ...sale,
            paymentType: 'receivable',
            customerSupplier: sale.customerName,
            customerSupplierEmail: sale.customerEmail,
            customerSupplierPhone: sale.customerPhone,
            invoiceNumber: sale.invoiceNumber,
            amount: sale.total,
            dueDate: new Date(new Date(sale.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            overdueDays: Math.max(0, Math.floor((new Date() - new Date(sale.createdAt)) / (1000 * 60 * 60 * 24))),
            priority: 'medium',
            status: 'outstanding',
            paymentStatus: 'pending'
          })),
        // Outstanding purchase invoices
        ...purchaseTransactions
          .filter(purchase => purchase.status === 'pending')
          .map(purchase => ({
            ...purchase,
            paymentType: 'payable',
            customerSupplier: purchase.supplierName,
            customerSupplierEmail: purchase.supplierEmail,
            customerSupplierPhone: purchase.supplierPhone,
            invoiceNumber: purchase.purchaseOrderNumber,
            amount: purchase.total,
            dueDate: new Date(new Date(purchase.createdAt).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            overdueDays: Math.max(0, Math.floor((new Date() - new Date(purchase.createdAt)) / (1000 * 60 * 60 * 24))),
            priority: 'medium',
            status: 'outstanding',
            paymentStatus: 'pending'
          })),
        // Outstanding billing invoices
        ...invoicesBilling
          .filter(invoice => ['sent', 'pending'].includes(invoice.status))
          .map(invoice => ({
            ...invoice,
            paymentType: invoice.type === 'sales' ? 'receivable' : 'payable',
            customerSupplier: invoice.customerName,
            customerSupplierEmail: invoice.customerEmail,
            customerSupplierPhone: invoice.customerPhone,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.total,
            dueDate: invoice.dueDate,
            overdueDays: Math.max(0, Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))),
            priority: invoice.dueDate < new Date().toISOString().split('T')[0] ? 'high' : 'medium',
            status: invoice.dueDate < new Date().toISOString().split('T')[0] ? 'overdue' : 'outstanding',
            paymentStatus: 'pending'
          })),
        // Pending payments
        ...payments
          .filter(payment => payment.status === 'pending')
          .map(payment => ({
            ...payment,
            paymentType: payment.type === 'incoming' ? 'receivable' : 'payable',
            customerSupplier: payment.customerSupplier,
            customerSupplierEmail: payment.customerSupplierEmail,
            customerSupplierPhone: payment.customerSupplierPhone,
            invoiceNumber: payment.invoiceNumber || payment.transactionId,
            amount: payment.amount,
            dueDate: payment.paymentDate,
            overdueDays: 0,
            priority: 'medium',
            status: 'pending',
            paymentStatus: 'pending'
          }))
      ];

      // Sort by priority and due date
      return allPayments.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Pending and due payments data refreshed:', data);
      }
    }
  );

  // Mutation for recording payment
  const recordPaymentMutation = useMutation(
    async (paymentData) => {
      // Update the original transaction status
      const payments = paymentsData || [];
      const updatedPayments = payments.map(payment => 
        payment._id === paymentData.invoiceId ? {
          ...payment,
          status: 'paid',
          paymentStatus: 'completed',
          paidAmount: paymentData.amount,
          paidDate: paymentData.paymentDate,
          updatedAt: new Date().toISOString()
        } : payment
      );
      localStorage.setItem('pendingDuePayments', JSON.stringify(updatedPayments));
      queryClient.setQueryData('pendingDuePayments', updatedPayments);
      return updatedPayments;
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

  const payments = paymentsData || [];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerSupplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.customerSupplierEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.paymentType === filterType;
    const matchesPriority = filterPriority === 'all' || payment.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const resetForm = () => {
    setFormData({
      invoiceId: '',
      amount: 0,
      paymentMethod: 'bank_transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openDetailsModal = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setFormData(prev => ({
      ...prev,
      invoiceId: payment._id || payment.invoiceNumber,
      amount: payment.amount,
      paymentDate: new Date().toISOString().split('T')[0]
    }));
    setShowPaymentModal(true);
  };

  const handleRecordPayment = () => {
    if (!formData.invoiceId) {
      toast.error('Invoice ID is required');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    recordPaymentMutation.mutate(formData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Payments data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'outstanding':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'receivable':
        return 'bg-green-100 text-green-800';
      case 'payable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const overduePayments = payments.filter(payment => payment.status === 'overdue').length;
  const outstandingPayments = payments.filter(payment => payment.status === 'outstanding').length;
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
  const totalReceivables = payments.filter(payment => payment.paymentType === 'receivable').reduce((sum, payment) => sum + payment.amount, 0);
  const totalPayables = payments.filter(payment => payment.paymentType === 'payable').reduce((sum, payment) => sum + payment.amount, 0);
  const netCashFlow = totalReceivables - totalPayables;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Pending & Due Payments</h1>
            <p className="page-subtitle">Outstanding invoices, Overdue payments, Credit tracking</p>
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
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
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
              <p className="text-2xl font-bold text-red-600">{overduePayments}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Receivables</p>
              <p className="text-2xl font-bold text-green-600">${totalReceivables.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payables</p>
              <p className="text-2xl font-bold text-red-600">${totalPayables.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Net Cash Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Receivables</p>
            <p className="text-2xl font-bold text-green-600">${totalReceivables.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Payables</p>
            <p className="text-2xl font-bold text-red-600">${totalPayables.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Net Cash Flow</p>
            <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netCashFlow.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Priority Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-xl font-bold text-red-600">
                {payments.filter(p => p.priority === 'high').length}
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
              <p className="text-xl font-bold text-yellow-600">
                {payments.filter(p => p.priority === 'medium').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Priority</p>
              <p className="text-xl font-bold text-green-600">
                {payments.filter(p => p.priority === 'low').length}
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
        transition={{ delay: 0.4 }}
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="receivable">Receivables</option>
              <option value="payable">Payables</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="overdue">Overdue</option>
              <option value="outstanding">Outstanding</option>
              <option value="pending">Pending</option>
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
          </div>
        </div>
      </motion.div>

      {/* Payments Table */}
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
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No pending payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.customerSupplier}</div>
                      <div className="text-xs text-gray-500">{payment.customerSupplierEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(payment.paymentType)}`}>
                        {payment.paymentType === 'receivable' ? 'Receivable' : 'Payable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${payment.paymentType === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
                        ${payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${payment.overdueDays > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {payment.overdueDays > 0 ? `${payment.overdueDays} days` : 'On time'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(payment.priority)}`}>
                        {payment.priority.charAt(0).toUpperCase() + payment.priority.slice(1)}
                      </span>
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
                        <button
                          onClick={() => openPaymentModal(payment)}
                          className="text-green-600 hover:text-green-900"
                          title="Record Payment"
                        >
                          <CurrencyDollarIcon className="h-4 w-4" />
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
              <h3 className="text-lg font-semibold text-gray-900">Payment Details - {selectedPayment.invoiceNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {selectedPayment.paymentType === 'receivable' ? 'Customer' : 'Supplier'}
                </p>
                <p className="text-sm text-gray-900">{selectedPayment.customerSupplier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{selectedPayment.customerSupplierEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm text-gray-900">{selectedPayment.customerSupplierPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Type</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedPayment.paymentType)}`}>
                  {selectedPayment.paymentType === 'receivable' ? 'Receivable' : 'Payable'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className={`text-sm font-medium ${selectedPayment.paymentType === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
                  ${selectedPayment.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-sm text-gray-900">{selectedPayment.dueDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Priority</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedPayment.priority)}`}>
                  {selectedPayment.priority.charAt(0).toUpperCase() + selectedPayment.priority.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Days Overdue</p>
                <p className={`text-sm font-medium ${selectedPayment.overdueDays > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {selectedPayment.overdueDays > 0 ? `${selectedPayment.overdueDays} days` : 'On time'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openPaymentModal(selectedPayment);
                }}
                className="btn btn-primary btn-sm"
              >
                Record Payment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedPayment && (
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
                <p className="text-sm font-medium text-gray-900">{selectedPayment.invoiceNumber}</p>
                <p className="text-sm text-gray-600">{selectedPayment.customerSupplier}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {selectedPayment.paymentType === 'receivable' ? 'Amount to Receive' : 'Amount to Pay'}: 
                  <span className={`ml-2 ${selectedPayment.paymentType === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
                    ${selectedPayment.amount.toFixed(2)}
                  </span>
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
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
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
    </div>
  );
};

export default PendingDuePayments;
