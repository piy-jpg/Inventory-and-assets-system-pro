import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const ManageAssets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const queryClient = useQueryClient();

  // Real-time assets data
  const { data: assetsData, isLoading, refetch } = useQuery(
    'manageAssets',
    () => {
      const storedAssets = localStorage.getItem('assets');
      if (storedAssets) {
        return JSON.parse(storedAssets);
      }
      
      return [
        {
          _id: 'AST_001',
          asset_name: 'Laptop Pro 15"',
          asset_tag: 'LAPTOP-001',
          category: 'Electronics',
          type: 'Computer',
          status: 'active',
          location: 'Main Office',
          assigned_to: { user_id: { firstName: 'John', lastName: 'Smith' } },
          purchase_date: '2023-01-15',
          purchase_cost: 1299.99,
          current_value: 974.99,
          depreciation_rate: 20,
          warranty_expiry: '2025-01-15',
          last_maintenance: '2024-03-15',
          next_maintenance: '2024-06-15',
          condition: 'Good',
          serial_number: 'LP15-2023-001',
          manufacturer: 'TechBrand',
          model: 'Pro 15"',
          notes: 'Assigned to Sales Manager'
        },
        {
          _id: 'AST_002',
          asset_name: 'Office Chair Ergonomic',
          asset_tag: 'CHAIR-001',
          category: 'Furniture',
          type: 'Seating',
          status: 'active',
          location: 'Main Office',
          assigned_to: { user_id: { firstName: 'Sarah', lastName: 'Johnson' } },
          purchase_date: '2023-02-20',
          purchase_cost: 399.99,
          current_value: 319.99,
          depreciation_rate: 10,
          warranty_expiry: '2024-02-20',
          last_maintenance: '2024-01-10',
          next_maintenance: '2024-07-10',
          condition: 'Excellent',
          serial_number: 'CHR-2023-001',
          manufacturer: 'ComfortSeating',
          model: 'Ergo-Pro',
          notes: 'Ergonomic chair with lumbar support'
        },
        {
          _id: 'AST_003',
          asset_name: 'Desktop Computer',
          asset_tag: 'DESKTOP-001',
          category: 'Electronics',
          type: 'Computer',
          status: 'maintenance',
          location: 'IT Department',
          assigned_to: null,
          purchase_date: '2022-08-10',
          purchase_cost: 899.99,
          current_value: 539.99,
          depreciation_rate: 25,
          warranty_expiry: '2023-08-10',
          last_maintenance: '2024-04-01',
          next_maintenance: '2024-05-01',
          condition: 'Fair',
          serial_number: 'DT-2022-001',
          manufacturer: 'TechBrand',
          model: 'Desktop Pro',
          notes: 'Under maintenance - hardware upgrade'
        },
        {
          _id: 'AST_004',
          asset_name: 'Conference Table',
          asset_tag: 'TABLE-001',
          category: 'Furniture',
          type: 'Table',
          status: 'inactive',
          location: 'Storage',
          assigned_to: null,
          purchase_date: '2022-05-15',
          purchase_cost: 1599.99,
          current_value: 1279.99,
          depreciation_rate: 8,
          warranty_expiry: '2024-05-15',
          last_maintenance: '2023-12-01',
          next_maintenance: '2024-06-01',
          condition: 'Good',
          serial_number: 'TBL-2022-001',
          manufacturer: 'OfficeFurn',
          model: 'Conference-8',
          notes: '8-person conference table'
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Manage assets data refreshed:', data);
      }
    }
  );

  // Mutation for adding new asset
  const addAssetMutation = useMutation(
    async (newAsset) => {
      const assets = assetsData || [];
      const assetWithId = {
        ...newAsset,
        _id: `AST_${Date.now()}`,
        asset_tag: `${newAsset.category.toUpperCase()}-${Date.now()}`,
        current_value: newAsset.purchase_cost,
        created_at: new Date().toISOString()
      };
      const updatedAssets = [...assets, assetWithId];
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      queryClient.setQueryData('manageAssets', updatedAssets);
      return updatedAssets;
    },
    {
      onSuccess: () => {
        toast.success('Asset added successfully');
        setShowFormModal(false);
        setEditingAsset(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to add asset');
      }
    }
  );

  // Mutation for updating asset
  const updateAssetMutation = useMutation(
    async (updatedAsset) => {
      const assets = assetsData || [];
      const updatedAssets = assets.map(asset => 
        asset._id === updatedAsset._id ? { ...updatedAsset, updated_at: new Date().toISOString() } : asset
      );
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      queryClient.setQueryData('manageAssets', updatedAssets);
      return updatedAssets;
    },
    {
      onSuccess: () => {
        toast.success('Asset updated successfully');
        setShowFormModal(false);
        setEditingAsset(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update asset');
      }
    }
  );

  // Mutation for deleting asset
  const deleteAssetMutation = useMutation(
    async (assetId) => {
      const assets = assetsData || [];
      const updatedAssets = assets.filter(asset => asset._id !== assetId);
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      queryClient.setQueryData('manageAssets', updatedAssets);
      return updatedAssets;
    },
    {
      onSuccess: () => {
        toast.success('Asset deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete asset');
      }
    }
  );

  const assets = (assetsData || []).map(asset => ({
    ...asset,
    purchase_cost: Number(asset.purchase_cost) || 0,
    current_value: Number(asset.current_value) || 0,
    depreciation_rate: Number(asset.depreciation_rate) || 0
  }));

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchesLocation = filterLocation === 'all' || asset.location === filterLocation;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'retired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent':
        return 'bg-blue-100 text-blue-800';
      case 'Good':
        return 'bg-green-100 text-green-800';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'Poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openDetailsModal = (asset) => {
    setSelectedAsset(asset);
    setShowDetailsModal(true);
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setShowFormModal(true);
  };

  const handleDelete = (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteAssetMutation.mutate(assetId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Assets data refreshed');
  };

  // Get unique values for filters
  const categories = [...new Set(assets.map(asset => asset.category))];
  const locations = [...new Set(assets.map(asset => asset.location))];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Manage Assets</h1>
            <p className="page-subtitle">View, add, edit, and delete assets</p>
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
              onClick={() => setShowFormModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Asset</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
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
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              className="input"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Assets Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.asset_name}</div>
                      <div className="text-xs text-gray-500">Tag: {asset.asset_tag}</div>
                      {asset.serial_number && (
                        <div className="text-xs text-gray-500">S/N: {asset.serial_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.category}</div>
                      <div className="text-xs text-gray-500">{asset.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                        {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {asset.assigned_to ? 
                          `${asset.assigned_to.user_id.firstName} ${asset.assigned_to.user_id.lastName}` : 
                          'Unassigned'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${(isNaN(Number(asset.current_value)) ? 0 : Number(asset.current_value)).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Cost: ${(isNaN(Number(asset.purchase_cost)) ? 0 : Number(asset.purchase_cost)).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(asset)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(asset)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Asset Details Modal */}
      {showDetailsModal && selectedAsset && (
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
            className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Asset Details - {selectedAsset.asset_name}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Asset Name</p>
                <p className="text-sm text-gray-900">{selectedAsset.asset_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Asset Tag</p>
                <p className="text-sm text-gray-900">{selectedAsset.asset_tag}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="text-sm text-gray-900">{selectedAsset.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-sm text-gray-900">{selectedAsset.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                  {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Condition</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedAsset.condition)}`}>
                  {selectedAsset.condition}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-sm text-gray-900">{selectedAsset.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned To</p>
                <p className="text-sm text-gray-900">
                  {selectedAsset.assigned_to ? 
                    `${selectedAsset.assigned_to.user_id.firstName} ${selectedAsset.assigned_to.user_id.lastName}` : 
                    'Unassigned'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Date</p>
                <p className="text-sm text-gray-900">{selectedAsset.purchase_date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Cost</p>
                <p className="text-sm font-medium text-gray-900">${(isNaN(Number(selectedAsset.purchase_cost)) ? 0 : Number(selectedAsset.purchase_cost)).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-sm font-medium text-gray-900">${(isNaN(Number(selectedAsset.current_value)) ? 0 : Number(selectedAsset.current_value)).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Depreciation Rate</p>
                <p className="text-sm text-gray-900">{selectedAsset.depreciation_rate}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Warranty Expiry</p>
                <p className="text-sm text-gray-900">{selectedAsset.warranty_expiry}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Maintenance</p>
                <p className="text-sm text-gray-900">{selectedAsset.last_maintenance}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Next Maintenance</p>
                <p className="text-sm text-gray-900">{selectedAsset.next_maintenance}</p>
              </div>
              {selectedAsset.serial_number && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Serial Number</p>
                  <p className="text-sm text-gray-900">{selectedAsset.serial_number}</p>
                </div>
              )}
              {selectedAsset.manufacturer && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Manufacturer</p>
                  <p className="text-sm text-gray-900">{selectedAsset.manufacturer}</p>
                </div>
              )}
              {selectedAsset.model && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Model</p>
                  <p className="text-sm text-gray-900">{selectedAsset.model}</p>
                </div>
              )}
            </div>

            {selectedAsset.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900 mt-1">{selectedAsset.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openEditModal(selectedAsset);
                }}
                className="btn btn-primary"
              >
                Edit Asset
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add/Edit Asset Modal */}
      {showFormModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFormModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const assetData = Object.fromEntries(formData.entries());
              
              if (editingAsset) {
                updateAssetMutation.mutate({ ...editingAsset, ...assetData });
              } else {
                addAssetMutation.mutate(assetData);
              }
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    name="asset_name"
                    defaultValue={editingAsset?.asset_name}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" defaultValue={editingAsset?.category} className="input" required>
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Office Equipment">Office Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <input
                    type="text"
                    name="type"
                    defaultValue={editingAsset?.type}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select name="status" defaultValue={editingAsset?.status} className="input" required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingAsset?.location}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost *</label>
                  <input
                    type="number"
                    name="purchase_cost"
                    defaultValue={editingAsset?.purchase_cost}
                    step="0.01"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    name="purchase_date"
                    defaultValue={editingAsset?.purchase_date}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Rate (%)</label>
                  <input
                    type="number"
                    name="depreciation_rate"
                    defaultValue={editingAsset?.depreciation_rate}
                    step="0.1"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    name="serial_number"
                    defaultValue={editingAsset?.serial_number}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    defaultValue={editingAsset?.manufacturer}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    name="model"
                    defaultValue={editingAsset?.model}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    name="warranty_expiry"
                    defaultValue={editingAsset?.warranty_expiry}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select name="condition" defaultValue={editingAsset?.condition} className="input">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingAsset?.notes}
                  rows="3"
                  className="input"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addAssetMutation.isLoading || updateAssetMutation.isLoading}
                >
                  {editingAsset ? 'Update Asset' : 'Add Asset'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageAssets;
