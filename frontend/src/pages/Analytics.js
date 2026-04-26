import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import mockData from '../data/mockData';

const Analytics = () => {
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Process inventory data for category analysis
  const getInventoryCategoryData = () => {
    const categoryMap = {};
    mockData.products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          _id: category,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      categoryMap[category].totalQuantity += product.quantity || 0;
      categoryMap[category].totalValue += (product.quantity || 0) * (product.price?.selling || 0);
    });
    return Object.values(categoryMap);
  };

  // Process assets data for depreciation schedule
  const getAssetDepreciationData = () => {
    return mockData.assets.map(asset => ({
      asset_name: asset.asset_name,
      purchase_cost: asset.purchase_cost?.amount || 0,
      currentValue: asset.current_value?.amount || 0
    }));
  };

  // Process transactions data for revenue by type
  const getTransactionRevenueData = () => {
    const typeMap = {};
    mockData.paymentTransactions.forEach(txn => {
      const type = txn.transaction_type || 'other';
      if (!typeMap[type]) {
        typeMap[type] = {
          _id: type.charAt(0).toUpperCase() + type.slice(1),
          totalAmount: 0
        };
      }
      typeMap[type].totalAmount += txn.amount || 0;
    });
    return Object.values(typeMap);
  };

  // Process suppliers data for top performers
  const getSupplierPerformanceData = () => {
    return mockData.suppliers.map(supplier => ({
      name: supplier.name,
      performance: {
        rating: 4 + Math.random(),
        on_time_delivery: Math.floor(85 + Math.random() * 15)
      }
    })).slice(0, 5);
  };

  const InventoryTrendsChart = () => {
    const data = getInventoryCategoryData();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Category Analysis</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'totalQuantity' ? value : formatCurrency(value),
                name === 'totalQuantity' ? 'Quantity' : 'Value'
              ]}
            />
            <Legend />
            <Bar dataKey="totalQuantity" fill="#3b82f6" name="Stock Quantity" />
            <Bar dataKey="totalValue" fill="#22c55e" name="Total Value" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  const AssetDepreciationChart = () => {
    const data = getAssetDepreciationData();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Depreciation Schedule</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="asset_name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="purchase_cost" 
              stackId="1"
              stroke="#3b82f6" 
              fill="#3b82f6" 
              name="Purchase Cost"
            />
            <Area 
              type="monotone" 
              dataKey="currentValue" 
              stackId="2"
              stroke="#ef4444" 
              fill="#ef4444" 
              name="Current Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  const TransactionFlowChart = () => {
    const data = getTransactionRevenueData();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Revenue by Type</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ _id, totalAmount }) => `${_id}: ${formatCurrency(totalAmount)}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="totalAmount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  const SupplierPerformanceChart = () => {
    const data = getSupplierPerformanceData();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Suppliers</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="performance.rating" fill="#22c55e" name="Rating" />
            <Bar dataKey="performance.on_time_delivery" fill="#3b82f6" name="On-Time Delivery %" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into your inventory and operations</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryTrendsChart />
        <AssetDepreciationChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionFlowChart />
        <SupplierPerformanceChart />
      </div>
    </div>
  );
};

export default Analytics;
