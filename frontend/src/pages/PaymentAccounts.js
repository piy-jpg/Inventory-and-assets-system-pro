import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  WalletIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { paymentAccountsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentAccounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    account_type: 'bank',
    opening_balance: 0,
    bank_name: '',
    bank_branch: '',
    upi_id: '',
    card_number: '',
    card_type: 'credit',
    status: 'active'
  });

  const [transactionData, setTransactionData] = useState({
    from_account: '',
    to_account: '',
    amount: 0,
    transaction_type: 'deposit',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();
  const { data: accountsData, isLoading: loadingAccounts } = useQuery('paymentAccounts', paymentAccountsAPI.getAll);
  const { data: transactionsData, isLoading: loadingTransactions } = useQuery(
    ['paymentTransactions', dateRange],
    () => paymentAccountsAPI.getTransactions(dateRange)
  );

  const createAccountMutation = useMutation(paymentAccountsAPI.create, {
    onSuccess: () => {
      toast.success('Account added successfully');
      queryClient.invalidateQueries('paymentAccounts');
      setShowForm(false);
      resetFormData();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add account'),
  });

  const transactionMutation = useMutation(paymentAccountsAPI.createTransaction, {
    onSuccess: () => {
      toast.success('Transaction completed successfully');
      queryClient.invalidateQueries('paymentTransactions');
      queryClient.invalidateQueries('paymentAccounts');
      setShowTransactionForm(false);
      resetTransactionData();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Transaction failed'),
  });

  const accounts = accountsData?.data?.accounts || [];
  const transactions = transactionsData?.data?.transactions || [];

  const accountTypes = [
    { value: 'cash', label: 'Cash', icon: WalletIcon, colorClass: 'bg-green-100 text-green-600' },
    { value: 'bank', label: 'Bank Account', icon: BuildingLibraryIcon, colorClass: 'bg-blue-100 text-blue-600' },
    { value: 'upi', label: 'UPI / Wallet', icon: WalletIcon, colorClass: 'bg-violet-100 text-violet-600' },
    { value: 'credit', label: 'Credit Card', icon: CreditCardIcon, colorClass: 'bg-red-100 text-red-600' }
  ];

  const getAccountTypeInfo = (type) => {
    return accountTypes.find(t => t.value === type) || accountTypes[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      account_number: '',
      account_type: 'bank',
      opening_balance: 0,
      bank_name: '',
      bank_branch: '',
      upi_id: '',
      card_number: '',
      card_type: 'credit',
      status: 'active'
    });
  };

  const resetTransactionData = () => {
    setTransactionData({
      from_account: '',
      to_account: '',
      amount: 0,
      transaction_type: 'deposit',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createAccountMutation.mutate(formData);
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    transactionMutation.mutate(transactionData);
  };

  const openTransactionForm = (account = null) => {
    setSelectedAccount(account);
    setTransactionData({
      from_account: account?._id || '',
      to_account: '',
      amount: 0,
      transaction_type: 'deposit',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setShowTransactionForm(true);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || account.account_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalBalance = accounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="page-title">Payment Accounts</h1>
            <p className="page-subtitle">Manage your payment accounts and transactions</p>
          </div>
          <div className="flex gap-3">
              <button
              onClick={() => openTransactionForm()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Transaction
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        <div className="section-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
            </div>
            <WalletIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="section-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.filter(a => a.status === 'active').length}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="section-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => new Date(t.transaction_date).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="section-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Balance Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.filter(a => a.current_balance < 1000).length}
              </p>
            </div>
            <BellIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className=""
      >
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['accounts', 'transactions', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input text-sm"
                >
                  <option value="all">All Types</option>
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingAccounts ? (
              <div className="col-span-full"><LoadingSpinner /></div>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((account, index) => {
                const typeInfo = getAccountTypeInfo(account.account_type);
                const Icon = typeInfo.icon;
                
                return (
                  <motion.div
                    key={account._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`bg-white p-6 rounded-lg shadow-sm border-2 hover:shadow-lg transition-all duration-200 ${
                      account.status === 'active' ? 'border-gray-200' : 'border-gray-300 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${typeInfo.colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          account.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.status}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{account.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{typeInfo.label}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current Balance</span>
                        <span className={`font-semibold ${
                          (account.current_balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(account.current_balance)}
                        </span>
                      </div>
                      
                      {account.last_transaction && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Last Transaction</span>
                          <span className="text-xs text-gray-600">
                            {new Date(account.last_transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {account.account_number && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Account Number</span>
                          <span className="text-xs text-gray-600">****{account.account_number.slice(-4)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          openTransactionForm(account);
                        }}
                        className="w-full btn btn-secondary text-sm"
                      >
                        View Transactions
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No accounts found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 btn btn-primary"
                >
                  Add Your First Account
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input text-sm"
                    />
                  </div>
                  <button className="btn btn-secondary text-sm">
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loadingTransactions ? (
                <div className="p-8"><LoadingSpinner /></div>
              ) : transactions.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.account?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.transaction_type === 'deposit' 
                              ? 'bg-green-100 text-green-800'
                              : transaction.transaction_type === 'withdraw'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <ArrowPathIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Account Balance Report', description: 'View balance trends for all accounts', icon: WalletIcon, href: '/reports/account-balance' },
              { title: 'Cash Flow Report', description: 'Track money in and out flow', icon: ArrowTrendingUpIcon, href: '/reports/cash-flow' },
              { title: 'Payment Summary', description: 'Comprehensive payment analytics', icon: ChartBarIcon, href: '/reports/payment-summary' }
            ].map((report, index) => (
              <Link key={report.title} to={report.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                      <report.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{report.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    View Report
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Account Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Payment Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Account Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Bank Account"
                />
              </div>
              
              <div>
                <label className="label">Account Type</label>
                <select
                  required
                  className="input"
                  value={formData.account_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Opening Balance</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={formData.opening_balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              
              {formData.account_type === 'bank' && (
                <>
                  <div>
                    <label className="label">Bank Name</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.bank_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="e.g., State Bank"
                    />
                  </div>
                  <div>
                    <label className="label">Account Number</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.account_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                      placeholder="Account number"
                    />
                  </div>
                </>
              )}
              
              {formData.account_type === 'upi' && (
                <div>
                  <label className="label">UPI ID</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.upi_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, upi_id: e.target.value }))}
                    placeholder="e.g., user@paytm"
                  />
                </div>
              )}
              
              {formData.account_type === 'credit' && (
                <>
                  <div>
                    <label className="label">Card Number</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.card_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, card_number: e.target.value }))}
                      placeholder="Last 4 digits"
                    />
                  </div>
                  <div>
                    <label className="label">Card Type</label>
                    <select
                      className="input"
                      value={formData.card_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, card_type: e.target.value }))}
                    >
                      <option value="credit">Credit Card</option>
                      <option value="debit">Debit Card</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAccountMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {createAccountMutation.isLoading ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Transaction Modal */}
      {showTransactionForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTransactionForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Transaction</h2>
            {selectedAccount ? (
              <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                Working from {selectedAccount.name}.
              </p>
            ) : null}
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="label">Transaction Type</label>
                <select
                  required
                  className="input"
                  value={transactionData.transaction_type}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, transaction_type: e.target.value }))}
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="label">From Account</label>
                <select
                  required
                  className="input"
                  value={transactionData.from_account}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, from_account: e.target.value }))}
                >
                  <option value="">Select Account</option>
                  {accounts.filter(a => a.status === 'active').map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({formatCurrency(account.current_balance)})
                    </option>
                  ))}
                </select>
              </div>
              
              {transactionData.transaction_type === 'transfer' && (
                <div>
                  <label className="label">To Account</label>
                  <select
                    required
                    className="input"
                    value={transactionData.to_account}
                    onChange={(e) => setTransactionData(prev => ({ ...prev, to_account: e.target.value }))}
                  >
                    <option value="">Select Account</option>
                    {accounts
                      .filter(a => a.status === 'active' && a._id !== transactionData.from_account)
                      .map(account => (
                        <option key={account._id} value={account._id}>
                          {account.name} ({formatCurrency(account.current_balance)})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={transactionData.description}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Transaction description"
                />
              </div>
              
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={transactionData.transaction_date}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, transaction_date: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transactionMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {transactionMutation.isLoading ? 'Processing...' : 'Complete Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentAccounts;
