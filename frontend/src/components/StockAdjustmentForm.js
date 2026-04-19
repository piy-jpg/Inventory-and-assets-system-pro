import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery } from 'react-query';
import { stockAdjustmentsAPI, inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const StockAdjustmentForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    product: '',
    type: 'increase',
    quantity: 1,
    reason: 'correction',
    notes: ''
  });

  const { data: inventory } = useQuery('inventory', () => inventoryAPI.getAll({ limit: 100 }));

  const createMutation = useMutation(stockAdjustmentsAPI.create, {
    onSuccess: () => {
      toast.success('Adjustment recorded successfully');
      onSuccess();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to record adjustment'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.product) return toast.error('Please select a product');
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">New Stock Adjustment</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="label">Product</label>
            <select 
              className="input" 
              value={formData.product} 
              onChange={(e) => setFormData({...formData, product: e.target.value})} 
              required
            >
              <option value="">Select Product</option>
              {inventory?.data?.inventory.map(i => (
                <option key={i._id} value={i._id}>{i.name} (Stock: {i.quantity})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Adjustment Type</label>
              <select 
                className="input" 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="increase">Increase (+)</option>
                <option value="decrease">Decrease (-)</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input 
                type="number" 
                className="input" 
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} 
                min="1" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="label">Reason</label>
            <select 
              className="input" 
              value={formData.reason} 
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            >
              <option value="correction">Correction</option>
              <option value="damage">Damage</option>
              <option value="theft">Theft</option>
              <option value="expired">Expired</option>
              <option value="return">Customer Return</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea 
              className="input" 
              rows="2" 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              placeholder="Explain the reason for adjustment..."
            ></textarea>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isLoading} className="btn btn-primary flex-1">
              {createMutation.isLoading ? 'Recording...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StockAdjustmentForm;
