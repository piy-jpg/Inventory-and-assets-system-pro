import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BellIcon,
  DocumentTextIcon,
  ServerIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AdvancedSettings = () => {
  const [showTestModal, setShowTestModal] = useState(false);
  const [showDisasterModal, setShowDisasterModal] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTestStep, setCurrentTestStep] = useState('');
  const [disasterMode, setDisasterMode] = useState(false);
  const [formData, setFormData] = useState({
    autoDeleteEnabled: true,
    keepLastBackups: 10,
    incrementalEnabled: true,
    incrementalInterval: '6h',
    integrityCheckEnabled: true,
    integrityCheckInterval: 'daily',
    compressionEnabled: true,
    compressionLevel: 'medium',
    parallelEnabled: true,
    maxParallelJobs: 3,
    retryEnabled: true,
    maxRetries: 3,
    retryDelay: 30,
    disasterRecoveryEnabled: false,
    disasterRecoveryFrequency: 'monthly'
  });

  const queryClient = useQueryClient();

  // Role-based access control
  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'viewer';
  };

  const userRole = getUserRole();

  const hasPermission = (action) => {
    const permissions = {
      admin: ['view', 'create', 'delete', 'restore', 'manage_settings'],
      manager: ['view', 'create', 'delete', 'restore'],
      operator: ['view', 'create'],
      viewer: ['view']
    };
    return permissions[userRole]?.includes(action) || false;
  };

  // Real-time advanced settings data
  const { data: advancedData, isLoading, refetch } = useQuery(
    'advancedSettings',
    () => {
      const storedSettings = localStorage.getItem('advancedSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return {
        autoDelete: {
          enabled: true,
          keepLastBackups: 10,
          retentionDays: 30,
          schedule: 'daily',
          lastCleanup: '2024-04-23T03:00:00Z',
          deletedCount: 156,
          freedSpace: '23.5 GB'
        },
        incremental: {
          enabled: true,
          interval: '6h',
          baseBackupDays: 7,
          maxIncrementalChains: 10,
          lastFullBackup: '2024-04-21T02:00:00Z',
          nextFullBackup: '2024-04-28T02:00:00Z',
          incrementalCount: 12,
          spaceSaved: '18.2 GB'
        },
        integrity: {
          enabled: true,
          checkInterval: 'daily',
          checksumAlgorithm: 'SHA-256',
          autoRepair: true,
          lastCheck: '2024-04-23T04:00:00Z',
          issuesFound: 0,
          issuesFixed: 2,
          checkDuration: '2m 15s'
        },
        compression: {
          enabled: true,
          level: 'medium',
          algorithm: 'gzip',
          compressionRatio: 0.65,
          spaceSaved: '45.7 GB',
          compressionTime: '1m 30s',
          decompressionTime: '45s'
        },
        parallel: {
          enabled: true,
          maxJobs: 3,
          queueSize: 5,
          currentJobs: 1,
          completedJobs: 234,
          failedJobs: 3,
          avgProcessingTime: '3m 45s'
        },
        retry: {
          enabled: true,
          maxRetries: 3,
          delay: 30,
          exponentialBackoff: true,
          retryCount: 8,
          successAfterRetry: 6,
          totalFailedAfterRetry: 2
        },
        disasterRecovery: {
          enabled: false,
          frequency: 'monthly',
          lastTest: '2024-03-15T10:00:00Z',
          testDuration: '15m 30s',
          testStatus: 'success',
          recoveryPointCount: 12,
          recoveryPointSize: '156.8 GB'
        },
        performance: {
          avgBackupTime: '5m 23s',
          avgRestoreTime: '8m 45s',
          throughput: '125 MB/s',
          cpuUsage: '45%',
          memoryUsage: '2.1 GB',
          diskIO: '85 MB/s'
        }
      };
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Advanced settings data refreshed:', data);
      }
    }
  );

  // Mutation for updating settings
  const updateSettingsMutation = useMutation(
    async (settings) => {
      const updatedSettings = {
        ...advancedData,
        ...settings,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('advancedSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('advancedSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('Advanced settings updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update advanced settings');
      }
    }
  );

  // Mutation for running integrity test
  const runIntegrityTestMutation = useMutation(
    async () => {
      setShowTestModal(true);
      setTestProgress(0);
      
      // Simulate integrity test
      const steps = [
        { name: 'Initializing integrity check', duration: 2000 },
        { name: 'Scanning backup files', duration: 3000 },
        { name: 'Calculating checksums', duration: 4000 },
        { name: 'Verifying file integrity', duration: 3000 },
        { name: 'Checking database consistency', duration: 2500 },
        { name: 'Validating metadata', duration: 1500 },
        { name: 'Generating integrity report', duration: 1000 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentTestStep(steps[i].name);
        setTestProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Update last check time
      const updatedSettings = {
        ...advancedData,
        integrity: {
          ...advancedData.integrity,
          lastCheck: new Date().toISOString(),
          issuesFound: 0,
          issuesFixed: 0,
          checkDuration: '2m 15s'
        }
      };
      localStorage.setItem('advancedSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('advancedSettings', updatedSettings);
      
      setTestProgress(100);
      setCurrentTestStep('Integrity check completed');
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Integrity check completed successfully');
        setTimeout(() => setShowTestModal(false), 2000);
      },
      onError: () => {
        toast.error('Integrity check failed');
        setShowTestModal(false);
      }
    }
  );

  // Mutation for disaster recovery test
  const runDisasterTestMutation = useMutation(
    async () => {
      setShowDisasterModal(true);
      setTestProgress(0);
      
      // Simulate disaster recovery test
      const steps = [
        { name: 'Creating disaster scenario', duration: 2000 },
        { name: 'Simulating system failure', duration: 3000 },
        { name: 'Initiating recovery protocol', duration: 2000 },
        { name: 'Restoring from recovery points', duration: 5000 },
        { name: 'Validating system integrity', duration: 3000 },
        { name: 'Testing system functionality', duration: 2500 },
        { name: 'Generating recovery report', duration: 1500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentTestStep(steps[i].name);
        setTestProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Update last test time
      const updatedSettings = {
        ...advancedData,
        disasterRecovery: {
          ...advancedData.disasterRecovery,
          lastTest: new Date().toISOString(),
          testDuration: '15m 30s',
          testStatus: 'success'
        }
      };
      localStorage.setItem('advancedSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('advancedSettings', updatedSettings);
      
      setTestProgress(100);
      setCurrentTestStep('Disaster recovery test completed');
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Disaster recovery test completed successfully');
        setTimeout(() => setShowDisasterModal(false), 2000);
      },
      onError: () => {
        toast.error('Disaster recovery test failed');
        setShowDisasterModal(false);
      }
    }
  );

  const advanced = advancedData || {};

  const handleUpdateSetting = (section, key, value) => {
    const updatedSettings = { ...advanced };
    if (section === 'autoDelete') {
      updatedSettings.autoDelete = { ...updatedSettings.autoDelete, [key]: value };
    } else if (section === 'incremental') {
      updatedSettings.incremental = { ...updatedSettings.incremental, [key]: value };
    } else if (section === 'integrity') {
      updatedSettings.integrity = { ...updatedSettings.integrity, [key]: value };
    } else if (section === 'compression') {
      updatedSettings.compression = { ...updatedSettings.compression, [key]: value };
    } else if (section === 'parallel') {
      updatedSettings.parallel = { ...updatedSettings.parallel, [key]: value };
    } else if (section === 'retry') {
      updatedSettings.retry = { ...updatedSettings.retry, [key]: value };
    } else if (section === 'disasterRecovery') {
      updatedSettings.disasterRecovery = { ...updatedSettings.disasterRecovery, [key]: value };
    }
    
    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Advanced settings data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
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
            <h1 className="page-title">Advanced Settings</h1>
            <p className="page-subtitle">Auto-delete old backups, Incremental backups, Data integrity check, Disaster recovery mode</p>
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
          </div>
        </div>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Backup Time</p>
              <p className="text-2xl font-bold text-gray-900">{advanced.performance?.avgBackupTime || 'N/A'}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Throughput</p>
              <p className="text-2xl font-bold text-gray-900">{advanced.performance?.throughput || 'N/A'}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <ServerIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">{advanced.performance?.cpuUsage || 'N/A'}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Cog6ToothIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Auto-Delete Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Auto-Delete Old Backups</h3>
          <TrashIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Auto-Delete</p>
              <p className="text-sm text-gray-600">Automatically delete old backups</p>
            </div>
            {hasPermission('manage_settings') ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={advanced.autoDelete?.enabled || false}
                  onChange={(e) => handleUpdateSetting('autoDelete', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${advanced.autoDelete?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {advanced.autoDelete?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          {hasPermission('manage_settings') ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keep Last Backups</label>
                <input
                  type="number"
                  value={advanced.autoDelete?.keepLastBackups || 10}
                  onChange={(e) => handleUpdateSetting('autoDelete', 'keepLastBackups', parseInt(e.target.value))}
                  className="input"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retention Days</label>
                <input
                  type="number"
                  value={advanced.autoDelete?.retentionDays || 30}
                  onChange={(e) => handleUpdateSetting('autoDelete', 'retentionDays', parseInt(e.target.value))}
                  className="input"
                  min="7"
                  max="365"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Keep Last: {advanced.autoDelete?.keepLastBackups || 10} backups</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Retention: {advanced.autoDelete?.retentionDays || 30} days</p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Last Cleanup</p>
                <p className="font-medium text-gray-900">
                  {advanced.autoDelete?.lastCleanup ? new Date(advanced.autoDelete.lastCleanup).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Deleted Count</p>
                <p className="font-medium text-gray-900">{advanced.autoDelete?.deletedCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Freed Space</p>
                <p className="font-medium text-gray-900">{advanced.autoDelete?.freedSpace || '0 GB'}</p>
              </div>
              <div>
                <p className="text-gray-600">Schedule</p>
                <p className="font-medium text-gray-900 capitalize">{advanced.autoDelete?.schedule || 'daily'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Incremental Backups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Incremental Backups</h3>
          <ArrowPathIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Incremental Backups</p>
              <p className="text-sm text-gray-600">Save space with incremental backup strategy</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.incremental?.enabled || false}
                onChange={(e) => handleUpdateSetting('incremental', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Interval</label>
              <select
                value={advanced.incremental?.interval || '6h'}
                onChange={(e) => handleUpdateSetting('incremental', 'interval', e.target.value)}
                className="input"
              >
                <option value="1h">Every Hour</option>
                <option value="3h">Every 3 Hours</option>
                <option value="6h">Every 6 Hours</option>
                <option value="12h">Every 12 Hours</option>
                <option value="24h">Daily</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Backup Days</label>
              <input
                type="number"
                value={advanced.incremental?.baseBackupDays || 7}
                onChange={(e) => handleUpdateSetting('incremental', 'baseBackupDays', parseInt(e.target.value))}
                className="input"
                min="1"
                max="30"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Last Full Backup</p>
                <p className="font-medium text-gray-900">
                  {advanced.incremental?.lastFullBackup ? new Date(advanced.incremental.lastFullBackup).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Next Full Backup</p>
                <p className="font-medium text-gray-900">
                  {advanced.incremental?.nextFullBackup ? new Date(advanced.incremental.nextFullBackup).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Incremental Count</p>
                <p className="font-medium text-gray-900">{advanced.incremental?.incrementalCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Space Saved</p>
                <p className="font-medium text-gray-900">{advanced.incremental?.spaceSaved || '0 GB'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Integrity Check */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Data Integrity Check</h3>
          <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Integrity Check</p>
              <p className="text-sm text-gray-600">Verify backup integrity automatically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.integrity?.enabled || false}
                onChange={(e) => handleUpdateSetting('integrity', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Interval</label>
              <select
                value={advanced.integrity?.checkInterval || 'daily'}
                onChange={(e) => handleUpdateSetting('integrity', 'checkInterval', e.target.value)}
                className="input"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Checksum Algorithm</label>
              <select
                value={advanced.integrity?.checksumAlgorithm || 'SHA-256'}
                onChange={(e) => handleUpdateSetting('integrity', 'checksumAlgorithm', e.target.value)}
                className="input"
              >
                <option value="MD5">MD5</option>
                <option value="SHA-1">SHA-1</option>
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={advanced.integrity?.autoRepair || false}
                  onChange={(e) => handleUpdateSetting('integrity', 'autoRepair', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Auto-repair issues</span>
              </label>
            </div>
            {hasPermission('manage_settings') && (
              <button
                onClick={() => runIntegrityTestMutation.mutate()}
                className="btn btn-primary"
                disabled={runIntegrityTestMutation.isLoading}
              >
                {runIntegrityTestMutation.isLoading ? 'Running...' : 'Run Check Now'}
              </button>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Last Check</p>
                <p className="font-medium text-gray-900">
                  {advanced.integrity?.lastCheck ? new Date(advanced.integrity.lastCheck).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Issues Found</p>
                <p className="font-medium text-gray-900">{advanced.integrity?.issuesFound || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Issues Fixed</p>
                <p className="font-medium text-gray-900">{advanced.integrity?.issuesFixed || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Check Duration</p>
                <p className="font-medium text-gray-900">{advanced.integrity?.checkDuration || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Disaster Recovery Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Disaster Recovery Mode</h3>
          <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Disaster Recovery</p>
              <p className="text-sm text-gray-600">Prepare for disaster recovery scenarios</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.disasterRecovery?.enabled || false}
                onChange={(e) => handleUpdateSetting('disasterRecovery', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Frequency</label>
              <select
                value={advanced.disasterRecovery?.frequency || 'monthly'}
                onChange={(e) => handleUpdateSetting('disasterRecovery', 'frequency', e.target.value)}
                className="input"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Point Count</label>
              <input
                type="number"
                value={advanced.disasterRecovery?.recoveryPointCount || 12}
                onChange={(e) => handleUpdateSetting('disasterRecovery', 'recoveryPointCount', parseInt(e.target.value))}
                className="input"
                min="1"
                max="52"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={disasterMode}
                  onChange={(e) => setDisasterMode(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable disaster simulation mode</span>
              </label>
            </div>
            <button
              onClick={() => runDisasterTestMutation.mutate()}
              className="btn btn-danger"
              disabled={runDisasterTestMutation.isLoading}
            >
              {runDisasterTestMutation.isLoading ? 'Testing...' : 'Run Disaster Test'}
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Last Test</p>
                <p className="font-medium text-gray-900">
                  {advanced.disasterRecovery?.lastTest ? new Date(advanced.disasterRecovery.lastTest).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Test Duration</p>
                <p className="font-medium text-gray-900">{advanced.disasterRecovery?.testDuration || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Test Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(advanced.disasterRecovery?.testStatus)}`}>
                  {advanced.disasterRecovery?.testStatus || 'Not tested'}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Recovery Size</p>
                <p className="font-medium text-gray-900">{advanced.disasterRecovery?.recoveryPointSize || '0 GB'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compression Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Compression Settings</h3>
          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Compression</p>
              <p className="text-sm text-gray-600">Compress backup files to save storage space</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.compression?.enabled || false}
                onChange={(e) => handleUpdateSetting('compression', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compression Level</label>
              <select
                value={advanced.compression?.level || 'medium'}
                onChange={(e) => handleUpdateSetting('compression', 'level', e.target.value)}
                className="input"
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Best)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
              <select
                value={advanced.compression?.algorithm || 'gzip'}
                onChange={(e) => handleUpdateSetting('compression', 'algorithm', e.target.value)}
                className="input"
              >
                <option value="gzip">Gzip</option>
                <option value="zip">Zip</option>
                <option value="lz4">LZ4</option>
                <option value="zstd">Zstandard</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Compression Ratio</p>
                <p className="font-medium text-gray-900">{advanced.compression?.compressionRatio || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Space Saved</p>
                <p className="font-medium text-gray-900">{advanced.compression?.spaceSaved || '0 GB'}</p>
              </div>
              <div>
                <p className="text-gray-600">Compression Time</p>
                <p className="font-medium text-gray-900">{advanced.compression?.compressionTime || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Decompression Time</p>
                <p className="font-medium text-gray-900">{advanced.compression?.decompressionTime || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Integrity Test Modal */}
      {showTestModal && (
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
              <h3 className="text-lg font-semibold text-gray-900">Running Integrity Check</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                    style={{ transform: 'rotate(45deg)' }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{currentTestStep}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(testProgress)}% Complete</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Verifying backup file integrity and consistency...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Disaster Recovery Test Modal */}
      {showDisasterModal && (
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
              <h3 className="text-lg font-semibold text-gray-900">Running Disaster Recovery Test</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-red-200 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"
                    style={{ transform: 'rotate(45deg)' }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{currentTestStep}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(testProgress)}% Complete</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    Testing disaster recovery procedures and system resilience...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedSettings;
