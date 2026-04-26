import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CreditCardIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { customersAPI } from '../services/api';
import CustomerForm from '../components/CustomerForm';
import toast from 'react-hot-toast';

const AddCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Get pre-filled data from location state if available
  const prefillData = location.state?.prefillData || {};

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && Object.keys(formData).length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem('customer_draft', JSON.stringify(formData));
        setSaveStatus('Draft saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, autoSaveEnabled]);

  // Load draft data on mount
  useEffect(() => {
    const draft = localStorage.getItem('customer_draft');
    if (draft && !location.state?.prefillData) {
      try {
        const draftData = JSON.parse(draft);
        setFormData(draftData);
        toast.success('Draft loaded');
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [location.state?.prefillData]);

  const validateForm = (data) => {
    const errors = {};
    
    // Required field validation
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Customer name must be at least 2 characters';
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!data.phone || !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Business-specific validation
    if (data.company_name && data.company_name.trim().length < 2) {
      errors.company_name = 'Company name must be at least 2 characters';
    }
    
    if (data.gst_number && !/^[A-Z0-9]{15}$/.test(data.gst_number)) {
      errors.gst_number = 'GST number must be 15 alphanumeric characters';
    }
    
    if (data.credit_limit && (isNaN(data.credit_limit) || parseFloat(data.credit_limit) < 0)) {
      errors.credit_limit = 'Credit limit must be a positive number';
    }
    
    return errors;
  };

  const createCustomerMutation = useMutation(customersAPI.create, {
    onSuccess: (data) => {
      toast.success('Customer created successfully!');
      queryClient.invalidateQueries('customers');
      
      // Clear draft
      localStorage.removeItem('customer_draft');
      
      // Navigate to customer list or customer profile
      const redirectTo = location.state?.redirectTo || '/contacts';
      
      // If we have customer data, navigate to their profile
      if (data.data?._id) {
        navigate(`/contacts?customer=${data.data._id}`, { 
          state: { selectedCustomerId: data.data._id } 
        });
      } else {
        navigate(redirectTo);
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to create customer';
      
      // Handle specific validation errors
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        toast.error(errorMessage);
      }
      
      setIsSubmitting(false);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleFormSubmit = async (customerData) => {
    // Validate form
    const errors = validateForm(customerData);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    setIsSubmitting(true);
    createCustomerMutation.mutate(customerData);
  };

  const handleFormChange = (data) => {
    setFormData(data);
    setValidationErrors({});
  };

  const handleCancel = () => {
    const redirectTo = location.state?.redirectTo || '/contacts';
    
    // Check if there's unsaved data
    if (Object.keys(formData).length > 0) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        localStorage.removeItem('customer_draft');
        navigate(redirectTo);
      }
    } else {
      navigate(redirectTo);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('customer_draft', JSON.stringify(formData));
    toast.success('Draft saved successfully');
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem('customer_draft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setFormData(draftData);
        toast.success('Draft loaded successfully');
      } catch (error) {
        toast.error('Failed to load draft');
      }
    } else {
      toast('No draft found');
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('customer_draft');
    setFormData({});
    setValidationErrors({});
    toast.success('Draft cleared');
  };

  const breadcrumbs = [
    { name: 'Customer Management', href: '/contacts' },
    { name: 'Add Customer', href: '/contacts/create' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/contacts')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Customers
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Add Customer</span>
            </nav>

            <div className="flex items-center gap-3">
              {/* Auto-save toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="autoSave" className="text-sm text-gray-600">
                  Auto-save
                </label>
              </div>
              
              {/* Save status indicator */}
              {saveStatus && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  {saveStatus}
                </span>
              )}

              {/* Draft actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="btn btn-sm btn-secondary"
                  disabled={Object.keys(formData).length === 0}
                >
                  Save Draft
                </button>
                <button
                  onClick={handleLoadDraft}
                  className="btn btn-sm btn-secondary"
                >
                  Load Draft
                </button>
                <button
                  onClick={handleClearDraft}
                  className="btn btn-sm btn-secondary"
                >
                  Clear Draft
                </button>
              </div>

              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
            <p className="mt-2 text-gray-600">
              Create a new customer profile and add them to your customer database.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                  <p className="text-sm text-gray-500">
                    Fill in the customer details below. All fields marked with * are required.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Validation Errors Display */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Validation Errors</h4>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field}>· {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <CustomerForm
                customer={null}
                initialValues={{ ...prefillData, ...formData }}
                onClose={handleCancel}
                onSuccess={handleFormSubmit}
                isSubmitting={isSubmitting}
                mode="create"
                onChange={handleFormChange}
                validationErrors={validationErrors}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Company Details</h3>
              </div>
              <p className="text-sm text-gray-600">
                Add company information, GST details, and business address for corporate customers.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <CreditCardIcon className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Credit Settings</h3>
              </div>
              <p className="text-sm text-gray-600">
                Set credit limits and payment terms for the customer's account.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <TagIcon className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Tags & Notes</h3>
              </div>
              <p className="text-sm text-gray-600">
                Add tags for customer segmentation and notes for internal communication.
              </p>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>· All required fields are marked with an asterisk (*)</p>
              <p>· Email and phone number must be unique for each customer</p>
              <p>· GST number is required for business customers in India</p>
              <p>· Credit limit determines the maximum outstanding balance</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddCustomer;
