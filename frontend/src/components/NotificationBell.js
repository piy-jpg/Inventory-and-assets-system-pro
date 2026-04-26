import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { alertsAPI } from '../services/api';
import { useQuery } from 'react-query';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: activeCount } = useQuery(
    'alerts-navbar-stats',
    alertsAPI.getAlertStats,
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    }
  );

  const { data: alertsData } = useQuery(
    'alerts-navbar-feed',
    () => alertsAPI.getAll({ limit: 5, status: 'active' }),
    {
      enabled: isOpen,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    }
  );

  const handleAlertClick = async (alert) => {
    try {
      await alertsAPI.acknowledge(alert._id);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <BellIcon className="h-6 w-6" />
        {(activeCount?.data?.data?.active || 0) > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {(alertsData?.data?.data?.alerts || []).length > 0 ? (
                (alertsData?.data?.data?.alerts || []).slice(0, 5).map((alert) => (
                  <motion.div
                    key={alert._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(alert.timestamps.created).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No active alerts
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                onClick={() => window.location.href = '/alerts'}
              >
                View all alerts
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
