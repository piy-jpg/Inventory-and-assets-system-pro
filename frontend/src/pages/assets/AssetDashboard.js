import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CubeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const queryClient = useQueryClient();

  // Real-time assets data
  const { data: assetsData, isLoading, refetch } = useQuery(
    'assetDashboard',
    () => {
      const storedAssets = localStorage.getItem('assets');
      if (storedAssets) {
        return JSON.parse(storedAssets);
      }
      
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
          warranty_expiry: '2025-01-15',
          last_maintenance: '2024-03-15',
          next_maintenance: '2024-06-15',
          condition: 'Good'
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
          warranty_expiry: '2024-02-20',
          last_maintenance: '2024-01-10',
          next_maintenance: '2024-07-10',
          condition: 'Excellent'
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
          warranty_expiry: '2023-08-10',
          last_maintenance: '2024-04-01',
          next_maintenance: '2024-05-01',
          condition: 'Fair'
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
          warranty_expiry: '2024-05-15',
          last_maintenance: '2023-12-01',
          next_maintenance: '2024-06-01',
          condition: 'Good'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Asset dashboard data refreshed:', data);
      }
    }
  );

  const assets = Array.isArray(assetsData) ? assetsData : (assetsData?.data?.data?.assets || assetsData?.data?.assets || []);

  // Calculate statistics
  const totalAssets = assets.length;
  const activeAssets = assets.filter(asset => asset && asset.status === 'active').length;
  const inactiveAssets = assets.filter(asset => asset && asset.status === 'inactive').length;
  const maintenanceAssets = assets.filter(asset => asset && asset.status === 'maintenance').length;
  const totalValue = Number(assets.reduce((sum, asset) => {
    const value = asset && asset.current_value ? Number(asset.current_value) : 0;
    return sum + (isNaN(value) ? 0 : value);
  }, 0)) || 0;
  const totalPurchaseCost = Number(assets.reduce((sum, asset) => {
    const cost = asset && asset.purchase_cost ? Number(asset.purchase_cost) : 0;
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0)) || 0;
  const totalDepreciation = Number(totalPurchaseCost - totalValue) || 0;

  // Calculate category distribution
  const categoryDistribution = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {});

  // Calculate location distribution
  const locationDistribution = assets.reduce((acc, asset) => {
    acc[asset.location] = (acc[asset.location] || 0) + 1;
    return acc;
  }, {});

  // Get recent maintenance alerts
  const maintenanceAlerts = assets.filter(asset => {
    const nextMaintenance = new Date(asset.next_maintenance);
    const today = new Date();
    const daysUntilMaintenance = Math.ceil((nextMaintenance - today) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance <= 30; // Assets needing maintenance in next 30 days
  });

  // Get warranty expiry alerts
  const warrantyAlerts = assets.filter(asset => {
    const warrantyExpiry = new Date(asset.warranty_expiry);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((warrantyExpiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 60; // Assets with warranty expiring in next 60 days
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Asset dashboard refreshed');
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
            <h1 className="page-title">Asset Dashboard</h1>
            <p className="page-subtitle">Overview of total assets and their status</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="input"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
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

      {/* Main Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
              <p className="text-xs text-gray-500">Across all categories</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CubeIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assets</p>
              <p className="text-2xl font-bold text-green-600">{activeAssets}</p>
              <p className="text-xs text-gray-500">{totalAssets > 0 ? ((activeAssets / totalAssets) * 100).toFixed(1) : 0}% of total</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${(totalValue || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Current market value</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{maintenanceAssets}</p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Secondary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Assets</p>
              <p className="text-xl font-bold text-red-600">{inactiveAssets}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Depreciation</p>
              <p className="text-xl font-bold text-orange-600">${(totalDepreciation || 0).toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ArrowTrendingDownIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Purchase Cost</p>
              <p className="text-xl font-bold text-blue-600">${(totalPurchaseCost || 0).toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">({totalAssets > 0 ? ((count / totalAssets) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Location Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution by Location</h3>
          <div className="space-y-3">
            {Object.entries(locationDistribution).map(([location, count]) => (
              <div key={location} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">({totalAssets > 0 ? ((count / totalAssets) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
      >
        {/* Maintenance Alerts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-orange-600" />
            Maintenance Alerts ({maintenanceAlerts.length})
          </h3>
          <div className="space-y-3">
            {maintenanceAlerts.length === 0 ? (
              <p className="text-sm text-gray-500">No maintenance alerts</p>
            ) : (
              maintenanceAlerts.slice(0, 3).map(asset => (
                <div key={asset._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{asset.asset_name}</p>
                    <p className="text-xs text-gray-500">Next: {asset.next_maintenance}</p>
                  </div>
                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warranty Alerts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-red-600" />
            Warranty Expiry Alerts ({warrantyAlerts.length})
          </h3>
          <div className="space-y-3">
            {warrantyAlerts.length === 0 ? (
              <p className="text-sm text-gray-500">No warranty expiry alerts</p>
            ) : (
              warrantyAlerts.slice(0, 3).map(asset => (
                <div key={asset._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{asset.asset_name}</p>
                    <p className="text-xs text-gray-500">Expires: {asset.warranty_expiry}</p>
                  </div>
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AssetDashboard;
