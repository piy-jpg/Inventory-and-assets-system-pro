import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetDepreciation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [depreciationMethod, setDepreciationMethod] = useState('straight_line');
  const [usefulLife, setUsefulLife] = useState('');
  const [salvageValue, setSalvageValue] = useState('');

  const queryClient = useQueryClient();

  // Real-time asset depreciation data
  const { data: depreciationData, isLoading, refetch } = useQuery(
    'assetDepreciation',
    () => {
      const storedDepreciation = localStorage.getItem('assetDepreciation');
      if (storedDepreciation) {
        return JSON.parse(storedDepreciation);
      }
      
      return [
        {
          _id: 'DEP_001',
          asset_id: 'AST_001',
          asset_name: 'Laptop Pro 15"',
          asset_tag: 'LAPTOP-001',
          purchase_date: '2023-01-15',
          purchase_cost: 1299.99,
          current_value: 974.99,
          depreciation_method: 'straight_line',
          useful_life_years: 5,
          salvage_value: 129.99,
          annual_depreciation: 234.00,
          accumulated_depreciation: 325.00,
          remaining_book_value: 974.99,
          depreciation_rate: 20,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2024-04-23T10:00:00Z'
        },
        {
          _id: 'DEP_002',
          asset_id: 'AST_002',
          asset_name: 'Office Chair Ergonomic',
          asset_tag: 'CHAIR-001',
          purchase_date: '2023-02-20',
          purchase_cost: 399.99,
          current_value: 319.99,
          depreciation_method: 'straight_line',
          useful_life_years: 10,
          salvage_value: 39.99,
          annual_depreciation: 36.00,
          accumulated_depreciation: 80.00,
          remaining_book_value: 319.99,
          depreciation_rate: 10,
          created_at: '2023-02-20T10:00:00Z',
          updated_at: '2024-04-23T10:00:00Z'
        },
        {
          _id: 'DEP_003',
          asset_id: 'AST_003',
          asset_name: 'Desktop Computer',
          asset_tag: 'DESKTOP-001',
          purchase_date: '2022-08-10',
          purchase_cost: 899.99,
          current_value: 539.99,
          depreciation_method: 'declining_balance',
          useful_life_years: 4,
          salvage_value: 89.99,
          annual_depreciation: 360.00,
          accumulated_depreciation: 360.00,
          remaining_book_value: 539.99,
          depreciation_rate: 25,
          created_at: '2022-08-10T10:00:00Z',
          updated_at: '2024-04-23T10:00:00Z'
        },
        {
          _id: 'DEP_004',
          asset_id: 'AST_004',
          asset_name: 'Conference Table',
          asset_tag: 'TABLE-001',
          purchase_date: '2022-05-15',
          purchase_cost: 1599.99,
          current_value: 1279.99,
          depreciation_method: 'straight_line',
          useful_life_years: 12,
          salvage_value: 159.99,
          annual_depreciation: 120.00,
          accumulated_depreciation: 320.00,
          remaining_book_value: 1279.99,
          depreciation_rate: 8,
          created_at: '2022-05-15T10:00:00Z',
          updated_at: '2024-04-23T10:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 15000, // Real-time refresh every 15 seconds
      onSuccess: (data) => {
        console.log('Asset depreciation data refreshed:', data);
      }
    }
  );

  // Mock assets data
  const { data: assetsData } = useQuery(
    'depreciationAssets',
    () => {
      return [
        { _id: 'AST_001', asset_name: 'Laptop Pro 15"', asset_tag: 'LAPTOP-001', purchase_cost: 1299.99 },
        { _id: 'AST_002', asset_name: 'Office Chair Ergonomic', asset_tag: 'CHAIR-001', purchase_cost: 399.99 },
        { _id: 'AST_003', asset_name: 'Desktop Computer', asset_tag: 'DESKTOP-001', purchase_cost: 899.99 },
        { _id: 'AST_004', asset_name: 'Conference Table', asset_tag: 'TABLE-001', purchase_cost: 1599.99 }
      ];
    }
  );

  // Mutation for calculating depreciation
  const calculateDepreciationMutation = useMutation(
    async (depreciationData) => {
      const depreciation = depreciationData || [];
      const newDepreciation = {
        ...depreciationData,
        _id: `DEP_${Date.now()}`,
        accumulated_depreciation: 0,
        remaining_book_value: depreciationData.purchase_cost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedDepreciation = [...depreciation, newDepreciation];
      localStorage.setItem('assetDepreciation', JSON.stringify(updatedDepreciation));
      queryClient.setQueryData('assetDepreciation', updatedDepreciation);
      return updatedDepreciation;
    },
    {
      onSuccess: () => {
        toast.success('Depreciation calculated successfully');
        setShowCalculateModal(false);
        resetCalculateForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to calculate depreciation');
      }
    }
  );

  const depreciation = depreciationData || [];
  const assets = assetsData || [];

  const filteredDepreciation = depreciation.filter(item => {
    const matchesSearch = item.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.depreciation_method?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || item.depreciation_method === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  const resetCalculateForm = () => {
    setSelectedAsset(null);
    setDepreciationMethod('straight_line');
    setUsefulLife('');
    setSalvageValue('');
  };

  const handleCalculate = () => {
    if (!selectedAsset || !usefulLife) {
      toast.error('Please fill in all required fields');
      return;
    }

    const purchaseCost = selectedAsset.purchase_cost;
    const salvage = parseFloat(salvageValue) || 0;
    const life = parseInt(usefulLife);

    let annualDepreciation = 0;
    let depreciationRate = 0;

    if (depreciationMethod === 'straight_line') {
      annualDepreciation = (purchaseCost - salvage) / life;
      depreciationRate = (annualDepreciation / purchaseCost) * 100;
    } else if (depreciationMethod === 'declining_balance') {
      depreciationRate = 2 / life * 100; // Double declining balance
      annualDepreciation = purchaseCost * (depreciationRate / 100);
    }

    const depreciationData = {
      asset_id: selectedAsset._id,
      asset_name: selectedAsset.asset_name,
      asset_tag: selectedAsset.asset_tag,
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_cost: purchaseCost,
      current_value: purchaseCost - annualDepreciation,
      depreciation_method: depreciationMethod,
      useful_life_years: life,
      salvage_value: salvage,
      annual_depreciation: annualDepreciation,
      depreciation_rate: depreciationRate
    };

    calculateDepreciationMutation.mutate(depreciationData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Depreciation data refreshed');
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'straight_line':
        return 'bg-blue-100 text-blue-800';
      case 'declining_balance':
        return 'bg-green-100 text-green-800';
      case 'sum_of_years':
        return 'bg-purple-100 text-purple-800';
      case 'units_of_production':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalAssets = depreciation.length;
  const totalPurchaseCost = depreciation.reduce((sum, item) => sum + item.purchase_cost, 0);
  const totalCurrentValue = depreciation.reduce((sum, item) => sum + item.current_value, 0);
  const totalDepreciation = depreciation.reduce((sum, item) => sum + item.accumulated_depreciation, 0);
  const averageDepreciationRate = depreciation.length > 0 ? 
    depreciation.reduce((sum, item) => sum + item.depreciation_rate, 0) / depreciation.length : 0;

  // Group by depreciation method
  const methodDistribution = depreciation.reduce((acc, item) => {
    acc[item.depreciation_method] = (acc[item.depreciation_method] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Asset Depreciation</h1>
            <p className="page-subtitle">Calculate depreciation and view asset value over time</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
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
                resetCalculateForm();
                setShowCalculateModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              <span>Calculate Depreciation</span>
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
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchase Cost</p>
              <p className="text-2xl font-bold text-gray-900">${totalPurchaseCost.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-blue-600">${totalCurrentValue.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowTrendingDownIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Depreciation</p>
              <p className="text-2xl font-bold text-orange-600">${totalDepreciation.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ArrowTrendingDownIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Method Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
      >
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Methods</h3>
          <div className="space-y-3">
            {Object.entries(methodDistribution).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(method)}`}>
                    {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
                  </span>
                  <span className="text-sm text-gray-700">{count} assets</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {((count / totalAssets) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Depreciation Rate</span>
              <span className="text-sm font-medium text-gray-900">{averageDepreciationRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Value Loss</span>
              <span className="text-sm font-medium text-red-600">
                ${totalDepreciation.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Value Retention Rate</span>
              <span className="text-sm font-medium text-green-600">
                {totalPurchaseCost > 0 ? ((totalCurrentValue / totalPurchaseCost) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
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
                placeholder="Search assets..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="straight_line">Straight Line</option>
              <option value="declining_balance">Declining Balance</option>
              <option value="sum_of_years">Sum of Years</option>
              <option value="units_of_production">Units of Production</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Depreciation Table */}
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
                  Asset Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Useful Life
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Depreciation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accumulated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepreciation.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No depreciation records found
                  </td>
                </tr>
              ) : (
                filteredDepreciation.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.asset_name}</div>
                      <div className="text-xs text-gray-500">Tag: {item.asset_tag}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.purchase_cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{item.purchase_date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(item.depreciation_method)}`}>
                        {item.depreciation_method.replace('_', ' ').charAt(0).toUpperCase() + 
                         item.depreciation_method.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.useful_life_years} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${item.annual_depreciation.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.accumulated_depreciation.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${item.current_value.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.depreciation_rate.toFixed(1)}%</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Calculate Depreciation Modal */}
      {showCalculateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCalculateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Calculate Depreciation</h3>
              <button
                onClick={() => setShowCalculateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset *</label>
                <select
                  className="input"
                  value={selectedAsset?._id || ''}
                  onChange={(e) => setSelectedAsset(assets.find(a => a._id === e.target.value))}
                  required
                >
                  <option value="">Select an asset</option>
                  {assets.map(asset => (
                    <option key={asset._id} value={asset._id}>
                      {asset.asset_name} (${asset.purchase_cost.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Method *</label>
                <select
                  className="input"
                  value={depreciationMethod}
                  onChange={(e) => setDepreciationMethod(e.target.value)}
                  required
                >
                  <option value="straight_line">Straight Line</option>
                  <option value="declining_balance">Declining Balance</option>
                  <option value="sum_of_years">Sum of Years</option>
                  <option value="units_of_production">Units of Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Useful Life (Years) *</label>
                <input
                  type="number"
                  className="input"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(e.target.value)}
                  placeholder="e.g., 5"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salvage Value</label>
                <input
                  type="number"
                  className="input"
                  value={salvageValue}
                  onChange={(e) => setSalvageValue(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              {selectedAsset && usefulLife && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Calculation Preview</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Purchase Cost: ${selectedAsset.purchase_cost.toFixed(2)}</div>
                    <div>Useful Life: {usefulLife} years</div>
                    <div>Salvage Value: ${parseFloat(salvageValue || 0).toFixed(2)}</div>
                    {depreciationMethod === 'straight_line' && (
                      <div>Annual Depreciation: ${((selectedAsset.purchase_cost - parseFloat(salvageValue || 0)) / parseInt(usefulLife)).toFixed(2)}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCalculateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCalculate}
                className="btn btn-primary"
                disabled={calculateDepreciationMutation.isLoading}
              >
                Calculate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetDepreciation;
