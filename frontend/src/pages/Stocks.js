import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BellIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { inventoryAPI, stockAdjustmentsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import useRealTimeInventory from '../hooks/useRealTimeInventory';

const Stocks = () => {
  const { user } = useAuth();
  const { isConnected, realTimeUpdates } = useRealTimeInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [showEditHistoryModal, setShowEditHistoryModal] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);
  const [isUpdatingHistory, setIsUpdatingHistory] = useState(false);

  const queryClient = useQueryClient();

  const canManageStocks = ['admin', 'manager', 'staff'].includes(user?.role);

  // Real-time stocks data from backend
  const { data: inventoryData, isLoading, refetch } = useQuery(
    'stocks',
    () => inventoryAPI.getAll({ limit: 200, sortBy: 'name', sortOrder: 'asc' }),
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  // Fetch stock adjustments from API
  const { data: stockAdjustmentsData, refetch: refetchAdjustments } = useQuery(
    'stockAdjustments',
    () => stockAdjustmentsAPI.getAll({ limit: 200, sortBy: 'createdAt', sortOrder: 'desc' }),
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  // Transform inventory data to stocks format
  const stocksData = useMemo(() => {
    const inventory = inventoryData?.data?.data?.inventory || inventoryData?.data?.inventory || [];
    return inventory.map(item => ({
      id: item._id,
      productId: item.sku || item._id,
      productName: item.name,
      category: item.category || 'Uncategorized',
      currentStock: item.quantity || 0,
      minStock: item.minStockLevel || item.minStock || 5,
      maxStock: item.maxStockLevel || item.maxStock || 100,
      reorderPoint: item.minStockLevel || item.minStock || 5,
      reorderQuantity: Math.max(10, (item.maxStockLevel || 100) - (item.quantity || 0)),
      lastUpdated: item.updatedAt || new Date().toISOString(),
      status: item.quantity === 0 ? 'out' : item.quantity <= (item.minStockLevel || 5) ? 'low' : 'healthy',
      location: item.location?.warehouse ? `${item.location.warehouse} - ${item.location.aisle || ''}-${item.location.shelf || ''}-${item.location.bin || ''}` : 'Not specified',
      supplier: item.supplier_id || 'Unknown',
      unitPrice: item.price?.cost || 0,
      totalValue: (item.quantity || 0) * (item.price?.cost || 0),
      trend: 'stable'
    }));
  }, [inventoryData]);

  // Transform stock adjustments data for display
  const adjustmentHistory = useMemo(() => {
    const adjustments = stockAdjustmentsData?.data?.data?.adjustments || stockAdjustmentsData?.data?.adjustments || [];
    return adjustments.map(adj => ({
      id: adj._id,
      date: new Date(adj.createdAt).toLocaleDateString('en-GB'),
      productName: adj.product?.name || 'Unknown',
      productId: adj.product?.sku || adj.product?._id || 'Unknown',
      type: adj.type,
      qty: adj.quantity,
      reason: adj.reason,
      createdBy: adj.created_by?.firstName && adj.created_by?.lastName 
        ? `${adj.created_by.firstName} ${adj.created_by.lastName}` 
        : adj.created_by?.email || 'Unknown',
      notes: adj.notes || ''
    }));
  }, [stockAdjustmentsData]);

  // Mutation for adjusting stock
  const adjustStockMutation = useMutation(
    async ({ stockId, quantity, reason, notes, adjustedBy, adjustedAt }) => {
      const result = await inventoryAPI.adjustStock(stockId, { 
        quantity, 
        reason, 
        notes,
        adjustedBy,
        adjustedAt 
      });
      console.log('Stock adjustment result:', result);
      return result;
    },
    {
      onMutate: async ({ stockId, quantity }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries('stocks');
        await queryClient.cancelQueries('inventory');

        // Snapshot previous value
        const previousStocks = queryClient.getQueryData('stocks');
        const previousInventory = queryClient.getQueryData('inventory');

        // Optimistically update stocks data
        queryClient.setQueryData('stocks', (old) => {
          if (!old) return old;
          return old.map(stock => 
            stock.id === stockId ? { 
              ...stock, 
              currentStock: quantity,
              status: quantity === 0 ? 'out' : quantity <= stock.reorderPoint ? 'low' : 'healthy',
              totalValue: quantity * stock.unitPrice,
              lastUpdated: new Date().toISOString()
            } : stock
          );
        });

        // Optimistically update inventory data
        queryClient.setQueryData('inventory', (old) => {
          if (!old) return old;
          const newData = { ...old };
          if (newData.data?.data?.inventory) {
            newData.data.data.inventory = newData.data.data.inventory.map(item => 
              item._id === stockId ? { 
                ...item, 
                quantity: quantity,
                updatedAt: new Date().toISOString()
              } : item
            );
          } else if (newData.data?.inventory) {
            newData.data.inventory = newData.data.inventory.map(item => 
              item._id === stockId ? { 
                ...item, 
                quantity: quantity,
                updatedAt: new Date().toISOString()
              } : item
            );
          }
          return newData;
        });

        return { previousStocks, previousInventory };
      },
      onError: (err, variables, context) => {
        // Rollback to previous value
        if (context?.previousStocks) {
          queryClient.setQueryData('stocks', context.previousStocks);
        }
        if (context?.previousInventory) {
          queryClient.setQueryData('inventory', context.previousInventory);
        }
        toast.error(err.response?.data?.message || 'Failed to adjust stock');
      },
      onSuccess: (data) => {
        toast.success('Stock adjusted successfully');
        console.log('Stock adjustment successful, data:', data);
        // Force refetch to ensure we have the latest data
        queryClient.invalidateQueries('stocks');
        queryClient.invalidateQueries('inventory');
        refetch();
        setShowAdjustModal(false);
        setAdjustQuantity(0);
        setAdjustReason('');
        setAdjustNotes('');
        setSelectedStock(null);
      },
      onSettled: () => {
        // Refetch to ensure server state is reflected
        queryClient.invalidateQueries('stocks');
        queryClient.invalidateQueries('inventory');
      }
    }
  );

  // Real-time updates effect
  useEffect(() => {
    if (realTimeUpdates.length > 0) {
      console.log('Real-time updates detected in Stocks:', realTimeUpdates.length);
      refetch();
    }
  }, [realTimeUpdates, refetch]);

  const stocks = stocksData || [];

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        stock.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        stock.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || stock.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || stock.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      case 'out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowPathIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const openDetailsModal = (stock) => {
    setSelectedStock(stock);
    setShowDetailsModal(true);
  };

  const openEditHistoryModal = (record) => {
    setSelectedHistoryRecord(record);
    setShowEditHistoryModal(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Stock data refreshed');
  };

  // Real-time statistics
  const totalStocks = stocks.length;
  const healthyStocks = stocks.filter(stock => stock.status === 'healthy').length;
  const lowStocks = stocks.filter(stock => stock.status === 'low').length;
  const criticalStocks = stocks.filter(stock => stock.status === 'critical').length;
  const outOfStocks = stocks.filter(stock => stock.status === 'out').length;
  const totalValue = stocks.reduce((sum, stock) => sum + stock.totalValue, 0);

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Stocks</h1>
            <p className="page-subtitle">Monitor and manage inventory stock levels</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <WifiIcon className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-700">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {canManageStocks && (
              <button 
                onClick={() => setShowAdjustModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Stock Adjustment</span>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalStocks}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Healthy</p>
              <p className="text-2xl font-bold text-green-600">{healthyStocks}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStocks}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-orange-600">{criticalStocks}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStocks}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="healthy">Healthy</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="out">Out of Stock</option>
              </select>
              
              <select
                className="input"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stocks Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No stocks found
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stock.productName}</div>
                      <div className="text-xs text-gray-500">ID: {stock.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stock.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stock.currentStock}</div>
                      <div className="text-xs text-gray-500">Min: {stock.minStock} | Max: {stock.maxStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stock.status)}`}>
                        {stock.status.charAt(0).toUpperCase() + stock.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stock.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${stock.totalValue.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">@ ${stock.unitPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTrendIcon(stock.trend)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(stock)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canManageStocks && (
                          <button
                            onClick={() => {
                              setSelectedStock(stock);
                              setShowAdjustModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Adjust Stock"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
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

      {/* Stock Adjustment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 mt-6"
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Stock Adjustment History</h2>
          <p className="text-sm text-gray-600">View and manage stock adjustment records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustmentHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No adjustment history found
                  </td>
                </tr>
              ) : (
                adjustmentHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.productName}</div>
                      <div className="text-xs text-gray-500">{record.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.type === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        record.type === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'increase' ? '+' : '-'}{record.qty}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stock Details Modal */}
      {showDetailsModal && selectedStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Stock Details - {selectedStock.productName}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Product ID</p>
                <p className="text-sm text-gray-900">{selectedStock.productId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="text-sm text-gray-900">{selectedStock.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Current Stock</p>
                <p className="text-sm font-medium text-gray-900">{selectedStock.currentStock} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStock.status)}`}>
                  {selectedStock.status.charAt(0).toUpperCase() + selectedStock.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Min Stock</p>
                <p className="text-sm text-gray-900">{selectedStock.minStock} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Max Stock</p>
                <p className="text-sm text-gray-900">{selectedStock.maxStock} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reorder Point</p>
                <p className="text-sm text-gray-900">{selectedStock.reorderPoint} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reorder Quantity</p>
                <p className="text-sm text-gray-900">{selectedStock.reorderQuantity} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-sm text-gray-900">{selectedStock.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedStock.supplier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unit Price</p>
                <p className="text-sm font-medium text-gray-900">${selectedStock.unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-sm font-medium text-gray-900">${selectedStock.totalValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {canManageStocks && (
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowAdjustModal(true);
                  }}
                  className="btn btn-primary"
                >
                  Adjust Stock
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAdjustModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adjust Stock - {selectedStock.productName}</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Stock</span>
                  <span className="text-2xl font-bold text-gray-900">{selectedStock.currentStock}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStock.status)}`}>
                    {selectedStock.status.charAt(0).toUpperCase() + selectedStock.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Adjustment Type</label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustQuantity(Math.abs(adjustQuantity))}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      adjustQuantity > 0 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    + Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustQuantity(-Math.abs(adjustQuantity))}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      adjustQuantity < 0 ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    - Remove Stock
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  className="input"
                  value={Math.abs(adjustQuantity)}
                  onChange={(e) => setAdjustQuantity(adjustQuantity >= 0 ? Number(e.target.value) : -Number(e.target.value))}
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Stock</span>
                  <span className={`text-2xl font-bold ${selectedStock.currentStock + adjustQuantity <= 0 ? 'text-red-600' : selectedStock.currentStock + adjustQuantity <= selectedStock.reorderPoint ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selectedStock.currentStock + adjustQuantity}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Change</span>
                  <span className={`text-sm font-medium ${adjustQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustQuantity > 0 ? '+' : ''}{adjustQuantity}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Reason</label>
                <select
                  className="input"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Stock Take">Stock Take</option>
                  <option value="Damage/Loss">Damage/Loss</option>
                  <option value="Return">Return</option>
                  <option value="Restock">Restock</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Correction">Correction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <input
                  type="text"
                  className="input"
                  value={adjustNotes || ''}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  setAdjustQuantity(0);
                  setAdjustReason('');
                  setAdjustNotes('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!adjustQuantity) {
                    toast.error('Please enter a quantity');
                    return;
                  }
                  if (!adjustReason) {
                    toast.error('Please select a reason');
                    return;
                  }
                  adjustStockMutation.mutate({
                    stockId: selectedStock.id,
                    quantity: selectedStock.currentStock + adjustQuantity,
                    reason: adjustReason,
                    notes: adjustNotes,
                    adjustedBy: user?.firstName + ' ' + user?.lastName || user?.email || 'Unknown',
                    adjustedAt: new Date().toISOString()
                  });
                }}
                className="btn btn-primary"
                disabled={adjustStockMutation.isLoading || !adjustQuantity || !adjustReason}
              >
                {adjustStockMutation.isLoading ? 'Adjusting...' : 'Adjust Stock'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit History Modal */}
      {showEditHistoryModal && selectedHistoryRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditHistoryModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Adjustment - {selectedHistoryRecord.productName}</h3>
              <button
                onClick={() => setShowEditHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-gray-900">{selectedHistoryRecord.date}</p>
                </div>
              </div>
              <div>
                <label className="label">Product</label>
                <select
                  className="input"
                  value={selectedHistoryRecord.productId}
                  onChange={(e) => {
                    const selectedProduct = stocks.find(s => s.productId === e.target.value);
                    setSelectedHistoryRecord({
                      ...selectedHistoryRecord,
                      productId: e.target.value,
                      productName: selectedProduct?.productName || 'Unknown'
                    });
                  }}
                >
                  {stocks.map(stock => (
                    <option key={stock.productId} value={stock.productId}>
                      {stock.productName} ({stock.productId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={selectedHistoryRecord.type}
                  onChange={(e) => setSelectedHistoryRecord({...selectedHistoryRecord, type: e.target.value})}
                >
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </div>
              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  className="input"
                  value={selectedHistoryRecord.qty}
                  onChange={(e) => setSelectedHistoryRecord({...selectedHistoryRecord, qty: Number(e.target.value)})}
                  min="1"
                />
              </div>
              <div>
                <label className="label">Reason</label>
                <select
                  className="input"
                  value={selectedHistoryRecord.reason}
                  onChange={(e) => setSelectedHistoryRecord({...selectedHistoryRecord, reason: e.target.value})}
                >
                  <option value="correction">Correction</option>
                  <option value="damage">Damage</option>
                  <option value="return">Return</option>
                  <option value="theft">Theft</option>
                  <option value="expired">Expired</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows="3"
                  value={selectedHistoryRecord.notes || ''}
                  onChange={(e) => setSelectedHistoryRecord({...selectedHistoryRecord, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <label className="label">Created By</label>
                <input
                  type="text"
                  className="input"
                  value={selectedHistoryRecord.createdBy}
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditHistoryModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsUpdatingHistory(true);
                  try {
                    // Update using the API
                    const updateData = {
                      product: selectedHistoryRecord.productId,
                      type: selectedHistoryRecord.type,
                      quantity: selectedHistoryRecord.qty,
                      reason: selectedHistoryRecord.reason,
                      notes: selectedHistoryRecord.notes || ''
                    };
                    
                    await stockAdjustmentsAPI.update(selectedHistoryRecord.id, updateData);
                    
                    toast.success('Adjustment history updated successfully');
                    setShowEditHistoryModal(false);
                    setSelectedHistoryRecord(null);
                    
                    // Invalidate queries to refresh data
                    queryClient.invalidateQueries('stockAdjustments');
                    queryClient.invalidateQueries('inventory');
                    refetch();
                    refetchAdjustments();
                  } catch (error) {
                    console.error('Error updating adjustment:', error);
                    toast.error(error.response?.data?.message || 'Failed to update adjustment');
                  } finally {
                    setIsUpdatingHistory(false);
                  }
                }}
                className="btn btn-primary"
                disabled={isUpdatingHistory}
              >
                {isUpdatingHistory ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Stocks;
