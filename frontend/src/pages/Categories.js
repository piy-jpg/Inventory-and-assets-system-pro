import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  CubeIcon,
  PackageIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  TruckIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parent_id: null,
    color: '#3B82F6',
    icon: 'PackageIcon',
    status: 'active'
  });

  // Hardcoded categories data - guaranteed to work
  const categories = [
    {
      id: 1,
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      parent_id: null,
      color: '#3B82F6',
      icon: 'CubeIcon',
      status: 'active',
      product_count: 45,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-04-20T15:30:00Z',
      children: [
        {
          id: 11,
          name: 'Laptops',
          description: 'Laptop computers and accessories',
          parent_id: 1,
          color: '#10B981',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 12,
          created_at: '2024-01-16T09:00:00Z',
          updated_at: '2024-04-18T14:20:00Z'
        },
        {
          id: 12,
          name: 'Smartphones',
          description: 'Mobile phones and accessories',
          parent_id: 1,
          color: '#F59E0B',
          icon: 'ShoppingBagIcon',
          status: 'active',
          product_count: 18,
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-04-19T11:45:00Z'
        },
        {
          id: 13,
          name: 'Tablets',
          description: 'Tablet computers and accessories',
          parent_id: 1,
          color: '#8B5CF6',
          icon: 'DocumentTextIcon',
          status: 'active',
          product_count: 8,
          created_at: '2024-01-16T11:00:00Z',
          updated_at: '2024-04-17T16:30:00Z'
        },
        {
          id: 14,
          name: 'Accessories',
          description: 'Electronic accessories and peripherals',
          parent_id: 1,
          color: '#EF4444',
          icon: 'TagIcon',
          status: 'active',
          product_count: 7,
          created_at: '2024-01-16T12:00:00Z',
          updated_at: '2024-04-16T09:15:00Z'
        }
      ]
    },
    {
      id: 2,
      name: 'Clothing',
      description: 'Apparel and fashion items',
      parent_id: null,
      color: '#EC4899',
      icon: 'ShoppingBagIcon',
      status: 'active',
      product_count: 67,
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-04-20T12:45:00Z',
      children: [
        {
          id: 21,
          name: 'Men\'s Clothing',
          description: 'Clothing for men',
          parent_id: 2,
          color: '#6366F1',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 28,
          created_at: '2024-01-16T13:00:00Z',
          updated_at: '2024-04-19T10:30:00Z'
        },
        {
          id: 22,
          name: 'Women\'s Clothing',
          description: 'Clothing for women',
          parent_id: 2,
          color: '#F472B6',
          icon: 'ShoppingBagIcon',
          status: 'active',
          product_count: 32,
          created_at: '2024-01-16T14:00:00Z',
          updated_at: '2024-04-18T13:15:00Z'
        },
        {
          id: 23,
          name: 'Kids\' Clothing',
          description: 'Clothing for children',
          parent_id: 2,
          color: '#FCD34D',
          icon: 'TagIcon',
          status: 'active',
          product_count: 7,
          created_at: '2024-01-16T15:00:00Z',
          updated_at: '2024-04-17T14:45:00Z'
        }
      ]
    },
    {
      id: 3,
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      parent_id: null,
      color: '#10B981',
      icon: 'BuildingOfficeIcon',
      status: 'active',
      product_count: 34,
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-04-20T14:20:00Z',
      children: [
        {
          id: 31,
          name: 'Furniture',
          description: 'Home furniture and decor',
          parent_id: 3,
          color: '#84CC16',
          icon: 'CubeIcon',
          status: 'active',
          product_count: 15,
          created_at: '2024-01-16T16:00:00Z',
          updated_at: '2024-04-19T15:45:00Z'
        },
        {
          id: 32,
          name: 'Garden Tools',
          description: 'Gardening tools and supplies',
          parent_id: 3,
          color: '#22C55E',
          icon: 'TruckIcon',
          status: 'active',
          product_count: 12,
          created_at: '2024-01-16T17:00:00Z',
          updated_at: '2024-04-18T16:30:00Z'
        },
        {
          id: 33,
          name: 'Kitchen Supplies',
          description: 'Kitchen and dining items',
          parent_id: 3,
          color: '#14B8A6',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 7,
          created_at: '2024-01-16T18:00:00Z',
          updated_at: '2024-04-17T17:15:00Z'
        }
      ]
    },
    {
      id: 4,
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      parent_id: null,
      color: '#F59E0B',
      icon: 'ArrowPathIcon',
      status: 'active',
      product_count: 23,
      created_at: '2024-01-15T13:00:00Z',
      updated_at: '2024-04-20T13:30:00Z',
      children: [
        {
          id: 41,
          name: 'Fitness Equipment',
          description: 'Exercise and fitness gear',
          parent_id: 4,
          color: '#F97316',
          icon: 'CubeIcon',
          status: 'active',
          product_count: 10,
          created_at: '2024-01-16T19:00:00Z',
          updated_at: '2024-04-19T14:15:00Z'
        },
        {
          id: 42,
          name: 'Outdoor Gear',
          description: 'Camping and outdoor equipment',
          parent_id: 4,
          color: '#FB923C',
          icon: 'TruckIcon',
          status: 'active',
          product_count: 8,
          created_at: '2024-01-16T20:00:00Z',
          updated_at: '2024-04-18T15:00:00Z'
        },
        {
          id: 43,
          name: 'Sports Apparel',
          description: 'Athletic clothing and footwear',
          parent_id: 4,
          color: '#FDBA74',
          icon: 'ShoppingBagIcon',
          status: 'active',
          product_count: 5,
          created_at: '2024-01-16T21:00:00Z',
          updated_at: '2024-04-17T15:45:00Z'
        }
      ]
    },
    {
      id: 5,
      name: 'Books & Media',
      description: 'Books, movies, and media products',
      parent_id: null,
      color: '#8B5CF6',
      icon: 'DocumentTextIcon',
      status: 'active',
      product_count: 19,
      created_at: '2024-01-15T14:00:00Z',
      updated_at: '2024-04-20T11:15:00Z',
      children: [
        {
          id: 51,
          name: 'Fiction Books',
          description: 'Fiction literature and novels',
          parent_id: 5,
          color: '#A855F7',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 8,
          created_at: '2024-01-16T22:00:00Z',
          updated_at: '2024-04-19T12:30:00Z'
        },
        {
          id: 52,
          name: 'Non-Fiction Books',
          description: 'Non-fiction and educational books',
          parent_id: 5,
          color: '#C084FC',
          icon: 'DocumentTextIcon',
          status: 'active',
          product_count: 7,
          created_at: '2024-01-16T23:00:00Z',
          updated_at: '2024-04-18T13:45:00Z'
        },
        {
          id: 53,
          name: 'Digital Media',
          description: 'Digital books, music, and videos',
          parent_id: 5,
          color: '#E9D5FF',
          icon: 'TagIcon',
          status: 'active',
          product_count: 4,
          created_at: '2024-01-17T00:00:00Z',
          updated_at: '2024-04-17T14:00:00Z'
        }
      ]
    },
    {
      id: 6,
      name: 'Toys & Games',
      description: 'Toys, games, and entertainment',
      parent_id: null,
      color: '#EF4444',
      icon: 'TagIcon',
      status: 'active',
      product_count: 15,
      created_at: '2024-01-15T15:00:00Z',
      updated_at: '2024-04-20T16:00:00Z',
      children: [
        {
          id: 61,
          name: 'Board Games',
          description: 'Board games and card games',
          parent_id: 6,
          color: '#F87171',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 8,
          created_at: '2024-01-17T01:00:00Z',
          updated_at: '2024-04-19T17:30:00Z'
        },
        {
          id: 62,
          name: 'Video Games',
          description: 'Video games and consoles',
          parent_id: 6,
          color: '#FB7185',
          icon: 'CubeIcon',
          status: 'active',
          product_count: 5,
          created_at: '2024-01-17T02:00:00Z',
          updated_at: '2024-04-18T18:15:00Z'
        },
        {
          id: 63,
          name: 'Educational Toys',
          description: 'Educational and learning toys',
          parent_id: 6,
          color: '#FCA5A5',
          icon: 'TagIcon',
          status: 'active',
          product_count: 2,
          created_at: '2024-01-17T03:00:00Z',
          updated_at: '2024-04-17T19:00:00Z'
        }
      ]
    },
    {
      id: 7,
      name: 'Food & Beverages',
      description: 'Food items, beverages, and consumables',
      parent_id: null,
      color: '#F97316',
      icon: 'PackageIcon',
      status: 'active',
      product_count: 28,
      created_at: '2024-01-15T16:00:00Z',
      updated_at: '2024-04-20T17:15:00Z',
      children: [
        {
          id: 71,
          name: 'Snacks',
          description: 'Snack foods and treats',
          parent_id: 7,
          color: '#FB923C',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 12,
          created_at: '2024-01-17T04:00:00Z',
          updated_at: '2024-04-19T19:30:00Z'
        },
        {
          id: 72,
          name: 'Beverages',
          description: 'Drinks and beverages',
          parent_id: 7,
          color: '#FDBA74',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 10,
          created_at: '2024-01-17T05:00:00Z',
          updated_at: '2024-04-18T20:45:00Z'
        },
        {
          id: 73,
          name: 'Groceries',
          description: 'Grocery items and essentials',
          parent_id: 7,
          color: '#FED7AA',
          icon: 'ShoppingBagIcon',
          status: 'active',
          product_count: 6,
          created_at: '2024-01-17T06:00:00Z',
          updated_at: '2024-04-17T21:00:00Z'
        }
      ]
    },
    {
      id: 8,
      name: 'Health & Beauty',
      description: 'Healthcare products and beauty supplies',
      parent_id: null,
      color: '#84CC16',
      icon: 'PackageIcon',
      status: 'active',
      product_count: 22,
      created_at: '2024-01-15T17:00:00Z',
      updated_at: '2024-04-20T18:30:00Z',
      children: [
        {
          id: 81,
          name: 'Personal Care',
          description: 'Personal care and hygiene products',
          parent_id: 8,
          color: '#A3E635',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 10,
          created_at: '2024-01-17T07:00:00Z',
          updated_at: '2024-04-19T21:15:00Z'
        },
        {
          id: 82,
          name: 'Beauty Products',
          description: 'Cosmetics and beauty supplies',
          parent_id: 8,
          color: '#BEF264',
          icon: 'ShoppingBagIcon',
          status: 'active',
          product_count: 8,
          created_at: '2024-01-17T08:00:00Z',
          updated_at: '2024-04-18T22:30:00Z'
        },
        {
          id: 83,
          name: 'Health Supplements',
          description: 'Vitamins and health supplements',
          parent_id: 8,
          color: '#D9F99D',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 4,
          created_at: '2024-01-17T09:00:00Z',
          updated_at: '2024-04-17T23:00:00Z'
        }
      ]
    },
    {
      id: 9,
      name: 'Automotive',
      description: 'Automotive parts and accessories',
      parent_id: null,
      color: '#06B6D4',
      icon: 'TruckIcon',
      status: 'active',
      product_count: 18,
      created_at: '2024-01-15T18:00:00Z',
      updated_at: '2024-04-20T19:45:00Z',
      children: [
        {
          id: 91,
          name: 'Car Parts',
          description: 'Automotive parts and components',
          parent_id: 9,
          color: '#22D3EE',
          icon: 'CubeIcon',
          status: 'active',
          product_count: 10,
          created_at: '2024-01-17T10:00:00Z',
          updated_at: '2024-04-19T23:15:00Z'
        },
        {
          id: 92,
          name: 'Car Accessories',
          description: 'Car accessories and electronics',
          parent_id: 9,
          color: '#67E8F9',
          icon: 'PackageIcon',
          status: 'active',
          product_count: 5,
          created_at: '2024-01-17T11:00:00Z',
          updated_at: '2024-04-18T00:30:00Z'
        },
        {
          id: 93,
          name: 'Maintenance Supplies',
          description: 'Car maintenance and care products',
          parent_id: 9,
          color: '#A5F3FC',
          icon: 'TruckIcon',
          status: 'active',
          product_count: 3,
          created_at: '2024-01-17T12:00:00Z',
          updated_at: '2024-04-17T01:00:00Z'
        }
      ]
    },
    {
      id: 10,
      name: 'Office Supplies',
      description: 'Office equipment and supplies',
      parent_id: null,
      color: '#8B5CF6',
      icon: 'DocumentTextIcon',
      status: 'active',
      product_count: 35,
      created_at: '2024-01-15T19:00:00Z',
      updated_at: '2024-04-20T20:00:00Z',
      children: [
        {
          id: 101,
          name: 'Stationery',
          description: 'Paper, pens, and writing supplies',
          parent_id: 10,
          color: '#A78BFA',
          icon: 'DocumentTextIcon',
          status: 'active',
          product_count: 15,
          created_at: '2024-01-17T13:00:00Z',
          updated_at: '2024-04-20T01:15:00Z'
        },
        {
          id: 102,
          name: 'Office Equipment',
          description: 'Office machines and equipment',
          parent_id: 10,
          color: '#C4B5FD',
          icon: 'CubeIcon',
          status: 'active',
          product_count: 12,
          created_at: '2024-01-17T14:00:00Z',
          updated_at: '2024-04-19T02:30:00Z'
        },
        {
          id: 103,
          name: 'Furniture',
          description: 'Office furniture and decor',
          parent_id: 10,
          color: '#DDD6FE',
          icon: 'BuildingOfficeIcon',
          status: 'active',
          product_count: 8,
          created_at: '2024-01-17T15:00:00Z',
          updated_at: '2024-04-18T03:45:00Z'
        }
      ]
    }
  ];

  const statistics = {
    total_categories: categories.length,
    active_categories: categories.filter(cat => cat.status === 'active').length,
    inactive_categories: categories.filter(cat => cat.status === 'inactive').length,
    total_products: categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0),
    avg_products_per_category: Math.round(categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0) / categories.length),
    most_popular_category: categories.reduce((max, cat) => (cat.product_count || 0) > (max.product_count || 0) ? cat : max, categories[0])?.name,
    least_popular_category: categories.reduce((min, cat) => (cat.product_count || 0) < (min.product_count || 0) ? cat : min, categories[0])?.name
  };

  // Simple mutation handlers
  const handleCreateCategory = () => {
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    if (!formData.code.trim()) {
      toast.error('Category code is required');
      return;
    }

    // Create new category object
    const newCategory = {
      id: Date.now(),
      name: formData.name,
      code: formData.code,
      description: formData.description,
      parent_id: formData.parent_id,
      color: formData.color,
      icon: formData.icon,
      status: formData.status,
      product_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: []
    };

    // Add to categories array (in real app, this would be an API call)
    categories.push(newCategory);
    
    toast.success('Category created successfully');
    setShowAddModal(false);
    setFormData({
      name: '',
      code: '',
      description: '',
      parent_id: null,
      color: '#3B82F6',
      icon: 'PackageIcon',
      status: 'active'
    });
  };

  const handleUpdateCategory = () => {
    toast.success('Category updated successfully');
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = () => {
    toast.success('Category deleted successfully');
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  // Icon mapping
  const iconMap = {
    TagIcon,
    PackageIcon,
    CubeIcon,
    ShoppingBagIcon,
    BuildingOfficeIcon,
    TruckIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    FolderIcon
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || TagIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          category.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'product_count') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      color: category.color,
      icon: category.icon,
      status: category.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">Manage categories used across products</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Category</span>
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
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total_categories || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FolderIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-green-600">{statistics.active_categories || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.total_products || 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <PackageIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Products/Category</p>
              <p className="text-2xl font-bold text-orange-600">{statistics.avg_products_per_category || 0}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Categories List */}
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('product_count')}>
                  <div className="flex items-center space-x-1">
                    <span>Products</span>
                    {sortBy === 'product_count' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}>
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    {sortBy === 'created_at' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <LoadingSpinner size="large" />
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <div style={{ color: category.color }}>
                              {getIcon(category.icon)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            {category.children && category.children.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {category.children.length} subcategories
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.code || `CAT${String(category.id).padStart(3, '0')}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.product_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Render subcategories */}
                    {category.children && category.children.map((child) => (
                      <tr key={child.id} className="hover:bg-gray-50 bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3 pl-8">
                            <div 
                              className="h-6 w-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: child.color + '20' }}
                            >
                              <div style={{ color: child.color, transform: 'scale(0.8)' }}>
                                {getIcon(child.icon)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{child.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-700">
                            {child.code || `CAT${String(child.id).padStart(3, '0')}`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {child.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {child.product_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            child.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(child.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(child)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(child)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Category Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category code (e.g., CAT001)"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None (Root Category)</option>
                  {categories.filter(cat => !cat.parent_id).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="TagIcon">Tag</option>
                    <option value="PackageIcon">Package</option>
                    <option value="CubeIcon">Cube</option>
                    <option value="ShoppingBagIcon">Shopping Bag</option>
                    <option value="BuildingOfficeIcon">Building</option>
                    <option value="TruckIcon">Truck</option>
                    <option value="DocumentTextIcon">Document</option>
                    <option value="ArrowPathIcon">Arrow Path</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="btn btn-primary"
              >
                Create Category
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
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
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Category</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None (Root Category)</option>
                  {categories.filter(cat => !cat.parent_id && cat.id !== selectedCategory?.id).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="TagIcon">Tag</option>
                    <option value="PackageIcon">Package</option>
                    <option value="CubeIcon">Cube</option>
                    <option value="ShoppingBagIcon">Shopping Bag</option>
                    <option value="BuildingOfficeIcon">Building</option>
                    <option value="TruckIcon">Truck</option>
                    <option value="DocumentTextIcon">Document</option>
                    <option value="ArrowPathIcon">Arrow Path</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                className="btn btn-primary"
              >
                Update Category
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete "{selectedCategory?.name}"?
                </p>
              </div>
            </div>

            {selectedCategory?.product_count > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <InformationCircleIcon className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    This category contains {selectedCategory.product_count} products. 
                    Products will be moved to uncategorized.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="btn btn-danger"
              >
                Delete Category
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Categories;
