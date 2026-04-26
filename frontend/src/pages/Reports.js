import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ChartBarIcon,
  CubeIcon,
  BanknotesIcon,
  TruckIcon,
  ReceiptRefundIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BellIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportFormat, setExportFormat] = useState('pdf');

  const reportCategories = [
    {
      name: 'Inventory Reports',
      description: 'Stock levels, movements, and performance analysis',
      icon: CubeIcon,
      color: 'blue',
      href: '/reports/inventory',
      reports: [
        'Stock Summary',
        'Low Stock Report',
        'Out of Stock Items',
        'Stock Movement History',
        'Dead Stock Analysis'
      ]
    },
    {
      name: 'Sales Reports',
      description: 'Revenue analysis and sales performance',
      icon: BanknotesIcon,
      color: 'green',
      href: '/reports/sales',
      reports: [
        'Daily Sales',
        'Monthly Sales',
        'Product-wise Sales',
        'Category-wise Sales',
        'Profit / Loss Report'
      ]
    },
    {
      name: 'Customer Reports',
      description: 'Customer analytics and performance metrics',
      icon: UserGroupIcon,
      color: 'cyan',
      href: '/reports/customers',
      reports: [
        'Customer Overview',
        'Top Customers',
        'Due Payments',
        'Customer Ledger',
        'Customer Analytics'
      ]
    },
    {
      name: 'Supplier Reports',
      description: 'Supplier analytics and performance metrics',
      icon: TruckIcon,
      color: 'purple',
      href: '/reports/suppliers',
      reports: [
        'Supplier Overview',
        'Top Suppliers',
        'Pending Payments',
        'Purchase History',
        'Supplier Performance'
      ]
    },
    {
      name: 'Expense Reports',
      description: 'Expense tracking and analysis',
      icon: ReceiptRefundIcon,
      color: 'red',
      href: '/reports/expenses',
      reports: [
        'Expense Summary',
        'Category-wise Expenses',
        'Monthly Expense Trends'
      ]
    },
    {
      name: 'Asset Reports',
      description: 'Asset status and maintenance tracking',
      icon: BuildingOfficeIcon,
      color: 'indigo',
      href: '/reports/assets',
      reports: [
        'Asset Status Report',
        'Asset Usage Report',
        'Maintenance History',
        'Depreciation Report'
      ]
    },
    {
      name: 'Stock Transfer Reports',
      description: 'Warehouse and location transfers',
      icon: ArrowPathIcon,
      color: 'yellow',
      href: '/reports/stock-transfers',
      reports: [
        'Warehouse Transfers',
        'Transfer History',
        'Location-wise Stock'
      ]
    },
    {
      name: 'User Activity Logs',
      description: 'User actions and audit trails',
      icon: UserGroupIcon,
      color: 'cyan',
      href: '/reports/user-activity',
      reports: [
        'User Overview',
        'Active Users',
        'Login History',
        'Audit Logs',
        'Role Distribution'
      ],
      adminOnly: true
    },
    {
      name: 'Alerts & Exceptions',
      description: 'System alerts and exception reports',
      icon: BellIcon,
      color: 'orange',
      href: '/reports/alerts',
      reports: [
        'Low Stock Alerts History',
        'Failed Transactions',
        'System Warnings'
      ]
    },
    {
      name: 'Custom Reports / Export',
      description: 'Generate custom reports and export data',
      icon: DocumentTextIcon,
      color: 'gray',
      href: '/reports/custom',
      reports: [
        'Custom Date Range Reports',
        'Export as PDF',
        'Export as CSV/Excel',
        'Advanced Filtering'
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      red: 'bg-red-50 border-red-200 hover:bg-red-100',
      indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      cyan: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    };
    return colors[color] || colors.gray;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      red: 'text-red-600 bg-red-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      cyan: 'text-cyan-600 bg-cyan-100',
      orange: 'text-orange-600 bg-orange-100',
      gray: 'text-gray-600 bg-gray-100'
    };
    return colors[color] || colors.gray;
  };

  const { user } = useAuth();
  const visibleCategories = useMemo(
    () => reportCategories.filter((category) => !category.adminOnly || user?.role === 'admin'),
    [user?.role]
  );

  const handleExportAll = () => {
    const rows = [
      ['Report Category', 'Description', 'Route', 'Available Reports', 'Start Date', 'End Date', 'Format'],
      ...visibleCategories.map((category) => ([
        category.name,
        category.description,
        category.href,
        category.reports.join(' | '),
        dateRange.startDate,
        dateRange.endDate,
        exportFormat
      ]))
    ];

    const csv = rows
      .map((row) => row.map((cell) => {
        const value = String(cell ?? '');
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-reports-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Comprehensive reports and analytics for your inventory system</p>
        </div>
        <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          <SignalIcon className="mr-2 h-4 w-4" />
          Live reporting active
        </div>
      </motion.div>

      {/* Date Range and Export Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            <input
              type="date"
              className="input text-sm"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="input text-sm"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Export:</span>
            </div>
            <select
              className="input text-sm"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
            <button onClick={handleExportAll} className="btn btn-secondary text-sm flex items-center gap-2">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Export All
            </button>
          </div>
        </div>
      </motion.div>

      {/* Report Categories Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group"
            >
              <Link to={category.href}>
                <div className={`h-full rounded-lg border-2 p-5 transition-all duration-200 hover:shadow-lg ${getColorClasses(category.color)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getIconColor(category.color)}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    {category.adminOnly && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">Available Reports:</div>
                    <div className="flex flex-wrap gap-1">
                      {category.reports.slice(0, 3).map((report, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-white bg-opacity-60 rounded-full text-gray-700"
                        >
                          {report}
                        </span>
                      ))}
                      {category.reports.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-white bg-opacity-60 rounded-full text-gray-700">
                          +{category.reports.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      View Reports
                    </span>
                    <ChartBarIcon className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>

    </div>
  );
};

export default Reports;
