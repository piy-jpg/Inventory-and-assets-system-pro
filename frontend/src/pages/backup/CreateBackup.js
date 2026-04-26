import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  PlayIcon,
  XCircleIcon,
  CheckCircleIcon,
  ServerIcon,
  ClockIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const CreateBackup = () => {
  const [backupType, setBackupType] = useState('full');
  const [backupFormat, setBackupFormat] = useState('sql');
  const [selectedModules, setSelectedModules] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [backupSettings, setBackupSettings] = useState({
    includeFiles: true,
    includeDatabase: true,
    includeSettings: true,
    compress: true,
    encrypt: false,
    uploadToCloud: true,
    saveLocal: true
  });

  const queryClient = useQueryClient();

  // Mock backup modules
  const backupModules = [
    { id: 'inventory', name: 'Inventory Management', description: 'Products, categories, stock levels', required: true },
    { id: 'users', name: 'User Management', description: 'Users, roles, permissions', required: true },
    { id: 'transactions', name: 'Transactions', description: 'Sales, purchases, payments', required: true },
    { id: 'customers', name: 'Customer Data', description: 'Customer information, ledgers', required: false },
    { id: 'suppliers', name: 'Supplier Data', description: 'Supplier information, purchase orders', required: false },
    { id: 'reports', name: 'Reports & Analytics', description: 'Report configurations, analytics data', required: false },
    { id: 'settings', name: 'System Settings', description: 'Application settings, configurations', required: false },
    { id: 'logs', name: 'System Logs', description: 'Activity logs, error logs', required: false },
    { id: 'media', name: 'Media Files', description: 'Uploaded images, documents', required: false },
    { id: 'temp', name: 'Temporary Data', description: 'Cache, temporary files', required: false }
  ];

  // Mock backup creation mutation
  const createBackupMutation = useMutation(
    async (backupConfig) => {
      setIsCreating(true);
      setShowProgressModal(true);
      
      // Simulate backup creation process
      const steps = [
        { name: 'Validating backup configuration', duration: 1000 },
        { name: 'Preparing backup environment', duration: 1500 },
        { name: 'Collecting data modules', duration: 2000 },
        { name: 'Compressing backup data', duration: 3000 },
        { name: 'Encrypting backup files', duration: 1500 },
        { name: 'Uploading to cloud storage', duration: 2500 },
        { name: 'Verifying backup integrity', duration: 1000 },
        { name: 'Finalizing backup', duration: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i].name);
        setProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Simulate backup completion
      const backupId = `BACKUP_${Date.now()}`;
      const backupData = {
        id: backupId,
        type: backupConfig.type,
        format: backupConfig.format,
        modules: backupConfig.modules,
        settings: backupConfig.settings,
        size: backupConfig.type === 'full' ? '2.4 GB' : '0.8 GB',
        status: 'success',
        createdAt: new Date().toISOString(),
        location: backupConfig.settings.uploadToCloud ? 'cloud' : 'local'
      };

      // Store backup data
      const existingBackups = JSON.parse(localStorage.getItem('backupDashboard') || '{}');
      if (existingBackups.recentBackups) {
        existingBackups.recentBackups.unshift(backupData);
        existingBackups.statistics.totalBackups = (existingBackups.statistics?.totalBackups || 0) + 1;
        existingBackups.statistics.successfulBackups = (existingBackups.statistics?.successfulBackups || 0) + 1;
        localStorage.setItem('backupDashboard', JSON.stringify(existingBackups));
      }

      return backupData;
    },
    {
      onSuccess: (data) => {
        toast.success(`Backup created successfully! ID: ${data.id}`);
        setIsCreating(false);
        setShowProgressModal(false);
        setProgress(0);
        setCurrentStep('');
        queryClient.invalidateQueries('backupDashboard');
      },
      onError: (error) => {
        toast.error('Failed to create backup. Please try again.');
        setIsCreating(false);
        setShowProgressModal(false);
        setProgress(0);
        setCurrentStep('');
      }
    }
  );

  const handleModuleToggle = (moduleId) => {
    if (backupType === 'full') return; // Full backup includes all modules
    
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handleCreateBackup = () => {
    if (backupType === 'partial' && selectedModules.length === 0) {
      toast.error('Please select at least one module for partial backup');
      return;
    }

    const backupConfig = {
      type: backupType,
      format: backupFormat,
      modules: backupType === 'full' ? backupModules.map(m => m.id) : selectedModules,
      settings: backupSettings
    };

    createBackupMutation.mutate(backupConfig);
  };

  const getEstimatedSize = () => {
    if (backupType === 'full') return '2.4 GB';
    
    const selectedCount = selectedModules.length;
    return `${(selectedCount * 0.24).toFixed(1)} GB`;
  };

  const getEstimatedDuration = () => {
    if (backupType === 'full') return '5-8 minutes';
    
    const selectedCount = selectedModules.length;
    return `${Math.ceil(selectedCount * 0.5)}-${Math.ceil(selectedCount * 0.8)} minutes`;
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
            <h1 className="page-title">Create Backup</h1>
            <p className="page-subtitle">Backup Now button, Select type, Choose format</p>
          </div>
        </div>
      </motion.div>

      {/* Backup Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              backupType === 'full' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBackupType('full')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Full Backup</h4>
              <div className={`w-4 h-4 rounded-full border-2 ${
                backupType === 'full' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {backupType === 'full' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Complete system backup including all data modules, settings, and files
            </p>
            <div className="text-xs text-gray-500">
              <p>Estimated size: ~2.4 GB</p>
              <p>Duration: 5-8 minutes</p>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              backupType === 'partial' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBackupType('partial')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Partial Backup</h4>
              <div className={`w-4 h-4 rounded-full border-2 ${
                backupType === 'partial' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {backupType === 'partial' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Select specific data modules to backup for faster, targeted backups
            </p>
            <div className="text-xs text-gray-500">
              <p>Estimated size: {getEstimatedSize()}</p>
              <p>Duration: {getEstimatedDuration()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Module Selection (for partial backup) */}
      {backupType === 'partial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Data Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backupModules.map((module) => (
              <div
                key={module.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedModules.includes(module.id) || module.required
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${module.required ? 'opacity-75' : ''}`}
                onClick={() => !module.required && handleModuleToggle(module.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{module.name}</h4>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedModules.includes(module.id) || module.required
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {(selectedModules.includes(module.id) || module.required) && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{module.description}</p>
                {module.required && (
                  <p className="text-xs text-blue-600 mt-2">Required for full backup</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Selected: {selectedModules.length} modules | 
              Required: {backupModules.filter(m => m.required).length} modules
            </p>
          </div>
        </motion.div>
      )}

      {/* Backup Format Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              backupFormat === 'sql' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBackupFormat('sql')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">SQL</h4>
              <div className={`w-4 h-4 rounded-full border-2 ${
                backupFormat === 'sql' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {backupFormat === 'sql' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Database dump format, best for database restoration
            </p>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              backupFormat === 'zip' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBackupFormat('zip')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">ZIP</h4>
              <div className={`w-4 h-4 rounded-full border-2 ${
                backupFormat === 'zip' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {backupFormat === 'zip' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Compressed archive format, good for file transfers
            </p>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              backupFormat === 'json' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBackupFormat('json')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">JSON</h4>
              <div className={`w-4 h-4 rounded-full border-2 ${
                backupFormat === 'json' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {backupFormat === 'json' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Structured data format, easy to parse and integrate
            </p>
          </div>
        </div>
      </motion.div>

      {/* Backup Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Include Files</p>
              <p className="text-sm text-gray-600">Include uploaded files and media</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.includeFiles}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, includeFiles: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Include Database</p>
              <p className="text-sm text-gray-600">Include database schema and data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.includeDatabase}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, includeDatabase: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Include Settings</p>
              <p className="text-sm text-gray-600">Include system configurations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.includeSettings}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, includeSettings: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Compress Backup</p>
              <p className="text-sm text-gray-600">Reduce backup file size</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.compress}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, compress: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Encrypt Backup</p>
              <p className="text-sm text-gray-600">Add password protection</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.encrypt}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, encrypt: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Upload to Cloud</p>
              <p className="text-sm text-gray-600">Store backup in cloud storage</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.uploadToCloud}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, uploadToCloud: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Save Local Copy</p>
              <p className="text-sm text-gray-600">Keep backup on local server</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.saveLocal}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, saveLocal: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Backup Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Backup Type</p>
            <p className="text-lg font-medium text-gray-900 capitalize">{backupType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Format</p>
            <p className="text-lg font-medium text-gray-900 uppercase">{backupFormat}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estimated Size</p>
            <p className="text-lg font-medium text-gray-900">{getEstimatedSize()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-lg font-medium text-gray-900">{getEstimatedDuration()}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-end space-x-4"
      >
        <button
          onClick={() => {
            setBackupType('full');
            setBackupFormat('sql');
            setSelectedModules([]);
            setBackupSettings({
              includeFiles: true,
              includeDatabase: true,
              includeSettings: true,
              compress: true,
              encrypt: false,
              uploadToCloud: true,
              saveLocal: true
            });
          }}
          className="btn btn-secondary"
        >
          Reset
        </button>
        <button
          onClick={handleCreateBackup}
          disabled={isCreating || (backupType === 'partial' && selectedModules.length === 0)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <PlayIcon className="h-4 w-4" />
          {isCreating ? 'Creating Backup...' : 'Create Backup Now'}
        </button>
      </motion.div>

      {/* Progress Modal */}
      {showProgressModal && (
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
              <h3 className="text-lg font-semibold text-gray-900">Creating Backup</h3>
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
                <p className="text-sm text-gray-600 mb-2">{currentStep}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Please wait while we create your backup. This may take several minutes.
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

export default CreateBackup;
