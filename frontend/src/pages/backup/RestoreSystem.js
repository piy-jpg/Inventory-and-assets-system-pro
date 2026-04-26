import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  BellIcon,
  CloudArrowUpIcon,
  ServerIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const RestoreSystem = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreType, setRestoreType] = useState('full');
  const [selectedModules, setSelectedModules] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [backupPreview, setBackupPreview] = useState(null);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const queryClient = useQueryClient();

  // Mock backup modules
  const backupModules = [
    { id: 'inventory', name: 'Inventory Management', description: 'Products, categories, stock levels' },
    { id: 'users', name: 'User Management', description: 'Users, roles, permissions' },
    { id: 'transactions', name: 'Transactions', description: 'Sales, purchases, payments' },
    { id: 'customers', name: 'Customer Data', description: 'Customer information, ledgers' },
    { id: 'suppliers', name: 'Supplier Data', description: 'Supplier information, purchase orders' },
    { id: 'reports', name: 'Reports & Analytics', description: 'Report configurations, analytics data' },
    { id: 'settings', name: 'System Settings', description: 'Application settings, configurations' },
    { id: 'logs', name: 'System Logs', description: 'Activity logs, error logs' },
    { id: 'media', name: 'Media Files', description: 'Uploaded images, documents' },
    { id: 'temp', name: 'Temporary Data', description: 'Cache, temporary files' }
  ];

  // Mock restore mutation
  const restoreSystemMutation = useMutation(
    async (restoreConfig) => {
      setIsRestoring(true);
      setShowProgressModal(true);
      
      // Simulate restore process
      const steps = [
        { name: 'Validating backup file', duration: 2000 },
        { name: 'Checking backup integrity', duration: 1500 },
        { name: 'Creating restore point', duration: 1000 },
        { name: 'Backing up current data', duration: 3000 },
        { name: 'Restoring database', duration: 4000 },
        { name: 'Restoring files and media', duration: 2500 },
        { name: 'Restoring system settings', duration: 2000 },
        { name: 'Verifying restored data', duration: 1500 },
        { name: 'Updating system configurations', duration: 1000 },
        { name: 'Finalizing restore process', duration: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i].name);
        setProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Simulate restore completion
      const restoreId = `RESTORE_${Date.now()}`;
      const restoreData = {
        id: restoreId,
        type: restoreConfig.type,
        modules: restoreConfig.modules,
        fileName: restoreConfig.fileName,
        status: 'success',
        completedAt: new Date().toISOString(),
        restoredBy: 'admin'
      };

      // Store restore data
      const existingRestores = JSON.parse(localStorage.getItem('restoreHistory') || '[]');
      existingRestores.unshift(restoreData);
      localStorage.setItem('restoreHistory', JSON.stringify(existingRestores));

      return restoreData;
    },
    {
      onSuccess: (data) => {
        toast.success(`System restored successfully! Restore ID: ${data.id}`);
        setIsRestoring(false);
        setShowProgressModal(false);
        setProgress(0);
        setCurrentStep('');
        setSelectedFile(null);
        setConfirmationChecked(false);
        queryClient.invalidateQueries('restoreHistory');
      },
      onError: (error) => {
        toast.error('Failed to restore system. Please try again.');
        setIsRestoring(false);
        setShowProgressModal(false);
        setProgress(0);
        setCurrentStep('');
      }
    }
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['.sql', '.zip', '.json'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Invalid file type. Please upload SQL, ZIP, or JSON files.');
        return;
      }

      // Check file size (max 5GB)
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB in bytes
      if (file.size > maxSize) {
        toast.error('File size exceeds 5GB limit.');
        return;
      }

      setSelectedFile(file);
      
      // Simulate backup preview
      setBackupPreview({
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        fileType: fileExtension,
        createdDate: new Date(file.lastModified).toLocaleString(),
        backupType: 'full',
        modules: backupModules.slice(0, 6).map(m => m.id),
        integrity: 'verified',
        checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        version: '1.0.0',
        compatible: true
      });
    }
  };

  const handleModuleToggle = (moduleId) => {
    if (restoreType === 'full') return; // Full restore includes all modules
    
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handlePreview = () => {
    if (!selectedFile) return;
    
    // Simulate file preview
    setShowPreviewModal(true);
  };

  const handleRestore = () => {
    if (!selectedFile) {
      toast.error('Please select a backup file');
      return;
    }

    if (!confirmationChecked) {
      toast.error('Please confirm the restore action');
      return;
    }

    if (restoreType === 'partial' && selectedModules.length === 0) {
      toast.error('Please select at least one module for partial restore');
      return;
    }

    const restoreConfig = {
      type: restoreType,
      modules: restoreType === 'full' ? backupModules.map(m => m.id) : selectedModules,
      fileName: selectedFile.name
    };

    restoreSystemMutation.mutate(restoreConfig);
  };

  const getEstimatedDuration = () => {
    if (!selectedFile) return 'N/A';
    
    const fileSize = selectedFile.size / (1024 * 1024 * 1024); // Convert to GB
    
    if (restoreType === 'full') {
      return `${Math.ceil(fileSize * 8)}-${Math.ceil(fileSize * 12)} minutes`;
    } else {
      const moduleCount = selectedModules.length;
      return `${Math.ceil(fileSize * 2 * moduleCount / 10)}-${Math.ceil(fileSize * 3 * moduleCount / 10)} minutes`;
    }
  };

  const getRiskLevel = () => {
    if (!selectedFile) return 'low';
    
    if (restoreType === 'full') return 'high';
    if (selectedModules.length >= 7) return 'medium';
    return 'low';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
            <h1 className="page-title">Restore System</h1>
            <p className="page-subtitle">Upload backup file, Restore options, Confirmation warning, Restore progress indicator</p>
          </div>
        </div>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Important Warning</h3>
            <p className="text-sm text-red-700 mt-1">
              System restore will overwrite existing data. This action cannot be undone. 
              Please ensure you have a current backup before proceeding.
            </p>
          </div>
        </div>
      </motion.div>

      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Backup File</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                SQL, ZIP, or JSON files up to 5GB
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".sql,.zip,.json"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreview}
                  className="btn btn-secondary btn-sm"
                >
                  Preview
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="btn btn-outline btn-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Restore Type Selection */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restore Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                restoreType === 'full' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setRestoreType('full')}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Full Restore</h4>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  restoreType === 'full' ? 'border-red-500 bg-red-500' : 'border-gray-300'
                }`}>
                  {restoreType === 'full' && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Complete system restore including all data modules, settings, and files
              </p>
              <div className="text-xs text-red-600 font-medium">
                ⚠️ High risk - Overwrites all existing data
              </div>
            </div>

            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                restoreType === 'partial' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setRestoreType('partial')}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Partial Restore</h4>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  restoreType === 'partial' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {restoreType === 'partial' && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Select specific data modules to restore for targeted recovery
              </p>
              <div className="text-xs text-blue-600 font-medium">
                ✓ Lower risk - Only affects selected modules
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Module Selection (for partial restore) */}
      {selectedFile && restoreType === 'partial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Data Modules to Restore</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backupModules.map((module) => (
              <div
                key={module.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedModules.includes(module.id)
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleModuleToggle(module.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{module.name}</h4>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedModules.includes(module.id)
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedModules.includes(module.id) && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Selected: {selectedModules.length} modules
            </p>
          </div>
        </motion.div>
      )}

      {/* Restore Summary */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restore Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Restore Type</p>
              <p className="text-lg font-medium text-gray-900 capitalize">{restoreType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">File Size</p>
              <p className="text-lg font-medium text-gray-900">
                {(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Duration</p>
              <p className="text-lg font-medium text-gray-900">{getEstimatedDuration()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Risk Level</p>
              <p className={`text-lg font-medium ${getRiskColor(getRiskLevel()).split(' ')[0]}`}>
                {getRiskLevel().toUpperCase()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation Section */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
        >
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="confirmation"
              checked={confirmationChecked}
              onChange={(e) => setConfirmationChecked(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <div className="flex-1">
              <label htmlFor="confirmation" className="text-sm font-medium text-red-800 cursor-pointer">
                I understand that this restore action will overwrite existing data and cannot be undone.
              </label>
              <p className="text-sm text-red-700 mt-1">
                Please ensure you have a current backup before proceeding with the restore.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-end space-x-4"
        >
          <button
            onClick={() => {
              setSelectedFile(null);
              setRestoreType('full');
              setSelectedModules([]);
              setConfirmationChecked(false);
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            disabled={!confirmationChecked || isRestoring || (restoreType === 'partial' && selectedModules.length === 0)}
            className="btn btn-danger flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRestoring ? 'animate-spin' : ''}`} />
            {isRestoring ? 'Restoring...' : 'Start Restore'}
          </button>
        </motion.div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && backupPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPreviewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Backup Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">File Name</p>
                  <p className="text-sm text-gray-900">{backupPreview.fileName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">File Size</p>
                  <p className="text-sm text-gray-900">{backupPreview.fileSize}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">File Type</p>
                  <p className="text-sm text-gray-900 uppercase">{backupPreview.fileType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created Date</p>
                  <p className="text-sm text-gray-900">{backupPreview.createdDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Backup Type</p>
                  <p className="text-sm text-gray-900 capitalize">{backupPreview.backupType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Version</p>
                  <p className="text-sm text-gray-900">{backupPreview.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Integrity</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backupPreview.integrity === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {backupPreview.integrity}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Compatibility</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backupPreview.compatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {backupPreview.compatible ? 'Compatible' : 'Incompatible'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Backup Modules</p>
                <div className="flex flex-wrap gap-1">
                  {backupPreview.modules.map((module, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Checksum</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700 font-mono">{backupPreview.checksum}</p>
                </div>
              </div>

              {backupPreview.compatible ? (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      This backup is compatible with the current system version and can be safely restored.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800">
                      This backup is not compatible with the current system version. Please upgrade or use a different backup.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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
              <h3 className="text-lg font-semibold text-gray-900">Restoring System</h3>
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
                <p className="text-sm text-gray-600 mb-2">{currentStep}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    System restore in progress. Please do not close this window or interrupt the process.
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

export default RestoreSystem;
