import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { expensesAPI } from '../services/api';
import toast from 'react-hot-toast';

const ExpenseForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    payment_method: 'cash',
    status: 'paid'
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation(expensesAPI.create, {
    onSuccess: () => {
      toast.success('Expense recorded successfully');
      queryClient.invalidateQueries('expenses');
      queryClient.invalidateQueries('expenseCategories');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record expense');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Add New Expense</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <input
                  type="text"
                  name="category"
                  required
                  placeholder="e.g. Rent, Utilities"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Date</label>
              <input
                type="date"
                name="date"
                required
                className="input"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                rows="3"
                className="input"
                placeholder="Expense details..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Payment Method</label>
                <select
                  name="payment_method"
                  className="input"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  name="status"
                  className="input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                {createMutation.isLoading ? 'Recording...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ExpenseForm;
