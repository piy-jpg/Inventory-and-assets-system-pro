import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SalesReports = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const canViewReports = ['admin', 'manager', 'staff'].includes(user?.role);
  const canGenerateReports = ['admin', 'manager'].includes(user?.role);

  // Mock reports data
  const [reports] = useState([
    {
      id: 'RPT-001',
      title: 'Monthly Sales Report',
      type: 'sales',
      period: 'April 2024',
      generatedAt: '2024-04-20T17:00:00Z',
      generatedBy: 'John Smith',
      status: 'completed',
      totalSales: 125750.50,
      totalOrders: 45,
      averageOrderValue: 2794.46,
      topProduct: 'Laptop Pro 15"',
      topCustomer: 'ABC Corporation',
      growthRate: 12.5,
      fileUrl: '/reports/monthly-sales-april-2024.pdf',
      fileSize: '2.4 MB'
    },
    {
      id: 'RPT-002',
      title: 'Sales Performance by Agent',
      type: 'performance',
      period: 'Q2 2024',
      generatedAt: '2024-04-18T14:30:00Z',
      generatedBy: 'Sarah Johnson',
      status: 'completed',
      totalSales: 458000.00,
      totalOrders: 156,
      averageOrderValue: 2935.90,
      topAgent: 'John Smith',
      topProduct: 'Office Equipment Bundle',
      growthRate: 8.3,
      fileUrl: '/reports/sales-performance-q2-2024.pdf',
      fileSize: '3.1 MB'
    },
    {
      id: 'RPT-003',
      title: 'Product Sales Analysis',
      type: 'products',
      period: 'April 2024',
      generatedAt: '2024-04-15T10:15:00Z',
      generatedBy: 'Mike Wilson',
      status: 'completed',
      totalSales: 87500.00,
      totalOrders: 67,
      averageOrderValue: 1305.97,
      topProduct: 'Laptop Pro 15"',
      topCategory: 'Electronics',
      growthRate: 15.2,
      fileUrl: '/reports/product-sales-analysis-april-2024.pdf',
      fileSize: '1.8 MB'
    },
    {
      id: 'RPT-004',
      title: 'Customer Sales Report',
      type: 'customers',
      period: 'April 2024',
      generatedAt: '2024-04-12T16:45:00Z',
      generatedBy: 'Emily Davis',
      status: 'completed',
      totalSales: 234500.75,
      totalOrders: 89,
      averageOrderValue: 2634.83,
      topCustomer: 'Tech Solutions Ltd',
      topRegion: 'West Coast',
      growthRate: 6.7,
      fileUrl: '/reports/customer-sales-april-2024.pdf',
      fileSize: '2.1 MB'
    },
    {
      id: 'RPT-005',
      title: 'Weekly Sales Summary',
      type: 'summary',
      period: 'Week 16 2024',
      generatedAt: '2024-04-22T09:00:00Z',
      generatedBy: 'John Smith',
      status: 'processing',
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProduct: 'N/A',
      topCustomer: 'N/A',
      growthRate: 0,
      fileUrl: null,
      fileSize: null
    }
  ]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = filterPeriod === 'all' || report.period.toLowerCase().includes(filterPeriod.toLowerCase());
    const matchesAgent = filterAgent === 'all' || report.generatedBy === filterAgent;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesPeriod && matchesAgent && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sales':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'performance':
        return <TrendingUpIcon className="h-4 w-4" />;
      case 'products':
        return <ShoppingCartIcon className="h-4 w-4" />;
      case 'customers':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'summary':
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const totalReports = filteredReports.length;
  const completedReports = filteredReports.filter(r => r.status === 'completed').length;
  const processingReports = filteredReports.filter(r => r.status === 'processing').length;
  const totalSalesValue = filteredReports
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.totalSales, 0);
  const averageGrowthRate = filteredReports
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.growthRate, 0) / completedReports || 0;

  const downloadReport = (report) => {
    if (report.fileUrl) {
      console.log('Downloading report:', report);
      toast.success('Report downloaded successfully!');
    } else {
      toast.error('Report not ready for download');
    }
  };

  const printReport = (report) => {
    if (report.fileUrl) {
      console.log('Printing report:', report);
      toast.success('Report sent to printer!');
    } else {
      toast.error('Report not ready for printing');
    }
  };

  const generateReport = (type) => {
    console.log('Generating report:', type);
    toast.success('Report generation started!');
  };

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Sales Reports</h1>
            <p className="page-subtitle">Generate and view sales analytics reports</p>
          </div>
          <div className="flex items-center space-x-3">
            {canGenerateReports && (
              <button className="btn btn-secondary flex items-center space-x-2">
                <ChartBarIcon className="h-4 w-4" />
                <span>Generate Report</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedReports}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">{processingReports}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Growth</p>
              <p className="text-2xl font-bold text-purple-600">{averageGrowthRate.toFixed(1)}%</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUpIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Report Generation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Generation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {canGenerateReports && (
            <button
              onClick={() => generateReport('sales')}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <ChartBarIcon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <span className="text-sm font-medium">Sales Report</span>
            </button>
          )}
          {canGenerateReports && (
            <button
              onClick={() => generateReport('performance')}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <TrendingUpIcon className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium">Performance</span>
            </button>
          )}
          {canGenerateReports && (
            <button
              onClick={() => generateReport('products')}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <ShoppingCartIcon className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">Products</span>
            </button>
          )}
          {canGenerateReports && (
            <button
              onClick={() => generateReport('customers')}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <span className="text-sm font-medium">Customers</span>
            </button>
          )}
          {canGenerateReports && (
            <button
              onClick={() => generateReport('summary')}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <DocumentTextIcon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium">Summary</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Periods</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="week">Weekly</option>
              <option value="year">Yearly</option>
            </select>
            
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Agents</option>
              <option value="John Smith">John Smith</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Mike Wilson">Mike Wilson</option>
              <option value="Emily Davis">Emily Davis</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reports Table */}
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
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
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
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-400">
                          {getTypeIcon(report.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                          <div className="text-xs text-gray-500">{report.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.period}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.generatedBy}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>${report.totalSales.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{report.totalOrders} orders</div>
                        <div className="text-xs text-gray-500">Avg: ${report.averageOrderValue.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {report.growthRate >= 0 ? (
                          <TrendingUpIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDownIcon className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          report.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {report.growthRate >= 0 ? '+' : ''}{report.growthRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        {report.fileUrl && (
                          <>
                            <button
                              onClick={() => downloadReport(report)}
                              className="text-green-600 hover:text-green-900"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => printReport(report)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Print"
                            >
                              <PrinterIcon className="h-4 w-4" />
                            </button>
                          </>
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

      {/* Report Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Laptop Pro 15"</span>
              <span className="text-sm font-medium text-gray-900">$45,750</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Office Equipment Bundle</span>
              <span className="text-sm font-medium text-gray-900">$32,100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Wireless Mouse</span>
              <span className="text-sm font-medium text-gray-900">$18,500</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">ABC Corporation</span>
              <span className="text-sm font-medium text-gray-900">$125,750</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Tech Solutions Ltd</span>
              <span className="text-sm font-medium text-gray-900">$98,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">XYZ Retail Store</span>
              <span className="text-sm font-medium text-gray-900">$76,250</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SalesReports;
