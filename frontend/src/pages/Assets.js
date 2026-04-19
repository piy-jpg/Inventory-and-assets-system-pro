import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { assetsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import AssetForm from '../components/AssetForm';

const Assets = ({ initialShowForm = false }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', status: '', type: '' });
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingAsset, setEditingAsset] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: assetsData, isLoading } = useQuery(
    ['assets', { search, ...filter, page }],
    () => assetsAPI.getAll({ search, ...filter, page }),
    {
      keepPreviousData: true,
    }
  );

  const { data: categories } = useQuery(
    'assetCategories',
    assetsAPI.getCategories
  );

  const deleteMutation = useMutation(assetsAPI.delete, {
    onSuccess: () => {
      toast.success('Asset deleted successfully');
      queryClient.invalidateQueries('assets');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete asset');
    },
  });

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'in_repair': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance_due': return 'bg-orange-100 text-orange-800';
      case 'disposed': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const assets = assetsData?.data?.assets || [];
  const pagination = assetsData?.data?.pagination || {};

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-subtitle">Manage your company assets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Asset
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-card"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories?.data?.categories?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              className="input"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="equipment">Equipment</option>
              <option value="furniture">Furniture</option>
              <option value="vehicle">Vehicle</option>
              <option value="electronics">Electronics</option>
              <option value="machinery">Machinery</option>
              <option value="building">Building</option>
            </select>
            
            <select
              className="input"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="in_repair">In Repair</option>
              <option value="maintenance_due">Maintenance Due</option>
              <option value="disposed">Disposed</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
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
                {assets.map((asset, index) => (
                  <motion.tr
                    key={asset._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.asset_name}</div>
                        <div className="text-sm text-gray-500">
                          {asset.specifications?.make} {asset.specifications?.model}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{asset.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{asset.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.assigned_to?.user_id ? (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {asset.assigned_to.user_id.firstName} {asset.assigned_to.user_id.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${asset.current_value?.amount || asset.purchase_cost?.amount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {assets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assets found
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {showForm && (
        <AssetForm
          asset={editingAsset}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries('assets');
          }}
        />
      )}
    </div>
  );
};

export default Assets;
