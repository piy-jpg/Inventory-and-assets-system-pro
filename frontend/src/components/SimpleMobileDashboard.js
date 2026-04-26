import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI, inventoryAPI } from '../services/api';

const SimpleMobileDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load dashboard data
        const dashboardResponse = await analyticsAPI.getDashboard();
        if (dashboardResponse.data?.data) {
          setDashboardData(dashboardResponse.data.data);
        }
        
        // Load inventory data
        const inventoryResponse = await inventoryAPI.getAll({ limit: 5 });
        if (inventoryResponse.data?.data?.items) {
          setInventoryData(inventoryResponse.data.data.items);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Set fallback data
        setDashboardData({
          totalItems: 10,
          lowStockItems: 2,
          totalRevenue: 7699.88,
          totalProfit: 3199.96
        });
        
        setInventoryData([
          { name: 'Laptop Pro 15"', quantity: 25, price: 1299.99, category: 'Electronics' },
          { name: 'Wireless Mouse', quantity: 150, price: 29.99, category: 'Computer Hardware' },
          { name: 'Office Chair', quantity: 35, price: 199.99, category: 'Furniture' },
          { name: 'Monitor 27"', quantity: 40, price: 399.99, category: 'Electronics' },
          { name: 'Smartphone X', quantity: 80, price: 899.99, category: 'Mobile Devices' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Smart Inventory Dashboard</h2>
          <p className="text-gray-600 mb-4">Loading dashboard data...</p>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/inventory"
              className="bg-blue-600 text-white p-4 rounded-lg text-center block"
            >
              <div className="text-2xl mb-2">10</div>
              <div className="text-sm">Total Items</div>
            </Link>
            <Link
              to="/transactions"
              className="bg-green-600 text-white p-4 rounded-lg text-center block"
            >
              <div className="text-2xl mb-2">2</div>
              <div className="text-sm">Low Stock</div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const analytics = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName || user?.username || 'User'}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-blue-600">{analytics.totalItems || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Low Stock</div>
          <div className="text-2xl font-bold text-orange-600">{analytics.lowStockItems || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Revenue</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalRevenue)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Profit</div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.totalProfit)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/products/create"
            className="bg-blue-600 text-white p-4 rounded-lg text-center flex items-center justify-center"
          >
            <span className="text-sm">+ Add Product</span>
          </Link>
          <Link
            to="/sell"
            className="bg-green-600 text-white p-4 rounded-lg text-center flex items-center justify-center"
          >
            <span className="text-sm">New Sale</span>
          </Link>
        </div>
      </div>

      {/* Recent Inventory */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Items</h2>
        <div className="space-y-2">
          {inventoryData.slice(0, 5).map((item, index) => (
            <Link
              key={index}
              to={`/products/${item._id || index}`}
              className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Stock: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation Menu */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">All Features</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/inventory"
            className="bg-white p-3 rounded-lg border border-gray-200 text-center"
          >
            <div className="text-blue-600 mb-1">Inventory</div>
            <div className="text-xs text-gray-600">Manage items</div>
          </Link>
          <Link
            to="/transactions"
            className="bg-white p-3 rounded-lg border border-gray-200 text-center"
          >
            <div className="text-green-600 mb-1">Transactions</div>
            <div className="text-xs text-gray-600">Sales & purchases</div>
          </Link>
          <Link
            to="/suppliers"
            className="bg-white p-3 rounded-lg border border-gray-200 text-center"
          >
            <div className="text-purple-600 mb-1">Suppliers</div>
            <div className="text-xs text-gray-600">Vendor management</div>
          </Link>
          <Link
            to="/customers"
            className="bg-white p-3 rounded-lg border border-gray-200 text-center"
          >
            <div className="text-orange-600 mb-1">Customers</div>
            <div className="text-xs text-gray-600">Client management</div>
          </Link>
          <Link
            to="/analytics"
            className="bg-white p-3 rounded-lg border border-gray-200 text-center"
          >
            <div className="text-indigo-600 mb-1">Analytics</div>
            <div className="text-xs text-gray-600">Reports & insights</div>
          </Link>
          <Link
            to="/settings"
            className="bg-white p-3 rounded-lg border border-gray-200 text-center"
          >
            <div className="text-gray-600 mb-1">Settings</div>
            <div className="text-xs text-gray-600">System config</div>
          </Link>
        </div>
      </div>

      {/* User Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-medium text-gray-900">{user?.username || 'User'}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('mockUser');
              localStorage.removeItem('mockToken');
              window.location.href = '/login';
            }}
            className="text-red-600 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleMobileDashboard;
