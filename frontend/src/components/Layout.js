import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { useTheme } from '../contexts/ThemeContext';
import FlyingBirds from './FlyingBirds';
import {
  HomeIcon,
  CubeIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  TruckIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CpuChipIcon,
  BellIcon,
  Cog6ToothIcon,
  UsersIcon,
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ReceiptRefundIcon,
  ScaleIcon,
  ShieldCheckIcon,
  BookmarkIcon,
  WalletIcon,
  DocumentTextIcon,
  ArrowDownOnSquareIcon,
  PuzzlePieceIcon,
  EnvelopeIcon,
  BoltIcon,
  PlusIcon,
  CreditCardIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  ClockIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import {
  assetsAPI,
  customersAPI,
  inventoryAPI,
  purchasesAPI,
  salesAPI,
  suppliersAPI,
  alertsAPI,
} from '../services/api';
import RealTimeAlerts from './RealTimeAlerts';

const baseNavigation = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Quick Actions',
    icon: BoltIcon,
    children: [
      { name: 'Add Product', href: '/quick-actions/add-product' },
      { name: 'New Sale', href: '/quick-actions/new-sale' },
      { name: 'Create Purchase', href: '/quick-actions/create-purchase' },
      { name: 'Add User', href: '/quick-actions/add-user' },
      { name: 'Add Asset', href: '/quick-actions/add-asset' },
      { name: 'Transfer Stock', href: '/quick-actions/transfer-stock' },
      { name: 'Record Payment', href: '/quick-actions/record-payment' },
      { name: 'Generate Invoice', href: '/quick-actions/generate-invoice' },
      { name: 'Report Issue', href: '/quick-actions/report-issue' },
      { name: 'Quick Search', href: '/quick-actions/search' }
    ]
  },
  {
    name: 'User Management',
    icon: UserGroupIcon,
    children: [
      { name: 'Users', href: '/user-management/users' },
      { name: 'Roles', href: '/user-management/roles' },
      { name: 'Permissions', href: '/user-management/permissions' },
      { name: 'Role Permissions', href: '/user-management/role-permissions' },
      { name: 'User Logs', href: '/user-management/user-logs' }
    ]
  },
  {
    name: 'Alerts',
    icon: BellIcon,
    children: [
      { name: 'All Alerts', href: '/alerts/all' },
      { name: 'Inventory Alerts', href: '/alerts/inventory' },
      { name: 'Payment Alerts', href: '/alerts/payment' },
      { name: 'Asset Alerts', href: '/alerts/asset' },
      { name: 'Expiry Alerts', href: '/alerts/expiry' },
      { name: 'User Activity', href: '/alerts/user-activity' },
      { name: 'System Alerts', href: '/alerts/system' },
      { name: 'Alert Settings', href: '/alerts/settings' },
      { name: 'Notification Channels', href: '/alerts/channels' },
      { name: 'Logs', href: '/alerts/logs' }
    ]
  },
  {
    name: 'Contacts',
    icon: UsersIcon,
    children: [
      { name: 'Customer List', href: '/contacts', roles: ['admin', 'manager', 'staff', 'viewer'] },
      { name: 'Add Customer', href: '/contacts/create', roles: ['admin', 'manager', 'staff'] },
      { name: 'Customer Ledger', href: '/contacts/ledger', roles: ['admin', 'manager', 'staff', 'viewer'] },
      { name: 'Due Payments', href: '/contacts/due-payments', roles: ['admin', 'manager', 'staff', 'viewer'] },
      { name: 'Analytics', href: '/contacts/analytics', roles: ['admin', 'manager', 'staff', 'viewer'] },
      { name: 'Notes / Communication', href: '/contacts/communication', roles: ['admin', 'manager', 'staff', 'viewer'] },
            { name: 'Import / Export', href: '/contacts/import-export', roles: ['admin', 'manager'] },
          ]
  },
  { 
    name: 'Products', 
    icon: CubeIcon,
    children: [
      { name: 'All Products', href: '/products', roles: ['admin', 'manager', 'staff', 'viewer'] },
      { name: 'Add Product', href: '/products/create', roles: ['admin', 'manager', 'staff'] },
      { name: 'Categories', href: '/products/categories', roles: ['admin', 'manager'] },
      { name: 'Product Variations', href: '/products/variations', roles: ['admin', 'manager', 'staff'] },
      { name: 'Pricing & Discounts', href: '/products/pricing', roles: ['admin', 'manager'] },
      { name: 'Stock per Product', href: '/products/stock', roles: ['admin', 'manager', 'staff'] },
      { name: 'Product Locations', href: '/products/locations', roles: ['admin', 'manager'] },
      { name: 'Media & Attachments', href: '/products/media', roles: ['admin', 'manager', 'staff'] },
      { name: 'Labels & Barcodes', href: '/products/labels', roles: ['admin', 'manager', 'staff'] },
      { name: 'Product Reports', href: '/products/reports', roles: ['admin', 'manager', 'viewer'] },
      { name: 'Low Stock Products', href: '/products/low-stock', roles: ['admin', 'manager', 'staff'] },
    ]
  },
  { 
    name: 'Stocks', 
    icon: TruckIcon,
    children: [
      { name: 'Stock Overview', href: '/stocks' },
      { name: 'Stock Transfers', href: '/stock-transfers' },
      { name: 'Stock Adjustments', href: '/stock-adjustments' },
    ]
  },
  {
    name: 'Sales',
    icon: ShoppingCartIcon,
    children: [
      { name: 'All Sales', href: '/sales', icon: ShoppingCartIcon },
      { name: 'Add Sale (POS)', href: '/sales/pos', icon: PlusIcon },
      { name: 'Customers', href: '/sales/customers', icon: UserGroupIcon },
      { name: 'Invoices', href: '/sales/invoices', icon: DocumentTextIcon },
      { name: 'Payments', href: '/sales/payments', icon: CurrencyDollarIcon },
      { name: 'Sales Return', href: '/sales/returns', icon: ArrowPathIcon },
      { name: 'Drafts / Quotations', href: '/sales/quotations', icon: DocumentTextIcon },
      { name: 'Sales Reports', href: '/sales/reports', icon: ChartBarIcon },
      { name: 'Sales Agents', href: '/sales/agents', icon: UserGroupIcon }
    ]
  },
  {
    name: 'Purchases',
    icon: TruckIcon,
    children: [
      { name: 'List Purchases', href: '/purchases', icon: DocumentTextIcon },
      { name: 'Purchase Order', href: '/purchases/orders', icon: ShoppingCartIcon },
      { name: 'Add Purchase', href: '/purchases/create', icon: PlusIcon },
      { name: 'List Purchase Return', href: '/purchases/returns', icon: ArrowPathIcon }
    ]
  },
  {
    name: 'Suppliers',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'All Suppliers', href: '/suppliers/all' },
      { name: 'Add Supplier', href: '/suppliers/add' },
      { name: 'Supplier Products', href: '/suppliers/products' },
      { name: 'Purchase Orders', href: '/suppliers/purchase-orders' },
      { name: 'Payments', href: '/suppliers/payments' },
      { name: 'Outstanding Dues', href: '/suppliers/outstanding-dues' },
      { name: 'Performance', href: '/suppliers/performance' },
      { name: 'Contracts', href: '/suppliers/contracts' },
      { name: 'Documents', href: '/suppliers/documents' },
      { name: 'Returns', href: '/suppliers/returns' }
    ]
  },
  {
    name: 'Transactions',
    icon: ArrowPathIcon,
    children: [
      { name: 'Add Transaction', href: '/transactions/add', icon: PlusIcon, roles: ['admin', 'manager', 'staff'] },
      { name: 'View All Transactions', href: '/transactions/view', icon: EyeIcon },
      { name: 'Sales Transactions', href: '/transactions/sales', icon: ShoppingCartIcon },
      { name: 'Purchase Transactions', href: '/transactions/purchases', icon: TruckIcon },
      { name: 'Returns & Refunds', href: '/transactions/returns', icon: ArrowPathIcon },
      { name: 'Payments', href: '/transactions/payments', icon: CurrencyDollarIcon },
      { name: 'Invoices & Billing', href: '/transactions/invoices', icon: DocumentTextIcon },
      { name: 'Stock Movement', href: '/transactions/stock-movement', icon: ArrowPathIcon },
      { name: 'Expense Tracking', href: '/transactions/expenses', icon: ReceiptRefundIcon },
      { name: 'Transaction History', href: '/transactions/history', icon: ClockIcon },
      { name: 'Print Transactions', href: '/transactions/print', icon: PrinterIcon, roles: ['admin', 'manager', 'staff'] },
      { name: 'Download Reports', href: '/transactions/download', icon: ArrowDownOnSquareIcon },
      { name: 'Pending & Due Payments', href: '/transactions/pending-payments', icon: ExclamationTriangleIcon },
      { name: 'Discounts & Taxes', href: '/transactions/discounts-taxes', icon: ScaleIcon },
      { name: 'Transaction Reports', href: '/transactions/reports', icon: ChartBarIcon }
    ]
  },
  { name: 'Reports', icon: ChartBarIcon,
    children: [
      { name: 'Sales Reports', href: '/reports/sales', icon: ChartBarIcon },
      { name: 'Inventory Reports', href: '/reports/inventory', icon: CubeIcon },
      { name: 'Customer Reports', href: '/reports/customers', icon: UserGroupIcon },
      { name: 'Supplier Reports', href: '/reports/suppliers', icon: BuildingOfficeIcon },
      { name: 'Asset Reports', href: '/reports/assets', icon: BuildingOfficeIcon },
      { name: 'Stock Transfer Reports', href: '/reports/stock-transfers', icon: ArrowPathIcon },
      { name: 'User Activity Logs', href: '/reports/user-activity', icon: UserGroupIcon, roles: ['admin'] },
      { name: 'Alerts & Exceptions', href: '/reports/alerts', icon: BellIcon },
      { name: 'Custom Reports / Export', href: '/reports/custom', icon: DocumentTextIcon },
    ]
  },
  {
    name: 'AI Insights',
    icon: CpuChipIcon,
    children: [
      { name: 'Dashboard', href: '/ai-insights', icon: CpuChipIcon },
      { name: 'Live Views', href: '/ai-insights/live-views', icon: BoltIcon },
      { name: 'Profit & Pricing', href: '/ai-insights/profit-pricing', icon: CurrencyDollarIcon },
      { name: 'Expense Intelligence', href: '/ai-insights/expense-intelligence', icon: ReceiptRefundIcon },
      { name: 'Fraud Detection', href: '/ai-insights/fraud-detection', icon: ShieldCheckIcon },
      { name: 'Sales Intelligence', href: '/ai-insights/sales-intelligence', icon: BanknotesIcon },
      { name: 'Customer Insights', href: '/ai-insights/customer-insights', icon: UserGroupIcon },
      { name: 'Smart Alerts', href: '/ai-insights/smart-alerts', icon: BellIcon },
      { name: 'Smart Reports', href: '/ai-insights/smart-reports', icon: DocumentTextIcon },
      { name: 'AI Assistant', href: '/ai-insights/ai-assistant', icon: ChatBubbleLeftRightIcon }
    ]
  },
  {
    name: 'Administrator Backup',
    icon: ArrowDownOnSquareIcon,
    children: [
      { name: 'Dashboard', href: '/backup/dashboard' },
      { name: 'Create Backup', href: '/backup/create' },
      { name: 'Scheduled Backups', href: '/backup/scheduled' },
      { name: 'Backup History', href: '/backup/history' },
      { name: 'Storage Settings', href: '/backup/storage' },
      { name: 'Security Settings', href: '/backup/security' },
      { name: 'Backup Logs', href: '/backup/logs' },
      { name: 'Alerts', href: '/backup/alerts' },
      { name: 'Advanced Settings', href: '/backup/advanced' }
    ]
  },
  {
    name: 'Settings',
    icon: Cog6ToothIcon,
    children: [
      { name: 'Security', href: '/settings/security' },
      { name: 'Notifications', href: '/settings/notifications' },
      { name: 'System', href: '/settings/system' },
      { name: 'Appearance', href: '/settings/appearance' },
      { name: 'Workspace', href: '/settings/workspace' },
      { name: 'Integrations', href: '/settings/integrations' },
      { name: 'Preferences', href: '/settings/preferences' },
      { name: 'Audit Logs', href: '/settings/audit-logs' }
    ]
  },
  {
    name: 'Assets',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'Manage Assets', href: '/assets/manage' },
      { name: 'Asset Categories', href: '/assets/categories' },
      { name: 'Asset Locations', href: '/assets/locations' },
      { name: 'Asset Assignment', href: '/assets/assignment' },
      { name: 'Asset Maintenance', href: '/assets/maintenance' },
      { name: 'Asset Depreciation', href: '/assets/depreciation' },
      { name: 'Asset Reports', href: '/assets/reports' },
      { name: 'Asset Documents', href: '/assets/documents' }
    ]
  },
  {
    name: 'Expenses',
    icon: ReceiptRefundIcon,
    children: [
      { name: 'Expense Tracking', href: '/expenses' },
      { name: 'Add Expense', href: '/expenses/create' },
      { name: 'Expense Categories', href: '/expenses/categories' }
    ]
  },
  {
    name: 'Payment Accounts',
    icon: WalletIcon,
    children: [
      { name: 'Account Overview', href: '/payment-accounts/accounts' },
      { name: 'Transactions', href: '/payment-accounts/transactions' },
      { name: 'Deposit', href: '/payment-accounts/transactions', state: { openTransactionForm: true, transactionType: 'deposit' } },
      { name: 'Withdrawal', href: '/payment-accounts/transactions', state: { openTransactionForm: true, transactionType: 'withdraw' } }
    ]
  },
];

const NavItem = ({ item, isMobile = false, closeSidebar }) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  
  const isChildActive = hasChildren && item.children.some(child => location.pathname === child.href);
  const isActive = location.pathname === item.href || isChildActive;
  const [isOpen, setIsOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-blue-400 group-hover:text-blue-200'}`} />
            {item.name}
          </div>
          {isOpen ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pl-11 space-y-1 overflow-hidden"
            >
              {item.children.map((child) => (
                <NavLink
                  key={child.name}
                  to={child.href}
                  state={child.state}
                  className={({ isActive }) =>
                    `block py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive ? 'text-white' : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: '#FFFFFF'
                  })}
                  onClick={isMobile ? closeSidebar : undefined}
                >
                  {child.name}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive ? 'text-white' : 'text-white hover:bg-white hover:bg-opacity-20'
        }`
      }
      style={({ isActive }) => ({
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        color: '#FFFFFF'
      })}
      onClick={isMobile ? closeSidebar : undefined}
    >
      <div className="relative">
        <item.icon 
          className="h-5 w-5 mr-3" 
          style={{ 
            color: '#FFFFFF'
          }} 
        />
        {item.badge && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
        {item.name === 'Alerts' && console.log('Alerts NavItem rendering:', { badge: item.badge, hasBadge: !!item.badge })}
      </div>
      {item.name}
    </NavLink>
  );
};

const alertSeverityOrder = { critical: 0, high: 1, warning: 2, info: 3 };

const Layout = ({ children }) => {
  const { currentTheme, isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const previousAlertCountRef = useRef(0);

  const { data: alertsFeedResponse, dataUpdatedAt: alertsFeedUpdatedAt } = useQuery(
    'alerts-navbar-feed',
    () => alertsAPI.getAll({ status: 'active', limit: 50 }),
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      keepPreviousData: true,
    }
  );

  const { data: alertStatsResponse, dataUpdatedAt: alertStatsUpdatedAt } = useQuery(
    'alerts-navbar-stats',
    alertsAPI.getAlertStats,
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      keepPreviousData: true,
    }
  );

  const liveAlerts = useMemo(
    () => alertsFeedResponse?.data?.data?.alerts || [],
    [alertsFeedResponse]
  );

  const realTimeAlerts = useMemo(
    () =>
      [...liveAlerts]
        .filter((alert) => alert.status === 'active')
        .sort((a, b) => {
          const severityDiff =
            (alertSeverityOrder[a.severity] ?? Number.MAX_SAFE_INTEGER) -
            (alertSeverityOrder[b.severity] ?? Number.MAX_SAFE_INTEGER);

          if (severityDiff !== 0) {
            return severityDiff;
          }

          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        })
        .slice(0, 5),
    [liveAlerts]
  );

  const alertStats = useMemo(() => {
    const apiStats = alertStatsResponse?.data?.data;
    if (apiStats) {
      return apiStats;
    }

    return {
      total: liveAlerts.length,
      active: liveAlerts.filter((alert) => alert.status === 'active').length,
      critical: liveAlerts.filter((alert) => alert.severity === 'critical').length,
      high: liveAlerts.filter((alert) => alert.severity === 'high').length,
      warning: liveAlerts.filter((alert) => alert.severity === 'warning').length,
      info: liveAlerts.filter((alert) => alert.severity === 'info').length,
    };
  }, [alertStatsResponse, liveAlerts]);

  const alertCount = alertStats?.active || 0;
  const alertsUpdatedAt = Math.max(alertsFeedUpdatedAt || 0, alertStatsUpdatedAt || 0);

  const navigation = useMemo(() => {
    return baseNavigation;
  }, []);

  const filteredNavigation = useMemo(
    () => {
      return navigation
        .map((item) => {
          if (item.roles && !item.roles.includes(user?.role)) {
            return null;
          }

          if (!item.children) {
            return item;
          }

          const visibleChildren = item.children.filter((child) => !child.roles || child.roles.includes(user?.role));
          if (visibleChildren.length === 0) {
            return null;
          }

          return {
            ...item,
            children: visibleChildren,
          };
        })
        .filter(Boolean);
    },
    [navigation, user?.role]
  );

  const searchablePages = useMemo(() => {
    const pages = [];

    filteredNavigation.forEach((item) => {
      if (item.href) {
        pages.push({ type: 'page', name: item.name, href: item.href });
      }

      if (item.children) {
        item.children.forEach((child) => {
          pages.push({
            type: 'page',
            name: `${item.name} / ${child.name}`,
            href: child.href,
          });
        });
      }
    });

    return pages;
  }, [filteredNavigation]);

  const handleLogout = () => {
    setShowProfile(false);
    logout();

    // Fallback navigation in case the auth hook doesn't trigger a route update fast enough.
    navigate('/login', { replace: true });
  };

  // Update real-time clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const previousCount = previousAlertCountRef.current;

    if (alertCount > previousCount && previousCount > 0 && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('New Alert', {
        body: `${alertCount - previousCount} new alert(s) received`,
        icon: '/favicon.ico'
      });
    }

    previousAlertCountRef.current = alertCount;
  }, [alertCount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications || showProfile) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfile, setShowNotifications, setShowProfile]);

  const handleSearch = async (query) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const pageMatches = (searchablePages || [])
      .filter((item) => item && item.name && item.name.toLowerCase().includes(trimmedQuery.toLowerCase()))
      .slice(0, 6);

    if (trimmedQuery.length < 2) {
      setSearchResults(pageMatches);
      setShowSearchResults(true);
      return;
    }

    try {
      // Try to get data from APIs, but handle errors gracefully
      let apiResults = [];
      
      try {
        const [inventoryRes, customersRes, suppliersRes, assetsRes, purchasesRes, salesRes] = await Promise.allSettled([
          inventoryAPI.getAll({ search: trimmedQuery, limit: 5 }),
          customersAPI.getAll({ search: trimmedQuery, limit: 5 }),
          suppliersAPI.getAll({ search: trimmedQuery, limit: 5 }),
          assetsAPI.getAll({ search: trimmedQuery, limit: 5 }),
          purchasesAPI.getAll({ search: trimmedQuery, limit: 5 }),
          salesAPI.getAll({ search: trimmedQuery, limit: 5 }),
        ]);

        // Process successful API responses with better error handling
        try {
          if (inventoryRes?.status === 'fulfilled' && inventoryRes?.value?.data?.data) {
            const items = Array.isArray(inventoryRes.value.data.data) ? inventoryRes.value.data.data : [];
            apiResults = apiResults.concat(
              items.map(item => ({
                name: item?.name || item?.product_name || 'Unknown Product',
                type: 'product',
                href: `/products/${item?._id || item?.id || 'unknown'}`
              }))
            );
          }
        } catch (error) {
          console.warn('Error processing inventory results:', error);
        }

        try {
          if (customersRes?.status === 'fulfilled' && customersRes?.value?.data?.data) {
            const items = Array.isArray(customersRes.value.data.data) ? customersRes.value.data.data : [];
            apiResults = apiResults.concat(
              items.map(item => ({
                name: item?.name || item?.customer_name || 'Unknown Customer',
                type: 'customer',
                href: `/customers/${item?._id || item?.id || 'unknown'}`
              }))
            );
          }
        } catch (error) {
          console.warn('Error processing customer results:', error);
        }

        try {
          if (suppliersRes?.status === 'fulfilled' && suppliersRes?.value?.data?.data) {
            const items = Array.isArray(suppliersRes.value.data.data) ? suppliersRes.value.data.data : [];
            apiResults = apiResults.concat(
              items.map(item => ({
                name: item?.name || item?.supplier_name || 'Unknown Supplier',
                type: 'supplier',
                href: `/suppliers/${item?._id || item?.id || 'unknown'}`
              }))
            );
          }
        } catch (error) {
          console.warn('Error processing supplier results:', error);
        }

        try {
          if (assetsRes?.status === 'fulfilled' && assetsRes?.value?.data?.data) {
            const items = Array.isArray(assetsRes.value.data.data) ? assetsRes.value.data.data : [];
            apiResults = apiResults.concat(
              items.map(item => ({
                name: item?.name || item?.asset_name || 'Unknown Asset',
                type: 'asset',
                href: `/assets/${item?._id || item?.id || 'unknown'}`
              }))
            );
          }
        } catch (error) {
          console.warn('Error processing asset results:', error);
        }

        try {
          if (purchasesRes?.status === 'fulfilled' && purchasesRes?.value?.data?.data) {
            const items = Array.isArray(purchasesRes.value.data.data) ? purchasesRes.value.data.data : [];
            apiResults = apiResults.concat(
              items.map(item => ({
                name: item?.invoice_number || `Purchase #${item?._id || item?.id || 'unknown'}`,
                type: 'purchase',
                href: `/purchases/${item?._id || item?.id || 'unknown'}`
              }))
            );
          }
        } catch (error) {
          console.warn('Error processing purchase results:', error);
        }

        try {
          if (salesRes?.status === 'fulfilled' && salesRes?.value?.data?.data) {
            const items = Array.isArray(salesRes.value.data.data) ? salesRes.value.data.data : [];
            apiResults = apiResults.concat(
              items.map(item => ({
                name: item?.invoice_number || `Sale #${item?._id || item?.id || 'unknown'}`,
                type: 'sale',
                href: `/sell/${item?._id || item?.id || 'unknown'}`
              }))
            );
          }
        } catch (error) {
          console.warn('Error processing sales results:', error);
        }
      } catch (apiError) {
        console.warn('API search failed, using page results only:', apiError);
      }

      const nextResults = [...pageMatches, ...apiResults];
      setSearchResults(nextResults.slice(0, 12));
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(pageMatches);
      setShowSearchResults(true);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  useEffect(() => {
    setShowSearchResults(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSearchResults]);

  const handleSearchResultSelect = (result) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(result.href, result.state ? { state: result.state } : undefined);
  };

  return (
    <div className="h-screen bg-blue-50 lg:flex">
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 shadow-lg lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-blue-800 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-8 rounded-full overflow-hidden shadow-lg border-2 border-blue-300 border-opacity-50 bg-gradient-to-br from-blue-400 to-indigo-500">
                    <img 
                      src="/assets/logo.svg" 
                      alt="Smart Inventory Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Smart HUB</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-800"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto pb-4">
                {filteredNavigation.map((item) => (
                  <NavItem key={item.name} item={item} isMobile={true} closeSidebar={() => setSidebarOpen(false)} />
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r`} style={{ background: 'linear-gradient(135deg, var(--color-primary, #3B82F6) 0%, var(--color-secondary, #10B981) 50%, var(--color-accent, #F59E0B) 100%)', borderColor: 'var(--color-border, #E5E7EB)' }}>
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg border-2 border-blue-300 border-opacity-50" style={{ background: 'linear-gradient(135deg, var(--color-primary, #3B82F6), var(--color-secondary, #10B981))', borderColor: 'var(--color-border, #E5E7EB)' }}>
                  <img 
                    src="/assets/logo.svg" 
                    alt="Smart Inventory Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-xl font-black tracking-wider text-white" style={{ color: '#FFFFFF', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Smart HUB</h1>
              </div>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1 overflow-y-auto scrollbar-thin">
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Enhanced Standard Navbar */}
        <header className="relative z-10 flex-shrink-0">
          {/* Main Navigation Bar */}
          <div className={`flex h-16 shadow-lg border-b ${isDarkMode ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 border-blue-500'}`} style={{ background: 'linear-gradient(135deg, var(--color-primary, #3B82F6) 0%, var(--color-secondary, #10B981) 50%, var(--color-accent, #F59E0B) 100%)', borderColor: 'var(--color-border, #E5E7EB)' }}>
            {/* Flying Birds Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 999999 }}>
              <FlyingBirds />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`px-4 border-r text-white hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-inset lg:hidden transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 focus:ring-gray-600' : 'border-blue-500 hover:bg-blue-800 focus:ring-blue-300'}`}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
                        
            {/* Main Navigation Content */}
            <div className="flex-1 px-4 flex items-center justify-between">
              {/* Left Section - Search */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <div ref={searchContainerRef} className={`relative ${isDarkMode ? 'text-gray-300 focus-within:text-white' : 'text-blue-200 focus-within:text-white'}`}>
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                      <div className={`p-1.5 rounded-lg backdrop-blur-sm border ${isDarkMode ? 'bg-gray-700 bg-opacity-30 border-gray-600' : 'bg-blue-500 bg-opacity-30 border-blue-400'}`}>
                        <HomeIcon className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-blue-200'}`} />
                      </div>
                    </div>
                    <input
                      className={`block w-full pl-14 pr-4 py-2.5 border rounded-lg text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-600 text-white placeholder-gray-400 focus:ring-gray-600 focus:border-gray-600' : 'bg-blue-800 bg-opacity-50 border-blue-400 text-white placeholder-blue-300 focus:ring-blue-300 focus:border-blue-300'}`}
                      style={{ 
                        backgroundColor: 'var(--color-surface, #1F2937)', 
                        borderColor: 'var(--color-border, #374151)',
                        color: 'var(--color-text, #F9FAFB)',
                        placeholderColor: 'var(--color-textSecondary, #9CA3AF)'
                      }}
                      placeholder="Search products, customers, transactions..."
                      type="search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setShowSearchResults(true)}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className={`absolute top-full left-0 right-0 w-full mt-2 border rounded-lg shadow-2xl z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'}`} style={{ backgroundColor: 'var(--color-surface, #FFFFFF)', borderColor: 'var(--color-border, #E5E7EB)' }}>
                        <div className={`p-4 border-b rounded-t-lg ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`} style={{ background: 'linear-gradient(to right, var(--color-background, #F3F4F6), var(--color-surface, #FFFFFF))', borderColor: 'var(--color-border, #E5E7EB)' }}>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-blue-700'}`} style={{ color: 'var(--color-text, #111827)' }}>Search Results</p>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} style={{ color: 'var(--color-textSecondary, #6B7280)' }}>{searchResults.length} results</span>
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {searchResults.map((result, index) => (
                            <button
                              key={index}
                              type="button"
                              className={`block w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 ${isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'}`}
                              onClick={() => handleSearchResultSelect(result)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className={`
                                    text-xs px-2 py-1 rounded-full font-medium
                                    ${result.type === 'page' ? (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700') : ''}
                                    ${result.type === 'product' ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700') : ''}
                                    ${result.type === 'customer' ? (isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700') : ''}
                                    ${result.type === 'transaction' ? (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700') : ''}
                                  `}>
                                    {result.type}
                                  </span>
                                  <span className="font-medium text-gray-900" style={{ color: 'var(--color-text, #111827)' }}>{result.name}</span>
                                </div>
                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Main Navigation */}
              <nav className="hidden lg:flex items-center space-x-1 px-6">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Products
                </Link>
                <Link
                  to="/sell"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Sell
                </Link>
                <Link
                  to="/purchases"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Purchases
                </Link>
              </nav>
              
              {/* Right Section - Actions & Profile */}
              <div className="flex items-center space-x-3">
                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <button 
                    className="p-2 text-white hover:bg-blue-800 rounded-lg transition-colors" 
                    title="New Sale"
                    onClick={() => navigate('/sell')}
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                  </button>
                  <button 
                    className="p-2 text-white hover:bg-blue-800 rounded-lg transition-colors" 
                    title="Reports"
                    onClick={() => navigate('/reports')}
                  >
                    <ChartBarIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Real-time Clock */}
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-lg border border-blue-400 border-opacity-50">
                  <div className="flex items-center space-x-2">
                    <div className="text-xs font-medium text-blue-100">
                      {currentTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false 
                      })}
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-lg border border-green-400 border-opacity-50">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-100">Online</span>
                  </div>
                </div>

                {/* Real-time Alerts */}
                <RealTimeAlerts currentPage={location.pathname} />

                {/* Logout Button */}
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
                
                {/* User Profile */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 p-2 text-white hover:bg-blue-800 rounded-lg transition-colors"
                    onClick={() => setShowProfile(!showProfile)}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  
                  {/* Profile Dropdown */}
                  {showProfile && (
                    <div className="absolute right-0 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-600">{user?.email}</p>
                            <p className="text-xs text-blue-600 font-medium capitalize">{user?.role}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button 
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            navigate('/profile');
                            setShowProfile(false);
                          }}
                        >
                          <div className="flex items-center">
                            <UserCircleIcon className="h-4 w-4 mr-2 text-gray-500" />
                            My Profile
                          </div>
                        </button>
                        <button 
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            navigate('/settings');
                            setShowProfile(false);
                          }}
                        >
                          <div className="flex items-center">
                            <CogIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Settings
                          </div>
                        </button>
                      </div>
                      <div className="py-2 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 text-red-500" />
                            Sign out
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Secondary Navigation Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700/50 shadow-sm">
            <div className="px-6 py-1.5">
              <nav className="flex items-center justify-center space-x-1 text-xs">
                <Link to="/dashboard" className="text-blue-200/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all duration-300 font-medium hover:shadow-md">Overview</Link>
                <span className="text-blue-400/50 mx-1">•</span>
                <Link to="/analytics" className="text-blue-200/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all duration-300 font-medium hover:shadow-md">Analytics</Link>
                <span className="text-blue-400/50 mx-1">•</span>
                <Link to="/reports" className="text-blue-200/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all duration-300 font-medium hover:shadow-md">Reports</Link>
                <span className="text-blue-400/50 mx-1">•</span>
                <Link to="/settings" className="text-blue-200/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all duration-300 font-medium hover:shadow-md">Settings</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="w-full px-4 py-4 sm:px-5 lg:px-6 xl:px-7 lg:py-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
