import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery } from 'react-query';
import { purchasesAPI, suppliersAPI, inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const PurchaseForm = ({ onClose, onSuccess }) => {
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, purchase_price: 0 }]);
  const [notes, setNotes] = useState('');

  const { data: suppliers } = useQuery('suppliers', () => suppliersAPI.getAll({ limit: 100 }));
  const { data: inventory } = useQuery('inventory', () => inventoryAPI.getAll({ limit: 100 }));

  const createMutation = useMutation(purchasesAPI.create, {
    onSuccess: () => {
      toast.success('Purchase recorded');
      onSuccess();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to record purchase'),
  });

  const addItem = () => setItems([...items, { product: '', quantity: 1, purchase_price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.purchase_price), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId || items.some(i => !i.product)) {
      return toast.error('Please fill all required fields');
    }

    const purchaseData = {
      supplier: supplierId,
      items: items.map(i => ({ ...i, total: i.quantity * i.purchase_price })),
      total_amount: calculateTotal(),
      notes,
      status: 'ordered'
    };

    createMutation.mutate(purchaseData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">New Purchase Order</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="label">Supplier</label>
            <select className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
              <option value="">Select Supplier</option>
              {suppliers?.data?.suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.company_name})</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900">Items</h4>
              <button type="button" onClick={addItem} className="text-primary-600 flex items-center text-sm font-medium"><PlusIcon className="h-4 w-4 mr-1" /> Add Item</button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg">
                <div className="md:col-span-5">
                  <label className="label text-xs">Product</label>
                  <select className="input text-sm" value={item.product} onChange={(e) => updateItem(index, 'product', e.target.value)} required>
                    <option value="">Select Product</option>
                    {inventory?.data?.inventory.map(i => <option key={i._id} value={i._id}>{i.name} (SKU: {i.sku})</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label text-xs">Quantity</label>
                  <input type="number" className="input text-sm" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} min="1" required />
                </div>
                <div className="md:col-span-3">
                  <label className="label text-xs">Purchase Price</label>
                  <input type="number" className="input text-sm" value={item.purchase_price} onChange={(e) => updateItem(index, 'purchase_price', parseFloat(e.target.value))} min="0" step="0.01" required />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-5 w-5" /></button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional instructions..."></textarea>
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
            <div className="text-lg font-bold text-gray-900">Total: ${calculateTotal().toFixed(2)}</div>
            <div className="space-x-3">
              <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={createMutation.isLoading} className="btn btn-primary">{createMutation.isLoading ? 'Processing...' : 'Place Order'}</button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PurchaseForm;
