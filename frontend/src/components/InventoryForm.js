import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const queryClient = useQueryClient();
  const isEditing = !!item;
  const autoSaveTimeoutRef = useRef(null);
  const formId = isEditing ? `edit-${item._id}` : `new-${Date.now()}`;

  const { data: suppliers } = useQuery('suppliers', metadataAPI.getSuppliers);
  const { data: units } = useQuery('units', metadataAPI.getUnits);
  const { data: brands } = useQuery('brands', metadataAPI.getBrands);
  const { data: categories } = useQuery('categories', metadataAPI.getCategories);
  const { data: warranties } = useQuery('warranties', metadataAPI.getWarranties);

  const createMutation = useMutation(inventoryAPI.create, {
    onSuccess: (data) => {
      console.log('Inventory created successfully:', data);
      toast.success(`Product "${data?.data?.name || formData.name}" created successfully!`);
      
      // Invalidate multiple queries for real-time updates
      queryClient.invalidateQueries('inventory');
      queryClient.invalidateQueries('categories');
      queryClient.invalidateQueries('brands');
      
      // Clear form data and reset state
      setHasUnsavedChanges(false);
      clearFormDataFromLocalStorage();
      
      // Show real-time success notification
      setTimeout(() => {
        toast.success('Real-time updates applied - Product list refreshed');
      }, 1000);
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Create inventory error:', error);
      toast.error(error.response?.data?.message || 'Failed to create item');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => inventoryAPI.update(id, data),
    {
      onSuccess: (data) => {
        console.log('Inventory updated successfully:', data);
        toast.success('Inventory item updated successfully');
        queryClient.invalidateQueries('inventory');
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error) => {
        console.error('Update inventory error:', error);
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
        unit: item.unit?._id || item.unit || '',
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

  // Auto-save functionality
  const saveFormDataToLocalStorage = useCallback(() => {
    try {
      const dataToSave = {
        formData,
        timestamp: Date.now(),
        isEditing,
        formId
      };
      localStorage.setItem(`inventory-form-${formId}`, JSON.stringify(dataToSave));
      setAutoSaveStatus('Draft saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [formData, isEditing, formId]);

  const loadFormDataFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(`inventory-form-${formId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Only restore if saved within last 24 hours
        if (Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
          return parsedData.formData;
        } else {
          // Clear old data
          localStorage.removeItem(`inventory-form-${formId}`);
        }
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
    return null;
  }, [formId]);

  const clearFormDataFromLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(`inventory-form-${formId}`);
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }, [formId]);

  // Auto-save with debouncing
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges && !isSubmitting) {
        saveFormDataToLocalStorage();
      }
    }, 2000); // 2 seconds delay
  }, [hasUnsavedChanges, isSubmitting, saveFormDataToLocalStorage]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  
  // Load saved data on mount
  useEffect(() => {
    if (!isEditing && !initialValues) {
      const savedData = loadFormDataFromLocalStorage();
      if (savedData) {
        setFormData(savedData);
        setHasUnsavedChanges(true);
        toast.success('Draft restored from previous session');
      }
    }
  }, [isEditing, initialValues, loadFormDataFromLocalStorage]);

  // Auto-save when form data changes
  useEffect(() => {
    debouncedAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, debouncedAutoSave]);

  // Clear saved data on successful submission
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      clearFormDataFromLocalStorage();
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, clearFormDataFromLocalStorage]);

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Item name must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // SKU validation (optional but if provided, must be valid)
    if (formData.sku && formData.sku.trim().length < 2) {
      newErrors.sku = 'SKU must be at least 2 characters if provided';
    }

    // Quantity validation
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    // Price validation
    const cost = parseFloat(formData.price.cost);
    const selling = parseFloat(formData.price.selling);
    
    if (isNaN(cost) || cost < 0) {
      newErrors.cost = 'Cost price must be a positive number';
    }

    if (isNaN(selling) || selling < 0) {
      newErrors.selling = 'Selling price must be a positive number';
    }

    if (cost > 0 && selling > 0 && cost >= selling) {
      newErrors.selling = 'Selling price must be greater than cost price';
    }

    // Stock level validation
    const minStock = parseInt(formData.minStockLevel);
    const maxStock = parseInt(formData.maxStockLevel);

    if (isNaN(minStock) || minStock < 0) {
      newErrors.minStockLevel = 'Minimum stock level must be a positive number';
    }

    if (isNaN(maxStock) || maxStock < 0) {
      newErrors.maxStockLevel = 'Maximum stock level must be a positive number';
    }

    if (minStock >= maxStock) {
      newErrors.maxStockLevel = 'Maximum stock level must be greater than minimum stock level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Mark form as having unsaved changes
    setHasUnsavedChanges(true);
    
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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Check network status
    if (!isOnline) {
      toast.error('You are currently offline. Please check your connection.');
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setRetryCount(0);
    
    const submitWithRetry = async (attempt = 1) => {
      try {
        // Prepare data for submission with proper sanitization
        const data = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          sku: formData.sku.trim(),
          brand: formData.brand.trim(),
          warranty: formData.warranty.trim(),
          quantity: parseInt(formData.quantity) || 0,
          price: {
            cost: parseFloat(formData.price.cost) || 0,
            selling: parseFloat(formData.price.selling) || 0,
          },
          minStockLevel: parseInt(formData.minStockLevel) || 10,
          maxStockLevel: parseInt(formData.maxStockLevel) || 1000,
          unit: formData.unit,
          supplier_id: formData.supplier_id || null,
          location: {
            warehouse: formData.location.warehouse.trim(),
            aisle: formData.location.aisle.trim(),
            shelf: formData.location.shelf.trim(),
            bin: formData.location.bin.trim(),
          },
        };

        console.log('Submitting form data (attempt', attempt, '):', data);

        // Show real-time submission feedback
        if (!isEditing) {
          toast.loading('Creating new product...', { id: 'create-product' });
        }

        if (isEditing) {
          await updateMutation.mutateAsync({ id: item._id, data });
        } else {
          await createMutation.mutateAsync(data);
        }
        
        // Reset unsaved changes flag
        setHasUnsavedChanges(false);
        
        // Clear loading toast
        toast.dismiss('create-product');
        
      } catch (error) {
        console.error('Form submission error (attempt', attempt, '):', error);
        
        // Check if it's a network error and we should retry
        if (attempt < 3 && (error.code === 'NETWORK_ERROR' || !navigator.onLine || error.message.includes('fetch'))) {
          setRetryCount(attempt);
          toast.error(`Network error. Retrying... (${attempt}/3)`);
          
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return submitWithRetry(attempt + 1);
        }
        
        // Final error after retries or non-retryable error
        toast.error(error.response?.data?.message || error.message || 'Failed to save inventory item');
        throw error;
      }
    };

    try {
      await submitWithRetry();
    } catch (error) {
      // Error already handled in submitWithRetry
    } finally {
      setIsSubmitting(false);
      setRetryCount(0);
    }
  }, [isSubmitting, isOnline, validateForm, isEditing, item, formData, updateMutation, createMutation, setHasUnsavedChanges]);

  // Handle form close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) {
        return;
      }
    }
    clearFormDataFromLocalStorage();
    onClose();
  }, [hasUnsavedChanges, clearFormDataFromLocalStorage, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSubmitting) {
          handleSubmit(e);
        }
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
      
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitting) {
          handleSubmit(e);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, handleSubmit, handleClose]);

  // Form progress calculation
  const calculateFormProgress = () => {
    const requiredFields = ['name', 'category'];
    const optionalFields = ['description', 'sku', 'brand', 'warranty'];
    const priceFields = ['price.cost', 'price.selling'];
    const stockFields = ['quantity', 'minStockLevel', 'maxStockLevel'];
    
    let completed = 0;
    let total = requiredFields.length + optionalFields.length + priceFields.length + stockFields.length;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (formData[field]) completed++;
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (formData[field]) completed++;
    });
    
    // Check price fields
    priceFields.forEach(field => {
      const [parent, child] = field.split('.');
      if (formData[parent] && formData[parent][child]) completed++;
    });
    
    // Check stock fields
    stockFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== '') completed++;
    });
    
    return Math.round((completed / total) * 100);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity z-[9998]"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="relative z-[9999] inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full"
            >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                  </h3>
                  
                  {/* Status Indicators - Mobile First */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Network Status */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      isOnline 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {isOnline ? 'Online' : 'Offline'}
                    </div>
                    
                    {/* Auto-save Status */}
                    {autoSaveStatus && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        {autoSaveStatus}
                      </div>
                    )}
                    
                    {/* Retry Status */}
                    {retryCount > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Retrying ({retryCount}/3)
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar - Full Width on Mobile */}
                  <div className="flex items-center gap-2 mt-3 w-full sm:max-w-md">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateFormProgress()}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                      {calculateFormProgress()}%
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Keyboard Shortcuts Help - Collapsible on Mobile */}
              <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Keyboard shortcuts:</span> 
                  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs ml-1">Ctrl+S</kbd> Save,
                  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs ml-1">Ctrl+Enter</kbd> Submit,
                  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs ml-1">Esc</kbd> Close
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="label">Item Name *</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        className={`input ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="Enter item name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="label">Category *</label>
                      <select
                        id="category"
                        name="category"
                        required
                        className={`input ${errors.category ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.category}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        aria-invalid={!!errors.category}
                        aria-describedby={errors.category ? 'category-error' : undefined}
                      >
                        <option value="">Select category</option>
                        {/* Show categories from API if available, otherwise show comprehensive list */}
                        {(Array.isArray(categories?.data?.data) ? categories?.data?.data : [
                          'Electronics',
                          'Clothing', 
                          'Home & Garden',
                          'Sports & Outdoors',
                          'Books & Media',
                          'Toys & Games',
                          'Food & Beverages',
                          'Health & Beauty',
                          'Automotive',
                          'Office Supplies'
                        ]).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p id="category-error" className="mt-1 text-sm text-red-600" role="alert">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="sku" className="label">SKU</label>
                      <input
                        id="sku"
                        type="text"
                        name="sku"
                        className={`input ${errors.sku ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.sku}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="Enter SKU (optional)"
                        aria-invalid={!!errors.sku}
                        aria-describedby={errors.sku ? 'sku-error' : undefined}
                      />
                      {errors.sku && (
                        <p id="sku-error" className="mt-1 text-sm text-red-600" role="alert">{errors.sku}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="brand" className="label">Brand</label>
                      <select
                        id="brand"
                        name="brand"
                        className="input"
                        value={formData.brand}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      >
                        <option value="">Select brand</option>
                        {(Array.isArray(brands?.data?.data) ? brands?.data?.data : []).map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Pricing Information</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cost" className="label">Cost Price *</label>
                      <input
                        id="cost"
                        type="number"
                        name="price.cost"
                        required
                        min="0"
                        step="0.01"
                        className={`input ${errors.cost ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.price.cost}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="0.00"
                        aria-invalid={!!errors.cost}
                        aria-describedby={errors.cost ? 'cost-error' : undefined}
                      />
                      {errors.cost && (
                        <p id="cost-error" className="mt-1 text-sm text-red-600" role="alert">{errors.cost}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="selling" className="label">Selling Price *</label>
                      <input
                        id="selling"
                        type="number"
                        name="price.selling"
                        required
                        min="0"
                        step="0.01"
                        className={`input ${errors.selling ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.price.selling}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="0.00"
                        aria-invalid={!!errors.selling}
                        aria-describedby={errors.selling ? 'selling-error' : undefined}
                      />
                      {errors.selling && (
                        <p id="selling-error" className="mt-1 text-sm text-red-600" role="alert">{errors.selling}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Stock Information</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="quantity" className="label">Quantity *</label>
                      <input
                        id="quantity"
                        type="number"
                        name="quantity"
                        required
                        min="0"
                        className={`input ${errors.quantity ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.quantity}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="0"
                        aria-invalid={!!errors.quantity}
                        aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                      />
                      {errors.quantity && (
                        <p id="quantity-error" className="mt-1 text-sm text-red-600" role="alert">{errors.quantity}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="minStockLevel" className="label">Min Stock Level</label>
                      <input
                        id="minStockLevel"
                        type="number"
                        name="minStockLevel"
                        min="0"
                        className={`input ${errors.minStockLevel ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.minStockLevel}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="10"
                        aria-invalid={!!errors.minStockLevel}
                        aria-describedby={errors.minStockLevel ? 'minStock-error' : undefined}
                      />
                      {errors.minStockLevel && (
                        <p id="minStock-error" className="mt-1 text-sm text-red-600" role="alert">{errors.minStockLevel}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="maxStockLevel" className="label">Max Stock Level</label>
                      <input
                        id="maxStockLevel"
                        type="number"
                        name="maxStockLevel"
                        min="0"
                        className={`input ${errors.maxStockLevel ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.maxStockLevel}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="1000"
                        aria-invalid={!!errors.maxStockLevel}
                        aria-describedby={errors.maxStockLevel ? 'maxStock-error' : undefined}
                      />
                      {errors.maxStockLevel && (
                        <p id="maxStock-error" className="mt-1 text-sm text-red-600" role="alert">{errors.maxStockLevel}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Additional Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="description" className="label">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className="input"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="Enter item description (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="supplier_id" className="label">Supplier</label>
                        <select
                          id="supplier_id"
                          name="supplier_id"
                          className="input"
                          value={formData.supplier_id}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        >
                          <option value="">Select supplier</option>
                          {(Array.isArray(suppliers?.data?.data) ? suppliers?.data?.data : []).map((supplier) => (
                            <option key={supplier} value={supplier}>
                              {supplier}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="warranty" className="label">Warranty</label>
                        <select
                          id="warranty"
                          name="warranty"
                      className="input"
                      value={formData.warranty}
                      onChange={handleChange}
                    >
                      <option value="">No warranty</option>
                      {(Array.isArray(warranties?.data?.data) ? warranties?.data?.data : []).map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                      </div>

                      <div>
                        <label htmlFor="unit" className="label">Unit</label>
                        <select
                          id="unit"
                          name="unit"
                          className="input"
                          value={formData.unit}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        >
                          <option value="">Select unit</option>
                          {(Array.isArray(units?.data?.data) ? units?.data?.data : []).map((unit) => (
                            <option key={unit._id} value={unit._id}>{unit.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Location Information Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Location Information</h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label htmlFor="warehouse" className="label">Warehouse</label>
                          <input
                            id="warehouse"
                            type="text"
                            name="location.warehouse"
                            className="input"
                            value={formData.location.warehouse}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Warehouse"
                          />
                        </div>
                        <div>
                          <label htmlFor="aisle" className="label">Aisle</label>
                          <input
                            id="aisle"
                            type="text"
                            name="location.aisle"
                            className="input"
                            value={formData.location.aisle}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Aisle"
                          />
                        </div>
                        <div>
                          <label htmlFor="shelf" className="label">Shelf</label>
                          <input
                            id="shelf"
                            type="text"
                            name="location.shelf"
                            className="input"
                            value={formData.location.shelf}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Shelf"
                          />
                        </div>
                        <div>
                          <label htmlFor="bin" className="label">Bin</label>
                          <input
                            id="bin"
                            type="text"
                            name="location.bin"
                            className="input"
                            value={formData.location.bin}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Bin"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
                        className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting || createMutation.isLoading || updateMutation.isLoading ? (
                          <>
                            <LoadingSpinner size="small" />
                            <span className="ml-2">
                              {isEditing ? 'Updating...' : 'Creating...'}
                            </span>
                          </>
                        ) : (
                          isEditing ? 'Update Item' : 'Create Item'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default InventoryForm;
