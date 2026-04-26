import React, { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  CubeIcon,
  BanknotesIcon,
  TruckIcon,
  ReceiptRefundIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BellIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserCircleIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  inventoryAPI,
  salesAPI,
  purchasesAPI,
  expensesAPI,
  assetsAPI,
  stockTransfersAPI,
  usersAPI,
  alertsAPI,
  analyticsAPI
} from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const currency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(Number(value || 0));

const dateValue = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const csvEscape = (value) => {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const reportConfigs = {
  inventory: {
    title: 'Inventory Reports',
    description: 'Stock levels, movements, and inventory value at a glance.',
    icon: CubeIcon,
    fetcher: () => Promise.all([
      analyticsAPI.getStockReport(),
      inventoryAPI.getLowStock()
    ]),
    normalize: ([stockResponse, lowStockResponse]) => {
      const stockData = stockResponse?.data?.data || {};
      const items = stockData.items || [];
      const lowStockItems = lowStockResponse?.data?.data?.lowStockItems || [];

      return {
        stats: [
          { label: 'Items', value: stockData.stats?.total_items || items.length },
          { label: 'Low Stock', value: stockData.stats?.low_stock_items || lowStockItems.length },
          { label: 'Out of Stock', value: stockData.stats?.out_of_stock || 0 },
          { label: 'Inventory Value', value: currency(stockData.stats?.total_value || 0) }
        ],
        highlights: [
          `Low stock alerts: ${lowStockItems.length}`,
          `Tracked categories: ${new Set(items.map((item) => item.category).filter(Boolean)).size}`,
          `Highest quantity item: ${items[items.length - 1]?.name || 'N/A'}`
        ],
        columns: ['Product', 'Category', 'Quantity', 'Min Level', 'Unit Cost', 'Value'],
        rows: items.map((item) => [
          item.name,
          item.category,
          item.quantity,
          item.minStockLevel,
          currency(item.price?.cost || 0),
          currency((item.quantity || 0) * (item.price?.cost || 0))
        ])
      };
    }
  },
  sales: {
    title: 'Sales Reports',
    description: 'Revenue, order volume, and recent completed sales.',
    icon: BanknotesIcon,
    fetcher: () => Promise.all([
      salesAPI.getAll({ limit: 50 }),
      analyticsAPI.getReportsSummary()
    ]),
    normalize: ([salesResponse, summaryResponse]) => {
      const sales = salesResponse?.data?.data?.sales || [];
      const summary = summaryResponse?.data?.data || {};

      return {
        stats: [
          { label: 'Sales Count', value: summary.sales?.count || sales.length },
          { label: 'Sales Total', value: currency(summary.sales?.total || 0) },
          { label: 'Avg Ticket', value: currency((summary.sales?.total || 0) / Math.max(summary.sales?.count || sales.length || 1, 1)) },
          { label: 'Latest Sale', value: dateValue(sales[0]?.sale_date) }
        ],
        highlights: [
          `Completed sales shown: ${sales.length}`,
          `Payment methods used: ${new Set(sales.map((sale) => sale.payment_method).filter(Boolean)).size}`,
          `Top customer in list: ${sales[0]?.customer_name || 'Walk-in Customer'}`
        ],
        columns: ['Sale ID', 'Customer', 'Date', 'Items', 'Payment', 'Total'],
        rows: sales.map((sale) => [
          sale.sale_id,
          sale.customer_name,
          dateValue(sale.sale_date),
          sale.items?.length || 0,
          sale.payment_method,
          currency(sale.total_amount)
        ])
      };
    }
  },
  purchases: {
    title: 'Purchase Reports',
    description: 'Supplier orders, receiving status, and purchase totals.',
    icon: TruckIcon,
    fetcher: () => Promise.all([
      purchasesAPI.getAll({ limit: 50 }),
      analyticsAPI.getReportsSummary()
    ]),
    normalize: ([purchasesResponse, summaryResponse]) => {
      const purchases = purchasesResponse?.data?.data?.purchases || [];
      const summary = summaryResponse?.data?.data || {};
      return {
        stats: [
          { label: 'Purchase Count', value: summary.purchases?.count || purchases.length },
          { label: 'Purchase Total', value: currency(summary.purchases?.total || 0) },
          { label: 'Pending Orders', value: purchases.filter((purchase) => purchase.status !== 'received').length },
          { label: 'Paid Orders', value: purchases.filter((purchase) => purchase.payment_status === 'paid').length }
        ],
        highlights: [
          `Suppliers represented: ${new Set(purchases.map((purchase) => purchase.supplier?.company_name || purchase.supplier?.name).filter(Boolean)).size}`,
          `Received orders: ${purchases.filter((purchase) => purchase.status === 'received').length}`,
          `Pending payment orders: ${purchases.filter((purchase) => purchase.payment_status !== 'paid').length}`
        ],
        columns: ['Purchase ID', 'Supplier', 'Date', 'Status', 'Payment', 'Total'],
        rows: purchases.map((purchase) => [
          purchase.purchase_id,
          purchase.supplier?.company_name || purchase.supplier?.name || '-',
          dateValue(purchase.purchase_date),
          purchase.status,
          purchase.payment_status,
          currency(purchase.total_amount)
        ])
      };
    }
  },
  expenses: {
    title: 'Expense Reports',
    description: 'Expense category trends, payment status, and total spend.',
    icon: ReceiptRefundIcon,
    fetcher: () => Promise.all([
      expensesAPI.getAll({ limit: 50 }),
      analyticsAPI.getReportsSummary()
    ]),
    normalize: ([expensesResponse, summaryResponse]) => {
      const expenses = expensesResponse?.data?.data?.expenses || [];
      const summary = summaryResponse?.data?.data || {};
      return {
        stats: [
          { label: 'Expense Count', value: summary.expenses?.count || expenses.length },
          { label: 'Expense Total', value: currency(summary.expenses?.total || 0) },
          { label: 'Categories', value: new Set(expenses.map((expense) => expense.category).filter(Boolean)).size },
          { label: 'Pending', value: expenses.filter((expense) => expense.status === 'pending').length }
        ],
        highlights: [
          `Top category: ${Object.entries(expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
          }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`,
          `Paid expenses: ${expenses.filter((expense) => expense.status === 'paid').length}`,
          `Latest expense date: ${dateValue(expenses[0]?.date)}`
        ],
        columns: ['Expense ID', 'Category', 'Date', 'Status', 'Method', 'Amount'],
        rows: expenses.map((expense) => [
          expense.expense_id,
          expense.category,
          dateValue(expense.date),
          expense.status,
          expense.payment_method,
          currency(expense.amount)
        ])
      };
    }
  },
  assets: {
    title: 'Asset Reports',
    description: 'Asset status, valuation, assignment, and maintenance visibility.',
    icon: BuildingOfficeIcon,
    fetcher: () => Promise.all([
      assetsAPI.getAll({ limit: 50 }),
      analyticsAPI.getAssetsOverview()
    ]),
    normalize: ([assetsResponse, overviewResponse]) => {
      const assets = assetsResponse?.data?.assets || [];
      const overview = overviewResponse?.data?.data || {};
      const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.purchase_cost?.amount || 0), 0);
      return {
        stats: [
          { label: 'Assets', value: assets.length },
          { label: 'Asset Value', value: currency(totalAssetValue) },
          { label: 'Maintenance Due', value: overview.maintenance?.dueCount || 0 },
          { label: 'Active Assets', value: assets.filter((asset) => asset.status === 'active').length }
        ],
        highlights: [
          `Assigned assets: ${assets.filter((asset) => asset.assigned_to?.user_id).length}`,
          `Asset categories: ${new Set(assets.map((asset) => asset.category).filter(Boolean)).size}`,
          `Disposed assets: ${assets.filter((asset) => asset.status === 'disposed').length}`
        ],
        columns: ['Asset', 'Category', 'Status', 'Assigned To', 'Purchase Date', 'Purchase Cost'],
        rows: assets.map((asset) => [
          asset.asset_name,
          asset.category,
          asset.status,
          asset.assigned_to?.user_id ? `${asset.assigned_to.user_id.firstName || ''} ${asset.assigned_to.user_id.lastName || ''}`.trim() : '-',
          dateValue(asset.purchase_date),
          currency(asset.purchase_cost?.amount || 0)
        ])
      };
    }
  },
  'stock-transfers': {
    title: 'Stock Transfer Reports',
    description: 'Transfer activity, statuses, and warehouse movement details.',
    icon: ArrowPathIcon,
    fetcher: () => stockTransfersAPI.getAll({ limit: 50 }),
    normalize: (response) => {
      const transfers = response?.data?.data?.transfers || [];
      return {
        stats: [
          { label: 'Transfers', value: transfers.length },
          { label: 'Completed', value: transfers.filter((transfer) => transfer.status === 'completed').length },
          { label: 'In Transit', value: transfers.filter((transfer) => transfer.status === 'in_transit').length },
          { label: 'Shipping Charges', value: currency(transfers.reduce((sum, transfer) => sum + (transfer.shipping_charges || 0), 0)) }
        ],
        highlights: [
          `Warehouses involved: ${new Set(transfers.flatMap((transfer) => [transfer.from_warehouse?.name, transfer.to_warehouse?.name]).filter(Boolean)).size}`,
          `Pending transfers: ${transfers.filter((transfer) => transfer.status === 'pending').length}`,
          `Cancelled transfers: ${transfers.filter((transfer) => transfer.status === 'cancelled').length}`
        ],
        columns: ['Transfer ID', 'From', 'To', 'Date', 'Status', 'Items'],
        rows: transfers.map((transfer) => [
          transfer.transfer_id,
          transfer.from_warehouse?.name || '-',
          transfer.to_warehouse?.name || '-',
          dateValue(transfer.date),
          transfer.status,
          transfer.items?.length || 0
        ])
      };
    }
  },
  alerts: {
    title: 'Alerts & Exceptions',
    description: 'Operational alerts, severities, and exception trends.',
    icon: BellIcon,
    fetcher: () => Promise.all([
      alertsAPI.getAll({ limit: 50 }),
      analyticsAPI.getAlertsAnalysis()
    ]),
    normalize: ([alertsResponse, analysisResponse]) => {
      const alerts = alertsResponse?.data?.data?.alerts || [];
      const analysis = analysisResponse?.data?.data || {};
      return {
        stats: [
          { label: 'Alerts', value: alerts.length },
          { label: 'Active', value: alerts.filter((alert) => alert.status === 'active').length },
          { label: 'Critical', value: alerts.filter((alert) => alert.severity === 'critical').length },
          { label: 'Alert Types', value: analysis.typeDistribution?.length || new Set(alerts.map((alert) => alert.type)).size }
        ],
        highlights: [
          `Acknowledged alerts: ${alerts.filter((alert) => alert.status === 'acknowledged').length}`,
          `Resolved alerts: ${alerts.filter((alert) => alert.status === 'resolved').length}`,
          `Top type: ${analysis.typeDistribution?.[0]?._id || alerts[0]?.type || 'N/A'}`
        ],
        columns: ['Alert ID', 'Type', 'Severity', 'Entity', 'Created', 'Status'],
        rows: alerts.map((alert) => [
          alert.alert_id,
          alert.type,
          alert.severity,
          alert.entity_name,
          dateValue(alert.timestamps?.created),
          alert.status
        ])
      };
    }
  },
  'user-activity': {
    title: 'User Activity Logs',
    description: 'User login patterns, actions performed, and system access tracking.',
    icon: UserCircleIcon,
    fetcher: () => Promise.all([
      usersAPI.getAll({ limit: 50 }),
      analyticsAPI.getUserActivityAnalysis()
    ]),
    normalize: ([usersResponse, activityResponse]) => {
      const users = usersResponse?.data?.users || [];
      const activity = activityResponse?.data?.data || {};
      return {
        stats: [
          { label: 'Total Users', value: users.length },
          { label: 'Active Today', value: activity.activeToday || 0 },
          { label: 'Actions Today', value: activity.actionsToday || 0 },
          { label: 'Avg Session', value: `${activity.averageSessionMinutes || 0}m` }
        ],
        highlights: [
          `Users logged in today: ${activity.loggedInToday || 0}`,
          `Most active user: ${activity.mostActiveUser || 'N/A'}`,
          `Peak activity hour: ${activity.peakActivityHour || 'N/A'}`
        ],
        columns: ['User', 'Department', 'Last Login', 'Actions Today', 'Session Time', 'Status'],
        rows: users.map((user) => [
          `${user.firstName} ${user.lastName}`,
          user.department || '-',
          dateValue(user.lastLogin),
          user.actionsToday || 0,
          `${user.sessionMinutes || 0}m`,
          user.isActive ? 'Active' : 'Inactive'
        ])
      };
    }
  },
  custom: {
    title: 'Custom Reports / Export',
    description: 'Cross-functional summary with quick export of the visible dataset.',
    icon: DocumentTextIcon,
    fetcher: () => Promise.all([
      analyticsAPI.getReportsSummary(),
      inventoryAPI.getAll({ limit: 50 }),
      salesAPI.getAll({ limit: 50 })
    ]),
    normalize: ([summaryResponse, inventoryResponse, salesResponse]) => {
      const summary = summaryResponse?.data?.data || {};
      const inventory = inventoryResponse?.data?.data?.inventory || [];
      const sales = salesResponse?.data?.data?.sales || [];
      return {
        stats: [
          { label: 'Sales', value: currency(summary.sales?.total || 0) },
          { label: 'Purchases', value: currency(summary.purchases?.total || 0) },
          { label: 'Expenses', value: currency(summary.expenses?.total || 0) },
          { label: 'Profit', value: currency(summary.profit || 0) }
        ],
        highlights: [
          `Inventory rows available for export: ${inventory.length}`,
          `Sales rows available for export: ${sales.length}`,
          'Use Export CSV to download the visible report'
        ],
        columns: ['Metric', 'Value'],
        rows: [
          ['Sales Count', summary.sales?.count || sales.length],
          ['Purchase Count', summary.purchases?.count || 0],
          ['Expense Count', summary.expenses?.count || 0],
          ['Inventory Items', inventory.length],
          ['Profit', currency(summary.profit || 0)]
        ]
      };
    }
  }
};

const ReportCategory = () => {
  const { reportType } = useParams();
  const { user } = useAuth();
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const config = reportConfigs[reportType];

  const { data, isLoading, isError, error } = useQuery(
    ['report-category', reportType],
    () => config.fetcher(),
    {
      enabled: Boolean(config) && (!config?.adminOnly || user?.role === 'admin'),
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      keepPreviousData: true,
    }
  );

  const report = useMemo(() => {
    if (!config || !data) return null;
    return config.normalize(data);
  }, [config, data]);

  if (!config) {
    return <Navigate to="/reports" replace />;
  }

  if (config.adminOnly && user?.role !== 'admin') {
    return (
      <div className="space-y-4">
        <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-500">Back to Reports</Link>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="mt-2 text-gray-600">This report is available to admins only.</p>
        </div>
      </div>
    );
  }

  const exportCsv = () => {
    if (!report) return;
    const lines = [
      report.columns.map(csvEscape).join(','),
      ...report.rows.map((row) => row.map(csvEscape).join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const Icon = config.icon;
  const quickLinks = {
    sales: '/sell',
    inventory: '/inventory',
    customers: '/contacts',
    suppliers: '/suppliers',
    assets: '/assets',
    'stock-transfers': '/stock-transfers',
    alerts: '/alerts',
    'user-activity': '/users',
    custom: '/reports',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-500">Back to Reports</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-3">
              <Icon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600">{config.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <SignalIcon className="h-4 w-4" />
            <span>Auto-refresh every 10s</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>{dateRange.startDate} to {dateRange.endDate}</span>
          </div>
          <button onClick={exportCsv} className="btn btn-secondary flex items-center gap-2 text-sm">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center rounded-xl border border-gray-200 bg-white p-12">
          <LoadingSpinner size="large" />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load this report: {error?.response?.data?.message || error?.message || 'Unknown error'}
        </div>
      ) : null}

      {!isLoading && !isError && report ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Report Table</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {report.columns.map((column) => (
                        <th key={column} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {report.rows.length === 0 ? (
                      <tr>
                        <td colSpan={report.columns.length} className="px-6 py-10 text-center text-sm text-gray-500">
                          No data available for this report yet.
                        </td>
                      </tr>
                    ) : (
                      report.rows.map((row, index) => (
                        <tr key={`${reportType}-${index}`} className="hover:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td key={`${reportType}-${index}-${cellIndex}`} className="px-6 py-4 text-sm text-gray-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Highlights</h2>
                <div className="mt-4 space-y-3">
                  {report.highlights.map((item) => (
                    <div key={item} className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <div className="mt-4 space-y-3">
                  <button onClick={exportCsv} className="btn btn-secondary w-full text-sm">Download CSV</button>
                  <button onClick={() => window.print()} className="btn btn-secondary w-full text-sm">Print Report</button>
                  {quickLinks[reportType] ? (
                    <Link to={quickLinks[reportType]} className="btn btn-secondary block w-full text-center text-sm">
                      Open Source Workflow
                    </Link>
                  ) : null}
                  <Link to="/reports" className="btn btn-secondary block w-full text-center text-sm">Browse Other Reports</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ReportCategory;
