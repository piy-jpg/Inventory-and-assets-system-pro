import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { transactionsAPI, inventoryAPI, suppliersAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const TransactionForm = ({ transaction, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'purchase',
    items: [{ inventory_item: '', quantity: 1, unit_price: 0 }],
    amount: {
      total: 0,
      currency: 'USD',
    },
    reference: {
      order_id: '',
      invoice_id: '',
      notes: '',
    },
    payment: {
      method: 'bank_transfer',
      status: 'pending',
      due_date: '',
    },
  });

  const queryClient = useQueryClient();
  const isEditing = !!transaction;

  const { data: inventory } = useQuery('inventory', () => inventoryAPI.getAll({ limit: 1000 }));
  const { data: suppliers } = useQuery('suppliers', () => suppliersAPI.getAll({ limit: 100 }));

  const createMutation = useMutation(transactionsAPI.create, {
    onSuccess: () => {
      toast.success('Transaction created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => transactionsAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Transaction updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update transaction');
      },
    }
  );

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'purchase',
        items: transaction.items || [{ inventory_item: '', quantity: 1, unit_price: 0 }],
        amount: {
          total: transaction.amount?.total || 0,
          currency: transaction.amount?.currency || 'USD',
        },
        reference: {
          order_id: transaction.reference?.order_id || '',
          invoice_id: transaction.reference?.invoice_id || '',
          notes: transaction.reference?.notes || '',
        },
        payment: {
          method: transaction.payment?.method || 'bank_transfer',
          status: transaction.payment?.status || 'pending',
          due_date: transaction.payment?.due_date ? new Date(transaction.payment.due_date).toISOString().split('T')[0] : '',
        },
      });
    }
  }, [transaction]);

  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    setFormData(prev => ({
      ...prev,
      amount: {
        ...prev.amount,
        total,
      },
    }));
  }, [formData.items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { inventory_item: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
      })),
      amount: {
        ...formData.amount,
        total: parseFloat(formData.amount.total),
      },
      payment: {
        ...formData.payment,
        due_date: formData.payment.due_date ? new Date(formData.payment.due_date) : undefined,
      },
    };

    if (isEditing) {
      updateMutation.mutate({ id: transaction._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Transaction' : 'Create New Transaction'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Transaction Type *</label>
                    <select
                      name="type"
                      required
                      className="input"
                      value={formData.type}
                      onChange={handleChange}
                      disabled={isEditing}
                    >
                      <option value="purchase">Purchase</option>
                      <option value="sale">Sale</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="transfer">Transfer</option>
                      <option value="return">Return</option>
                      <option value="disposal">Disposal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Payment Method</label>
                    <select
                      name="payment.method"
                      className="input"
                      value={formData.payment.method}
                      onChange={handleChange}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Currency</label>
                    <select
                      name="amount.currency"
                      className="input"
                      value={formData.amount.currency}
                      onChange={handleChange}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-900">Items</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="btn btn-secondary flex items-center text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="label">Inventory Item *</label>
                          <select
                            value={item.inventory_item}
                            onChange={(e) => handleItemChange(index, 'inventory_item', e.target.value)}
                            className="input"
                            required
                          >
                            <option value="">Select item</option>
                            {inventory?.data?.inventory?.map((invItem) => (
                              <option key={invItem._id} value={invItem._id}>
                                {invItem.name} - ${invItem.price.cost}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="w-24">
                          <label className="label">Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="input"
                            required
                          />
                        </div>
                        
                        <div className="w-32">
                          <label className="label">Unit Price *</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            className="input"
                            required
                          />
                        </div>
                        
                        <div className="w-32">
                          <label className="label">Total</label>
                          <div className="input bg-gray-50">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </div>
                        </div>
                        
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Order ID</label>
                    <input
                      type="text"
                      name="reference.order_id"
                      className="input"
                      value={formData.reference.order_id}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Invoice ID</label>
                    <input
                      type="text"
                      name="reference.invoice_id"
                      className="input"
                      value={formData.reference.invoice_id}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Due Date</label>
                    <input
                      type="date"
                      name="payment.due_date"
                      className="input"
                      value={formData.payment.due_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    name="reference.notes"
                    rows="3"
                    className="input"
                    value={formData.reference.notes}
                    onChange={handleChange}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-medium text-gray-900">
                      Total: ${formData.amount.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="btn btn-primary flex items-center"
                  >
                    {createMutation.isLoading || updateMutation.isLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      isEditing ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionForm;
