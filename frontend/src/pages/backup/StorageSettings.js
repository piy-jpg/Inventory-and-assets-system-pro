import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  ServerIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const StorageSettings = () => {
  const [showAddStorageModal, setShowAddStorageModal] = useState(false);
  const [showTestConnectionModal, setShowTestConnectionModal] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [testConnectionLoading, setTestConnectionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'local',
    provider: '',
    config: {},
    enabled: true,
    isDefault: false
  });

  const queryClient = useQueryClient();

  // Real-time storage settings data
  const { data: storageData, isLoading, refetch } = useQuery(
    'storageSettings',
    () => {
      const storedStorage = localStorage.getItem('storageSettings');
      if (storedStorage) {
        return JSON.parse(storedStorage);
      }
      
      return {
        local: {
          enabled: true,
          path: '/var/backups',
          maxSize: '500 GB',
          usedSpace: '45.2 GB',
          availableSpace: '454.8 GB',
          percentage: 9.0,
          lastAccessed: '2024-04-23T10:30:00Z',
          status: 'healthy'
        },
        cloud: [
          {
            _id: 'STORAGE_001',
            name: 'AWS S3 Primary',
            type: 'cloud',
            provider: 'aws_s3',
            enabled: true,
            isDefault: true,
            config: {
              bucket: 'inventory-backups',
              region: 'us-east-1',
              accessKey: 'AKIA...',
              secretKey: 'masked',
              endpoint: 'https://s3.amazonaws.com'
            },
            usage: {
              maxSize: '1 TB',
              usedSpace: '79.5 GB',
              availableSpace: '920.5 GB',
              percentage: 7.8,
              fileCount: 1247
            },
            status: 'connected',
            lastSync: '2024-04-23T02:00:00Z',
            connectionTest: {
              lastTest: '2024-04-23T09:15:00Z',
              status: 'success',
              latency: '45ms',
              bandwidth: '125 Mbps'
            }
          },
          {
            _id: 'STORAGE_002',
            name: 'Google Drive Backup',
            type: 'cloud',
            provider: 'google_drive',
            enabled: true,
            isDefault: false,
            config: {
              folderId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
              clientId: 'masked',
              clientSecret: 'masked'
            },
            usage: {
              maxSize: '15 GB',
              usedSpace: '3.2 GB',
              availableSpace: '11.8 GB',
              percentage: 21.3,
              fileCount: 156
            },
            status: 'connected',
            lastSync: '2024-04-22T15:30:00Z',
            connectionTest: {
              lastTest: '2024-04-22T16:00:00Z',
              status: 'success',
              latency: '120ms',
              bandwidth: '45 Mbps'
            }
          },
          {
            _id: 'STORAGE_003',
            name: 'Dropbox Archive',
            type: 'cloud',
            provider: 'dropbox',
            enabled: false,
            isDefault: false,
            config: {
              accessToken: 'masked',
              appKey: 'masked',
              appSecret: 'masked'
            },
            usage: {
              maxSize: '2 GB',
              usedSpace: '0.8 GB',
              availableSpace: '1.2 GB',
              percentage: 40.0,
              fileCount: 45
            },
            status: 'disconnected',
            lastSync: '2024-04-15T10:00:00Z',
            connectionTest: {
              lastTest: '2024-04-15T10:30:00Z',
              status: 'failed',
              error: 'Access token expired'
            }
          }
        ]
      };
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Storage settings data refreshed:', data);
      }
    }
  );

  // Mutation for adding storage
  const addStorageMutation = useMutation(
    async (storageData) => {
      const storage = storageData || {};
      const newStorage = {
        ...storageData,
        _id: `STORAGE_${Date.now()}`,
        usage: {
          maxSize: '100 GB',
          usedSpace: '0 GB',
          availableSpace: '100 GB',
          percentage: 0,
          fileCount: 0
        },
        status: 'disconnected',
        lastSync: null,
        connectionTest: {
          lastTest: null,
          status: 'pending'
        }
      };
      const updatedStorage = {
        ...storage,
        cloud: [...storage.cloud, newStorage]
      };
      localStorage.setItem('storageSettings', JSON.stringify(updatedStorage));
      queryClient.setQueryData('storageSettings', updatedStorage);
      return newStorage;
    },
    {
      onSuccess: () => {
        toast.success('Storage added successfully');
        setShowAddStorageModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to add storage');
      }
    }
  );

  // Mutation for updating storage
  const updateStorageMutation = useMutation(
    async (updatedStorage) => {
      const storage = storageData || {};
      const updatedStorageList = storage.cloud.map(s => 
        s._id === updatedStorage._id ? {
          ...updatedStorage,
          updatedAt: new Date().toISOString()
        } : s
      );
      const updatedStorageData = {
        ...storage,
        cloud: updatedStorageList
      };
      localStorage.setItem('storageSettings', JSON.stringify(updatedStorageData));
      queryClient.setQueryData('storageSettings', updatedStorageData);
      return updatedStorageData;
    },
    {
      onSuccess: () => {
        toast.success('Storage updated successfully');
        setShowTestConnectionModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update storage');
      }
    }
  );

  // Mutation for deleting storage
  const deleteStorageMutation = useMutation(
    async (storageId) => {
      const storage = storageData || {};
      const updatedStorageList = storage.cloud.filter(s => s._id !== storageId);
      const updatedStorageData = {
        ...storage,
        cloud: updatedStorageList
      };
      localStorage.setItem('storageSettings', JSON.stringify(updatedStorageData));
      queryClient.setQueryData('storageSettings', updatedStorageData);
      return updatedStorageData;
    },
    {
      onSuccess: () => {
        toast.success('Storage deleted successfully');
        setShowTestConnectionModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete storage');
      }
    }
  );

  // Mutation for testing connection
  const testConnectionMutation = useMutation(
    async (storageId) => {
      setTestConnectionLoading(true);
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const storage = storageData.cloud.find(s => s._id === storageId);
      if (!storage) throw new Error('Storage not found');
      
      // Simulate test result
      const testResult = {
        lastTest: new Date().toISOString(),
        status: Math.random() > 0.2 ? 'success' : 'failed',
        latency: Math.floor(Math.random() * 200) + 50 + 'ms',
        bandwidth: Math.floor(Math.random() * 150) + 50 + ' Mbps',
        error: Math.random() > 0.8 ? 'Connection timeout' : null
      };
      
      // Update storage with test result
      const updatedStorage = {
        ...storage,
        connectionTest: testResult,
        status: testResult.status === 'success' ? 'connected' : 'disconnected'
      };
      
      updateStorageMutation.mutate(updatedStorage);
      setTestConnectionLoading(false);
      
      return testResult;
    },
    {
      onSuccess: (data) => {
        if (data.status === 'success') {
          toast.success('Connection test successful');
        } else {
          toast.error(`Connection test failed: ${data.error || 'Unknown error'}`);
        }
      },
      onError: () => {
        toast.error('Failed to test connection');
        setTestConnectionLoading(false);
      }
    }
  );

  const storage = storageData || {};
  const cloudStorages = storage.cloud || [];

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'local',
      provider: '',
      config: {},
      enabled: true,
      isDefault: false
    });
  };

  const openAddStorageModal = () => {
    resetForm();
    setShowAddStorageModal(true);
  };

  const openTestConnectionModal = (storageItem) => {
    setSelectedStorage(storageItem);
    setShowTestConnectionModal(true);
  };

  const handleAddStorage = () => {
    if (!formData.name.trim()) {
      toast.error('Storage name is required');
      return;
    }

    if (formData.type === 'cloud' && !formData.provider) {
      toast.error('Provider is required for cloud storage');
      return;
    }

    addStorageMutation.mutate(formData);
  };

  const handleTestConnection = () => {
    if (!selectedStorage) return;

    testConnectionMutation.mutate(selectedStorage._id);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Storage settings data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'aws_s3':
        return '🟧';
      case 'google_drive':
        return '🟦';
      case 'dropbox':
        return '🟦';
      case 'azure_blob':
        return '🔷';
      default:
        return '☁️';
    }
  };

  const getStorageColor = (percentage) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate statistics
  const totalCloudStorage = cloudStorages.reduce((sum, storage) => {
    const size = parseFloat(storage.usage.maxSize) || 0;
    return sum + size;
  }, 0);

  const totalCloudUsed = cloudStorages.reduce((sum, storage) => {
    const size = parseFloat(storage.usage.usedSpace) || 0;
    return sum + size;
  }, 0);

  const connectedStorages = cloudStorages.filter(storage => storage.enabled && storage.status === 'connected').length;
  const totalStorages = cloudStorages.length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Storage Settings</h1>
            <p className="page-subtitle">Local storage, Cloud integration, Show available space</p>
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
              onClick={openAddStorageModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Storage</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Local Storage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Local Storage</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(storage.local?.status)}`}>
            {storage.local?.status}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <ServerIcon className="h-8 w-8 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{storage.local?.path || '/var/backups'}</p>
              <p className="text-xs text-gray-500">Last accessed: {storage.local?.lastAccessed ? new Date(storage.local.lastAccessed).toLocaleString() : 'Never'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Used Space</span>
              <span className="text-sm font-medium text-gray-900">{storage.local?.usedSpace || '0 GB'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available Space</span>
              <span className="text-sm font-medium text-gray-900">{storage.local?.availableSpace || '0 GB'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${storage.local?.percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Total: {storage.local?.maxSize || '0 GB'}</span>
              <span className={`text-xs font-medium ${getStorageColor(storage.local?.percentage)}`}>
                {storage.local?.percentage || 0}% used
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cloud Storage Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Storage</p>
              <p className="text-2xl font-bold text-gray-900">{totalCloudStorage.toFixed(1)} GB</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CloudArrowUpIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Used Space</p>
              <p className="text-2xl font-bold text-purple-600">{totalCloudUsed.toFixed(1)} GB</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">{connectedStorages}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Storages</p>
              <p className="text-2xl font-bold text-gray-600">{totalStorages}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Cog6ToothIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cloud Storage List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cloud Storage</h3>
        </div>
        <div className="p-6 space-y-4">
          {cloudStorages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No cloud storage configured</p>
              <button
                onClick={openAddStorageModal}
                className="btn btn-primary btn-sm mt-4"
              >
                Add Cloud Storage
              </button>
            </div>
          ) : (
            cloudStorages.map((storageItem) => (
              <div key={storageItem._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getProviderIcon(storageItem.provider)}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{storageItem.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{storageItem.provider.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {storageItem.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(storageItem.status)}`}>
                      {storageItem.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      storageItem.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {storageItem.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Used Space</span>
                      <span className="text-sm font-medium text-gray-900">{storageItem.usage.usedSpace}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Available Space</span>
                      <span className="text-sm font-medium text-gray-900">{storageItem.usage.availableSpace}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${storageItem.usage.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Total: {storageItem.usage.maxSize}</span>
                      <span className={`text-xs font-medium ${getStorageColor(storageItem.usage.percentage)}`}>
                        {storageItem.usage.percentage}% used
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">File Count</span>
                      <span className="text-sm font-medium text-gray-900">{storageItem.usage.fileCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium text-gray-900">
                        {storageItem.lastSync ? new Date(storageItem.lastSync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    {storageItem.connectionTest && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Connection Test</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            storageItem.connectionTest.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {storageItem.connectionTest.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {storageItem.connectionTest.latency}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Last test: {storageItem.connectionTest?.lastTest ? new Date(storageItem.connectionTest.lastTest).toLocaleString() : 'Never'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openTestConnectionModal(storageItem)}
                      className="btn btn-secondary btn-sm"
                      disabled={testConnectionLoading}
                    >
                      {testConnectionLoading ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStorage(storageItem);
                        // Edit functionality would go here
                        toast.success('Edit functionality coming soon');
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this storage configuration?')) {
                          deleteStorageMutation.mutate(storageItem._id);
                        }
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Add Storage Modal */}
      {showAddStorageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddStorageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Cloud Storage</h3>
              <button
                onClick={() => setShowAddStorageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddStorage();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter storage name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select provider</option>
                    <option value="aws_s3">Amazon S3</option>
                    <option value="google_drive">Google Drive</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="azure_blob">Azure Blob Storage</option>
                    <option value="onedrive">OneDrive</option>
                  </select>
                </div>

                {formData.provider === 'aws_s3' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
                      <input
                        type="text"
                        value={formData.config.bucket || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          config: { ...prev.config, bucket: e.target.value }
                        }))}
                        className="input"
                        placeholder="my-backup-bucket"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                      <select
                        value={formData.config.region || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          config: { ...prev.config, region: e.target.value }
                        }))}
                        className="input"
                      >
                        <option value="">Select region</option>
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">Europe (Ireland)</option>
                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Key</label>
                      <input
                        type="password"
                        value={formData.config.accessKey || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          config: { ...prev.config, accessKey: e.target.value }
                        }))}
                        className="input"
                        placeholder="Enter AWS access key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={formData.config.secretKey || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          config: { ...prev.config, secretKey: e.target.value }
                        }))}
                        className="input"
                        placeholder="Enter AWS secret key"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enable storage</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Set as default</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStorageModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addStorageMutation.isLoading}
                >
                  {addStorageMutation.isLoading ? 'Adding...' : 'Add Storage'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Test Connection Modal */}
      {showTestConnectionModal && selectedStorage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTestConnectionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Connection</h3>
              <button
                onClick={() => setShowTestConnectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getProviderIcon(selectedStorage.provider)}</div>
                <div>
                  <p className="font-medium text-gray-900">{selectedStorage.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{selectedStorage.provider.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedStorage.connectionTest && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Test</span>
                      <span className="text-sm text-gray-900">
                        {selectedStorage.connectionTest.lastTest ? new Date(selectedStorage.connectionTest.lastTest).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedStorage.connectionTest.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStorage.connectionTest.status}
                      </span>
                    </div>
                    {selectedStorage.connectionTest.latency && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Latency</span>
                        <span className="text-sm text-gray-900">{selectedStorage.connectionTest.latency}</span>
                      </div>
                    )}
                    {selectedStorage.connectionTest.bandwidth && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bandwidth</span>
                        <span className="text-sm text-gray-900">{selectedStorage.connectionTest.bandwidth}</span>
                      </div>
                    )}
                    {selectedStorage.connectionTest.error && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Error</span>
                        <span className="text-sm text-red-600">{selectedStorage.connectionTest.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BellIcon className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Testing connection will verify connectivity and performance metrics.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTestConnectionModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handleTestConnection}
                className="btn btn-primary"
                disabled={testConnectionLoading}
              >
                {testConnectionLoading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default StorageSettings;
