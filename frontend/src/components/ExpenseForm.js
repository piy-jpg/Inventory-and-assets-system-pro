import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { expensesAPI } from '../services/api';
import toast from 'react-hot-toast';

const ExpenseForm = ({ onClose, onSuccess, expense, search, filter, page }) => {
  console.log('ExpenseForm mounted with expense:', expense);
  console.log('Query params:', { search, filter, page });
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    payment_method: 'cash',
    status: 'paid'
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  // Populate form when editing an expense
  useEffect(() => {
    console.log('=== EXPENSE PROP CHANGED ===');
    console.log('Expense prop:', expense);
    if (expense) {
      console.log('Populating form with expense:', expense);
      setFormData({
        category: expense.category || '',
        amount: expense.amount || '',
        date: expense.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expense.description || '',
        payment_method: expense.payment_method || 'cash',
        status: expense.status || 'paid'
      });
      console.log('Form data set to:', {
        category: expense.category || '',
        amount: expense.amount || '',
        date: expense.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expense.description || '',
        payment_method: expense.payment_method || 'cash',
        status: expense.status || 'paid'
      });
    } else {
      console.log('No expense, resetting form');
      // Reset form when not editing
      setFormData({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        payment_method: 'cash',
        status: 'paid'
      });
    }
  }, [expense]);

  const createMutation = useMutation(
    async (expenseData) => {
      console.log('Creating new expense:', expenseData);
      try {
        // Try API first
        const response = await expensesAPI.create(expenseData);
        console.log('API create successful:', response);
        return response;
      } catch (apiError) {
        console.warn('API call failed, falling back to localStorage:', apiError);
        // Fallback to localStorage if API fails
        const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const newExpense = {
          _id: `EXP_${Date.now()}`,
          expense_id: `EXP_${Date.now()}`,
          ...expenseData,
          amount: Number(expenseData.amount),
          expense_date: new Date(expenseData.date).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const updatedExpenses = [...existingExpenses, newExpense];
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        console.log('Expense saved to localStorage:', newExpense);
        return { data: { data: { expense: newExpense } } };
      }
    },
    {
      onSuccess: (data) => {
        console.log('Create mutation successful:', data);
        toast.success('Expense recorded successfully');
        
        // Update localStorage
        const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const newExpense = data.data?.data?.expense || data.data?.expense;
        if (newExpense) {
          const index = existingExpenses.findIndex(exp => exp._id === newExpense._id || exp.expense_id === newExpense.expense_id);
          if (index === -1) {
            existingExpenses.push(newExpense);
            localStorage.setItem('expenses', JSON.stringify(existingExpenses));
            console.log('Added new expense to localStorage:', newExpense);
          }
        }
        
        // Directly update the cache with exact query key
        queryClient.setQueryData(['expenses', { search, ...filter, page }], (oldData) => {
          if (!oldData) {
            return { data: { expenses: [newExpense] } };
          }
          const expenses = oldData.data?.expenses || [];
          console.log('Adding new expense to cache:', newExpense);
          console.log('Current expenses in cache:', expenses);
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              expenses: [...expenses, newExpense]
            }
          };
        });
        
        console.log('Calling onSuccess callback to trigger refresh');
        onSuccess();
      },
      onError: (error) => {
        console.error('Failed to record expense:', error);
        toast.error(error.response?.data?.message || 'Failed to record expense');
      },
    }
  );

  const updateMutation = useMutation(
    async (expenseData) => {
      const expenseId = expense?._id || expense?.expense_id;
      console.log('Updating expense with ID:', expenseId);
      console.log('Expense data to update:', expenseData);
      console.log('Original expense:', expense);
      
      // Always update localStorage first to ensure changes are saved
      const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      console.log('Existing expenses:', existingExpenses);
      const index = existingExpenses.findIndex(exp => exp._id === expenseId || exp.expense_id === expenseId);
      console.log('Expense index found:', index);
      
      if (index > -1) {
        existingExpenses[index] = {
          ...existingExpenses[index],
          ...expenseData,
          amount: Number(expenseData.amount),
          expense_date: new Date(expenseData.date).toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('expenses', JSON.stringify(existingExpenses));
        console.log('Updated expenses in localStorage:', existingExpenses[index]);
      } else {
        console.error('Expense not found in localStorage, appending as new');
        // If not found, append as new expense
        const newExpense = {
          _id: expenseId,
          expense_id: expenseId,
          ...expenseData,
          amount: Number(expenseData.amount),
          expense_date: new Date(expenseData.date).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        existingExpenses.push(newExpense);
        localStorage.setItem('expenses', JSON.stringify(existingExpenses));
      }
      
      // Try API call
      try {
        const response = await expensesAPI.update(expenseId, expenseData);
        console.log('API update successful:', response);
        return response;
      } catch (apiError) {
        console.warn('API call failed, but localStorage was updated:', apiError);
        // Return the localStorage data since we already updated it
        return { data: { data: { expense: existingExpenses[index] || existingExpenses[existingExpenses.length - 1] } } };
      }
    },
    {
      onSuccess: (data) => {
        console.log('Update mutation successful:', data);
        toast.success('Expense updated successfully');
        
        // Update localStorage
        const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const expenseId = expense?._id || expense?.expense_id;
        const index = existingExpenses.findIndex(exp => exp._id === expenseId || exp.expense_id === expenseId);
        
        if (index > -1) {
          const updatedExpense = data.data?.data?.expense || data.data?.expense;
          existingExpenses[index] = {
            ...existingExpenses[index],
            ...updatedExpense
          };
          localStorage.setItem('expenses', JSON.stringify(existingExpenses));
          console.log('Forced localStorage update:', existingExpenses[index]);
        }
        
        // Directly update the cache with exact query key
        queryClient.setQueryData(['expenses', { search, ...filter, page }], (oldData) => {
          if (!oldData) return oldData;
          const expenses = oldData.data?.expenses || [];
          const updatedExpense = data.data?.data?.expense || data.data?.expense;
          const expenseId = expense?._id || expense?.expense_id;
          
          console.log('Updating expense in cache:', updatedExpense);
          console.log('Current expenses in cache:', expenses);
          
          const updatedExpenses = expenses.map(exp => 
            (exp._id === expenseId || exp.expense_id === expenseId) 
              ? { ...exp, ...updatedExpense }
              : exp
          );
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              expenses: updatedExpenses
            }
          };
        });
        
        console.log('Calling onSuccess callback to trigger refresh');
        onSuccess();
      },
      onError: (error) => {
        console.error('Update mutation error:', error);
        toast.error(error.response?.data?.message || 'Failed to update expense');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form submitted with data:', formData);
    console.log('Is edit mode:', !!expense);
    console.log('Expense object:', expense);
    console.log('Create mutation status:', createMutation.status);
    console.log('Update mutation status:', updateMutation.status);
    
    // Validate form
    const newErrors = {};
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Form validation errors:', newErrors);
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }
    
    console.log('Form validation passed');
    setErrors({});
    
    if (expense) {
      console.log('Calling updateMutation with data:', formData);
      updateMutation.mutate(formData);
    } else {
      console.log('Calling createMutation with data:', formData);
      createMutation.mutate(formData);
    }
    console.log('=== FORM SUBMISSION END ===');
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} style={{ zIndex: 9998 }} />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative"
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{expense ? 'Edit Expense' : 'Add New Expense'}</h3>
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
                  className={`input ${errors.category ? 'border-red-500' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className={`input ${errors.amount ? 'border-red-500' : ''}`}
                  value={formData.amount}
                  onChange={handleChange}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>
            </div>

            <div>
              <label className="label">Date</label>
              <input
                type="date"
                name="date"
                required
                className={`input ${errors.date ? 'border-red-500' : ''}`}
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                rows="3"
                className={`input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Expense details..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="btn btn-primary flex-1 flex items-center justify-center"
                onClick={(e) => {
                  console.log('Submit button clicked');
                  console.log('Form data at click:', formData);
                }}
              >
                {createMutation.isLoading || updateMutation.isLoading 
                  ? (expense ? 'Updating...' : 'Recording...') 
                  : (expense ? 'Update Expense' : 'Save Expense')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ExpenseForm;
