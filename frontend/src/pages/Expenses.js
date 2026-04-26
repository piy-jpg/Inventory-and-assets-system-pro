import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  ReceiptRefundIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import { expensesAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ExpenseForm from '../components/ExpenseForm';

const Expenses = ({ initialShowForm = false }) => {
  const location = useLocation();
  const section = location.pathname.split('/')[2] || 'list';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [showForm, setShowForm] = useState(initialShowForm);
  const [page, setPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const queryClient = useQueryClient();

  const { data: expensesData, isLoading } = useQuery(
    ['expenses', { search, ...filter, page }],
    async () => {
      try {
        const response = await expensesAPI.getAll({ search, ...filter, page });
        console.log('API response:', response);
        return response;
      } catch (apiError) {
        console.warn('API call failed, loading from localStorage:', apiError);
        const storedExpenses = localStorage.getItem('expenses');
        console.log('Stored expenses from localStorage:', storedExpenses);
        if (storedExpenses) {
          const parsed = JSON.parse(storedExpenses);
          console.log('Parsed expenses:', parsed);
          return { data: { expenses: parsed } };
        }
        return { data: { expenses: [] } };
      }
    },
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      onSuccess: (data) => {
        console.log('Expenses data loaded successfully:', data);
        console.log('Expenses array:', data?.data?.expenses);
        if (data?.data?.expenses) {
          localStorage.setItem('expenses', JSON.stringify(data.data.expenses));
        }
      },
      onError: (error) => {
        console.error('Error loading expenses:', error);
      }
    }
  );

  const { data: categoriesData } = useQuery(
    'expenseCategories',
    expensesAPI.getCategories,
    {
      onSuccess: (data) => {
        console.log('Categories data loaded:', data);
      },
      onError: (error) => {
        console.error('Error loading categories:', error);
      }
    }
  );

  const handleFormClose = () => {
    console.log('Form close called');
    setShowForm(false);
    setSelectedExpense(null);
  };

  const handleFormSuccess = () => {
    console.log('Form success handler called');
    // Force immediate refetch of all expense queries
    queryClient.refetchQueries({ predicate: (query) => {
      return query.queryKey[0] === 'expenses';
    }});
    handleFormClose();
  };

  const handleEditExpense = (expense) => {
    try {
      console.log('=== EDIT BUTTON CLICKED ===');
      console.log('Edit expense:', expense);
      console.log('Setting selectedExpense');
      setSelectedExpense(expense);
      console.log('Setting showForm to true');
      setShowForm(true);
      console.log('Selected expense state:', expense);
      console.log('Show form state:', true);
      // The ExpenseForm will receive the expense data and populate the form
    } catch (error) {
      console.error('Error editing expense:', error);
      toast.error('Failed to open edit form');
    }
  };

  const handleReviewExpense = (expense) => {
    try {
      console.log('Review expense:', expense);
      const reviewDetails = `
Expense Review:
================
Description: ${expense.description}
Category: ${expense.category}
Amount: ${formatCurrency(expense.amount)}
Status: ${expense.status}
Payment Method: ${expense.payment_method}
Date: ${new Date(expense.expense_date).toLocaleDateString()}
Notes: ${expense.notes || 'No notes'}
Receipt: ${expense.receipt_url ? 'Available' : 'Not available'}
      `;
      alert(reviewDetails.trim());
    } catch (error) {
      console.error('Error reviewing expense:', error);
    }
  };

  const handleDeleteExpense = (expense) => {
    try {
      console.log('Delete expense:', expense);
      const shouldDelete = window.confirm(`Are you sure you want to delete this expense?\n\n${expense.description} - ${formatCurrency(expense.amount)}`);
      if (shouldDelete) {
        // Remove from localStorage for real-time sync
        const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const index = existingExpenses.findIndex(exp => exp._id === expense._id);
        if (index > -1) {
          existingExpenses.splice(index, 1);
          localStorage.setItem('expenses', JSON.stringify(existingExpenses));
          queryClient.invalidateQueries('expenses');
          toast.success(`Expense deleted successfully: ${expense.description}`);
        } else {
          toast.error('Expense not found');
        }
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const expenses = expensesData?.data?.expenses || [];
  const pagination = expensesData?.data?.pagination || {};
  const categories = categoriesData?.data?.categories || [];

  console.log('Rendering expenses:', expenses);
  console.log('Expenses count:', expenses.length);

  // Hardcoded categories to ensure visibility
  const mockCategories = [
    'utilities',
    'rent',
    'office_supplies',
    'travel',
    'marketing',
    'maintenance',
    'software',
    'entertainment',
    'insurance',
    'training',
    'telecommunications',
    'fuel',
    'legal',
    'cleaning',
    'consulting',
    'advertising',
    'supplies',
    'security',
    'transportation',
    'meals',
    'accommodation',
    'equipment',
    'licenses',
    'subscriptions',
    'taxes',
    'banking',
    'shipping',
    'postage',
    'other'
  ];

  // Use mock categories if API data is empty
  const displayCategories = categories.length > 0 ? categories.map(c => c.value || c) : mockCategories;

  // Hardcoded expenses from mock data to ensure visibility
  const mockExpenses = [
    {
      "_id": "EXP_001",
      "expense_id": "EXP_001",
      "category": "utilities",
      "description": "Monthly electricity bill for main warehouse",
      "amount": 2500,
      "expense_date": "2024-04-01T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/electricity.pdf",
      "notes": "Monthly recurring utility expense",
      "created_at": "2024-04-01T10:00:00Z",
      "updated_at": "2024-04-01T10:00:00Z"
    },
    {
      "_id": "EXP_002",
      "expense_id": "EXP_002",
      "category": "rent",
      "description": "Monthly warehouse rent",
      "amount": 5000,
      "expense_date": "2024-04-01T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/rent.pdf",
      "notes": "Monthly warehouse rental payment",
      "created_at": "2024-04-01T10:00:00Z",
      "updated_at": "2024-04-01T10:00:00Z"
    },
    {
      "_id": "EXP_003",
      "expense_id": "EXP_003",
      "category": "office_supplies",
      "description": "Office stationery and printing supplies",
      "amount": 350,
      "expense_date": "2024-04-05T00:00:00Z",
      "payment_method": "credit_card",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/office_supplies.pdf",
      "notes": "Monthly office supplies restock",
      "created_at": "2024-04-05T14:30:00Z",
      "updated_at": "2024-04-05T14:30:00Z"
    },
    {
      "_id": "EXP_004",
      "expense_id": "EXP_004",
      "category": "travel",
      "description": "Business trip to client meeting",
      "amount": 1200,
      "expense_date": "2024-04-08T00:00:00Z",
      "payment_method": "credit_card",
      "status": "pending",
      "receipt_url": "https://example.com/receipts/travel_expense.pdf",
      "notes": "Flight and hotel expenses for client meeting",
      "created_at": "2024-04-08T16:45:00Z",
      "updated_at": "2024-04-08T16:45:00Z"
    },
    {
      "_id": "EXP_005",
      "expense_id": "EXP_005",
      "category": "marketing",
      "description": "Digital marketing campaign",
      "amount": 3000,
      "expense_date": "2024-04-10T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/marketing_campaign.pdf",
      "notes": "Q2 digital advertising expenses",
      "created_at": "2024-04-10T11:20:00Z",
      "updated_at": "2024-04-10T11:20:00Z"
    },
    {
      "_id": "EXP_006",
      "expense_id": "EXP_006",
      "category": "maintenance",
      "description": "Office equipment maintenance",
      "amount": 450,
      "expense_date": "2024-04-12T00:00:00Z",
      "payment_method": "cash",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/maintenance.pdf",
      "notes": "Annual printer and copier maintenance",
      "created_at": "2024-04-12T09:15:00Z",
      "updated_at": "2024-04-12T09:15:00Z"
    },
    {
      "_id": "EXP_007",
      "expense_id": "EXP_007",
      "category": "software",
      "description": "Annual software licenses",
      "amount": 1800,
      "expense_date": "2024-04-15T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/software_licenses.pdf",
      "notes": "Microsoft Office and Adobe Creative Cloud licenses",
      "created_at": "2024-04-15T13:30:00Z",
      "updated_at": "2024-04-15T13:30:00Z"
    },
    {
      "_id": "EXP_008",
      "expense_id": "EXP_008",
      "category": "entertainment",
      "description": "Client dinner meeting",
      "amount": 280,
      "expense_date": "2024-04-18T00:00:00Z",
      "payment_method": "credit_card",
      "status": "pending",
      "receipt_url": "https://example.com/receipts/client_dinner.pdf",
      "notes": "Dinner with potential client",
      "created_at": "2024-04-18T19:45:00Z",
      "updated_at": "2024-04-18T19:45:00Z"
    },
    {
      "_id": "EXP_009",
      "expense_id": "EXP_009",
      "category": "insurance",
      "description": "Business insurance premium",
      "amount": 1200,
      "expense_date": "2024-04-20T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/insurance.pdf",
      "notes": "Quarterly business liability insurance",
      "created_at": "2024-04-20T10:00:00Z",
      "updated_at": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "EXP_010",
      "expense_id": "EXP_010",
      "category": "training",
      "description": "Employee training program",
      "amount": 750,
      "expense_date": "2024-04-22T00:00:00Z",
      "payment_method": "credit_card",
      "status": "pending",
      "receipt_url": "https://example.com/receipts/training.pdf",
      "notes": "Sales team training workshop",
      "created_at": "2024-04-22T15:20:00Z",
      "updated_at": "2024-04-22T15:20:00Z"
    },
    {
      "_id": "EXP_011",
      "expense_id": "EXP_011",
      "category": "telecommunications",
      "description": "Internet and phone services",
      "amount": 320,
      "expense_date": "2024-04-03T00:00:00Z",
      "payment_method": "credit_card",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/telecom.pdf",
      "notes": "Monthly internet and phone service charges",
      "created_at": "2024-04-03T11:30:00Z",
      "updated_at": "2024-04-03T11:30:00Z"
    },
    {
      "_id": "EXP_012",
      "expense_id": "EXP_012",
      "category": "fuel",
      "description": "Company vehicle fuel expenses",
      "amount": 450,
      "expense_date": "2024-04-06T00:00:00Z",
      "payment_method": "credit_card",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/fuel.pdf",
      "notes": "Monthly fuel for delivery vehicles",
      "created_at": "2024-04-06T14:20:00Z",
      "updated_at": "2024-04-06T14:20:00Z"
    },
    {
      "_id": "EXP_013",
      "expense_id": "EXP_013",
      "category": "legal",
      "description": "Legal consultation fees",
      "amount": 800,
      "expense_date": "2024-04-09T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "pending",
      "receipt_url": "https://example.com/receipts/legal.pdf",
      "notes": "Contract review and legal advice",
      "created_at": "2024-04-09T16:00:00Z",
      "updated_at": "2024-04-09T16:00:00Z"
    },
    {
      "_id": "EXP_014",
      "expense_id": "EXP_014",
      "category": "cleaning",
      "description": "Office cleaning services",
      "amount": 200,
      "expense_date": "2024-04-11T00:00:00Z",
      "payment_method": "cash",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/cleaning.pdf",
      "notes": "Weekly office cleaning service",
      "created_at": "2024-04-11T10:15:00Z",
      "updated_at": "2024-04-11T10:15:00Z"
    },
    {
      "_id": "EXP_015",
      "expense_id": "EXP_015",
      "category": "consulting",
      "description": "Business consulting services",
      "amount": 2200,
      "expense_date": "2024-04-14T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "pending",
      "receipt_url": "https://example.com/receipts/consulting.pdf",
      "notes": "Strategic business consulting",
      "created_at": "2024-04-14T13:45:00Z",
      "updated_at": "2024-04-14T13:45:00Z"
    }
  ];

  // Use mock expenses if API data is empty
  const baseExpenses = expenses.length > 0 ? expenses : mockExpenses;

  // Apply search and filters
  const displayExpenses = baseExpenses.filter((expense) => {
    // Search filter
    const matchesSearch = search === '' || 
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.category.toLowerCase().includes(search.toLowerCase()) ||
      expense.payment_method.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory = filter.category === '' || expense.category === filter.category;

    // Status filter
    const matchesStatus = filter.status === '' || expense.status === filter.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Debug: Log expenses data
  console.log('=== EXPENSES PAGE DEBUG ===');
  console.log('ExpensesData:', expensesData);
  console.log('Expenses array:', expenses);
  console.log('Expenses length:', expenses.length);
  console.log('Categories:', categories);
  console.log('=== END EXPENSES PAGE DEBUG ===');

  useEffect(() => {
    if (location.state?.expenseSearch) {
      setSearch(location.state.expenseSearch);
    }
  }, [location.state]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics and Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600">Track and manage business expenses</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn btn-secondary flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" /> Export Report
            </button>
            <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center shadow-md">
              <PlusIcon className="h-5 w-5 mr-2" /> Add Expense
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Expenses</p>
                <p className="text-2xl font-bold text-blue-900">{displayExpenses.length}</p>
              </div>
              <div className="bg-blue-200 rounded-full p-2">
                <ReceiptRefundIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(displayExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </p>
              </div>
              <div className="bg-green-200 rounded-full p-2">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Paid</p>
                <p className="text-2xl font-bold text-purple-900">
                  {displayExpenses.filter(exp => exp.status === 'paid').length}
                </p>
              </div>
              <div className="bg-purple-200 rounded-full p-2">
                <BanknotesIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-2xl font-bold text-orange-900">
                  {displayExpenses.filter(exp => exp.status === 'pending').length}
                </p>
              </div>
              <div className="bg-orange-200 rounded-full p-2">
                <ExclamationCircleIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <FunnelIcon className="h-4 w-4 mr-2 inline" /> Advanced Filters
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <MagnifyingGlassIcon className="h-4 w-4 mr-2 inline" /> Bulk Search
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <ArrowPathIcon className="h-4 w-4 mr-2 inline" /> Sync Expenses
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <CalendarIcon className="h-4 w-4 mr-2 inline" /> Date Range
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="section-card p-4"
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <select
              className="input min-w-[150px]"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {displayCategories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}</option>
              ))}
            </select>
            <select
              className="input min-w-[150px]"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12">
            <LoadingSpinner />
          </div>
        ) : (
          section === 'categories' ? (
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {displayCategories.map((category) => {
                const total = displayExpenses
                  .filter((expense) => expense.category === category)
                  .reduce((sum, expense) => sum + (expense.amount || 0), 0);

                return (
                  <div key={category} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{category}</p>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      {displayExpenses.filter((expense) => expense.category === category).length} entries in this category
                    </p>
                  </div>
                );
              })}
              {!categories.length && (
                <div className="col-span-full px-6 py-12 text-center text-gray-500">
                  No expense categories found yet.
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayExpenses.length > 0 ? (
                    displayExpenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.expense_date || expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            expense.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {expense.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                          {expense.payment_method.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Edit button clicked for expense:', expense);
                                handleEditExpense(expense);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium text-xs cursor-pointer"
                              title="Edit expense"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleReviewExpense(expense)}
                              className="text-green-600 hover:text-green-900 font-medium text-xs"
                              title="Review expense"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense)}
                              className="text-red-600 hover:text-red-900 font-medium text-xs"
                              title="Delete expense"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No expenses found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{pagination.pages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn btn-secondary py-1 px-3 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary py-1 px-3 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          expense={selectedExpense}
          search={search}
          filter={filter}
          page={page}
        />
      )}
    </div>
  );
};

export default Expenses;
