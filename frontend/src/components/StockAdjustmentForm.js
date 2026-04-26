import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery } from 'react-query';
import { stockAdjustmentsAPI, inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const normalizeProducts = (inventoryResponse) => {
  const products =
    inventoryResponse?.data?.inventory ||
    inventoryResponse?.data?.products ||
    inventoryResponse?.data ||
    [];

  return Array.isArray(products) ? products : [];
};

const getSignedQuantity = (type, quantity) => (type === 'increase' ? quantity : -quantity);

const StockAdjustmentForm = ({ onClose, onSuccess, adjustment = null }) => {
  const isEditing = Boolean(adjustment);
  const [formData, setFormData] = useState({
    product: adjustment?.product?._id || adjustment?.product || '',
    type: adjustment?.type || 'increase',
    quantity: adjustment?.quantity || 1,
    reason: adjustment?.reason || 'correction',
    notes: adjustment?.notes || '',
  });

  const { data: inventory, isLoading: isLoadingInventory, error: inventoryError } = useQuery(
    'inventory',
    () => inventoryAPI.getAll({ limit: 100 })
  );

  const products = useMemo(() => normalizeProducts(inventory), [inventory]);
  const selectedProduct = products.find((product) => product._id === formData.product);
  const originalProductId = adjustment?.product?._id || adjustment?.product || null;
  const originalSignedQuantity = isEditing
    ? getSignedQuantity(adjustment.type, adjustment.quantity)
    : 0;
  const currentStock = selectedProduct?.quantity || 0;

  const baselineStock = useMemo(() => {
    if (!selectedProduct) {
      return 0;
    }

    if (isEditing && selectedProduct._id === originalProductId) {
      return currentStock - originalSignedQuantity;
    }

    return currentStock;
  }, [currentStock, isEditing, originalProductId, originalSignedQuantity, selectedProduct]);

  const signedQuantity = getSignedQuantity(formData.type, formData.quantity);
  const projectedStock = baselineStock + signedQuantity;
  const isStockInsufficient = selectedProduct && projectedStock < 0;

  const mutation = useMutation(
    (payload) =>
      isEditing
        ? stockAdjustmentsAPI.update(adjustment._id, payload)
        : stockAdjustmentsAPI.create(payload),
    {
      onSuccess: (data) => {
        toast.success(isEditing ? 'Adjustment updated successfully' : 'Adjustment recorded successfully');
        onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message || 'Failed to save adjustment');
      },
    }
  );

  if (isLoadingInventory) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (inventoryError) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Inventory</h3>
          <p className="text-gray-600 mb-4">Failed to load inventory data. Please try again.</p>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.product) {
      toast.error('Please select a product');
      return;
    }

    if (!formData.quantity || formData.quantity < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!formData.reason) {
      toast.error('Please select a reason for adjustment');
      return;
    }

    if (!selectedProduct) {
      toast.error('Selected product not found');
      return;
    }

    if (isStockInsufficient) {
      toast.error(`Insufficient stock. Projected stock cannot go below 0.`);
      return;
    }

    mutation.mutate({
      product: formData.product,
      type: formData.type,
      quantity: Number(formData.quantity),
      reason: formData.reason,
      notes: formData.notes || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Stock Adjustment' : 'New Stock Adjustment'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="label">Product</label>
            <select
              className="input"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} {product.sku ? `(${product.sku})` : ''} - Stock: {product.quantity}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-gray-600 text-sm mt-1">
                Live stock: <span className="font-semibold">{currentStock}</span> units
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Adjustment Type</label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="increase">Increase (+)</option>
                <option value="decrease">Decrease (-)</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                className={`input ${isStockInsufficient ? 'border-orange-500' : ''}`}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                min="1"
                required
              />
              {selectedProduct && (
                <p className={`text-sm mt-1 ${isStockInsufficient ? 'text-orange-500' : 'text-blue-600'}`}>
                  {isStockInsufficient
                    ? `Insufficient stock. Projected stock: ${projectedStock}`
                    : `Projected stock after save: ${projectedStock} units`}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Reason</label>
            <select
              className="input"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Explain the reason for adjustment..."
            ></textarea>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Adjustment Summary</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Product:</span> <span className="font-medium">{selectedProduct.name}</span></p>
                <p><span className="text-gray-600">Live Stock:</span> <span className="font-medium">{currentStock}</span></p>
                {isEditing && selectedProduct._id === originalProductId && (
                  <p><span className="text-gray-600">Stock Before This Adjustment:</span> <span className="font-medium">{baselineStock}</span></p>
                )}
                <p>
                  <span className="text-gray-600">Adjustment:</span>{' '}
                  <span className={`font-medium ${formData.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.type === 'increase' ? '+' : '-'}{formData.quantity}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Projected Stock:</span>{' '}
                  <span className={`font-bold ${isStockInsufficient ? 'text-orange-500' : 'text-blue-600'}`}>
                    {projectedStock}
                  </span>
                </p>
                <p><span className="text-gray-600">Reason:</span> <span className="font-medium capitalize">{formData.reason}</span></p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={mutation.isLoading || !formData.product || !formData.quantity || isStockInsufficient}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : formData.type === 'increase' ? (
                <>
                  <ArrowUpIcon className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Increase' : 'Apply Increase'}
                </>
              ) : (
                <>
                  <ArrowDownIcon className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Decrease' : 'Apply Decrease'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StockAdjustmentForm;
