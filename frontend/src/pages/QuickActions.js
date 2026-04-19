import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  PlusIcon,
  ShoppingCartIcon,
  TruckIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TagIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  BuildingOffice2Icon,
  ScaleIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import {
  inventoryAPI,
  transactionsAPI,
  alertsAPI,
  assetsAPI,
  purchasesAPI,
  salesAPI,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RECENT_ACTIONS_KEY = 'smart_inventory_recent_shortcuts';
const ACTION_COUNTS_KEY = 'smart_inventory_action_counts';

const actionTone = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  purple: 'bg-purple-50 border-purple-200 text-purple-900',
  red: 'bg-red-50 border-red-200 text-red-900',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-900',
  gray: 'bg-gray-50 border-gray-200 text-gray-900',
  orange: 'bg-orange-50 border-orange-200 text-orange-900',
};

const iconTone = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  purple: 'bg-purple-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-600',
  cyan: 'bg-cyan-600',
  gray: 'bg-gray-600',
  orange: 'bg-orange-600',
};

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    return [];
  }
};

const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');
  const [recentShortcuts, setRecentShortcuts] = useState([]);
  const [actionCounts, setActionCounts] = useState({});

  const { data: recentTransactions, isLoading: loadingTransactions } = useQuery(
    'recent-transactions',
    () => transactionsAPI.getAll({ limit: 5, sortBy: 'date', sortOrder: 'desc' }),
    { enabled: true }
  );

  const { data: lowStockItems, isLoading: loadingLowStock } = useQuery(
    'low-stock',
    inventoryAPI.getLowStock,
    { enabled: true }
  );

  const { data: recentAlerts } = useQuery(
    'recent-alerts',
    () => alertsAPI.getAll({ limit: 5, status: 'active' }),
    { enabled: true }
  );

  const { data: assetsSnapshot } = useQuery(
    'quick-actions-assets',
    () => assetsAPI.getAll({ limit: 50, sortBy: 'updatedAt', sortOrder: 'desc' }),
    { enabled: true }
  );

  const { data: purchasesSnapshot } = useQuery(
    'quick-actions-purchases',
    () => purchasesAPI.getAll({ limit: 20 }),
    { enabled: true }
  );

  const { data: salesSnapshot } = useQuery(
    'quick-actions-sales',
    () => salesAPI.getAll({ limit: 20 }),
    { enabled: true }
  );

  useEffect(() => {
    setRecentShortcuts(readJson(RECENT_ACTIONS_KEY));
    const counts = readJson(ACTION_COUNTS_KEY);
    setActionCounts(Array.isArray(counts) ? {} : counts);
  }, []);

  const persistAction = (action) => {
    const nextRecent = [
      action,
      ...recentShortcuts.filter((item) => item.id !== action.id),
    ].slice(0, 6);
    const nextCounts = {
      ...actionCounts,
      [action.id]: (actionCounts[action.id] || 0) + 1,
    };

    setRecentShortcuts(nextRecent);
    setActionCounts(nextCounts);
    localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(nextRecent));
    localStorage.setItem(ACTION_COUNTS_KEY, JSON.stringify(nextCounts));
  };

  const launchAction = (action) => {
    persistAction({
      id: action.id,
      title: action.title,
      href: action.href,
      color: action.color || 'gray',
      badge: action.badge || 'Recent',
    });

    if (action.navigate) {
      action.navigate();
      return;
    }

    navigate(action.href, action.state ? { state: action.state } : undefined);
  };

  const lowStockList = lowStockItems?.data?.data?.lowStockItems || [];
  const alertsList = recentAlerts?.data?.data?.alerts || [];
  const transactionsList = recentTransactions?.data?.data?.transactions || [];
  const assetsList = assetsSnapshot?.data?.data?.assets || [];
  const purchasesList = purchasesSnapshot?.data?.data?.purchases || [];
  const salesList = salesSnapshot?.data?.data?.sales || [];

  const groupedActions = useMemo(() => [
    {
      title: 'Inventory Quick Actions',
      items: [
        { id: 'add-product', title: 'Add Product', description: 'Open the product form instantly', icon: PlusIcon, color: 'blue', href: '/products/create' },
        { id: 'add-category', title: 'Add Category', description: 'Create a new inventory category', icon: TagIcon, color: 'purple', href: '/products/categories' },
        { id: 'bulk-import', title: 'Bulk Import (CSV)', description: 'Upload products in one go', icon: ArrowUpTrayIcon, color: 'green', href: '/products/import' },
        { id: 'export-inventory', title: 'Export Inventory', description: 'Open custom export and reports', icon: ArrowDownTrayIcon, color: 'indigo', href: '/reports/custom' },
      ],
    },
    {
      title: 'Sales Quick Actions',
      items: [
        { id: 'quick-pos-sale', title: 'Quick POS Sale', description: 'Jump straight into the POS tab', icon: CreditCardIcon, color: 'green', href: '/sell', state: { smartCommand: { openTab: 'pos' } } },
        { id: 'generate-invoice', title: 'Generate Invoice', description: 'Open invoicing tools in sales', icon: DocumentTextIcon, color: 'blue', href: '/sell', state: { smartCommand: { openTab: 'invoices' } } },
        { id: 'add-customer', title: 'Add Customer', description: 'Create a customer profile', icon: UserGroupIcon, color: 'cyan', href: '/contacts/create' },
        { id: 'record-payment', title: 'Record Payment', description: 'Go to payment accounts and finance', icon: CurrencyDollarIcon, color: 'yellow', href: '/payment-accounts' },
      ],
    },
    {
      title: 'Supplier / Purchase Actions',
      items: [
        { id: 'add-supplier', title: 'Add Supplier', description: 'Create a new supplier record', icon: BuildingOffice2Icon, color: 'purple', href: '/suppliers/create' },
        { id: 'create-po', title: 'Create Purchase Order', description: 'Open a new purchase form', icon: TruckIcon, color: 'blue', href: '/purchases/create' },
        { id: 'purchase-return', title: 'Purchase Return', description: 'Open purchase return workflow', icon: ArrowPathIcon, color: 'orange', href: '/purchases/returns' },
      ],
    },
    {
      title: 'Stock Management Actions',
      items: [
        { id: 'transfer-stock', title: 'Transfer Stock', description: 'Move stock between locations', icon: ArrowPathIcon, color: 'orange', href: '/stock-transfers' },
        { id: 'bulk-stock-adjustment', title: 'Bulk Stock Adjustment', description: 'Open stock adjustment tools', icon: ScaleIcon, color: 'red', href: '/stock-adjustments' },
        { id: 'move-to-warehouse', title: 'Move to Warehouse', description: 'Use transfer flow for warehouse moves', icon: MapPinIcon, color: 'indigo', href: '/stock-transfers' },
      ],
    },
    {
      title: 'Payment & Finance Actions',
      items: [
        { id: 'add-money', title: 'Add Money (Deposit)', description: 'Open payment accounts for deposits', icon: CurrencyDollarIcon, color: 'green', href: '/payment-accounts' },
        { id: 'transfer-accounts', title: 'Transfer Between Accounts', description: 'Manage account transfers', icon: ArrowPathIcon, color: 'blue', href: '/payment-accounts' },
        { id: 'quick-expense', title: 'Quick Expense Entry', description: 'Create an expense in one step', icon: CurrencyDollarIcon, color: 'red', href: '/expenses/create' },
      ],
    },
    {
      title: 'Asset Actions',
      items: [
        { id: 'add-asset', title: 'Add Asset', description: 'Register a new asset', icon: PlusIcon, color: 'cyan', href: '/assets/create' },
        { id: 'assign-asset', title: 'Assign Asset', description: 'Open assets and assign ownership', icon: UserGroupIcon, color: 'blue', href: '/assets' },
        { id: 'mark-maintenance', title: 'Mark Under Maintenance', description: 'Review assets needing service', icon: WrenchScrewdriverIcon, color: 'orange', href: '/assets' },
      ],
    },
    {
      title: 'AI Actions',
      items: [
        { id: 'suggest-reorder', title: 'Suggest Reorder', description: 'Jump to AI restock suggestions', icon: CpuChipIcon, color: 'indigo', href: '/ai-insights' },
        { id: 'sales-insight', title: 'Generate Sales Insight', description: 'Open AI-powered sales insights', icon: ChartBarIcon, color: 'green', href: '/ai-insights' },
        { id: 'analyze-expenses', title: 'Analyze Expenses', description: 'Review spend patterns with AI', icon: SparklesIcon, color: 'purple', href: '/ai-insights' },
      ],
    },
  ], []);

  const flatActions = groupedActions.flatMap((group) => group.items);

  const frequentActions = [...flatActions]
    .sort((a, b) => (actionCounts[b.id] || 0) - (actionCounts[a.id] || 0))
    .filter((action) => (actionCounts[action.id] || 0) > 0)
    .slice(0, 4);

  const dynamicActions = [];
  if (lowStockList[0]) {
    dynamicActions.push({
      id: `restock-${lowStockList[0]._id}`,
      title: `Restock ${lowStockList[0].name}`,
      description: `Only ${lowStockList[0].quantity} left against min ${lowStockList[0].minStockLevel}`,
      icon: ExclamationTriangleIcon,
      color: 'red',
      href: '/inventory',
      state: { inventorySearch: lowStockList[0].name },
    });
  }
  const maintenanceAsset = assetsList.find((asset) => ['maintenance_due', 'in_repair'].includes(asset.status));
  if (maintenanceAsset) {
    dynamicActions.push({
      id: `maintenance-${maintenanceAsset._id}`,
      title: 'Schedule Maintenance',
      description: `${maintenanceAsset.asset_name} needs attention`,
      icon: WrenchScrewdriverIcon,
      color: 'orange',
      href: '/assets',
    });
  }
  const pendingPurchase = purchasesList.find((purchase) => ['pending', 'partial'].includes(purchase.payment_status));
  if (pendingPurchase) {
    dynamicActions.push({
      id: `collect-${pendingPurchase._id}`,
      title: 'Collect Pending Payment',
      description: `Follow up on ${pendingPurchase.purchase_id}`,
      icon: CurrencyDollarIcon,
      color: 'yellow',
      href: '/payment-accounts',
    });
  }

  const executeSmartSearch = () => {
    const query = searchTerm.trim();
    if (!query) return;

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.startsWith('add product')) {
      const name = query.replace(/add product/i, '').trim();
      launchAction({
        id: 'smart-add-product',
        title: `Add Product${name ? ` ${name}` : ''}`,
        color: 'blue',
        navigate: () =>
          navigate('/products/create', {
            state: {
              prefillInventory: name ? { name } : {},
            },
          }),
      });
      setSearchFeedback(name ? `Opening product form with "${name}" pre-filled.` : 'Opening product form.');
      return;
    }

    if (lowerQuery.startsWith('create sale for')) {
      const customerName = query.replace(/create sale for/i, '').trim();
      launchAction({
        id: 'smart-sale',
        title: `Create Sale${customerName ? ` for ${customerName}` : ''}`,
        color: 'green',
        navigate: () =>
          navigate('/sell', {
            state: {
              smartCommand: {
                openTab: 'pos',
                customerName: customerName || 'Walk-in Customer',
              },
            },
          }),
      });
      setSearchFeedback(customerName ? `Opening POS for ${customerName}.` : 'Opening POS.');
      return;
    }

    if (lowerQuery.includes('show low stock')) {
      launchAction({
        id: 'smart-low-stock',
        title: 'Show Low Stock',
        color: 'red',
        navigate: () => navigate('/inventory', { state: { inventorySearch: 'low stock' } }),
      });
      setSearchFeedback('Opening inventory so you can review low-stock items.');
      return;
    }

    const matchedAction = flatActions.find((action) =>
      `${action.title} ${action.description}`.toLowerCase().includes(lowerQuery)
    );

    if (matchedAction) {
      launchAction(matchedAction);
      setSearchFeedback(`Launching "${matchedAction.title}".`);
      return;
    }

    setSearchFeedback('No direct command matched. Try "Add product iPhone", "Create sale for John", or "Show low stock".');
  };

  const commandExamples = [
    'Add product iPhone',
    'Create sale for John',
    'Show low stock',
  ];

  const filteredGroups = groupedActions
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        searchTerm
          ? `${item.title} ${item.description}`.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6 lg:space-y-7">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Quick Actions</h1>
        <p className="page-subtitle">Command center for inventory, sales, purchases, assets, and finance.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder='Type a command like "Add product iPhone"'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executeSmartSearch();
                }}
                className="w-full rounded-xl border border-blue-200 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {commandExamples.map((example) => (
                <button
                  key={example}
                  onClick={() => setSearchTerm(example)}
                  className="rounded-full bg-white px-3 py-1 text-sm text-blue-700 shadow-sm"
                >
                  {example}
                </button>
              ))}
            </div>
            {searchFeedback ? <p className="mt-3 text-sm text-blue-800">{searchFeedback}</p> : null}
          </div>
          <button
            onClick={executeSmartSearch}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Run Command
          </button>
        </div>
      </motion.div>

      {(recentShortcuts.length > 0 || frequentActions.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Shortcuts</h2>
            <div className="space-y-3">
              {recentShortcuts.map((action) => (
                <button
                  key={action.id}
                  onClick={() => navigate(action.href)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.badge || 'Recent action'}</p>
                  </div>
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequent Actions</h2>
            <div className="space-y-3">
              {frequentActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => launchAction(action)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {actionCounts[action.id]}x
                  </span>
                </button>
              ))}
              {frequentActions.length === 0 ? <p className="text-sm text-gray-500">Your most-used actions will appear here.</p> : null}
            </div>
          </motion.div>
        </div>
      )}

      {dynamicActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-orange-200 bg-orange-50 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Smart Suggested Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dynamicActions.map((action) => (
              <button
                key={action.id}
                onClick={() => launchAction(action)}
                className="rounded-xl border border-orange-200 bg-white px-4 py-4 text-left shadow-sm"
              >
                <div className={`mb-3 inline-flex rounded-lg p-2 text-white ${iconTone[action.color]}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-gray-900">{action.title}</p>
                <p className="mt-1 text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {filteredGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + groupIndex * 0.05 }}
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">{group.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {group.items.map((action) => (
                <button
                  key={action.id}
                  onClick={() => launchAction(action)}
                  className={`rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${actionTone[action.color]}`}
                >
                  <div className={`mb-4 inline-flex rounded-xl p-3 text-white ${iconTone[action.color]}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="mt-2 text-sm opacity-80">{action.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          {loadingTransactions ? (
            <LoadingSpinner />
          ) : transactionsList.length > 0 ? (
            <div className="space-y-3">
              {transactionsList.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${transaction.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'} mr-3`}>
                      {transaction.type === 'sale' ? (
                        <ShoppingCartIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <TruckIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.reference?.order_id || transaction.transaction_id}</p>
                      <p className="text-sm text-gray-500">{transaction.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${transaction.amount?.total || 0}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent transactions</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert & Sales Context</h3>
          {loadingLowStock ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {lowStockList.slice(0, 3).map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-red-100 mr-3">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{item.quantity}</p>
                    <p className="text-xs text-gray-500">Min: {item.minStockLevel}</p>
                  </div>
                </div>
              ))}
              {alertsList.slice(0, 2).map((alert) => (
                <Link key={alert._id} to="/alerts" className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-orange-100 mr-3">
                      <BellIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500">{alert.entity_name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase text-orange-700">{alert.severity}</span>
                </Link>
              ))}
              {salesList[0] ? (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-semibold text-blue-900">Last opened sales shortcut</p>
                  <p className="mt-1 text-sm text-blue-700">Add Sale (recent) for {salesList[0].customer_name || 'Walk-in Customer'}</p>
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
      </div>

      {(user?.role === 'admin' || user?.role === 'manager') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border border-gray-200 bg-white p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'users', title: 'User Management', description: 'Manage permissions and access', icon: UserGroupIcon, color: 'cyan', href: '/users' },
              { id: 'settings', title: 'System Settings', description: 'Configure system preferences', icon: Cog6ToothIcon, color: 'gray', href: '/settings' },
              { id: 'view-alerts', title: 'View Alerts', description: 'Review active system notifications', icon: BellIcon, color: 'orange', href: '/alerts', badge: alertsList.length },
            ].map((card) => (
              <button
                key={card.id}
                onClick={() => launchAction(card)}
                className={`rounded-2xl border-2 p-5 text-left ${actionTone[card.color]}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`mb-4 inline-flex rounded-xl p-3 text-white ${iconTone[card.color]}`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm opacity-80">{card.description}</p>
                  </div>
                  {card.badge ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      {card.badge}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuickActions;
