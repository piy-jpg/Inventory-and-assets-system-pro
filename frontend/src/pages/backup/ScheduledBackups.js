import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  CalendarIcon,
  BellIcon,
  CpuChipIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const ScheduledBackups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily',
    time: '02:00',
    day: '1',
    backupType: 'full',
    format: 'sql',
    enabled: true,
    modules: [],
    settings: {
      includeFiles: true,
      includeDatabase: true,
      includeSettings: true,
      compress: true,
      encrypt: false,
      uploadToCloud: true,
      saveLocal: true
    }
  });

  const queryClient = useQueryClient();

  // Real-time scheduled backups data
  const { data: schedulesData, isLoading, refetch } = useQuery(
    'scheduledBackups',
    () => {
      const storedSchedules = localStorage.getItem('scheduledBackups');
      if (storedSchedules) {
        return JSON.parse(storedSchedules);
      }
      
      return [
        {
          _id: 'SCHEDULE_001',
          name: 'Daily Full Backup',
          frequency: 'daily',
          time: '02:00',
          enabled: true,
          nextRun: '2024-04-24T02:00:00Z',
          lastRun: '2024-04-23T02:00:00Z',
          status: 'success',
          backupType: 'full',
          format: 'sql',
          modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
          settings: {
            includeFiles: true,
            includeDatabase: true,
            includeSettings: true,
            compress: true,
            encrypt: false,
            uploadToCloud: true,
            saveLocal: true
          },
          runCount: 47,
          successCount: 44,
          failureCount: 3,
          createdAt: '2024-03-01T00:00:00Z',
          createdBy: 'admin'
        },
        {
          _id: 'SCHEDULE_002',
          name: 'Weekly Incremental',
          frequency: 'weekly',
          time: '03:00',
          day: 'Sunday',
          enabled: true,
          nextRun: '2024-04-28T03:00:00Z',
          lastRun: '2024-04-21T03:00:00Z',
          status: 'success',
          backupType: 'incremental',
          format: 'sql',
          modules: ['inventory', 'transactions', 'customers', 'suppliers'],
          settings: {
            includeFiles: false,
            includeDatabase: true,
            includeSettings: false,
            compress: true,
            encrypt: false,
            uploadToCloud: true,
            saveLocal: false
          },
          runCount: 12,
          successCount: 11,
          failureCount: 1,
          createdAt: '2024-02-15T00:00:00Z',
          createdBy: 'admin'
        },
        {
          _id: 'SCHEDULE_003',
          name: 'Monthly Archive',
          frequency: 'monthly',
          time: '04:00',
          day: 1,
          enabled: false,
          nextRun: null,
          lastRun: '2024-03-01T04:00:00Z',
          status: 'disabled',
          backupType: 'full',
          format: 'zip',
          modules: ['inventory', 'users', 'transactions', 'customers', 'suppliers', 'reports', 'settings', 'logs', 'media', 'temp'],
          settings: {
            includeFiles: true,
            includeDatabase: true,
            includeSettings: true,
            compress: true,
            encrypt: true,
            uploadToCloud: true,
            saveLocal: true
          },
          runCount: 8,
          successCount: 7,
          failureCount: 1,
          createdAt: '2023-12-01T00:00:00Z',
          createdBy: 'admin'
        },
        {
          _id: 'SCHEDULE_004',
          name: 'Hourly Database Backup',
          frequency: 'hourly',
          time: '00:00',
          enabled: true,
          nextRun: '2024-04-23T16:00:00Z',
          lastRun: '2024-04-23T15:00:00Z',
          status: 'success',
          backupType: 'database',
          format: 'sql',
          modules: ['inventory', 'transactions'],
          settings: {
            includeFiles: false,
            includeDatabase: true,
            includeSettings: false,
            compress: true,
            encrypt: false,
            uploadToCloud: false,
            saveLocal: true
          },
          runCount: 384,
          successCount: 382,
          failureCount: 2,
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'admin'
        },
        {
          _id: 'SCHEDULE_005',
          name: 'Critical Data Backup',
          frequency: 'daily',
          time: '06:00',
          enabled: true,
          nextRun: '2024-04-24T06:00:00Z',
          lastRun: '2024-04-23T06:00:00Z',
          status: 'failed',
          backupType: 'partial',
          format: 'json',
          modules: ['inventory', 'users', 'transactions'],
          settings: {
            includeFiles: false,
            includeDatabase: true,
            includeSettings: true,
            compress: true,
            encrypt: true,
            uploadToCloud: true,
            saveLocal: true
          },
          runCount: 30,
          successCount: 28,
          failureCount: 2,
          createdAt: '2024-03-15T00:00:00Z',
          createdBy: 'admin',
          error: 'Connection timeout to cloud storage'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Scheduled backups data refreshed:', data);
      }
    }
  );

  // Mutation for creating scheduled backup
  const createScheduleMutation = useMutation(
    async (scheduleData) => {
      const schedules = schedulesData || [];
      const newSchedule = {
        ...scheduleData,
        _id: `SCHEDULE_${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        runCount: 0,
        successCount: 0,
        failureCount: 0,
        lastRun: null,
        status: 'enabled'
      };
      const updatedSchedules = [...schedules, newSchedule];
      localStorage.setItem('scheduledBackups', JSON.stringify(updatedSchedules));
      queryClient.setQueryData('scheduledBackups', updatedSchedules);
      return newSchedule;
    },
    {
      onSuccess: () => {
        toast.success('Scheduled backup created successfully');
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create scheduled backup');
      }
    }
  );

  // Mutation for updating scheduled backup
  const updateScheduleMutation = useMutation(
    async (updatedSchedule) => {
      const schedules = schedulesData || [];
      const updatedSchedules = schedules.map(schedule => 
        schedule._id === updatedSchedule._id ? {
          ...updatedSchedule,
          updatedAt: new Date().toISOString()
        } : schedule
      );
      localStorage.setItem('scheduledBackups', JSON.stringify(updatedSchedules));
      queryClient.setQueryData('scheduledBackups', updatedSchedules);
      return updatedSchedules;
    },
    {
      onSuccess: () => {
        toast.success('Scheduled backup updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update scheduled backup');
      }
    }
  );

  // Mutation for deleting scheduled backup
  const deleteScheduleMutation = useMutation(
    async (scheduleId) => {
      const schedules = schedulesData || [];
      const updatedSchedules = schedules.filter(schedule => schedule._id !== scheduleId);
      localStorage.setItem('scheduledBackups', JSON.stringify(updatedSchedules));
      queryClient.setQueryData('scheduledBackups', updatedSchedules);
      return updatedSchedules;
    },
    {
      onSuccess: () => {
        toast.success('Scheduled backup deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete scheduled backup');
      }
    }
  );

  // Mutation for toggling scheduled backup
  const toggleScheduleMutation = useMutation(
    async ({ scheduleId, enabled }) => {
      const schedules = schedulesData || [];
      const updatedSchedules = schedules.map(schedule => 
        schedule._id === scheduleId ? {
          ...schedule,
          enabled,
          status: enabled ? 'enabled' : 'disabled',
          nextRun: enabled ? calculateNextRun(schedule) : null,
          updatedAt: new Date().toISOString()
        } : schedule
      );
      localStorage.setItem('scheduledBackups', JSON.stringify(updatedSchedules));
      queryClient.setQueryData('scheduledBackups', updatedSchedules);
      return updatedSchedules;
    },
    {
      onSuccess: () => {
        toast.success('Scheduled backup updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update scheduled backup');
      }
    }
  );

  const schedules = schedulesData || [];

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        schedule.frequency?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                        (filterStatus === 'enabled' && schedule.enabled) ||
                        (filterStatus === 'disabled' && !schedule.enabled) ||
                        (filterStatus === schedule.status);
    
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      frequency: 'daily',
      time: '02:00',
      day: '1',
      backupType: 'full',
      format: 'sql',
      enabled: true,
      modules: [],
      settings: {
        includeFiles: true,
        includeDatabase: true,
        includeSettings: true,
        compress: true,
        encrypt: false,
        uploadToCloud: true,
        saveLocal: true
      }
    });
  };

  const calculateNextRun = (schedule) => {
    const now = new Date();
    const nextRun = new Date();
    
    switch (schedule.frequency) {
      case 'daily':
        nextRun.setHours(parseInt(schedule.time.split(':')[0]), parseInt(schedule.time.split(':')[1]), 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(schedule.day);
        nextRun.setHours(parseInt(schedule.time.split(':')[0]), parseInt(schedule.time.split(':')[1]), 0, 0);
        nextRun.setDate(nextRun.getDate() + ((targetDay - now.getDay() + 7) % 7 || 7));
        break;
      case 'monthly':
        nextRun.setDate(parseInt(schedule.day));
        nextRun.setHours(parseInt(schedule.time.split(':')[0]), parseInt(schedule.time.split(':')[1]), 0, 0);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      case 'hourly':
        nextRun.setHours(now.getHours() + 1, 0, 0, 0);
        break;
      default:
        return null;
    }
    
    return nextRun.toISOString();
  };

  const openDetailsModal = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleCreateSchedule = () => {
    if (!formData.name.trim()) {
      toast.error('Schedule name is required');
      return;
    }

    createScheduleMutation.mutate(formData);
  };

  const handleUpdateSchedule = () => {
    if (!selectedSchedule) return;

    updateScheduleMutation.mutate({
      ...selectedSchedule,
      ...formData
    });
  };

  const handleDeleteSchedule = () => {
    if (!selectedSchedule) return;

    if (window.confirm('Are you sure you want to delete this scheduled backup? This action cannot be undone.')) {
      deleteScheduleMutation.mutate(selectedSchedule._id);
    }
  };

  const handleToggleSchedule = (scheduleId, enabled) => {
    toggleScheduleMutation.mutate({
      scheduleId,
      enabled
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Scheduled backups data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'enabled':
        return 'bg-blue-100 text-blue-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'hourly':
        return 'bg-purple-100 text-purple-800';
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'monthly':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRate = (schedule) => {
    if (schedule.runCount === 0) return 0;
    return ((schedule.successCount / schedule.runCount) * 100).toFixed(1);
  };

  // Calculate statistics
  const totalSchedules = schedules.length;
  const enabledSchedules = schedules.filter(schedule => schedule.enabled).length;
  const disabledSchedules = schedules.filter(schedule => !schedule.enabled).length;
  const runningSchedules = schedules.filter(schedule => schedule.status === 'running').length;
  const averageSuccessRate = schedules.length > 0 
    ? (schedules.reduce((sum, schedule) => sum + parseFloat(getSuccessRate(schedule)), 0) / schedules.length).toFixed(1)
    : 0;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Scheduled Backups</h1>
            <p className="page-subtitle">Set automatic backups, Daily/Weekly/Monthly, Set time & frequency, Enable/disable scheduler</p>
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
              <span>Add Schedule</span>
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
              <p className="text-sm font-medium text-gray-600">Total Schedules</p>
              <p className="text-2xl font-bold text-gray-900">{totalSchedules}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enabled</p>
              <p className="text-2xl font-bold text-green-600">{enabledSchedules}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <PlayIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disabled</p>
              <p className="text-2xl font-bold text-gray-600">{disabledSchedules}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <PauseIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">{averageSuccessRate}%</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
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
                placeholder="Search scheduled backups..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="running">Running</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Scheduled Backups Table */}
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
                  Schedule Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No scheduled backups found
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{schedule.backupType} backup</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(schedule.frequency)}`}>
                          {schedule.frequency}
                        </span>
                        <span className="text-sm text-gray-600">
                          {schedule.frequency === 'weekly' && `(${schedule.day})`}
                          {schedule.frequency === 'monthly' && `(Day ${schedule.day})`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{schedule.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getSuccessRate(schedule)}%</div>
                      <div className="text-xs text-gray-500">{schedule.successCount}/{schedule.runCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(schedule)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleSchedule(schedule._id, !schedule.enabled)}
                          className={`${
                            schedule.enabled ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          title={schedule.enabled ? 'Disable' : 'Enable'}
                        >
                          {schedule.enabled ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
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

      {/* Create Schedule Modal */}
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
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Scheduled Backup</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSchedule();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter schedule name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                {formData.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                      className="input"
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>
                )}

                {formData.frequency === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                      className="input"
                    >
                      {Array.from({ length: 28 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Backup Type</label>
                    <select
                      value={formData.backupType}
                      onChange={(e) => setFormData(prev => ({ ...prev, backupType: e.target.value }))}
                      className="input"
                    >
                      <option value="full">Full</option>
                      <option value="incremental">Incremental</option>
                      <option value="partial">Partial</option>
                      <option value="database">Database Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                      className="input"
                    >
                      <option value="sql">SQL</option>
                      <option value="zip">ZIP</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enable schedule</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createScheduleMutation.isLoading}
                >
                  {createScheduleMutation.isLoading ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Schedule Details Modal */}
      {showDetailsModal && selectedSchedule && (
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
              <h3 className="text-lg font-semibold text-gray-900">Schedule Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">Schedule Name</p>
                  <p className="text-sm text-gray-900">{selectedSchedule.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Frequency</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(selectedSchedule.frequency)}`}>
                      {selectedSchedule.frequency}
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedSchedule.frequency === 'weekly' && `(${selectedSchedule.day})`}
                      {selectedSchedule.frequency === 'monthly' && `(Day ${selectedSchedule.day})`}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Time</p>
                  <p className="text-sm text-gray-900">{selectedSchedule.time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSchedule.status)}`}>
                    {selectedSchedule.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Backup Type</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedSchedule.backupType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Format</p>
                  <p className="text-sm text-gray-900 uppercase">{selectedSchedule.format}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Run</p>
                  <p className="text-sm text-gray-900">
                    {selectedSchedule.nextRun ? new Date(selectedSchedule.nextRun).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Run</p>
                  <p className="text-sm text-gray-900">
                    {selectedSchedule.lastRun ? new Date(selectedSchedule.lastRun).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-sm text-gray-900">{getSuccessRate(selectedSchedule)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Runs</p>
                  <p className="text-sm text-gray-900">{selectedSchedule.runCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{new Date(selectedSchedule.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created By</p>
                  <p className="text-sm text-gray-900">{selectedSchedule.createdBy}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Backup Modules</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSchedule.modules.map((module, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              {selectedSchedule.error && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Error</p>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">{selectedSchedule.error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteSchedule}
                  className="btn btn-outline btn-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    // Open edit modal with current schedule data
                    setFormData({
                      name: selectedSchedule.name,
                      frequency: selectedSchedule.frequency,
                      time: selectedSchedule.time,
                      day: selectedSchedule.day || '1',
                      backupType: selectedSchedule.backupType,
                      format: selectedSchedule.format,
                      enabled: selectedSchedule.enabled,
                      modules: selectedSchedule.modules,
                      settings: selectedSchedule.settings
                    });
                    setShowCreateModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Edit
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

export default ScheduledBackups;
