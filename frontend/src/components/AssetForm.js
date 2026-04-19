import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { assetsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const AssetForm = ({ asset, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    asset_name: '',
    description: '',
    category: '',
    type: 'equipment',
    purchase_date: '',
    purchase_cost: {
      amount: 0,
      currency: 'USD',
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 5,
      salvageValue: 0,
    },
    specifications: {
      make: '',
      model: '',
      serialNumber: '',
      year: new Date().getFullYear(),
      color: '',
    },
    location: {
      building: '',
      floor: '',
      room: '',
    },
    assigned_to: {
      user_id: '',
      department: '',
      location: '',
    },
  });

  const queryClient = useQueryClient();
  const isEditing = !!asset;

  const createMutation = useMutation(assetsAPI.create, {
    onSuccess: () => {
      toast.success('Asset created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create asset');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => assetsAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Asset updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update asset');
      },
    }
  );

  useEffect(() => {
    if (asset) {
      setFormData({
        asset_name: asset.asset_name || '',
        description: asset.description || '',
        category: asset.category || '',
        type: asset.type || 'equipment',
        purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toISOString().split('T')[0] : '',
        purchase_cost: {
          amount: asset.purchase_cost?.amount || 0,
          currency: asset.purchase_cost?.currency || 'USD',
        },
        depreciation: {
          method: asset.depreciation?.method || 'straight_line',
          usefulLife: asset.depreciation?.usefulLife || 5,
          salvageValue: asset.depreciation?.salvageValue || 0,
        },
        specifications: {
          make: asset.specifications?.make || '',
          model: asset.specifications?.model || '',
          serialNumber: asset.specifications?.serialNumber || '',
          year: asset.specifications?.year || new Date().getFullYear(),
          color: asset.specifications?.color || '',
        },
        location: {
          building: asset.location?.building || '',
          floor: asset.location?.floor || '',
          room: asset.location?.room || '',
        },
        assigned_to: {
          user_id: asset.assigned_to?.user_id?._id || asset.assigned_to?.user_id || '',
          department: asset.assigned_to?.department || '',
          location: asset.assigned_to?.location || '',
        },
      });
    }
  }, [asset]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      purchase_cost: {
        ...formData.purchase_cost,
        amount: parseFloat(formData.purchase_cost.amount),
      },
      depreciation: {
        ...formData.depreciation,
        usefulLife: parseInt(formData.depreciation.usefulLife),
        salvageValue: parseFloat(formData.depreciation.salvageValue),
      },
      specifications: {
        ...formData.specifications,
        year: parseInt(formData.specifications.year),
      },
    };

    if (isEditing) {
      updateMutation.mutate({ id: asset._id, data });
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
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Asset' : 'Add New Asset'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Asset Name *</label>
                    <input
                      type="text"
                      name="asset_name"
                      required
                      className="input"
                      value={formData.asset_name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Category *</label>
                    <input
                      type="text"
                      name="category"
                      required
                      className="input"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Type *</label>
                    <select
                      name="type"
                      required
                      className="input"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="equipment">Equipment</option>
                      <option value="furniture">Furniture</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="electronics">Electronics</option>
                      <option value="machinery">Machinery</option>
                      <option value="building">Building</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Purchase Date *</label>
                    <input
                      type="date"
                      name="purchase_date"
                      required
                      className="input"
                      value={formData.purchase_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Purchase Cost *</label>
                    <input
                      type="number"
                      name="purchase_cost.amount"
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      value={formData.purchase_cost.amount}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Currency</label>
                    <select
                      name="purchase_cost.currency"
                      className="input"
                      value={formData.purchase_cost.currency}
                      onChange={handleChange}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="input"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Make</label>
                      <input
                        type="text"
                        name="specifications.make"
                        className="input"
                        value={formData.specifications.make}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="label">Model</label>
                      <input
                        type="text"
                        name="specifications.model"
                        className="input"
                        value={formData.specifications.model}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="label">Serial Number</label>
                      <input
                        type="text"
                        name="specifications.serialNumber"
                        className="input"
                        value={formData.specifications.serialNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="label">Year</label>
                      <input
                        type="number"
                        name="specifications.year"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="input"
                        value={formData.specifications.year}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="label">Color</label>
                      <input
                        type="text"
                        name="specifications.color"
                        className="input"
                        value={formData.specifications.color}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Building</label>
                      <input
                        type="text"
                        name="location.building"
                        className="input"
                        value={formData.location.building}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="label">Floor</label>
                      <input
                        type="text"
                        name="location.floor"
                        className="input"
                        value={formData.location.floor}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="label">Room</label>
                      <input
                        type="text"
                        name="location.room"
                        className="input"
                        value={formData.location.room}
                        onChange={handleChange}
                      />
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

export default AssetForm;
