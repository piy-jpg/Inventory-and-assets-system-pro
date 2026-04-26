import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery } from 'react-query';
import { stockTransfersAPI, warehousesAPI, inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const StockTransferForm = ({ onClose, onSuccess, transfer }) => {
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  
  // Update form data when transfer prop changes
  useEffect(() => {
    console.log('=== StockTransferForm: Transfer prop changed ===');
    console.log('Transfer object:', transfer);
    
    if (transfer) {
      // Extract from warehouse ID with multiple fallbacks
      const fromId = transfer.from_warehouse?.id || 
                     transfer.from_warehouse?._id || 
                     transfer.fromWarehouse?.id || 
                     transfer.fromWarehouse?._id ||
                     transfer.from_warehouse ||
                     '';
      
      // Extract to warehouse ID with multiple fallbacks
      const toId = transfer.to_warehouse?.id || 
                   transfer.to_warehouse?._id || 
                   transfer.toWarehouse?.id || 
                   transfer.toWarehouse?._id ||
                   transfer.to_warehouse ||
                   '';
      
      // Extract items with multiple fallbacks
      const transferItems = transfer.items?.map(item => ({
        product: item.product_id || item.product?._id || item.product || item._id || '',
        quantity: item.quantity || 1
      })) || [{ product: '', quantity: 1 }];
      
      const transferNotes = transfer.notes || transfer.description || '';
      
      console.log('Extracted fromWarehouse:', fromId);
      console.log('Extracted toWarehouse:', toId);
      console.log('Extracted items:', transferItems);
      console.log('Extracted notes:', transferNotes);
      
      setFromWarehouse(fromId);
      setToWarehouse(toId);
      setItems(transferItems);
      setNotes(transferNotes);
      setIsEdit(true);
    } else {
      console.log('No transfer data, resetting form');
      setFromWarehouse('');
      setToWarehouse('');
      setItems([{ product: '', quantity: 1 }]);
      setNotes('');
      setIsEdit(false);
    }
  }, [transfer]);

  const { data: warehouses, isLoading: warehousesLoading } = useQuery('warehouses', warehousesAPI.getAll);
  const { data: inventory, isLoading: inventoryLoading } = useQuery('inventory', () => inventoryAPI.getAll({ limit: 100 }));
  const warehouseOptions = warehouses?.data?.data?.warehouses || warehouses?.data?.warehouses || [];
  const inventoryOptions = inventory?.data?.data?.inventory || inventory?.data?.inventory || [];

  const isLoading = warehousesLoading || inventoryLoading;

  const createMutation = useMutation(stockTransfersAPI.create, {
    onSuccess: () => {
      toast.success('Transfer initiated successfully');
      onSuccess();
    },
    onError: (error) => {
      console.error('Create transfer error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate transfer');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => stockTransfersAPI.update(id, data),
    {
      onSuccess: (data, variables) => {
        toast.success('Transfer updated successfully');
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('stockTransferUpdated', { detail: { id: variables.id, data: variables.data } }));
        window.dispatchEvent(new CustomEvent('transfersActivityUpdate', { detail: { action: 'update', transferId: variables.id } }));
        console.log('✏️ Real-time: Stock transfer updated', variables);
        
        onSuccess();
      },
      onError: (error) => {
        console.error('Update transfer error:', error);
        toast.error(error.response?.data?.message || 'Failed to update transfer');
      },
    }
  );

  const addItem = () => setItems([...items, { product: '', quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('=== Submitting form ===');
    console.log('isEdit:', isEdit);
    console.log('transfer:', transfer);
    
    // Validation
    if (!fromWarehouse) {
      return toast.error('Please select source warehouse');
    }
    if (!toWarehouse) {
      return toast.error('Please select destination warehouse');
    }
    if (fromWarehouse === toWarehouse) {
      return toast.error('Source and destination warehouses must be different');
    }
    if (items.length === 0) {
      return toast.error('Please add at least one item to transfer');
    }
    if (items.some(i => !i.product)) {
      return toast.error('Please select products for all items');
    }
    if (items.some(i => !i.quantity || i.quantity < 1)) {
      return toast.error('Please enter valid quantities (minimum 1) for all items');
    }

    const transferData = {
      from_warehouse: fromWarehouse,
      to_warehouse: toWarehouse,
      items: items.map(item => ({
        product_id: item.product,
        quantity: parseInt(item.quantity)
      })),
      notes
    };

    console.log('Submitting transfer data:', transferData);

    if (isEdit) {
      // Extract transfer ID with multiple fallbacks
      const transferId = transfer?._id || 
                        transfer?.id || 
                        transfer?.transfer_id ||
                        transfer?.transferId ||
                        '';
      
      console.log('Extracted transfer ID for update:', transferId);
      
      if (!transferId) {
        console.error('Transfer ID missing. Transfer object:', transfer);
        return toast.error('Transfer ID is missing for update');
      }
      
      updateMutation.mutate({ id: transferId, data: transferData });
    } else {
      createMutation.mutate(transferData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Stock Transfer' : 'New Stock Transfer'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">From Warehouse</label>
                <select 
                  className="input" 
                  value={fromWarehouse} 
                  onChange={(e) => setFromWarehouse(e.target.value)} 
                  required
                  disabled={isEdit && transfer?.status !== 'pending'}
                >
                  <option value="">Select Source</option>
                  {warehouseOptions.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
                {isEdit && transfer?.status !== 'pending' && (
                  <p className="text-xs text-gray-500 mt-1">Cannot change warehouse for active transfers</p>
                )}
              </div>
              <div>
                <label className="label">To Warehouse</label>
                <select 
                  className="input" 
                  value={toWarehouse} 
                  onChange={(e) => setToWarehouse(e.target.value)} 
                  required
                  disabled={isEdit && transfer?.status !== 'pending'}
                >
                  <option value="">Select Destination</option>
                  {warehouseOptions.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
                {isEdit && transfer?.status !== 'pending' && (
                  <p className="text-xs text-gray-500 mt-1">Cannot change warehouse for active transfers</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900 text-sm">Items to Transfer</h4>
                <button 
                  type="button" 
                  onClick={addItem} 
                  className="text-primary-600 flex items-center text-sm font-bold"
                  disabled={isEdit && transfer?.status !== 'pending'}
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Product
                </button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="col-span-7">
                    <label className="label text-[10px] uppercase text-gray-400">Product</label>
                    <select 
                      className="input text-sm h-9" 
                      value={item.product} 
                      onChange={(e) => updateItem(index, 'product', e.target.value)} 
                      required
                      disabled={isEdit && transfer?.status !== 'pending'}
                    >
                      <option value="">Select Product</option>
                      {inventoryOptions.map(i => <option key={i._id} value={i._id}>{i.name} ({i.sku})</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="label text-[10px] uppercase text-gray-400">Qty</label>
                    <input 
                      type="number" 
                      className="input text-sm h-9" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} 
                      min="1" 
                      required
                      disabled={isEdit && transfer?.status !== 'pending'}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      disabled={isEdit && transfer?.status !== 'pending'}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {isEdit && transfer?.status !== 'pending' && (
                <p className="text-xs text-gray-500">Cannot modify items for active transfers</p>
              )}
            </div>

            <div>
              <label className="label text-sm">Notes</label>
              <textarea 
                className="input text-sm" 
                rows="2" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Transfer reason, vehicle info, etc."
              />
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-secondary flex-1 py-2.5"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={createMutation.isLoading || updateMutation.isLoading || isLoading} 
                className="btn btn-primary flex-1 py-2.5"
              >
                {(createMutation.isLoading || updateMutation.isLoading) 
                  ? (isEdit ? 'Updating...' : 'Initiating...') 
                  : (isEdit ? 'Update Transfer' : 'Initiate Transfer')
                }
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default StockTransferForm;
