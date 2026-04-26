import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MobileDashboard = () => {
  const stats = [
    { title: 'Total Items', value: '10', color: 'blue' },
    { title: 'Low Stock', value: '2', color: 'amber' },
    { title: 'Revenue', value: '$7,699', color: 'green' },
    { title: 'Sales', value: '45', color: 'purple' },
  ];

  const quickActions = [
    { title: 'Add Product', link: '/inventory/create' },
    { title: 'New Sale', link: '/sell' },
    { title: 'View Reports', link: '/reports' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Mobile View</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="text-center">
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 mx-auto mb-3`}>
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>
                    {stat.value}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  to={action.link}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-900 font-medium">{action.title}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop View Link */}
        <div className="text-center">
          <Link
            to="/dashboard/desktop"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Switch to Desktop View
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileDashboard;
