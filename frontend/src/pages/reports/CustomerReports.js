import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from 'react-query';
import {
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { customersAPI, salesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const LIVE_INTERVAL = 15000;

const currency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

const CustomerReports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [exportFormat, setExportFormat] = useState('pdf');
  const queryClient = useQueryClient();

  // Role-based access control
  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'viewer';
  };

  const userRole = getUserRole();

  const hasPermission = (action) => {
    const permissions = {
      admin: ['view', 'create', 'delete', 'export', 'manage_settings'],
      manager: ['view', 'create', 'delete', 'export'],
      staff: ['view', 'create', 'export'],
      viewer: ['view']
    };
    return permissions[userRole]?.includes(action) || false;
  };

  // Real-time customer data
  const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers } = useQuery(
    ['customer-reports-data', dateRange],
    async () => {
      const [customersRes, salesRes] = await Promise.all([
        customersAPI.getAll({ limit: 100 }),
        salesAPI.getAll({ limit: 100 })
      ]);
      
      const customers = customersRes?.data?.data?.customers || customersRes?.data?.data || [];
      const sales = salesRes?.data?.data?.sales || salesRes?.data?.data || [];
      
      // Calculate customer analytics
      const customerAnalytics = customers.map(customer => {
        const customerSales = sales.filter(sale => 
          sale.customer_name === customer.name || 
          sale.customer === customer.name
        );
        
        const totalSpent = customerSales.reduce((sum, sale) => sum + (sale.total_amount || sale.total || 0), 0);
        const avgOrderValue = customerSales.length > 0 ? totalSpent / customerSales.length : 0;
        const lastPurchase = customerSales.length > 0 
          ? new Date(Math.max(...customerSales.map(s => new Date(s.sale_date || s.date))))
          : null;
        
        return {
          ...customer,
          metrics: {
            totalSpent,
            totalOrders: customerSales.length,
            avgOrderValue,
            lastPurchaseDate: lastPurchase?.toISOString(),
            outstandingBalance: customer.outstanding_balance || customer.metrics?.outstandingBalance || 0
          }
        };
      });

      // Calculate summary statistics
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.status === 'active').length;
      const totalRevenue = customerAnalytics.reduce((sum, c) => sum + c.metrics.totalSpent, 0);
      const totalOutstanding = customerAnalytics.reduce((sum, c) => sum + c.metrics.outstandingBalance, 0);
      const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
      
      // Top customers by spending
      const topCustomers = [...customerAnalytics]
        .sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent)
        .slice(0, 10);
      
      // Customers with due payments
      const duePaymentCustomers = customerAnalytics
        .filter(c => c.metrics.outstandingBalance > 0)
        .sort((a, b) => b.metrics.outstandingBalance - a.metrics.outstandingBalance);

      return {
        customers: customerAnalytics,
        summary: {
          totalCustomers,
          activeCustomers,
          totalRevenue,
          totalOutstanding,
          avgCustomerValue,
          topCustomersCount: topCustomers.length,
          duePaymentsCount: duePaymentCustomers.length
        },
        topCustomers,
        duePaymentCustomers
      };
    },
    {
      refetchInterval: LIVE_INTERVAL
    }
  );

  const data = customersData?.data || customersData;
  const summary = data?.summary || {};
  const customers = data?.customers || [];
  const topCustomers = data?.topCustomers || [];
  const duePaymentCustomers = data?.duePaymentCustomers || [];

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon, description: 'Customer summary and key metrics' },
    { id: 'top-customers', name: 'Top Customers', icon: ArrowTrendingUpIcon, description: 'Highest spending customers' },
    { id: 'due-payments', name: 'Due Payments', icon: ExclamationTriangleIcon, description: 'Customers with outstanding balances' },
    { id: 'customer-ledger', name: 'Customer Ledger', icon: DocumentTextIcon, description: 'Detailed transaction history' },
    { id: 'analytics', name: 'Analytics', icon: CurrencyDollarIcon, description: 'Customer behavior analysis' }
  ];

  const handleExport = () => {
    if (!hasPermission('export')) {
      toast.error('You do not have permission to export reports');
      return;
    }

    let exportData = [];
    let filename = '';

    switch (selectedReport) {
      case 'overview':
        exportData = [
          ['Metric', 'Value'],
          ['Total Customers', summary.totalCustomers || 0],
          ['Active Customers', summary.activeCustomers || 0],
          ['Total Revenue', currency(summary.totalRevenue || 0)],
          ['Total Outstanding', currency(summary.totalOutstanding || 0)],
          ['Average Customer Value', currency(summary.avgCustomerValue || 0)]
        ];
        filename = 'customer-overview-report';
        break;
      case 'top-customers':
        exportData = [
          ['Customer', 'Group', 'Total Spent', 'Total Orders', 'Avg Order Value', 'Status'],
          ...topCustomers.map(c => [
            c.name,
            c.group || 'N/A',
            currency(c.metrics.totalSpent),
            c.metrics.totalOrders,
            currency(c.metrics.avgOrderValue),
            c.status
          ])
        ];
        filename = 'top-customers-report';
        break;
      case 'due-payments':
        exportData = [
          ['Customer', 'Group', 'Outstanding Balance', 'Total Orders', 'Last Purchase', 'Status'],
          ...duePaymentCustomers.map(c => [
            c.name,
            c.group || 'N/A',
            currency(c.metrics.outstandingBalance),
            c.metrics.totalOrders,
            formatDate(c.metrics.lastPurchaseDate),
            c.status
          ])
        ];
        filename = 'due-payments-report';
        break;
      default:
        exportData = [['No data available for this report']];
        filename = 'customer-report';
    }

    const csv = exportData
      .map(row => row.map(cell => {
        const value = String(cell ?? '');
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  const statsCards = [
    {
      label: 'Total Customers',
      value: summary.totalCustomers || 0,
      icon: UserGroupIcon,
      color: 'blue',
      change: '+5%',
      positive: true
    },
    {
      label: 'Active Customers',
      value: summary.activeCustomers || 0,
      icon: ArrowTrendingUpIcon,
      color: 'green',
      change: '+3%',
      positive: true
    },
    {
      label: 'Total Revenue',
      value: currency(summary.totalRevenue || 0),
      icon: CurrencyDollarIcon,
      color: 'purple',
      change: '+12%',
      positive: true
    },
    {
      label: 'Due Payments',
      value: currency(summary.totalOutstanding || 0),
      icon: ExclamationTriangleIcon,
      color: 'red',
      change: '-8%',
      positive: true
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    };
    return colors[color] || colors.blue;
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
          <h1 className="page-title">Customer Reports</h1>
          <p className="page-subtitle">Comprehensive customer analytics and performance reports</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <ClockIcon className="mr-2 h-4 w-4" />
            Auto-refresh every 15s
          </span>
          {hasPermission('export') && (
            <button
              onClick={handleExport}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </motion.div>

      {/* Date Range and Report Type Controls */}
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
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Report Type:</span>
            </div>
            <select
              className="input text-sm"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              {reportTypes.map(report => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
            <button
              onClick={() => refetchCustomers()}
              className="btn btn-secondary text-sm flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${customersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="section-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.change && (
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last period
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Report Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-5"
      >
        {reportTypes.map((report, index) => (
          <motion.button
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedReport === report.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <report.icon className={`h-6 w-6 mb-2 ${selectedReport === report.id ? 'text-blue-600' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${selectedReport === report.id ? 'text-blue-900' : 'text-gray-700'}`}>
              {report.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{report.description}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="section-card"
      >
        {selectedReport === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Overview</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Customer Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="text-sm font-medium">{summary.activeCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inactive</span>
                    <span className="text-sm font-medium">{(summary.totalCustomers || 0) - (summary.activeCustomers || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">With Due Payments</span>
                    <span className="text-sm font-medium">{summary.duePaymentsCount || 0}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Revenue Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="text-sm font-medium">{currency(summary.totalRevenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Customer Value</span>
                    <span className="text-sm font-medium">{currency(summary.avgCustomerValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Outstanding Balance</span>
                    <span className="text-sm font-medium text-red-600">{currency(summary.totalOutstanding || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'top-customers' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Customers by Revenue</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Group</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Total Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Avg Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No customer data available
                      </td>
                    </tr>
                  ) : topCustomers.map((customer, index) => (
                    <tr key={customer._id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.group || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{currency(customer.metrics.totalSpent)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.metrics.totalOrders}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{currency(customer.metrics.avgOrderValue)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'due-payments' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers with Due Payments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Group</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Outstanding</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Last Purchase</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {duePaymentCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No due payments found
                      </td>
                    </tr>
                  ) : duePaymentCustomers.map((customer, index) => (
                    <tr key={customer._id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.group || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">{currency(customer.metrics.outstandingBalance)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.metrics.totalOrders}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(customer.metrics.lastPurchaseDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'customer-ledger' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Ledger</h3>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Detailed customer ledger view</p>
              <p className="text-sm text-gray-500 mt-2">Navigate to Customer Ledger page for detailed transaction history</p>
              <button className="btn btn-primary mt-4">Go to Customer Ledger</button>
            </div>
          </div>
        )}

        {selectedReport === 'analytics' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Advanced customer behavior analytics</p>
              <p className="text-sm text-gray-500 mt-2">Navigate to Customer Analytics page for detailed insights</p>
              <button className="btn btn-primary mt-4">Go to Customer Analytics</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CustomerReports;
