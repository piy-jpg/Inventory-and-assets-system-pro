import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  ServerIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const BackupHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const queryClient = useQueryClient();

  // Real-time backup history data
  const { data: backupsData, isLoading, refetch } = useQuery(
    'backupHistory',
    () => {
      const storedBackups = localStorage.getItem('backupHistory');
      if (storedBackups) {
        return JSON.parse(storedBackups);
      }
      
      return [
        {
          _id: 'BACKUP_001',
          name: 'Daily Full Backup',
          date: '2024-04-23T02:00:00Z',
          type: 'full',
          format: 'sql',
          status: 'success',
          size: '2.4 GB',
          duration: '5m 23s',
          location: 'cloud',
          provider: 'AWS S3',
          modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
          createdBy: 'system',
          scheduleId: 'SCHEDULE_001',
          downloadUrl: 'https://s3.amazonaws.com/backups/BACKUP_001.sql',
          integrity: 'verified',
          checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
          compressed: true,
          encrypted: false,
          retentionDays: 30,
          autoDelete: '2024-05-23T02:00:00Z'
        },
        {
          _id: 'BACKUP_002',
          name: 'Daily Full Backup',
          date: '2024-04-22T02:00:00Z',
          type: 'full',
          format: 'sql',
          status: 'success',
          size: '2.3 GB',
          duration: '4m 56s',
          location: 'cloud',
          provider: 'AWS S3',
          modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
          createdBy: 'system',
          scheduleId: 'SCHEDULE_001',
          downloadUrl: 'https://s3.amazonaws.com/backups/BACKUP_002.sql',
          integrity: 'verified',
          checksum: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
          compressed: true,
          encrypted: false,
          retentionDays: 30,
          autoDelete: '2024-05-22T02:00:00Z'
        },
        {
          _id: 'BACKUP_003',
          name: 'Weekly Incremental',
          date: '2024-04-21T03:00:00Z',
          type: 'incremental',
          format: 'sql',
          status: 'success',
          size: '0.8 GB',
          duration: '2m 15s',
          location: 'local',
          provider: 'Local Storage',
          modules: ['inventory', 'transactions', 'customers', 'suppliers'],
          createdBy: 'system',
          scheduleId: 'SCHEDULE_002',
          downloadUrl: '/backups/BACKUP_003.sql',
          integrity: 'verified',
          checksum: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
          compressed: true,
          encrypted: false,
          retentionDays: 14,
          autoDelete: '2024-05-05T03:00:00Z'
        },
        {
          _id: 'BACKUP_004',
          name: 'Daily Full Backup',
          date: '2024-04-20T02:00:00Z',
          type: 'full',
          format: 'sql',
          status: 'failed',
          size: '2.5 GB',
          duration: '3m 12s',
          location: 'cloud',
          provider: 'AWS S3',
          modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
          createdBy: 'system',
          scheduleId: 'SCHEDULE_001',
          error: 'Connection timeout to AWS S3',
          integrity: 'failed',
          checksum: null,
          compressed: false,
          encrypted: false,
          retentionDays: 30,
          autoDelete: '2024-05-20T02:00:00Z'
        },
        {
          _id: 'BACKUP_005',
          name: 'Daily Full Backup',
          date: '2024-04-19T02:00:00Z',
          type: 'full',
          format: 'sql',
          status: 'success',
          size: '2.6 GB',
          duration: '5m 45s',
          location: 'cloud',
          provider: 'AWS S3',
          modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
          createdBy: 'system',
          scheduleId: 'SCHEDULE_001',
          downloadUrl: 'https://s3.amazonaws.com/backups/BACKUP_005.sql',
          integrity: 'verified',
          checksum: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
          compressed: true,
          encrypted: false,
          retentionDays: 30,
          autoDelete: '2024-05-19T02:00:00Z'
        },
        {
          _id: 'BACKUP_006',
          name: 'Manual Backup',
          date: '2024-04-18T14:30:00Z',
          type: 'partial',
          format: 'json',
          status: 'success',
          size: '1.2 GB',
          duration: '3m 30s',
          location: 'cloud',
          provider: 'Google Drive',
          modules: ['inventory', 'users'],
          createdBy: 'admin',
          scheduleId: null,
          downloadUrl: 'https://drive.google.com/backup/BACKUP_006.json',
          integrity: 'verified',
          checksum: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
          compressed: true,
          encrypted: true,
          retentionDays: 90,
          autoDelete: '2024-07-18T14:30:00Z'
        },
        {
          _id: 'BACKUP_007',
          name: 'Hourly Database Backup',
          date: '2024-04-18T15:00:00Z',
          type: 'database',
          format: 'sql',
          status: 'success',
          size: '0.3 GB',
          duration: '1m 45s',
          location: 'local',
          provider: 'Local Storage',
          modules: ['inventory', 'transactions'],
          createdBy: 'system',
          scheduleId: 'SCHEDULE_004',
          downloadUrl: '/backups/BACKUP_007.sql',
          integrity: 'verified',
          checksum: 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
          compressed: true,
          encrypted: false,
          retentionDays: 7,
          autoDelete: '2024-04-25T15:00:00Z'
        },
        {
          _id: 'BACKUP_008',
          name: 'Monthly Archive',
          date: '2024-03-01T04:00:00Z',
          type: 'full',
          format: 'zip',
          status: 'success',
          size: '3.8 GB',
          duration: '8m 15s',
          location: 'cloud',
          provider: 'AWS S3',
          modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
          createdBy: 'system',
          scheduleId: 'SCHEDULE_003',
          downloadUrl: 'https://s3.amazonaws.com/backups/BACKUP_008.zip',
          integrity: 'verified',
          checksum: 'g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
          compressed: true,
          encrypted: true,
          retentionDays: 365,
          autoDelete: '2025-03-01T04:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Backup history data refreshed:', data);
      }
    }
  );

  // Mutation for downloading backup
  const downloadBackupMutation = useMutation(
    async (backupId) => {
      // Simulate download
      const backup = backupsData.find(b => b._id === backupId);
      if (!backup) throw new Error('Backup not found');
      
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would trigger actual file download
      const link = document.createElement('a');
      link.href = backup.downloadUrl;
      link.download = `${backup.name.replace(/\s+/g, '_')}_${backup._id}.${backup.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return backup;
    },
    {
      onSuccess: () => {
        toast.success('Backup downloaded successfully');
      },
      onError: () => {
        toast.error('Failed to download backup');
      }
    }
  );

  // Mutation for deleting backup
  const deleteBackupMutation = useMutation(
    async (backupId) => {
      const backups = backupsData || [];
      const updatedBackups = backups.filter(backup => backup._id !== backupId);
      localStorage.setItem('backupHistory', JSON.stringify(updatedBackups));
      queryClient.setQueryData('backupHistory', updatedBackups);
      return updatedBackups;
    },
    {
      onSuccess: () => {
        toast.success('Backup deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete backup');
      }
    }
  );

  const backups = backupsData || [];

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        backup.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        backup.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || backup.type === filterType;
    const matchesStatus = filterStatus === 'all' || backup.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || backup.location === filterLocation;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const backupDate = new Date(backup.date).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const weekAgo = new Date(Date.now() - 604800000).toDateString();
      const monthAgo = new Date(Date.now() - 2592000000).toDateString();
      
      switch (filterDate) {
        case 'today':
          matchesDate = backupDate === today;
          break;
        case 'yesterday':
          matchesDate = backupDate === yesterday;
          break;
        case 'week':
          matchesDate = new Date(backup.date) >= new Date(weekAgo);
          break;
        case 'month':
          matchesDate = new Date(backup.date) >= new Date(monthAgo);
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesLocation && matchesDate;
  });

  // Sort backups
  const sortedBackups = [...filteredBackups].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = parseFloat(a.size) - parseFloat(b.size);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const openDetailsModal = (backup) => {
    setSelectedBackup(backup);
    setShowDetailsModal(true);
  };

  const handleDownload = (backupId) => {
    downloadBackupMutation.mutate(backupId);
  };

  const handleDelete = (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      deleteBackupMutation.mutate(backupId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Backup history data refreshed');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'full':
        return 'bg-purple-100 text-purple-800';
      case 'incremental':
        return 'bg-blue-100 text-blue-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'database':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationColor = (location) => {
    switch (location) {
      case 'cloud':
        return 'bg-blue-100 text-blue-800';
      case 'local':
        return 'bg-green-100 text-green-800';
      case 'hybrid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (size) => {
    return size;
  };

  const formatDuration = (duration) => {
    return duration;
  };

  // Calculate statistics
  const totalBackups = backups.length;
  const successfulBackups = backups.filter(backup => backup.status === 'success').length;
  const failedBackups = backups.filter(backup => backup.status === 'failed').length;
  const totalSize = backups.reduce((sum, backup) => {
    const size = parseFloat(backup.size) || 0;
    return sum + size;
  }, 0);

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Backup History</h1>
            <p className="page-subtitle">List of all backups, Date & time, File size, Type, Status, Actions: Download, Delete</p>
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
              <p className="text-sm font-medium text-gray-600">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900">{totalBackups}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{successfulBackups}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedBackups}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-purple-600">{totalSize.toFixed(1)} GB</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CloudArrowUpIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search backup history..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="full">Full</option>
              <option value="incremental">Incremental</option>
              <option value="partial">Partial</option>
              <option value="database">Database</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              className="input"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="cloud">Cloud</option>
              <option value="local">Local</option>
              <option value="hybrid">Hybrid</option>
            </select>
            
            <select
              className="input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Backups Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Backup Name</span>
                    {sortBy === 'name' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Date & Time</span>
                    {sortBy === 'date' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Type</span>
                    {sortBy === 'type' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('size')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Size</span>
                    {sortBy === 'size' && (
                      <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
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
              {sortedBackups.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No backups found
                  </td>
                </tr>
              ) : (
                sortedBackups.map((backup) => (
                  <tr key={backup._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                      <div className="text-xs text-gray-500">ID: {backup._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(backup.date).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                          {backup.type}
                        </span>
                        <span className="text-xs text-gray-500 uppercase">{backup.format}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatFileSize(backup.size)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDuration(backup.duration)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(backup.location)}`}>
                          {backup.location}
                        </span>
                        <span className="text-xs text-gray-500">{backup.provider}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(backup)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {backup.status === 'success' && (
                          <button
                            onClick={() => handleDownload(backup._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Download"
                            disabled={downloadBackupMutation.isLoading}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(backup._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={deleteBackupMutation.isLoading}
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
                  <p className="text-sm font-medium text-gray-600">Backup Name</p>
                  <p className="text-sm text-gray-900">{selectedBackup.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Backup ID</p>
                  <p className="text-sm text-gray-900">{selectedBackup._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date & Time</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBackup.date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedBackup.type)}`}>
                      {selectedBackup.type}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">{selectedBackup.format}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBackup.status)}`}>
                    {selectedBackup.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Size</p>
                  <p className="text-sm text-gray-900">{formatFileSize(selectedBackup.size)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-sm text-gray-900">{formatDuration(selectedBackup.duration)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(selectedBackup.location)}`}>
                      {selectedBackup.location}
                    </span>
                    <span className="text-sm text-gray-900">{selectedBackup.provider}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created By</p>
                  <p className="text-sm text-gray-900">{selectedBackup.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Integrity</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedBackup.integrity === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedBackup.integrity}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Compressed</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedBackup.compressed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBackup.compressed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Encrypted</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedBackup.encrypted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBackup.encrypted ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Retention Days</p>
                  <p className="text-sm text-gray-900">{selectedBackup.retentionDays} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Auto Delete</p>
                  <p className="text-sm text-gray-900">
                    {selectedBackup.autoDelete ? new Date(selectedBackup.autoDelete).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Backup Modules</p>
                <div className="flex flex-wrap gap-1">
                  {selectedBackup.modules.map((module, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              {selectedBackup.checksum && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Checksum</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-700 font-mono">{selectedBackup.checksum}</p>
                  </div>
                </div>
              )}

              {selectedBackup.error && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Error Details</p>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">{selectedBackup.error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                {selectedBackup.status === 'success' && (
                  <button
                    onClick={() => handleDownload(selectedBackup._id)}
                    className="btn btn-primary btn-sm"
                    disabled={downloadBackupMutation.isLoading}
                  >
                    {downloadBackupMutation.isLoading ? 'Downloading...' : 'Download'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedBackup._id)}
                  className="btn btn-outline btn-sm"
                  disabled={deleteBackupMutation.isLoading}
                >
                  {deleteBackupMutation.isLoading ? 'Deleting...' : 'Delete'}
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

export default BackupHistory;
