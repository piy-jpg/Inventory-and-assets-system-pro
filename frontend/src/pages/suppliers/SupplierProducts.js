import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CubeIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SupplierProducts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    isPreferred: false,
    minOrderQuantity: 1,
    unitPrice: 0,
    leadTime: 7,
    notes: ''
  });

  const canManageProducts = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteProducts = ['admin', 'manager'].includes(user?.role);

  const queryClient = useQueryClient();

  // Real-time supplier products data
  const { data: supplierProductsData, isLoading, refetch } = useQuery(
    'supplierProducts',
    () => {
      const storedProducts = localStorage.getItem('supplierProducts');
      if (storedProducts) {
        return JSON.parse(storedProducts);
      }
      
      return [
        {
          _id: 'SP_001',
          productId: 'PROD_001',
          productName: 'Laptop Pro 15"',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          isPreferred: true,
          minOrderQuantity: 5,
          unitPrice: 1199.99,
          leadTime: 3,
          status: 'active',
          lastOrderDate: '2024-04-20',
          totalOrdered: 45,
          notes: 'Primary supplier for laptops',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-04-20T14:20:00Z'
        },
        {
          _id: 'SP_002',
          productId: 'PROD_002',
          productName: 'Wireless Mouse',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          isPreferred: true,
          minOrderQuantity: 10,
          unitPrice: 24.99,
          leadTime: 2,
          status: 'active',
          lastOrderDate: '2024-04-22',
          totalOrdered: 120,
          notes: 'Best price for bulk orders',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-04-22T11:15:00Z'
        },
        {
          _id: 'SP_003',
          productId: 'PROD_003',
          productName: 'Office Chair Ergonomic',
          supplierId: 'SUP_002',
          supplierName: 'Office Furniture Co.',
          isPreferred: false,
          minOrderQuantity: 3,
          unitPrice: 389.99,
          leadTime: 5,
          status: 'active',
          lastOrderDate: '2024-04-15',
          totalOrdered: 23,
          notes: 'Quality furniture supplier',
          createdAt: '2024-02-10T09:15:00Z',
          updatedAt: '2024-04-15T16:30:00Z'
        },
        {
          _id: 'SP_004',
          productId: 'PROD_004',
          productName: 'Notebook Set',
          supplierId: 'SUP_003',
          supplierName: 'Stationery World',
          isPreferred: true,
          minOrderQuantity: 20,
          unitPrice: 12.99,
          leadTime: 2,
          status: 'active',
          lastOrderDate: '2024-04-23',
          totalOrdered: 200,
          notes: 'Preferred stationery supplier',
          createdAt: '2024-01-20T14:45:00Z',
          updatedAt: '2024-04-23T09:45:00Z'
        },
        {
          _id: 'SP_005',
          productId: 'PROD_005',
          productName: 'Desktop Computer',
          supplierId: 'SUP_004',
          supplierName: 'Computer Parts Ltd.',
          isPreferred: false,
          minOrderQuantity: 2,
          unitPrice: 899.99,
          leadTime: 7,
          status: 'inactive',
          lastOrderDate: '2024-03-10',
          totalOrdered: 8,
          notes: 'Alternative supplier for desktops',
          createdAt: '2024-03-05T10:20:00Z',
          updatedAt: '2024-03-10T14:20:00Z'
        }
      ];
    },
    {
      refetchInterval: 9000, // Real-time refresh every 9 seconds
      onSuccess: (data) => {
        console.log('Supplier products data refreshed:', data);
      }
    }
  );

  // Get suppliers data for dropdown
  const { data: suppliersData } = useQuery(
    'suppliers',
    () => {
      const storedSuppliers = localStorage.getItem('suppliers');
      return storedSuppliers ? JSON.parse(storedSuppliers) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Get products data for dropdown
  const { data: productsData } = useQuery(
    'products',
    () => {
      const storedProducts = localStorage.getItem('products');
      return storedProducts ? JSON.parse(storedProducts) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Mutation for linking product to supplier
  const linkProductMutation = useMutation(
    async (linkData) => {
      const products = supplierProductsData || [];
      const newLink = {
        ...linkData,
        _id: `SP_${Date.now()}`,
        productName: productsData.find(p => p._id === linkData.productId)?.name || 'Unknown Product',
        supplierName: suppliersData.find(s => s._id === linkData.supplierId)?.name || 'Unknown Supplier',
        status: 'active',
        lastOrderDate: null,
        totalOrdered: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedProducts = [...products, newLink];
      localStorage.setItem('supplierProducts', JSON.stringify(updatedProducts));
      queryClient.setQueryData('supplierProducts', updatedProducts);
      
      // Real-time logging
      const logEntry = {
        action: 'link_product',
        linkId: newLink._id,
        productId: linkData.productId,
        supplierId: linkData.supplierId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierProductLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierProductLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierProductLinked', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierProductsActivityUpdate', { detail: logEntry }));
      
      console.log('🔗 Real-time: Supplier product linked', logEntry);
      
      return newLink;
    },
    {
      onSuccess: () => {
        toast.success('Product linked to supplier successfully');
        setShowLinkModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to link product to supplier');
      }
    }
  );

  // Mutation for updating product link
  const updateProductLinkMutation = useMutation(
    async (updatedLink) => {
      const products = supplierProductsData || [];
      const updatedProducts = products.map(product => 
        product._id === updatedLink._id ? {
          ...updatedLink,
          updatedAt: new Date().toISOString()
        } : product
      );
      localStorage.setItem('supplierProducts', JSON.stringify(updatedProducts));
      queryClient.setQueryData('supplierProducts', updatedProducts);
      
      // Real-time logging
      const logEntry = {
        action: 'update_product_link',
        linkId: updatedLink._id,
        productId: updatedLink.productId,
        supplierId: updatedLink.supplierId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierProductLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierProductLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierProductLinkUpdated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierProductsActivityUpdate', { detail: logEntry }));
      
      console.log('📝 Real-time: Supplier product link updated', logEntry);
      
      return updatedProducts;
    },
    {
      onSuccess: () => {
        toast.success('Product link updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update product link');
      }
    }
  );

  // Mutation for deleting product link
  const deleteProductLinkMutation = useMutation(
    async (linkId) => {
      const products = supplierProductsData || [];
      const deletedLink = products.find(p => p._id === linkId);
      const updatedProducts = products.filter(product => product._id !== linkId);
      localStorage.setItem('supplierProducts', JSON.stringify(updatedProducts));
      queryClient.setQueryData('supplierProducts', updatedProducts);
      
      // Real-time logging
      const logEntry = {
        action: 'delete_product_link',
        linkId,
        productId: deletedLink?.productId,
        supplierId: deletedLink?.supplierId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierProductLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierProductLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierProductLinkDeleted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierProductsActivityUpdate', { detail: logEntry }));
      
      console.log('🗑️ Real-time: Supplier product link deleted', logEntry);
      
      return updatedProducts;
    },
    {
      onSuccess: () => {
        toast.success('Product link deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete product link');
      }
    }
  );

  const supplierProducts = supplierProductsData || [];
  const suppliers = suppliersData || [];
  const products = productsData || [];

  const filteredProducts = supplierProducts.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = filterSupplier === 'all' || product.supplierId === filterSupplier;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesSupplier && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      supplierId: '',
      isPreferred: false,
      minOrderQuantity: 1,
      unitPrice: 0,
      leadTime: 7,
      notes: ''
    });
  };

  const openDetailsModal = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const openLinkModal = () => {
    resetForm();
    setShowLinkModal(true);
  };

  const handleLinkProduct = () => {
    if (!formData.productId) {
      toast.error('Please select a product');
      return;
    }

    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    linkProductMutation.mutate(formData);
  };

  const handleUpdateLink = () => {
    if (!selectedProduct) return;

    updateProductLinkMutation.mutate({
      ...selectedProduct,
      ...formData
    });
  };

  const handleDeleteLink = () => {
    if (!selectedProduct) return;

    if (window.confirm('Are you sure you want to delete this product link?')) {
      deleteProductLinkMutation.mutate(selectedProduct._id);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Supplier products data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalLinks = supplierProducts.length;
  const preferredLinks = supplierProducts.filter(product => product.isPreferred).length;
  const activeLinks = supplierProducts.filter(product => product.status === 'active').length;
  const totalSuppliers = [...new Set(supplierProducts.map(product => product.supplierId))].length;
  const totalProducts = [...new Set(supplierProducts.map(product => product.productId))].length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Supplier Products</h1>
            <p className="page-subtitle">View products provided by each supplier, Link supplier ↔ inventory items, Preferred supplier tagging</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={openLinkModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Link Product</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{totalLinks}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CubeIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preferred</p>
              <p className="text-2xl font-bold text-yellow-600">{preferredLinks}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <StarIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Links</p>
              <p className="text-2xl font-bold text-green-600">{activeLinks}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Suppliers</p>
              <p className="text-2xl font-bold text-purple-600">{totalSuppliers}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No product links found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {product.isPreferred && <StarIcon className="h-4 w-4 text-yellow-500" />}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                          <div className="text-xs text-gray-500">ID: {product.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.supplierName}</div>
                      <div className="text-xs text-gray-500">ID: {product.supplierId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.unitPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Min: {product.minOrderQuantity} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.leadTime} days</div>
                      <div className="text-xs text-gray-500">Ordered: {product.totalOrdered}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Link Product Modal */}
      {showLinkModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLinkModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Link Product to Supplier</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleLinkProduct();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPreferred"
                    checked={formData.isPreferred}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPreferred: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPreferred" className="text-sm font-medium text-gray-700">
                    Mark as Preferred Supplier
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Quantity</label>
                    <input
                      type="number"
                      value={formData.minOrderQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, minOrderQuantity: parseInt(e.target.value) || 1 }))}
                      className="input"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
                  <input
                    type="number"
                    value={formData.leadTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, leadTime: parseInt(e.target.value) || 7 }))}
                    className="input"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this product link"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={linkProductMutation.isLoading}
                >
                  {linkProductMutation.isLoading ? 'Linking...' : 'Link Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Link Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Product</p>
                <div className="flex items-center space-x-2">
                  {selectedProduct.isPreferred && <StarIcon className="h-4 w-4 text-yellow-500" />}
                  <p className="text-sm text-gray-900">{selectedProduct.productName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedProduct.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unit Price</p>
                <p className="text-sm text-gray-900">${selectedProduct.unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Min Order Quantity</p>
                <p className="text-sm text-gray-900">{selectedProduct.minOrderQuantity} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Lead Time</p>
                <p className="text-sm text-gray-900">{selectedProduct.leadTime} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.status)}`}>
                  {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ordered</p>
                <p className="text-sm text-gray-900">{selectedProduct.totalOrdered}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Order Date</p>
                <p className="text-sm text-gray-900">{selectedProduct.lastOrderDate || 'No orders yet'}</p>
              </div>
            </div>

            {selectedProduct.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedProduct.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedProduct.createdAt).toLocaleString()}
                {selectedProduct.updatedAt !== selectedProduct.createdAt && (
                  <span> | Updated: {new Date(selectedProduct.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteLink}
                  className="btn btn-outline btn-sm"
                >
                  Delete Link
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SupplierProducts;
