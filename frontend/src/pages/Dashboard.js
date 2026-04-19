import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
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
  AreaChart,
  Area,
} from 'recharts';
import {
  CubeIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  BellIcon,
  CpuChipIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  TruckIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import {
  analyticsAPI,
  inventoryAPI,
  assetsAPI,
  salesAPI,
  purchasesAPI,
  expensesAPI,
  alertsAPI,
  stockTransfersAPI,
  warehousesAPI,
  transactionsAPI,
} from '../services/api';
import StatCard from '../components/StatCard';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];

const DashboardSection = ({ title, subtitle, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`card flex h-full flex-col p-4 lg:p-5 ${className}`}
  >
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
    </div>
    <div className="flex-1">{children}</div>
  </motion.div>
);

const MetricPill = ({ label, value, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-xl px-3 py-2 ${tones[tone] || tones.gray}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
};

const ListRow = ({ title, subtitle, value, tone = 'gray' }) => {
  const tones = {
    gray: 'text-gray-500',
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {value !== undefined ? (
        <div className={`text-sm font-semibold whitespace-nowrap ${tones[tone] || tones.gray}`}>
          {value}
        </div>
      ) : null}
    </div>
  );
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

const formatDate = (value) => {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const daysUntil = (value) => {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const Dashboard = () => {
  const { data: overview } = useQuery('dashboardOverview', analyticsAPI.getDashboardOverview, {
    refetchInterval: 30000,
  });
  const { data: inventoryTrends } = useQuery('inventoryTrends', () => analyticsAPI.getInventoryTrends({ period: 90 }));
  const { data: assetsOverview } = useQuery('assetsOverview', analyticsAPI.getAssetsOverview);
  const { data: transactionsAnalysis } = useQuery('transactionsAnalysis', () =>
    analyticsAPI.getTransactionsAnalysis({ period: 90 })
  );
  const { data: inventorySnapshot } = useQuery('dashboardInventorySnapshot', () =>
    inventoryAPI.getAll({ page: 1, limit: 200, sortBy: 'updatedAt', sortOrder: 'desc' })
  );
  const { data: assetsSnapshot } = useQuery('dashboardAssetsSnapshot', () =>
    assetsAPI.getAll({ page: 1, limit: 200, sortBy: 'updatedAt', sortOrder: 'desc' })
  );
  const { data: salesSnapshot } = useQuery('dashboardSalesSnapshot', () => salesAPI.getAll({ page: 1, limit: 100 }));
  const { data: purchasesSnapshot } = useQuery('dashboardPurchasesSnapshot', () =>
    purchasesAPI.getAll({ page: 1, limit: 100 })
  );
  const { data: expensesSnapshot } = useQuery('dashboardExpensesSnapshot', () =>
    expensesAPI.getAll({ page: 1, limit: 100 })
  );
  const { data: alertsSnapshot } = useQuery('dashboardAlertsSnapshot', () =>
    alertsAPI.getAll({ page: 1, limit: 20, status: 'active' })
  );
  const { data: transfersSnapshot } = useQuery('dashboardTransfersSnapshot', () =>
    stockTransfersAPI.getAll({ page: 1, limit: 50 })
  );
  const { data: warehousesSnapshot } = useQuery('dashboardWarehousesSnapshot', warehousesAPI.getAll);
  const { data: transactionsSnapshot } = useQuery('dashboardTransactionsSnapshot', () =>
    transactionsAPI.getAll({ page: 1, limit: 100, sortBy: 'date', sortOrder: 'desc' })
  );

  const overviewData = overview?.data?.data || {};
  const inventoryItems = inventorySnapshot?.data?.data?.inventory || [];
  const assets = assetsSnapshot?.data?.data?.assets || [];
  const sales = salesSnapshot?.data?.data?.sales || [];
  const purchases = purchasesSnapshot?.data?.data?.purchases || [];
  const expenses = expensesSnapshot?.data?.data?.expenses || [];
  const alerts = alertsSnapshot?.data?.data?.alerts || [];
  const transfers = transfersSnapshot?.data?.data?.transfers || [];
  const warehouses = warehousesSnapshot?.data?.data?.warehouses || [];
  const transactions = transactionsSnapshot?.data?.data?.transactions || [];
  const categoryTrends = inventoryTrends?.data?.data?.categoryTrends || [];
  const inventoryTrendPoints = transactionsAnalysis?.data?.data?.transactionTrends || [];
  const assetByCategory = assetsOverview?.data?.data?.assetByCategory || [];

  const salesByProductMap = {};
  sales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const productId = item.product?._id || item.product;
      const productName = item.product?.name || 'Unknown Product';
      if (!salesByProductMap[productId]) {
        salesByProductMap[productId] = {
          id: productId,
          name: productName,
          quantitySold: 0,
          revenue: 0,
        };
      }
      salesByProductMap[productId].quantitySold += item.quantity || 0;
      salesByProductMap[productId].revenue += item.total || 0;
    });
  });

  const topSellingProducts = Object.values(salesByProductMap)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  const deadStockItems = inventoryItems
    .filter((item) => !salesByProductMap[item._id] && item.quantity > 0)
    .sort((a, b) => (b.quantity * (b.price?.cost || 0)) - (a.quantity * (a.price?.cost || 0)))
    .slice(0, 5);

  const criticalStockItems = inventoryItems
    .filter((item) => item.quantity <= Math.max(item.minStockLevel || 0, Math.ceil((item.reorderPoint || 0) * 0.5)))
    .sort((a, b) => (a.quantity - (a.minStockLevel || 0)) - (b.quantity - (b.minStockLevel || 0)))
    .slice(0, 5);

  const movingItems = inventoryItems
    .filter((item) => salesByProductMap[item._id])
    .map((item) => ({
      name: item.name,
      quantitySold: salesByProductMap[item._id].quantitySold,
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold);

  const fastMovingItems = movingItems.slice(0, 5);
  const slowMovingItems = [...movingItems].reverse().slice(0, 5).reverse();

  const assetCounts = assets.reduce(
    (acc, asset) => {
      acc.total += 1;
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    },
    { total: 0, active: 0, in_repair: 0, maintenance_due: 0 }
  );

  const upcomingMaintenance = assets
    .filter((asset) => asset.maintenance?.nextMaintenanceDue)
    .sort(
      (a, b) =>
        new Date(a.maintenance.nextMaintenanceDue).getTime() -
        new Date(b.maintenance.nextMaintenanceDue).getTime()
    )
    .slice(0, 5);

  const totalRevenue = sales
    .filter((sale) => sale.status === 'completed')
    .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalPurchaseSpend = purchases
    .filter((purchase) => purchase.status !== 'cancelled')
    .reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
  const totalExpenses = expenses
    .filter((expense) => expense.status !== 'cancelled')
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const profitLoss = totalRevenue - totalPurchaseSpend - totalExpenses;

  const monthKeys = [];
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  const monthLabels = monthKeys.reduce((acc, key) => {
    const [year, month] = key.split('-');
    acc[key] = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', {
      month: 'short',
    });
    return acc;
  }, {});

  const baseSeries = monthKeys.reduce((acc, key) => {
    acc[key] = {
      month: monthLabels[key],
      revenue: 0,
      expenses: 0,
      purchases: 0,
      profit: 0,
      inflow: 0,
      outflow: 0,
    };
    return acc;
  }, {});

  sales.forEach((sale) => {
    const date = new Date(sale.sale_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (baseSeries[key] && sale.status === 'completed') {
      baseSeries[key].revenue += sale.total_amount || 0;
      baseSeries[key].inflow += sale.total_amount || 0;
    }
  });

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (baseSeries[key] && expense.status !== 'cancelled') {
      baseSeries[key].expenses += expense.amount || 0;
      baseSeries[key].outflow += expense.amount || 0;
    }
  });

  purchases.forEach((purchase) => {
    const date = new Date(purchase.purchase_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (baseSeries[key] && purchase.status !== 'cancelled') {
      baseSeries[key].purchases += purchase.total_amount || 0;
      baseSeries[key].outflow += purchase.total_amount || 0;
    }
  });

  const financialSeries = monthKeys.map((key) => ({
    ...baseSeries[key],
    profit: baseSeries[key].revenue - baseSeries[key].expenses - baseSeries[key].purchases,
  }));

  const warehouseDistribution = (warehouses.length > 0
    ? warehouses.map((warehouse) => ({
        name: warehouse.name,
        itemCount: inventoryItems.filter((item) => item.location?.warehouse === warehouse.name).length,
        quantity: inventoryItems
          .filter((item) => item.location?.warehouse === warehouse.name)
          .reduce((sum, item) => sum + (item.quantity || 0), 0),
      }))
    : Object.entries(
        inventoryItems.reduce((acc, item) => {
          const warehouseName = item.location?.warehouse || 'Unassigned';
          if (!acc[warehouseName]) {
            acc[warehouseName] = { name: warehouseName, itemCount: 0, quantity: 0 };
          }
          acc[warehouseName].itemCount += 1;
          acc[warehouseName].quantity += item.quantity || 0;
          return acc;
        }, {})
      ).map(([, value]) => value))
    .filter((entry) => entry.itemCount > 0)
    .slice(0, 6);

  const transferStatusCounts = transfers.reduce(
    (acc, transfer) => {
      acc[transfer.status] = (acc[transfer.status] || 0) + 1;
      return acc;
    },
    { pending: 0, in_transit: 0, completed: 0 }
  );

  const pendingOrders = transactions.filter((transaction) => transaction.status === 'pending').length;
  const completedOrders = transactions.filter((transaction) => transaction.status === 'completed').length;
  const returnedOrders =
    transactions.filter((transaction) => transaction.type === 'return').length +
    sales.filter((sale) => sale.status === 'refunded').length;

  const lowStockAlerts = alerts.filter((alert) => ['low_stock', 'out_of_stock'].includes(alert.type)).length;
  const expiryAlerts = inventoryItems.filter((item) => {
    const remainingDays = daysUntil(item.expiryDate);
    return remainingDays !== null && remainingDays <= 30;
  }).length;
  const paymentPendingAlerts =
    purchases.filter((purchase) => ['pending', 'partial'].includes(purchase.payment_status)).length +
    transactions.filter((transaction) => ['pending', 'partial', 'overdue'].includes(transaction.payment?.status)).length;

  const recentActivities = [
    ...sales.slice(0, 5).map((sale) => ({
      id: `sale-${sale._id}`,
      type: 'Sale',
      title: sale.customer_name || 'Walk-in Customer',
      subtitle: `${sale.items?.length || 0} items sold`,
      time: sale.sale_date,
      amount: formatCurrency(sale.total_amount),
      tone: 'green',
    })),
    ...purchases.slice(0, 5).map((purchase) => ({
      id: `purchase-${purchase._id}`,
      type: 'Purchase',
      title: purchase.supplier?.company_name || purchase.supplier?.name || 'Supplier order',
      subtitle: `${purchase.items?.length || 0} items purchased`,
      time: purchase.purchase_date,
      amount: formatCurrency(purchase.total_amount),
      tone: 'blue',
    })),
    ...assets
      .filter((asset) => asset.assigned_to?.assigned_date)
      .slice(0, 5)
      .map((asset) => ({
        id: `asset-${asset._id}`,
        type: 'Asset',
        title: asset.asset_name,
        subtitle: `Assigned to ${asset.assigned_to?.user_id?.firstName || 'team member'}`,
        time: asset.assigned_to.assigned_date,
        amount: asset.assigned_to?.location || 'Assignment update',
        tone: 'orange',
      })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  const last7Revenue = sales
    .filter((sale) => new Date(sale.sale_date).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const prev7Revenue = sales
    .filter((sale) => {
      const time = new Date(sale.sale_date).getTime();
      return time < Date.now() - 7 * 24 * 60 * 60 * 1000 && time >= Date.now() - 14 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const salesDropPercent =
    prev7Revenue > 0 ? Math.max(0, Math.round(((prev7Revenue - last7Revenue) / prev7Revenue) * 100)) : 0;

  const projectedStockoutItem = criticalStockItems.find((item) => {
    const sold = salesByProductMap[item._id]?.quantitySold || 0;
    const dailyDemand = Math.max((item.aiPredictedDemand?.next30Days || 0) / 30, sold / 30);
    return dailyDemand > 0;
  });
  const projectedStockoutDays = projectedStockoutItem
    ? Math.ceil(
        projectedStockoutItem.quantity /
          Math.max(
            (projectedStockoutItem.aiPredictedDemand?.next30Days || 0) / 30,
            (salesByProductMap[projectedStockoutItem._id]?.quantitySold || 0) / 30
          )
      )
    : null;

  const aiInsights = [
    salesDropPercent > 0
      ? {
          title: `Sales dropped ${salesDropPercent}% this week`,
          detail: 'Compare this week with the previous 7-day period and review affected products.',
        }
      : {
          title: 'Sales momentum is holding steady this week',
          detail: 'Weekly revenue is stable or improving compared with the previous week.',
        },
    projectedStockoutItem
      ? {
          title: `${projectedStockoutItem.name} may run out in about ${projectedStockoutDays} days`,
          detail: `Current stock is ${projectedStockoutItem.quantity} units against recent demand patterns.`,
        }
      : {
          title: 'No immediate stockout risk detected from recent demand',
          detail: 'Critical stock still exists, but recent demand data does not show a near-term runout.',
        },
    deadStockItems.length > 0
      ? {
          title: `Reduce purchasing for ${deadStockItems[0].name} and other slow movers`,
          detail: `${deadStockItems.length} items currently show stock on hand with no recent movement in the dashboard sample.`,
        }
      : {
          title: 'Dead stock risk is currently low',
          detail: 'Most stocked items show at least some recent sales movement in the dashboard sample.',
        },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/products/create', icon: PlusIcon, tone: 'blue' },
    { label: 'Add Sale', href: '/sell', icon: ShoppingCartIcon, tone: 'green' },
    { label: 'Add Purchase', href: '/purchases/create', icon: TruckIcon, tone: 'purple' },
    { label: 'Transfer Stock', href: '/stock-transfers', icon: ArrowPathIcon, tone: 'orange' },
  ];

  const quickActionClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Smart control center for inventory, assets, finances, and operations.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <div className="h-full">
          <StatCard
            title="Total Inventory Value"
            value={formatCurrency(overviewData.totalInventoryValue)}
            icon={<CubeIcon className="h-6 w-6" />}
            color="blue"
            trend="stable"
            href="/reports/stock"
          />
        </div>
        <div className="h-full">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<BanknotesIcon className="h-6 w-6" />}
            color="green"
            trend="up"
            href="/sell"
          />
        </div>
        <div className="h-full">
          <StatCard
            title="Profit / Loss"
            value={formatCurrency(profitLoss)}
            icon={<ChartBarIcon className="h-6 w-6" />}
            color={profitLoss >= 0 ? 'green' : 'red'}
            trend={profitLoss >= 0 ? 'up' : 'down'}
            href="/reports"
          />
        </div>
        <div className="h-full">
          <StatCard
            title="Active Alerts"
            value={formatNumber(overviewData.activeAlerts || alerts.length)}
            icon={<BellIcon className="h-6 w-6" />}
            color="orange"
            trend={(overviewData.activeAlerts || alerts.length) > 0 ? 'up' : 'stable'}
            href="/alerts"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 lg:gap-5">
        <DashboardSection
          title="Quick Actions"
          subtitle="Fast paths for common tasks without leaving the main dashboard flow"
          delay={0.08}
          className="col-span-12"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`${quickActionClasses[action.tone]} flex h-full items-center justify-between rounded-xl px-4 py-4 text-white transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5" />
                  <span className="font-semibold">{action.label}</span>
                </div>
                <PlusIcon className="h-4 w-4 opacity-70" />
              </Link>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Inventory Intelligence"
          subtitle="Top sellers, dead stock, critical stock, movement velocity, and category performance"
          delay={0.12}
          className="col-span-12 xl:col-span-8"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricPill label="Top Sellers" value={topSellingProducts.length} tone="green" />
            <MetricPill label="Dead Stock" value={deadStockItems.length} tone="orange" />
            <MetricPill label="Critical Stock" value={criticalStockItems.length} tone="red" />
            <MetricPill label="Tracked SKUs" value={inventoryItems.length} tone="blue" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Top Selling Products</h4>
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((item) => (
                  <ListRow
                    key={item.id}
                    title={item.name}
                    subtitle={`${item.quantitySold} units sold`}
                    value={formatCurrency(item.revenue)}
                    tone="green"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No sales data yet.</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Critical Stock</h4>
              {criticalStockItems.length > 0 ? (
                criticalStockItems.map((item) => (
                  <ListRow
                    key={item._id}
                    title={item.name}
                    subtitle={`Min level ${item.minStockLevel || 0}`}
                    value={`${item.quantity} left`}
                    tone="red"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">Stock levels look healthy right now.</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Dead Stock</h4>
              {deadStockItems.length > 0 ? (
                deadStockItems.map((item) => (
                  <ListRow
                    key={item._id}
                    title={item.name}
                    subtitle={`${item.quantity} units on hand`}
                    value={item.category}
                    tone="orange"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No dead stock found in the current snapshot.</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Fast Moving Items</h4>
                {fastMovingItems.length > 0 ? (
                  fastMovingItems.map((item) => (
                    <ListRow
                      key={item.name}
                      title={item.name}
                      subtitle="Fast moving"
                      value={`${item.quantitySold} sold`}
                      tone="green"
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Not enough movement data yet.</p>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Slow Moving Items</h4>
                {slowMovingItems.length > 0 ? (
                  slowMovingItems.map((item) => (
                    <ListRow
                      key={`${item.name}-slow`}
                      title={item.name}
                      subtitle="Slow moving"
                      value={`${item.quantitySold} sold`}
                      tone="orange"
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No slow movers identified yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <h4 className="mb-3 font-medium text-gray-900">Inventory Trend</h4>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={inventoryTrendPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" hide />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="totalAmount" stroke="#2563eb" fill="#bfdbfe" name="Movement Value" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <h4 className="mb-3 font-medium text-gray-900">Category Performance</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryTrends.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="totalQuantity" fill="#0ea5e9" name="Stock Quantity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Asset Management Panel"
          subtitle="Active assets, maintenance schedule, and category mix"
          delay={0.16}
          className="col-span-12 xl:col-span-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <MetricPill label="Active Assets" value={assetCounts.active} tone="green" />
            <MetricPill label="In Repair" value={assetCounts.in_repair} tone="red" />
            <MetricPill label="Maintenance Due" value={assetCounts.maintenance_due} tone="orange" />
            <MetricPill label="Upcoming" value={upcomingMaintenance.length} tone="blue" />
          </div>

          <div className="mt-4 space-y-3">
            <h4 className="font-medium text-gray-900">Upcoming Maintenance</h4>
            {upcomingMaintenance.length > 0 ? (
              upcomingMaintenance.map((asset) => {
                const remainingDays = daysUntil(asset.maintenance?.nextMaintenanceDue);
                return (
                  <ListRow
                    key={asset._id}
                    title={asset.asset_name}
                    subtitle={`${asset.category} • ${formatDate(asset.maintenance?.nextMaintenanceDue)}`}
                    value={remainingDays !== null ? `${remainingDays} days` : 'Scheduled'}
                    tone={remainingDays !== null && remainingDays <= 7 ? 'red' : 'blue'}
                  />
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No maintenance dates scheduled yet.</p>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <h4 className="mb-3 font-medium text-gray-900">Asset Distribution</h4>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={assetByCategory}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  label={({ _id, count }) => `${_id}: ${count}`}
                >
                  {assetByCategory.map((entry, index) => (
                    <Cell key={`${entry._id}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Financial Overview"
          subtitle="Revenue, expense, purchases, and monthly profit trend"
          delay={0.2}
          className="col-span-12 md:col-span-6 xl:col-span-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <MetricPill label="Revenue" value={formatCurrency(totalRevenue)} tone="green" />
            <MetricPill label="Expenses" value={formatCurrency(totalExpenses)} tone="red" />
            <MetricPill label="Purchases" value={formatCurrency(totalPurchaseSpend)} tone="orange" />
            <MetricPill
              label="Profit / Loss"
              value={formatCurrency(profitLoss)}
              tone={profitLoss >= 0 ? 'green' : 'red'}
            />
          </div>
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={financialSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#16a34a" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="purchases" fill="#f59e0b" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Cash Flow"
          subtitle="Money in and out across the last 6 months"
          delay={0.24}
          className="col-span-12 md:col-span-6 xl:col-span-4"
        >
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={financialSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#2563eb" fill="#93c5fd" name="Cash In" />
                <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ef4444" fill="#fca5a5" name="Cash Out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={financialSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#7c3aed" strokeWidth={3} name="Monthly Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Alerts Panel"
          subtitle="Low stock, expiry risk, and payment follow-up"
          delay={0.28}
          className="col-span-12 md:col-span-6 xl:col-span-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <MetricPill label="Low Stock" value={lowStockAlerts} tone="red" />
            <MetricPill label="Expiry" value={expiryAlerts} tone="orange" />
            <MetricPill label="Payment" value={paymentPendingAlerts} tone="blue" />
          </div>
          <div className="mt-4 space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <ListRow
                key={alert._id}
                title={alert.title}
                subtitle={alert.entity_name}
                value={alert.severity}
                tone={alert.severity === 'critical' ? 'red' : 'orange'}
              />
            ))}
            {alerts.length === 0 ? <p className="text-sm text-gray-500">No active alerts right now.</p> : null}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Warehouse / Location View"
          subtitle="Current stock footprint and transfer flow"
          delay={0.32}
          className="col-span-12 md:col-span-6 xl:col-span-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <MetricPill label="Warehouses" value={warehouses.length || warehouseDistribution.length} tone="blue" />
            <MetricPill label="Pending" value={transferStatusCounts.pending || 0} tone="orange" />
            <MetricPill label="Completed" value={transferStatusCounts.completed || 0} tone="green" />
          </div>
          <div className="mt-4 space-y-3">
            {warehouseDistribution.length > 0 ? (
              warehouseDistribution.map((entry) => (
                <ListRow
                  key={entry.name}
                  title={entry.name}
                  subtitle={`${entry.itemCount} SKUs`}
                  value={`${entry.quantity} units`}
                  tone="blue"
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No warehouse distribution data available yet.</p>
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Orders Overview"
          subtitle="Operational order flow from transactions and returns"
          delay={0.36}
          className="col-span-12 md:col-span-6 xl:col-span-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <MetricPill label="Pending" value={pendingOrders} tone="orange" />
            <MetricPill label="Completed" value={completedOrders} tone="green" />
            <MetricPill label="Returned" value={returnedOrders} tone="red" />
          </div>
          <div className="mt-4 space-y-3">
            <ListRow
              title="Purchase Orders"
              subtitle="Open supplier orders"
              value={purchases.filter((purchase) => purchase.status === 'ordered').length}
              tone="orange"
            />
            <ListRow
              title="Completed Transfer Activity"
              subtitle="Warehouse stock movement"
              value={transferStatusCounts.completed || 0}
              tone="green"
            />
            <ListRow
              title="Refund / Return Events"
              subtitle="Sales refunds and return transactions"
              value={returnedOrders}
              tone="red"
            />
          </div>
        </DashboardSection>

        <DashboardSection
          title="Recent Activities"
          subtitle="Recent sales, purchases, and asset assignments"
          delay={0.4}
          className="col-span-12 xl:col-span-6"
        >
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {activity.type === 'Sale' ? (
                      <ShoppingCartIcon className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : activity.type === 'Purchase' ? (
                      <TruckIcon className="mt-0.5 h-5 w-5 text-blue-600" />
                    ) : (
                      <BuildingOfficeIcon className="mt-0.5 h-5 w-5 text-orange-600" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.subtitle}</p>
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-right">
                    <p className={`text-sm font-semibold ${activity.tone === 'green' ? 'text-green-600' : activity.tone === 'blue' ? 'text-blue-600' : 'text-orange-600'}`}>
                      {activity.amount}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Recent activity will appear here as transactions and assignments happen.</p>
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          title="AI Insights Panel"
          subtitle="Smart recommendations based on current dashboard signals"
          delay={0.44}
          className="col-span-12 xl:col-span-6"
        >
          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.title} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <CpuChipIcon className="mt-0.5 h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-semibold text-blue-950">{insight.title}</p>
                    <p className="mt-1 text-sm text-blue-800">{insight.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Revenue vs Expense"
          subtitle="Monthly comparison for the last 6 months"
          delay={0.48}
          className="col-span-12 md:col-span-6 xl:col-span-4"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={financialSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardSection>
      </div>
    </div>
  );
};

export default Dashboard;
