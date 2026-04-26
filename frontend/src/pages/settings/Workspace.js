import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ShieldCheckIcon,
  ClockIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const Workspace = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [resetProgress, setResetProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const queryClient = useQueryClient();

  // Mock workspace data
  const { data: workspaceData, isLoading, refetch } = useQuery(
    'workspaceSettings',
    () => {
      const storedSettings = localStorage.getItem('workspaceSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return {
        demoMode: {
          enabled: true,
          lastReset: '2024-04-15T10:00:00Z',
          resetCount: 5,
          autoReset: false,
          autoResetInterval: 30, // days
          dataRetentionDays: 90
        },
        sandboxMode: {
          enabled: false,
          isolated: true,
          allowExternalAPIs: false,
          allowFileUploads: true,
          maxFileSize: 10, // MB
          sessionTimeout: 120, // minutes
          lastActivity: '2024-04-23T10:30:00Z'
        },
        datasets: [
          {
            id: 'basic_inventory',
            name: 'Basic Inventory',
            description: 'Essential inventory data with 50 products',
            size: '2.5 MB',
            records: 150,
            type: 'inventory',
            lastModified: '2024-04-10T15:30:00Z',
            compatible: true
          },
          {
            id: 'retail_store',
            name: 'Retail Store Demo',
            description: 'Complete retail store simulation with 500+ products',
            size: '15.2 MB',
            records: 1250,
            type: 'retail',
            lastModified: '2024-04-08T12:15:00Z',
            compatible: true
          },
          {
            id: 'warehouse_management',
            name: 'Warehouse Management',
            description: 'Large-scale warehouse operations with 1000+ items',
            size: '28.7 MB',
            records: 3200,
            type: 'warehouse',
            lastModified: '2024-04-05T09:45:00Z',
            compatible: true
          },
          {
            id: 'manufacturing',
            name: 'Manufacturing Demo',
            description: 'Manufacturing process tracking with raw materials',
            size: '35.1 MB',
            records: 4500,
            type: 'manufacturing',
            lastModified: '2024-04-03T14:20:00Z',
            compatible: false
          }
        ],
        currentData: {
          products: 1247,
          customers: 345,
          suppliers: 89,
          transactions: 5689,
          totalRecords: 7370,
          dataSize: '45.2 GB',
          lastBackup: '2024-04-23T02:00:00Z',
          dataAge: 8 // days since last reset
        },
        systemStatus: {
          database: 'healthy',
          storage: '45.2 GB / 500 GB',
          memory: '2.1 GB / 8 GB',
          cpu: '45%',
          uptime: '99.9%',
          lastMaintenance: '2024-04-20T03:00:00Z'
        }
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        console.log('Workspace data refreshed:', data);
      }
    }
  );

  // Reset demo data mutation
  const resetDemoMutation = useMutation(
    async (options = {}) => {
      setShowResetModal(true);
      setResetProgress(0);
      
      // Simulate reset process
      const steps = [
        { name: 'Creating backup of current data', duration: 2000 },
        { name: 'Clearing products database', duration: 1500 },
        { name: 'Clearing customer records', duration: 1000 },
        { name: 'Clearing supplier data', duration: 800 },
        { name: 'Clearing transaction history', duration: 1200 },
        { name: 'Resetting counters and sequences', duration: 500 },
        { name: 'Optimizing database', duration: 1000 },
        { name: 'Finalizing reset process', duration: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i].name);
        setResetProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Update workspace settings
      const updatedSettings = {
        ...workspaceData,
        demoMode: {
          ...workspaceData.demoMode,
          lastReset: new Date().toISOString(),
          resetCount: (workspaceData.demoMode?.resetCount || 0) + 1
        },
        currentData: {
          products: 0,
          customers: 0,
          suppliers: 0,
          transactions: 0,
          totalRecords: 0,
          dataSize: '0 GB',
          lastBackup: null,
          dataAge: 0
        }
      };
      localStorage.setItem('workspaceSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('workspaceSettings', updatedSettings);
      
      setResetProgress(100);
      setCurrentStep('Reset completed successfully');
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Demo data reset successfully');
        setTimeout(() => setShowResetModal(false), 2000);
        refetch();
      },
      onError: () => {
        toast.error('Failed to reset demo data');
        setShowResetModal(false);
      }
    }
  );

  // Load sample data mutation
  const loadSampleMutation = useMutation(
    async (datasetId) => {
      setShowLoadModal(true);
      setLoadProgress(0);
      
      const dataset = workspaceData.datasets.find(d => d.id === datasetId);
      
      // Simulate loading process
      const steps = [
        { name: 'Validating dataset compatibility', duration: 1000 },
        { name: 'Preparing database schema', duration: 1500 },
        { name: 'Loading product data', duration: 2000 },
        { name: 'Loading customer records', duration: 1200 },
        { name: 'Loading supplier information', duration: 800 },
        { name: 'Creating sample transactions', duration: 2500 },
        { name: 'Building indexes and relationships', duration: 1000 },
        { name: 'Finalizing data import', duration: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i].name);
        setLoadProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Update workspace settings with new data
      const updatedSettings = {
        ...workspaceData,
        currentData: {
          products: dataset.records * 0.4, // Approximate distribution
          customers: dataset.records * 0.25,
          suppliers: dataset.records * 0.15,
          transactions: dataset.records * 0.2,
          totalRecords: dataset.records,
          dataSize: dataset.size,
          lastBackup: new Date().toISOString(),
          dataAge: 0
        }
      };
      localStorage.setItem('workspaceSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('workspaceSettings', updatedSettings);
      
      setLoadProgress(100);
      setCurrentStep('Data loaded successfully');
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Sample data loaded successfully');
        setTimeout(() => setShowLoadModal(false), 2000);
        refetch();
      },
      onError: () => {
        toast.error('Failed to load sample data');
        setShowLoadModal(false);
      }
    }
  );

  // Toggle demo mode mutation
  const toggleDemoModeMutation = useMutation(
    async (enabled) => {
      const updatedSettings = {
        ...workspaceData,
        demoMode: {
          ...workspaceData.demoMode,
          enabled
        }
      };
      localStorage.setItem('workspaceSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('workspaceSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success(`Demo mode ${workspaceData.demoMode.enabled ? 'disabled' : 'enabled'} successfully`);
        refetch();
      },
      onError: () => {
        toast.error('Failed to toggle demo mode');
      }
    }
  );

  // Toggle sandbox mode mutation
  const toggleSandboxModeMutation = useMutation(
    async (enabled) => {
      const updatedSettings = {
        ...workspaceData,
        sandboxMode: {
          ...workspaceData.sandboxMode,
          enabled
        }
      };
      localStorage.setItem('workspaceSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('workspaceSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success(`Sandbox mode ${workspaceData.sandboxMode.enabled ? 'disabled' : 'enabled'} successfully`);
        refetch();
      },
      onError: () => {
        toast.error('Failed to toggle sandbox mode');
      }
    }
  );

  const workspace = workspaceData || {};

  const handleResetDemo = () => {
    resetDemoMutation.mutate();
  };

  const handleLoadSample = (datasetId) => {
    setSelectedDataset(datasetId);
    loadSampleMutation.mutate(datasetId);
  };

  const handleToggleDemoMode = () => {
    toggleDemoModeMutation.mutate(!workspace.demoMode?.enabled);
  };

  const handleToggleSandboxMode = () => {
    toggleSandboxModeMutation.mutate(!workspace.sandboxMode?.enabled);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="page-title">Workspace & Demo Mode</h1>
            <p className="page-subtitle">Manage demo data, sample datasets, and workspace modes</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Current Data Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">{workspace.currentData?.products || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CpuChipIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{workspace.currentData?.customers || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{workspace.currentData?.transactions || 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DocumentArrowDownIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Size</p>
              <p className="text-2xl font-bold text-gray-900">{workspace.currentData?.dataSize || '0 GB'}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ServerIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mode Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Demo Mode */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Demo Mode</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={workspace.demoMode?.enabled || false}
                  onChange={handleToggleDemoMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workspace.demoMode?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workspace.demoMode?.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Reset</span>
                <span className="text-sm text-gray-900">
                  {workspace.demoMode?.lastReset ? new Date(workspace.demoMode.lastReset).toLocaleDateString() : 'Never'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reset Count</span>
                <span className="text-sm text-gray-900">{workspace.demoMode?.resetCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Age</span>
                <span className="text-sm text-gray-900">{workspace.currentData?.dataAge || 0} days</span>
              </div>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="w-full btn btn-danger mt-4 flex items-center justify-center space-x-2"
              disabled={resetDemoMutation.isLoading}
            >
              <TrashIcon className="h-4 w-4" />
              <span>Reset Demo Data</span>
            </button>
          </div>

          {/* Sandbox Mode */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sandbox Mode</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={workspace.sandboxMode?.enabled || false}
                  onChange={handleToggleSandboxMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Isolated</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workspace.sandboxMode?.isolated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workspace.sandboxMode?.isolated ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">External APIs</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workspace.sandboxMode?.allowExternalAPIs ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {workspace.sandboxMode?.allowExternalAPIs ? 'Allowed' : 'Blocked'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">File Uploads</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workspace.sandboxMode?.allowFileUploads ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {workspace.sandboxMode?.allowFileUploads ? 'Allowed' : 'Blocked'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Session Timeout</span>
                <span className="text-sm text-gray-900">{workspace.sandboxMode?.sessionTimeout || 120} min</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mt-4">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-800">
                  Sandbox mode provides a safe environment for testing
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sample Datasets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Datasets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspace.datasets?.map((dataset) => (
                <div key={dataset.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
                    </div>
                    {!dataset.compatible && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Incompatible
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Size</span>
                      <span className="text-gray-900">{dataset.size}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Records</span>
                      <span className="text-gray-900">{dataset.records.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type</span>
                      <span className="text-gray-900 capitalize">{dataset.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Modified</span>
                      <span className="text-gray-900">
                        {dataset.lastModified ? new Date(dataset.lastModified).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleLoadSample(dataset.id)}
                    className={`w-full btn ${
                      dataset.compatible ? 'btn-primary' : 'btn-secondary'
                    } flex items-center justify-center space-x-2`}
                    disabled={!dataset.compatible || loadSampleMutation.isLoading}
                  >
                    <DocumentArrowUpIcon className="h-4 w-4" />
                    <span>{dataset.compatible ? 'Load Dataset' : 'Not Compatible'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Database</p>
                  <p className="text-xs text-gray-500">System database status</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workspace.systemStatus?.database)}`}>
                  {workspace.systemStatus?.database}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Storage</p>
                  <p className="text-xs text-gray-500">Disk space usage</p>
                </div>
                <span className="text-xs text-gray-900">{workspace.systemStatus?.storage}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Memory</p>
                  <p className="text-xs text-gray-500">RAM usage</p>
                </div>
                <span className="text-xs text-gray-900">{workspace.systemStatus?.memory}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">CPU Usage</p>
                  <p className="text-xs text-gray-500">Processor load</p>
                </div>
                <span className="text-xs text-gray-900">{workspace.systemStatus?.cpu}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Uptime</p>
                  <p className="text-xs text-gray-500">System availability</p>
                </div>
                <span className="text-xs text-gray-900">{workspace.systemStatus?.uptime}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Maintenance</p>
                  <p className="text-xs text-gray-500">System maintenance</p>
                </div>
                <span className="text-xs text-gray-900">
                  {workspace.systemStatus?.lastMaintenance ? new Date(workspace.systemStatus.lastMaintenance).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => refetch()}
              className="btn btn-primary flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Refresh Status</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Reset Demo Data Modal */}
      {showResetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reset Demo Data</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    This will permanently delete all demo data including products, customers, suppliers, and transactions.
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-red-200 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"
                    style={{ transform: 'rotate(45deg)' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{currentStep}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${resetProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(resetProgress)}% Complete</p>
              </div>
              
              {resetProgress === 100 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      Demo data has been reset successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Load Sample Data Modal */}
      {showLoadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Loading Sample Data</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DocumentArrowUpIcon className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Loading sample dataset into your workspace...
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                    style={{ transform: 'rotate(45deg)' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{currentStep}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(loadProgress)}% Complete</p>
              </div>
              
              {loadProgress === 100 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      Sample data loaded successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Workspace;
