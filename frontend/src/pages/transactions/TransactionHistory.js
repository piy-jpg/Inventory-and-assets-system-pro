import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
  DocumentTextIcon,
  CubeIcon,
  UserGroupIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { salesAPI, purchasesAPI, expensesAPI, stockTransfersAPI } from '../../services/api';

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('month');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const queryClient = useQueryClient();

  // Real-time unified transaction history data
  const { data: transactionsData, isLoading, refetch } = useQuery(
    'transactionHistory',
    async () => {
      try {
        // Fetch data from all transaction APIs
        const [salesRes, purchasesRes, expensesRes, stockTransfersRes] = await Promise.all([
          salesAPI.getAll({ limit: 100 }),
          purchasesAPI.getAll({ limit: 100 }),
          expensesAPI.getAll({ limit: 100 }),
          stockTransfersAPI.getAll({ limit: 100 })
        ]);

        const sales = salesRes?.data?.data?.sales || salesRes?.data?.data || [];
        const purchases = purchasesRes?.data?.data?.purchases || purchasesRes?.data?.data || [];
        const expenses = expensesRes?.data?.data?.expenses || expensesRes?.data?.data || [];
        const stockTransfers = stockTransfersRes?.data?.data?.transfers || stockTransfersRes?.data?.data || [];

        const allTransactions = [
          // Sales transactions
          ...sales.map(sale => ({
            ...sale,
            unifiedType: 'sale',
            unifiedId: sale._id || sale.sale_id,
            unifiedDate: sale.sale_date || sale.createdAt || new Date().toISOString(),
            unifiedUser: sale.salesPerson || sale.created_by || 'System',
            unifiedStatus: sale.status || 'completed',
            unifiedAmount: sale.total_amount || sale.total || 0,
            unifiedDescription: `Sale to ${sale.customer_name || sale.customerName || 'Customer'}`,
            referenceNumber: sale.invoice_number || sale.sale_id || 'N/A'
          })),
          // Purchase transactions
          ...purchases.map(purchase => ({
            ...purchase,
            unifiedType: 'purchase',
            unifiedId: purchase._id || purchase.purchase_id,
            unifiedDate: purchase.purchase_date || purchase.createdAt || new Date().toISOString(),
            unifiedUser: purchase.purchaseManager || purchase.created_by || 'System',
            unifiedStatus: purchase.status || 'pending',
            unifiedAmount: purchase.total_amount || purchase.total || 0,
            unifiedDescription: `Purchase from ${purchase.supplier?.name || purchase.supplier_name || 'Supplier'}`,
            referenceNumber: purchase.purchase_order_number || purchase.purchase_id || 'N/A'
          })),
          // Expenses
          ...expenses.map(expense => ({
            ...expense,
            unifiedType: 'expense',
            unifiedId: expense._id || expense.expense_id,
            unifiedDate: expense.date || expense.createdAt || new Date().toISOString(),
            unifiedUser: expense.approvedBy || expense.created_by || 'System',
            unifiedStatus: expense.status || 'pending',
            unifiedAmount: expense.amount || 0,
            unifiedDescription: `Expense - ${expense.description || expense.category || 'General'}`,
            referenceNumber: expense.receipt_number || expense.expense_id || 'N/A'
          })),
          // Stock transfers
          ...stockTransfers.map(transfer => ({
            ...transfer,
            unifiedType: 'stock_movement',
            unifiedId: transfer._id || transfer.transfer_id,
            unifiedDate: transfer.date || transfer.createdAt || new Date().toISOString(),
            unifiedUser: transfer.processedBy || transfer.created_by || 'System',
            unifiedStatus: transfer.status || 'pending',
            unifiedAmount: transfer.shipping_charges || 0,
            unifiedDescription: `Stock Transfer - ${transfer.from_warehouse?.name || 'Warehouse A'} to ${transfer.to_warehouse?.name || 'Warehouse B'}`,
            referenceNumber: transfer.transfer_id || 'N/A'
          }))
        ];

        // Sort by date (newest first)
        return allTransactions.sort((a, b) => new Date(b.unifiedDate) - new Date(a.unifiedDate));
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        // Return empty array on error
        return [];
      }
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Transaction history data refreshed:', data);
      }
    }
  );

  const transactions = transactionsData || [];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.unifiedDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.customerSupplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.unifiedType === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.unifiedStatus === filterStatus;
    const matchesUser = filterUser === 'all' || transaction.unifiedUser === filterUser;
    
    return matchesSearch && matchesType && matchesStatus && matchesUser;
  });

  const openDetailsModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Transaction history refreshed');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-purple-100 text-purple-800';
      case 'return':
        return 'bg-orange-100 text-orange-800';
      case 'payment':
        return 'bg-blue-100 text-blue-800';
      case 'stock_movement':
        return 'bg-gray-100 text-gray-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale':
        return <ShoppingCartIcon className="h-4 w-4" />;
      case 'purchase':
        return <TruckIcon className="h-4 w-4" />;
      case 'return':
        return <ArrowPathIcon className="h-4 w-4" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'stock_movement':
        return <CubeIcon className="h-4 w-4" />;
      case 'expense':
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => 
    ['completed', 'paid', 'approved'].includes(t.unifiedStatus)
  ).length;
  const pendingTransactions = transactions.filter(t => t.unifiedStatus === 'pending').length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.unifiedAmount || 0), 0);
  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.unifiedDate).toDateString();
    const today = new Date().toDateString();
    return transactionDate === today;
  }).length;

  // Transaction type breakdown
  const typeBreakdown = transactions.reduce((acc, transaction) => {
    acc[transaction.unifiedType] = (acc[transaction.unifiedType] || 0) + 1;
    return acc;
  }, {});

  // Get unique users
  const uniqueUsers = [...new Set(transactions.map(t => t.unifiedUser).filter(Boolean))];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Transaction History</h1>
            <p className="page-subtitle">Unified view of all transactions with filters (date, type, user, status)</p>
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
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTransactions}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{pendingTransactions}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
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
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transaction Type Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
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

      {/* Today's Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Today's Transactions</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-600">{todayTransactions}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Today's Completed</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">
                {transactions.filter(t => {
                  const transactionDate = new Date(t.unifiedDate).toDateString();
                  const today = new Date().toDateString();
                  return transactionDate === today && ['completed', 'paid', 'approved'].includes(t.unifiedStatus);
                }).length}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Today's Amount</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-purple-600">
                ${transactions.filter(t => {
                  const transactionDate = new Date(t.unifiedDate).toDateString();
                  const today = new Date().toDateString();
                  return transactionDate === today;
                }).reduce((sum, t) => sum + (t.unifiedAmount || 0), 0).toFixed(2)}
              </p>
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
                placeholder="Search transactions..."
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
              <option value="sale">Sales</option>
              <option value="purchase">Purchases</option>
              <option value="return">Returns</option>
              <option value="payment">Payments</option>
              <option value="stock_movement">Stock Movements</option>
              <option value="expense">Expenses</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
            </select>
            
            <select
              className="input"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            
            <select
              className="input"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
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
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.unifiedId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.unifiedDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.unifiedDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.unifiedType)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.unifiedType)}`}>
                          {transaction.unifiedType.replace('_', ' ').charAt(0).toUpperCase() + transaction.unifiedType.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={transaction.unifiedDescription}>
                        {transaction.unifiedDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.referenceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.unifiedAmount > 0 ? `$${transaction.unifiedAmount.toFixed(2)}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {transaction.unifiedUser || 'Not assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.unifiedStatus)}`}>
                        {transaction.unifiedStatus.charAt(0).toUpperCase() + transaction.unifiedStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(transaction)}
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

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
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
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaction Type</p>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedTransaction.unifiedType)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedTransaction.unifiedType)}`}>
                    {selectedTransaction.unifiedType.replace('_', ' ').charAt(0).toUpperCase() + selectedTransaction.unifiedType.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.unifiedStatus)}`}>
                  {selectedTransaction.unifiedStatus.charAt(0).toUpperCase() + selectedTransaction.unifiedStatus.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reference Number</p>
                <p className="text-sm text-gray-900">{selectedTransaction.referenceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedTransaction.unifiedAmount > 0 ? `$${selectedTransaction.unifiedAmount.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processed By</p>
                <p className="text-sm text-gray-900">
                  {selectedTransaction.unifiedUser || 'Not assigned'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date & Time</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedTransaction.unifiedDate).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-sm text-gray-900">{selectedTransaction.unifiedDescription}</p>
            </div>

            {/* Additional details based on transaction type */}
            {selectedTransaction.unifiedType === 'sale' && selectedTransaction.customerName && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Customer Details</p>
                <p className="text-sm text-gray-900">{selectedTransaction.customerName}</p>
                {selectedTransaction.customerEmail && (
                  <p className="text-sm text-gray-500">{selectedTransaction.customerEmail}</p>
                )}
              </div>
            )}

            {selectedTransaction.unifiedType === 'purchase' && selectedTransaction.supplierName && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Supplier Details</p>
                <p className="text-sm text-gray-900">{selectedTransaction.supplierName}</p>
                {selectedTransaction.supplierEmail && (
                  <p className="text-sm text-gray-500">{selectedTransaction.supplierEmail}</p>
                )}
              </div>
            )}

            {selectedTransaction.unifiedType === 'payment' && selectedTransaction.paymentMethod && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <p className="text-sm text-gray-900">{selectedTransaction.paymentMethod}</p>
              </div>
            )}

            {selectedTransaction.unifiedType === 'stock_movement' && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Movement Details</p>
                <p className="text-sm text-gray-900">From: {selectedTransaction.fromLocation}</p>
                <p className="text-sm text-gray-900">To: {selectedTransaction.toLocation}</p>
                {selectedTransaction.items && (
                  <p className="text-sm text-gray-900">
                    Items: {selectedTransaction.items.length} item{selectedTransaction.items.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {selectedTransaction.unifiedType === 'expense' && selectedTransaction.vendor && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Vendor Details</p>
                <p className="text-sm text-gray-900">{selectedTransaction.vendor}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TransactionHistory;
