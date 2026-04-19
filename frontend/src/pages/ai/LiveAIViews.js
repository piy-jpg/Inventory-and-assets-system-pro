import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  PlayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  BanknotesIcon,
  UserGroupIcon,
  BellIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  aiAPI,
  alertsAPI,
  analyticsAPI,
  customersAPI,
  inventoryAPI,
  salesAPI
} from '../../services/api';

const LIVE_INTERVAL = 15000;

const currency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const csvEscape = (value) => {
  const stringValue = value == null ? '' : String(value);
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
};

const downloadCsv = (fileName, headers, rows) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Shell = ({ title, description, icon: Icon, controls, stats, children, isFetching }) => (
  <div className="page-stack">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Icon className="h-8 w-8 mr-3 text-primary-600" />
              {title}
            </h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          <div className="text-sm text-gray-500">
            {isFetching ? 'Refreshing live data...' : `Auto-refresh every ${LIVE_INTERVAL / 1000}s`}
          </div>
        </div>

        {controls ? <div className="mb-6">{controls}</div> : null}

        {stats?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                {stat.subtext ? <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {children}
      </div>
  </div>
);

const CardGrid = ({ items, renderCard }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    {items.map((item, index) => (
      <motion.div
        key={item.id || item._id || item.name || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
      >
        {renderCard(item)}
      </motion.div>
    ))}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
    {message}
  </div>
);

const QueryError = ({ error }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    {error?.response?.data?.message || error?.message || 'Unable to load live data.'}
  </div>
);

const DataTable = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200 bg-white">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-gray-500">
              No live records available.
            </td>
          </tr>
        ) : rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-gray-50">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-4 py-3 text-sm text-gray-700 whitespace-pre-line">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const DemandForecastingView = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery(['ai-demand-inventory'], () => inventoryAPI.getAll({ limit: 100 }), {
    refetchInterval: LIVE_INTERVAL
  });

  const products = inventoryQuery.data?.data?.data?.inventory || [];
  const selectedItem = products.find((item) => item._id === selectedProduct) || products[0];
  const period = timeRange === 'weekly' ? 7 : timeRange === 'quarterly' ? 90 : 30;

  const predictMutation = useMutation(
    () => aiAPI.predictDemand({ inventory_id: selectedItem?._id, period }),
    {
      onSuccess: (response) => {
        setLastResult(response.data.data);
        toast.success('Live demand forecast updated');
        queryClient.invalidateQueries('ai-demand-inventory');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Forecast update failed');
      }
    }
  );

  const visibleProducts = selectedProduct ? products.filter((item) => item._id === selectedProduct) : products.slice(0, 12);
  const stats = [
    { label: 'Tracked Products', value: products.length },
    { label: 'Forecasted Items', value: products.filter((item) => item.aiPredictedDemand?.next30Days != null).length },
    { label: 'Low Stock Products', value: products.filter((item) => item.quantity <= item.minStockLevel).length },
    { label: 'Selected Window', value: `${period} days` }
  ];

  return (
    <Shell
      title="Demand Forecasting"
      description="Live product demand prediction using current inventory and transaction history."
      icon={ChartBarIcon}
      isFetching={inventoryQuery.isFetching}
      stats={stats}
      controls={
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="input">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input">
            <option value="">Top 12 Products</option>
            {products.map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>
          <button onClick={() => predictMutation.mutate()} disabled={!selectedItem || predictMutation.isLoading} className="btn btn-primary flex items-center justify-center">
            <PlayIcon className="h-5 w-5 mr-2" />
            {predictMutation.isLoading ? 'Running Forecast...' : 'Run Live Forecast'}
          </button>
        </div>
      }
    >
      {inventoryQuery.isError ? <QueryError error={inventoryQuery.error} /> : null}
      {lastResult ? (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900">
          <div className="flex items-start">
            <LightBulbIcon className="h-5 w-5 mt-0.5 mr-3" />
            <div>
              <p className="font-semibold">Latest Forecast Result</p>
              <p className="text-sm mt-1">
                Predicted demand: {lastResult.predictedDemand?.next30Days || 0} in 30 days, confidence {lastResult.predictedDemand?.confidence || 0}%.
              </p>
              <p className="text-sm mt-1">{lastResult.recommendation}</p>
            </div>
          </div>
        </div>
      ) : null}
      {inventoryQuery.isLoading ? <EmptyState message="Loading live inventory data..." /> : null}
      {!inventoryQuery.isLoading && visibleProducts.length === 0 ? <EmptyState message="No products available for forecasting yet." /> : null}
      {!inventoryQuery.isLoading && visibleProducts.length > 0 ? (
        <CardGrid
          items={visibleProducts}
          renderCard={(item) => {
            const prediction = item.aiPredictedDemand;
            const diff = prediction?.next30Days != null ? prediction.next30Days - item.quantity : null;
            const trendUp = (diff || 0) >= 0;
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  {diff != null ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {trendUp ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                      {trendUp ? '+' : ''}{diff}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Needs forecast</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Current stock</span><span className="font-medium">{item.quantity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">30-day demand</span><span className="font-medium text-primary-600">{prediction?.next30Days ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">90-day demand</span><span className="font-medium">{prediction?.next90Days ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Confidence</span><span className="font-medium">{prediction?.confidence ? `${prediction.confidence}%` : '-'}</span></div>
                </div>
              </div>
            );
          }}
        />
      ) : null}
    </Shell>
  );
};

export const SmartReorderView = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const suggestionsQuery = useQuery(['ai-restock-suggestions'], () => aiAPI.getRestockSuggestions({}), {
    refetchInterval: LIVE_INTERVAL
  });

  const suggestions = suggestionsQuery.data?.data?.data?.suggestions || [];
  const filtered = selectedProduct ? suggestions.filter((item) => item.inventory_id === selectedProduct) : suggestions;
  const stats = [
    { label: 'Suggestions', value: suggestionsQuery.data?.data?.data?.total_suggestions || suggestions.length },
    { label: 'Critical', value: suggestionsQuery.data?.data?.data?.critical_count || 0 },
    { label: 'Urgent Suppliers', value: new Set(suggestions.filter((item) => item.urgency === 'critical').map((item) => item.supplier?.company_name || item.supplier?.name).filter(Boolean)).size },
    { label: 'Estimated Reorder Cost', value: currency(suggestions.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)) }
  ];

  return (
    <Shell
      title="Smart Reorder System"
      description="Live reorder recommendations based on stock position and transaction-driven demand."
      icon={ArrowPathIcon}
      isFetching={suggestionsQuery.isFetching}
      stats={stats}
      controls={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input">
            <option value="">All Suggested Products</option>
            {suggestions.map((item) => (
              <option key={item.inventory_id} value={item.inventory_id}>{item.name}</option>
            ))}
          </select>
          <button onClick={() => suggestionsQuery.refetch()} className="btn btn-primary flex items-center justify-center">
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh Live Suggestions
          </button>
        </div>
      }
    >
      {suggestionsQuery.isError ? <QueryError error={suggestionsQuery.error} /> : null}
      {!filtered.length && !suggestionsQuery.isLoading ? <EmptyState message="No live reorder suggestions right now." /> : null}
      {filtered.length > 0 ? (
        <CardGrid
          items={filtered}
          renderCard={(item) => (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  {item.urgency}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Current stock</span><span className="font-medium">{item.current_stock}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Suggested qty</span><span className="font-medium text-primary-600">{item.suggested_quantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Supplier</span><span className="font-medium">{item.supplier?.company_name || item.supplier?.name || 'Unassigned'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Estimated cost</span><span className="font-medium">{currency(item.estimated_cost)}</span></div>
              </div>
              <p className="text-sm text-gray-600 mt-4">{item.reason}</p>
            </div>
          )}
        />
      ) : null}
    </Shell>
  );
};

export const InventoryOptimizationView = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const inventoryQuery = useQuery(['ai-inventory-optimization'], () => inventoryAPI.getAll({ limit: 100 }), {
    refetchInterval: LIVE_INTERVAL
  });

  const items = inventoryQuery.data?.data?.data?.inventory || [];
  const categories = ['all', ...new Set(items.map((item) => item.category).filter(Boolean))];
  const optimized = items.map((item) => {
    let status = 'balanced';
    let recommendation = 'Maintain current levels';
    if (item.quantity > item.maxStockLevel) {
      status = 'overstock';
      recommendation = `Reduce by ${item.quantity - item.maxStockLevel} units or increase promotion velocity`;
    } else if (item.quantity <= item.minStockLevel) {
      status = 'understock';
      recommendation = `Increase stock by at least ${Math.max(item.reorderQuantity || 0, item.minStockLevel - item.quantity)}`;
    } else if (item.status === 'discontinued') {
      status = 'deadStock';
      recommendation = 'Clear or bundle discontinued stock';
    }
    return { ...item, statusLabel: status, recommendation };
  });
  const filtered = selectedCategory === 'all' ? optimized : optimized.filter((item) => item.category === selectedCategory);
  const stats = [
    { label: 'Balanced Items', value: optimized.filter((item) => item.statusLabel === 'balanced').length },
    { label: 'Overstock', value: optimized.filter((item) => item.statusLabel === 'overstock').length },
    { label: 'Understock', value: optimized.filter((item) => item.statusLabel === 'understock').length },
    { label: 'Dead Stock', value: optimized.filter((item) => item.statusLabel === 'deadStock').length }
  ];

  const statusClasses = {
    balanced: 'bg-green-100 text-green-800',
    overstock: 'bg-orange-100 text-orange-800',
    understock: 'bg-blue-100 text-blue-800',
    deadStock: 'bg-red-100 text-red-800'
  };

  return (
    <Shell
      title="Inventory Optimization"
      description="Live stock balancing insights using min/max levels, reorder settings, and current stock."
      icon={CubeIcon}
      isFetching={inventoryQuery.isFetching}
      stats={stats}
      controls={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input">
            {categories.map((category) => <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>)}
          </select>
          <button onClick={() => inventoryQuery.refetch()} className="btn btn-primary flex items-center justify-center">
            <CubeIcon className="h-5 w-5 mr-2" />
            Refresh Optimization
          </button>
        </div>
      }
    >
      {inventoryQuery.isError ? <QueryError error={inventoryQuery.error} /> : null}
      {!filtered.length && !inventoryQuery.isLoading ? <EmptyState message="No inventory items available for optimization." /> : null}
      {filtered.length > 0 ? (
        <CardGrid
          items={filtered}
          renderCard={(item) => (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[item.statusLabel]}`}>
                  {item.statusLabel}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Current stock</span><span className="font-medium">{item.quantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Min / Max</span><span className="font-medium">{item.minStockLevel} / {item.maxStockLevel}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Reorder point</span><span className="font-medium">{item.reorderPoint || '-'}</span></div>
              </div>
              <p className="mt-4 text-sm text-gray-600">{item.recommendation}</p>
            </div>
          )}
        />
      ) : null}
    </Shell>
  );
};

export const ProfitPricingView = () => {
  const pricingQuery = useQuery(['ai-profit-pricing'], async () => {
    const [inventoryResponse, salesResponse] = await Promise.all([
      inventoryAPI.getAll({ limit: 100 }),
      salesAPI.getAll({ limit: 100 })
    ]);
    return { inventoryResponse, salesResponse };
  }, { refetchInterval: LIVE_INTERVAL });

  const inventory = pricingQuery.data?.inventoryResponse?.data?.data?.inventory || [];
  const sales = pricingQuery.data?.salesResponse?.data?.data?.sales || [];

  const salesByProduct = {};
  sales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const id = item.product?._id || item.product;
      if (!id) return;
      if (!salesByProduct[id]) salesByProduct[id] = { quantity: 0, revenue: 0 };
      salesByProduct[id].quantity += item.quantity || 0;
      salesByProduct[id].revenue += item.total || 0;
    });
  });

  const pricingRows = inventory.slice(0, 18).map((item) => {
    const liveSales = salesByProduct[item._id] || { quantity: 0, revenue: 0 };
    const margin = item.price?.selling && item.price?.cost ? (((item.price.selling - item.price.cost) / item.price.selling) * 100) : 0;
    const recommendation = liveSales.quantity > item.quantity
      ? 'Demand is stronger than stock; consider a price increase'
      : item.quantity > item.maxStockLevel
      ? 'Inventory is heavy; consider a promotional discount'
      : 'Current pricing is stable';
    return {
      ...item,
      soldUnits: liveSales.quantity,
      margin,
      recommendation
    };
  });

  const stats = [
    { label: 'Average Margin', value: `${(pricingRows.reduce((sum, row) => sum + row.margin, 0) / Math.max(pricingRows.length, 1)).toFixed(1)}%` },
    { label: 'High Velocity Products', value: pricingRows.filter((row) => row.soldUnits > row.quantity).length },
    { label: 'Overstock Pressure', value: pricingRows.filter((row) => row.quantity > row.maxStockLevel).length },
    { label: 'Potential Revenue', value: currency(pricingRows.reduce((sum, row) => sum + (row.soldUnits * (row.price?.selling || 0)), 0)) }
  ];

  return (
    <Shell
      title="Profit & Pricing"
      description="Live pricing intelligence based on current margins, inventory pressure, and recent sales."
      icon={CurrencyDollarIcon}
      isFetching={pricingQuery.isFetching}
      stats={stats}
    >
      {pricingQuery.isError ? <QueryError error={pricingQuery.error} /> : null}
      <DataTable
        headers={['Product', 'Current Price', 'Cost', 'Margin', 'Sold Units', 'Recommendation']}
        rows={pricingRows.map((row) => [
          row.name,
          currency(row.price?.selling),
          currency(row.price?.cost),
          `${row.margin.toFixed(1)}%`,
          row.soldUnits,
          row.recommendation
        ])}
      />
    </Shell>
  );
};

export const ExpenseIntelligenceView = () => {
  const [period, setPeriod] = useState(30);
  const query = useQuery(['ai-expense-insights', period], () => aiAPI.getExpenseInsights({ period }), {
    refetchInterval: LIVE_INTERVAL
  });
  const data = query.data?.data?.data;
  const stats = [
    { label: 'Total Expenses', value: currency(data?.summary?.totalExpenses || 0) },
    { label: 'Avg Daily Expense', value: currency(data?.summary?.avgDailyExpense || 0) },
    { label: 'Outliers', value: data?.summary?.unusualTransactionsCount || 0 },
    { label: 'Potential Savings', value: currency(data?.summary?.potentialSavings || 0) }
  ];

  return (
    <Shell
      title="Expense Intelligence"
      description="Live expense trend analysis, unusual-spend detection, and cost optimization opportunities."
      icon={ReceiptRefundIcon}
      isFetching={query.isFetching}
      stats={stats}
      controls={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="input">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={() => query.refetch()} className="btn btn-primary">Refresh Expense Insights</button>
        </div>
      }
    >
      {query.isError ? <QueryError error={query.error} /> : null}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable
          headers={['Category', 'Total Amount', 'Transactions']}
          rows={(data?.topExpenseCategories || []).map((item) => [item._id || 'Uncategorized', currency(item.totalAmount), item.count])}
        />
        <DataTable
          headers={['Item', 'Quantity', 'Max Level', 'Potential Savings']}
          rows={(data?.costOptimization || []).map((item) => [item.name, item.quantity, item.maxStockLevel, currency(item.potentialSavings)])}
        />
      </div>
    </Shell>
  );
};

export const FraudDetectionView = () => {
  const [period, setPeriod] = useState(30);
  const query = useQuery(['ai-fraud-detection', period], () => aiAPI.getFraudDetection({ period }), {
    refetchInterval: LIVE_INTERVAL
  });
  const data = query.data?.data?.data;
  const alerts = data?.fraudAlerts || [];
  const stats = [
    { label: 'Total Alerts', value: data?.summary?.totalAlerts || 0 },
    { label: 'High Risk', value: data?.summary?.highRiskAlerts || 0 },
    { label: 'Medium Risk', value: data?.summary?.mediumRiskAlerts || 0 },
    { label: 'Top Risk Score', value: alerts[0]?.risk_score || 0 }
  ];

  return (
    <Shell
      title="Fraud Detection"
      description="Live anomaly scanning across transactions, users, duplicates, and unusual time clusters."
      icon={ExclamationTriangleIcon}
      isFetching={query.isFetching}
      stats={stats}
      controls={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="input">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={() => query.refetch()} className="btn btn-primary">Refresh Fraud Scan</button>
        </div>
      }
    >
      {query.isError ? <QueryError error={query.error} /> : null}
      {!alerts.length && !query.isLoading ? <EmptyState message="No suspicious live patterns detected right now." /> : null}
      {alerts.length > 0 ? (
        <CardGrid
          items={alerts.slice(0, 12)}
          renderCard={(alert) => (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{alert.type.replace(/_/g, ' ')}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600">Risk score: <span className="font-semibold text-gray-900">{alert.risk_score}</span></p>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-500 bg-gray-50 rounded-lg p-3">{JSON.stringify(alert.details, null, 2)}</pre>
            </div>
          )}
        />
      ) : null}
    </Shell>
  );
};

export const SalesIntelligenceView = () => {
  const query = useQuery(['ai-sales-intelligence'], async () => {
    const [summaryResponse, salesResponse] = await Promise.all([
      analyticsAPI.getReportsSummary(),
      salesAPI.getAll({ limit: 100 })
    ]);
    return { summaryResponse, salesResponse };
  }, { refetchInterval: LIVE_INTERVAL });

  const summary = query.data?.summaryResponse?.data?.data || {};
  const sales = query.data?.salesResponse?.data?.data?.sales || [];
  const topProduct = (() => {
    const map = {};
    sales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const name = item.product?.name || 'Unknown Product';
        if (!map[name]) map[name] = 0;
        map[name] += item.quantity || 0;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  })();
  const stats = [
    { label: 'Sales Total', value: currency(summary.sales?.total || 0) },
    { label: 'Sales Count', value: summary.sales?.count || sales.length },
    { label: 'Average Order', value: currency((summary.sales?.total || 0) / Math.max(summary.sales?.count || sales.length || 1, 1)) },
    { label: 'Best Seller', value: topProduct?.[0] || 'N/A', subtext: topProduct ? `${topProduct[1]} units` : undefined }
  ];

  return (
    <Shell
      title="Sales Intelligence"
      description="Live revenue, order mix, and best-seller trends from the current sales stream."
      icon={BanknotesIcon}
      isFetching={query.isFetching}
      stats={stats}
    >
      {query.isError ? <QueryError error={query.error} /> : null}
      <DataTable
        headers={['Sale ID', 'Customer', 'Date', 'Items', 'Method', 'Total']}
        rows={sales.slice(0, 20).map((sale) => [
          sale.sale_id,
          sale.customer_name,
          formatDate(sale.sale_date),
          sale.items?.length || 0,
          sale.payment_method,
          currency(sale.total_amount)
        ])}
      />
    </Shell>
  );
};

export const CustomerInsightsView = () => {
  const query = useQuery(['ai-customer-insights'], async () => {
    const [customersResponse, analyticsResponse] = await Promise.all([
      customersAPI.getAll({ limit: 50 }),
      customersAPI.getAnalytics()
    ]);
    return { customersResponse, analyticsResponse };
  }, { refetchInterval: LIVE_INTERVAL });

  const customers = query.data?.customersResponse?.data?.data?.customers || [];
  const analytics = query.data?.analyticsResponse?.data?.data || {};
  const stats = [
    { label: 'Total Customers', value: analytics.totalCustomers || customers.length },
    { label: 'Active Customers', value: analytics.activeCustomers || 0 },
    { label: 'Due Payments', value: analytics.duePayments || 0 },
    { label: 'Top Customer', value: analytics.topCustomers?.[0]?.name || 'N/A', subtext: analytics.topCustomers?.[0] ? currency(analytics.topCustomers[0].totalSpent) : undefined }
  ];

  return (
    <Shell
      title="Customer Insights"
      description="Live customer health, top spenders, and payment-risk visibility."
      icon={UserGroupIcon}
      isFetching={query.isFetching}
      stats={stats}
    >
      {query.isError ? <QueryError error={query.error} /> : null}
      <DataTable
        headers={['Customer', 'Group', 'Spent', 'Outstanding', 'Last Purchase', 'Status']}
        rows={customers.slice(0, 20).map((customer) => [
          customer.name,
          customer.group,
          currency(customer.metrics?.totalSpent || customer.total_spent || 0),
          currency(customer.metrics?.outstandingBalance || customer.outstanding_balance || 0),
          formatDate(customer.metrics?.lastPurchaseDate || customer.last_purchase_date),
          customer.status
        ])}
      />
    </Shell>
  );
};

export const SmartAlertsView = () => {
  const [selectedPriority, setSelectedPriority] = useState('all');
  const queryClient = useQueryClient();
  const alertsQuery = useQuery(['ai-smart-alerts'], () => alertsAPI.getAll({ limit: 50 }), {
    refetchInterval: 10000
  });
  const alerts = alertsQuery.data?.data?.data?.alerts || [];
  const filtered = selectedPriority === 'all' ? alerts : alerts.filter((alert) => alert.priority === selectedPriority);

  const acknowledgeMutation = useMutation((id) => alertsAPI.acknowledge(id), {
    onSuccess: () => queryClient.invalidateQueries('ai-smart-alerts')
  });
  const resolveMutation = useMutation(({ id }) => alertsAPI.resolve(id, {}), {
    onSuccess: () => queryClient.invalidateQueries('ai-smart-alerts')
  });

  const stats = [
    { label: 'Active Alerts', value: alerts.filter((alert) => alert.status === 'active').length },
    { label: 'Critical Priority', value: alerts.filter((alert) => alert.priority === 'urgent').length },
    { label: 'Acknowledged', value: alerts.filter((alert) => alert.status === 'acknowledged').length },
    { label: 'Resolved', value: alerts.filter((alert) => alert.status === 'resolved').length }
  ];

  return (
    <Shell
      title="Smart Alerts"
      description="Real-time alert stream with live acknowledge and resolve actions."
      icon={BellIcon}
      isFetching={alertsQuery.isFetching}
      stats={stats}
      controls={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="input">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button onClick={() => alertsQuery.refetch()} className="btn btn-primary">Refresh Alerts</button>
        </div>
      }
    >
      {alertsQuery.isError ? <QueryError error={alertsQuery.error} /> : null}
      {!filtered.length && !alertsQuery.isLoading ? <EmptyState message="No live alerts match this filter." /> : null}
      {filtered.length > 0 ? (
        <CardGrid
          items={filtered}
          renderCard={(alert) => (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{alert.status}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{alert.message}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className="font-medium">{alert.priority}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Severity</span><span className="font-medium">{alert.severity}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-medium">{formatDate(alert.timestamps?.created)}</span></div>
              </div>
              <div className="mt-4 flex gap-2">
                {alert.status === 'active' ? <button onClick={() => acknowledgeMutation.mutate(alert._id)} className="btn btn-secondary text-sm flex-1">Acknowledge</button> : null}
                {alert.status !== 'resolved' && alert.status !== 'dismissed' ? <button onClick={() => resolveMutation.mutate({ id: alert._id })} className="btn btn-primary text-sm flex-1">Resolve</button> : null}
              </div>
            </div>
          )}
        />
      ) : null}
    </Shell>
  );
};

export const SmartReportsView = () => {
  const [selectedReport, setSelectedReport] = useState('weekly-summary');
  const [reportFormat, setReportFormat] = useState('csv');
  const [schedule, setSchedule] = useState('manual');
  const query = useQuery(['ai-smart-reports'], async () => {
    const [summaryResponse, stockResponse, customerResponse, alertsResponse] = await Promise.all([
      analyticsAPI.getReportsSummary(),
      analyticsAPI.getStockReport(),
      customersAPI.getAnalytics(),
      alertsAPI.getAll({ limit: 20 })
    ]);
    return { summaryResponse, stockResponse, customerResponse, alertsResponse };
  }, { refetchInterval: LIVE_INTERVAL });

  const summary = query.data?.summaryResponse?.data?.data || {};
  const stock = query.data?.stockResponse?.data?.data || {};
  const customer = query.data?.customerResponse?.data?.data || {};
  const alerts = query.data?.alertsResponse?.data?.data?.alerts || [];

  const templates = [
    { id: 'weekly-summary', name: 'Weekly Summary', status: 'active', description: 'Business overview using live sales, purchases, expenses, and alert counts.' },
    { id: 'inventory-health', name: 'Inventory Health', status: 'active', description: 'Low stock, out of stock, and total inventory value.' },
    { id: 'customer-analytics', name: 'Customer Analytics', status: 'active', description: 'Top customers, active customers, and due payments.' },
    { id: 'risk-alerts', name: 'Risk & Alerts', status: 'active', description: 'Current alert status, severities, and response queue.' }
  ];

  const generateReportRows = () => {
    switch (selectedReport) {
      case 'inventory-health':
        return {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Items', stock.stats?.total_items || 0],
            ['Low Stock', stock.stats?.low_stock_items || 0],
            ['Out of Stock', stock.stats?.out_of_stock || 0],
            ['Inventory Value', currency(stock.stats?.total_value || 0)]
          ]
        };
      case 'customer-analytics':
        return {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Customers', customer.totalCustomers || 0],
            ['Active Customers', customer.activeCustomers || 0],
            ['Due Payments', customer.duePayments || 0],
            ['Top Customer', customer.topCustomers?.[0]?.name || 'N/A']
          ]
        };
      case 'risk-alerts':
        return {
          headers: ['Alert', 'Priority', 'Severity', 'Status'],
          rows: alerts.slice(0, 20).map((alert) => [alert.title, alert.priority, alert.severity, alert.status])
        };
      default:
        return {
          headers: ['Metric', 'Value'],
          rows: [
            ['Sales', currency(summary.sales?.total || 0)],
            ['Purchases', currency(summary.purchases?.total || 0)],
            ['Expenses', currency(summary.expenses?.total || 0)],
            ['Profit', currency(summary.profit || 0)]
          ]
        };
    }
  };

  const handleGenerateReport = () => {
    const report = generateReportRows();
    downloadCsv(`${selectedReport}.${reportFormat === 'csv' ? 'csv' : 'csv'}`, report.headers, report.rows);
    toast.success(`Live ${selectedReport.replace(/-/g, ' ')} report generated`);
  };

  const stats = [
    { label: 'Templates', value: templates.length },
    { label: 'Profit Snapshot', value: currency(summary.profit || 0) },
    { label: 'Low Stock', value: stock.stats?.low_stock_items || 0 },
    { label: 'Active Alerts', value: alerts.filter((alert) => alert.status === 'active').length }
  ];

  return (
    <Shell
      title="Smart Reports"
      description="Live report generation from current system data with export-ready output."
      icon={DocumentTextIcon}
      isFetching={query.isFetching}
      stats={stats}
      controls={
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)} className="input">
            {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
          <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="input">
            <option value="csv">CSV</option>
            <option value="excel">Excel-compatible CSV</option>
            <option value="pdf">Printable view</option>
          </select>
          <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className="input">
            <option value="manual">Manual</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      }
    >
      {query.isError ? <QueryError error={query.error} /> : null}
      <div className="mb-6">
        <button onClick={handleGenerateReport} className="btn btn-primary flex items-center px-6 py-3">
          <PlayIcon className="h-5 w-5 mr-2" />
          Generate Live Report
        </button>
        <p className="text-sm text-gray-500 mt-2">Schedule selection is saved in the UI for now. Generation uses live data immediately.</p>
      </div>
      <CardGrid
        items={templates}
        renderCard={(template) => (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">{template.name}</h4>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{template.status}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="text-xs text-gray-500">Next run mode: {schedule}</div>
          </div>
        )}
      />
    </Shell>
  );
};

export const AIAssistantView = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const query = useQuery(['ai-assistant-live-context'], async () => {
    const [lowStockResponse, summaryResponse, customerResponse, alertsResponse, salesResponse] = await Promise.all([
      inventoryAPI.getLowStock(),
      analyticsAPI.getReportsSummary(),
      customersAPI.getAnalytics(),
      alertsAPI.getAll({ limit: 20 }),
      salesAPI.getAll({ limit: 50 })
    ]);
    return { lowStockResponse, summaryResponse, customerResponse, alertsResponse, salesResponse };
  }, { refetchInterval: LIVE_INTERVAL });

  const lowStockItems = query.data?.lowStockResponse?.data?.data?.lowStockItems || [];
  const summary = query.data?.summaryResponse?.data?.data || {};
  const customer = query.data?.customerResponse?.data?.data || {};
  const alerts = query.data?.alertsResponse?.data?.data?.alerts || [];
  const sales = query.data?.salesResponse?.data?.data?.sales || [];

  const suggestions = [
    'Show low stock items',
    'Which product is best selling?',
    'Give me a weekly summary',
    'Show customer insights',
    'Analyze profit margins',
    'What alerts need attention?'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const bestSeller = (() => {
    const map = {};
    sales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const name = item.product?.name || 'Unknown Product';
        map[name] = (map[name] || 0) + (item.quantity || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  })();

  const buildResponse = (text) => {
    const queryText = text.toLowerCase();
    if (queryText.includes('low stock')) {
      return lowStockItems.length
        ? `Live low stock items:\n\n${lowStockItems.slice(0, 5).map((item) => `• ${item.name}: ${item.quantity} left (min ${item.minStockLevel})`).join('\n')}`
        : 'There are no live low stock items right now.';
    }
    if (queryText.includes('best selling') || queryText.includes('top product')) {
      return bestSeller
        ? `Current best seller is ${bestSeller[0]} with ${bestSeller[1]} units sold in the loaded live sales data.`
        : 'I do not have enough live sales data yet to identify a best seller.';
    }
    if (queryText.includes('customer')) {
      return `Customer snapshot:\n\n• Total customers: ${customer.totalCustomers || 0}\n• Active customers: ${customer.activeCustomers || 0}\n• Due payments: ${customer.duePayments || 0}\n• Top customer: ${customer.topCustomers?.[0]?.name || 'N/A'}`;
    }
    if (queryText.includes('profit') || queryText.includes('margin')) {
      return `Profit snapshot from live reports:\n\n• Sales: ${currency(summary.sales?.total || 0)}\n• Purchases: ${currency(summary.purchases?.total || 0)}\n• Expenses: ${currency(summary.expenses?.total || 0)}\n• Profit: ${currency(summary.profit || 0)}`;
    }
    if (queryText.includes('summary')) {
      return `Weekly-style live summary:\n\n• Sales total: ${currency(summary.sales?.total || 0)}\n• Purchase total: ${currency(summary.purchases?.total || 0)}\n• Expense total: ${currency(summary.expenses?.total || 0)}\n• Active alerts: ${alerts.filter((alert) => alert.status === 'active').length}`;
    }
    if (queryText.includes('alert')) {
      return alerts.length
        ? `Alerts needing attention:\n\n${alerts.slice(0, 5).map((alert) => `• ${alert.title} (${alert.priority}, ${alert.status})`).join('\n')}`
        : 'There are no live alerts in the current feed.';
    }
    return 'I can answer using live data about low stock, best sellers, customer insights, profit snapshots, weekly summaries, and active alerts.';
  };

  const handleSendMessage = () => {
    if (!aiQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    const userMessage = { role: 'user', text: aiQuery, timestamp: new Date() };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsTyping(true);

    window.setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: buildResponse(aiQuery), timestamp: new Date() }
      ]);
      setAiQuery('');
      setIsTyping(false);
    }, 500);
  };

  return (
    <Shell
      title="AI Assistant"
      description="Ask questions against live inventory, sales, customer, and alert data."
      icon={SparklesIcon}
      isFetching={query.isFetching}
      stats={[
        { label: 'Low Stock Items', value: lowStockItems.length },
        { label: 'Top Customer', value: customer.topCustomers?.[0]?.name || 'N/A' },
        { label: 'Profit Snapshot', value: currency(summary.profit || 0) },
        { label: 'Active Alerts', value: alerts.filter((alert) => alert.status === 'active').length }
      ]}
    >
      {query.isError ? <QueryError error={query.error} /> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button key={suggestion} onClick={() => setAiQuery(suggestion)} className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200">
            {suggestion}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          placeholder="Ask something about live business data..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <button onClick={handleSendMessage} disabled={isTyping} className="btn btn-primary px-5">Send</button>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto space-y-3">
        <AnimatePresence>
          {chatHistory.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-3 rounded-lg max-w-[75%] ${message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                <span className="text-xs opacity-70 block mt-1">{message.timestamp.toLocaleTimeString()}</span>
              </div>
            </motion.div>
          ))}
          {isTyping ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-500">Thinking over live data...</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>
    </Shell>
  );
};
