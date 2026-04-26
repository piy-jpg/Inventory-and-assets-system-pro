import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  BellIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AlertSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    description: '',
    threshold: '',
    thresholdUnit: 'units',
    frequency: '',
    enabled: true,
    channels: []
  });

  const queryClient = useQueryClient();

  // Real-time alert settings data
  const { data: settingsData, isLoading, refetch } = useQuery(
    'alertSettings',
    () => {
      const storedSettings = localStorage.getItem('alertSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return [
        {
          _id: 'SETTING_001',
          name: 'Low Stock Level Alert',
          category: 'inventory',
          type: 'low_stock',
          threshold: 10,
          thresholdUnit: 'units',
          frequency: 'real_time',
          enabled: true,
          channels: ['email', 'in_app'],
          description: 'Alert when stock level falls below threshold',
          metadata: {
            applicableProducts: 'all',
            severity: 'warning',
            autoResolve: false
          }
        },
        {
          _id: 'SETTING_002',
          name: 'Overdue Payment Alert',
          category: 'payment',
          type: 'overdue_payment',
          threshold: 7,
          thresholdUnit: 'days',
          frequency: 'daily',
          enabled: true,
          channels: ['email', 'sms'],
          description: 'Alert when payment is overdue by threshold days',
          metadata: {
            applicableInvoices: 'all',
            severity: 'error',
            includeLateFees: true
          }
        },
        {
          _id: 'SETTING_003',
          name: 'Asset Maintenance Due',
          category: 'asset',
          type: 'maintenance_due',
          threshold: 30,
          thresholdUnit: 'days',
          frequency: 'weekly',
          enabled: true,
          channels: ['email'],
          description: 'Alert when asset maintenance is due',
          metadata: {
            applicableAssets: 'all',
            severity: 'warning',
            includeCost: true
          }
        },
        {
          _id: 'SETTING_004',
          name: 'Product Expiry Warning',
          category: 'expiry',
          type: 'product_expiry',
          threshold: 30,
          thresholdUnit: 'days',
          frequency: 'daily',
          enabled: true,
          channels: ['email', 'in_app'],
          description: 'Alert when product is approaching expiry',
          metadata: {
            applicableProducts: 'all',
            severity: 'warning',
            batchTracking: true
          }
        },
        {
          _id: 'SETTING_005',
          name: 'Failed Login Attempts',
          category: 'user_activity',
          type: 'suspicious_login',
          threshold: 5,
          thresholdUnit: 'attempts',
          frequency: 'real_time',
          enabled: true,
          channels: ['email', 'sms', 'in_app'],
          description: 'Alert on multiple failed login attempts',
          metadata: {
            timeWindow: '1 hour',
            severity: 'error',
            lockAccount: true
          }
        },
        {
          _id: 'SETTING_006',
          name: 'Backup Failure Alert',
          category: 'system',
          type: 'backup_failure',
          threshold: 1,
          thresholdUnit: 'failure',
          frequency: 'real_time',
          enabled: true,
          channels: ['email', 'sms'],
          description: 'Alert when backup process fails',
          metadata: {
            severity: 'error',
            includeLogs: true,
            retryCount: 3
          }
        },
        {
          _id: 'SETTING_007',
          name: 'High CPU Usage',
          category: 'system',
          type: 'server_downtime',
          threshold: 80,
          thresholdUnit: 'percentage',
          frequency: 'real_time',
          enabled: false,
          channels: ['email'],
          description: 'Alert when CPU usage exceeds threshold',
          metadata: {
            severity: 'warning',
            duration: '5 minutes',
            servers: ['web_01', 'app_01']
          }
        },
        {
          _id: 'SETTING_008',
          name: 'SSL Certificate Expiry',
          category: 'system',
          type: 'ssl_certificate',
          threshold: 7,
          thresholdUnit: 'days',
          frequency: 'daily',
          enabled: true,
          channels: ['email'],
          description: 'Alert when SSL certificate is expiring',
          metadata: {
            severity: 'warning',
            autoRenewal: true,
            domains: ['inventory.example.com']
          }
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Alert settings data refreshed:', data);
      }
    }
  );

  // Mutation for creating alert setting
  const createSettingMutation = useMutation(
    async (settingData) => {
      const settings = settingsData || [];
      const newSetting = {
        ...settingData,
        _id: `SETTING_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedSettings = [...settings, newSetting];
      localStorage.setItem('alertSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('alertSettings', updatedSettings);
      return newSetting;
    },
    {
      onSuccess: () => {
        toast.success('Alert setting created successfully');
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create alert setting');
      }
    }
  );

  // Mutation for updating alert setting
  const updateSettingMutation = useMutation(
    async (updatedSetting) => {
      const settings = settingsData || [];
      const updatedSettings = settings.map(setting => 
        setting._id === updatedSetting._id ? {
          ...updatedSetting,
          updated_at: new Date().toISOString()
        } : setting
      );
      localStorage.setItem('alertSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('alertSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('Alert setting updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update alert setting');
      }
    }
  );

  // Mutation for deleting alert setting
  const deleteSettingMutation = useMutation(
    async (settingId) => {
      const settings = settingsData || [];
      const updatedSettings = settings.filter(setting => setting._id !== settingId);
      localStorage.setItem('alertSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('alertSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('Alert setting deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete alert setting');
      }
    }
  );

  // Mutation for toggling alert setting
  const toggleSettingMutation = useMutation(
    async ({ settingId, enabled }) => {
      const settings = settingsData || [];
      const updatedSettings = settings.map(setting => 
        setting._id === settingId ? {
          ...setting,
          enabled,
          updated_at: new Date().toISOString()
        } : setting
      );
      localStorage.setItem('alertSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('alertSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('Alert setting updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update alert setting');
      }
    }
  );

  const settings = settingsData || [];

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        setting.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || setting.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      type: '',
      description: '',
      threshold: '',
      thresholdUnit: 'units',
      frequency: '',
      enabled: true,
      channels: []
    });
  };

  const openDetailsModal = (setting) => {
    setSelectedSetting(setting);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    setSelectedSetting(null);
    setShowCreateModal(true);
  };

  const handleCreateSetting = () => {
    if (!formData.name.trim()) {
      toast.error('Setting name is required');
      return;
    }

    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    if (!formData.type) {
      toast.error('Type is required');
      return;
    }

    if (!formData.threshold) {
      toast.error('Threshold is required');
      return;
    }

    if (!formData.thresholdUnit) {
      toast.error('Threshold unit is required');
      return;
    }

    if (!formData.frequency) {
      toast.error('Frequency is required');
      return;
    }

    if (formData.channels.length === 0) {
      toast.error('At least one notification channel is required');
      return;
    }

    createSettingMutation.mutate(formData);
  };

  const handleUpdateSetting = () => {
    if (!selectedSetting) return;

    if (!formData.name.trim()) {
      toast.error('Setting name is required');
      return;
    }

    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    if (!formData.type) {
      toast.error('Type is required');
      return;
    }

    if (!formData.threshold) {
      toast.error('Threshold is required');
      return;
    }

    if (!formData.thresholdUnit) {
      toast.error('Threshold unit is required');
      return;
    }

    if (!formData.frequency) {
      toast.error('Frequency is required');
      return;
    }

    if (formData.channels.length === 0) {
      toast.error('At least one notification channel is required');
      return;
    }

    updateSettingMutation.mutate({
      ...selectedSetting,
      ...formData
    });
  };

  const handleDeleteSetting = () => {
    if (!selectedSetting) return;

    if (window.confirm('Are you sure you want to delete this alert setting? This action cannot be undone.')) {
      deleteSettingMutation.mutate(selectedSetting._id);
    }
  };

  const handleToggleSetting = (settingId, enabled) => {
    toggleSettingMutation.mutate({
      settingId,
      enabled
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Alert settings data refreshed');
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'inventory':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'asset':
        return 'bg-orange-100 text-orange-800';
      case 'expiry':
        return 'bg-red-100 text-red-800';
      case 'user_activity':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'inventory':
        return <CubeIcon className="h-4 w-4" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'asset':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'expiry':
        return <CalendarIcon className="h-4 w-4" />;
      case 'user_activity':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'system':
        return <ServerIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'real_time':
        return 'bg-red-100 text-red-800';
      case 'hourly':
        return 'bg-orange-100 text-orange-800';
      case 'daily':
        return 'bg-yellow-100 text-yellow-800';
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalSettings = settings.length;
  const enabledSettings = settings.filter(setting => setting.enabled).length;
  const disabledSettings = settings.filter(setting => !setting.enabled).length;
  const realTimeSettings = settings.filter(setting => setting.frequency === 'real_time').length;

  // Category breakdown
  const categoryBreakdown = settings.reduce((acc, setting) => {
    acc[setting.category] = (acc[setting.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Alert Settings</h1>
            <p className="page-subtitle">Enable/disable specific alerts, Set thresholds, Configure frequency</p>
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
              onClick={openCreateModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Setting</span>
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
              <p className="text-sm font-medium text-gray-600">Total Settings</p>
              <p className="text-2xl font-bold text-gray-900">{totalSettings}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Cog6ToothIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enabled</p>
              <p className="text-2xl font-bold text-green-600">{enabledSettings}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disabled</p>
              <p className="text-2xl font-bold text-gray-600">{disabledSettings}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Real-time</p>
              <p className="text-2xl font-bold text-red-600">{realTimeSettings}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
      >
        {Object.entries(categoryBreakdown).map(([category, count]) => (
          <div key={category} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(category)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {category.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
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
                placeholder="Search alert settings..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="inventory">Inventory</option>
              <option value="payment">Payment</option>
              <option value="asset">Asset</option>
              <option value="expiry">Expiry</option>
              <option value="user_activity">User Activity</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Settings Table */}
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
                  Setting Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channels
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
              {filteredSettings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No alert settings found
                  </td>
                </tr>
              ) : (
                filteredSettings.map((setting) => (
                  <tr key={setting._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{setting.name}</div>
                      <div className="text-xs text-gray-500">{setting.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(setting.category)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(setting.category)}`}>
                          {setting.category.replace('_', ' ').charAt(0).toUpperCase() + setting.category.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {setting.threshold} {setting.thresholdUnit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(setting.frequency)}`}>
                        {setting.frequency.replace('_', ' ').charAt(0).toUpperCase() + setting.frequency.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {setting.channels.map((channel, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {channel.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSetting(setting._id, !setting.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(setting)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSetting(setting);
                            setFormData({
                              name: setting.name,
                              category: setting.category,
                              type: setting.type,
                              description: setting.description || '',
                              threshold: setting.threshold,
                              thresholdUnit: setting.thresholdUnit || 'units',
                              frequency: setting.frequency,
                              enabled: setting.enabled,
                              channels: setting.channels
                            });
                            setIsEditMode(true);
                            setShowCreateModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSetting(setting);
                            handleDeleteSetting();
                          }}
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

      {/* Create Setting Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
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
                {isEditMode ? 'Edit Alert Setting' : 'Add Alert Setting'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditMode(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (isEditMode) {
                handleUpdateSetting();
              } else {
                handleCreateSetting();
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setting Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter setting name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="inventory">Inventory</option>
                    <option value="payment">Payment</option>
                    <option value="asset">Asset</option>
                    <option value="expiry">Expiry</option>
                    <option value="user_activity">User Activity</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="overdue_payment">Overdue Payment</option>
                    <option value="maintenance_due">Maintenance Due</option>
                    <option value="product_expiry">Product Expiry</option>
                    <option value="suspicious_login">Suspicious Login</option>
                    <option value="backup_failure">Backup Failure</option>
                    <option value="server_downtime">Server Downtime</option>
                    <option value="ssl_certificate">SSL Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="2"
                    placeholder="Enter description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Threshold *</label>
                    <input
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
                      className="input"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Threshold Unit *</label>
                    <select
                      value={formData.thresholdUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, thresholdUnit: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="units">Units</option>
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                      <option value="percentage">Percentage</option>
                      <option value="attempts">Attempts</option>
                      <option value="failure">Failure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select frequency</option>
                    <option value="real_time">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Channels</label>
                  <div className="space-y-2">
                    {['email', 'sms', 'in_app', 'webhook'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, channels: [...prev.channels, channel] }));
                            } else {
                              setFormData(prev => ({ ...prev, channels: prev.channels.filter(c => c !== channel) }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setIsEditMode(false);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createSettingMutation.isLoading || updateSettingMutation.isLoading}
                >
                  {isEditMode ? 
                    (updateSettingMutation.isLoading ? 'Updating...' : 'Update Setting') : 
                    (createSettingMutation.isLoading ? 'Creating...' : 'Create Setting')
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Setting Details Modal */}
      {showDetailsModal && selectedSetting && (
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
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert Setting Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Setting Name</p>
                <p className="text-sm text-gray-900">{selectedSetting.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">{selectedSetting.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(selectedSetting.category)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedSetting.category)}`}>
                      {selectedSetting.category.replace('_', ' ').charAt(0).toUpperCase() + selectedSetting.category.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="text-sm text-gray-900">{selectedSetting.type.replace('_', ' ').charAt(0).toUpperCase() + selectedSetting.type.replace('_', ' ').slice(1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Threshold</p>
                  <p className="text-sm text-gray-900">{selectedSetting.threshold} {selectedSetting.thresholdUnit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Frequency</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(selectedSetting.frequency)}`}>
                    {selectedSetting.frequency.replace('_', ' ').charAt(0).toUpperCase() + selectedSetting.frequency.replace('_', ' ').slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedSetting.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedSetting.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{new Date(selectedSetting.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Notification Channels</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSetting.channels.map((channel, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {channel.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selectedSetting.metadata && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Additional Settings</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedSetting.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    // Open edit modal with current setting data
                    setFormData({
                      name: selectedSetting.name,
                      category: selectedSetting.category,
                      type: selectedSetting.type,
                      description: selectedSetting.description || '',
                      threshold: selectedSetting.threshold,
                      thresholdUnit: selectedSetting.thresholdUnit || 'units',
                      frequency: selectedSetting.frequency,
                      enabled: selectedSetting.enabled,
                      channels: selectedSetting.channels
                    });
                    setIsEditMode(true);
                    setShowCreateModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteSetting}
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

export default AlertSettings;
