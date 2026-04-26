import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const queryClient = useQueryClient();

  // Real-time asset alerts data
  const { data: alertsData, isLoading, refetch } = useQuery(
    'assetAlerts',
    () => {
      const storedAlerts = localStorage.getItem('assetAlerts');
      if (storedAlerts) {
        return JSON.parse(storedAlerts);
      }
      
      return [
        {
          _id: 'ASSET_ALERT_001',
          type: 'maintenance_due',
          title: 'Maintenance Due Alert',
          message: 'Server Room AC Unit requires maintenance (last service: 2023-10-15)',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-23T10:30:00Z',
          assetId: 'ASSET_001',
          assetName: 'Server Room AC Unit',
          location: 'Server Room',
          category: 'HVAC',
          lastMaintenance: '2023-10-15',
          nextMaintenance: '2024-04-15',
          maintenanceType: 'routine',
          vendor: 'CoolTech Services',
          estimatedCost: 850,
          metadata: {
            assetTag: 'HVAC-001',
            serialNumber: 'AC-2023-001',
            warrantyExpiry: '2025-10-15',
            maintenanceInterval: '6 months',
            priority: 'medium'
          }
        },
        {
          _id: 'ASSET_ALERT_002',
          type: 'warranty_expiry',
          title: 'Warranty Expiry Alert',
          message: 'Laptops batch warranty expires in 30 days',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-23T09:15:00Z',
          assetId: 'ASSET_BATCH_001',
          assetName: 'Laptop Pro 15" Batch',
          location: 'Office Building',
          category: 'Electronics',
          lastMaintenance: null,
          nextMaintenance: null,
          maintenanceType: null,
          vendor: 'Tech Supplies Inc.',
          estimatedCost: 0,
          metadata: {
            assetCount: 25,
            warrantyExpiry: '2024-05-23',
            warrantyProvider: 'Tech Supplies Inc.',
            coverageType: 'Extended Warranty',
            replacementValue: 75000
          }
        },
        {
          _id: 'ASSET_ALERT_003',
          type: 'asset_lifecycle',
          title: 'Asset Lifecycle Alert',
          message: 'Office Desks batch has reached end of useful life (5 years)',
          severity: 'info',
          status: 'read',
          timestamp: '2024-04-22T14:20:00Z',
          assetId: 'ASSET_BATCH_002',
          assetName: 'Office Desks Batch',
          location: 'Office Building',
          category: 'Furniture',
          lastMaintenance: null,
          nextMaintenance: null,
          maintenanceType: null,
          vendor: 'Furniture Plus',
          estimatedCost: 25000,
          metadata: {
            assetCount: 50,
            purchaseDate: '2019-04-15',
            usefulLife: '5 years',
            depreciationRate: '20%',
            currentValue: 15000,
            replacementRecommended: true
          }
        },
        {
          _id: 'ASSET_ALERT_004',
          type: 'emergency_maintenance',
          title: 'Emergency Maintenance Alert',
          message: 'Production Line Conveyor Belt requires immediate repair',
          severity: 'error',
          status: 'unread',
          timestamp: '2024-04-21T11:45:00Z',
          assetId: 'ASSET_004',
          assetName: 'Production Line Conveyor Belt',
          location: 'Production Floor',
          category: 'Machinery',
          lastMaintenance: '2024-03-01',
          nextMaintenance: '2024-04-01',
          maintenanceType: 'emergency',
          vendor: 'Industrial Repairs Ltd.',
          estimatedCost: 3500,
          metadata: {
            assetTag: 'MACH-004',
            serialNumber: 'CONV-2022-001',
            downtimeImpact: 'high',
            productionLoss: 2500,
            partsRequired: ['Belt Segment', 'Motor Bearing']
          }
        },
        {
          _id: 'ASSET_ALERT_005',
          type: 'calibration_due',
          title: 'Calibration Due Alert',
          message: 'Laboratory Equipment requires quarterly calibration',
          severity: 'warning',
          status: 'read',
          timestamp: '2024-04-20T16:30:00Z',
          assetId: 'ASSET_005',
          assetName: 'Laboratory Scale',
          location: 'Laboratory',
          category: 'Equipment',
          lastMaintenance: '2024-01-20',
          nextMaintenance: '2024-04-20',
          maintenanceType: 'calibration',
          vendor: 'Precision Instruments Co.',
          estimatedCost: 450,
          metadata: {
            assetTag: 'LAB-001',
            serialNumber: 'SCALE-2023-001',
            calibrationInterval: '3 months',
            lastCalibrationDate: '2024-01-20',
            accuracyRequired: '0.01g'
          }
        },
        {
          _id: 'ASSET_ALERT_006',
          type: 'inspection_due',
          title: 'Inspection Due Alert',
          message: 'Fire Safety Systems require annual inspection',
          severity: 'error',
          status: 'resolved',
          timestamp: '2024-04-19T08:00:00Z',
          assetId: 'ASSET_006',
          assetName: 'Fire Safety Systems',
          location: 'Entire Building',
          category: 'Safety',
          lastMaintenance: '2023-04-15',
          nextMaintenance: '2024-04-15',
          maintenanceType: 'inspection',
          vendor: 'Safety First Services',
          estimatedCost: 1200,
          metadata: {
            inspectionType: 'Annual Safety Inspection',
            complianceRequired: true,
            lastInspectionDate: '2023-04-15',
            certificateExpiry: '2024-04-15',
            resolvedAt: '2024-04-19T15:30:00Z'
          }
        },
        {
          _id: 'ASSET_ALERT_007',
          type: 'performance_degradation',
          title: 'Performance Degradation Alert',
          message: 'Backup Power Generator showing 25% performance decrease',
          severity: 'warning',
          status: 'unread',
          timestamp: '2024-04-18T13:15:00Z',
          assetId: 'ASSET_007',
          assetName: 'Backup Power Generator',
          location: 'Generator Room',
          category: 'Power Systems',
          lastMaintenance: '2024-02-15',
          nextMaintenance: '2024-05-15',
          maintenanceType: 'performance',
          vendor: 'Power Systems Inc.',
          estimatedCost: 1800,
          metadata: {
            assetTag: 'POWER-001',
            serialNumber: 'GEN-2021-001',
            performanceBaseline: '100%',
            currentPerformance: '75%',
            degradationRate: '5% per month',
            criticality: 'high'
          }
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Asset alerts data refreshed:', data);
      }
    }
  );

  // Mutation for updating alert status
  const updateAlertStatusMutation = useMutation(
    async ({ alertId, status, action }) => {
      const alerts = alertsData || [];
      const updatedAlerts = alerts.map(alert => 
        alert._id === alertId ? {
          ...alert,
          status,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : alert.resolvedAt,
          actionTaken: action || alert.actionTaken
        } : alert
      );
      localStorage.setItem('assetAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('assetAlerts', updatedAlerts);
      queryClient.invalidateQueries('all-alerts-aggregated');
      return updatedAlerts;
    },
    {
      onSuccess: () => {
        toast.success('Alert status updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update alert status');
      }
    }
  );

  // Mutation for deleting alerts
  const deleteAlertMutation = useMutation(
    async (alertId) => {
      const alerts = alertsData || [];
      const updatedAlerts = alerts.filter(alert => alert._id !== alertId);
      localStorage.setItem('assetAlerts', JSON.stringify(updatedAlerts));
      queryClient.setQueryData('assetAlerts', updatedAlerts);
      queryClient.invalidateQueries('all-alerts-aggregated');
      return updatedAlerts;
    },
    {
      onSuccess: () => {
        toast.success('Alert deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete alert');
      }
    }
  );

  const alerts = alertsData || [];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const openDetailsModal = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (status, action = '') => {
    if (!selectedAlert) return;

    updateAlertStatusMutation.mutate({
      alertId: selectedAlert._id,
      status,
      action
    });
  };

  const handleDelete = (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      deleteAlertMutation.mutate(alertId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Asset alerts data refreshed');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'maintenance_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'warranty_expiry':
        return 'bg-orange-100 text-orange-800';
      case 'asset_lifecycle':
        return 'bg-blue-100 text-blue-800';
      case 'emergency_maintenance':
        return 'bg-red-100 text-red-800';
      case 'calibration_due':
        return 'bg-purple-100 text-purple-800';
      case 'inspection_due':
        return 'bg-red-100 text-red-800';
      case 'performance_degradation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceIcon = (type) => {
    switch (type) {
      case 'maintenance_due':
      case 'emergency_maintenance':
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'warranty_expiry':
      case 'asset_lifecycle':
        return <CalendarIcon className="h-4 w-4" />;
      case 'calibration_due':
      case 'inspection_due':
        return <TagIcon className="h-4 w-4" />;
      default:
        return <BuildingOfficeIcon className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (severity, type) => {
    if (type === 'emergency_maintenance') return 'text-red-600';
    if (severity === 'error') return 'text-red-600';
    if (severity === 'warning') return 'text-orange-600';
    return 'text-gray-600';
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(alert => alert.status === 'unread').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'error').length;
  const maintenanceAlerts = alerts.filter(alert => alert.type.includes('maintenance')).length;
  const warrantyAlerts = alerts.filter(alert => alert.type === 'warranty_expiry').length;
  const totalEstimatedCost = alerts
    .filter(alert => alert.status !== 'resolved')
    .reduce((sum, alert) => sum + alert.estimatedCost, 0);

  // Alert type breakdown
  const typeBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Asset Alerts</h1>
            <p className="page-subtitle">Maintenance due, Warranty expiry, Asset lifecycle alerts</p>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{unreadAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{maintenanceAlerts}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Est. Cost</p>
              <p className="text-2xl font-bold text-orange-600">${totalEstimatedCost.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6"
      >
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getMaintenanceIcon(type)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ').slice(0, 15)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

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
                placeholder="Search asset alerts..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="maintenance_due">Maintenance Due</option>
              <option value="warranty_expiry">Warranty Expiry</option>
              <option value="asset_lifecycle">Asset Lifecycle</option>
              <option value="emergency_maintenance">Emergency Maintenance</option>
              <option value="calibration_due">Calibration Due</option>
              <option value="inspection_due">Inspection Due</option>
              <option value="performance_degradation">Performance Degradation</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Alerts Table */}
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
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No asset alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.assetName}</div>
                      <div className="text-xs text-gray-500">ID: {alert.assetId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getMaintenanceIcon(alert.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                          {alert.type.replace('_', ' ').charAt(0).toUpperCase() + alert.type.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.vendor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getUrgencyColor(alert.severity, alert.type)}`}>
                        ${alert.estimatedCost.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(alert)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(alert._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Alert"
                          disabled={deleteAlertMutation.isLoading}
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

      {/* Alert Details Modal */}
      {showDetailsModal && selectedAlert && (
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
              <h3 className="text-lg font-semibold text-gray-900">Asset Alert Details</h3>
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
                  <p className="text-sm font-medium text-gray-600">Asset Name</p>
                  <p className="text-sm text-gray-900">{selectedAlert.assetName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Asset ID</p>
                  <p className="text-sm text-gray-900">{selectedAlert.assetId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{selectedAlert.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <p className="text-sm text-gray-900">{selectedAlert.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendor</p>
                  <p className="text-sm text-gray-900">{selectedAlert.vendor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                  <p className={`text-sm font-medium ${getUrgencyColor(selectedAlert.severity, selectedAlert.type)}`}>
                    ${selectedAlert.estimatedCost.toLocaleString()}
                  </p>
                </div>
                {selectedAlert.lastMaintenance && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Maintenance</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedAlert.lastMaintenance).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Next Maintenance</p>
                      <p className="text-sm text-gray-900">
                        {selectedAlert.nextMaintenance ? new Date(selectedAlert.nextMaintenance).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Alert Message</p>
                <p className="text-sm text-gray-900">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert Type</p>
                  <div className="flex items-center space-x-2">
                    {getMaintenanceIcon(selectedAlert.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedAlert.type)}`}>
                      {selectedAlert.type.replace('_', ' ').charAt(0).toUpperCase() + selectedAlert.type.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Severity</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status.charAt(0).toUpperCase() + selectedAlert.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Timestamp</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {selectedAlert.metadata && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Additional Information</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDelete(selectedAlert._id)}
                  className="btn btn-danger btn-sm"
                  disabled={deleteAlertMutation.isLoading}
                >
                  {deleteAlertMutation.isLoading ? 'Deleting...' : 'Delete Alert'}
                </button>
                {selectedAlert.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('resolved', 'Asset alert marked as resolved')}
                      className="btn btn-primary btn-sm"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('read', 'Alert marked as read')}
                      className="btn btn-secondary btn-sm"
                    >
                      Mark Read
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-outline btn-sm"
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

export default AssetAlerts;
