import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const AllSuppliers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    paymentTerms: '30',
    status: 'active',
    contactPerson: '',
    notes: ''
  });

  const canManageSuppliers = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteSuppliers = ['admin', 'manager'].includes(user?.role);

  const queryClient = useQueryClient();

  // Real-time suppliers data
  const { data: suppliersData, isLoading, refetch } = useQuery(
    'suppliers',
    () => {
      const storedSuppliers = localStorage.getItem('suppliers');
      if (storedSuppliers) {
        return JSON.parse(storedSuppliers);
      }
      
      return [
        {
          _id: 'SUP_001',
          name: 'Tech Supplies Inc.',
          email: 'contact@techsupplies.com',
          phone: '+1-555-0101',
          address: '123 Tech Park, San Francisco, CA 94105',
          gstNumber: 'GST123456789',
          paymentTerms: '30',
          status: 'active',
          contactPerson: 'John Tech',
          notes: 'Primary electronics supplier',
          totalOrders: 45,
          totalPurchases: 125000.00,
          averageDeliveryTime: 3,
          rating: 4.5,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-04-23T14:20:00Z'
        },
        {
          _id: 'SUP_002',
          name: 'Office Furniture Co.',
          email: 'info@officefurniture.com',
          phone: '+1-555-0102',
          address: '456 Furniture Ave, Los Angeles, CA 90001',
          gstNumber: 'GST987654321',
          paymentTerms: '45',
          status: 'active',
          contactPerson: 'Sarah Office',
          notes: 'Furniture and office equipment',
          totalOrders: 23,
          totalPurchases: 87500.00,
          averageDeliveryTime: 5,
          rating: 4.2,
          createdAt: '2024-02-10T09:15:00Z',
          updatedAt: '2024-04-20T11:30:00Z'
        },
        {
          _id: 'SUP_003',
          name: 'Stationery World',
          email: 'orders@stationeryworld.com',
          phone: '+1-555-0103',
          address: '789 Stationery St, New York, NY 10001',
          gstNumber: 'GST456789123',
          paymentTerms: '15',
          status: 'active',
          contactPerson: 'Mike Stationery',
          notes: 'Office supplies and stationery',
          totalOrders: 67,
          totalPurchases: 45000.00,
          averageDeliveryTime: 2,
          rating: 4.8,
          createdAt: '2024-01-20T14:45:00Z',
          updatedAt: '2024-04-22T16:10:00Z'
        },
        {
          _id: 'SUP_004',
          name: 'Computer Parts Ltd.',
          email: 'sales@computerparts.com',
          phone: '+1-555-0104',
          address: '321 Hardware Blvd, Chicago, IL 60601',
          gstNumber: 'GST789123456',
          paymentTerms: '30',
          status: 'inactive',
          contactPerson: 'Lisa Hardware',
          notes: 'Computer components and accessories',
          totalOrders: 12,
          totalPurchases: 34000.00,
          averageDeliveryTime: 7,
          rating: 3.9,
          createdAt: '2024-03-05T10:20:00Z',
          updatedAt: '2024-04-15T09:45:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Suppliers data refreshed:', data);
      }
    }
  );

  // Mutation for updating supplier
  const updateSupplierMutation = useMutation(
    async (updatedSupplier) => {
      const suppliers = suppliersData || [];
      const updatedSuppliers = suppliers.map(supplier => 
        supplier._id === updatedSupplier._id ? {
          ...updatedSupplier,
          updatedAt: new Date().toISOString()
        } : supplier
      );
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      queryClient.setQueryData('suppliers', updatedSuppliers);
      
      // Real-time logging
      const logEntry = {
        action: 'update_supplier',
        supplierId: updatedSupplier._id,
        supplierName: updatedSupplier.name,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierUpdated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('suppliersActivityUpdate', { detail: logEntry }));
      
      console.log('✏️ Real-time: Supplier updated', logEntry);
      
      return updatedSuppliers;
    },
    {
      onSuccess: () => {
        toast.success('Supplier updated successfully');
        setShowEditModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update supplier');
      }
    }
  );

  // Mutation for deleting supplier
  const deleteSupplierMutation = useMutation(
    async (supplierId) => {
      const suppliers = Array.isArray(suppliersData) ? suppliersData : [];
      const deletedSupplier = suppliers.find(s => s._id === supplierId);
      const updatedSuppliers = suppliers.filter(supplier => supplier._id !== supplierId);
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      queryClient.setQueryData('suppliers', updatedSuppliers);
      
      // Real-time logging
      const logEntry = {
        action: 'delete_supplier',
        supplierId,
        supplierName: deletedSupplier?.name,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierDeleted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('suppliersActivityUpdate', { detail: logEntry }));
      
      console.log('🗑️ Real-time: Supplier deleted', logEntry);
      
      return updatedSuppliers;
    },
    {
      onSuccess: () => {
        toast.success('Supplier deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete supplier');
      }
    }
  );

  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplier.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || supplier.address?.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const openDetailsModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      gstNumber: supplier.gstNumber,
      paymentTerms: supplier.paymentTerms,
      status: supplier.status,
      contactPerson: supplier.contactPerson,
      notes: supplier.notes
    });
    setShowEditModal(true);
  };

  const handleUpdateSupplier = () => {
    if (!formData.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    updateSupplierMutation.mutate({
      ...selectedSupplier,
      ...formData
    });
  };

  const handleDeleteSupplier = () => {
    if (!selectedSupplier) return;

    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      deleteSupplierMutation.mutate(selectedSupplier._id);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Suppliers data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate statistics
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(supplier => supplier.status === 'active').length;
  const inactiveSuppliers = suppliers.filter(supplier => supplier.status === 'inactive').length;
  const totalPurchases = suppliers.reduce((sum, supplier) => sum + supplier.totalPurchases, 0);
  const averageRating = suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / suppliers.length;

  // Get unique locations
  const uniqueLocations = [...new Set(suppliers.map(supplier => supplier.address?.split(',').pop().trim()))];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">All Suppliers</h1>
            <p className="page-subtitle">View supplier list, Search / filter (name, location, status), Edit / delete supplier</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
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
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">${totalPurchases.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
                {averageRating.toFixed(1)}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
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
                placeholder="Search suppliers..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              className="input"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Suppliers Table */}
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
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-xs text-gray-500">Contact: {supplier.contactPerson}</div>
                      <div className="text-xs text-gray-500">GST: {supplier.gstNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.email}</div>
                      <div className="text-xs text-gray-500">{supplier.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                        {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className={`font-medium ${getRatingColor(supplier.rating)}`}>
                          ⭐ {supplier.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{supplier.totalOrders} orders</div>
                      <div className="text-xs text-gray-500">${supplier.totalPurchases.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(supplier)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canManageSuppliers && (
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Supplier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Supplier Details Modal */}
      {showDetailsModal && selectedSupplier && (
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
              <h3 className="text-lg font-semibold text-gray-900">Supplier Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier Name</p>
                <p className="text-sm text-gray-900">{selectedSupplier.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.status)}`}>
                  {selectedSupplier.status.charAt(0).toUpperCase() + selectedSupplier.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Contact Person</p>
                <p className="text-sm text-gray-900">{selectedSupplier.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{selectedSupplier.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm text-gray-900">{selectedSupplier.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">GST Number</p>
                <p className="text-sm text-gray-900">{selectedSupplier.gstNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Terms</p>
                <p className="text-sm text-gray-900">{selectedSupplier.paymentTerms} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-sm text-gray-900">{selectedSupplier.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-sm text-gray-900">{selectedSupplier.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-sm text-gray-900">${selectedSupplier.totalPurchases.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Delivery Time</p>
                <p className="text-sm text-gray-900">{selectedSupplier.averageDeliveryTime} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className={`text-sm font-medium ${getRatingColor(selectedSupplier.rating)}`}>
                  ⭐ {selectedSupplier.rating.toFixed(1)}
                </p>
              </div>
            </div>

            {selectedSupplier.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedSupplier.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedSupplier.createdAt).toLocaleString()}
                {selectedSupplier.updatedAt !== selectedSupplier.createdAt && (
                  <span> | Updated: {new Date(selectedSupplier.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                {canManageSuppliers && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openEditModal(selectedSupplier);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </button>
                )}
                {canDeleteSuppliers && (
                  <button
                    onClick={handleDeleteSupplier}
                    className="btn btn-outline btn-sm"
                  >
                    Delete
                  </button>
                )}
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

      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Supplier</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSupplier();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Supplier name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      className="input"
                      placeholder="Contact person name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input"
                      placeholder="+1-555-0123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="input"
                    rows="2"
                    placeholder="Enter address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                      className="input"
                      placeholder="GST123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (days)</label>
                    <input
                      type="number"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      className="input"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this supplier"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateSupplierMutation.isLoading}
                >
                  {updateSupplierMutation.isLoading ? 'Updating...' : 'Update Supplier'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AllSuppliers;
