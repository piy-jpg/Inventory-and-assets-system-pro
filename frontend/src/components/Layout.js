import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  CubeIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  TruckIcon,
  ChartBarIcon,
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
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Quick Actions', href: '/quick-actions', icon: BoltIcon },
  { name: 'User Management', href: '/users', icon: UserGroupIcon, roles: ['admin'] },
  {
    name: 'Contacts',
    icon: UsersIcon,
    children: [
      { name: 'Customer List', href: '/contacts' },
      { name: 'Add Customer', href: '/contacts/create' },
      { name: 'Customer Ledger', href: '/contacts/ledger' },
      { name: 'Sales History', href: '/contacts/sales-history' },
      { name: 'Due Payments', href: '/contacts/due-payments' },
      { name: 'Analytics', href: '/contacts/analytics' },
      { name: 'Notes / Communication', href: '/contacts/communication' },
      { name: 'Alerts / Reminders', href: '/contacts/alerts-reminders' },
      { name: 'Import / Export', href: '/contacts/import-export' },
      { name: 'Tags / Segments', href: '/contacts/segments' },
    ]
  },
  { 
    name: 'Products', 
    icon: CubeIcon,
    children: [
      { name: 'List Products', href: '/products' },
      { name: 'Add Product', href: '/products/create' },
      { name: 'Update Price', href: '/products/update-price' },
      { name: 'Print Labels', href: '/products/labels' },
      { name: 'Variations', href: '/products/variations' },
      { name: 'Import Products', href: '/products/import' },
      { name: 'Import Opening Stock', href: '/products/import-stock' },
      { name: 'Selling Price Group', href: '/products/price-groups' },
      { name: 'Units', href: '/products/units' },
      { name: 'Categories', href: '/products/categories' },
      { name: 'Brands', href: '/products/brands' },
      { name: 'Warranties', href: '/products/warranties' },
    ]
  },
  { 
    name: 'Purchases', 
    icon: TruckIcon,
    children: [
      { name: 'Purchase Order', href: '/purchases/order' },
      { name: 'List Purchases', href: '/purchases' },
      { name: 'Add Purchase', href: '/purchases/create' },
      { name: 'List Purchase Return', href: '/purchases/returns' },
    ]
  },
  { 
    name: 'Sell', 
    icon: BanknotesIcon,
    children: [
      { name: 'All Sales', href: '/sell', icon: ReceiptRefundIcon },
      { name: 'Add Sale (POS)', href: '/sell/pos', icon: PlusIcon },
      { name: 'Customers', href: '/sell/customers', icon: UserGroupIcon },
      { name: 'Invoices', href: '/sell/invoices', icon: DocumentTextIcon },
      { name: 'Payments', href: '/sell/payments', icon: CreditCardIcon },
      { name: 'Sales Return', href: '/sell/returns', icon: ArrowPathIcon },
      { name: 'Drafts / Quotations', href: '/sell/quotes', icon: BookmarkIcon },
      { name: 'Sales Reports', href: '/sell/reports', icon: ChartBarIcon },
      { name: 'Sales Agents', href: '/sell/agents', icon: UserCircleIcon, roles: ['admin', 'manager'] }
    ]
  },
  { name: 'Stock Transfers', href: '/stock-transfers', icon: ArrowPathIcon },
  { name: 'Stock Adjustment', href: '/stock-adjustments', icon: ScaleIcon },
  { 
    name: 'Expenses', 
    icon: ReceiptRefundIcon,
    children: [
      { name: 'List Expenses', href: '/expenses' },
      { name: 'Add Expense', href: '/expenses/create' },
      { name: 'Expense Categories', href: '/expenses/categories' },
    ]
  },
  { name: 'Payment Accounts', href: '/payment-accounts', icon: WalletIcon },
  { 
    name: 'Reports', 
    icon: ChartBarIcon,
    children: [
      { name: 'Inventory Reports', href: '/reports/inventory', icon: CubeIcon },
      { name: 'Sales Reports', href: '/reports/sales', icon: BanknotesIcon },
      { name: 'Purchase Reports', href: '/reports/purchases', icon: TruckIcon },
      { name: 'Expense Reports', href: '/reports/expenses', icon: ReceiptRefundIcon },
      { name: 'Asset Reports', href: '/reports/assets', icon: BuildingOfficeIcon },
      { name: 'Stock Transfer Reports', href: '/reports/stock-transfers', icon: ArrowPathIcon },
      { name: 'User Activity Logs', href: '/reports/user-activity', icon: UserGroupIcon, roles: ['admin'] },
      { name: 'Alerts & Exceptions', href: '/reports/alerts', icon: BellIcon },
      { name: 'Custom Reports / Export', href: '/reports/custom', icon: DocumentTextIcon },
    ]
  },
  { name: 'Modules', href: '/modules', icon: PuzzlePieceIcon, roles: ['admin'] },
  { name: 'Notification Templates', href: '/notifications', icon: EnvelopeIcon, roles: ['admin'] },
  { 
    name: 'AI Insights', 
    icon: CpuChipIcon,
    children: [
      { name: 'Demand Forecasting', href: '/ai-insights/demand-forecasting', icon: ChartBarIcon },
      { name: 'Smart Reorder System', href: '/ai-insights/smart-reorder', icon: ArrowPathIcon },
      { name: 'Inventory Optimization', href: '/ai-insights/inventory-optimization', icon: CubeIcon },
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
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Administrator Backup', href: '/backup', icon: ArrowDownOnSquareIcon, roles: ['admin'] },
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
            isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center">
            <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
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
                  className={({ isActive }) =>
                    `block py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
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
          isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
      onClick={isMobile ? closeSidebar : undefined}
    >
      <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
      {item.name}
    </NavLink>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      // Simulate search results - in a real app, this would call your search API
      const mockResults = [
        { type: 'product', name: 'Laptop Dell XPS 15', href: '/products/123' },
        { type: 'product', name: 'iPhone 14 Pro', href: '/products/456' },
        { type: 'customer', name: 'John Doe', href: '/contacts/789' },
        { type: 'transaction', name: 'Sale #12345', href: '/transactions/12345' },
        { type: 'asset', name: 'Office Chair A101', href: '/assets/101' },
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const filteredNavigation = navigation.filter(item => {
    if (item.roles && !item.roles.includes(user?.role)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
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
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Smart Inventory</h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
        <div className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Smart Inventory</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1 overflow-y-auto scrollbar-thin">
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen w-full flex-col overflow-hidden lg:ml-64">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <HomeIcon className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full pl-8 pr-3 py-2 border border-transparent rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                    placeholder="Search products, customers, transactions..."
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchResults(true)}
                  />
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 w-96 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-500 mb-2">Search Results</p>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {searchResults.map((result, index) => (
                            <Link
                              key={index}
                              to={result.href}
                              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                              onClick={() => setShowSearchResults(false)}
                            >
                              <div className="flex items-center">
                                <span className="capitalize text-gray-500 text-xs mr-2">{result.type}</span>
                                <span>{result.name}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <NotificationBell />
              
              <div className="relative group">
                <button
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.firstName?.[0]} {user?.lastName?.[0]}
                    </span>
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-900 font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-4 lg:py-5">
            <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
