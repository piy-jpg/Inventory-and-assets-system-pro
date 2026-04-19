import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { metadataAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const config = configMap[type];
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const { data, isLoading } = useQuery(config.queryKey, config.get);

  const items = useMemo(() => data?.data?.data?.[type] || [], [data, type]);

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
        resetForm();
      },
      onError: (error) => toast.error(error.response?.data?.message || `Failed to save ${title}`),
    }
  );

  const deleteMutation = useMutation((id) => config.remove(id), {
    onSuccess: () => {
      toast.success(`${title} deleted successfully`);
      queryClient.invalidateQueries(config.queryKey);
    },
    onError: (error) => toast.error(error.response?.data?.message || `Failed to delete ${title}`),
  });

  const openCreate = () => {
    setEditingItem(null);
    setFormData(defaultForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">Manage {title.toLowerCase()} used across products.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" /> Add {title}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="large" />
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
    </div>
  );
};

export default MetadataManagement;
