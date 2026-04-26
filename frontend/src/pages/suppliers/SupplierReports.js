import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
  BuildingOfficeIcon,
  PrinterIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { suppliersAPI, purchasesAPI } from '../../services/api';

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

const SupplierReports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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

  // Real-time supplier data
  const { data: suppliersData, isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery(
    ['supplier-reports-data', dateRange],
    async () => {
      const [suppliersRes, purchasesRes] = await Promise.all([
        suppliersAPI.getSuppliers({ limit: 100 }),
        purchasesAPI.getAll({ limit: 100 })
      ]);
      
      const suppliers = suppliersRes?.data?.data?.suppliers || suppliersRes?.data?.data || [];
      const purchases = purchasesRes?.data?.data?.purchases || purchasesRes?.data?.data || [];
      
      // Calculate supplier analytics
      const supplierAnalytics = suppliers.map(supplier => {
        const supplierPurchases = purchases.filter(purchase => 
          purchase.supplier_id === supplier._id || 
          purchase.supplier === supplier.name
        );
        
        const totalPurchased = supplierPurchases.reduce((sum, purchase) => sum + (purchase.total_amount || purchase.total || 0), 0);
        const avgOrderValue = supplierPurchases.length > 0 ? totalPurchased / supplierPurchases.length : 0;
        const totalOrders = supplierPurchases.length;
        const lastPurchase = supplierPurchases.length > 0 
          ? new Date(Math.max(...supplierPurchases.map(p => new Date(p.purchase_date || p.date))))
          : null;
        
        return {
          ...supplier,
          metrics: {
            totalPurchased,
            totalOrders,
            avgOrderValue,
            lastPurchaseDate: lastPurchase?.toISOString(),
            outstandingBalance: supplier.outstanding_balance || 0
          }
        };
      });

      // Calculate summary statistics
      const totalSuppliers = suppliers.length;
      const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
      const totalPurchases = supplierAnalytics.reduce((sum, s) => sum + s.metrics.totalPurchased, 0);
      const totalOutstanding = supplierAnalytics.reduce((sum, s) => sum + s.metrics.outstandingBalance, 0);
      const avgSupplierValue = totalSuppliers > 0 ? totalPurchases / totalSuppliers : 0;
      
      // Top suppliers by purchase volume
      const topSuppliers = [...supplierAnalytics]
        .sort((a, b) => b.metrics.totalPurchased - a.metrics.totalPurchased)
        .slice(0, 10);
      
      // Suppliers with pending payments
      const pendingPaymentSuppliers = supplierAnalytics
        .filter(s => s.metrics.outstandingBalance > 0)
        .sort((a, b) => b.metrics.outstandingBalance - a.metrics.outstandingBalance);

      return {
        suppliers: supplierAnalytics,
        summary: {
          totalSuppliers,
          activeSuppliers,
          totalPurchases,
          totalOutstanding,
          avgSupplierValue,
          topSuppliersCount: topSuppliers.length,
          pendingPaymentsCount: pendingPaymentSuppliers.length
        },
        topSuppliers,
        pendingPaymentSuppliers
      };
    },
    {
      refetchInterval: LIVE_INTERVAL
    }
  );

  const data = suppliersData?.data || suppliersData;
  const summary = data?.summary || {};
  const suppliers = data?.suppliers || [];
  const topSuppliers = data?.topSuppliers || [];
  const pendingPaymentSuppliers = data?.pendingPaymentSuppliers || [];

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon, description: 'Supplier summary and key metrics' },
    { id: 'top-suppliers', name: 'Top Suppliers', icon: TruckIcon, description: 'Highest volume suppliers' },
    { id: 'pending-payments', name: 'Pending Payments', icon: ExclamationTriangleIcon, description: 'Suppliers with outstanding balances' },
    { id: 'purchase-history', name: 'Purchase History', icon: ShoppingCartIcon, description: 'Detailed purchase records' },
    { id: 'performance', name: 'Performance', icon: BuildingOfficeIcon, description: 'Supplier performance metrics' }
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
          ['Total Suppliers', summary.totalSuppliers || 0],
          ['Active Suppliers', summary.activeSuppliers || 0],
          ['Total Purchases', currency(summary.totalPurchases || 0)],
          ['Total Outstanding', currency(summary.totalOutstanding || 0)],
          ['Average Supplier Value', currency(summary.avgSupplierValue || 0)]
        ];
        filename = 'supplier-overview-report';
        break;
      case 'top-suppliers':
        exportData = [
          ['Supplier', 'Company', 'Total Purchased', 'Total Orders', 'Avg Order Value', 'Status'],
          ...topSuppliers.map(s => [
            s.name,
            s.company_name || 'N/A',
            currency(s.metrics.totalPurchased),
            s.metrics.totalOrders,
            currency(s.metrics.avgOrderValue),
            s.status
          ])
        ];
        filename = 'top-suppliers-report';
        break;
      case 'pending-payments':
        exportData = [
          ['Supplier', 'Company', 'Outstanding Balance', 'Total Orders', 'Last Purchase', 'Status'],
          ...pendingPaymentSuppliers.map(s => [
            s.name,
            s.company_name || 'N/A',
            currency(s.metrics.outstandingBalance),
            s.metrics.totalOrders,
            formatDate(s.metrics.lastPurchaseDate),
            s.status
          ])
        ];
        filename = 'pending-payments-report';
        break;
      default:
        exportData = [['No data available for this report']];
        filename = 'supplier-report';
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
      label: 'Total Suppliers',
      value: summary.totalSuppliers || 0,
      icon: BuildingOfficeIcon,
      color: 'blue',
      change: '+3%',
      positive: true
    },
    {
      label: 'Active Suppliers',
      value: summary.activeSuppliers || 0,
      icon: TruckIcon,
      color: 'green',
      change: '+2%',
      positive: true
    },
    {
      label: 'Total Purchases',
      value: currency(summary.totalPurchases || 0),
      icon: CurrencyDollarIcon,
      color: 'purple',
      change: '+15%',
      positive: true
    },
    {
      label: 'Pending Payments',
      value: currency(summary.totalOutstanding || 0),
      icon: ExclamationTriangleIcon,
      color: 'red',
      change: '-5%',
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
          <h1 className="page-title">Supplier Reports</h1>
          <p className="page-subtitle">Comprehensive supplier analytics and performance reports</p>
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
              onClick={() => refetchSuppliers()}
              className="btn btn-secondary text-sm flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${suppliersLoading ? 'animate-spin' : ''}`} />
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Overview</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Supplier Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="text-sm font-medium">{summary.activeSuppliers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inactive</span>
                    <span className="text-sm font-medium">{(summary.totalSuppliers || 0) - (summary.activeSuppliers || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">With Pending Payments</span>
                    <span className="text-sm font-medium">{summary.pendingPaymentsCount || 0}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Purchase Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Purchases</span>
                    <span className="text-sm font-medium">{currency(summary.totalPurchases || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Supplier Value</span>
                    <span className="text-sm font-medium">{currency(summary.avgSupplierValue || 0)}</span>
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

        {selectedReport === 'top-suppliers' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Suppliers by Purchase Volume</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Total Purchased</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Avg Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No supplier data available
                      </td>
                    </tr>
                  ) : topSuppliers.map((supplier, index) => (
                    <tr key={supplier._id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{supplier.company_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{currency(supplier.metrics.totalPurchased)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{supplier.metrics.totalOrders}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{currency(supplier.metrics.avgOrderValue)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {supplier.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'pending-payments' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suppliers with Pending Payments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Outstanding</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Last Purchase</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingPaymentSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No pending payments found
                      </td>
                    </tr>
                  ) : pendingPaymentSuppliers.map((supplier, index) => (
                    <tr key={supplier._id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{supplier.company_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">{currency(supplier.metrics.outstandingBalance)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{supplier.metrics.totalOrders}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(supplier.metrics.lastPurchaseDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {supplier.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'purchase-history' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h3>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Detailed purchase history view</p>
              <p className="text-sm text-gray-500 mt-2">Navigate to Purchases page for detailed transaction history</p>
              <button className="btn btn-primary mt-4">Go to Purchases</button>
            </div>
          </div>
        )}

        {selectedReport === 'performance' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance</h3>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Advanced supplier performance analytics</p>
              <p className="text-sm text-gray-500 mt-2">Navigate to Suppliers page for detailed performance metrics</p>
              <button className="btn btn-primary mt-4">Go to Suppliers</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SupplierReports;
