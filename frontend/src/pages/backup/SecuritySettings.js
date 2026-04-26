import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CpuChipIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAccessControlModal, setShowAccessControlModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    encryptionEnabled: true,
    encryptionAlgorithm: 'AES-256',
    passwordProtection: true,
    passwordComplexity: 'medium',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorEnabled: false,
    auditLogging: true,
    accessControl: {
      adminOnly: true,
      allowedRoles: ['admin'],
      ipWhitelist: [],
      geoRestriction: false
    }
  });

  const queryClient = useQueryClient();

  // Real-time security settings data
  const { data: securityData, isLoading, refetch } = useQuery(
    'securitySettings',
    () => {
      const storedSettings = localStorage.getItem('securitySettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return {
        encryption: {
          enabled: true,
          algorithm: 'AES-256',
          keyRotation: '90 days',
          lastKeyRotation: '2024-01-15T00:00:00Z'
        },
        passwordPolicy: {
          enabled: true,
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90,
          historyCount: 5,
          complexity: 'medium'
        },
        accessControl: {
          adminOnly: true,
          allowedRoles: ['admin'],
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
          geoRestriction: false,
          allowedCountries: ['US', 'CA', 'UK'],
          sessionTimeout: 30,
          maxConcurrentSessions: 3
        },
        authentication: {
          twoFactorEnabled: false,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          passwordExpiry: 90,
          lastPasswordChange: '2024-02-01T00:00:00Z'
        },
        audit: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 365,
          includeFailedAttempts: true,
          includeDataAccess: true
        },
        recentActivity: [
          {
            id: 1,
            action: 'Password Changed',
            user: 'admin',
            timestamp: '2024-04-23T10:30:00Z',
            ip: '192.168.1.100',
            status: 'success'
          },
          {
            id: 2,
            action: 'Backup Created',
            user: 'system',
            timestamp: '2024-04-23T02:00:00Z',
            ip: '127.0.0.1',
            status: 'success'
          },
          {
            id: 3,
            action: 'Failed Login Attempt',
            user: 'unknown',
            timestamp: '2024-04-22T23:45:00Z',
            ip: '192.168.1.200',
            status: 'failed',
            reason: 'Invalid credentials'
          },
          {
            id: 4,
            action: 'Encryption Key Rotated',
            user: 'admin',
            timestamp: '2024-04-20T14:20:00Z',
            ip: '192.168.1.100',
            status: 'success'
          },
          {
            id: 5,
            action: 'Security Settings Updated',
            user: 'admin',
            timestamp: '2024-04-18T09:15:00Z',
            ip: '192.168.1.100',
            status: 'success'
          }
        ]
      };
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Security settings data refreshed:', data);
      }
    }
  );

  // Mutation for updating security settings
  const updateSecurityMutation = useMutation(
    async (settings) => {
      const updatedSettings = {
        ...securityData,
        ...settings,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('securitySettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('securitySettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('Security settings updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update security settings');
      }
    }
  );

  // Mutation for changing password
  const changePasswordMutation = useMutation(
    async (passwordData) => {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last password change
      const updatedSettings = {
        ...securityData,
        authentication: {
          ...securityData.authentication,
          lastPasswordChange: new Date().toISOString()
        }
      };
      localStorage.setItem('securitySettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('securitySettings', updatedSettings);
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        refetch();
      },
      onError: () => {
        toast.error('Failed to change password');
      }
    }
  );

  const security = securityData || {};

  const handleUpdateSettings = (section, values) => {
    const updatedSettings = { ...security };
    
    if (section === 'encryption') {
      updatedSettings.encryption = { ...updatedSettings.encryption, ...values };
    } else if (section === 'accessControl') {
      updatedSettings.accessControl = { ...updatedSettings.accessControl, ...values };
    } else if (section === 'authentication') {
      updatedSettings.authentication = { ...updatedSettings.authentication, ...values };
    } else if (section === 'audit') {
      updatedSettings.audit = { ...updatedSettings.audit, ...values };
    }
    
    updateSecurityMutation.mutate(updatedSettings);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Security settings data refreshed');
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: 'Very Weak', color: 'text-red-600' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, text: 'Weak', color: 'text-red-600' };
    if (score <= 4) return { score, text: 'Medium', color: 'text-yellow-600' };
    return { score, text: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Security Settings</h1>
            <p className="page-subtitle">Encrypt backups, Password-protect files, Access control (admin-only)</p>
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

      {/* Security Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Encryption</p>
              <p className="text-2xl font-bold text-gray-900">
                {security.encryption?.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              security.encryption?.enabled ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <LockClosedIcon className={`h-4 w-4 ${
                security.encryption?.enabled ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Password Policy</p>
              <p className="text-2xl font-bold text-gray-900">
                {security.passwordPolicy?.enabled ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              security.passwordPolicy?.enabled ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <KeyIcon className={`h-4 w-4 ${
                security.passwordPolicy?.enabled ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Access Control</p>
              <p className="text-2xl font-bold text-gray-900">
                {security.accessControl?.adminOnly ? 'Admin Only' : 'Open'}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              security.accessControl?.adminOnly ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              <UserGroupIcon className={`h-4 w-4 ${
                security.accessControl?.adminOnly ? 'text-orange-600' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Audit Logging</p>
              <p className="text-2xl font-bold text-gray-900">
                {security.audit?.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              security.audit?.enabled ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DocumentTextIcon className={`h-4 w-4 ${
                security.audit?.enabled ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Encryption Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Encryption Settings</h3>
          <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Encrypt Backups</p>
              <p className="text-sm text-gray-600">Automatically encrypt all backup files</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.encryption?.enabled || false}
                onChange={(e) => handleUpdateSettings('encryption', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Encryption Algorithm</label>
              <select
                value={security.encryption?.algorithm || 'AES-256'}
                onChange={(e) => handleUpdateSettings('encryption', { algorithm: e.target.value })}
                className="input"
              >
                <option value="AES-256">AES-256</option>
                <option value="AES-192">AES-192</option>
                <option value="AES-128">AES-128</option>
                <option value="RSA-2048">RSA-2048</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Rotation</label>
              <select
                value={security.encryption?.keyRotation || '90 days'}
                onChange={(e) => handleUpdateSettings('encryption', { keyRotation: e.target.value })}
                className="input"
              >
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="90 days">90 days</option>
                <option value="180 days">180 days</option>
                <option value="365 days">365 days</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Last key rotation: {security.encryption?.lastKeyRotation ? new Date(security.encryption.lastKeyRotation).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Password Protection</h3>
          <KeyIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Password-Protect Files</p>
              <p className="text-sm text-gray-600">Require password for backup access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.passwordPolicy?.enabled || false}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
              <input
                type="number"
                value={security.passwordPolicy?.minLength || 8}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { minLength: parseInt(e.target.value) })}
                className="input"
                min="6"
                max="32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
              <input
                type="number"
                value={security.passwordPolicy?.maxAge || 90}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { maxAge: parseInt(e.target.value) })}
                className="input"
                min="30"
                max="365"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password History</label>
              <input
                type="number"
                value={security.passwordPolicy?.historyCount || 5}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { historyCount: parseInt(e.target.value) })}
                className="input"
                min="3"
                max="12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.passwordPolicy?.requireUppercase || false}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { requireUppercase: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Require uppercase letters</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.passwordPolicy?.requireLowercase || false}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { requireLowercase: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Require lowercase letters</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.passwordPolicy?.requireNumbers || false}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { requireNumbers: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Require numbers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.passwordPolicy?.requireSpecialChars || false}
                onChange={(e) => handleUpdateSettings('passwordPolicy', { requireSpecialChars: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Require special characters</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-primary"
            >
              Change Password
            </button>
            <div className="text-sm text-gray-500">
              Last changed: {security.authentication?.lastPasswordChange ? new Date(security.authentication.lastPasswordChange).toLocaleDateString() : 'Never'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Access Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
          <UserGroupIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Admin-Only Access</p>
              <p className="text-sm text-gray-600">Restrict backup access to administrators only</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.accessControl?.adminOnly || false}
                onChange={(e) => handleUpdateSettings('accessControl', { adminOnly: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={security.accessControl?.sessionTimeout || 30}
                onChange={(e) => handleUpdateSettings('accessControl', { sessionTimeout: parseInt(e.target.value) })}
                className="input"
                min="5"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Concurrent Sessions</label>
              <input
                type="number"
                value={security.accessControl?.maxConcurrentSessions || 3}
                onChange={(e) => handleUpdateSettings('accessControl', { maxConcurrentSessions: parseInt(e.target.value) })}
                className="input"
                min="1"
                max="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Roles</label>
            <div className="flex flex-wrap gap-2">
              {['admin', 'manager', 'staff', 'viewer'].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={security.accessControl?.allowedRoles?.includes(role) || false}
                    onChange={(e) => {
                      const currentRoles = security.accessControl?.allowedRoles || [];
                      const updatedRoles = e.target.checked 
                        ? [...currentRoles, role]
                        : currentRoles.filter(r => r !== role);
                      handleUpdateSettings('accessControl', { allowedRoles: updatedRoles });
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Authentication Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Authentication Settings</h3>
          <LockClosedIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Require 2FA for backup access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.authentication?.twoFactorEnabled || false}
                onChange={(e) => handleUpdateSettings('authentication', { twoFactorEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={security.authentication?.maxLoginAttempts || 5}
                onChange={(e) => handleUpdateSettings('authentication', { maxLoginAttempts: parseInt(e.target.value) })}
                className="input"
                min="3"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
              <input
                type="number"
                value={security.authentication?.lockoutDuration || 15}
                onChange={(e) => handleUpdateSettings('authentication', { lockoutDuration: parseInt(e.target.value) })}
                className="input"
                min="5"
                max="60"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Audit Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Audit Logging</h3>
          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Audit Logging</p>
              <p className="text-sm text-gray-600">Log all backup and security events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.audit?.enabled || false}
                onChange={(e) => handleUpdateSettings('audit', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
              <select
                value={security.audit?.logLevel || 'detailed'}
                onChange={(e) => handleUpdateSettings('audit', { logLevel: e.target.value })}
                className="input"
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="verbose">Verbose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period (days)</label>
              <input
                type="number"
                value={security.audit?.retentionDays || 365}
                onChange={(e) => handleUpdateSettings('audit', { retentionDays: parseInt(e.target.value) })}
                className="input"
                min="30"
                max="1095"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.audit?.includeFailedAttempts || false}
                onChange={(e) => handleUpdateSettings('audit', { includeFailedAttempts: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Log failed login attempts</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.audit?.includeDataAccess || false}
                onChange={(e) => handleUpdateSettings('audit', { includeDataAccess: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Log data access events</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Security Activity</h3>
          <BellIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {security.recentActivity?.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.user} • {activity.ip} • {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  {activity.reason && (
                    <p className="text-xs text-red-600">{activity.reason}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPasswordModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPasswords.current ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPasswords.new ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Password strength:</span>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 2 ? 'bg-red-500' :
                            passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPasswords.confirm ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changePasswordMutation.isLoading}
                >
                  {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SecuritySettings;
