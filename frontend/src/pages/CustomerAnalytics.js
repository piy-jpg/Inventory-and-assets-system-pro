import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  SparklesIcon,
  ArrowPathIcon,
  UsersIcon,
  CreditCardIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useQuery } from 'react-query';
import { customersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomerAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('all');
  const [chartType, setChartType] = useState('revenue');

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'customer-analytics',
    customersAPI.getAnalytics
  );

  const analytics = analyticsData?.data?.data || {};

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'No record';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleBack = () => {
    navigate('/contacts');
  };

  const filteredMonthlyRevenue = timeRange === 'all' 
    ? analytics.monthlyRevenue 
    : analytics.monthlyRevenue?.slice(-parseInt(timeRange)) || [];

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Customers
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-semibold text-lg">Customer Analytics</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="3">Last 3 Months</option>
                  <option value="6">Last 6 Months</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="revenue">Revenue</option>
                  <option value="customers">Customers</option>
                  <option value="segments">Segments</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white rounded-2xl shadow-xl border border-white/50 p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <UsersIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span>+12%</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.totalCustomers || 0}</div>
                  <div className="text-sm text-gray-500 font-medium">Total Customers</div>
                  <div className="text-xs text-blue-600 mt-2">{analytics.activeCustomers || 0} active this month</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white rounded-2xl shadow-xl border border-white/50 p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CurrencyDollarIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span>+8%</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(analytics.totalRevenue)}</div>
                  <div className="text-sm text-gray-500 font-medium">Total Revenue</div>
                  <div className="text-xs text-green-600 mt-2">All time earnings</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white rounded-2xl shadow-xl border border-white/50 p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-violet-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                      <SparklesIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span>+5%</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(analytics.averageOrderValue)}</div>
                  <div className="text-sm text-gray-500 font-medium">Avg Order Value</div>
                  <div className="text-xs text-purple-600 mt-2">Per transaction</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white rounded-2xl shadow-xl border border-white/50 p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                      <StarIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span>+3%</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.frequentBuyers?.length || 0}</div>
                  <div className="text-sm text-gray-500 font-medium">Frequent Buyers</div>
                  <div className="text-xs text-orange-600 mt-2">Regular customers</div>
                </div>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Revenue Chart */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-xl border border-white/50 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Monthly Revenue Trend</h3>
                    <p className="text-sm text-gray-500 mt-1">Revenue over time</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={filteredMonthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Customer Segments Pie Chart */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-xl border border-white/50 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Customer Segments</h3>
                    <p className="text-sm text-gray-500 mt-1">Distribution by category</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={analytics.segmentDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(analytics.segmentDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Top Customers */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Top Customers by Revenue</h3>
                    <p className="text-sm text-gray-500 mt-1">Highest performing customers</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <StarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  {analytics.topCustomers?.map((customer, index) => (
                    <motion.div
                      key={customer.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400' :
                            'bg-gradient-to-br from-blue-400 to-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{customer.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {customer.orders} orders · Last: {formatDate(customer.lastOrder)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-sm text-gray-500">
                          {customer.orders > 0 ? formatCurrency(customer.totalSpent / customer.orders) : formatCurrency(0)} avg
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Frequent Buyers */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Frequent Buyers</h3>
                    <p className="text-sm text-gray-500 mt-1">Customers with highest purchase frequency</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.frequentBuyers?.map((customer, index) => (
                    <motion.div
                      key={customer.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                          <p className="text-sm text-gray-500">
                            {customer.totalPurchases} purchases
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-lg">{formatCurrency(customer.avgOrderValue)}</div>
                        <div className="text-sm text-gray-500">avg order</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Payment Status Distribution */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Payment Status Distribution</h3>
                    <p className="text-sm text-gray-500 mt-1">Overview of payment statuses across all customers</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <CreditCardIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                  >
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {analytics.paymentStatus?.paid || 0}%
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-4">Paid</div>
                    <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.paymentStatus?.paid || 0}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100"
                  >
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {analytics.paymentStatus?.pending || 0}%
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-4">Pending</div>
                    <div className="w-full bg-yellow-200 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.paymentStatus?.pending || 0}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-100"
                  >
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {analytics.paymentStatus?.overdue || 0}%
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-4">Overdue</div>
                    <div className="w-full bg-red-200 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.paymentStatus?.overdue || 0}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
