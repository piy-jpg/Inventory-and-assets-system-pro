import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { alertsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  BellIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const RealTimeAlerts = ({ currentPage }) => {
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Query for real-time alerts with polling
  const { data: realTimeData, isLoading } = useQuery(
    ['realtime-alerts', currentPage],
    () => alertsAPI.getRealTimeAlerts(),
    {
      refetchInterval: 10000, // Poll every 10 seconds
      keepPreviousData: true,
    }
  );

  const alerts = realTimeData?.data?.data?.alerts || [];
  const stats = realTimeData?.data?.data?.stats || {};
  const newCount = stats.new || 0;
  const totalAlerts = alerts.length;

  // Track previous alerts to detect new ones
  const previousAlertsRef = React.useRef([]);
  
  React.useEffect(() => {
    const currentAlertIds = new Set(alerts.map(a => a._id));
    const previousAlertIds = new Set(previousAlertsRef.current.map(a => a._id));
    
    // Find new alerts (alerts that weren't in previous list)
    const newAlerts = alerts.filter(alert => !previousAlertIds.has(alert._id));
    
    // Show toast for new alerts
    if (newAlerts.length > 0) {
      const latestAlert = newAlerts[0];
      toast.custom((t) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md">
          <div className="flex-shrink-0">
            {latestAlert.severity === 'critical' ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            ) : latestAlert.severity === 'high' ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            ) : (
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{latestAlert.title}</p>
            <p className="text-sm text-gray-600">{latestAlert.message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ), { duration: 5000 });
    }
    
    // Update previous alerts ref
    previousAlertsRef.current = alerts;
  }, [alerts]);

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert._id));

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleAlertClick = (alert) => {
    // Navigate to the appropriate page based on alert module and reference
    if (alert.module === 'inventory' && alert.reference_type === 'product') {
      window.location.href = `/products?highlight=${alert.reference_id}`;
    } else if (alert.module === 'sales') {
      window.location.href = `/sell`;
    } else if (alert.module === 'purchases') {
      window.location.href = `/purchases`;
    } else if (alert.module === 'payments') {
      window.location.href = `/transactions`;
    } else {
      window.location.href = `/alerts/all`;
    }
    setShowAlertPanel(false);
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

  const getModuleIcon = (module) => {
    switch (module) {
      case 'inventory': return '📦';
      case 'sales': return '💰';
      case 'purchases': return '🛒';
      case 'assets': return '🏢';
      case 'payments': return '💳';
      case 'customers': return '👥';
      case 'suppliers': return '🏭';
      default: return '⚠️';
    }
  };

  return (
    <>
      {/* Alert Bell Button in Header */}
      <div className="relative">
        <button
          onClick={() => setShowAlertPanel(!showAlertPanel)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Real-time Alerts"
        >
          <BellIcon className="h-6 w-6 text-yellow-400" />
          {newCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              {newCount > 9 ? '9+' : newCount}
            </motion.div>
          )}
        </button>

        {/* Live Indicator */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Alert Panel */}
      <AnimatePresence>
        {showAlertPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlertPanel(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Real-time Alerts</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </div>
                    <button
                      onClick={() => setShowAlertPanel(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {totalAlerts} total • {newCount} new
                </p>
              </div>

              {/* Alert List */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading alerts...
                  </div>
                ) : activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.map((alert, index) => (
                      <motion.div
                        key={alert._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} bg-white cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => handleAlertClick(alert)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getModuleIcon(alert.module)}</span>
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                {alert.module}
                              </span>
                              {stats.new > 0 && index === 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              {alert.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                              {alert.reference_id && (
                                <span>• ID: {alert.reference_id.slice(0, 8)}...</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(alert._id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            title="Dismiss"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => window.location.href = '/alerts/all'}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Alerts →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RealTimeAlerts;
