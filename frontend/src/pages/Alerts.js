import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { alertsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Alerts = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', severity: '', status: '' });
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: alertsData, isLoading } = useQuery(
    ['alerts', { search, ...filter, page }],
    () => alertsAPI.getAll({ search, ...filter, page }),
    {
      refetchInterval: 10000, // 10 seconds for faster real-time updates
      keepPreviousData: true,
      onSuccess: (data) => {
        console.log('Alerts data loaded:', data);
        console.log('Alerts array:', data?.data?.data?.alerts);
        console.log('Alerts count:', data?.data?.data?.alerts?.length);
      },
      onError: (error) => {
        console.error('Error loading alerts:', error);
      }
    }
  );

  // Additional real-time alerts query for new alerts
  const { data: realTimeData } = useQuery(
    ['realtime-alerts'],
    () => alertsAPI.getRealTimeAlerts(),
    {
      refetchInterval: 8000, // 8 seconds for real-time alert generation
      keepPreviousData: true,
      onSuccess: (data) => {
        console.log('Real-time alerts data:', data);
        if (data?.data?.success && data?.data?.data?.new > 0) {
          // Show toast notification for new alerts
          toast.success(`${data.data.data.new} new alert(s) generated!`);
        }
      }
    }
  );

  const acknowledgeMutation = useMutation(alertsAPI.acknowledge, {
    onSuccess: () => {
      toast.success('Alert acknowledged successfully');
      queryClient.invalidateQueries('alerts');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to acknowledge alert');
    },
  });

  const resolveMutation = useMutation(alertsAPI.resolve, {
    onSuccess: () => {
      toast.success('Alert resolved successfully');
      queryClient.invalidateQueries('alerts');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to resolve alert');
    },
  });

  const handleAcknowledge = (id) => {
    acknowledgeMutation.mutate(id);
  };

  const handleResolve = (id) => {
    resolveMutation.mutate(id);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (alert_type) => {
    switch (alert_type) {
      case 'low_stock':
      case 'out_of_stock':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'maintenance_due':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'security':
      case 'system_error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'new_order':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'payment_due':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const alerts = alertsData?.data?.alerts || [];
  const pagination = alertsData?.data?.pagination || {};

  console.log('Alerts to render:', alerts);
  console.log('Alerts length:', alerts.length);
  console.log('Alerts data structure:', alertsData);

  // Fallback: If no alerts from API, show sample alerts
  const displayAlerts = alerts.length > 0 ? alerts : [
    {
      _id: 'SAMPLE_001',
      alert_id: 'SAMPLE_001',
      title: 'Sample Critical Alert',
      message: 'This is a sample critical alert for demonstration purposes.',
      alert_type: 'system_error',
      severity: 'critical',
      module: 'system',
      reference_id: 'SYS_SAMPLE_001',
      reference_type: 'system',
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
      real_time: false
    },
    {
      _id: 'SAMPLE_002',
      alert_id: 'SAMPLE_002',
      title: 'Sample Warning Alert',
      message: 'This is a sample warning alert for demonstration purposes.',
      alert_type: 'low_stock',
      severity: 'warning',
      module: 'inventory',
      reference_id: 'INV_SAMPLE_001',
      reference_type: 'product',
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
      real_time: false
    },
    {
      _id: 'SAMPLE_003',
      alert_id: 'SAMPLE_003',
      title: 'Sample Info Alert',
      message: 'This is a sample info alert for demonstration purposes.',
      alert_type: 'new_order',
      severity: 'info',
      module: 'sales',
      reference_id: 'SALE_SAMPLE_001',
      reference_type: 'order',
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
      real_time: false
    }
  ];

  const finalAlerts = alerts.length > 0 ? alerts : displayAlerts;
  console.log('Final alerts to display:', finalAlerts);

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Alerts</h1>
            <p className="page-subtitle">Monitor and manage system alerts</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Live</span>
            </div>
            {realTimeData?.data?.success && (
              <div className="text-sm text-gray-600">
                Last update: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Real-time Statistics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{finalAlerts.length}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-red-600">
                {finalAlerts.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-800">
                {finalAlerts.filter(a => a.severity === 'critical').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-800" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {finalAlerts.filter(a => a.status === 'resolved').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-card"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="maintenance_due">Maintenance Due</option>
              <option value="security_breach">Security Breach</option>
              <option value="fraud_detection">Fraud Detection</option>
            </select>
            
            <select
              className="input"
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              className="input"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="space-y-4">
            {finalAlerts.map((alert, index) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-l-4 ${getSeverityColor(alert.severity)} p-4 rounded-r-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {alert.real_time && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 animate-pulse">
                            NEW
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity?.toUpperCase() || 'INFO'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {alert.module?.replace('_', ' ').toUpperCase() || 'SYSTEM'}
                        </span>
                        {alert.real_time && (
                          <span className="text-xs text-green-600 font-medium">
                            Just now
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{alert.title || 'Alert'}</h3>
                      <p className="text-sm text-gray-600 mb-2">{alert.message || 'No message available'}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {alert._id || alert.alert_id || 'N/A'}</span>
                        <span>Type: {alert.alert_type?.replace('_', ' ') || 'unknown'}</span>
                        <span>Created: {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Unknown'}</span>
                        {alert.reference_id && (
                          <span>Reference: {alert.reference_id}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert._id)}
                          disabled={acknowledgeMutation.isLoading}
                          className="btn btn-secondary text-xs px-3 py-1"
                          title="Acknowledge"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResolve(alert._id)}
                          disabled={resolveMutation.isLoading}
                          className="btn btn-success text-xs px-3 py-1"
                          title="Resolve"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {finalAlerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No alerts found
              </div>
            )}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Alerts;
