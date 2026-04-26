import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useRealTimeUpdates, useRealTimeDataSync, useRealTimeState } from '../hooks/useRealTimeUpdates';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import {
  ArrowTrendingUpIcon,
  BellAlertIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  TruckIcon,
  WalletIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChartPieIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ReceiptRefundIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import {
  analyticsAPI,
  alertsAPI,
  assetsAPI,
  customersAPI,
  expensesAPI,
  inventoryAPI,
  invoicesAPI,
  paymentAccountsAPI,
  purchasesAPI,
  salesAPI,
  suppliersAPI,
} from '../services/api';
import toast from 'react-hot-toast';

const statCards = [
  {
    title: 'Inventory Value',
    value: '$248,900',
    delta: '+12.4% vs last month',
    icon: CubeIcon,
    accent: 'from-sky-500 to-blue-700',
    tone: 'text-sky-700',
    surface: 'bg-sky-50 border-sky-100',
  },
  {
    title: 'Today Sales',
    value: '$18,420',
    delta: '38 invoices completed',
    icon: ShoppingCartIcon,
    accent: 'from-emerald-500 to-teal-700',
    tone: 'text-emerald-700',
    surface: 'bg-emerald-50 border-emerald-100',
  },
  {
    title: 'Total Assets',
    value: '284',
    delta: '267 Active / 12 In Maintenance / 5 Retired',
    icon: WrenchScrewdriverIcon,
    accent: 'from-purple-500 to-indigo-700',
    tone: 'text-purple-700',
    surface: 'bg-purple-50 border-purple-100',
  },
  {
    title: 'Cash Position',
    value: '$64,120',
    delta: 'Across 6 payment accounts',
    icon: WalletIcon,
    accent: 'from-violet-500 to-indigo-700',
    tone: 'text-violet-700',
    surface: 'bg-violet-50 border-violet-100',
  },
];

const advancedKPIs = [
  {
    title: 'Inventory Turnover',
    value: '8.4',
    delta: '+15% vs last quarter',
    icon: ChartPieIcon,
    accent: 'from-orange-500 to-red-600',
    tone: 'text-orange-700',
    surface: 'bg-orange-50 border-orange-100',
  },
  {
    title: 'Stock Aging',
    value: '24 days',
    delta: '-3 days improvement',
    icon: ClockIcon,
    accent: 'from-cyan-500 to-blue-600',
    tone: 'text-cyan-700',
    surface: 'bg-cyan-50 border-cyan-100',
  },
  {
    title: 'Fulfillment Rate',
    value: '94.2%',
    delta: '+2.1% vs last month',
    icon: CheckCircleIcon,
    accent: 'from-green-500 to-emerald-600',
    tone: 'text-green-700',
    surface: 'bg-green-50 border-green-100',
  },
  {
    title: 'Return Rate',
    value: '2.8%',
    delta: '-0.5% improvement',
    icon: XCircleIcon,
    accent: 'from-red-500 to-rose-600',
    tone: 'text-red-700',
    surface: 'bg-red-50 border-red-100',
  },
];

const aiDecisionCards = [
  {
    title: '🔮 Demand Spike Prediction',
    description: 'Wireless Barcode Scanner demand expected +35% next 3 days',
    cta: 'View Forecast',
    href: '/ai-insights/demand-forecasting',
    icon: ArrowTrendingUpIcon,
    color: 'text-purple-600',
    panel: 'from-purple-500/10 via-white to-indigo-500/10',
    urgency: 'high'
  },
  {
    title: '💸 Dead Stock Detection',
    description: '5 products not sold in 30 days → worth $12,400',
    cta: 'Take Action',
    href: '/ai-insights/inventory-optimization',
    icon: XCircleIcon,
    color: 'text-red-600',
    panel: 'from-red-500/10 via-white to-rose-500/10',
    urgency: 'critical'
  },
  {
    title: '📉 Profit Leakage Alert',
    description: 'Low margin detected on 3 products',
    cta: 'Analyze Margins',
    href: '/ai-insights/profit-pricing',
    icon: ExclamationCircleIcon,
    color: 'text-amber-600',
    panel: 'from-amber-500/10 via-white to-orange-500/10',
    urgency: 'medium'
  },
];

const assetHealthPanel = {
  totalAssets: 284,
  active: 267,
  maintenance: 12,
  retired: 5,
  utilization: 87.3,
  depreciation: {
    monthly: '$2,450',
    yearly: '$29,400'
  },
  topFailingAssets: [
    { name: 'Warehouse Scanner WS-001', issue: 'Calibration error', priority: 'high' },
    { name: 'POS Terminal POS-003', issue: 'Memory low', priority: 'medium' },
    { name: 'Label Printer LP-002', issue: 'Paper jam frequent', priority: 'low' }
  ],
  maintenanceDue: [
    { name: 'Forklift FL-001', due: '2 days', type: 'Routine' },
    { name: 'Conveyor Belt CV-004', due: '3 days', type: 'Inspection' },
    { name: 'Security Camera SC-007', due: '5 days', type: 'Cleaning' }
  ]
};

const profitLossSnapshot = {
  revenue: '$18,420',
  cost: '$12,300',
  profit: '$6,120',
  margin: '33%',
  trend: '+5.2% vs last month'
};

const riskScore = {
  score: 68,
  level: 'Moderate Attention Needed',
  factors: [
    { name: 'Low Stock Items', count: 7, impact: 'high' },
    { name: 'Pending Payments', count: 4, impact: 'medium' },
    { name: 'Delayed Purchases', count: 3, impact: 'medium' }
  ]
};

const inventoryMovement = {
  inflow: 145,
  outflow: 128,
  net: 17,
  fastMoving: 89,
  slowMoving: 23,
  deadStock: 8
};

const customerVendorInsights = {
  topCustomers: [
    { name: 'Tech Solutions Inc', revenue: '$4,250', orders: 12 },
    { name: 'Retail Corp International', revenue: '$3,890', orders: 8 },
    { name: 'Smart Store Chain', revenue: '$2,780', orders: 15 },
    { name: 'Digital Electronics Hub', revenue: '$2,450', orders: 9 },
    { name: 'Global Tech Distributors', revenue: '$2,120', orders: 11 },
    { name: 'Innovation Systems Ltd', revenue: '$1,980', orders: 7 },
    { name: 'Future Tech Solutions', revenue: '$1,750', orders: 14 },
    { name: 'Advanced Hardware Co', revenue: '$1,620', orders: 6 },
    { name: 'Smart Devices Inc', revenue: '$1,450', orders: 10 },
    { name: 'Tech Retail Group', revenue: '$1,320', orders: 8 },
    { name: 'Digital Supply Chain', revenue: '$1,180', orders: 5 },
    { name: 'Modern Electronics', revenue: '$980', orders: 13 },
    { name: 'Tech Innovation Lab', revenue: '$850', orders: 4 }
  ],
  topVendors: [
    { name: 'Global Electronics Ltd', reliability: '98.2%', orders: 45 },
    { name: 'Tech Supply Co', reliability: '96.7%', orders: 32 },
    { name: 'Hardware Solutions Inc', reliability: '95.1%', orders: 28 }
  ],
  latePayments: [
    { name: 'ABC Retail Store', amount: '$2,450', days: 15 },
    { name: 'Tech Solutions Inc', amount: '$1,890', days: 8 },
    { name: 'Global Distributors', amount: '$980', days: 5 }
  ]
};

const automationPanel = {
  autoReorder: true,
  smartPricing: true,
  autoPaymentReminder: true,
  lastSync: '2 minutes ago'
};

const smartNotifications = [
  { type: 'critical', message: 'Wireless Barcode Scanner out of stock', time: '5 min ago', category: 'inventory' },
  { type: 'medium', message: 'Purchase order PO-1048 needs approval', time: '12 min ago', category: 'finance' },
  { type: 'info', message: 'System backup completed successfully', time: '25 min ago', category: 'system' }
];

const quickActions = [
  { label: 'Add Product', href: '/products/create', icon: CubeIcon },
  { label: 'Create Sale', href: '/sell/pos', icon: ShoppingCartIcon },
  { label: 'Record Purchase', href: '/purchases/create', icon: TruckIcon },
  { label: 'View Reports', href: '/reports/inventory', icon: ChartBarIcon },
];

const activityFeed = [
  { title: 'Warehouse A stock synced', meta: '2 minutes ago', status: 'healthy' },
  { title: 'Purchase order PO-1048 awaiting approval', meta: '11 minutes ago', status: 'warning' },
  { title: 'Payment received from John Retail', meta: '23 minutes ago', status: 'healthy' },
  { title: 'Low stock alert on Wireless Barcode Scanner', meta: '41 minutes ago', status: 'critical' },
];

const topProducts = [
  { name: 'Wireless Barcode Scanner', sku: 'WBS-204', stock: 8, velocity: 'High demand' },
  { name: 'Retail POS Printer', sku: 'RPP-110', stock: 19, velocity: 'Stable movement' },
  { name: 'USB Receipt Roll', sku: 'URR-441', stock: 62, velocity: 'Fast moving' },
  { name: 'Touch Display Unit', sku: 'TDU-901', stock: 14, velocity: 'Watch closely' },
];

const salesMoments = [
  { label: 'Morning Rush', value: '32%', width: 'w-1/3' },
  { label: 'Midday Walk-ins', value: '47%', width: 'w-[47%]' },
  { label: 'Evening Pickup', value: '21%', width: 'w-1/5' },
];

const inventoryMovementTrend = [
  { day: 'Mon', inflow: 28, outflow: 24, net: 4 },
  { day: 'Tue', inflow: 22, outflow: 19, net: 3 },
  { day: 'Wed', inflow: 31, outflow: 25, net: 6 },
  { day: 'Thu', inflow: 19, outflow: 23, net: -4 },
  { day: 'Fri', inflow: 25, outflow: 20, net: 5 },
  { day: 'Sat', inflow: 20, outflow: 17, net: 3 },
  { day: 'Sun', inflow: 0, outflow: 0, net: 0 },
];

const weeklyRevenueTrend = [
  { week: 'W1', revenue: 15420, cost: 10400, profit: 5020 },
  { week: 'W2', revenue: 16780, cost: 11310, profit: 5470 },
  { week: 'W3', revenue: 17420, cost: 11890, profit: 5530 },
  { week: 'W4', revenue: 18420, cost: 12300, profit: 6120 },
];

const assetStatusBreakdown = [
  { name: 'Active', value: assetHealthPanel.active, color: '#10b981' },
  { name: 'Maintenance', value: assetHealthPanel.maintenance, color: '#f59e0b' },
  { name: 'Retired', value: assetHealthPanel.retired, color: '#ef4444' },
];

const salesMomentData = salesMoments.map((moment) => ({
  label: moment.label,
  share: Number.parseInt(moment.value, 10),
}));

const statusStyles = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-rose-500',
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.firstName || user?.username || 'there';

  // Real-time updates integration
  const { 
    connectionStatus, 
    isConnected, 
    isPolling, 
    subscribe, 
    invalidateQueries 
  } = useRealTimeUpdates({ autoConnect: true });
  
  const { globalState, setGlobalState } = useRealTimeState();
  const [realTimeNotifications, setRealTimeNotifications] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Real-time data synchronization for dashboard queries
  useRealTimeDataSync('dashboardOverview', analyticsAPI.getDashboardOverview);
  useRealTimeDataSync('assetsOverview', assetsAPI.getAssetsOverview);
  useRealTimeDataSync('transactionsAnalysis', analyticsAPI.getTransactionsAnalysis);
  useRealTimeDataSync('customerAnalytics', customersAPI.getCustomerAnalytics);
  useRealTimeDataSync('salesData', salesAPI.getAll);
  useRealTimeDataSync('inventoryData', inventoryAPI.getAll);
  useRealTimeDataSync('purchaseData', purchasesAPI.getAll);
  useRealTimeDataSync('expenseData', expensesAPI.getAll);
  useRealTimeDataSync('alertData', alertsAPI.getAll);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatCompactCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount || 0);

  const formatRelativeTime = (value) => {
    if (!value) return 'Just now';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.max(0, Math.floor(diffMs / 60000));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const getSafeArray = (queryData, key) => {
    if (!queryData) return [];
    // Try multiple possible paths for nested data structures
    return queryData?.data?.data?.[key] ||
           queryData?.data?.[key] ||
           queryData?.[key] ||
           (Array.isArray(queryData) ? queryData : []) ||
           [];
  };
  const getSafeObject = (queryData) => {
    if (!queryData) return {};
    return queryData?.data?.data || queryData?.data || queryData || {};
  };
  // Real-time event subscriptions
  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to inventory updates
    unsubscribers.push(subscribe('inventory:updated', (data) => {
      setLastUpdateTime(new Date());
      invalidateQueries(['dashboardOverview', 'inventoryData']);
      
      setRealTimeNotifications(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: 'info',
        message: `Inventory updated: ${data.message}`,
        timestamp: new Date()
      }]);
    }));

    // Subscribe to sales updates
    unsubscribers.push(subscribe('sales:created', (data) => {
      setLastUpdateTime(new Date());
      invalidateQueries(['dashboardOverview', 'salesData', 'transactionsAnalysis']);
      
      setRealTimeNotifications(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: 'success',
        message: `New sale: ${data.customerName} - $${data.amount}`,
        timestamp: new Date()
      }]);
    }));

    // Subscribe to purchase updates
    unsubscribers.push(subscribe('purchases:created', (data) => {
      setLastUpdateTime(new Date());
      invalidateQueries(['dashboardOverview', 'purchaseData', 'transactionsAnalysis']);
      
      setRealTimeNotifications(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: 'success',
        message: `New purchase: ${data.supplierName} - $${data.amount}`,
        timestamp: new Date()
      }]);
    }));

    // Subscribe to asset updates
    unsubscribers.push(subscribe('assets:updated', (data) => {
      setLastUpdateTime(new Date());
      invalidateQueries(['dashboardOverview', 'assetsOverview']);
      
      setRealTimeNotifications(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: 'warning',
        message: `Asset updated: ${data.assetName}`,
        timestamp: new Date()
      }]);
    }));

    // Subscribe to alerts
    unsubscribers.push(subscribe('alerts:triggered', (data) => {
      setLastUpdateTime(new Date());
      invalidateQueries(['dashboardOverview', 'alertData']);
      
      setRealTimeNotifications(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: data.severity === 'critical' ? 'error' : 'warning',
        message: data.message,
        timestamp: new Date()
      }]);
    }));

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe, invalidateQueries]);

  const queryOptions = {
    refetchInterval: isConnected ? 60000 : 30000, // Slower refresh when real-time is active
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  };

  const { data: dashboardOverviewResponse, isFetching: refreshingOverview } = useQuery(
    'dashboardOverview',
    analyticsAPI.getDashboardOverview,
    queryOptions
  );

  const { data: assetsOverviewResponse, isFetching: refreshingAssetsOverview } = useQuery(
    'assetsOverview',
    analyticsAPI.getAssetsOverview,
    queryOptions
  );

  const { data: transactionsAnalysisResponse, isFetching: refreshingTransactions } = useQuery(
    'transactionsAnalysis',
    () => analyticsAPI.getTransactionsAnalysis({ period: 30 }),
    queryOptions
  );

  const { data: inventoryResponse, isFetching: refreshingInventory } = useQuery(
    'dashboardInventory',
    () => inventoryAPI.getAll({ limit: 1000 }),
    queryOptions
  );

  const { data: salesResponse, isFetching: refreshingSales } = useQuery(
    'dashboardSales',
    () => salesAPI.getAll({ limit: 100 }),
    queryOptions
  );

  const { data: purchasesResponse, isFetching: refreshingPurchases } = useQuery(
    'dashboardPurchases',
    () => purchasesAPI.getAll({ limit: 100 }),
    queryOptions
  );

  const { data: expensesResponse, isFetching: refreshingExpenses } = useQuery(
    'dashboardExpenses',
    () => expensesAPI.getAll({ limit: 100 }),
    queryOptions
  );

  const { data: alertsResponse, isFetching: refreshingAlerts } = useQuery(
    'dashboardAlerts',
    () => alertsAPI.getAll({ limit: 20, status: 'active' }),
    queryOptions
  );

  const { data: customersResponse, isFetching: refreshingCustomers } = useQuery(
    'dashboardCustomers',
    () => customersAPI.getAll({ limit: 100 }),
    queryOptions
  );

  const { data: customerAnalyticsResponse } = useQuery(
    'customer-analytics',
    customersAPI.getAnalytics,
    queryOptions
  );

  const { data: suppliersResponse } = useQuery(
    'dashboardSuppliers',
    () => suppliersAPI.getAll({ limit: 20 }),
    queryOptions
  );

  const { data: invoicesResponse } = useQuery(
    'dashboardInvoices',
    () => invoicesAPI.getAll({ limit: 100 }),
    queryOptions
  );

  const { data: paymentAccountsResponse, isFetching: refreshingPayments } = useQuery(
    'paymentAccounts',
    paymentAccountsAPI.getAll,
    queryOptions
  );

  const { data: assetsResponse, isFetching: refreshingAssets } = useQuery(
    'dashboardAssets',
    () => assetsAPI.getAll({ limit: 100 }),
    queryOptions
  );

  const { data: transactionsResponse, isFetching: refreshingPaymentTransactions } = useQuery(
    'dashboardTransactions',
    () => paymentAccountsAPI.getTransactions(),
    queryOptions
  );

  const dashboardOverview = getSafeObject(dashboardOverviewResponse);
  const assetsOverview = getSafeObject(assetsOverviewResponse);
  const transactionsAnalysis = getSafeObject(transactionsAnalysisResponse);
  const customerAnalytics = getSafeObject(customerAnalyticsResponse);

  const inventoryItems = getSafeArray(inventoryResponse, 'inventory') || getSafeArray(inventoryResponse, 'products') || [];
  const salesList = getSafeArray(salesResponse, 'sales') || [];
  const purchasesList = getSafeArray(purchasesResponse, 'purchases') || [];
  const expensesList = getSafeArray(expensesResponse, 'expenses') || [];
  const alertsList = getSafeArray(alertsResponse, 'alerts') || [];
  const customersList = getSafeArray(customersResponse, 'customers') || [];
  const suppliersList = getSafeArray(suppliersResponse, 'suppliers') || [];
  const accountsList = getSafeArray(paymentAccountsResponse, 'accounts') || [];
  const assetsList = getSafeArray(assetsResponse, 'assets') || [];
  const invoicesList = getSafeArray(invoicesResponse, 'invoices') || [];

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const getSaleDate = (sale) => new Date(sale.sale_date || sale.date || sale.createdAt || sale.created_at || sale.created || Date.now());
  const getPurchaseDate = (purchase) => new Date(purchase.purchase_date || purchase.date || purchase.createdAt || purchase.created_at || purchase.created || Date.now());
  const getSaleAmount = (sale) => Number(sale.total_amount || sale.amount || sale.total || sale.grand_total || sale.subtotal || 0);
  const getPurchaseAmount = (purchase) => Number(purchase.total_amount || purchase.amount || purchase.total || purchase.grand_total || purchase.subtotal || 0);

  const todaysSales = salesList.filter((sale) => getSaleDate(sale) >= startOfToday);
  const todaySalesTotal = todaysSales.reduce((sum, sale) => sum + getSaleAmount(sale), 0);
  const todaysPurchases = purchasesList.filter((purchase) => getPurchaseDate(purchase) >= startOfToday);
  const todayPurchasesTotal = todaysPurchases.reduce((sum, purchase) => sum + getPurchaseAmount(purchase), 0);
  const monthPurchases = purchasesList.filter((purchase) => getPurchaseDate(purchase) >= startOfMonth);
  const monthPurchasesTotal = monthPurchases.reduce((sum, purchase) => sum + getPurchaseAmount(purchase), 0);
  const totalCashPosition = accountsList.reduce(
    (sum, account) => sum + Number(account.current_balance ?? account.balance ?? account.opening_balance ?? 0),
    0
  );

  // Calculate stock value from inventory items directly
  const calculatedStockValue = inventoryItems.reduce((sum, item) => {
    const quantity = Number(item.quantity || item.stock || 0);
    const price = Number(
      item.price?.selling || 
      item.price?.cost || 
      item.price || 
      item.unit_price || 
      item.cost || 
      item.selling_price || 
      0
    );
    return sum + (quantity * price);
  }, 0);

  // Calculate month expenses
  const monthExpenses = expensesList.filter((expense) => {
    const expenseDate = new Date(expense.expense_date || expense.date || expense.createdAt || expense.created_at || Date.now());
    return expenseDate >= startOfMonth;
  });
  const monthExpensesTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || expense.total || 0), 0);

  console.log('=== KPI CALCULATIONS ===');
  console.log('Today\'s sales count:', todaysSales.length);
  console.log('Today\'s sales total:', todaySalesTotal);
  console.log('Today\'s purchases count:', todaysPurchases.length);
  console.log('Today\'s purchases total:', todayPurchasesTotal);
  console.log('Month purchases count:', monthPurchases.length);
  console.log('Month purchases total:', monthPurchasesTotal);
  console.log('Total products:', inventoryItems.length);
  console.log('Calculated stock value:', calculatedStockValue);
  console.log('Dashboard stock value:', dashboardOverview.totalInventoryValue);
  console.log('Month expenses count:', monthExpenses.length);
  console.log('Month expenses total:', monthExpensesTotal);

  const assetStatusRows = assetsOverview.assetByStatus || [];
  const activeAssetCount = assetStatusRows.find((item) => item._id === 'active')?.count || 0;
  const maintenanceAssetCount = assetStatusRows
    .filter((item) => ['maintenance_due', 'in_repair'].includes(item._id))
    .reduce((sum, item) => sum + Number(item.count || 0), 0);
  const retiredAssetCount = assetStatusRows
    .filter((item) => ['retired', 'disposed', 'lost'].includes(item._id))
    .reduce((sum, item) => sum + Number(item.count || 0), 0);
  const totalAssetCount = assetStatusRows.reduce((sum, item) => sum + Number(item.count || 0), 0) || assetsList.length;

  const monthlyRevenue = Number(dashboardOverview.monthlySales || 0);
  const monthlyPurchases = Number(dashboardOverview.monthlyPurchases || 0);
  const monthlyExpenses = Number(dashboardOverview.monthlyExpense || 0);
  const monthlyProfit = monthlyRevenue - monthlyPurchases - monthlyExpenses;
  const monthlyMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

  const overdueCustomers = customersList.filter((customer) => Number(customer.outstanding_balance || customer.metrics?.outstandingBalance || 0) > 0);
  const pendingPurchases = purchasesList.filter((purchase) => !['received', 'completed'].includes(purchase.status));
  const lowStockItems = inventoryItems.filter((item) => Number(item.quantity || 0) <= Number(item.minStock || item.minStockLevel || 0));
  const pendingInvoices = invoicesList.filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue');

  const riskPenalty = Math.min(
    60,
    (lowStockItems.length * 4) + (Number(dashboardOverview.activeAlerts || 0) * 5) + (pendingPurchases.length * 3) + (overdueCustomers.length * 2)
  );
  const liveRiskScoreValue = Math.max(35, 100 - riskPenalty);

  const inventoryTurnoverValue = dashboardOverview.totalInventoryValue > 0
    ? ((monthlyRevenue * 12) / Number(dashboardOverview.totalInventoryValue)).toFixed(1)
    : advancedKPIs[0].value;

  const agingDays = inventoryItems.length
    ? Math.round(
        inventoryItems.reduce((sum, item) => {
          const anchor = new Date(item.lastRestocked || item.updatedAt || item.createdAt || Date.now());
          return sum + ((Date.now() - anchor.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / inventoryItems.length
      )
    : 0;

  const completedOrders = salesList.filter((sale) => sale.status === 'completed').length
    + purchasesList.filter((purchase) => purchase.status === 'received').length;
  const totalOrders = salesList.length + purchasesList.length;
  const fulfillmentRateValue = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : advancedKPIs[2].value;

  const returnRateValue = salesList.length > 0
    ? ((alertsList.filter((alert) => ['quality_issue', 'transaction_failed'].includes(alert.type)).length / salesList.length) * 100).toFixed(1)
    : advancedKPIs[3].value;

  const assetDepreciationMonthly = assetsList.reduce((sum, asset) => {
    const purchaseAmount = Number(asset.purchase_cost?.amount || 0);
    const usefulLife = Number(asset.depreciation?.usefulLife || 0);
    return sum + (purchaseAmount > 0 && usefulLife > 0 ? purchaseAmount / (usefulLife * 12) : 0);
  }, 0);

  const liveAssetHealthPanel = {
    totalAssets: totalAssetCount || assetHealthPanel.totalAssets,
    active: activeAssetCount || assetHealthPanel.active,
    maintenance: maintenanceAssetCount || assetHealthPanel.maintenance,
    retired: retiredAssetCount || assetHealthPanel.retired,
    utilization: totalAssetCount > 0 ? Number(((activeAssetCount / totalAssetCount) * 100).toFixed(1)) : assetHealthPanel.utilization,
    depreciation: {
      monthly: formatCurrency(assetDepreciationMonthly || 2450),
      yearly: formatCurrency((assetDepreciationMonthly * 12) || 29400),
    },
    topFailingAssets: (
      assetsList
        .filter((asset) => ['maintenance_due', 'in_repair', 'lost'].includes(asset.status))
        .slice(0, 3)
        .map((asset) => ({
          name: asset.asset_name,
          issue: asset.status.replace(/_/g, ' '),
          priority: asset.status === 'lost' ? 'high' : asset.status === 'in_repair' ? 'medium' : 'low',
        }))
    ).length
      ? assetsList
          .filter((asset) => ['maintenance_due', 'in_repair', 'lost'].includes(asset.status))
          .slice(0, 3)
          .map((asset) => ({
            name: asset.asset_name,
            issue: asset.status.replace(/_/g, ' '),
            priority: asset.status === 'lost' ? 'high' : asset.status === 'in_repair' ? 'medium' : 'low',
          }))
      : assetHealthPanel.topFailingAssets,
    maintenanceDue: (
      assetsList
        .filter((asset) => asset.maintenance?.nextMaintenanceDue)
        .sort((a, b) => new Date(a.maintenance?.nextMaintenanceDue) - new Date(b.maintenance?.nextMaintenanceDue))
        .slice(0, 3)
        .map((asset) => ({
          name: asset.asset_name,
          due: formatRelativeTime(asset.maintenance?.nextMaintenanceDue),
          type: 'Maintenance',
        }))
    ).length
      ? assetsList
          .filter((asset) => asset.maintenance?.nextMaintenanceDue)
          .sort((a, b) => new Date(a.maintenance?.nextMaintenanceDue) - new Date(b.maintenance?.nextMaintenanceDue))
          .slice(0, 3)
          .map((asset) => ({
            name: asset.asset_name,
            due: formatRelativeTime(asset.maintenance?.nextMaintenanceDue),
            type: 'Maintenance',
          }))
      : assetHealthPanel.maintenanceDue,
  };

  // KPI Card Data
  const liveTodaySales = 0;
  const liveTodaySalesCount = 0;
  const liveTodayPurchases = 0;
  const liveTodayPurchasesCount = 0;
  const liveTotalProducts = inventoryItems.length || 0;
  const liveStockValue = calculatedStockValue || Number(dashboardOverview.totalInventoryValue || 0);
  const liveLowStockCount = lowStockItems.length || 0;
  const livePendingPayments = pendingInvoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || invoice.balance || 0), 0);
  const livePendingPaymentsCount = pendingInvoices.length || 0;
  const liveMonthExpenses = monthExpensesTotal || monthlyExpenses || 0;
  const liveMonthPurchases = monthPurchasesTotal || 0;
  const liveMonthPurchasesCount = monthPurchases.length || 0;

  const liveStatCards = [
    {
      ...statCards[0],
      value: formatCompactCurrency(dashboardOverview.totalInventoryValue || 0),
      delta: `${Number(dashboardOverview.lowStockCount || lowStockItems.length)} items below min stock`,
    },
    {
      ...statCards[1],
      value: formatCompactCurrency(todaySalesTotal),
      delta: `${todaysSales.length} invoices completed today`,
    },
    {
      ...statCards[2],
      value: `${totalAssetCount || 0}`,
      delta: `${activeAssetCount} Active / ${maintenanceAssetCount} In Maintenance / ${retiredAssetCount} Retired`,
    },
    {
      ...statCards[3],
      value: formatCompactCurrency(totalCashPosition),
      delta: `Across ${accountsList.length} payment accounts`,
    },
  ];

  const liveAdvancedKPIs = [
    {
      ...advancedKPIs[0],
      value: `${inventoryTurnoverValue}`,
      delta: `${formatCompactCurrency(monthlyRevenue)} sold in the last 30 days`,
    },
    {
      ...advancedKPIs[1],
      value: `${agingDays || 0} days`,
      delta: `${inventoryItems.length} tracked items considered`,
    },
    {
      ...advancedKPIs[2],
      value: `${fulfillmentRateValue}%`,
      delta: `${completedOrders} completed out of ${totalOrders} orders`,
    },
    {
      ...advancedKPIs[3],
      value: `${returnRateValue}%`,
      delta: `${alertsList.filter((alert) => ['quality_issue', 'transaction_failed'].includes(alert.type)).length} quality/payment issues flagged`,
    },
  ];

  const liveProfitLossSnapshot = {
    revenue: formatCurrency(monthlyRevenue),
    cost: formatCurrency(monthlyPurchases + monthlyExpenses),
    profit: formatCurrency(monthlyProfit),
    margin: `${monthlyMargin.toFixed(1)}%`,
    trend: `${monthlyProfit >= 0 ? '+' : ''}${formatCompactCurrency(monthlyProfit)} net for the last 30 days`,
  };

  const liveRiskScore = {
    score: liveRiskScoreValue,
    level: liveRiskScoreValue >= 80 ? 'Healthy' : liveRiskScoreValue >= 60 ? 'Moderate Attention Needed' : 'High Attention Needed',
    factors: [
      { name: 'Low Stock Items', count: Number(dashboardOverview.lowStockCount || lowStockItems.length), impact: lowStockItems.length > 5 ? 'high' : 'medium' },
      { name: 'Pending Payments', count: overdueCustomers.length, impact: overdueCustomers.length > 2 ? 'medium' : 'low' },
      { name: 'Pending Purchases', count: pendingPurchases.length, impact: pendingPurchases.length > 2 ? 'medium' : 'low' },
    ],
  };

  const incomingUnits = purchasesList.reduce((sum, purchase) => {
    if (!['received', 'completed'].includes(purchase.status)) return sum;
    return sum + (purchase.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0);
  }, 0);

  const outgoingUnits = salesList.reduce(
    (sum, sale) => sum + (sale.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
    0
  );

  const soldProductCounts = {};
  salesList.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const productKey = String(item.product?._id || item.product || item.name || 'unknown');
      soldProductCounts[productKey] = (soldProductCounts[productKey] || 0) + Number(item.quantity || 0);
    });
  });

  const liveInventoryMovement = {
    inflow: incomingUnits || inventoryMovement.inflow,
    outflow: outgoingUnits || inventoryMovement.outflow,
    net: (incomingUnits - outgoingUnits) || inventoryMovement.net,
    fastMoving: Object.values(soldProductCounts).filter((quantity) => quantity >= 3).length || inventoryMovement.fastMoving,
    slowMoving: inventoryItems.filter((item) => {
      const anchor = new Date(item.lastRestocked || item.updatedAt || item.createdAt || Date.now());
      return (Date.now() - anchor.getTime()) / (1000 * 60 * 60 * 24) > 30;
    }).length || inventoryMovement.slowMoving,
    deadStock: inventoryItems.filter((item) => {
      const anchor = new Date(item.lastRestocked || item.updatedAt || item.createdAt || Date.now());
      return (Date.now() - anchor.getTime()) / (1000 * 60 * 60 * 24) > 90;
    }).length || inventoryMovement.deadStock,
  };

  const liveCustomerVendorInsights = {
    topCustomers: customerVendorInsights.topCustomers,
    topVendors: suppliersList
      .sort((a, b) => Number(b.performance?.rating || 0) - Number(a.performance?.rating || 0))
      .slice(0, 3)
      .map((supplier) => ({
        name: supplier.company_name || supplier.name,
        reliability: `${Number(supplier.performance?.on_time_delivery || 0).toFixed(1)}%`,
        orders: Number(supplier.performance?.total_orders || 0),
      })),
    latePayments: overdueCustomers.slice(0, 3).map((customer) => ({
      name: customer.name,
      amount: formatCurrency(customer.outstanding_balance || customer.metrics?.outstandingBalance || 0),
      days: Math.max(
        1,
        Math.floor((Date.now() - new Date(customer.last_purchase_date || customer.updatedAt || customer.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
      ),
    })),
  };

  const liveAutomationPanel = {
    autoReorder: lowStockItems.length > 0,
    smartPricing: monthlyMargin < 20 || monthlyProfit < 0,
    autoPaymentReminder: overdueCustomers.length > 0,
    lastSync: formatRelativeTime(
      [
        dashboardOverviewResponse?.data?.updatedAt,
        inventoryItems[0]?.updatedAt,
        salesList[0]?.updatedAt,
        purchasesList[0]?.updatedAt,
        expensesList[0]?.updatedAt,
        alertsList[0]?.updatedAt,
      ].filter(Boolean)[0] || new Date()
    ),
  };

  const liveSmartNotifications = (
    alertsList.slice(0, 6).map((alert) => ({
      type: alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'medium' : 'info',
      message: alert.title || alert.message,
      time: formatRelativeTime(alert.timestamps?.created || alert.createdAt),
      category: alert.entity_type === 'inventory' ? 'inventory' : alert.entity_type === 'system' ? 'system' : 'finance',
    }))
  ).length
    ? alertsList.slice(0, 6).map((alert) => ({
        type: alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'medium' : 'info',
        message: alert.title || alert.message,
      time: formatRelativeTime(alert.timestamps?.created || alert.createdAt),
      category: alert.entity_type === 'inventory' ? 'inventory' : alert.entity_type === 'system' ? 'system' : 'finance',
    }))
    : smartNotifications;

  const liveTopProducts = (
    inventoryItems
      .slice()
      .sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0))
      .slice(0, 4)
      .map((product) => ({
        name: product.name,
        sku: product.sku || product.product_id,
        stock: Number(product.quantity || 0),
        velocity: Number(product.quantity || 0) <= Number(product.minStockLevel || 0) ? 'Restock urgently' : 'Watch closely',
      }))
  ).length
    ? inventoryItems
        .slice()
        .sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0))
        .slice(0, 4)
        .map((product) => ({
          name: product.name,
          sku: product.sku || product.product_id,
          stock: Number(product.quantity || 0),
          velocity: Number(product.quantity || 0) <= Number(product.minStockLevel || 0) ? 'Restock urgently' : 'Watch closely',
        }))
    : topProducts;

  const dayBuckets = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return {
      key: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      inflow: 0,
      outflow: 0,
      net: 0,
    };
  });

  purchasesList.forEach((purchase) => {
    if (!['received', 'completed'].includes(purchase.status)) return;
    const key = getPurchaseDate(purchase).toISOString().slice(0, 10);
    const bucket = dayBuckets.find((entry) => entry.key === key);
    if (!bucket) return;
    bucket.inflow += (purchase.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  });

  salesList.forEach((sale) => {
    const key = getSaleDate(sale).toISOString().slice(0, 10);
    const bucket = dayBuckets.find((entry) => entry.key === key);
    if (!bucket) return;
    bucket.outflow += (sale.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  });

  const liveInventoryMovementTrend = dayBuckets.map((bucket) => ({
    day: bucket.day,
    inflow: bucket.inflow,
    outflow: bucket.outflow,
    net: bucket.inflow - bucket.outflow,
  }));

  const weekBuckets = Array.from({ length: 4 }).map((_, index) => ({
    week: `W${index + 1}`,
    revenue: 0,
    cost: 0,
    profit: 0,
  }));

  const getWeekIndex = (value) => {
    const date = new Date(value);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    const index = 3 - Math.floor(diffDays / 7);
    return index >= 0 && index < 4 ? index : null;
  };

  salesList.forEach((sale) => {
    const index = getWeekIndex(getSaleDate(sale));
    if (index === null) return;
    weekBuckets[index].revenue += getSaleAmount(sale);
  });

  purchasesList.forEach((purchase) => {
    const index = getWeekIndex(getPurchaseDate(purchase));
    if (index === null) return;
    weekBuckets[index].cost += getPurchaseAmount(purchase);
  });

  expensesList.forEach((expense) => {
    const index = getWeekIndex(expense.date || expense.createdAt);
    if (index === null) return;
    weekBuckets[index].cost += Number(expense.amount || 0);
  });

  const liveWeeklyRevenueTrend = weekBuckets.map((bucket) => ({
    ...bucket,
    profit: bucket.revenue - bucket.cost,
  }));

  const liveAssetStatusBreakdown = (
    assetsOverview.assetByStatus || []
  ).map((item) => ({
    name: item._id === 'active' ? 'Active' : item._id === 'maintenance_due' || item._id === 'in_repair' ? 'Maintenance' : 'Retired',
    value: Number(item.count || 0),
    color: item._id === 'active' ? '#10b981' : item._id === 'maintenance_due' || item._id === 'in_repair' ? '#f59e0b' : '#ef4444',
  })).reduce((acc, item) => {
    const existing = acc.find((entry) => entry.name === item.name);
    if (existing) {
      existing.value += item.value;
      return acc;
    }
    acc.push(item);
    return acc;
  }, []);

  const salesMomentCounts = { 'Morning Rush': 0, 'Midday Walk-ins': 0, 'Evening Pickup': 0 };
  salesList.forEach((sale) => {
    const hour = getSaleDate(sale).getHours();
    if (hour < 12) salesMomentCounts['Morning Rush'] += 1;
    else if (hour < 17) salesMomentCounts['Midday Walk-ins'] += 1;
    else salesMomentCounts['Evening Pickup'] += 1;
  });
  const totalSalesMoments = Object.values(salesMomentCounts).reduce((sum, count) => sum + count, 0);
  const liveSalesMomentData = Object.entries(salesMomentCounts).map(([label, count]) => ({
    label,
    share: totalSalesMoments > 0 ? Math.round((count / totalSalesMoments) * 100) : 0,
  }));

  // Sales vs Purchases data (last 7 days)
  const salesVsPurchasesData = dayBuckets.map((bucket) => ({
    day: bucket.day,
    sales: salesList
      .filter((sale) => getSaleDate(sale).toISOString().slice(0, 10) === bucket.key)
      .reduce((sum, sale) => sum + getSaleAmount(sale), 0),
    purchases: purchasesList
      .filter((purchase) => getPurchaseDate(purchase).toISOString().slice(0, 10) === bucket.key)
      .reduce((sum, purchase) => sum + getPurchaseAmount(purchase), 0),
  }));

  // Monthly revenue data (last 6 months)
  const monthlyRevenueData = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthSales = salesList.filter((sale) => 
      getSaleDate(sale).toISOString().slice(0, 7) === monthKey
    );
    const monthPurchases = purchasesList.filter((purchase) =>
      getPurchaseDate(purchase).toISOString().slice(0, 7) === monthKey
    );
    
    return {
      month: monthName,
      revenue: monthSales.reduce((sum, sale) => sum + getSaleAmount(sale), 0),
      cost: monthPurchases.reduce((sum, purchase) => sum + getPurchaseAmount(purchase), 0),
      profit: monthSales.reduce((sum, sale) => sum + getSaleAmount(sale), 0) - 
              monthPurchases.reduce((sum, purchase) => sum + getPurchaseAmount(purchase), 0),
    };
  });

  // Inventory Category Analysis
  const categoryData = inventoryItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { quantity: 0, value: 0 };
    }
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price?.selling || item.price || item.unit_price || item.cost || 0);
    acc[category].quantity += quantity;
    acc[category].value += quantity * price;
    return acc;
  }, {});

  const inventoryCategoryData = Object.entries(categoryData).map(([name, data]) => ({
    name,
    stockQuantity: data.quantity,
    totalValue: data.value,
  }));

  // Asset Depreciation Schedule
  const assetDepreciationData = assetsList.slice(0, 5).map((asset) => {
    const purchaseCost = Number(asset.purchase_cost?.amount || asset.purchase_cost || asset.cost || 0);
    const currentValue = Number(asset.current_value?.amount || asset.current_value || asset.value || purchaseCost * 0.85);
    return {
      name: asset.asset_name || asset.name || 'Unknown Asset',
      purchaseCost,
      currentValue,
    };
  });

  // Transaction Revenue by Type
  const transactionTypes = { Deposit: 0, Withdraw: 0, Transfer: 0 };
  const transactionsList = getSafeArray(transactionsResponse, 'transactions') || 
                          getSafeArray(transactionsResponse, 'paymentTransactions') || [];
  
  transactionsList.forEach((txn) => {
    const type = txn.transaction_type || txn.type || 'Other';
    const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    if (transactionTypes.hasOwnProperty(normalizedType)) {
      transactionTypes[normalizedType] += Number(txn.amount || 0);
    }
  });

  const transactionRevenueData = Object.entries(transactionTypes).map(([name, value]) => ({
    name,
    value,
  }));

  // Top Performing Suppliers
  const supplierPerformance = suppliersList.map((supplier) => {
    const supplierPurchases = purchasesList.filter(
      (purchase) => purchase.supplier_id === supplier._id || purchase.supplier_name === supplier.name
    );
    const totalAmount = supplierPurchases.reduce((sum, purchase) => sum + getPurchaseAmount(purchase), 0);
    const onTimeDeliveries = supplierPurchases.filter((p) => p.status === 'completed' || p.status === 'received').length;
    const onTimeRate = supplierPurchases.length > 0 ? (onTimeDeliveries / supplierPurchases.length) * 100 : 0;
    
    return {
      name: supplier.company_name || supplier.name,
      totalAmount,
      onTimeRate,
      orders: supplierPurchases.length,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);

  const liveAiDecisionCards = [
    {
      ...aiDecisionCards[0],
      description: lowStockItems[0]
        ? `${lowStockItems[0].name} is below minimum stock at ${lowStockItems[0].quantity} units`
        : aiDecisionCards[0].description,
    },
    {
      ...aiDecisionCards[1],
      description: `${liveInventoryMovement.deadStock} products show slow or stale movement`,
    },
    {
      ...aiDecisionCards[2],
      description: monthlyProfit < 0
        ? `Net loss detected this month: ${formatCurrency(monthlyProfit)}`
        : `Margin currently holding at ${monthlyMargin.toFixed(1)}%`,
    },
  ];

  const isRefreshing = [
    refreshingOverview,
    refreshingAssetsOverview,
    refreshingTransactions,
    refreshingInventory,
    refreshingSales,
    refreshingPurchases,
    refreshingExpenses,
    refreshingAlerts,
    refreshingCustomers,
    refreshingPayments,
    refreshingAssets,
  ].some(Boolean);

  const [commandInput, setCommandInput] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [notificationFilter, setNotificationFilter] = useState('all');

  const handleQuickAction = (action) => {
    toast.success(`Navigating to ${action.label}...`);
    navigate(action.href);
  };

  const handleCommand = (e) => {
    e.preventDefault();
    const command = commandInput.toLowerCase().trim();
    
    if (command.includes('add product') || command.includes('create product')) {
      navigate('/product-tools');
      toast.success('Opening product creation...');
    } else if (command.includes('create invoice') || command.includes('new sale')) {
      navigate('/pos');
      toast.success('Opening POS system...');
    } else if (command.includes('check stock') || command.includes('inventory')) {
      navigate('/inventory');
      toast.success('Opening inventory...');
    } else {
      toast.error('Command not recognized. Try: "add product", "create invoice", "check stock"');
    }
    setCommandInput('');
  };

  const handleAIMessage = (e) => {
    e.preventDefault();
    if (aiMessage.trim()) {
      toast.success(`AI Assistant: Processing "${aiMessage}"...`);
      // Simulate AI response
      setTimeout(() => {
        if (aiMessage.toLowerCase().includes('low stock')) {
          toast('🔍 Found 7 low stock items today');
        } else if (aiMessage.toLowerCase().includes('top selling')) {
          toast('📊 Top selling: Wireless Barcode Scanner, Retail POS Printer');
        } else if (aiMessage.toLowerCase().includes('predict')) {
          toast('🔮 Next week sales predicted: $125,000 (+8%)');
        } else {
          toast('🤖 AI: I understand your request. Processing...');
        }
      }, 1500);
      setAiMessage('');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'medium': return <ExclamationCircleIcon className="h-4 w-4 text-amber-500" />;
      case 'info': return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
      default: return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRiskScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  };

  return (
    <div className="page-stack">
      <section className="page-header rounded-2xl border border-blue-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">Smart Inventory Hub</p>
          <h1 className="mt-2 text-2xl font-bold text-blue-950 lg:text-3xl">Dashboard overview</h1>
          <p className="page-subtitle">A tighter command view for inventory, sales, purchases, alerts, and payment follow-up.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">Role: {user?.role || 'user'}</div>
          <div className={`rounded-full px-3 py-2 text-sm font-medium ${isRefreshing ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {isRefreshing ? 'Refreshing live data' : 'Live sync active'}
          </div>
        </div>
        
        {/* Quick Command Bar */}
        <div className="mt-4">
          <form onSubmit={handleCommand} className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder='Type: "Add product" / "Create invoice" / "Check stock"'
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Execute
            </button>
          </form>
        </div>
      </section>

      {/* Real-time Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-lg border bg-white p-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : isPolling ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? 'Real-time Connected' : isPolling ? 'Polling Mode' : 'Disconnected'}
            </span>
            {lastUpdateTime && (
              <span className="text-xs text-gray-500">
                Last update: {formatRelativeTime(lastUpdateTime)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">
              {globalState.activeUsers.length} active users
            </div>
            <div className="text-xs text-gray-500">
              {globalState.notifications.length} notifications
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Notifications Panel */}
      {realTimeNotifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-900">Real-time Updates</h3>
            <button
              onClick={() => setRealTimeNotifications([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {realTimeNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs p-2 rounded ${
                  notification.type === 'error' ? 'bg-red-100 text-red-800' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  notification.type === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {notification.message}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-[28px] border border-blue-200 bg-gradient-to-br from-slate-900 via-blue-900 to-sky-700 text-white shadow-xl"
      >
        <div className="px-5 py-6 lg:px-7">
          {/* Header Section */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
              Operations Dashboard
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight lg:text-4xl">
              Welcome back, {firstName}. Your store pulse is steady, with a few areas that need attention today.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-blue-100 lg:text-base">
              Track inventory movement, sales momentum, purchase bottlenecks, and payment follow-ups from one place while keeping your existing navigation intact.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-sky-100 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Left Column: AI Recommendations */}
            <div>
              <h3 className="text-sm font-medium text-sky-100 uppercase tracking-wider mb-4">🤖 Smart AI Recommendations</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {liveAiDecisionCards.map((card) => (
                  <Link
                    key={card.title}
                    to={card.href}
                    className={`rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                      card.urgency === 'critical' ? 'ring-2 ring-red-400' : 
                      card.urgency === 'high' ? 'ring-2 ring-amber-400' : ''
                    }`}
                  >
                    <card.icon className={`h-8 w-8 ${card.color}`} />
                    <h4 className="mt-3 font-semibold text-white">{card.title}</h4>
                    <p className="mt-2 text-sm text-blue-100">{card.description}</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-blue-200">
                      {card.cta}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Sales Momentum */}
            <div>
              <h3 className="text-sm font-medium text-sky-100 uppercase tracking-wider mb-4">📊 Performance Metrics</h3>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-sm font-medium text-sky-100 uppercase tracking-wider">Sales Momentum</span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-5xl font-bold">84%</span>
                      <span className="text-sm text-green-400 font-medium">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-sky-200" />
                  </div>
                </div>
                <p className="text-sm text-blue-100 mb-6">Ahead of weekly target with higher conversion from POS traffic.</p>
                <div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={[
                      { day: 'Mon', target: 100, actual: 65 },
                      { day: 'Tue', target: 100, actual: 72 },
                      { day: 'Wed', target: 100, actual: 78 },
                      { day: 'Thu', target: 100, actual: 84 },
                      { day: 'Fri', target: 100, actual: 90 },
                      { day: 'Sat', target: 100, actual: 88 },
                      { day: 'Sun', target: 100, actual: 84 }
                    ]}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2.5} fill="url(#salesGradient)" />
                      <Line type="monotone" dataKey="target" stroke="#f97316" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* KPI Cards */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">📊 Key Performance Indicators</h2>
          <p className="text-sm text-gray-500">Real-time metrics overview</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-emerald-200/30 opacity-50 transition-all group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">💰 Today Sales</p>
                  <p className="mt-3 text-4xl font-bold text-emerald-900">${liveTodaySales.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-emerald-600">{liveTodaySalesCount} invoices completed</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-500">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 font-medium">
                      Live Data
                    </span>
                    <span className="text-emerald-600">• Updated just now</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg transition-all group-hover:scale-110">
                  <ShoppingCartIcon className="h-7 w-7" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-blue-200/30 opacity-50 transition-all group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">📥 Purchases (Today)</p>
                  <p className="mt-3 text-4xl font-bold text-blue-900">${liveTodayPurchases.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-blue-600">{liveTodayPurchasesCount} orders placed</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-500">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 font-medium">
                      Live Data
                    </span>
                    <span className="text-blue-600">• Updated just now</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg transition-all group-hover:scale-110">
                  <TruckIcon className="h-7 w-7" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-purple-200/30 opacity-50 transition-all group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-purple-700">📦 Total Products</p>
                  <p className="mt-3 text-4xl font-bold text-purple-900">{liveTotalProducts.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-purple-600">Active inventory items</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-purple-500">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 font-medium">
                      Live Data
                    </span>
                    <span className="text-purple-600">• Across all categories</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg transition-all group-hover:scale-110">
                  <CubeIcon className="h-7 w-7" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-cyan-200/30 opacity-50 transition-all group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-cyan-700">📊 Stock Value</p>
                  <p className="mt-3 text-4xl font-bold text-cyan-900">${liveStockValue.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-cyan-600">Total inventory worth</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-cyan-500">
                    <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-1 font-medium">
                      Live Data
                    </span>
                    <span className="text-cyan-600">• Current valuation</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-lg transition-all group-hover:scale-110">
                  <CurrencyDollarIcon className="h-7 w-7" />
                </div>
              </div>
            </div>
          </motion.div>


        </div>
      </section>

      {/* Analytics Section */}
      <section className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">📊 Analytics & Insights</h2>
          <p className="text-sm text-gray-500">Data-driven business intelligence</p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inventory Category Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Category Analysis</h3>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                Stock & Value
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => value.toLocaleString()}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="stockQuantity" name="Stock Quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="totalValue" name="Total Value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Asset Depreciation Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Asset Depreciation Schedule</h3>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                Cost vs Value
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetDepreciationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="purchaseCost" name="Purchase Cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="currentValue" name="Current Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Transaction Revenue by Type */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Transaction Revenue by Type</h3>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                Revenue Breakdown
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: $${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Performing Suppliers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Suppliers</h3>
              <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                Performance Metrics
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'totalAmount') return `$${value.toLocaleString()}`;
                    if (name === 'onTimeRate') return `${value.toFixed(1)}%`;
                    return value;
                  }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="totalAmount" name="Total Amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {supplierPerformance.map((supplier, idx) => (
                <div key={idx} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm transition-colors hover:bg-gray-100">
                  <span className="font-medium text-gray-700">{supplier.name}</span>
                  <span className="text-gray-900 font-semibold">
                    ${supplier.totalAmount.toLocaleString()} <span className="text-gray-500">({supplier.onTimeRate.toFixed(1)}% on-time)</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="rounded-full bg-blue-600 p-4 text-white shadow-lg transition hover:bg-blue-700"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
        
        {showAIChat && (
          <div className="absolute bottom-16 right-0 w-80 rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">🤖 AI Assistant</h3>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Ask me anything about your inventory:</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• "How many low stock items today?"</p>
                  <p>• "Show top selling products"</p>
                  <p>• "Predict next week sales"</p>
                </div>
              </div>
              <form onSubmit={handleAIMessage} className="flex gap-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
