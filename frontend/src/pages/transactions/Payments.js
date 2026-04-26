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
  BanknotesIcon,
  CreditCardIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    type: 'incoming',
    amount: 0,
    description: '',
    customerSupplier: '',
    customerSupplierEmail: '',
    customerSupplierPhone: '',
    paymentMethod: 'cash',
    transactionId: '',
    invoiceNumber: '',
    status: 'completed',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time payments data
  const { data: paymentsData, isLoading, refetch } = useQuery(
    'payments',
    () => {
      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) {
        return JSON.parse(storedPayments);
      }
      
      return [
        {
          _id: 'PAY_001',
          type: 'incoming',
          amount: 1473.17,
          description: 'Payment for invoice INV-2024-001',
          customerSupplier: 'John Smith',
          customerSupplierEmail: 'john.smith@email.com',
          customerSupplierPhone: '+1-555-0101',
          paymentMethod: 'credit_card',
          transactionId: 'TXN_001234567',
          invoiceNumber: 'INV-2024-001',
          status: 'completed',
          paymentDate: '2024-04-23',
          paymentTime: '14:30:00',
          processedBy: 'Sarah Johnson',
          notes: 'Payment received via credit card',
          createdAt: '2024-04-23T14:30:00Z',
          updatedAt: '2024-04-23T14:30:00Z'
        },
        {
          _id: 'PAY_002',
          type: 'incoming',
          amount: 447.99,
          description: 'Payment for invoice INV-2024-002',
          customerSupplier: 'Emily Davis',
          customerSupplierEmail: 'emily.davis@email.com',
          customerSupplierPhone: '+1-555-0102',
          paymentMethod: 'cash',
          transactionId: 'TXN_001234568',
          invoiceNumber: 'INV-2024-002',
          status: 'completed',
          paymentDate: '2024-04-23',
          paymentTime: '11:15:00',
          processedBy: 'Mike Wilson',
          notes: 'Cash payment received',
          createdAt: '2024-04-23T11:15:00Z',
          updatedAt: '2024-04-23T11:15:00Z'
        },
        {
          _id: 'PAY_003',
          type: 'outgoing',
          amount: 6799.83,
          description: 'Payment to Tech Supplies Inc.',
          customerSupplier: 'Tech Supplies Inc.',
          customerSupplierEmail: 'accounts@techsupplies.com',
          customerSupplierPhone: '+1-555-0201',
          paymentMethod: 'bank_transfer',
          transactionId: 'TXN_001234569',
          invoiceNumber: 'BILL-2024-001',
          status: 'completed',
          paymentDate: '2024-04-22',
          paymentTime: '10:30:00',
          processedBy: 'Sarah Johnson',
          notes: 'Payment sent via bank transfer',
          createdAt: '2024-04-22T10:30:00Z',
          updatedAt: '2024-04-22T10:30:00Z'
        },
        {
          _id: 'PAY_004',
          type: 'incoming',
          amount: 1243.98,
          description: 'Payment for invoice INV-2024-003',
          customerSupplier: 'Lisa Anderson',
          customerSupplierEmail: 'lisa.anderson@email.com',
          customerSupplierPhone: '+1-555-0104',
          paymentMethod: 'upi',
          transactionId: 'TXN_001234570',
          invoiceNumber: 'INV-2024-003',
          status: 'pending',
          paymentDate: '2024-04-21',
          paymentTime: '09:30:00',
          processedBy: null,
          notes: 'UPI payment pending confirmation',
          createdAt: '2024-04-21T09:30:00Z',
          updatedAt: '2024-04-21T09:30:00Z'
        },
        {
          _id: 'PAY_005',
          type: 'outgoing',
          amount: 2755.95,
          description: 'Payment to Office Furniture Co.',
          customerSupplier: 'Office Furniture Co.',
          customerSupplierEmail: 'billing@officefurniture.com',
          customerSupplierPhone: '+1-555-0202',
          paymentMethod: 'credit',
          transactionId: 'TXN_001234571',
          invoiceNumber: 'BILL-2024-002',
          status: 'pending',
          paymentDate: '2024-04-20',
          paymentTime: '16:45:00',
          processedBy: null,
          notes: 'Credit payment pending approval',
          createdAt: '2024-04-20T16:45:00Z',
          updatedAt: '2024-04-20T16:45:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Payments data refreshed:', data);
      }
    }
  );

  // Mutation for creating new payment
  const createPaymentMutation = useMutation(
    async (paymentData) => {
      const payments = paymentsData || [];
      const newPayment = {
        ...paymentData,
        _id: `PAY_${Date.now()}`,
        transactionId: `TXN_${Date.now()}`,
        paymentTime: new Date().toLocaleTimeString(),
        processedBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedPayments = [...payments, newPayment];
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      queryClient.setQueryData('payments', updatedPayments);
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

  // Mutation for updating payment status
  const updatePaymentStatusMutation = useMutation(
    async ({ paymentId, status }) => {
      const payments = paymentsData || [];
      const updatedPayments = payments.map(payment => 
        payment._id === paymentId ? {
          ...payment,
          status,
          processedBy: 'Current User',
          updatedAt: new Date().toISOString()
        } : payment
      );
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      queryClient.setQueryData('payments', updatedPayments);
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

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerSupplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || payment.type === filterType;
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    
    return matchesSearch && matchesType && matchesStatus && matchesMethod;
  });

  const resetForm = () => {
    setFormData({
      type: 'incoming',
      amount: 0,
      description: '',
      customerSupplier: '',
      customerSupplierEmail: '',
      customerSupplierPhone: '',
      paymentMethod: 'cash',
      transactionId: '',
      invoiceNumber: '',
      status: 'completed',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openDetailsModal = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleCreatePayment = () => {
    if (!formData.customerSupplier.trim()) {
      toast.error('Customer/Supplier name is required');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    createPaymentMutation.mutate(formData);
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
    toast.success('Payments data refreshed');
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'incoming':
        return 'bg-green-100 text-green-800';
      case 'outgoing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'debit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'upi':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'bank_transfer':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'credit':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'check':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method) => {
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
      case 'credit':
        return 'bg-blue-100 text-blue-800';
      case 'check':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const incomingPayments = payments.filter(payment => payment.type === 'incoming').length;
  const outgoingPayments = payments.filter(payment => payment.type === 'outgoing').length;
  const totalIncomingAmount = payments.filter(payment => payment.type === 'incoming').reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoingAmount = payments.filter(payment => payment.type === 'outgoing').reduce((sum, payment) => sum + payment.amount, 0);
  const netCashFlow = totalIncomingAmount - totalOutgoingAmount;
  const completedPayments = payments.filter(payment => payment.status === 'completed').length;
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Payments</h1>
            <p className="page-subtitle">Incoming Payments (from customers), Outgoing Payments (to suppliers), Payment methods</p>
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
              onClick={() => {
                resetForm();
                setShowPaymentModal(true);
              }}
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
              <p className="text-sm font-medium text-gray-600">Incoming</p>
              <p className="text-2xl font-bold text-green-600">${totalIncomingAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowDownTrayIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outgoing</p>
              <p className="text-2xl font-bold text-red-600">${totalOutgoingAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowUpTrayIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
              <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netCashFlow.toFixed(2)}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <CurrencyDollarIcon className={`h-4 w-4 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Method Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">{completedPayments}</p>
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
              <p className="text-xl font-bold text-yellow-600">{pendingPayments}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incoming Count</p>
              <p className="text-xl font-bold text-blue-600">{incomingPayments}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowDownTrayIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outgoing Count</p>
              <p className="text-xl font-bold text-purple-600">{outgoingPayments}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowUpTrayIcon className="h-4 w-4 text-purple-600" />
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
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
            
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
              <option value="credit">Credit</option>
              <option value="check">Check</option>
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
                  Transaction ID
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
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                      <div className="text-xs text-gray-500">Invoice: {payment.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.customerSupplier}</div>
                      <div className="text-xs text-gray-500">{payment.customerSupplierEmail}</div>
                      <div className="text-xs text-gray-500">{payment.customerSupplierPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(payment.type)}`}>
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${payment.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                        {payment.type === 'incoming' ? '+' : '-'}${payment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{payment.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.paymentMethod)}`}>
                          {payment.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + payment.paymentMethod.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.paymentDate}</div>
                      <div className="text-xs text-gray-500">{payment.paymentTime}</div>
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
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record New Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreatePayment();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="incoming">Incoming Payment</option>
                      <option value="outgoing">Outgoing Payment</option>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    placeholder="Payment description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === 'incoming' ? 'Customer Name' : 'Supplier Name'} *
                    </label>
                    <input
                      type="text"
                      value={formData.customerSupplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerSupplier: e.target.value }))}
                      className="input"
                      placeholder={formData.type === 'incoming' ? 'Customer name' : 'Supplier name'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === 'incoming' ? 'Customer Email' : 'Supplier Email'}
                    </label>
                    <input
                      type="email"
                      value={formData.customerSupplierEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerSupplierEmail: e.target.value }))}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === 'incoming' ? 'Customer Phone' : 'Supplier Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.customerSupplierPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerSupplierPhone: e.target.value }))}
                      className="input"
                      placeholder="+1-555-0123"
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
                      <option value="credit">Credit</option>
                      <option value="check">Check</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="input"
                      placeholder="INV-2024-001"
                    />
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
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
                  disabled={createPaymentMutation.isLoading}
                >
                  {createPaymentMutation.isLoading ? 'Recording...' : 'Record Payment'}
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
              <h3 className="text-lg font-semibold text-gray-900">Payment Details - {selectedPayment.transactionId}</h3>
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
                  {selectedPayment.type === 'incoming' ? 'Customer' : 'Supplier'}
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedPayment.type)}`}>
                  {selectedPayment.type.charAt(0).toUpperCase() + selectedPayment.type.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className={`text-lg font-bold ${selectedPayment.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedPayment.type === 'incoming' ? '+' : '-'}${selectedPayment.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(selectedPayment.paymentMethod)}`}>
                    {selectedPayment.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + selectedPayment.paymentMethod.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processed By</p>
                <p className="text-sm text-gray-900">
                  {selectedPayment.processedBy || 'Not processed yet'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Invoice Number</p>
                <p className="text-sm text-gray-900">{selectedPayment.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Date</p>
                <p className="text-sm text-gray-900">{selectedPayment.paymentDate} at {selectedPayment.paymentTime}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-sm text-gray-900">{selectedPayment.description}</p>
            </div>

            {selectedPayment.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedPayment.notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
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
                      Complete
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('cancelled')}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
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

export default Payments;
