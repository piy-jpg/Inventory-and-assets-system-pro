import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  WalletIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { paymentAccountsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockData from '../../data/mockData';

const Accounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const queryClient = useQueryClient();
  const { data: accountsData, isLoading: loadingAccounts } = useQuery('paymentAccounts', paymentAccountsAPI.getAll);

  const createAccountMutation = useMutation(
    async (accountData) => {
      try {
        const response = await paymentAccountsAPI.create(accountData);
        return response;
      } catch (apiError) {
        console.warn('API call failed, saving to localStorage:', apiError);
        const existingAccounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
        const newAccount = {
          _id: `ACC_${Date.now()}`,
          ...accountData,
          current_balance: accountData.opening_balance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: accountData.status || 'active'
        };
        const updatedAccounts = [...existingAccounts, newAccount];
        localStorage.setItem('paymentAccounts', JSON.stringify(updatedAccounts));
        return { data: { data: { account: newAccount } } };
      }
    },
    {
      onSuccess: () => {
        toast.success('Account added successfully');
        queryClient.invalidateQueries('paymentAccounts');
        setShowForm(false);
        resetFormData();
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to add account'),
    }
  );

  const accounts = accountsData?.data?.data?.accounts || [];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    createAccountMutation.mutate(formData);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || account.account_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalBalance = accounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);

  const handleViewAccount = (account) => {
    try {
      console.log('View account:', account);
      const accountDetails = `
Account Details:
================
Name: ${account.name}
Type: ${account.account_type}
Current Balance: ${formatCurrency(account.current_balance)}
Opening Balance: ${formatCurrency(account.opening_balance)}
Status: ${account.status}
${account.bank_name ? `Bank: ${account.bank_name}` : ''}
${account.account_number ? `Account Number: ****${account.account_number.slice(-4)}` : ''}
${account.upi_id ? `UPI ID: ${account.upi_id}` : ''}
${account.card_number ? `Card Number: ****${account.card_number}` : ''}
Created: ${new Date(account.created_at).toLocaleString()}
Updated: ${new Date(account.updated_at).toLocaleString()}
${account.last_transaction ? `Last Transaction: ${formatCurrency(account.last_transaction.amount)} on ${new Date(account.last_transaction.date).toLocaleDateString()}` : ''}
      `;
      alert(accountDetails.trim());
    } catch (error) {
      console.error('Error viewing account:', error);
      alert('Failed to view account details');
    }
  };

  const handleEditAccount = (account) => {
    try {
      console.log('Edit account clicked:', account);
      setSelectedAccount(account);
      setShowForm(true);
      setFormData({
        name: account.name,
        account_number: account.account_number || '',
        account_type: account.account_type,
        opening_balance: account.opening_balance,
        bank_name: account.bank_name || '',
        bank_branch: account.bank_branch || '',
        upi_id: account.upi_id || '',
        card_number: account.card_number || '',
        card_type: account.card_type || 'credit',
        status: account.status
      });
      console.log('Edit mode activated for account:', account.name);
    } catch (error) {
      console.error('Error editing account:', error);
      toast.error('Failed to open edit form');
    }
  };

  const handleDeleteAccount = (account) => {
    try {
      console.log('Delete account clicked:', account);
      const shouldDelete = window.confirm(`Are you sure you want to delete this account?\n\n${account.name}\n${formatCurrency(account.current_balance)}\n\nThis action cannot be undone.`);
      if (shouldDelete) {
        const existingAccounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
        const index = existingAccounts.findIndex(acc => acc._id === account._id);
        if (index > -1) {
          existingAccounts.splice(index, 1);
          localStorage.setItem('paymentAccounts', JSON.stringify(existingAccounts));
          queryClient.invalidateQueries('paymentAccounts');
          queryClient.invalidateQueries('paymentTransactions');
          toast.success(`Account deleted successfully: ${account.name}`);
        } else {
          toast.error('Account not found');
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accounts</h2>
          <p className="text-gray-600">Manage your payment accounts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
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
            <div className="bg-green-200 rounded-full p-2">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="section-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            </div>
            <BuildingLibraryIcon className="h-8 w-8 text-purple-500" />
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
            <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
      </div>

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
                      <button 
                        onClick={() => handleViewAccount(account)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View account details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditAccount(account)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit account"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAccount(account)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete account"
                      >
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
                  <Link
                    to="/payment-accounts/transactions"
                    state={{ initialAccount: account }}
                    className="w-full btn btn-secondary text-sm block text-center"
                  >
                    View Transactions
                  </Link>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedAccount ? 'Edit Payment Account' : 'Add Payment Account'}
            </h2>
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
                    placeholder="e.g., name@upi"
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
                      placeholder="Card number"
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
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedAccount(null);
                    resetFormData();
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAccountMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {createAccountMutation.isLoading ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Accounts;
