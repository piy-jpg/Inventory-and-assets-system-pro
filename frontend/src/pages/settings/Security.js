import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  TrashIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const Security = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');

  const queryClient = useQueryClient();

  // Mock security data
  const { data: securityData, isLoading, refetch } = useQuery(
    'securitySettings',
    () => {
      const storedSecurity = localStorage.getItem('securitySettings');
      if (storedSecurity) {
        return JSON.parse(storedSecurity);
      }
      
      return {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90
        },
        twoFactorEnabled: false,
        twoFactorMethod: 'app',
        activeSessions: [
          {
            id: 'session_001',
            device: 'Chrome on Windows',
            deviceType: 'desktop',
            ip: '192.168.1.100',
            location: 'New York, USA',
            lastActivity: '2024-04-23T10:30:00Z',
            createdAt: '2024-04-23T09:00:00Z',
            isCurrent: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          {
            id: 'session_002',
            device: 'Safari on iPhone',
            deviceType: 'mobile',
            ip: '192.168.1.101',
            location: 'New York, USA',
            lastActivity: '2024-04-22T18:45:00Z',
            createdAt: '2024-04-22T08:00:00Z',
            isCurrent: false,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
          },
          {
            id: 'session_003',
            device: 'Chrome on MacBook',
            deviceType: 'desktop',
            ip: '192.168.1.102',
            location: 'Boston, USA',
            lastActivity: '2024-04-21T14:20:00Z',
            createdAt: '2024-04-21T09:30:00Z',
            isCurrent: false,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        ],
        loginHistory: [
          {
            id: 'login_001',
            timestamp: '2024-04-23T10:30:00Z',
            ip: '192.168.1.100',
            location: 'New York, USA',
            device: 'Chrome on Windows',
            status: 'success',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          {
            id: 'login_002',
            timestamp: '2024-04-23T09:00:00Z',
            ip: '192.168.1.100',
            location: 'New York, USA',
            device: 'Chrome on Windows',
            status: 'success',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          {
            id: 'login_003',
            timestamp: '2024-04-22T23:45:00Z',
            ip: '192.168.1.200',
            location: 'Unknown',
            device: 'Unknown',
            status: 'failed',
            reason: 'Invalid credentials',
            userAgent: 'Mozilla/5.0 (compatible; bot/1.0)'
          },
          {
            id: 'login_004',
            timestamp: '2024-04-22T18:45:00Z',
            ip: '192.168.1.101',
            location: 'New York, USA',
            device: 'Safari on iPhone',
            status: 'success',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
          }
        ],
        recoveryOptions: {
          email: 'recovery@example.com',
          phone: '+1 (555) 987-6543',
          securityQuestions: [
            { question: 'What was your first pet\'s name?', answer: 'encrypted' },
            { question: 'What city were you born in?', answer: 'encrypted' }
          ]
        }
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        setTwoFactorEnabled(data.twoFactorEnabled);
        setRecoveryEmail(data.recoveryOptions.email);
        setRecoveryPhone(data.recoveryOptions.phone);
      }
    }
  );

  // Password change mutation
  const changePasswordMutation = useMutation(
    async (passwordData) => {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedSecurity = {
        ...securityData,
        lastPasswordChange: new Date().toISOString()
      };
      localStorage.setItem('securitySettings', JSON.stringify(updatedSecurity));
      queryClient.setQueryData('securitySettings', updatedSecurity);
      
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

  // 2FA toggle mutation
  const toggle2FAMutation = useMutation(
    async (enabled) => {
      // Simulate 2FA toggle
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedSecurity = {
        ...securityData,
        twoFactorEnabled: enabled,
        last2FAChange: new Date().toISOString()
      };
      localStorage.setItem('securitySettings', JSON.stringify(updatedSecurity));
      queryClient.setQueryData('securitySettings', updatedSecurity);
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success(`Two-factor authentication ${twoFactorEnabled ? 'disabled' : 'enabled'} successfully`);
        setShow2FAModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update two-factor authentication');
      }
    }
  );

  // Session termination mutation
  const terminateSessionMutation = useMutation(
    async (sessionId) => {
      // Simulate session termination
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSecurity = {
        ...securityData,
        activeSessions: securityData.activeSessions.filter(session => session.id !== sessionId)
      };
      localStorage.setItem('securitySettings', JSON.stringify(updatedSecurity));
      queryClient.setQueryData('securitySettings', updatedSecurity);
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Session terminated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to terminate session');
      }
    }
  );

  // Recovery options update mutation
  const updateRecoveryMutation = useMutation(
    async (recoveryData) => {
      // Simulate recovery options update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedSecurity = {
        ...securityData,
        recoveryOptions: {
          ...securityData.recoveryOptions,
          ...recoveryData
        }
      };
      localStorage.setItem('securitySettings', JSON.stringify(updatedSecurity));
      queryClient.setQueryData('securitySettings', updatedSecurity);
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Recovery options updated successfully');
        setShowRecoveryModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update recovery options');
      }
    }
  );

  const security = securityData || {};

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < security.passwordPolicy.minLength) {
      toast.error(`Password must be at least ${security.passwordPolicy.minLength} characters long`);
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword
    });
  };

  const handle2FAToggle = () => {
    toggle2FAMutation.mutate(!twoFactorEnabled);
  };

  const handleTerminateSession = (sessionId) => {
    if (window.confirm('Are you sure you want to terminate this session?')) {
      terminateSessionMutation.mutate(sessionId);
    }
  };

  const handleUpdateRecovery = () => {
    if (!recoveryEmail.trim()) {
      toast.error('Recovery email is required');
      return;
    }

    updateRecoveryMutation.mutate({
      email: recoveryEmail,
      phone: recoveryPhone
    });
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

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'desktop':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      default:
        return <GlobeAltIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
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
            <h1 className="page-title">Security</h1>
            <p className="page-subtitle">Manage your account security and access control</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password</p>
                    <p className="text-xs text-gray-500">Last changed 30 days ago</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">2FA</p>
                    <p className="text-xs text-gray-500">
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handle2FAToggle}
                  className={`text-sm ${twoFactorEnabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                    <p className="text-xs text-gray-500">
                      {security.activeSessions?.length || 0} sessions
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {(security.activeSessions?.length || 0)} active
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Recovery</p>
                    <p className="text-xs text-gray-500">Email & phone set</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out from all devices except this one?')) {
                    toast.success('All other sessions terminated');
                  }
                }}
                className="btn btn-secondary btn-sm"
              >
                Log Out All Others
              </button>
            </div>
            
            <div className="space-y-3">
              {security.activeSessions?.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{session.device}</p>
                        {session.isCurrent && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{session.location}</p>
                      <p className="text-xs text-gray-400">
                        Last active: {new Date(session.lastActivity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Login History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Login Activity</h3>
            
            <div className="space-y-3">
              {security.loginHistory?.slice(0, 5).map((login) => (
                <div key={login.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      login.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {login.status === 'success' ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{login.device}</p>
                      <p className="text-sm text-gray-500">{login.location}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(login.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(login.status)}`}>
                      {login.status}
                    </span>
                    {login.reason && (
                      <p className="text-xs text-red-600">{login.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

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
              handlePasswordChange();
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

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Password must be at least {security.passwordPolicy.minLength} characters long and include uppercase, lowercase, numbers, and special characters.
                  </p>
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

      {/* 2FA Modal */}
      {show2FAModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShow2FAModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <ShieldCheckIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">
                  {twoFactorEnabled 
                    ? 'Disabling 2FA will make your account less secure. Are you sure?'
                    : 'Enable two-factor authentication to add an extra layer of security to your account.'
                  }
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  {twoFactorEnabled 
                    ? 'You will no longer need to enter a verification code when signing in.'
                    : 'You will need to enter a verification code from your authenticator app when signing in.'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShow2FAModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handle2FAToggle}
                className={`btn ${twoFactorEnabled ? 'btn-danger' : 'btn-primary'}`}
                disabled={toggle2FAMutation.isLoading}
              >
                {toggle2FAMutation.isLoading ? 'Processing...' : 
                 twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Recovery Options Modal */}
      {showRecoveryModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRecoveryModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recovery Options</h3>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateRecovery();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Email</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="input"
                    placeholder="Enter recovery email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Phone</label>
                  <input
                    type="tel"
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value)}
                    className="input"
                    placeholder="Enter recovery phone"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    These options will be used to help you recover your account if you forget your password.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateRecoveryMutation.isLoading}
                >
                  {updateRecoveryMutation.isLoading ? 'Updating...' : 'Update Options'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Security;
