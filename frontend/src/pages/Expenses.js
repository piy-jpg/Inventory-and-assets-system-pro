import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import { expensesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ExpenseForm from '../components/ExpenseForm';

const Expenses = ({ initialShowForm = false }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [showForm, setShowForm] = useState(initialShowForm);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: expensesData, isLoading } = useQuery(
    ['expenses', { search, ...filter, page }],
    () => expensesAPI.getAll({ search, ...filter, page }),
    {
      keepPreviousData: true,
    }
  );

  const { data: categoriesData } = useQuery(
    'expenseCategories',
    expensesAPI.getCategories
  );

  const handleFormClose = () => {
    setShowForm(false);
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

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track and manage business expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Expense
        </button>
      </motion.div>

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
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No expenses found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
          onSuccess={() => {
            queryClient.invalidateQueries('expenses');
            handleFormClose();
          }}
        />
      )}
    </div>
  );
};

export default Expenses;
