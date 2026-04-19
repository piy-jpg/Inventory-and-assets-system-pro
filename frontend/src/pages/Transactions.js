import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import TransactionForm from '../components/TransactionForm';

const Transactions = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', status: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading } = useQuery(
    ['transactions', { search, ...filter, page }],
    () => transactionsAPI.getAll({ search, ...filter, page }),
    {
      keepPreviousData: true,
    }
  );

  const approveMutation = useMutation(transactionsAPI.approve, {
    onSuccess: () => {
      toast.success('Transaction approved successfully');
      queryClient.invalidateQueries('transactions');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve transaction');
    },
  });

  const cancelMutation = useMutation(transactionsAPI.cancel, {
    onSuccess: () => {
      toast.success('Transaction cancelled successfully');
      queryClient.invalidateQueries('transactions');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel transaction');
    },
  });

  const handleView = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this transaction?')) {
      approveMutation.mutate(id);
    }
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this transaction?')) {
      cancelMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'purchase': return 'bg-blue-100 text-blue-800';
      case 'sale': return 'bg-green-100 text-green-800';
      case 'adjustment': return 'bg-purple-100 text-purple-800';
      case 'transfer': return 'bg-orange-100 text-orange-800';
      case 'return': return 'bg-yellow-100 text-yellow-800';
      case 'disposal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const transactions = transactionsData?.data?.transactions || [];
  const pagination = transactionsData?.data?.pagination || {};

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage inventory transactions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Transaction
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
              <option value="return">Return</option>
              <option value="disposal">Disposal</option>
            </select>
            
            <select
              className="input"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
            
            <input
              type="date"
              className="input"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              placeholder="Start Date"
            />
            
            <input
              type="date"
              className="input"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              placeholder="End Date"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.reference?.order_id || transaction.transaction_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.reference?.invoice_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${transaction.amount.total?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(transaction)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(transaction._id)}
                              className="text-green-600 hover:text-green-900"
                              disabled={approveMutation.isLoading}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(transaction._id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={cancelMutation.isLoading}
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries('transactions');
          }}
        />
      )}
    </div>
  );
};

export default Transactions;
