import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { assetsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import AssetForm from '../components/AssetForm';

const Assets = ({ initialShowForm = false }) => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', status: '', type: '' });
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingAsset, setEditingAsset] = useState(null);
  const [page, setPage] = useState(1);
  const [showReports, setShowReports] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  const { data: assetsData, isLoading, refetch } = useQuery(
    ['assets', { search, ...filter, page }],
    () => assetsAPI.getAll({ search, ...filter, page }),
    {
      keepPreviousData: true,
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Assets data refreshed:', data);
      }
    }
  );

  // Mutation for updating asset status
  const updateAssetStatusMutation = useMutation(
    async ({ assetId, newStatus }) => {
      const assets = assetsData?.data?.assets || [];
      const updatedAssets = assets.map(asset => 
        asset._id === assetId ? { ...asset, status: newStatus, updatedAt: new Date().toISOString() } : asset
      );
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      queryClient.setQueryData(['assets', { search, ...filter, page }], { data: { assets: updatedAssets } });
      return updatedAssets;
    },
    {
      onSuccess: () => {
        toast.success('Asset status updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update asset status');
      }
    }
  );

  // Workflow actions
  const handleStatusUpdate = (assetId, newStatus) => {
    updateAssetStatusMutation.mutate({ assetId, newStatus });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Assets data refreshed');
  };

  const { data: categories } = useQuery(
    'assetCategories',
    assetsAPI.getCategories
  );

  const { data: assetsOverview } = useQuery(
    'assetsOverview',
    assetsAPI.getAssetsOverview,
    {
      enabled: showReports,
    }
  );

  const deleteMutation = useMutation(assetsAPI.delete, {
    onSuccess: () => {
      toast.success('Asset deleted successfully');
      queryClient.invalidateQueries('assets');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete asset');
    },
  });

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const handleAssetValuationReport = () => {
    try {
      console.log('Generating Asset Valuation Report...');
      const reportData = assets.map(asset => ({
        'Asset Name': asset.asset_name,
        'Category': asset.category,
        'Type': asset.type,
        'Status': asset.status,
        'Purchase Date': new Date(asset.purchase_date).toLocaleDateString(),
        'Purchase Cost': asset.purchase_cost?.amount || 0,
        'Current Value': asset.current_value?.amount || 0,
        'Depreciation': (asset.purchase_cost?.amount || 0) - (asset.current_value?.amount || 0),
        'Depreciation %': asset.purchase_cost?.amount ? 
          (((asset.purchase_cost?.amount || 0) - (asset.current_value?.amount || 0)) / asset.purchase_cost?.amount * 100).toFixed(2) + '%' : '0%',
        'Assigned To': asset.assigned_to?.user_id ? 
          `${asset.assigned_to.user_id.firstName || ''} ${asset.assigned_to.user_id.lastName || ''}`.trim() : 'Unassigned',
        'Location': asset.location || 'Not specified',
        'Serial Number': asset.specifications?.serial_number || 'N/A'
      }));

      const csvContent = [
        Object.keys(reportData[0]),
        ...reportData.map(row => Object.values(row))
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset_valuation_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Asset Valuation Report generated successfully!');
    } catch (error) {
      console.error('Error generating asset valuation report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleMaintenanceReport = () => {
    try {
      console.log('Generating Maintenance Report...');
      const currentDate = new Date();
      const thirtyDaysFromNow = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const maintenanceData = assets.map(asset => {
        const isOverdue = asset.maintenance_schedule && new Date(asset.maintenance_schedule.next_maintenance_date) <= currentDate;
        const isUpcoming = asset.maintenance_schedule && 
          new Date(asset.maintenance_schedule.next_maintenance_date) > currentDate && 
          new Date(asset.maintenance_schedule.next_maintenance_date) <= thirtyDaysFromNow;
        
        return {
          'Asset Name': asset.asset_name,
          'Category': asset.category,
          'Type': asset.type,
          'Status': asset.status,
          'Last Maintenance': asset.maintenance_schedule?.last_maintenance_date ? 
            new Date(asset.maintenance_schedule.last_maintenance_date).toLocaleDateString() : 'Never',
          'Next Maintenance': asset.maintenance_schedule?.next_maintenance_date ? 
            new Date(asset.maintenance_schedule.next_maintenance_date).toLocaleDateString() : 'Not scheduled',
          'Maintenance Type': asset.maintenance_schedule?.type || 'N/A',
          'Priority': isOverdue ? 'Overdue' : isUpcoming ? 'Upcoming' : 'Scheduled',
          'Assigned To': asset.assigned_to?.user_id ? 
            `${asset.assigned_to.user_id.firstName || ''} ${asset.assigned_to.user_id.lastName || ''}`.trim() : 'Unassigned',
          'Cost Estimate': asset.maintenance_schedule?.estimated_cost || 0,
          'Days Until Maintenance': asset.maintenance_schedule?.next_maintenance_date ? 
            Math.ceil((new Date(asset.maintenance_schedule.next_maintenance_date) - currentDate) / (1000 * 60 * 60 * 24)) : 'N/A'
        };
      });

      const csvContent = [
        Object.keys(maintenanceData[0]),
        ...maintenanceData.map(row => Object.values(row))
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset_maintenance_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Maintenance Report generated successfully!');
    } catch (error) {
      console.error('Error generating maintenance report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleUtilizationReport = () => {
    try {
      console.log('Generating Asset Utilization Report...');
      
      const utilizationData = assets.reduce((acc, asset) => {
        const category = asset.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { total: 0, assigned: 0, active: 0, totalValue: 0, currentValue: 0 };
        }
        acc[category].total++;
        if (asset.assigned_to?.user_id) acc[category].assigned++;
        if (asset.status === 'active') acc[category].active++;
        acc[category].totalValue += asset.purchase_cost?.amount || 0;
        acc[category].currentValue += asset.current_value?.amount || 0;
        return acc;
      }, {});

      const reportData = Object.entries(utilizationData).map(([category, data]) => ({
        'Category': category,
        'Total Assets': data.total,
        'Active Assets': data.active,
        'Assigned Assets': data.assigned,
        'Unassigned Assets': data.total - data.assigned,
        'Active Rate (%)': data.total > 0 ? ((data.active / data.total) * 100).toFixed(2) : '0',
        'Utilization Rate (%)': data.total > 0 ? ((data.assigned / data.total) * 100).toFixed(2) : '0',
        'Total Purchase Value': formatCurrency(data.totalValue),
        'Current Value': formatCurrency(data.currentValue),
        'Depreciation': formatCurrency(data.totalValue - data.currentValue),
        'Depreciation Rate (%)': data.totalValue > 0 ? 
          (((data.totalValue - data.currentValue) / data.totalValue) * 100).toFixed(2) : '0'
      }));

      const csvContent = [
        Object.keys(reportData[0]),
        ...reportData.map(row => Object.values(row))
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset_utilization_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Asset Utilization Report generated successfully!');
    } catch (error) {
      console.error('Error generating utilization report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleComprehensiveReport = () => {
    try {
      console.log('Generating Comprehensive Asset Report...');
      
      const overview = assetsOverview?.data || {};
      const reportContent = `
Comprehensive Asset Report
=========================
Generated: ${new Date().toLocaleString()}
Date Range: ${dateRange.startDate} to ${dateRange.endDate}

EXECUTIVE SUMMARY
-----------------
Total Assets: ${overview.totalAssets || assets.length}
Active Assets: ${overview.activeAssets || assets.filter(a => a.status === 'active').length}
Disposed Assets: ${overview.disposedAssets || assets.filter(a => a.status === 'disposed').length}
Assigned Assets: ${overview.assignedAssets || assets.filter(a => a.assigned_to?.user_id).length}

FINANCIAL OVERVIEW
------------------
Total Purchase Value: ${formatCurrency(overview.financial?.totalPurchaseValue || 0)}
Total Current Value: ${formatCurrency(overview.financial?.totalCurrentValue || 0)}
Total Depreciation: ${formatCurrency(overview.financial?.totalDepreciation || 0)}
Depreciation Rate: ${overview.financial?.depreciationRate?.toFixed(2) || '0'}%
Average Asset Value: ${formatCurrency(overview.financial?.averageAssetValue || 0)}

UTILIZATION METRICS
------------------
Utilization Rate: ${overview.utilization?.utilizationRate?.toFixed(2) || '0'}%
Active Rate: ${overview.utilization?.activeRate?.toFixed(2) || '0'}%
Unassigned Assets: ${overview.unassignedAssets || (assets.length - (overview.assignedAssets || 0))}

MAINTENANCE STATUS
------------------
Maintenance Due: ${overview.maintenance?.dueCount || 0}
Upcoming Maintenance: ${overview.maintenance?.upcomingCount || 0}
Overdue Maintenance: ${overview.maintenance?.overdueCount || 0}

ASSET AGE ANALYSIS
------------------
Average Asset Age: ${overview.age?.average?.toFixed(1) || '0'} years
Oldest Asset: ${overview.age?.oldest?.toFixed(1) || '0'} years
Newest Asset: ${overview.age?.newest?.toFixed(1) || '0'} years

CATEGORY BREAKDOWN
-----------------
${Object.entries(overview.categories || {}).map(([category, data]) => 
  `${category}: ${data.count} assets, ${formatCurrency(data.totalValue)} value`
).join('\n')}

DETAILED ASSET LIST
--------------------
${assets.map(asset => `
${asset.asset_name}:
  Category: ${asset.category}
  Type: ${asset.type}
  Status: ${asset.status}
  Purchase Date: ${new Date(asset.purchase_date).toLocaleDateString()}
  Purchase Cost: ${formatCurrency(asset.purchase_cost?.amount || 0)}
  Current Value: ${formatCurrency(asset.current_value?.amount || 0)}
  Assigned To: ${asset.assigned_to?.user_id ? 
    `${asset.assigned_to.user_id.firstName || ''} ${asset.assigned_to.user_id.lastName || ''}`.trim() : 'Unassigned'}
  Location: ${asset.location || 'Not specified'}
`).join('')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprehensive_asset_report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Comprehensive Asset Report generated successfully!');
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      toast.error('Failed to generate report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'in_repair': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance_due': return 'bg-orange-100 text-orange-800';
      case 'disposed': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const assets = assetsData?.data?.assets || [];
  const pagination = assetsData?.data?.pagination || {};

  // Debug logging to track data flow
  useEffect(() => {
    console.log('=== ASSETS PAGE DEBUG ===');
    console.log('assetsData:', assetsData);
    console.log('assets length:', assets.length);
    console.log('assets:', assets);
    console.log('pagination:', pagination);
  }, [assetsData, assets, pagination]);

  useEffect(() => {
    if (location.state?.assetSearch) {
      setSearch(location.state.assetSearch);
    }

    if (location.state?.assetStatus) {
      setFilter((prev) => ({ ...prev, status: location.state.assetStatus }));
    }

    if (location.state?.showAssetReports) {
      setShowReports(true);
    }

    if (location.state?.openAssetForm) {
      setShowForm(true);
    }
  }, [location.state]);

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-subtitle">Manage your company assets</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="btn btn-secondary flex items-center"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowReports(true)}
            className="btn btn-secondary flex items-center"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Reports
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Asset
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-card"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories?.data?.categories?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              className="input"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="equipment">Equipment</option>
              <option value="furniture">Furniture</option>
              <option value="vehicle">Vehicle</option>
              <option value="electronics">Electronics</option>
              <option value="machinery">Machinery</option>
              <option value="building">Building</option>
            </select>
            
            <select
              className="input"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="in_repair">In Repair</option>
              <option value="maintenance_due">Maintenance Due</option>
              <option value="disposed">Disposed</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
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
                {assets.map((asset, index) => (
                  <motion.tr
                    key={asset._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.asset_name}</div>
                        <div className="text-sm text-gray-500">
                          {asset.specifications?.make} {asset.specifications?.model}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{asset.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{asset.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.assigned_to?.user_id ? (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {asset.assigned_to.user_id.firstName} {asset.assigned_to.user_id.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${asset.current_value?.amount || asset.purchase_cost?.amount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {assets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assets found
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {showForm && (
        <AssetForm
          asset={editingAsset}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries('assets');
          }}
        />
      )}

      {/* Reports Modal */}
      {showReports && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowReports(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Asset Reports</h2>
              <button
                onClick={() => setShowReports(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            {assetsOverview?.data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Assets</p>
                      <p className="text-2xl font-bold text-blue-900">{assetsOverview.data.totalAssets}</p>
                    </div>
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Active Assets</p>
                      <p className="text-2xl font-bold text-green-900">{assetsOverview.data.activeAssets}</p>
                    </div>
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Maintenance Due</p>
                      <p className="text-2xl font-bold text-yellow-900">{assetsOverview.data.maintenance?.dueCount || 0}</p>
                    </div>
                    <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Value</p>
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(assetsOverview.data.financial?.totalCurrentValue || 0)}</p>
                    </div>
                    <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Asset Report Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Report Table</h3>
              <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Depreciation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Maintenance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset, index) => (
                      <tr key={asset._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset.asset_name}</div>
                            <div className="text-sm text-gray-500">
                              {asset.specifications?.make} {asset.specifications?.model}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{asset.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {asset.assigned_to?.user_id ? (
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {asset.assigned_to.user_id.firstName} {asset.assigned_to.user_id.lastName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{asset.location || 'Not specified'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {new Date(asset.purchase_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(asset.purchase_cost?.amount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(asset.current_value?.amount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency((asset.purchase_cost?.amount || 0) - (asset.current_value?.amount || 0))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {asset.purchase_cost?.amount ? 
                              ((((asset.purchase_cost?.amount || 0) - (asset.current_value?.amount || 0)) / asset.purchase_cost?.amount) * 100).toFixed(1) + '%' : 
                              '0%'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {asset.maintenance_schedule?.next_maintenance_date ? 
                              new Date(asset.maintenance_schedule.next_maintenance_date).toLocaleDateString() : 
                              'Not scheduled'
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {asset.maintenance_schedule?.type || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {assets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No assets found
                  </div>
                )}
              </div>
            </div>

            {/* Report Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleAssetValuationReport}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Asset Valuation Report</h3>
                    <p className="text-sm text-gray-600">Detailed asset values and depreciation analysis</p>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Export CSV
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleMaintenanceReport}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Maintenance Report</h3>
                    <p className="text-sm text-gray-600">Maintenance schedules and upcoming service requirements</p>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Export CSV
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleUtilizationReport}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Utilization Report</h3>
                    <p className="text-sm text-gray-600">Asset utilization rates and category analysis</p>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Export CSV
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleComprehensiveReport}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Comprehensive Report</h3>
                    <p className="text-sm text-gray-600">Complete asset analysis with all metrics</p>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Export TXT
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Assets;
