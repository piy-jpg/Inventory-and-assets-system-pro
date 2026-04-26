import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { metadataAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductSectionNav from '../components/ProductSectionNav';
import useRealTimeInventory from '../hooks/useRealTimeInventory';
import { useAuth } from '../hooks/useAuth';

const defaultForm = {
  name: '',
  short_name: '',
  description: '',
  duration: '',
  duration_type: 'months',
  allow_decimal: false,
  code: '',
};

const configMap = {
  units: {
    queryKey: 'units',
    get: metadataAPI.getUnits,
    create: metadataAPI.createUnit,
    update: metadataAPI.updateUnit,
    remove: metadataAPI.deleteUnit,
  },
  brands: {
    queryKey: 'brands',
    get: metadataAPI.getBrands,
    create: metadataAPI.createBrand,
    update: metadataAPI.updateBrand,
    remove: metadataAPI.deleteBrand,
  },
  categories: {
    queryKey: 'categories',
    get: metadataAPI.getCategories,
    create: metadataAPI.createCategory,
    update: metadataAPI.updateCategory,
    remove: metadataAPI.deleteCategory,
  },
  warranties: {
    queryKey: 'warranties',
    get: metadataAPI.getWarranties,
    create: metadataAPI.createWarranty,
    update: metadataAPI.updateWarranty,
    remove: metadataAPI.deleteWarranty,
  },
};

const MetadataManagement = ({ type, title }) => {
  const { user } = useAuth();
  const config = configMap[type];
  const queryClient = useQueryClient();
  const { isConnected, realTimeUpdates } = useRealTimeInventory();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const canManageMetadata = ['admin', 'manager'].includes(user?.role);

  const { data, isLoading, isFetching } = useQuery(config.queryKey, config.get, {
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  // Debug: Log data structure for units
  console.log(`MetadataManagement - ${type} Data:`, data);
  console.log(`MetadataManagement - ${type} Data Structure:`, {
    'data?.data': data?.data,
    'data?.data?.data': data?.data?.data,
    'data?.data?.data?.[type]': data?.data?.data?.[type],
    'items count': data?.data?.data?.[type]?.length || data?.data?.data?.length || data?.data?.length || 0
  });

  const items = useMemo(() => {
    // Handle different data structures for different types
    if (type === 'units') {
      const unitsData = data?.data?.data || data?.data || [];
      console.log(`MetadataManagement - Extracted ${type}:`, unitsData);
      return unitsData;
    }

    const primaryItems = data?.data?.data?.[type];
    if (Array.isArray(primaryItems)) {
      return primaryItems;
    }

    const nestedItems = data?.data?.data?.categories;
    if (type === 'categories' && Array.isArray(nestedItems)) {
      return nestedItems;
    }

    if (Array.isArray(data?.data?.data)) {
      return data.data.data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  }, [data, type]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.short_name || ''} ${item.description || ''} ${item.code || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [items, search]
  );

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingItem(null);
    setShowForm(false);
  };

  const saveMutation = useMutation(
    (payload) =>
      editingItem ? config.update(editingItem._id, payload) : config.create(payload),
    {
      onSuccess: () => {
        toast.success(`${title} ${editingItem ? 'updated' : 'added'} successfully`);
        queryClient.invalidateQueries(config.queryKey);
        if (type === 'categories') {
          queryClient.invalidateQueries('product-tool-categories');
          queryClient.invalidateQueries('inventory');
        }
        resetForm();
      },
      onError: (error) => toast.error(error.response?.data?.message || `Failed to save ${title}`),
    }
  );

  const deleteMutation = useMutation((id) => config.remove(id), {
    onSuccess: () => {
      toast.success(`${title} deleted successfully`);
      queryClient.invalidateQueries(config.queryKey);
      if (type === 'categories') {
        queryClient.invalidateQueries('product-tool-categories');
        queryClient.invalidateQueries('inventory');
      }
    },
    onError: (error) => toast.error(error.response?.data?.message || `Failed to delete ${title}`),
  });

  const openCreate = () => {
    if (!canManageMetadata) {
      toast.error('You do not have permission to manage product metadata');
      return;
    }
    setEditingItem(null);
    setFormData(defaultForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
    if (!canManageMetadata) {
      toast.error('You do not have permission to manage product metadata');
      return;
    }
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      short_name: item.short_name || '',
      description: item.description || '',
      duration: item.duration || '',
      duration_type: item.duration_type || 'months',
      allow_decimal: item.allow_decimal || false,
      code: item.code || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      duration: type === 'warranties' ? Number(formData.duration || 0) : undefined,
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <ProductSectionNav />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">Manage {title.toLowerCase()} used across products.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${isFetching ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <SignalIcon className="mr-2 h-4 w-4" />
            {isFetching ? 'Refreshing live data' : 'Connected to dataset'}
          </div>
          {canManageMetadata ? (
            <button onClick={openCreate} className="btn btn-primary flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" /> Add {title}
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <span className="font-semibold">{filteredItems.length}</span> {title.toLowerCase()} in the live dataset
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="large" />
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No {title.toLowerCase()} found yet. Add your first one to start organizing product data.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  {item.short_name ? <p className="text-sm text-gray-500">{item.short_name}</p> : null}
                  {item.code ? <p className="text-sm text-gray-500">Code: {item.code}</p> : null}
                </div>
                <TagIcon className="h-6 w-6 text-primary-200" />
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {item.description ? <p>{item.description}</p> : null}
                {typeof item.allow_decimal === 'boolean' ? (
                  <p>Decimals: {item.allow_decimal ? 'Allowed' : 'Not allowed'}</p>
                ) : null}
                {item.duration ? <p>Duration: {item.duration} {item.duration_type}</p> : null}
              </div>

              {canManageMetadata ? (
                <div className="mt-5 flex gap-2">
                  <button onClick={() => openEdit(item)} className="btn btn-secondary flex-1 flex items-center justify-center">
                    <PencilIcon className="h-4 w-4 mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${item.name}?`)) {
                        deleteMutation.mutate(item._id);
                      }
                    }}
                    className="btn flex-1 flex items-center justify-center bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" /> Delete
                  </button>
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingItem ? `Edit ${title}` : `Add New ${title}`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {type === 'units' && (
                <>
                  <div>
                    <label className="label">Short Name</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.short_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, short_name: e.target.value }))}
                      required
                    />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.allow_decimal}
                      onChange={(e) => setFormData((prev) => ({ ...prev, allow_decimal: e.target.checked }))}
                    />
                    Allow decimal quantities
                  </label>
                </>
              )}

              {type === 'categories' && (
                <div>
                  <label className="label">Code</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </div>
              )}

              {(type === 'brands' || type === 'categories' || type === 'warranties') && (
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              )}

              {type === 'warranties' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Duration</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.duration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select
                      className="input"
                      value={formData.duration_type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration_type: e.target.value }))}
                    >
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isLoading} className="btn btn-primary flex-1">
                  {saveMutation.isLoading ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Recent Product Updates Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Product Updates</h3>
            <p className="mt-1 text-sm text-gray-500">Latest realtime payloads received by the inventory listener.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Real-time Active' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {realTimeUpdates.length > 0 ? (
            realTimeUpdates.slice(0, 5).map((item, index) => (
              <div key={`${item._id || item.id || index}-${index}`} className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{item.name || item.productName || 'Product update'}</span>
                <span className="ml-2 text-gray-500">
                  quantity {item.quantity ?? item.currentStock ?? 'n/a'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No realtime product events have arrived yet. The workspace is still connected and polling live data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataManagement;
