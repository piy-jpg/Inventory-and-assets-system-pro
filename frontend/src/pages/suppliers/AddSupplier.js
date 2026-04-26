import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AddSupplier = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    paymentTerms: '30',
    status: 'active',
    contactPerson: '',
    notes: '',
    bankAccount: '',
    bankName: '',
    ifscCode: '',
    panNumber: '',
    msmeNumber: '',
    website: '',
    category: 'electronics'
  });

  const [errors, setErrors] = useState({});

  const canAddSuppliers = ['admin', 'manager', 'staff'].includes(user?.role);

  // Mutation for creating new supplier
  const createSupplierMutation = useMutation(
    async (supplierData) => {
      const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
      const newSupplier = {
        ...supplierData,
        _id: `SUP_${Date.now()}`,
        totalOrders: 0,
        totalPurchases: 0,
        averageDeliveryTime: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedSuppliers = [...suppliers, newSupplier];
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      queryClient.setQueryData('suppliers', updatedSuppliers);
      
      // Real-time logging
      const logEntry = {
        action: 'create_supplier',
        supplierId: newSupplier._id,
        supplierName: supplierData.name,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierCreated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('suppliersActivityUpdate', { detail: logEntry }));
      
      console.log('✅ Real-time: Supplier created', logEntry);
      
      return newSupplier;
    },
    {
      onSuccess: () => {
        toast.success('Supplier added successfully');
        navigate('/suppliers/all');
      },
      onError: () => {
        toast.error('Failed to add supplier');
      }
    }
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.gstNumber && !/^[A-Z0-9]{15}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'GST number must be 15 characters';
    }

    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'PAN number format is invalid';
    }

    if (formData.paymentTerms && (isNaN(formData.paymentTerms) || formData.paymentTerms < 0)) {
      newErrors.paymentTerms = 'Payment terms must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    createSupplierMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBack = () => {
    navigate('/suppliers/all');
  };

  const supplierCategories = [
    'electronics',
    'furniture',
    'stationery',
    'software',
    'hardware',
    'services',
    'raw_materials',
    'packaging',
    'other'
  ];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Suppliers</span>
            </button>
            <div>
              <h1 className="page-title">Add Supplier</h1>
              <p className="page-subtitle">Add new supplier details, Contact info (phone, email), Address & GST details, Payment terms</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter supplier name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+1-555-0123"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input"
                >
                  {supplierCategories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`input ${errors.address ? 'border-red-500' : ''}`}
                  rows="3"
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  className={`input ${errors.gstNumber ? 'border-red-500' : ''}`}
                  placeholder="GST123456789"
                  maxLength={15}
                />
                {errors.gstNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className={`input ${errors.panNumber ? 'border-red-500' : ''}`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.panNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MSME Number
                </label>
                <input
                  type="text"
                  name="msmeNumber"
                  value={formData.msmeNumber}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="UDYAM-XX-XX-XXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms (days)
                </label>
                <input
                  type="number"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className={`input ${errors.paymentTerms ? 'border-red-500' : ''}`}
                  placeholder="30"
                  min="0"
                />
                {errors.paymentTerms && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentTerms}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="IFSC code"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input"
                  rows="3"
                  placeholder="Add any additional notes about this supplier"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center space-x-2"
              disabled={createSupplierMutation.isLoading}
            >
              <PlusIcon className="h-4 w-4" />
              <span>
                {createSupplierMutation.isLoading ? 'Adding Supplier...' : 'Add Supplier'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
      >
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Information Required</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Supplier name, email, and phone are mandatory fields</li>
              <li>• GST number must be 15 characters if provided</li>
              <li>• PAN number format: 5 letters + 4 digits + 1 letter</li>
              <li>• Payment terms are in days (e.g., 30 for 30 days)</li>
              <li>• Bank details are optional but recommended for payments</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddSupplier;
