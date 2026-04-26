import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetReports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const queryClient = useQueryClient();

  // Mock assets data for reports
  const { data: assetsData, isLoading, refetch } = useQuery(
    'assetsForReports',
    () => {
      return [
        {
          _id: 'AST_001',
          asset_name: 'Laptop Pro 15"',
          asset_tag: 'LAPTOP-001',
          category: 'Electronics',
          type: 'Computer',
          status: 'active',
          location: 'Main Office',
          assigned_to: { user_id: { firstName: 'John', lastName: 'Smith' } },
          purchase_date: '2023-01-15',
          purchase_cost: 1299.99,
          current_value: 974.99,
          depreciation_rate: 20,
          condition: 'Good',
          manufacturer: 'TechBrand',
          model: 'Pro 15"'
        },
        {
          _id: 'AST_002',
          asset_name: 'Office Chair Ergonomic',
          asset_tag: 'CHAIR-001',
          category: 'Furniture',
          type: 'Seating',
          status: 'active',
          location: 'Main Office',
          assigned_to: { user_id: { firstName: 'Sarah', lastName: 'Johnson' } },
          purchase_date: '2023-02-20',
          purchase_cost: 399.99,
          current_value: 319.99,
          depreciation_rate: 10,
          condition: 'Excellent',
          manufacturer: 'ComfortSeating',
          model: 'Ergo-Pro'
        },
        {
          _id: 'AST_003',
          asset_name: 'Desktop Computer',
          asset_tag: 'DESKTOP-001',
          category: 'Electronics',
          type: 'Computer',
          status: 'maintenance',
          location: 'IT Department',
          assigned_to: null,
          purchase_date: '2022-08-10',
          purchase_cost: 899.99,
          current_value: 539.99,
          depreciation_rate: 25,
          condition: 'Fair',
          manufacturer: 'TechBrand',
          model: 'Desktop Pro'
        },
        {
          _id: 'AST_004',
          asset_name: 'Conference Table',
          asset_tag: 'TABLE-001',
          category: 'Furniture',
          type: 'Table',
          status: 'inactive',
          location: 'Storage',
          assigned_to: null,
          purchase_date: '2022-05-15',
          purchase_cost: 1599.99,
          current_value: 1279.99,
          depreciation_rate: 8,
          condition: 'Good',
          manufacturer: 'OfficeFurn',
          model: 'Conference-8'
        }
      ];
    },
    {
      refetchInterval: 12000, // Real-time refresh every 12 seconds
      onSuccess: (data) => {
        console.log('Assets for reports data refreshed:', data);
      }
    }
  );

  const assets = assetsData || [];

  const reportTypes = [
    {
      id: 'usage',
      name: 'Asset Usage Report',
      description: 'Comprehensive report on asset utilization and assignment patterns',
      icon: CubeIcon,
      fields: ['asset_name', 'status', 'location', 'assigned_to', 'purchase_date', 'condition']
    },
    {
      id: 'depreciation',
      name: 'Depreciation Report',
      description: 'Detailed depreciation analysis and value tracking over time',
      icon: ArrowTrendingDownIcon,
      fields: ['asset_name', 'purchase_cost', 'current_value', 'depreciation_rate', 'purchase_date']
    },
    {
      id: 'audit',
      name: 'Asset Audit Report',
      description: 'Complete asset audit with location verification and condition assessment',
      icon: ExclamationTriangleIcon,
      fields: ['asset_name', 'location', 'condition', 'status', 'assigned_to', 'manufacturer', 'model']
    },
    {
      id: 'valuation',
      name: 'Asset Valuation Report',
      description: 'Current market value assessment and asset worth analysis',
      icon: CurrencyDollarIcon,
      fields: ['asset_name', 'purchase_cost', 'current_value', 'category', 'type', 'condition']
    },
    {
      id: 'assignment',
      name: 'Asset Assignment Report',
      description: 'Employee asset assignments and responsibility tracking',
      icon: UserGroupIcon,
      fields: ['asset_name', 'assigned_to', 'location', 'status', 'assignment_date']
    },
    {
      id: 'location',
      name: 'Asset Location Report',
      description: 'Asset distribution across different locations and facilities',
      icon: MapPinIcon,
      fields: ['asset_name', 'location', 'status', 'category', 'condition']
    }
  ];

  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }

    const reportType = reportTypes.find(r => r.id === selectedReport);
    const reportData = {
      type: reportType,
      dateRange: dateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      assets: assets,
      generatedAt: new Date().toISOString(),
      totalAssets: assets.length,
      totalValue: assets.reduce((sum, asset) => sum + asset.current_value, 0)
    };

    setPreviewData(reportData);
    setShowPreviewModal(true);
  };

  const handleDownload = () => {
    if (!previewData) return;

    // Simulate report generation and download
    const reportContent = generateReportContent(previewData);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewData.type.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`${previewData.type.name} downloaded successfully`);
    setShowPreviewModal(false);
  };

  const generateReportContent = (data) => {
    let content = `${data.type.name}\n`;
    content += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    content += `Date Range: ${data.dateRange}\n`;
    content += `Total Assets: ${data.totalAssets}\n`;
    content += `Total Value: $${data.totalValue.toFixed(2)}\n\n`;

    content += `${'='.repeat(50)}\n`;
    content += `ASSET DETAILS\n`;
    content += `${'='.repeat(50)}\n\n`;

    data.assets.forEach(asset => {
      content += `Asset: ${asset.asset_name}\n`;
      content += `Tag: ${asset.asset_tag}\n`;
      content += `Category: ${asset.category}\n`;
      content += `Type: ${asset.type}\n`;
      content += `Status: ${asset.status}\n`;
      content += `Location: ${asset.location}\n`;
      content += `Assigned To: ${asset.assigned_to ? 
        `${asset.assigned_to.user_id.firstName} ${asset.assigned_to.user_id.lastName}` : 
        'Unassigned'}\n`;
      content += `Purchase Date: ${asset.purchase_date}\n`;
      content += `Purchase Cost: $${asset.purchase_cost.toFixed(2)}\n`;
      content += `Current Value: $${asset.current_value.toFixed(2)}\n`;
      content += `Depreciation Rate: ${asset.depreciation_rate}%\n`;
      content += `Condition: ${asset.condition}\n`;
      content += `Manufacturer: ${asset.manufacturer}\n`;
      content += `Model: ${asset.model}\n`;
      content += `${'-'.repeat(30)}\n`;
    });

    return content;
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Report data refreshed');
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
            <h1 className="page-title">Asset Reports</h1>
            <p className="page-subtitle">Generate comprehensive asset reports and analysis</p>
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
          </div>
        </div>
      </motion.div>

      {/* Report Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedReport === report.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedReport === report.id ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <report.icon className={`h-5 w-5 ${
                    selectedReport === report.id ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600">{report.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Report Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="input"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="input"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              className="input"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="word">Word</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleGenerateReport}
            className="btn btn-primary flex items-center space-x-2"
            disabled={!selectedReport}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </motion.div>

      {/* Report Preview Modal */}
      {showPreviewModal && previewData && (
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
              <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Report Type:</span> {previewData.type.name}
                </div>
                <div>
                  <span className="font-medium">Generated:</span> {new Date(previewData.generatedAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Date Range:</span> {previewData.dateRange}
                </div>
                <div>
                  <span className="font-medium">Total Assets:</span> {previewData.totalAssets}
                </div>
                <div>
                  <span className="font-medium">Total Value:</span> ${previewData.totalValue.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {selectedFormat.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Report Content Preview</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
                {generateReportContent(previewData)}
              </pre>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-primary flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetReports;
