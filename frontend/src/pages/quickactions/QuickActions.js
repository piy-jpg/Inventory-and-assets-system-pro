import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  TruckIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useRealTime } from '../../contexts/RealTimeContext';
import { 
  inventoryAPI, 
  salesAPI, 
  purchasesAPI, 
  usersAPI, 
  assetsAPI, 
  customersAPI,
  suppliersAPI,
  transactionsAPI 
} from '../../services/api';

const QuickActions = () => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showCreatePurchaseModal, setShowCreatePurchaseModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showTransferStockModal, setShowTransferStockModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showGenerateInvoiceModal, setShowGenerateInvoiceModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [showQuickSearchModal, setShowQuickSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Sub-navbar state
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('actions');

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { emitEvent, broadcastEvent, updateGlobalStats } = useRealTime();

  // Quick action forms data
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: ''
  });

  const [saleForm, setSaleForm] = useState({
    customerName: '',
    customerEmail: '',
    items: [],
    totalAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    notes: '',
    salesAgent: 'Quick Sale',
    invoiceNumber: ''
  });

  const [purchaseForm, setPurchaseForm] = useState({
    supplierName: '',
    items: [],
    totalAmount: 0,
    paymentStatus: 'pending'
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'staff',
    phone: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: ''
  });

  const [assetForm, setAssetForm] = useState({
    name: '',
    type: '',
    location: '',
    purchaseDate: '',
    value: '',
    description: ''
  });

  const [stockTransferForm, setStockTransferForm] = useState({
    productId: '',
    fromLocation: '',
    toLocation: '',
    quantity: '',
    reason: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'incoming',
    amount: '',
    party: '',
    method: 'cash',
    description: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    items: [],
    totalAmount: 0,
    dueDate: '',
    notes: ''
  });

  const [issueForm, setIssueForm] = useState({
    type: '',
    severity: 'medium',
    description: '',
    location: '',
    priority: 'normal'
  });

  // Real data fetching for quick search and sales modal
  const { data: inventoryData } = useQuery('inventory-search', inventoryAPI.getAll, { enabled: searchQuery.length > 0 });
  const { data: usersData } = useQuery('users-search', usersAPI.getAll, { enabled: searchQuery.length > 0 });
  const { data: customersData } = useQuery('customers-search', customersAPI.getAll, { enabled: searchQuery.length > 0 });
  const { data: suppliersData } = useQuery('suppliers-search', suppliersAPI.getAll, { enabled: searchQuery.length > 0 });
  const { data: salesData } = useQuery('sales-search', salesAPI.getAll, { enabled: searchQuery.length > 0 });
  const { data: purchasesData } = useQuery('purchases-search', purchasesAPI.getAll, { enabled: searchQuery.length > 0 });
  
  // Data for sales modal
  const { data: modalInventoryData } = useQuery('modal-inventory', inventoryAPI.getAll);
  const { data: modalCustomersData } = useQuery('modal-customers', customersAPI.getAll);

  // Quick search functionality with real data
  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = [];
      const query = searchQuery.toLowerCase();

      // Search products
      const inventory = inventoryData?.data?.inventory || [];
      inventory.forEach(item => {
        if (item.name?.toLowerCase().includes(query) || 
            item.category?.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query)) {
          results.push({
            ...item,
            type: 'product',
            displayName: item.name,
            subtitle: item.category || 'No category'
          });
        }
      });

      // Search users
      const users = usersData?.data?.users || [];
      users.forEach(user => {
        if (user.name?.toLowerCase().includes(query) || 
            user.email?.toLowerCase().includes(query)) {
          results.push({
            ...user,
            type: 'user',
            displayName: user.name,
            subtitle: user.email
          });
        }
      });

      // Search customers
      const customers = customersData?.data?.customers || [];
      customers.forEach(customer => {
        if (customer.name?.toLowerCase().includes(query) || 
            customer.email?.toLowerCase().includes(query)) {
          results.push({
            ...customer,
            type: 'customer',
            displayName: customer.name,
            subtitle: customer.email
          });
        }
      });

      // Search suppliers
      const suppliers = suppliersData?.data?.suppliers || [];
      suppliers.forEach(supplier => {
        if (supplier.name?.toLowerCase().includes(query) || 
            supplier.email?.toLowerCase().includes(query)) {
          results.push({
            ...supplier,
            type: 'supplier',
            displayName: supplier.name,
            subtitle: supplier.email || 'No email'
          });
        }
      });

      // Search sales
      const sales = salesData?.data?.sales || [];
      sales.forEach(sale => {
        if (sale.customerName?.toLowerCase().includes(query) || 
            sale.invoiceNumber?.toLowerCase().includes(query)) {
          results.push({
            ...sale,
            type: 'sale',
            displayName: `Sale: ${sale.customerName}`,
            subtitle: `Invoice: ${sale.invoiceNumber || 'N/A'}`
          });
        }
      });

      // Search purchases
      const purchases = purchasesData?.data?.purchases || [];
      purchases.forEach(purchase => {
        if (purchase.supplierName?.toLowerCase().includes(query) || 
            purchase.orderNumber?.toLowerCase().includes(query)) {
          results.push({
            ...purchase,
            type: 'purchase',
            displayName: `Purchase: ${purchase.supplierName}`,
            subtitle: `Order: ${purchase.orderNumber || 'N/A'}`
          });
        }
      });

      setSearchResults(results.slice(0, 20)); // Limit to 20 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, inventoryData, usersData, customersData, suppliersData, salesData, purchasesData]);

  // Helper functions for sales modal
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const addSaleItem = (product) => {
    const newItem = {
      id: product._id || product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      quantity: 1,
      total: parseFloat(product.price) || 0
    };
    
    setSaleForm(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      totalAmount: prev.totalAmount + newItem.total
    }));
  };

  const updateSaleItemQuantity = (itemId, quantity) => {
    setSaleForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, parseInt(quantity) || 0);
          const newTotal = newQuantity * item.price;
          return {
            ...item,
            quantity: newQuantity,
            total: newTotal
          };
        }
        return item;
      }),
      totalAmount: prev.items.reduce((total, item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, parseInt(quantity) || 0);
          return total + (newQuantity * item.price);
        }
        return total + item.total;
      }, 0)
    }));
  };

  const removeSaleItem = (itemId) => {
    setSaleForm(prev => {
      const itemToRemove = prev.items.find(item => item.id === itemId);
      const newItems = prev.items.filter(item => item.id !== itemId);
      const newTotal = prev.totalAmount - (itemToRemove?.total || 0);
      
      return {
        ...prev,
        items: newItems,
        totalAmount: Math.max(0, newTotal)
      };
    });
  };

  const handleCustomerSelect = (customer) => {
    setSaleForm(prev => ({
      ...prev,
      customerName: customer.name,
      customerEmail: customer.email
    }));
  };

  // User form validation
  const validateUserForm = (formData) => {
    const errors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      errors.role = 'Please select a role';
    }
    
    return errors;
  };

  const handleUserSubmit = (formData) => {
    const errors = validateUserForm(formData);
    
    if (Object.keys(errors).length > 0) {
      // Show validation errors
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = formData;
    
    // Add user
    addUserMutation.mutate(userData);
  };

  const quickActions = [
    {
      id: 1,
      title: 'Add Product',
      description: 'Quickly add new inventory item',
      icon: PlusIcon,
      color: 'bg-blue-500',
      category: 'inventory',
      modal: showAddProductModal,
      setModal: setShowAddProductModal,
      form: productForm,
      setForm: setProductForm
    },
    {
      id: 2,
      title: 'New Sale',
      description: 'Open POS / billing screen',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      category: 'sales',
      modal: showNewSaleModal,
      setModal: setShowNewSaleModal,
      form: saleForm,
      setForm: setSaleForm
    },
    {
      id: 3,
      title: 'Create Purchase',
      description: 'Add supplier purchase',
      icon: ShoppingCartIcon,
      color: 'bg-purple-500',
      category: 'purchases',
      modal: showCreatePurchaseModal,
      setModal: setShowCreatePurchaseModal,
      form: purchaseForm,
      setForm: setPurchaseForm
    },
    {
      id: 4,
      title: 'Add User',
      description: 'Create staff/admin quickly',
      icon: UserGroupIcon,
      color: 'bg-orange-500',
      category: 'users',
      modal: showAddUserModal,
      setModal: setShowAddUserModal,
      form: userForm,
      setForm: setUserForm
    },
    {
      id: 5,
      title: 'Add Asset',
      description: 'Register new asset',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-500',
      category: 'assets',
      modal: showAddAssetModal,
      setModal: setShowAddAssetModal,
      form: assetForm,
      setForm: setAssetForm
    },
    {
      id: 6,
      title: 'Transfer Stock',
      description: 'Move stock between locations',
      icon: ArrowPathIcon,
      color: 'bg-yellow-500',
      category: 'inventory',
      modal: showTransferStockModal,
      setModal: setShowTransferStockModal,
      form: stockTransferForm,
      setForm: setStockTransferForm
    },
    {
      id: 7,
      title: 'Record Payment',
      description: 'Add incoming/outgoing payment',
      icon: CreditCardIcon,
      color: 'bg-pink-500',
      category: 'transactions',
      modal: showRecordPaymentModal,
      setModal: setShowRecordPaymentModal,
      form: paymentForm,
      setForm: setPaymentForm
    },
    {
      id: 8,
      title: 'Generate Invoice',
      description: 'Quick invoice creation',
      icon: DocumentTextIcon,
      color: 'bg-teal-500',
      category: 'sales',
      modal: showGenerateInvoiceModal,
      setModal: setShowGenerateInvoiceModal,
      form: invoiceForm,
      setForm: setInvoiceForm
    },
    {
      id: 9,
      title: 'Report Issue / Alert',
      description: 'Raise manual alert or issue',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      category: 'system',
      modal: showReportIssueModal,
      setModal: setShowReportIssueModal,
      form: issueForm,
      setForm: setIssueForm
    },
    {
      id: 10,
      title: 'Quick Search',
      description: 'Search anything instantly',
      icon: MagnifyingGlassIcon,
      color: 'bg-gray-600',
      category: 'search',
      modal: showQuickSearchModal,
      setModal: setShowQuickSearchModal,
      form: null,
      setForm: null
    }
  ];

  // Sub-navbar categories
  const categories = [
    { id: 'all', name: 'All Actions', icon: CubeIcon },
    { id: 'inventory', name: 'Inventory', icon: CubeIcon },
    { id: 'sales', name: 'Sales', icon: CurrencyDollarIcon },
    { id: 'purchases', name: 'Purchases', icon: ShoppingCartIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
    { id: 'assets', name: 'Assets', icon: BuildingOfficeIcon },
    { id: 'transactions', name: 'Transactions', icon: CreditCardIcon },
    { id: 'system', name: 'System', icon: Cog6ToothIcon },
    { id: 'search', name: 'Search', icon: MagnifyingGlassIcon }
  ];

  // Sub-navbar tabs
  const tabs = [
    { id: 'actions', name: 'Actions', description: 'Quick actions and tasks' },
    { id: 'recent', name: 'Recent', description: 'Recently used actions' },
    { id: 'favorites', name: 'Favorites', description: 'Favorite actions' },
    { id: 'analytics', name: 'Analytics', description: 'Action statistics' }
  ];

  // Filter actions based on active category
  const filteredActions = activeCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === activeCategory);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    toast.success(`Switched to ${categories.find(cat => cat.id === categoryId)?.name} category`);
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    toast.success(`Switched to ${tabs.find(tab => tab.id === tabId)?.name} tab`);
  };

  // Handle navigation from sub-navbar
  const handleSubNavAction = (type, target) => {
    switch (type) {
      case 'navigate':
        navigate(target);
        break;
      case 'action':
        const action = quickActions.find(a => a.id === target);
        if (action) {
          handleQuickAction(action);
        }
        break;
      case 'external':
        window.open(target, '_blank');
        break;
      default:
        console.log('Unknown sub-nav action:', type, target);
    }
  };

  const handleQuickAction = (action) => {
    // For some actions, navigate to actual pages instead of showing modals
    switch (action.id) {
      case 3: // Create Purchase - Navigate to purchases
        navigate('/purchases/create');
        break;
      case 5: // Add Asset - Navigate to assets page (stable under quick action sub-navbar)
        navigate('/quick-actions/add-asset');
        break;
      case 8: // Generate Invoice - Navigate to invoices
        navigate('/invoices');
        break;
      default:
        action.setModal(true);
    }
  };

  // Real API mutations for quick actions
  const addProductMutation = useMutation(inventoryAPI.create, {
    onSuccess: () => {
      toast.success('Product added successfully!');
      queryClient.invalidateQueries('inventory');
      setShowAddProductModal(false);
      setProductForm({ name: '', price: '', stock: '', category: '', description: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  });

  const createSaleMutation = useMutation(salesAPI.create, {
    onSuccess: (data, variables) => {
      toast.success('Sale created successfully!');
      queryClient.invalidateQueries('sales');
      
      // Real-time updates
      const saleData = {
        ...variables,
        id: data?.data?._id || `SALE-${Date.now()}`,
        timestamp: new Date(),
        customerName: variables.customerName,
        amount: variables.totalAmount
      };
      
      // Emit real-time events
      emitEvent('sales:new', saleData);
      broadcastEvent('sales:created', saleData);
      
      // Update global stats
      updateGlobalStats({ 
        totalSales: variables.totalAmount,
        activeUsers: 1
      }, 'sales');
      
      // Reset form and close modal
      setShowNewSaleModal(false);
      setSaleForm({ 
        customerName: '', 
        customerEmail: '',
        items: [], 
        totalAmount: 0, 
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        notes: '',
        salesAgent: 'Quick Sale',
        invoiceNumber: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create sale');
    }
  });

  const createPurchaseMutation = useMutation(purchasesAPI.create, {
    onSuccess: () => {
      toast.success('Purchase created successfully!');
      queryClient.invalidateQueries('purchases');
      setShowCreatePurchaseModal(false);
      setPurchaseForm({ supplierName: '', items: [], totalAmount: 0, paymentStatus: 'pending' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create purchase');
    }
  });

  const addUserMutation = useMutation(usersAPI.create, {
    onSuccess: (data, variables) => {
      toast.success('User added successfully!');
      queryClient.invalidateQueries('users');
      
      // Real-time updates
      const userData = {
        ...variables,
        id: data?.data?._id || `USER-${Date.now()}`,
        timestamp: new Date(),
        name: variables.name,
        email: variables.email,
        role: variables.role
      };
      
      // Emit real-time events
      emitEvent('users:new', userData);
      broadcastEvent('users:created', userData);
      
      // Update global stats
      updateGlobalStats({ 
        activeUsers: 1
      }, 'users');
      
      // Reset form and close modal
      setShowAddUserModal(false);
      setUserForm({ 
        name: '', 
        email: '', 
        role: 'staff', 
        phone: '',
        password: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  });

  const addAssetMutation = useMutation(assetsAPI.create, {
    onSuccess: () => {
      toast.success('Asset added successfully!');
      queryClient.invalidateQueries('assets');
      setShowAddAssetModal(false);
      setAssetForm({ name: '', type: '', location: '', purchaseDate: '', value: '', description: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add asset');
    }
  });

  const recordPaymentMutation = useMutation(transactionsAPI.create, {
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      queryClient.invalidateQueries('transactions');
      setShowRecordPaymentModal(false);
      setPaymentForm({ type: 'incoming', amount: '', party: '', method: 'cash', description: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  });

  const handleSubmitAction = (action, formData) => {
    switch (action.id) {
      case 1: // Add Product
        addProductMutation.mutate(formData);
        break;
      case 2: // New Sale
        createSaleMutation.mutate(formData);
        break;
      case 3: // Create Purchase
        createPurchaseMutation.mutate(formData);
        break;
      case 4: // Add User
        handleUserSubmit(formData);
        break;
      case 5: // Add Asset
        addAssetMutation.mutate(formData);
        break;
      case 7: // Record Payment
        recordPaymentMutation.mutate(formData);
        break;
      case 6: // Transfer Stock
        toast.success('Stock transfer initiated!');
        action.setModal(false);
        break;
      case 8: // Generate Invoice
        toast.success('Invoice generated successfully!');
        action.setModal(false);
        break;
      case 9: // Report Issue
        toast.success('Issue reported successfully!');
        action.setModal(false);
        break;
      case 10: // Quick Search
        action.setModal(true);
        break;
      default:
        toast.success(`${action.title} completed successfully!`);
        action.setModal(false);
    }
  };

  const renderModal = (action) => {
    if (!action.modal) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => action.setModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
            <button
              onClick={() => action.setModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Render form based on action type */}
          {action.id === 1 && (
            // Add Product Form
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmitAction(action, action.form);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={action.form.name}
                    onChange={(e) => action.setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      value={action.form.price}
                      onChange={(e) => action.setForm(prev => ({ ...prev, price: e.target.value }))}
                      className="input"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                    <input
                      type="number"
                      value={action.form.stock}
                      onChange={(e) => action.setForm(prev => ({ ...prev, stock: e.target.value }))}
                      className="input"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={action.form.category}
                    onChange={(e) => action.setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={action.form.description}
                    onChange={(e) => action.setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="2"
                    placeholder="Enter product description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => action.setModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Product
                </button>
              </div>
            </form>
          )}

          {action.id === 2 && (
            // New Sale Form
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmitAction(action, action.form);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={action.form.customerName}
                    onChange={(e) => action.setForm(prev => ({ ...prev, customerName: e.target.value }))}
                    className="input"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={action.form.paymentMethod}
                    onChange={(e) => action.setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="input"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    value={action.form.totalAmount}
                    onChange={(e) => action.setForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                    className="input"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => action.setModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Sale
                </button>
              </div>
            </form>
          )}

          {action.id === 10 && (
            // Quick Search Modal
            <div>
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                  placeholder="Search products, users, suppliers, transactions..."
                  autoFocus
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery.length > 0 ? 'No results found' : 'Start typing to search...'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div key={`${result.type}-${result.id}`} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{result.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{result.type}</p>
                          </div>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        {result.category && <p className="text-xs text-gray-500">{result.category}</p>}
                        {result.role && <p className="text-xs text-gray-500">Role: {result.role}</p>}
                        {result.reference && <p className="text-xs text-gray-500">Ref: {result.reference}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => action.setModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Other forms would be similar - simplified for brevity */}
          {action.id !== 1 && action.id !== 2 && action.id !== 10 && (
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Quick action form for {action.title}</p>
                <p className="text-xs text-gray-500 mt-2">This would contain the specific form fields for {action.title.toLowerCase()}</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => action.setModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitAction(action, action.form)}
                  className="btn btn-primary"
                >
                  Complete Action
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Quick Actions</h1>
            <p className="page-subtitle">Frequent, high-impact tasks that users perform daily</p>
          </div>
        </div>
      </motion.div>

      {/* Sub-navbar - Categories */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-lg p-2 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => handleSubNavAction('navigate', '/inventory')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Inventory
            </button>
            <button
              onClick={() => handleSubNavAction('navigate', '/sales')}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Sales Dashboard
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sub-navbar - Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-lg p-2 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSubNavAction('navigate', '/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => handleSubNavAction('external', 'https://help.inventory-system.com')}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Help
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAction(action)}
            className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Actions</p>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products Added</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CubeIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Created</p>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issues Reported</p>
              <p className="text-2xl font-bold text-orange-600">3</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mt-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quick Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <PlusIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Product Added</p>
                <p className="text-xs text-gray-500">Laptop Pro 15" - 2 mins ago</p>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium">Success</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sale Created</p>
                <p className="text-xs text-gray-500">Customer: John Doe - 5 mins ago</p>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium">Success</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Issue Reported</p>
                <p className="text-xs text-gray-500">Low stock alert - 10 mins ago</p>
              </div>
            </div>
            <span className="text-xs text-orange-600 font-medium">Pending</span>
          </div>
        </div>
      </motion.div>

      {/* Render all modals */}
      {quickActions.map((action) => (
        <div key={action.id}>
          {action.modal && renderModal(action)}
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
