import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PrinterIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const TransactionReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    reportType: 'sales',
    period: 'month',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    emailTo: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time reports data
  const { data: reportsData, isLoading, refetch } = useQuery(
    'transactionReports',
    () => {
      const storedReports = localStorage.getItem('transactionReports');
      if (storedReports) {
        return JSON.parse(storedReports);
      }
      
      return [
        {
          _id: 'RPT_001',
          reportType: 'sales',
          reportName: 'Monthly Sales Report - April 2024',
          period: 'month',
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          format: 'pdf',
          fileSize: '2.4 MB',
          generatedBy: 'Sarah Johnson',
          generatedAt: '2024-04-23T10:30:00Z',
          status: 'completed',
          downloadCount: 12,
          summary: {
            totalSales: 45,
            totalRevenue: 12543.67,
            averageOrderValue: 278.74,
            topProduct: 'Laptop Pro 15"',
            topCustomer: 'John Smith'
          }
        },
        {
          _id: 'RPT_002',
          reportType: 'purchase',
          reportName: 'Quarterly Purchase Report - Q1 2024',
          period: 'quarter',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          format: 'excel',
          fileSize: '1.8 MB',
          generatedBy: 'Mike Wilson',
          generatedAt: '2024-04-20T14:15:00Z',
          status: 'completed',
          downloadCount: 8,
          summary: {
            totalPurchases: 23,
            totalAmount: 8765.43,
            topSupplier: 'Tech Supplies Inc.',
            averagePurchaseValue: 381.10
          }
        },
        {
          _id: 'RPT_003',
          reportType: 'profit_loss',
          reportName: 'Profit & Loss Statement - April 2024',
          period: 'month',
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          format: 'pdf',
          fileSize: '3.1 MB',
          generatedBy: 'John Smith',
          generatedAt: '2024-04-22T09:45:00Z',
          status: 'completed',
          downloadCount: 15,
          summary: {
            totalRevenue: 12543.67,
            totalExpenses: 8234.12,
            grossProfit: 4309.55,
            netProfit: 4309.55,
            profitMargin: 34.4
          }
        },
        {
          _id: 'RPT_004',
          reportType: 'daily',
          reportName: 'Daily Transaction Summary - April 23, 2024',
          period: 'day',
          startDate: '2024-04-23',
          endDate: '2024-04-23',
          format: 'pdf',
          fileSize: '856 KB',
          generatedBy: 'Sarah Johnson',
          generatedAt: '2024-04-23T18:30:00Z',
          status: 'completed',
          downloadCount: 5,
          summary: {
            totalTransactions: 28,
            totalRevenue: 3456.78,
            totalExpenses: 1234.56,
            netCashFlow: 2222.22
          }
        },
        {
          _id: 'RPT_005',
          reportType: 'customer',
          reportName: 'Customer Analysis Report - April 2024',
          period: 'month',
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          format: 'excel',
          fileSize: '1.2 MB',
          generatedBy: 'Mike Wilson',
          generatedAt: '2024-04-21T16:20:00Z',
          status: 'completed',
          downloadCount: 7,
          summary: {
            totalCustomers: 156,
            newCustomers: 23,
            repeatCustomers: 89,
            topCustomer: 'John Smith',
            averageOrderValue: 278.74
          }
        }
      ];
    },
    {
      refetchInterval: 15000, // Real-time refresh every 15 seconds
      onSuccess: (data) => {
        console.log('Transaction reports data refreshed:', data);
      }
    }
  );

  const reports = reportsData || [];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        report.generatedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.reportType === filterType;
    
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      reportType: 'sales',
      period: 'month',
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      format: 'pdf',
      includeCharts: true,
      includeDetails: true,
      emailTo: '',
      notes: ''
    });
  };

  const openPreviewModal = (report) => {
    setSelectedReport(report);
    setShowPreviewModal(true);
  };

  const handleGenerateReport = () => {
    // Simulate report generation
    toast.success('Report generation started. You will be notified when ready.');
    setShowGenerateModal(false);
    resetForm();
    
    // Simulate completion after delay
    setTimeout(() => {
      toast.success('Report generated successfully!');
      refetch();
    }, 3000);
  };

  const handleDownload = (report) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${report.reportName}.${report.format}`;
    link.click();
    toast.success(`${report.reportName} downloaded successfully`);
    
    // Update download count
    const updatedReports = reports.map(r => 
      r._id === report._id ? { ...r, downloadCount: r.downloadCount + 1 } : r
    );
    localStorage.setItem('transactionReports', JSON.stringify(updatedReports));
    queryClient.setQueryData('transactionReports', updatedReports);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Reports data refreshed');
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-purple-100 text-purple-800';
      case 'profit_loss':
        return 'bg-blue-100 text-blue-800';
      case 'daily':
        return 'bg-yellow-100 text-yellow-800';
      case 'customer':
        return 'bg-pink-100 text-pink-800';
      case 'inventory':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatColor = (format) => {
    switch (format) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'excel':
        return 'bg-green-100 text-green-800';
      case 'csv':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalReports = reports.length;
  const salesReports = reports.filter(report => report.reportType === 'sales').length;
  const purchaseReports = reports.filter(report => report.reportType === 'purchase').length;
  const profitLossReports = reports.filter(report => report.reportType === 'profit_loss').length;
  const totalDownloads = reports.reduce((sum, report) => sum + report.downloadCount, 0);
  const todayReports = reports.filter(report => {
    const reportDate = new Date(report.generatedAt).toDateString();
    const today = new Date().toDateString();
    return reportDate === today;
  }).length;

  // Report type breakdown
  const reportTypes = [
    { key: 'sales', name: 'Sales Reports', icon: ShoppingCartIcon },
    { key: 'purchase', name: 'Purchase Reports', icon: TruckIcon },
    { key: 'profit_loss', name: 'Profit & Loss', icon: ChartBarIcon },
    { key: 'daily', name: 'Daily Summary', icon: CalendarIcon },
    { key: 'customer', name: 'Customer Analysis', icon: ExclamationTriangleIcon },
    { key: 'inventory', name: 'Inventory Reports', icon: DocumentTextIcon }
  ];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Transaction Reports</h1>
            <p className="page-subtitle">Sales report, Purchase report, Profit & loss summary, Daily / monthly summaries</p>
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
            <button 
              onClick={() => {
                resetForm();
                setShowGenerateModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
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
              <ChartBarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-green-600">{totalDownloads}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowDownTrayIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Reports</p>
              <p className="text-2xl font-bold text-yellow-600">{todayReports}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">P&L Reports</p>
              <p className="text-2xl font-bold text-purple-600">{profitLossReports}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {reportTypes.map(type => {
          const count = reports.filter(report => report.reportType === type.key).length;
          return (
            <div key={type.key} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <type.icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{type.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
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
                placeholder="Search reports..."
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
              {reportTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.name}
                </option>
              ))}
            </select>
            
            <select
              className="input"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">All Periods</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
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
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.reportName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                        {reportTypes.find(type => type.key === report.reportType)?.name || report.reportType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.startDate} to {report.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(report.format)}`}>
                        {report.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.fileSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.generatedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.downloadCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openPreviewModal(report)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Preview Report"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(report)}
                          className="text-green-600 hover:text-green-900"
                          title="Download Report"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="text-purple-600 hover:text-purple-900"
                          title="Print Report"
                        >
                          <PrinterIcon className="h-4 w-4" />
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

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowGenerateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate New Report</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleGenerateReport();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                    <select
                      value={formData.reportType}
                      onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                      className="input"
                      required
                    >
                      {reportTypes.map(type => (
                        <option key={type.key} value={type.key}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                      <option value="year">Yearly</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email To</label>
                    <input
                      type="email"
                      value={formData.emailTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailTo: e.target.value }))}
                      className="input"
                      placeholder="email@example.com (optional)"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={formData.includeCharts}
                      onChange={(e) => setFormData(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeCharts" className="text-sm font-medium text-gray-700">
                      Include Charts and Graphs
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeDetails"
                      checked={formData.includeDetails}
                      onChange={(e) => setFormData(prev => ({ ...prev, includeDetails: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeDetails" className="text-sm font-medium text-gray-700">
                      Include Detailed Transaction List
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this report generation"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Report Preview Modal */}
      {showPreviewModal && selectedReport && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPreviewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Preview - {selectedReport.reportName}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-6">
              {/* Report Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.reportName}</h2>
                <p className="text-sm text-gray-600">
                  Period: {selectedReport.startDate} to {selectedReport.endDate}
                </p>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(selectedReport.generatedAt).toLocaleString()}
                </p>
              </div>

              {/* Report Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedReport.summary || {}).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {typeof value === 'number' && value > 1000 ? 
                          `$${value.toLocaleString()}` : 
                          typeof value === 'number' ? 
                          value.toFixed(2) : 
                          value
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Chart Placeholder */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Trend Analysis</h3>
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart visualization would appear here</p>
                </div>
              </div>

              {/* Sample Table Placeholder */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Data</h3>
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Detailed transaction table would appear here</p>
                </div>
              </div>

              {/* Report Footer */}
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  Generated by: {selectedReport.generatedBy}
                </p>
                <p className="text-sm text-gray-600">
                  Report ID: {selectedReport._id}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleDownload(selectedReport);
                }}
                className="btn btn-primary"
              >
                Download Report
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-outline"
              >
                Print Report
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TransactionReports;
