import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');

  const queryClient = useQueryClient();

  // Real-time asset maintenance data
  const { data: maintenanceData, isLoading, refetch } = useQuery(
    'assetMaintenance',
    () => {
      const storedMaintenance = localStorage.getItem('assetMaintenance');
      if (storedMaintenance) {
        return JSON.parse(storedMaintenance);
      }
      
      return [
        {
          _id: 'MNT_001',
          asset_id: 'AST_001',
          asset_name: 'Laptop Pro 15"',
          asset_tag: 'LAPTOP-001',
          maintenance_type: 'Preventive',
          scheduled_date: '2024-06-15',
          completed_date: null,
          status: 'scheduled',
          priority: 'medium',
          assigned_to: 'IT Department',
          estimated_cost: 150.00,
          actual_cost: null,
          notes: 'Regular preventive maintenance check',
          created_at: '2024-03-15T10:00:00Z',
          updated_at: '2024-03-15T10:00:00Z'
        },
        {
          _id: 'MNT_002',
          asset_id: 'AST_002',
          asset_name: 'Office Chair Ergonomic',
          asset_tag: 'CHAIR-001',
          maintenance_type: 'Preventive',
          scheduled_date: '2024-07-10',
          completed_date: '2024-07-08',
          status: 'completed',
          priority: 'low',
          assigned_to: 'Facilities',
          estimated_cost: 50.00,
          actual_cost: 45.00,
          notes: 'Annual inspection and lubrication',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-07-08T15:30:00Z'
        },
        {
          _id: 'MNT_003',
          asset_id: 'AST_003',
          asset_name: 'Desktop Computer',
          asset_tag: 'DESKTOP-001',
          maintenance_type: 'Corrective',
          scheduled_date: '2024-05-01',
          completed_date: '2024-05-03',
          status: 'completed',
          priority: 'high',
          assigned_to: 'IT Department',
          estimated_cost: 300.00,
          actual_cost: 350.00,
          notes: 'Hardware upgrade - RAM and SSD replacement',
          created_at: '2024-04-01T10:00:00Z',
          updated_at: '2024-05-03T16:45:00Z'
        },
        {
          _id: 'MNT_004',
          asset_id: 'AST_004',
          asset_name: 'Conference Table',
          asset_tag: 'TABLE-001',
          maintenance_type: 'Preventive',
          scheduled_date: '2024-06-01',
          completed_date: null,
          status: 'overdue',
          priority: 'medium',
          assigned_to: 'Facilities',
          estimated_cost: 75.00,
          actual_cost: null,
          notes: 'Quarterly inspection and cleaning',
          created_at: '2024-03-01T10:00:00Z',
          updated_at: '2024-03-01T10:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Asset maintenance data refreshed:', data);
      }
    }
  );

  // Mock assets data
  const { data: assetsData } = useQuery(
    'maintenanceAssets',
    () => {
      return [
        { _id: 'AST_001', asset_name: 'Laptop Pro 15"', asset_tag: 'LAPTOP-001', status: 'active' },
        { _id: 'AST_002', asset_name: 'Office Chair Ergonomic', asset_tag: 'CHAIR-001', status: 'active' },
        { _id: 'AST_003', asset_name: 'Desktop Computer', asset_tag: 'DESKTOP-001', status: 'active' },
        { _id: 'AST_004', asset_name: 'Conference Table', asset_tag: 'TABLE-001', status: 'active' }
      ];
    }
  );

  // Mutation for scheduling maintenance
  const scheduleMaintenanceMutation = useMutation(
    async (maintenanceData) => {
      const maintenance = maintenanceData || [];
      const newMaintenance = {
        ...maintenanceData,
        _id: `MNT_${Date.now()}`,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedMaintenance = [...maintenance, newMaintenance];
      localStorage.setItem('assetMaintenance', JSON.stringify(updatedMaintenance));
      queryClient.setQueryData('assetMaintenance', updatedMaintenance);
      return updatedMaintenance;
    },
    {
      onSuccess: () => {
        toast.success('Maintenance scheduled successfully');
        setShowScheduleModal(false);
        resetScheduleForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to schedule maintenance');
      }
    }
  );

  // Mutation for completing maintenance
  const completeMaintenanceMutation = useMutation(
    async (maintenanceId) => {
      const maintenance = maintenanceData || [];
      const updatedMaintenance = maintenance.map(item => 
        item._id === maintenanceId ? {
          ...item,
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        } : item
      );
      localStorage.setItem('assetMaintenance', JSON.stringify(updatedMaintenance));
      queryClient.setQueryData('assetMaintenance', updatedMaintenance);
      return updatedMaintenance;
    },
    {
      onSuccess: () => {
        toast.success('Maintenance marked as completed');
        refetch();
      },
      onError: () => {
        toast.error('Failed to complete maintenance');
      }
    }
  );

  const maintenance = maintenanceData || [];
  const assets = assetsData || [];

  const filteredMaintenance = maintenance.filter(item => {
    const matchesSearch = item.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.maintenance_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const resetScheduleForm = () => {
    setSelectedAsset(null);
    setMaintenanceType('');
    setMaintenanceDate('');
    setMaintenanceNotes('');
    setEstimatedCost('');
  };

  const openDetailsModal = (item) => {
    setSelectedMaintenance(item);
    setShowDetailsModal(true);
  };

  const handleSchedule = () => {
    if (!selectedAsset || !maintenanceType || !maintenanceDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const maintenanceData = {
      asset_id: selectedAsset._id,
      asset_name: selectedAsset.asset_name,
      asset_tag: selectedAsset.asset_tag,
      maintenance_type: maintenanceType,
      scheduled_date: maintenanceDate,
      priority: 'medium',
      assigned_to: 'Maintenance Team',
      estimated_cost: parseFloat(estimatedCost) || 0,
      notes: maintenanceNotes
    };

    scheduleMaintenanceMutation.mutate(maintenanceData);
  };

  const handleComplete = (maintenanceId) => {
    if (window.confirm('Are you sure you want to mark this maintenance as completed?')) {
      completeMaintenanceMutation.mutate(maintenanceId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Maintenance data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalMaintenance = maintenance.length;
  const scheduledMaintenance = maintenance.filter(m => m.status === 'scheduled').length;
  const completedMaintenance = maintenance.filter(m => m.status === 'completed').length;
  const overdueMaintenance = maintenance.filter(m => m.status === 'overdue').length;
  const inProgressMaintenance = maintenance.filter(m => m.status === 'in_progress').length;

  // Get upcoming maintenance (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingMaintenance = maintenance.filter(m => {
    if (m.status !== 'scheduled') return false;
    const scheduledDate = new Date(m.scheduled_date);
    return scheduledDate >= today && scheduledDate <= nextWeek;
  });

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Asset Maintenance</h1>
            <p className="page-subtitle">Maintenance schedule, service history, and repair logs</p>
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
              onClick={() => {
                resetScheduleForm();
                setShowScheduleModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Schedule Maintenance</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{totalMaintenance}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{scheduledMaintenance}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedMaintenance}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{inProgressMaintenance}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueMaintenance}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Maintenance Alert */}
      {upcomingMaintenance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Upcoming Maintenance ({upcomingMaintenance.length} items)
            </h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            {upcomingMaintenance.slice(0, 2).map(item => (
              <div key={item._id} className="flex justify-between">
                <span>{item.asset_name} - {item.maintenance_type}</span>
                <span>{item.scheduled_date}</span>
              </div>
            ))}
            {upcomingMaintenance.length > 2 && (
              <div className="text-yellow-600 font-medium">
                ... and {upcomingMaintenance.length - 2} more
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search maintenance records..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              className="input"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Maintenance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaintenance.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                filteredMaintenance.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.asset_name}</div>
                      <div className="text-xs text-gray-500">Tag: {item.asset_tag}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.maintenance_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.scheduled_date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.completed_date || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Est: ${item.estimated_cost?.toFixed(2) || '0.00'}
                      </div>
                      {item.actual_cost && (
                        <div className="text-xs text-gray-500">
                          Actual: ${item.actual_cost.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {item.status === 'scheduled' && (
                          <button
                            onClick={() => handleComplete(item._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark Complete"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Schedule Maintenance Modal */}
      {showScheduleModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowScheduleModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Maintenance</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset *</label>
                <select
                  className="input"
                  value={selectedAsset?._id || ''}
                  onChange={(e) => setSelectedAsset(assets.find(a => a._id === e.target.value))}
                  required
                >
                  <option value="">Select an asset</option>
                  {assets.map(asset => (
                    <option key={asset._id} value={asset._id}>
                      {asset.asset_name} ({asset.asset_tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                <select
                  className="input"
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Predictive">Predictive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  className="input"
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                <input
                  type="number"
                  className="input"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="input"
                  rows="3"
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  placeholder="Add maintenance notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="btn btn-primary"
                disabled={scheduleMaintenanceMutation.isLoading}
              >
                Schedule Maintenance
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Maintenance Details Modal */}
      {showDetailsModal && selectedMaintenance && (
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
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Asset</p>
                <p className="text-sm text-gray-900">{selectedMaintenance.asset_name}</p>
                <p className="text-xs text-gray-500">Tag: {selectedMaintenance.asset_tag}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="text-sm text-gray-900">{selectedMaintenance.maintenance_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Priority</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMaintenance.priority)}`}>
                    {selectedMaintenance.priority.charAt(0).toUpperCase() + selectedMaintenance.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled Date</p>
                  <p className="text-sm text-gray-900">{selectedMaintenance.scheduled_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Date</p>
                  <p className="text-sm text-gray-900">{selectedMaintenance.completed_date || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMaintenance.status)}`}>
                  {selectedMaintenance.status.charAt(0).toUpperCase() + selectedMaintenance.status.slice(1).replace('_', ' ')}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Assigned To</p>
                <p className="text-sm text-gray-900">{selectedMaintenance.assigned_to}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                  <p className="text-sm text-gray-900">${selectedMaintenance.estimated_cost?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Actual Cost</p>
                  <p className="text-sm text-gray-900">${selectedMaintenance.actual_cost?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {selectedMaintenance.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-sm text-gray-900">{selectedMaintenance.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{new Date(selectedMaintenance.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Updated</p>
                  <p className="text-sm text-gray-900">{new Date(selectedMaintenance.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {selectedMaintenance.status === 'scheduled' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleComplete(selectedMaintenance._id);
                  }}
                  className="btn btn-primary"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetMaintenance;
