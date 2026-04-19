import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { inventoryAPI, suppliersAPI, metadataAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const InventoryForm = ({ item, initialValues, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    warranty: '',
    sku: '',
    quantity: 0,
    price: {
      cost: 0,
      selling: 0,
    },
    minStockLevel: 10,
    maxStockLevel: 1000,
    unit: '',
    supplier_id: '',
    location: {
      warehouse: '',
      aisle: '',
      shelf: '',
      bin: '',
    },
  });

  const queryClient = useQueryClient();
  const isEditing = !!item;

  const { data: suppliers } = useQuery('suppliers', () => suppliersAPI.getAll({ limit: 100 }));
  const { data: units } = useQuery('units', metadataAPI.getUnits);
  const { data: brands } = useQuery('brands', metadataAPI.getBrands);
  const { data: categories } = useQuery('categories', metadataAPI.getCategories);
  const { data: warranties } = useQuery('warranties', metadataAPI.getWarranties);

  const createMutation = useMutation(inventoryAPI.create, {
    onSuccess: () => {
      toast.success('Inventory item created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create item');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => inventoryAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Inventory item updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update item');
      },
    }
  );

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        price: {
          cost: item.price?.cost || 0,
          selling: item.price?.selling || 0,
        },
        minStockLevel: item.minStockLevel || 10,
        maxStockLevel: item.maxStockLevel || 1000,
        unit: item.unit || 'pieces',
        supplier_id: item.supplier_id?._id || item.supplier_id || '',
        location: {
          warehouse: item.location?.warehouse || '',
          aisle: item.location?.aisle || '',
          shelf: item.location?.shelf || '',
          bin: item.location?.bin || '',
        },
      });
    } else if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        price: {
          ...prev.price,
          ...(initialValues.price || {}),
        },
        location: {
          ...prev.location,
          ...(initialValues.location || {}),
        },
      }));
    }
  }, [item, initialValues]);

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
    } else if (name.includes('location.')) {
      const field = name.replace('location.', '');
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
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
      quantity: parseInt(formData.quantity),
      price: {
        ...formData.price,
        cost: parseFloat(formData.price.cost),
        selling: parseFloat(formData.price.selling),
      },
      minStockLevel: parseInt(formData.minStockLevel),
      maxStockLevel: parseInt(formData.maxStockLevel),
    };

    if (isEditing) {
      updateMutation.mutate({ id: item._id, data });
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
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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
                    <label className="label">Item Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Category *</label>
                    <select
                      name="category"
                      required
                      className="input"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {categories?.data?.categories?.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Brand</label>
                    <select
                      name="brand"
                      className="input"
                      value={formData.brand}
                      onChange={handleChange}
                    >
                      <option value="">Select brand</option>
                      {brands?.data?.brands?.map((brand) => (
                        <option key={brand._id} value={brand.name}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      className="input"
                      value={formData.sku}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Supplier *</label>
                    <select
                      name="supplier_id"
                      required
                      className="input"
                      value={formData.supplier_id}
                      onChange={handleChange}
                    >
                      <option value="">Select supplier</option>
                      {suppliers?.data?.suppliers?.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Warranty</label>
                    <select
                      name="warranty"
                      className="input"
                      value={formData.warranty}
                      onChange={handleChange}
                    >
                      <option value="">No warranty</option>
                      {warranties?.data?.warranties?.map((w) => (
                        <option key={w._id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      min="0"
                      className="input"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Unit *</label>
                    <select
                      name="unit"
                      required
                      className="input"
                      value={formData.unit}
                      onChange={handleChange}
                    >
                      <option value="">Select unit</option>
                      {units?.data?.units?.map((unit) => (
                        <option key={unit._id} value={unit.name}>{unit.name} ({unit.short_name})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Cost Price *</label>
                    <input
                      type="number"
                      name="price.cost"
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      value={formData.price.cost}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Selling Price *</label>
                    <input
                      type="number"
                      name="price.selling"
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      value={formData.price.selling}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Min Stock Level</label>
                    <input
                      type="number"
                      name="minStockLevel"
                      min="0"
                      className="input"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Max Stock Level</label>
                    <input
                      type="number"
                      name="maxStockLevel"
                      min="0"
                      className="input"
                      value={formData.maxStockLevel}
                      onChange={handleChange}
                    />
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Warehouse</label>
                    <input
                      type="text"
                      name="location.warehouse"
                      className="input"
                      value={formData.location.warehouse}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="label">Aisle</label>
                    <input
                      type="text"
                      name="location.aisle"
                      className="input"
                      value={formData.location.aisle}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="label">Shelf</label>
                    <input
                      type="text"
                      name="location.shelf"
                      className="input"
                      value={formData.location.shelf}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="label">Bin</label>
                    <input
                      type="text"
                      name="location.bin"
                      className="input"
                      value={formData.location.bin}
                      onChange={handleChange}
                    />
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

export default InventoryForm;
