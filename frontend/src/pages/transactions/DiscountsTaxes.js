import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TagIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const DiscountsTaxes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    type: 'discount',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minimumAmount: 0,
    maximumDiscount: 0,
    applicableItems: [],
    customerType: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    taxType: 'gst',
    taxRate: 18,
    taxCategory: 'goods',
    hsnCode: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time discounts and taxes data
  const { data: rulesData, isLoading, refetch } = useQuery(
    'discountsTaxes',
    () => {
      const storedRules = localStorage.getItem('discountsTaxes');
      if (storedRules) {
        return JSON.parse(storedRules);
      }
      
      return [
        {
          _id: 'DIS_001',
          type: 'discount',
          name: 'Summer Sale Discount',
          description: 'Special discount for summer season',
          discountType: 'percentage',
          discountValue: 15,
          minimumAmount: 100,
          maximumDiscount: 50,
          applicableItems: ['Laptop Pro 15"', 'Wireless Mouse', 'Office Chair'],
          customerType: 'all',
          startDate: '2024-04-01',
          endDate: '2024-06-30',
          status: 'active',
          usageCount: 45,
          createdAt: '2024-04-01T09:00:00Z',
          updatedAt: '2024-04-01T09:00:00Z'
        },
        {
          _id: 'DIS_002',
          type: 'discount',
          name: 'Bulk Purchase Discount',
          description: 'Discount for bulk purchases',
          discountType: 'percentage',
          discountValue: 10,
          minimumAmount: 500,
          maximumDiscount: 100,
          applicableItems: ['all'],
          customerType: 'wholesale',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'active',
          usageCount: 23,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        },
        {
          _id: 'DIS_003',
          type: 'discount',
          name: 'Loyalty Discount',
          description: 'Special discount for loyal customers',
          discountType: 'fixed',
          discountValue: 25,
          minimumAmount: 0,
          maximumDiscount: 0,
          applicableItems: ['all'],
          customerType: 'loyal',
          startDate: '2024-03-01',
          endDate: '2024-12-31',
          status: 'active',
          usageCount: 67,
          createdAt: '2024-03-01T11:30:00Z',
          updatedAt: '2024-03-01T11:30:00Z'
        },
        {
          _id: 'DIS_004',
          type: 'discount',
          name: 'Student Discount',
          description: 'Discount for students with valid ID',
          discountType: 'percentage',
          discountValue: 20,
          minimumAmount: 50,
          maximumDiscount: 30,
          applicableItems: ['Laptop Pro 15"', 'Desktop Computer'],
          customerType: 'student',
          startDate: '2024-02-01',
          endDate: '2024-12-31',
          status: 'active',
          usageCount: 12,
          createdAt: '2024-02-01T14:20:00Z',
          updatedAt: '2024-02-01T14:20:00Z'
        },
        {
          _id: 'TAX_001',
          type: 'tax',
          name: 'GST on Electronics',
          description: 'GST applicable to electronic items',
          taxType: 'gst',
          taxRate: 18,
          taxCategory: 'goods',
          hsnCode: '8471',
          applicableItems: ['Laptop Pro 15"', 'Desktop Computer', 'Wireless Mouse'],
          customerType: 'all',
          startDate: '2024-01-01',
          endDate: '',
          status: 'active',
          usageCount: 156,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T09:00:00Z'
        },
        {
          _id: 'TAX_002',
          type: 'tax',
          name: 'GST on Furniture',
          description: 'GST applicable to furniture items',
          taxType: 'gst',
          taxRate: 12,
          taxCategory: 'goods',
          hsnCode: '9401',
          applicableItems: ['Office Chair Ergonomic', 'Conference Table'],
          customerType: 'all',
          startDate: '2024-01-01',
          endDate: '',
          status: 'active',
          usageCount: 89,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T09:00:00Z'
        },
        {
          _id: 'TAX_003',
          type: 'tax',
          name: 'VAT on Services',
          description: 'VAT applicable to services',
          taxType: 'vat',
          taxRate: 20,
          taxCategory: 'services',
          hsnCode: '',
          applicableItems: ['Installation', 'Maintenance', 'Consulting'],
          customerType: 'all',
          startDate: '2024-01-01',
          endDate: '',
          status: 'active',
          usageCount: 34,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T09:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 12000, // Real-time refresh every 12 seconds
      onSuccess: (data) => {
        console.log('Discounts and taxes data refreshed:', data);
      }
    }
  );

  // Mutation for creating new rule
  const createRuleMutation = useMutation(
    async (ruleData) => {
      const rules = rulesData || [];
      const newRule = {
        ...ruleData,
        _id: `${ruleData.type.toUpperCase()}_${Date.now()}`,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedRules = [...rules, newRule];
      localStorage.setItem('discountsTaxes', JSON.stringify(updatedRules));
      queryClient.setQueryData('discountsTaxes', updatedRules);
      return updatedRules;
    },
    {
      onSuccess: () => {
        toast.success('Rule created successfully');
        setShowDiscountModal(false);
        setShowTaxModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create rule');
      }
    }
  );

  // Mutation for updating rule
  const updateRuleMutation = useMutation(
    async (updatedRule) => {
      const rules = rulesData || [];
      const updatedRules = rules.map(rule => 
        rule._id === updatedRule._id ? {
          ...updatedRule,
          updatedAt: new Date().toISOString()
        } : rule
      );
      localStorage.setItem('discountsTaxes', JSON.stringify(updatedRules));
      queryClient.setQueryData('discountsTaxes', updatedRules);
      return updatedRules;
    },
    {
      onSuccess: () => {
        toast.success('Rule updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update rule');
      }
    }
  );

  // Mutation for deleting rule
  const deleteRuleMutation = useMutation(
    async (ruleId) => {
      const rules = rulesData || [];
      const updatedRules = rules.filter(rule => rule._id !== ruleId);
      localStorage.setItem('discountsTaxes', JSON.stringify(updatedRules));
      queryClient.setQueryData('discountsTaxes', updatedRules);
      return updatedRules;
    },
    {
      onSuccess: () => {
        toast.success('Rule deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete rule');
      }
    }
  );

  const rules = rulesData || [];

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || rule.type === filterType;
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      type: 'discount',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumAmount: 0,
      maximumDiscount: 0,
      applicableItems: [],
      customerType: 'all',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      taxType: 'gst',
      taxRate: 18,
      taxCategory: 'goods',
      hsnCode: '',
      notes: ''
    });
  };

  const openDetailsModal = (rule) => {
    setSelectedRule(rule);
    setShowDetailsModal(true);
  };

  const openEditModal = (rule) => {
    setSelectedRule(rule);
    setFormData({
      ...rule,
      applicableItems: rule.applicableItems || []
    });
    
    if (rule.type === 'discount') {
      setShowDiscountModal(true);
    } else {
      setShowTaxModal(true);
    }
  };

  const handleCreateRule = () => {
    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    if (formData.type === 'discount' && formData.discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (formData.type === 'tax' && formData.taxRate <= 0) {
      toast.error('Tax rate must be greater than 0');
      return;
    }

    createRuleMutation.mutate(formData);
  };

  const handleUpdateRule = () => {
    if (!selectedRule) return;

    const updatedRule = {
      ...formData,
      _id: selectedRule._id,
      usageCount: selectedRule.usageCount,
      createdAt: selectedRule.createdAt
    };

    updateRuleMutation.mutate(updatedRule);
  };

  const handleDeleteRule = () => {
    if (!selectedRule) return;

    if (window.confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      deleteRuleMutation.mutate(selectedRule._id);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Rules data refreshed');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'discount':
        return 'bg-green-100 text-green-800';
      case 'tax':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'discount':
        return <TagIcon className="h-4 w-4" />;
      case 'tax':
        return <ReceiptPercentIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalRules = rules.length;
  const discountRules = rules.filter(rule => rule.type === 'discount').length;
  const taxRules = rules.filter(rule => rule.type === 'tax').length;
  const activeRules = rules.filter(rule => rule.status === 'active').length;
  const inactiveRules = rules.filter(rule => rule.status === 'inactive').length;
  const expiredRules = rules.filter(rule => rule.status === 'expired').length;
  const totalUsage = rules.reduce((sum, rule) => sum + (rule.usageCount || 0), 0);

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Discounts & Taxes</h1>
            <p className="page-subtitle">Apply discount rules, Tax configuration (GST/VAT)</p>
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
                setShowDiscountModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Discount</span>
            </button>
            <button 
              onClick={() => {
                resetForm();
                setShowTaxModal(true);
              }}
              className="btn btn-outline flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Tax</span>
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
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{totalRules}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Discount Rules</p>
              <p className="text-2xl font-bold text-green-600">{discountRules}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tax Rules</p>
              <p className="text-2xl font-bold text-purple-600">{taxRules}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ReceiptPercentIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-xl font-bold text-green-600">{activeRules}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-xl font-bold text-gray-600">{inactiveRules}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-xl font-bold text-red-600">{expiredRules}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rules..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="discount">Discounts</option>
              <option value="tax">Taxes</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Rules Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicable Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
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
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                    No rules found
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500">{rule.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(rule.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rule.type)}`}>
                          {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rule.type === 'discount' 
                          ? `${rule.discountType === 'percentage' ? rule.discountValue + '%' : '$' + rule.discountValue}`
                          : rule.taxRate + '%'
                        }
                      </div>
                      {rule.type === 'discount' && rule.minimumAmount > 0 && (
                        <div className="text-xs text-gray-500">Min: ${rule.minimumAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rule.applicableItems.includes('all') ? 'All items' : `${rule.applicableItems.length} items`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{rule.customerType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rule.startDate}</div>
                      {rule.endDate && (
                        <div className="text-xs text-gray-500">to {rule.endDate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rule.usageCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                        {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(rule)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(rule)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Rule"
                        >
                          <PencilIcon className="h-4 w-4" />
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

      {/* Add Discount Modal */}
      {showDiscountModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDiscountModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Discount Rule</h3>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateRule();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter rule name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="2"
                    placeholder="Describe the discount rule"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value ({formData.discountType === 'percentage' ? '%' : '$'}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      placeholder={formData.discountType === 'percentage' ? '15' : '25'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type *</label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerType: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="all">All Customers</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="retail">Retail</option>
                      <option value="loyal">Loyal</option>
                      <option value="student">Student</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minimumAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumAmount: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maximumDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maximumDiscount: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input"
                      placeholder="Leave empty for no end date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this discount rule"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createRuleMutation.isLoading}
                >
                  {createRuleMutation.isLoading ? 'Creating...' : 'Create Discount'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Add Tax Modal */}
      {showTaxModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTaxModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Tax Rule</h3>
              <button
                onClick={() => setShowTaxModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateRule();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter tax name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type *</label>
                    <select
                      value={formData.taxType}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxType: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="gst">GST</option>
                      <option value="vat">VAT</option>
                      <option value="sales_tax">Sales Tax</option>
                      <option value="service_tax">Service Tax</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="2"
                    placeholder="Describe the tax rule"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.taxRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      placeholder="18"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Category *</label>
                    <select
                      value={formData.taxCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxCategory: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="goods">Goods</option>
                      <option value="services">Services</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                    <input
                      type="text"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, hsnCode: e.target.value }))}
                      className="input"
                      placeholder="e.g., 8471"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type *</label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerType: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="all">All Customers</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="retail">Retail</option>
                      <option value="b2b">B2B</option>
                      <option value="b2c">B2C</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input"
                      placeholder="Leave empty for no end date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this tax rule"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTaxModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createRuleMutation.isLoading}
                >
                  {createRuleMutation.isLoading ? 'Creating...' : 'Create Tax'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Rule Details Modal */}
      {showDetailsModal && selectedRule && (
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
              <h3 className="text-lg font-semibold text-gray-900">Rule Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Rule Name</p>
                <p className="text-sm text-gray-900">{selectedRule.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedRule.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedRule.type)}`}>
                    {selectedRule.type.charAt(0).toUpperCase() + selectedRule.type.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRule.status)}`}>
                  {selectedRule.status.charAt(0).toUpperCase() + selectedRule.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Usage Count</p>
                <p className="text-sm text-gray-900">{selectedRule.usageCount || 0}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-sm text-gray-900">{selectedRule.description}</p>
            </div>

            {selectedRule.type === 'discount' ? (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Discount Type</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedRule.discountType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Discount Value</p>
                    <p className="text-sm text-gray-900">
                      {selectedRule.discountType === 'percentage' ? selectedRule.discountValue + '%' : '$' + selectedRule.discountValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Minimum Amount</p>
                    <p className="text-sm text-gray-900">${selectedRule.minimumAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Maximum Discount</p>
                    <p className="text-sm text-gray-900">${selectedRule.maximumDiscount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tax Type</p>
                    <p className="text-sm text-gray-900 uppercase">{selectedRule.taxType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tax Rate</p>
                    <p className="text-sm text-gray-900">{selectedRule.taxRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tax Category</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedRule.taxCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">HSN Code</p>
                    <p className="text-sm text-gray-900">{selectedRule.hsnCode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Type</p>
                <p className="text-sm text-gray-900 capitalize">{selectedRule.customerType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Applicable Items</p>
                <p className="text-sm text-gray-900">
                  {selectedRule.applicableItems.includes('all') ? 'All items' : `${selectedRule.applicableItems.length} items`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Start Date</p>
                <p className="text-sm text-gray-900">{selectedRule.startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">End Date</p>
                <p className="text-sm text-gray-900">{selectedRule.endDate || 'No end date'}</p>
              </div>
            </div>

            {selectedRule.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedRule.notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedRule.createdAt).toLocaleString()}
                {selectedRule.updatedAt !== selectedRule.createdAt && (
                  <span> | Updated: {new Date(selectedRule.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedRule);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteRule}
                  className="btn btn-outline btn-sm"
                >
                  Delete
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

export default DiscountsTaxes;
