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
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const ExpenseTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('month');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'rent',
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    vendor: '',
    receiptNumber: '',
    transactionId: '',
    notes: '',
    status: 'pending',
    linkedTransaction: '',
    attachments: []
  });

  const queryClient = useQueryClient();

  // Real-time expense tracking data
  const { data: expensesData, isLoading, refetch } = useQuery(
    'expenseTracking',
    () => {
      const storedExpenses = localStorage.getItem('expenseTracking');
      if (storedExpenses) {
        return JSON.parse(storedExpenses);
      }
      
      return [
        {
          _id: 'EXP_001',
          description: 'Monthly Office Rent',
          amount: 2500.00,
          category: 'rent',
          subcategory: 'Office Space',
          date: '2024-04-01',
          paymentMethod: 'bank_transfer',
          vendor: 'ABC Properties',
          receiptNumber: 'RNT-2024-001',
          transactionId: 'TXN_001234567',
          notes: 'Monthly rent for main office space',
          status: 'approved',
          linkedTransaction: 'TXN_001234567',
          attachments: ['rent_receipt_april.pdf'],
          approvedBy: 'John Smith',
          approvedDate: '2024-04-01',
          createdAt: '2024-04-01T09:00:00Z',
          updatedAt: '2024-04-01T09:00:00Z'
        },
        {
          _id: 'EXP_002',
          description: 'Employee Salaries - March',
          amount: 12500.00,
          category: 'salary',
          subcategory: 'Monthly Payroll',
          date: '2024-04-05',
          paymentMethod: 'bank_transfer',
          vendor: 'Payroll Department',
          receiptNumber: 'SAL-2024-003',
          transactionId: 'TXN_001234568',
          notes: 'Monthly salaries for 5 employees',
          status: 'approved',
          linkedTransaction: 'TXN_001234568',
          attachments: ['payroll_march.pdf'],
          approvedBy: 'John Smith',
          approvedDate: '2024-04-05',
          createdAt: '2024-04-05T10:30:00Z',
          updatedAt: '2024-04-05T10:30:00Z'
        },
        {
          _id: 'EXP_003',
          description: 'Electricity Bill - March',
          amount: 450.75,
          category: 'utilities',
          subcategory: 'Electricity',
          date: '2024-04-10',
          paymentMethod: 'online',
          vendor: 'City Power Company',
          receiptNumber: 'PWR-2024-003',
          transactionId: 'TXN_001234569',
          notes: 'Monthly electricity consumption',
          status: 'approved',
          linkedTransaction: 'TXN_001234569',
          attachments: ['electricity_bill_march.pdf'],
          approvedBy: 'Sarah Johnson',
          approvedDate: '2024-04-10',
          createdAt: '2024-04-10T14:20:00Z',
          updatedAt: '2024-04-10T14:20:00Z'
        },
        {
          _id: 'EXP_004',
          description: 'Office Supplies Purchase',
          amount: 125.50,
          category: 'supplies',
          subcategory: 'Stationery',
          date: '2024-04-15',
          paymentMethod: 'cash',
          vendor: 'Office Depot',
          receiptNumber: 'SUP-2024-001',
          transactionId: '',
          notes: 'Stationery and office supplies',
          status: 'pending',
          linkedTransaction: '',
          attachments: ['receipt_0415.pdf'],
          approvedBy: null,
          approvedDate: null,
          createdAt: '2024-04-15T11:45:00Z',
          updatedAt: '2024-04-15T11:45:00Z'
        },
        {
          _id: 'EXP_005',
          description: 'Internet Service - April',
          amount: 89.99,
          category: 'utilities',
          subcategory: 'Internet',
          date: '2024-04-20',
          paymentMethod: 'credit_card',
          vendor: 'Fiber Internet Co.',
          receiptNumber: 'NET-2024-004',
          transactionId: 'TXN_001234570',
          notes: 'High-speed internet connection',
          status: 'approved',
          linkedTransaction: 'TXN_001234570',
          attachments: ['internet_bill_april.pdf'],
          approvedBy: 'Mike Wilson',
          approvedDate: '2024-04-20',
          createdAt: '2024-04-20T16:30:00Z',
          updatedAt: '2024-04-20T16:30:00Z'
        },
        {
          _id: 'EXP_006',
          description: 'Marketing Campaign',
          amount: 750.00,
          category: 'marketing',
          subcategory: 'Digital Marketing',
          date: '2024-04-22',
          paymentMethod: 'bank_transfer',
          vendor: 'Digital Marketing Agency',
          receiptNumber: 'MKT-2024-001',
          transactionId: 'TXN_001234571',
          notes: 'Q2 digital marketing campaign',
          status: 'pending',
          linkedTransaction: 'TXN_001234571',
          attachments: ['marketing_proposal.pdf'],
          approvedBy: null,
          approvedDate: null,
          createdAt: '2024-04-22T09:15:00Z',
          updatedAt: '2024-04-22T09:15:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Expense tracking data refreshed:', data);
      }
    }
  );

  // Mutation for creating new expense
  const createExpenseMutation = useMutation(
    async (expenseData) => {
      const expenses = expensesData || [];
      const newExpense = {
        ...expenseData,
        _id: `EXP_${Date.now()}`,
        receiptNumber: expenseData.receiptNumber || `EXP-${Date.now()}`,
        approvedBy: null,
        approvedDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedExpenses = [...expenses, newExpense];
      localStorage.setItem('expenseTracking', JSON.stringify(updatedExpenses));
      queryClient.setQueryData('expenseTracking', updatedExpenses);
      return updatedExpenses;
    },
    {
      onSuccess: () => {
        toast.success('Expense added successfully');
        setShowExpenseModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to add expense');
      }
    }
  );

  // Mutation for updating expense status
  const updateExpenseStatusMutation = useMutation(
    async ({ expenseId, status }) => {
      const expenses = expensesData || [];
      const updatedExpenses = expenses.map(expense => 
        expense._id === expenseId ? {
          ...expense,
          status,
          approvedBy: 'Current User',
          approvedDate: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString()
        } : expense
      );
      localStorage.setItem('expenseTracking', JSON.stringify(updatedExpenses));
      queryClient.setQueryData('expenseTracking', updatedExpenses);
      return updatedExpenses;
    },
    {
      onSuccess: () => {
        toast.success('Expense status updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update expense status');
      }
    }
  );

  const expenses = expensesData || [];

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        expense.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      category: 'rent',
      subcategory: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      vendor: '',
      receiptNumber: '',
      transactionId: '',
      notes: '',
      status: 'pending',
      linkedTransaction: '',
      attachments: []
    });
  };

  const openDetailsModal = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const handleCreateExpense = () => {
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!formData.vendor.trim()) {
      toast.error('Vendor is required');
      return;
    }

    createExpenseMutation.mutate(formData);
  };

  const handleUpdateStatus = (status) => {
    if (!selectedExpense) return;

    updateExpenseStatusMutation.mutate({
      expenseId: selectedExpense._id,
      status
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Expense data refreshed');
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'rent':
        return 'bg-purple-100 text-purple-800';
      case 'salary':
        return 'bg-blue-100 text-blue-800';
      case 'utilities':
        return 'bg-yellow-100 text-yellow-800';
      case 'supplies':
        return 'bg-green-100 text-green-800';
      case 'marketing':
        return 'bg-pink-100 text-pink-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'insurance':
        return 'bg-indigo-100 text-indigo-800';
      case 'tax':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'rent':
        return <HomeIcon className="h-4 w-4" />;
      case 'salary':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'utilities':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'supplies':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'marketing':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'maintenance':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'insurance':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'tax':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = expenses.filter(expense => expense.status === 'approved').length;
  const pendingExpenses = expenses.filter(expense => expense.status === 'pending').length;
  const rejectedExpenses = expenses.filter(expense => expense.status === 'rejected').length;
  const approvedAmount = expenses.filter(expense => expense.status === 'approved').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = expenses.filter(expense => expense.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);

  // Category breakdown
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const categories = [
    { key: 'rent', name: 'Rent', icon: HomeIcon },
    { key: 'salary', name: 'Salary', icon: UserGroupIcon },
    { key: 'utilities', name: 'Utilities', icon: ExclamationTriangleIcon },
    { key: 'supplies', name: 'Supplies', icon: DocumentTextIcon },
    { key: 'marketing', name: 'Marketing', icon: ExclamationTriangleIcon },
    { key: 'maintenance', name: 'Maintenance', icon: ExclamationTriangleIcon },
    { key: 'insurance', name: 'Insurance', icon: ExclamationTriangleIcon },
    { key: 'tax', name: 'Tax', icon: ExclamationTriangleIcon }
  ];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Expense Tracking</h1>
            <p className="page-subtitle">Add expenses, Categorize (rent, salary, utilities), Link to transactions</p>
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
                setShowExpenseModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Expense</span>
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
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">${approvedAmount.toFixed(2)}</p>
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
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Count</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpenses}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(category => {
            const amount = categoryBreakdown[category.key] || 0;
            const count = expenses.filter(expense => expense.category === category.key).length;
            return (
              <div key={category.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <category.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{count} expense{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            );
          })}
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
                placeholder="Search expenses..."
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
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
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

      {/* Expenses Table */}
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
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linked Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                      <div className="text-xs text-gray-500">Receipt: {expense.receiptNumber}</div>
                      {expense.attachments.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {expense.attachments.length} attachment{expense.attachments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(expense.category)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </span>
                      </div>
                      {expense.subcategory && (
                        <div className="text-xs text-gray-500">{expense.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${expense.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{expense.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.vendor}</div>
                      <div className="text-xs text-gray-500">{expense.transactionId || 'No transaction'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {expense.linkedTransaction || 'Not linked'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(expense)}
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

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowExpenseModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Expense</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateExpense();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                      placeholder="Expense description"
                      required
                    />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                      required
                    >
                      {categories.map(category => (
                        <option key={category.key} value={category.key}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                      className="input"
                      placeholder="Subcategory (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                      className="input"
                      placeholder="Vendor name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="input"
                    >
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online</option>
                      <option value="check">Check</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                    <input
                      type="text"
                      value={formData.receiptNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                      className="input"
                      placeholder="Receipt number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Transaction ID</label>
                  <input
                    type="text"
                    value={formData.linkedTransaction}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedTransaction: e.target.value }))}
                    className="input"
                    placeholder="Transaction ID (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this expense"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createExpenseMutation.isLoading}
                >
                  {createExpenseMutation.isLoading ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Expense Details Modal */}
      {showDetailsModal && selectedExpense && (
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
              <h3 className="text-lg font-semibold text-gray-900">Expense Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">{selectedExpense.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-sm font-medium text-gray-900">${selectedExpense.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(selectedExpense.category)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedExpense.category)}`}>
                    {selectedExpense.category.charAt(0).toUpperCase() + selectedExpense.category.slice(1)}
                  </span>
                </div>
                {selectedExpense.subcategory && (
                  <p className="text-xs text-gray-500 mt-1">{selectedExpense.subcategory}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExpense.status)}`}>
                  {selectedExpense.status.charAt(0).toUpperCase() + selectedExpense.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Vendor</p>
                <p className="text-sm text-gray-900">{selectedExpense.vendor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <p className="text-sm text-gray-900">{selectedExpense.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Receipt Number</p>
                <p className="text-sm text-gray-900">{selectedExpense.receiptNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-sm text-gray-900">{selectedExpense.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Linked Transaction</p>
                <p className="text-sm text-gray-900">
                  {selectedExpense.linkedTransaction || 'Not linked'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved By</p>
                <p className="text-sm text-gray-900">
                  {selectedExpense.approvedBy || 'Not approved yet'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Date</p>
                <p className="text-sm text-gray-900">
                  {selectedExpense.approvedDate || 'Not approved yet'}
                </p>
              </div>
            </div>

            {selectedExpense.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedExpense.notes}</p>
              </div>
            )}

            {selectedExpense.attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Attachments</p>
                <div className="space-y-2">
                  {selectedExpense.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedExpense.createdAt).toLocaleString()}
                {selectedExpense.updatedAt !== selectedExpense.createdAt && (
                  <span> | Updated: {new Date(selectedExpense.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                {selectedExpense.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('approved')}
                      className="btn btn-primary btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('rejected')}
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

export default ExpenseTracking;
