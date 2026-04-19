import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { suppliersAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const SupplierForm = ({ supplier, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    contact_person: {
      name: '',
      position: '',
      email: '',
      phone: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    },
    categories: [''],
    payment_terms: {
      method: 'bank_transfer',
      credit_period: 30,
      discount: {
        percentage: 0,
        conditions: '',
      },
    },
    performance: {
      rating: 3,
      on_time_delivery: 95,
      quality_score: 95,
    },
    status: 'active',
  });

  const queryClient = useQueryClient();
  const isEditing = !!supplier;

  const createMutation = useMutation(suppliersAPI.create, {
    onSuccess: () => {
      toast.success('Supplier created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create supplier');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => suppliersAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Supplier updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update supplier');
      },
    }
  );

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        company_name: supplier.company_name || '',
        contact_person: {
          name: supplier.contact_person?.name || '',
          position: supplier.contact_person?.position || '',
          email: supplier.contact_person?.email || '',
          phone: supplier.contact_person?.phone || '',
        },
        address: {
          street: supplier.address?.street || '',
          city: supplier.address?.city || '',
          state: supplier.address?.state || '',
          country: supplier.address?.country || '',
          postal_code: supplier.address?.postal_code || '',
        },
        categories: supplier.categories || [''],
        payment_terms: {
          method: supplier.payment_terms?.method || 'bank_transfer',
          credit_period: supplier.payment_terms?.credit_period || 30,
          discount: {
            percentage: supplier.payment_terms?.discount?.percentage || 0,
            conditions: supplier.payment_terms?.discount?.conditions || '',
          },
        },
        performance: {
          rating: supplier.performance?.rating || 3,
          on_time_delivery: supplier.performance?.on_time_delivery || 95,
          quality_score: supplier.performance?.quality_score || 95,
        },
        status: supplier.status || 'active',
      });
    }
  }, [supplier]);

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

  const handleCategoryChange = (index, value) => {
    const newCategories = [...formData.categories];
    newCategories[index] = value;
    setFormData(prev => ({
      ...prev,
      categories: newCategories,
    }));
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, ''],
    }));
  };

  const removeCategory = (index) => {
    const newCategories = formData.categories.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      categories: newCategories,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      categories: formData.categories.filter(cat => cat.trim() !== ''),
      payment_terms: {
        ...formData.payment_terms,
        credit_period: parseInt(formData.payment_terms.credit_period),
        discount: {
          ...formData.payment_terms.discount,
          percentage: parseFloat(formData.payment_terms.discount.percentage),
        },
      },
      performance: {
        ...formData.performance,
        on_time_delivery: parseInt(formData.performance.on_time_delivery),
        quality_score: parseInt(formData.performance.quality_score),
      },
    };

    if (isEditing) {
      updateMutation.mutate({ id: supplier._id, data });
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
                  {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
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
                    <label className="label">Contact Name *</label>
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
                    <label className="label">Company Name *</label>
                    <input
                      type="text"
                      name="company_name"
                      required
                      className="input"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Position</label>
                    <input
                      type="text"
                      name="contact_person.position"
                      className="input"
                      value={formData.contact_person.position}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      name="contact_person.email"
                      required
                      className="input"
                      value={formData.contact_person.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Phone *</label>
                    <input
                      type="tel"
                      name="contact_person.phone"
                      required
                      className="input"
                      value={formData.contact_person.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Status</label>
                    <select
                      name="status"
                      className="input"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blacklisted">Blacklisted</option>
                      <option value="under_review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">Street</label>
                      <input
                        type="text"
                        name="address.street"
                        className="input"
                        value={formData.address.street}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="label">City</label>
                      <input
                        type="text"
                        name="address.city"
                        className="input"
                        value={formData.address.city}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="label">State</label>
                      <input
                        type="text"
                        name="address.state"
                        className="input"
                        value={formData.address.state}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Country</label>
                      <input
                        type="text"
                        name="address.country"
                        className="input"
                        value={formData.address.country}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Postal Code</label>
                      <input
                        type="text"
                        name="address.postal_code"
                        className="input"
                        value={formData.address.postal_code}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-900">Categories</h4>
                    <button
                      type="button"
                      onClick={addCategory}
                      className="btn btn-secondary text-sm"
                    >
                      Add Category
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.categories.map((category, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter category"
                          className="input flex-1"
                          value={category}
                          onChange={(e) => handleCategoryChange(index, e.target.value)}
                        />
                        {formData.categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategory(index)}
                            className="btn btn-danger"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Payment Terms</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Payment Method</label>
                      <select
                        name="payment_terms.method"
                        className="input"
                        value={formData.payment_terms.method}
                        onChange={handleChange}
                      >
                        <option value="cash">Cash</option>
                        <option value="credit">Credit</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="check">Check</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Credit Period (days)</label>
                      <input
                        type="number"
                        name="payment_terms.credit_period"
                        min="0"
                        className="input"
                        value={formData.payment_terms.credit_period}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Discount (%)</label>
                      <input
                        type="number"
                        name="payment_terms.discount.percentage"
                        min="0"
                        max="100"
                        step="0.1"
                        className="input"
                        value={formData.payment_terms.discount.percentage}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="label">Discount Conditions</label>
                    <textarea
                      name="payment_terms.discount.conditions"
                      rows="2"
                      className="input"
                      value={formData.payment_terms.discount.conditions}
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

export default SupplierForm;
