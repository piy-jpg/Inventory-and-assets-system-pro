import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  PlusIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  ArrowPathIcon,
  BookmarkIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { inventoryAPI, salesAPI, customersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Sell = () => {
  const location = useLocation();
  const routeTabMap = React.useMemo(
    () => ({
      '/sell': 'sales',
      '/sell/pos': 'pos',
      '/sell/customers': 'customers',
      '/sell/invoices': 'invoices',
      '/sell/payments': 'payments',
      '/sell/returns': 'returns',
      '/sell/quotes': 'quotes',
      '/sell/reports': 'reports',
      '/sell/agents': 'agents',
    }),
    []
  );
  const [activeTab, setActiveTab] = useState(routeTabMap[location.pathname] || 'sales');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '2026-03-23', // Start date to include all sales data
    endDate: '2026-04-30'   // End date to include all sales data
  });
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  React.useEffect(() => {
    const smartCommand = location.state?.smartCommand;
    const routeTab = routeTabMap[location.pathname];

    if (routeTab) {
      setActiveTab(routeTab);
    }

    if (!smartCommand) return;

    if (smartCommand.openTab) {
      setActiveTab(smartCommand.openTab);
    }
    if (smartCommand.customerName) {
      setCustomerName(smartCommand.customerName);
    }
    if (smartCommand.search) {
      setSearch(smartCommand.search);
    }
  }, [location.pathname, location.state, routeTabMap]);

  const tabRouteMap = React.useMemo(
    () => ({
      sales: '/sell',
      pos: '/sell/pos',
      customers: '/sell/customers',
      invoices: '/sell/invoices',
      payments: '/sell/payments',
      returns: '/sell/returns',
      quotes: '/sell/quotes',
      reports: '/sell/reports',
      agents: '/sell/agents',
    }),
    []
  );

  const openTab = (tabId) => {
    navigate(tabRouteMap[tabId] || '/sell');
  };

  // Sales data
  const { data: salesData, isLoading: loadingSales } = useQuery(
    ['sales', { search, filterStatus, dateRange }],
    () => salesAPI.getAll({ search, status: filterStatus, startDate: dateRange.startDate, endDate: dateRange.endDate }),
    { keepPreviousData: true, refetchInterval: 10000, refetchOnWindowFocus: true }
  );

  // Inventory data for POS
  const { data: inventoryData, isLoading: loadingInventory } = useQuery(
    ['inventory', { search, limit: 12 }],
    () => inventoryAPI.getAll({ search, limit: 12 }),
    { keepPreviousData: true, refetchInterval: 10000, refetchOnWindowFocus: true }
  );

  // Customers data
  const { data: customersData, isLoading: loadingCustomers } = useQuery(
    'customers',
    customersAPI.getAll,
    { refetchInterval: 10000, refetchOnWindowFocus: true }
  );

  const saleMutation = useMutation(salesAPI.create, {
    onSuccess: (data) => {
      toast.success('Sale completed successfully!');
      setCart([]);
      setCustomerName('Walk-in Customer');
      setPaymentMethod('cash');
      queryClient.invalidateQueries('sales');
      queryClient.invalidateQueries('inventory');
      queryClient.invalidateQueries('invoices');
      queryClient.invalidateQueries('payments');
      queryClient.invalidateQueries('salesReports');
      queryClient.invalidateQueries('recent-transactions');
      queryClient.invalidateQueries('dashboardOverview');
      queryClient.invalidateQueries('dashboardSales');
      queryClient.invalidateQueries(['inventory', { search, limit: 12 }]);
      
      // Optional: Print receipt or show success modal
      if (data?.data?.data?.sale_id || data?.data?.sale_id) {
        console.log('Sale completed with ID:', data?.data?.data?.sale_id || data?.data?.sale_id);
      }
    },
    onError: (error) => {
      console.error('Sale failed:', error);
      toast.error(error.response?.data?.message || 'Sale failed. Please try again.');
    },
  });

  const customerMutation = useMutation(customersAPI.create, {
    onSuccess: () => {
      toast.success('Customer added successfully!');
      setShowCustomerForm(false);
      queryClient.invalidateQueries('customers');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add customer'),
  });

  const sales = salesData?.data?.data?.sales || [];
  const inventory = inventoryData?.data?.data?.inventory || [];
  const customers = customersData?.data?.data?.customers || [];

  // Debug logging for sales data
  console.log('POS Component - Sales Data:', salesData);
  console.log('POS Component - Extracted Sales:', sales);
  console.log('POS Component - Sales Count:', sales.length);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product === product._id);
    const availableStock = product.quantity || 0;
    
    if (existing) {
      if (existing.quantity >= availableStock) {
        toast.error(`Only ${availableStock} items available in stock`);
        return;
      }
      setCart(cart.map(item => 
        item.product === product._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
      toast.success(`${product.name} added to cart`);
    } else {
      if (availableStock <= 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }
      setCart([...cart, { 
        product: product._id, 
        name: product.name, 
        price: product.price.selling,
        quantity: 1,
        stock: availableStock,
        unit: product.unit || 'pcs'
      }]);
      toast.success(`${product.name} added to cart`);
    }
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) return removeFromCart(index);
    
    const item = cart[index];
    if (quantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }
    
    setCart(cart.map((item, i) => i === index ? { ...item, quantity } : item));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateTotal() * 0.1; // 10% tax
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  const completeSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    // Validate stock availability before completing sale
    const outOfStockItems = cart.filter(item => item.quantity > item.stock);
    if (outOfStockItems.length > 0) {
      toast.error(`Insufficient stock for: ${outOfStockItems.map(item => item.name).join(', ')}`);
      return;
    }
    
    const saleData = {
      customer: customerName,
      items: cart.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      })),
      subtotal: calculateTotal(),
      tax: calculateTax(),
      total: calculateGrandTotal(),
      paymentMethod,
      status: 'completed',
      date: new Date().toISOString(),
      salesperson: user?.name || 'System'
    };

    saleMutation.mutate(saleData);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  };

  const sellTabs = [
    { id: 'sales', name: 'All Sales', icon: ReceiptRefundIcon },
    { id: 'pos', name: 'Add Sale (POS)', icon: PlusIcon },
    { id: 'customers', name: 'Customers', icon: UserGroupIcon },
    { id: 'invoices', name: 'Invoices', icon: DocumentTextIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'returns', name: 'Sales Return', icon: ArrowPathIcon },
    { id: 'quotes', name: 'Drafts / Quotations', icon: BookmarkIcon },
    { id: 'reports', name: 'Sales Reports', icon: ChartBarIcon },
    { id: 'agents', name: 'Sales Agents', icon: UserGroupIcon, roles: ['admin', 'manager'] }
  ];

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="page-title">Sell</h1>
            <p className="page-subtitle">Manage sales, customers, and billing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/sell/pos')}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Sale
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className=""
      >
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {sellTabs
              .filter(tab => !tab.roles || tab.roles.includes(user?.role))
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => openTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
          </nav>
        </div>
      </motion.div>

      {/* All Sales Tab */}
      {activeTab === 'sales' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sales..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              {loadingSales ? (
                <div className="p-8"><LoadingSpinner /></div>
              ) : sales.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.items?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                            {sale.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowInvoiceModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <PrinterIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <ReceiptRefundIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sales found</p>
                  <button
                    onClick={() => openTab('pos')}
                    className="mt-4 btn btn-primary"
                  >
                    Create Your First Sale
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* POS Tab */}
      {activeTab === 'pos' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select Products</h3>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {loadingInventory ? (
                    <div className="col-span-full"><LoadingSpinner /></div>
                  ) : inventory.length > 0 ? (
                    inventory.map((product) => {
                      const stockStatus = product.quantity <= 0 ? 'out' : product.quantity <= 5 ? 'low' : 'available';
                      const stockColor = stockStatus === 'out' ? 'text-red-600' : stockStatus === 'low' ? 'text-yellow-600' : 'text-green-600';
                      
                      return (
                        <motion.div
                          key={product._id}
                          whileHover={{ scale: 1.02 }}
                          className={`bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                            product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => product.quantity > 0 && addToCart(product)}
                        >
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className={`text-xs ${stockColor}`}>
                            Stock: {product.quantity} {product.unit || 'pcs'}
                          </div>
                          <div className="text-sm font-bold text-green-600">{formatCurrency(product.price.selling)}</div>
                          {product.quantity <= 0 && (
                            <div className="text-xs text-red-600 font-medium">Out of Stock</div>
                          )}
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No products found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart</h3>
                
                {/* Customer Selection */}
                <div className="mb-4">
                  <label className="label">Customer</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input"
                      placeholder="Customer name"
                      list="customer-list"
                    />
                    <datalist id="customer-list">
                      {customers.map(customer => (
                        <option key={customer._id} value={customer.name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {customers.length} customers available
                  </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Cart is empty</p>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(item.price)} × {item.quantity} {item.unit || 'pcs'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Available: {item.stock} {item.unit || 'pcs'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="label">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%):</span>
                    <span>{formatCurrency(calculateTax())}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateGrandTotal())}</span>
                  </div>
                </div>

                {/* Complete Sale Button */}
                <button
                  onClick={completeSale}
                  disabled={cart.length === 0 || saleMutation.isLoading}
                  className="w-full btn btn-primary mt-4"
                >
                  {saleMutation.isLoading ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Customer
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              {loadingCustomers ? (
                <div className="p-8"><LoadingSpinner /></div>
              ) : customers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(customer.credit || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No customers found</p>
                  <button
                    onClick={() => setShowCustomerForm(true)}
                    className="mt-4 btn btn-primary"
                  >
                    Add Your First Customer
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Other Tabs - Placeholder */}
      {['invoices', 'payments', 'returns', 'quotes', 'reports', 'agents'].includes(activeTab) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                {activeTab === 'invoices' && <DocumentTextIcon className="h-full w-full" />}
                {activeTab === 'payments' && <CreditCardIcon className="h-full w-full" />}
                {activeTab === 'returns' && <ArrowPathIcon className="h-full w-full" />}
                {activeTab === 'quotes' && <BookmarkIcon className="h-full w-full" />}
                {activeTab === 'reports' && <ChartBarIcon className="h-full w-full" />}
                {activeTab === 'agents' && <UserGroupIcon className="h-full w-full" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'invoices' && 'Invoices'}
                {activeTab === 'payments' && 'Payments'}
                {activeTab === 'returns' && 'Sales Returns'}
                {activeTab === 'quotes' && 'Drafts & Quotations'}
                {activeTab === 'reports' && 'Sales Reports'}
                {activeTab === 'agents' && 'Sales Agents'}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'invoices' && 'Generate and manage invoices'}
                {activeTab === 'payments' && 'Track payment status and history'}
                {activeTab === 'returns' && 'Handle product returns and refunds'}
                {activeTab === 'quotes' && 'Create and manage quotations'}
                {activeTab === 'reports' && 'View sales analytics and reports'}
                {activeTab === 'agents' && 'Manage sales team performance'}
              </p>
              <p className="text-sm text-gray-400">This feature is coming soon!</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCustomerForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Customer</h3>
            <form className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input type="text" className="input" placeholder="Customer name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="Email address" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input" placeholder="Phone number" />
              </div>
              <div>
                <label className="label">Address</label>
                <textarea className="input" rows="3" placeholder="Address"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedSale && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowInvoiceModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice #{selectedSale._id}</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900">Smart Inventory System</h4>
                  <p className="text-sm text-gray-600">123 Business Street</p>
                  <p className="text-sm text-gray-600">City, State 12345</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Invoice Date:</p>
                  <p className="font-medium">{new Date(selectedSale.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Bill To:</p>
                <p className="font-medium">{selectedSale.customer}</p>
              </div>
              
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">{formatCurrency(item.price)}</td>
                        <td className="text-right py-2">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Payment Method: {selectedSale.paymentMethod}</p>
                  <p className="text-sm text-gray-600">Status: {selectedSale.status}</p>
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedSale.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedSale.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedSale.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="btn btn-secondary flex items-center gap-2">
                <PrinterIcon className="h-4 w-4" />
                Print
              </button>
              <button className="btn btn-secondary flex items-center gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Sell;
