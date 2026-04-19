import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery } from 'react-query';
import { stockTransfersAPI, warehousesAPI, inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const StockTransferForm = ({ onClose, onSuccess }) => {
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');

  const { data: warehouses } = useQuery('warehouses', warehousesAPI.getAll);
  const { data: inventory } = useQuery('inventory', () => inventoryAPI.getAll({ limit: 100 }));

  const createMutation = useMutation(stockTransfersAPI.create, {
    onSuccess: () => {
      toast.success('Transfer initiated successfully');
      onSuccess();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to initiate transfer'),
  });

  const addItem = () => setItems([...items, { product: '', quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromWarehouse || !toWarehouse || fromWarehouse === toWarehouse) {
      return toast.error('Please select different source and destination warehouses');
    }
    if (items.some(i => !i.product)) return toast.error('Please select products for all items');

    createMutation.mutate({
      from_warehouse: fromWarehouse,
      to_warehouse: toWarehouse,
      items,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">New Stock Transfer</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">From Warehouse</label>
              <select className="input" value={fromWarehouse} onChange={(e) => setFromWarehouse(e.target.value)} required>
                <option value="">Select Source</option>
                {warehouses?.data?.warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">To Warehouse</label>
              <select className="input" value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)} required>
                <option value="">Select Destination</option>
                {warehouses?.data?.warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 text-sm">Items to Transfer</h4>
              <button type="button" onClick={addItem} className="text-primary-600 flex items-center text-sm font-bold"><PlusIcon className="h-4 w-4 mr-1" /> Add Product</button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="col-span-7">
                  <label className="label text-[10px] uppercase text-gray-400">Product</label>
                  <select className="input text-sm h-9" value={item.product} onChange={(e) => updateItem(index, 'product', e.target.value)} required>
                    <option value="">Select Product</option>
                    {inventory?.data?.inventory.map(i => <option key={i._id} value={i._id}>{i.name} ({i.sku})</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="label text-[10px] uppercase text-gray-400">Qty</label>
                  <input type="number" className="input text-sm h-9" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} min="1" required />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="label text-sm">Notes</label>
            <textarea className="input text-sm" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Transfer reason, vehicle info, etc."></textarea>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={createMutation.isLoading} className="btn btn-primary flex-1 py-2.5">
              {createMutation.isLoading ? 'Initiating...' : 'Initiate Transfer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StockTransferForm;
