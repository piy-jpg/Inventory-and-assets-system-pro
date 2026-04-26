import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ServerIcon,
  CloudArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const BackupDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  const queryClient = useQueryClient();

  // Real-time backup dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery(
    'backupDashboard',
    () => {
      const storedData = localStorage.getItem('backupDashboard');
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      return {
        lastBackup: {
          id: 'BACKUP_001',
          date: '2024-04-23T02:00:00Z',
          type: 'full',
          status: 'success',
          size: '2.4 GB',
          duration: '5m 23s',
          location: 'cloud',
          provider: 'AWS S3'
        },
        statistics: {
          totalBackups: 47,
          successfulBackups: 44,
          failedBackups: 3,
          totalStorageUsed: '124.7 GB',
          localStorageUsed: '45.2 GB',
          cloudStorageUsed: '79.5 GB',
          averageBackupSize: '2.65 GB',
          backupHealth: 93.6
        },
        recentBackups: [
          {
            id: 'BACKUP_001',
            date: '2024-04-23T02:00:00Z',
            type: 'full',
            status: 'success',
            size: '2.4 GB',
            duration: '5m 23s',
            location: 'cloud',
            provider: 'AWS S3',
            createdBy: 'system'
          },
          {
            id: 'BACKUP_002',
            date: '2024-04-22T02:00:00Z',
            type: 'full',
            status: 'success',
            size: '2.3 GB',
            duration: '4m 56s',
            location: 'cloud',
            provider: 'AWS S3',
            createdBy: 'system'
          },
          {
            id: 'BACKUP_003',
            date: '2024-04-21T02:00:00Z',
            type: 'incremental',
            status: 'success',
            size: '0.8 GB',
            duration: '2m 15s',
            location: 'local',
            provider: 'Local Storage',
            createdBy: 'system'
          },
          {
            id: 'BACKUP_004',
            date: '2024-04-20T02:00:00Z',
            type: 'full',
            status: 'failed',
            size: '2.5 GB',
            duration: '3m 12s',
            location: 'cloud',
            provider: 'AWS S3',
            createdBy: 'system',
            error: 'Connection timeout'
          },
          {
            id: 'BACKUP_005',
            date: '2024-04-19T02:00:00Z',
            type: 'full',
            status: 'success',
            size: '2.6 GB',
            duration: '5m 45s',
            location: 'cloud',
            provider: 'AWS S3',
            createdBy: 'system'
          }
        ],
        storageInfo: {
          local: {
            total: '500 GB',
            used: '45.2 GB',
            available: '454.8 GB',
            percentage: 9.0
          },
          cloud: {
            total: '1 TB',
            used: '79.5 GB',
            available: '920.5 GB',
            percentage: 7.8
          }
        },
        scheduledBackups: [
          {
            id: 'SCHEDULE_001',
            name: 'Daily Full Backup',
            frequency: 'daily',
            time: '02:00 AM',
            enabled: true,
            nextRun: '2024-04-24T02:00:00Z',
            lastRun: '2024-04-23T02:00:00Z',
            status: 'success'
          },
          {
            id: 'SCHEDULE_002',
            name: 'Weekly Incremental',
            frequency: 'weekly',
            time: '03:00 AM',
            day: 'Sunday',
            enabled: true,
            nextRun: '2024-04-28T03:00:00Z',
            lastRun: '2024-04-21T03:00:00Z',
            status: 'success'
          },
          {
            id: 'SCHEDULE_003',
            name: 'Monthly Archive',
            frequency: 'monthly',
            time: '04:00 AM',
            day: 1,
            enabled: false,
            nextRun: null,
            lastRun: '2024-03-01T04:00:00Z',
            status: 'disabled'
          }
        ]
      };
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Backup dashboard data refreshed:', data);
      }
    }
  );

  const dashboard = dashboardData || {};

  const openDetailsModal = (backup) => {
    setSelectedBackup(backup);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Backup dashboard data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4" />;
      case 'in_progress':
        return <ServerIcon className="h-4 w-4" />;
      case 'scheduled':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 70) return 'text-yellow-600';
    if (health >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStorageColor = (percentage) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate statistics
  const stats = dashboard.statistics || {};
  const lastBackup = dashboard.lastBackup || {};
  const recentBackups = dashboard.recentBackups || [];
  const storageInfo = dashboard.storageInfo || {};
  const scheduledBackups = dashboard.scheduledBackups || [];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Backup Dashboard</h1>
            <p className="page-subtitle">Last backup status, Total backups available, Storage usage, Backup health</p>
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

      {/* Last Backup Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Last Backup Status</h2>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm opacity-90">Type</p>
                <p className="text-lg font-semibold capitalize">{lastBackup.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Date & Time</p>
                <p className="text-lg font-semibold">
                  {lastBackup.date ? new Date(lastBackup.date).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Size</p>
                <p className="text-lg font-semibold">{lastBackup.size || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Duration</p>
                <p className="text-lg font-semibold">{lastBackup.duration || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Location</p>
                <p className="text-lg font-semibold capitalize">{lastBackup.provider || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(lastBackup.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              lastBackup.status === 'success' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
            }`}>
              {lastBackup.status ? lastBackup.status.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBackups || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className={`text-2xl font-bold ${getHealthColor(stats.backupHealth)}`}>
                {stats.backupHealth || 0}%
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStorageUsed || '0 GB'}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CloudArrowUpIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Backups</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedBackups || 0}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Storage Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Storage</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Used</span>
              <span className="text-sm font-medium text-gray-900">{storageInfo.local?.used || '0 GB'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available</span>
              <span className="text-sm font-medium text-gray-900">{storageInfo.local?.available || '0 GB'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${storageInfo.local?.percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Total: {storageInfo.local?.total || '0 GB'}</span>
              <span className={`text-xs font-medium ${getStorageColor(storageInfo.local?.percentage)}`}>
                {storageInfo.local?.percentage || 0}% used
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cloud Storage</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Used</span>
              <span className="text-sm font-medium text-gray-900">{storageInfo.cloud?.used || '0 GB'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available</span>
              <span className="text-sm font-medium text-gray-900">{storageInfo.cloud?.available || '0 GB'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${storageInfo.cloud?.percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Total: {storageInfo.cloud?.total || '0 GB'}</span>
              <span className={`text-xs font-medium ${getStorageColor(storageInfo.cloud?.percentage)}`}>
                {storageInfo.cloud?.percentage || 0}% used
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scheduled Backups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Backups</h3>
        <div className="space-y-3">
          {scheduledBackups.map((schedule) => (
            <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  schedule.enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <ClockIcon className={`h-4 w-4 ${schedule.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{schedule.name}</p>
                  <p className="text-xs text-gray-500">
                    {schedule.frequency} at {schedule.time} {schedule.day && `(${schedule.day})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  schedule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {schedule.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                  {schedule.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Backups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Backups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBackups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(backup.date).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(backup.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{backup.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{backup.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{backup.provider}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailsModal(backup)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Backup Details Modal */}
      {showDetailsModal && selectedBackup && (
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
              <h3 className="text-lg font-semibold text-gray-900">Backup Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Backup ID</p>
                  <p className="text-sm text-gray-900">{selectedBackup.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date & Time</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBackup.date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                    {selectedBackup.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedBackup.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBackup.status)}`}>
                      {selectedBackup.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Size</p>
                  <p className="text-sm text-gray-900">{selectedBackup.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-sm text-gray-900">{selectedBackup.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{selectedBackup.provider}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created By</p>
                  <p className="text-sm text-gray-900">{selectedBackup.createdBy}</p>
                </div>
              </div>

              {selectedBackup.error && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Details</p>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">{selectedBackup.error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BackupDashboard;
