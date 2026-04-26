import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');

  const queryClient = useQueryClient();

  // Real-time asset categories data
  const { data: categoriesData, isLoading, refetch } = useQuery(
    'assetCategories',
    () => {
      const storedCategories = localStorage.getItem('assetCategories');
      if (storedCategories) {
        return JSON.parse(storedCategories);
      }
      
      return [
        {
          _id: 'CAT_001',
          name: 'Electronics',
          description: 'Computers, laptops, monitors, and other electronic devices',
          color: '#3B82F6',
          asset_count: 45,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'CAT_002',
          name: 'Furniture',
          description: 'Desks, chairs, tables, and office furniture',
          color: '#10B981',
          asset_count: 32,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'CAT_003',
          name: 'Vehicles',
          description: 'Company vehicles, cars, trucks, and transportation equipment',
          color: '#F59E0B',
          asset_count: 8,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'CAT_004',
          name: 'Machinery',
          description: 'Industrial machinery, equipment, and tools',
          color: '#EF4444',
          asset_count: 15,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'CAT_005',
          name: 'Office Equipment',
          description: 'Printers, scanners, phones, and general office equipment',
          color: '#8B5CF6',
          asset_count: 28,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 15000, // Real-time refresh every 15 seconds
      onSuccess: (data) => {
        console.log('Asset categories data refreshed:', data);
      }
    }
  );

  // Mutation for adding new category
  const addCategoryMutation = useMutation(
    async (newCategory) => {
      const categories = categoriesData || [];
      const categoryWithId = {
        ...newCategory,
        _id: `CAT_${Date.now()}`,
        asset_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedCategories = [...categories, categoryWithId];
      localStorage.setItem('assetCategories', JSON.stringify(updatedCategories));
      queryClient.setQueryData('assetCategories', updatedCategories);
      return updatedCategories;
    },
    {
      onSuccess: () => {
        toast.success('Category added successfully');
        setShowFormModal(false);
        setEditingCategory(null);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to add category');
      }
    }
  );

  // Mutation for updating category
  const updateCategoryMutation = useMutation(
    async (updatedCategory) => {
      const categories = categoriesData || [];
      const updatedCategories = categories.map(category => 
        category._id === updatedCategory._id ? { ...updatedCategory, updated_at: new Date().toISOString() } : category
      );
      localStorage.setItem('assetCategories', JSON.stringify(updatedCategories));
      queryClient.setQueryData('assetCategories', updatedCategories);
      return updatedCategories;
    },
    {
      onSuccess: () => {
        toast.success('Category updated successfully');
        setShowFormModal(false);
        setEditingCategory(null);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to update category');
      }
    }
  );

  // Mutation for deleting category
  const deleteCategoryMutation = useMutation(
    async (categoryId) => {
      const categories = categoriesData || [];
      const updatedCategories = categories.filter(category => category._id !== categoryId);
      localStorage.setItem('assetCategories', JSON.stringify(updatedCategories));
      queryClient.setQueryData('assetCategories', updatedCategories);
      return updatedCategories;
    },
    {
      onSuccess: () => {
        toast.success('Category deleted successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete category');
      }
    }
  );

  const categories = categoriesData || [];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setCategoryName('');
    setCategoryDescription('');
    setCategoryColor('#3B82F6');
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategoryColor(category.color);
    setShowFormModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const categoryData = {
      name: categoryName,
      description: categoryDescription,
      color: categoryColor
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ ...editingCategory, ...categoryData });
    } else {
      addCategoryMutation.mutate(categoryData);
    }
  };

  const handleDelete = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    if (category && category.asset_count > 0) {
      toast.error(`Cannot delete category "${category.name}" as it contains ${category.asset_count} assets`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Categories data refreshed');
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Asset Categories</h1>
            <p className="page-subtitle">Create, edit, and delete asset categories</p>
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
              onClick={() => {
                resetForm();
                setEditingCategory(null);
                setShowFormModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Category</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <TagIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.asset_count} assets</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Delete"
                    disabled={category.asset_count > 0}
                  >
                    <TrashIcon className={`h-4 w-4 ${category.asset_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(category.updated_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add/Edit Category Modal */}
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
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="input"
                    placeholder="e.g., Electronics, Furniture"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className="input"
                    rows="3"
                    placeholder="Describe what type of assets belong to this category"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center space-x-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCategoryColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          categoryColor === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
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
                  disabled={addCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetCategories;
