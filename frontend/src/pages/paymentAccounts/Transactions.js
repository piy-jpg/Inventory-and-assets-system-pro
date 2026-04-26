import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  ArrowPathIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { paymentAccountsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const Transactions = ({ initialAccount = null }) => {
  const location = useLocation();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(initialAccount);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [transactionData, setTransactionData] = useState({
    from_account: initialAccount?._id || '',
    to_account: '',
    amount: 0,
    transaction_type: 'deposit',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();
  const { data: accountsData } = useQuery('paymentAccounts', paymentAccountsAPI.getAll);
  const { data: transactionsData, isLoading: loadingTransactions } = useQuery(
    ['paymentTransactions', dateRange],
    async () => {
      try {
        const response = await paymentAccountsAPI.getTransactions(dateRange);
        return response;
      } catch (apiError) {
        console.warn('API call failed, loading from localStorage:', apiError);
        const storedTransactions = localStorage.getItem('paymentTransactions');
        if (storedTransactions) {
          return { data: { data: { transactions: JSON.parse(storedTransactions) } } };
        }
        return { data: { data: { transactions: [] } } };
      }
    },
    {
      refetchInterval: 5000,
      onSuccess: (data) => {
        if (data?.data?.data?.transactions) {
          localStorage.setItem('paymentTransactions', JSON.stringify(data.data.data.transactions));
        }
      }
    }
  );

  const transactionMutation = useMutation(
    async (transactionData) => {
      try {
        const response = await paymentAccountsAPI.createTransaction(transactionData);
        return response;
      } catch (apiError) {
        console.warn('API call failed, saving to localStorage:', apiError);
        const existingTransactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
        const existingAccounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
        
        const newTransaction = {
          _id: `TXN_${Date.now()}`,
          transaction_id: `TXN_${Date.now()}`,
          ...transactionData,
          amount: Number(transactionData.amount),
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const accountIndex = existingAccounts.findIndex(acc => acc._id === transactionData.from_account);
        if (accountIndex > -1) {
          if (transactionData.transaction_type === 'deposit') {
            existingAccounts[accountIndex].current_balance += transactionData.amount;
          } else if (transactionData.transaction_type === 'withdraw') {
            existingAccounts[accountIndex].current_balance -= transactionData.amount;
          } else if (transactionData.transaction_type === 'transfer' && transactionData.to_account) {
            existingAccounts[accountIndex].current_balance -= transactionData.amount;
            const toAccountIndex = existingAccounts.findIndex(acc => acc._id === transactionData.to_account);
            if (toAccountIndex > -1) {
              existingAccounts[toAccountIndex].current_balance += transactionData.amount;
            }
          }
          existingAccounts[accountIndex].last_transaction = {
            amount: transactionData.amount,
            date: transactionData.transaction_date
          };
          existingAccounts[accountIndex].updated_at = new Date().toISOString();
          localStorage.setItem('paymentAccounts', JSON.stringify(existingAccounts));
        }
        
        const updatedTransactions = [...existingTransactions, newTransaction];
        localStorage.setItem('paymentTransactions', JSON.stringify(updatedTransactions));
        return { data: { data: { transaction: newTransaction } } };
      }
    },
    {
      onSuccess: () => {
        toast.success('Transaction completed successfully');
        queryClient.invalidateQueries('paymentTransactions');
        queryClient.invalidateQueries('paymentAccounts');
        setShowTransactionForm(false);
        resetTransactionData();
        setSelectedTransaction(null);
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Transaction failed'),
    }
  );

  const updateTransactionMutation = useMutation(
    async (data) => {
      try {
        const response = await paymentAccountsAPI.updateTransaction(data);
        return response;
      } catch (apiError) {
        console.warn('API call failed, updating in localStorage:', apiError);
        const existingTransactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
        const existingAccounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
        
        const index = existingTransactions.findIndex(txn => txn._id === data.id);
        if (index > -1) {
          const oldTransaction = existingTransactions[index];
          const accountIndex = existingAccounts.findIndex(acc => acc._id === oldTransaction.from_account);
          if (accountIndex > -1) {
            if (oldTransaction.transaction_type === 'deposit') {
              existingAccounts[accountIndex].current_balance -= oldTransaction.amount;
            } else if (oldTransaction.transaction_type === 'withdraw') {
              existingAccounts[accountIndex].current_balance += oldTransaction.amount;
            }
          }
          
          existingTransactions[index] = {
            ...oldTransaction,
            ...data,
            amount: Number(data.amount),
            updated_at: new Date().toISOString()
          };
          
          if (accountIndex > -1) {
            if (data.transaction_type === 'deposit') {
              existingAccounts[accountIndex].current_balance += data.amount;
            } else if (data.transaction_type === 'withdraw') {
              existingAccounts[accountIndex].current_balance -= data.amount;
            }
            existingAccounts[accountIndex].updated_at = new Date().toISOString();
            localStorage.setItem('paymentAccounts', JSON.stringify(existingAccounts));
          }
          
          localStorage.setItem('paymentTransactions', JSON.stringify(existingTransactions));
          return { data: { data: { transaction: existingTransactions[index] } } };
        }
        throw new Error('Transaction not found');
      }
    },
    {
      onSuccess: () => {
        toast.success('Transaction updated successfully');
        queryClient.invalidateQueries('paymentTransactions');
        queryClient.invalidateQueries('paymentAccounts');
        setShowTransactionForm(false);
        resetTransactionData();
        setSelectedTransaction(null);
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to update transaction'),
    }
  );

  const accounts = accountsData?.data?.data?.accounts || [];
  const transactions = transactionsData?.data?.data?.transactions || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const resetTransactionData = () => {
    setTransactionData({
      from_account: selectedAccount?._id || '',
      to_account: '',
      amount: 0,
      transaction_type: 'deposit',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    if (selectedTransaction) {
      updateTransactionMutation.mutate({ 
        id: selectedTransaction._id, 
        ...transactionData 
      });
    } else {
      transactionMutation.mutate(transactionData);
    }
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

  const handleEditTransaction = (transaction) => {
    try {
      setSelectedTransaction(transaction);
      setShowTransactionForm(true);
      setTransactionData({
        from_account: transaction.from_account,
        to_account: transaction.to_account || '',
        amount: transaction.amount,
        transaction_type: transaction.transaction_type,
        description: transaction.description,
        transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      toast(`Editing transaction: ${transaction.description}`);
    } catch (error) {
      console.error('Error editing transaction:', error);
      toast.error('Failed to open edit form');
    }
  };

  const handleReviewTransaction = (transaction) => {
    try {
      const account = accounts.find(acc => acc._id === transaction.from_account);
      const reviewDetails = `
Transaction Review:
================
Transaction ID: ${transaction.transaction_id}
Date: ${new Date(transaction.transaction_date).toLocaleString()}
Account: ${account?.name || 'N/A'}
Type: ${transaction.transaction_type}
Amount: ${formatCurrency(transaction.amount)}
Description: ${transaction.description}
Status: ${transaction.status}
Created: ${new Date(transaction.created_at).toLocaleString()}
${transaction.to_account ? `To Account: ${accounts.find(acc => acc._id === transaction.to_account)?.name || 'N/A'}` : ''}
      `;
      alert(reviewDetails.trim());
    } catch (error) {
      console.error('Error reviewing transaction:', error);
      alert('Failed to review transaction');
    }
  };

  const handleDeleteTransaction = (transaction) => {
    try {
      const account = accounts.find(acc => acc._id === transaction.from_account);
      const shouldDelete = window.confirm(`Are you sure you want to delete this transaction?\n\nAccount: ${account?.name || 'N/A'}\nType: ${transaction.transaction_type}\nAmount: ${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}\n\nThis action cannot be undone.`);
      if (shouldDelete) {
        const existingTransactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
        const existingAccounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
        
        const index = existingTransactions.findIndex(txn => txn._id === transaction._id);
        if (index > -1) {
          existingTransactions.splice(index, 1);
          
          const accountIndex = existingAccounts.findIndex(acc => acc._id === transaction.from_account);
          if (accountIndex > -1) {
            if (transaction.transaction_type === 'deposit') {
              existingAccounts[accountIndex].current_balance -= transaction.amount;
            } else if (transaction.transaction_type === 'withdraw') {
              existingAccounts[accountIndex].current_balance += transaction.amount;
            } else if (transaction.transaction_type === 'transfer' && transaction.to_account) {
              existingAccounts[accountIndex].current_balance += transaction.amount;
              const toAccountIndex = existingAccounts.findIndex(acc => acc._id === transaction.to_account);
              if (toAccountIndex > -1) {
                existingAccounts[toAccountIndex].current_balance -= transaction.amount;
              }
            }
            existingAccounts[accountIndex].updated_at = new Date().toISOString();
            localStorage.setItem('paymentAccounts', JSON.stringify(existingAccounts));
          }
          
          localStorage.setItem('paymentTransactions', JSON.stringify(existingTransactions));
          queryClient.invalidateQueries('paymentTransactions');
          queryClient.invalidateQueries('paymentAccounts');
          toast.success(`Transaction deleted successfully: ${transaction.description}`);
        } else {
          toast.error('Transaction not found');
        }
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleExportTransactions = () => {
    try {
      const csvContent = [
        ['Date', 'Account', 'Type', 'Description', 'Amount', 'Status'],
        ...transactions.map(txn => {
          const account = accounts.find(acc => acc._id === txn.from_account);
          return [
            new Date(txn.transaction_date).toLocaleDateString(),
            account?.name || 'N/A',
            txn.transaction_type,
            txn.description,
            formatCurrency(txn.amount),
            txn.status
          ];
        })
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Transaction report exported successfully!');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  useEffect(() => {
    console.log('Transactions useEffect triggered with location.state:', location.state);
    if (location.state?.openTransactionForm) {
      console.log('Opening transaction form with type:', location.state?.transactionType);
      setSelectedAccount(null);
      setSelectedTransaction(null);
      const transactionType = location.state?.transactionType === 'withdrawal' ? 'withdraw' : (location.state?.transactionType || 'deposit');
      setTransactionData({
        from_account: '',
        to_account: '',
        amount: 0,
        transaction_type: transactionType,
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      setShowTransactionForm(true);
      // Clear the state to prevent re-opening
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
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
              <button
                onClick={() => openTransactionForm()}
                className="btn btn-primary text-sm flex items-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                New Transaction
              </button>
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
              <button onClick={handleExportTransactions} className="btn btn-secondary text-sm">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const account = accounts.find(acc => acc._id === transaction.from_account);
                        return account?.name || 'N/A';
                      })()}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="px-2 py-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900 font-medium text-xs rounded transition-colors"
                          title="Edit transaction"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleReviewTransaction(transaction)}
                          className="px-2 py-1 text-green-600 hover:bg-green-50 hover:text-green-900 font-medium text-xs rounded transition-colors"
                          title="Review transaction"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-900 font-medium text-xs rounded transition-colors"
                          title="Delete transaction"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <ArrowPathIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
              <button
                onClick={() => openTransactionForm()}
                className="mt-4 btn btn-primary"
              >
                Create Your First Transaction
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedTransaction ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="label">From Account</label>
                <select
                  required
                  className="input"
                  value={transactionData.from_account}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, from_account: e.target.value }))}
                >
                  <option value="">Select account</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>{account.name}</option>
                  ))}
                </select>
              </div>
              
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
              
              {transactionData.transaction_type === 'transfer' && (
                <div>
                  <label className="label">To Account</label>
                  <select
                    required
                    className="input"
                    value={transactionData.to_account}
                    onChange={(e) => setTransactionData(prev => ({ ...prev, to_account: e.target.value }))}
                  >
                    <option value="">Select account</option>
                    {accounts.filter(acc => acc._id !== transactionData.from_account).map(account => (
                      <option key={account._id} value={account._id}>{account.name}</option>
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
                  min="0"
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
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setSelectedTransaction(null);
                    resetTransactionData();
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transactionMutation.isLoading || updateTransactionMutation.isLoading}
                  className="btn btn-primary flex-1"
                >
                  {transactionMutation.isLoading || updateTransactionMutation.isLoading ? 'Processing...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Transactions;
