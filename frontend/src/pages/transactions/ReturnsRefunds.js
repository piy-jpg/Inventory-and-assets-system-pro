import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon as RefreshIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  CalendarIcon,
  ShoppingCartIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const ReturnsRefunds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [formData, setFormData] = useState({
    type: 'sales_return',
    originalTransactionId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [],
    reason: '',
    refundAmount: 0,
    refundMethod: 'original',
    exchangeItems: [],
    status: 'pending',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time returns and refunds data
  const { data: returnsData, isLoading, refetch } = useQuery(
    'returnsRefunds',
    () => {
      const storedReturns = localStorage.getItem('returnsRefunds');
      if (storedReturns) {
        return JSON.parse(storedReturns);
      }
      
      return [
        {
          _id: 'RET_001',
          returnNumber: 'RET-2024-001',
          type: 'sales_return',
          originalTransactionId: 'SAL_001',
          originalInvoiceNumber: 'INV-2024-001',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          customerPhone: '+1-555-0101',
          items: [
            { name: 'Laptop Pro 15"', quantity: 1, reason: 'Defective screen', price: 1299.99, total: 1299.99 }
          ],
          reason: 'Product defective',
          refundAmount: 1299.99,
          refundMethod: 'credit_card',
          exchangeItems: [],
          status: 'completed',
          date: '2024-04-23',
          time: '16:30:00',
          processedBy: 'Sarah Johnson',
          processedDate: '2024-04-23',
          processedTime: '17:15:00',
          notes: 'Customer satisfied with refund processing',
          createdAt: '2024-04-23T16:30:00Z',
          updatedAt: '2024-04-23T17:15:00Z'
        },
        {
          _id: 'RET_002',
          returnNumber: 'RET-2024-002',
          type: 'exchange',
          originalTransactionId: 'SAL_002',
          originalInvoiceNumber: 'INV-2024-002',
          customerName: 'Emily Davis',
          customerEmail: 'emily.davis@email.com',
          customerPhone: '+1-555-0102',
          items: [
            { name: 'Office Chair Ergonomic', quantity: 1, reason: 'Wrong color delivered', price: 399.99, total: 399.99 }
          ],
          reason: 'Wrong item delivered',
          refundAmount: 0,
          refundMethod: 'exchange',
          exchangeItems: [
            { name: 'Office Chair Ergonomic', quantity: 1, color: 'Black', price: 399.99, total: 399.99 }
          ],
          status: 'completed',
          date: '2024-04-22',
          time: '14:20:00',
          processedBy: 'Mike Wilson',
          processedDate: '2024-04-22',
          processedTime: '15:45:00',
          notes: 'Exchange completed successfully',
          createdAt: '2024-04-22T14:20:00Z',
          updatedAt: '2024-04-22T15:45:00Z'
        },
        {
          _id: 'RET_003',
          returnNumber: 'RET-2024-003',
          type: 'sales_return',
          originalTransactionId: 'SAL_003',
          originalInvoiceNumber: 'INV-2024-003',
          customerName: 'David Brown',
          customerEmail: 'david.brown@email.com',
          customerPhone: '+1-555-0103',
          items: [
            { name: 'Desktop Computer', quantity: 1, reason: 'Not as described', price: 899.99, total: 899.99 }
          ],
          reason: 'Product not as described',
          refundAmount: 899.99,
          refundMethod: 'bank_transfer',
          exchangeItems: [],
          status: 'pending',
          date: '2024-04-21',
          time: '11:30:00',
          processedBy: null,
          processedDate: null,
          processedTime: null,
          notes: 'Awaiting approval from management',
          createdAt: '2024-04-21T11:30:00Z',
          updatedAt: '2024-04-21T11:30:00Z'
        },
        {
          _id: 'RET_004',
          returnNumber: 'RET-2024-004',
          type: 'purchase_return',
          originalTransactionId: 'PUR_004',
          originalInvoiceNumber: 'BILL-2024-004',
          customerName: 'Stationery World',
          customerEmail: 'returns@stationeryworld.com',
          customerPhone: '+1-555-0204',
          items: [
            { name: 'Office Supplies Bundle', quantity: 1, reason: 'Quality issues', price: 299.99, total: 299.99 }
          ],
          reason: 'Supplier quality issues',
          refundAmount: 299.99,
          refundMethod: 'credit',
          exchangeItems: [],
          status: 'completed',
          date: '2024-04-20',
          time: '09:15:00',
          processedBy: 'Sarah Johnson',
          processedDate: '2024-04-20',
          processedTime: '10:30:00',
          notes: 'Credit note issued to supplier',
          createdAt: '2024-04-20T09:15:00Z',
          updatedAt: '2024-04-20T10:30:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Returns and refunds data refreshed:', data);
      }
    }
  );

  // Mutation for creating new return
  const createReturnMutation = useMutation(
    async (returnData) => {
      const returns = returnsData || [];
      const newReturn = {
        ...returnData,
        _id: `RET_${Date.now()}`,
        returnNumber: `RET-2024-${String(returns.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        processedBy: null,
        processedDate: null,
        processedTime: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedReturns = [...returns, newReturn];
      localStorage.setItem('returnsRefunds', JSON.stringify(updatedReturns));
      queryClient.setQueryData('returnsRefunds', updatedReturns);
      return updatedReturns;
    },
    {
      onSuccess: () => {
        toast.success('Return/Refund request created successfully');
        setShowReturnModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create return/refund request');
      }
    }
  );

  // Mutation for processing return
  const processReturnMutation = useMutation(
    async ({ returnId, status, processedBy }) => {
      const returns = returnsData || [];
      const updatedReturns = returns.map(returnItem => 
        returnItem._id === returnId ? {
          ...returnItem,
          status,
          processedBy,
          processedDate: new Date().toISOString().split('T')[0],
          processedTime: new Date().toLocaleTimeString(),
          updatedAt: new Date().toISOString()
        } : returnItem
      );
      localStorage.setItem('returnsRefunds', JSON.stringify(updatedReturns));
      queryClient.setQueryData('returnsRefunds', updatedReturns);
      return updatedReturns;
    },
    {
      onSuccess: () => {
        toast.success('Return processed successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to process return');
      }
    }
  );

  const returns = returnsData || [];

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        returnItem.returnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        returnItem.originalInvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || returnItem.type === filterType;
    const matchesStatus = filterStatus === 'all' || returnItem.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      type: 'sales_return',
      originalTransactionId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [],
      reason: '',
      refundAmount: 0,
      refundMethod: 'original',
      exchangeItems: [],
      status: 'pending',
      notes: ''
    });
  };

  const openDetailsModal = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailsModal(true);
  };

  const openExchangeModal = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowExchangeModal(true);
  };

  const handleCreateReturn = () => {
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Reason is required');
      return;
    }

    createReturnMutation.mutate(formData);
  };

  const handleProcessReturn = (status) => {
    if (!selectedReturn) return;

    processReturnMutation.mutate({
      returnId: selectedReturn._id,
      status,
      processedBy: 'Current User'
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Returns data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sales_return':
        return 'bg-blue-100 text-blue-800';
      case 'purchase_return':
        return 'bg-purple-100 text-purple-800';
      case 'exchange':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sales_return':
        return <ShoppingCartIcon className="h-4 w-4" />;
      case 'purchase_return':
        return <TruckIcon className="h-4 w-4" />;
      case 'exchange':
        return <ArrowPathIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalReturns = returns.length;
  const completedReturns = returns.filter(returnItem => returnItem.status === 'completed').length;
  const pendingReturns = returns.filter(returnItem => returnItem.status === 'pending').length;
  const totalRefundAmount = returns.reduce((sum, returnItem) => sum + returnItem.refundAmount, 0);
  const todayReturns = returns.filter(returnItem => {
    const returnDate = new Date(returnItem.createdAt).toDateString();
    const today = new Date().toDateString();
    return returnDate === today;
  }).length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Returns & Refunds</h1>
            <p className="page-subtitle">Sales Returns (customer returns), Refund processing, Exchange handling</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => {
                resetForm();
                setShowReturnModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Return</span>
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
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">{totalReturns}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedReturns}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{pendingReturns}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-gray-900">${totalRefundAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search returns..."
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
              <option value="sales_return">Sales Return</option>
              <option value="purchase_return">Purchase Return</option>
              <option value="exchange">Exchange</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Returns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
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
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No returns found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((returnItem) => (
                  <tr key={returnItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{returnItem.returnNumber}</div>
                      <div className="text-xs text-gray-500">Original: {returnItem.originalInvoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{returnItem.customerName}</div>
                      <div className="text-xs text-gray-500">{returnItem.customerEmail}</div>
                      <div className="text-xs text-gray-500">{returnItem.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(returnItem.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(returnItem.type)}`}>
                          {returnItem.type.replace('_', ' ').charAt(0).toUpperCase() + returnItem.type.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {returnItem.items.length} item{returnItem.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {returnItem.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.name}
                            {index < Math.min(2, returnItem.items.length) - 1 && ', '}
                          </span>
                        ))}
                        {returnItem.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${returnItem.refundAmount.toFixed(2)}
                      </div>
                      {returnItem.exchangeItems.length > 0 && (
                        <div className="text-xs text-gray-500">Exchange: {returnItem.exchangeItems.length} items</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{returnItem.date}</div>
                      <div className="text-xs text-gray-500">{returnItem.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(returnItem)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {returnItem.type === 'exchange' && (
                          <button
                            onClick={() => openExchangeModal(returnItem)}
                            className="text-green-600 hover:text-green-900"
                            title="Exchange Details"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Return Modal */}
      {showReturnModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowReturnModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Return/Refund Request</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateReturn();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="sales_return">Sales Return</option>
                    <option value="purchase_return">Purchase Return</option>
                    <option value="exchange">Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Transaction ID</label>
                  <input
                    type="text"
                    value={formData.originalTransactionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalTransactionId: e.target.value }))}
                    className="input"
                    placeholder="e.g., SAL_001 or PUR_001"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="input"
                      placeholder="Enter customer/supplier name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="input"
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="input"
                    placeholder="+1-555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return *</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Describe the reason for return"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                    <input
                      type="number"
                      value={formData.refundAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, refundAmount: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      placeholder="0.00"
                      disabled={formData.type === 'exchange'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
                    <select
                      value={formData.refundMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, refundMethod: e.target.value }))}
                      className="input"
                      disabled={formData.type === 'exchange'}
                    >
                      <option value="original">Original Method</option>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit">Credit Note</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createReturnMutation.isLoading}
                >
                  {createReturnMutation.isLoading ? 'Creating...' : 'Create Return'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Return Details Modal */}
      {showDetailsModal && selectedReturn && (
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
              <h3 className="text-lg font-semibold text-gray-900">Return Details - {selectedReturn.returnNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Name</p>
                <p className="text-sm text-gray-900">{selectedReturn.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Email</p>
                <p className="text-sm text-gray-900">{selectedReturn.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Phone</p>
                <p className="text-sm text-gray-900">{selectedReturn.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Return Type</p>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedReturn.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedReturn.type)}`}>
                    {selectedReturn.type.replace('_', ' ').charAt(0).toUpperCase() + selectedReturn.type.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReturn.status)}`}>
                  {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processed By</p>
                <p className="text-sm text-gray-900">
                  {selectedReturn.processedBy || 'Not processed yet'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Original Invoice</p>
                <p className="text-sm text-gray-900">{selectedReturn.originalInvoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Amount</p>
                <p className="text-sm font-medium text-gray-900">${selectedReturn.refundAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Return Reason</p>
              <p className="text-sm text-gray-900">{selectedReturn.reason}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Items Being Returned</p>
              <div className="space-y-2">
                {selectedReturn.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-xs text-gray-500">Reason: {item.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Total: ${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedReturn.exchangeItems.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Exchange Items</p>
                <div className="space-y-2">
                  {selectedReturn.exchangeItems.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-green-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Total: ${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReturn.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedReturn.notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {selectedReturn.date} at {selectedReturn.time}
                {selectedReturn.processedDate && (
                  <span> | Processed: {selectedReturn.processedDate} at {selectedReturn.processedTime}</span>
                )}
              </div>
              <div className="flex space-x-3">
                {selectedReturn.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleProcessReturn('completed')}
                      className="btn btn-primary btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleProcessReturn('rejected')}
                      className="btn btn-outline btn-sm"
                    >
                      Reject
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

export default ReturnsRefunds;
