import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  WalletIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PaymentAccounts = () => {
  const sections = [
    {
      title: 'Accounts',
      description: 'Manage your payment accounts',
      icon: WalletIcon,
      path: '/payment-accounts/accounts',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Transactions',
      description: 'View and manage transactions',
      icon: ArrowPathIcon,
      path: '/payment-accounts/transactions',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Reports',
      description: 'Generate financial reports',
      icon: ChartBarIcon,
      path: '/payment-accounts/reports',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Payment Accounts</h1>
          <p className="page-subtitle">Manage your payment accounts and transactions</p>
        </div>
      </motion.div>

      {/* Navigation Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {sections.map((section, index) => (
          <Link key={section.title} to={section.path}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${section.color} mr-4`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Go to {section.title}
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default PaymentAccounts;
