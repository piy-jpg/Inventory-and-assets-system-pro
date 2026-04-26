import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const SupplierPerformance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterPerformance, setFilterPerformance] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const queryClient = useQueryClient();

  // Real-time supplier performance data
  const { data: performanceData, isLoading, refetch } = useQuery(
    'supplierPerformance',
    () => {
      const storedPerformance = localStorage.getItem('supplierPerformance');
      if (storedPerformance) {
        return JSON.parse(storedPerformance);
      }
      
      // Combine data from suppliers, purchase orders, and payments
      const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
      const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
      const supplierProducts = JSON.parse(localStorage.getItem('supplierProducts') || '[]');
      
      const performanceData = suppliers.map(supplier => {
        const supplierOrders = purchaseOrders.filter(order => order.supplierId === supplier._id);
        const supplierProductsLink = supplierProducts.filter(product => product.supplierId === supplier._id);
        
        // Calculate delivery performance
        const deliveredOrders = supplierOrders.filter(order => order.status === 'received');
        const averageDeliveryTime = deliveredOrders.length > 0 
          ? deliveredOrders.reduce((sum, order) => {
              if (order.actualDeliveryDate && order.expectedDeliveryDate) {
                const actual = new Date(order.actualDeliveryDate);
                const expected = new Date(order.expectedDeliveryDate);
                return sum + Math.max(0, Math.floor((actual - expected) / (1000 * 60 * 60 * 24)));
              }
              return sum;
            }, 0) / deliveredOrders.length
          : 0;
        
        // Calculate order accuracy (based on product quality ratings)
        const orderAccuracy = supplierProductsLink.length > 0
          ? supplierProductsLink.reduce((sum, product) => sum + (product.isPreferred ? 1 : 0), 0) / supplierProductsLink.length * 100
          : 0;
        
        // Calculate overall rating
        const rating = supplier.rating || 0;
        
        // Determine performance level
        let performanceLevel = 'average';
        if (rating >= 4.5 && averageDeliveryTime <= 3 && orderAccuracy >= 80) {
          performanceLevel = 'excellent';
        } else if (rating >= 3.5 && averageDeliveryTime <= 7 && orderAccuracy >= 60) {
          performanceLevel = 'good';
        } else if (rating < 3.0 || averageDeliveryTime > 10 || orderAccuracy < 40) {
          performanceLevel = 'poor';
        }
        
        return {
          _id: supplier._id,
          supplierName: supplier.name,
          totalOrders: supplierOrders.length,
          deliveredOrders: deliveredOrders.length,
          averageDeliveryTime: averageDeliveryTime,
          orderAccuracy: orderAccuracy,
          rating: rating,
          performanceLevel: performanceLevel,
          totalProducts: supplierProductsLink.length,
          preferredProducts: supplierProductsLink.filter(product => product.isPreferred).length,
          lastOrderDate: supplierOrders.length > 0 ? supplierOrders[supplierOrders.length - 1].createdAt : null,
          totalValue: supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0),
          onTimeDeliveryRate: deliveredOrders.length > 0 
            ? deliveredOrders.filter(order => {
                if (order.actualDeliveryDate && order.expectedDeliveryDate) {
                  return new Date(order.actualDeliveryDate) <= new Date(order.expectedDeliveryDate);
                }
                return false;
              }).length / deliveredOrders.length * 100
            : 0,
          qualityScore: orderAccuracy,
          responsivenessScore: 85, // Mock data
          costEffectiveness: 78, // Mock data
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt
        };
      });
      
      return performanceData.sort((a, b) => b.rating - a.rating);
    },
    {
      refetchInterval: 15000, // Real-time refresh every 15 seconds
      onSuccess: (data) => {
        console.log('Supplier performance data refreshed:', data);
      }
    }
  );

  const performance = performanceData || [];

  const filteredPerformance = performance.filter(supplier => {
    const matchesSearch = supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || 
      (filterRating === '5' && supplier.rating >= 4.5) ||
      (filterRating === '4' && supplier.rating >= 3.5 && supplier.rating < 4.5) ||
      (filterRating === '3' && supplier.rating >= 2.5 && supplier.rating < 3.5) ||
      (filterRating === '2' && supplier.rating < 2.5);
    const matchesPerformance = filterPerformance === 'all' || supplier.performanceLevel === filterPerformance;
    
    return matchesSearch && matchesRating && matchesPerformance;
  });

  const openDetailsModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Supplier performance data refreshed');
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (level) => {
    switch (level) {
      case 'excellent':
        return <StarIcon className="h-4 w-4" />;
      case 'good':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'average':
        return <ClockIcon className="h-4 w-4" />;
      case 'poor':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalSuppliers = performance.length;
  const excellentSuppliers = performance.filter(s => s.performanceLevel === 'excellent').length;
  const goodSuppliers = performance.filter(s => s.performanceLevel === 'good').length;
  const poorSuppliers = performance.filter(s => s.performanceLevel === 'poor').length;
  const averageRating = performance.reduce((sum, s) => sum + s.rating, 0) / performance.length;
  const averageDeliveryTime = performance.reduce((sum, s) => sum + s.averageDeliveryTime, 0) / performance.length;
  const averageAccuracy = performance.reduce((sum, s) => sum + s.orderAccuracy, 0) / performance.length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Supplier Performance</h1>
            <p className="page-subtitle">Delivery time tracking, Order accuracy, Rating system (best suppliers)</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
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
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
                {averageRating.toFixed(1)}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <StarIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">{averageDeliveryTime.toFixed(1)} days</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{averageAccuracy.toFixed(1)}%</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Excellent</p>
              <p className="text-xl font-bold text-green-600">{excellentSuppliers}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <StarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Good</p>
              <p className="text-xl font-bold text-blue-600">{goodSuppliers}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average</p>
              <p className="text-xl font-bold text-yellow-600">
                {performance.filter(s => s.performanceLevel === 'average').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poor</p>
              <p className="text-xl font-bold text-red-600">{poorSuppliers}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
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
                placeholder="Search suppliers..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars (4.5+)</option>
              <option value="4">4 Stars (3.5-4.4)</option>
              <option value="3">3 Stars (2.5-3.4)</option>
              <option value="2">Below 3 Stars</option>
            </select>
            
            <select
              className="input"
              value={filterPerformance}
              onChange={(e) => setFilterPerformance(e.target.value)}
            >
              <option value="all">All Performance</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Performance Table */}
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
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPerformance.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                filteredPerformance.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.supplierName}</div>
                      <div className="text-xs text-gray-500">Last order: {supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString() : 'No orders'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className={`text-lg font-bold ${getRatingColor(supplier.rating)}`}>
                          {supplier.rating.toFixed(1)}
                        </span>
                        <StarIcon className={`h-4 w-4 ${getRatingColor(supplier.rating)}`} />
                      </div>
                      <div className="text-xs text-gray-500">out of 5.0</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getPerformanceIcon(supplier.performanceLevel)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(supplier.performanceLevel)}`}>
                          {supplier.performanceLevel.charAt(0).toUpperCase() + supplier.performanceLevel.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.averageDeliveryTime.toFixed(1)} days</div>
                      <div className="text-xs text-gray-500">On-time: {supplier.onTimeDeliveryRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.orderAccuracy.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{supplier.preferredProducts} preferred</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.totalOrders}</div>
                      <div className="text-xs text-gray-500">{supplier.deliveredOrders} delivered</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${supplier.totalValue.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openDetailsModal(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Performance Details Modal */}
      {showDetailsModal && selectedSupplier && (
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
              <h3 className="text-lg font-semibold text-gray-900">Performance Details - {selectedSupplier.supplierName}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Rating</p>
                <div className="flex items-center space-x-1">
                  <span className={`text-lg font-bold ${getRatingColor(selectedSupplier.rating)}`}>
                    {selectedSupplier.rating.toFixed(1)}
                  </span>
                  <StarIcon className={`h-4 w-4 ${getRatingColor(selectedSupplier.rating)}`} />
                  <span className="text-sm text-gray-500">/ 5.0</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Level</p>
                <div className="flex items-center space-x-2">
                  {getPerformanceIcon(selectedSupplier.performanceLevel)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(selectedSupplier.performanceLevel)}`}>
                    {selectedSupplier.performanceLevel.charAt(0).toUpperCase() + selectedSupplier.performanceLevel.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-sm text-gray-900">{selectedSupplier.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
                <p className="text-sm text-gray-900">{selectedSupplier.deliveredOrders}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-sm text-gray-900">{selectedSupplier.totalProducts}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Preferred Products</p>
                <p className="text-sm text-gray-900">{selectedSupplier.preferredProducts}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Delivery Time</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{selectedSupplier.averageDeliveryTime.toFixed(1)} days</span>
                    {selectedSupplier.averageDeliveryTime <= 3 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : selectedSupplier.averageDeliveryTime <= 7 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On-Time Delivery Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{selectedSupplier.onTimeDeliveryRate.toFixed(1)}%</span>
                    {selectedSupplier.onTimeDeliveryRate >= 90 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : selectedSupplier.onTimeDeliveryRate >= 70 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Accuracy</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{selectedSupplier.orderAccuracy.toFixed(1)}%</span>
                    {selectedSupplier.orderAccuracy >= 80 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : selectedSupplier.orderAccuracy >= 60 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{selectedSupplier.qualityScore.toFixed(1)}%</span>
                    {selectedSupplier.qualityScore >= 80 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : selectedSupplier.qualityScore >= 60 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Responsiveness Score</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{selectedSupplier.responsivenessScore.toFixed(1)}%</span>
                    {selectedSupplier.responsivenessScore >= 80 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : selectedSupplier.responsivenessScore >= 60 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost Effectiveness</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{selectedSupplier.costEffectiveness.toFixed(1)}%</span>
                    {selectedSupplier.costEffectiveness >= 80 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : selectedSupplier.costEffectiveness >= 60 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Last Updated: {new Date(selectedSupplier.updatedAt).toLocaleString()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SupplierPerformance;
