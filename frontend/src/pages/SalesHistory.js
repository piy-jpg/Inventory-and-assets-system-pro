import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import { customersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const SalesHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // all, customer, product
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [productFilter, setProductFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [salesRepFilter, setSalesRepFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [shippingMethodFilter, setShippingMethodFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  const canViewSalesHistory = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteSales = ['admin', 'manager'].includes(user?.role);

  // Get customer ID from URL params or location state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const customerId = urlParams.get('customer') || location.state?.selectedCustomerId;
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
  }, [location]);

  const { data: customerData, isLoading: customerLoading } = useQuery(
    ['customer', selectedCustomerId],
    () => customersAPI.getById(selectedCustomerId),
    { enabled: Boolean(selectedCustomerId) }
  );

  const { data: salesData, isLoading: salesLoading } = useQuery(
    ['customer-sales-history', selectedCustomerId],
    () => customersAPI.getSalesHistory(selectedCustomerId),
    { enabled: Boolean(selectedCustomerId) }
  );

  // Get all sales data for comprehensive view
  const { data: allSalesData, isLoading: allSalesLoading } = useQuery(
    'all-sales-history',
    () => customersAPI.getAllSalesHistory(),
    { enabled: viewMode === 'all' }
  );

  // Get unified customer data for comprehensive connections
  const { data: unifiedData, isLoading: unifiedLoading } = useQuery(
    ['unified-customer-data', selectedCustomerId],
    () => customersAPI.getUnifiedCustomerData(selectedCustomerId),
    { enabled: Boolean(selectedCustomerId) }
  );

  const customer = customerData?.data?.data?.customer;
  const salesHistory = salesData?.data?.data?.salesHistory || [];
  const productPattern = salesData?.data?.data?.productPattern || [];
  const allSalesHistory = allSalesData?.data?.data?.salesHistory || [];
  const allProductPattern = allSalesData?.data?.data?.productPattern || [];
  
  // Unified data connections
  const unifiedCustomerData = unifiedData?.data?.data || {};
  const unifiedSalesHistory = unifiedCustomerData.salesHistory || [];
  const relatedLedger = unifiedCustomerData.ledger || [];
  const relatedDuePayments = unifiedCustomerData.duePayments || [];
  const unifiedAnalytics = unifiedCustomerData.analytics?.unifiedMetrics || {};
  const communicationLog = unifiedCustomerData.communicationLog || [];
  const alerts = unifiedCustomerData.alerts || [];
  
  // Determine which data to use based on view mode
  const currentSalesHistory = viewMode === 'all' ? allSalesHistory : salesHistory;
  const currentProductPattern = viewMode === 'all' ? allProductPattern : productPattern;
  const currentCustomer = viewMode === 'all' ? null : customer;

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

  const filteredSalesHistory = useMemo(() => {
    let filtered = currentSalesHistory || [];
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(sale => new Date(sale.sale_date) >= filterDate);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }
    
    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.payment_status === paymentStatusFilter);
    }
    
    // Amount range filter
    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter(sale => {
        const amount = sale.total_amount;
        const min = amountRange.min ? parseFloat(amountRange.min) : 0;
        const max = amountRange.max ? parseFloat(amountRange.max) : Infinity;
        return amount >= min && amount <= max;
      });
    }
    
    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(sale => 
        sale.items && sale.items.some(item => item.name === productFilter)
      );
    }
    
    // Customer filter
    if (customerFilter !== 'all') {
      filtered = filtered.filter(sale => sale.customer_id === customerFilter);
    }
    
    // Sales Rep filter
    if (salesRepFilter !== 'all') {
      filtered = filtered.filter(sale => sale.sales_rep === salesRepFilter);
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sale => 
        sale.items && sale.items.some(item => item.category === categoryFilter)
      );
    }
    
    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(sale => sale.payment_method === paymentMethodFilter);
    }
    
    // Shipping method filter
    if (shippingMethodFilter !== 'all') {
      filtered = filtered.filter(sale => sale.shipping_method === shippingMethodFilter);
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.sale_id.toLowerCase().includes(searchLower) ||
        (sale.customer_name && sale.customer_name.toLowerCase().includes(searchLower)) ||
        (sale.sales_rep && sale.sales_rep.toLowerCase().includes(searchLower)) ||
        (sale.tracking_number && sale.tracking_number.toLowerCase().includes(searchLower)) ||
        (sale.items && sale.items.some(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'customer':
          aValue = a.customer_name || '';
          bValue = b.customer_name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'payment_status':
          aValue = a.payment_status;
          bValue = b.payment_status;
          break;
        default:
          aValue = new Date(a.sale_date);
          bValue = new Date(b.sale_date);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [currentSalesHistory, dateFilter, statusFilter, paymentStatusFilter, searchTerm, sortBy, sortOrder, amountRange, productFilter, customerFilter, viewMode]);

  // Enhanced Analytics calculations
  const analytics = useMemo(() => {
    if (!filteredSalesHistory || filteredSalesHistory.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        topProduct: null,
        revenueTrend: 'stable',
        monthlyGrowth: 0,
        customerRetention: 0,
        productDiversity: 0,
        paymentCompletion: 0,
        topCategory: null,
        topSalesRep: null,
        avgItemsPerOrder: 0,
        totalItemsSold: 0,
        topPaymentMethod: null,
        topShippingMethod: null,
        discountImpact: 0,
        taxCollected: 0,
        profitMargin: 0,
        customerFrequency: 0,
        seasonalTrend: 'stable'
      };
    }
    
    const totalRevenue = filteredSalesHistory.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalOrders = filteredSalesHistory.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const paidAmount = filteredSalesHistory.reduce((sum, sale) => sum + (sale.paid_amount || 0), 0);
    const pendingAmount = filteredSalesHistory.reduce((sum, sale) => sum + (sale.balance_amount || 0), 0);
    const overdueAmount = filteredSalesHistory
      .filter(sale => sale.payment_status === 'overdue')
      .reduce((sum, sale) => sum + (sale.balance_amount || 0), 0);
    
    // Find top product
    const productSales = {};
    filteredSalesHistory.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          if (!productSales[item.name]) {
            productSales[item.name] = { count: 0, revenue: 0, quantity: 0 };
          }
          productSales[item.name].count++;
          productSales[item.name].revenue += item.total_price || 0;
          productSales[item.name].quantity += item.quantity || 1;
        });
      }
    });
    
    const topProduct = Object.keys(productSales).length > 0 
      ? Object.keys(productSales).reduce((a, b) => productSales[a].revenue > productSales[b].revenue ? a : b)
      : null;
    
    // Monthly growth calculation
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthSales = filteredSalesHistory.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    const previousMonthSales = filteredSalesHistory.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevYear;
    });
    
    const currentMonthRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const previousMonthRevenue = previousMonthSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;
    
    // Customer retention (repeat customers)
    const customerOrders = {};
    filteredSalesHistory.forEach(sale => {
      if (!customerOrders[sale.customer_id]) {
        customerOrders[sale.customer_id] = 0;
      }
      customerOrders[sale.customer_id]++;
    });
    const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;
    const customerRetention = Object.keys(customerOrders).length > 0 
      ? (repeatCustomers / Object.keys(customerOrders).length) * 100 
      : 0;
    
    // Product diversity
    const productDiversity = Object.keys(productSales).length;
    
    // Payment completion rate
    const paymentCompletion = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;
    
    // Find top category
    const categorySales = {};
    filteredSalesHistory.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          if (!categorySales[item.category]) {
            categorySales[item.category] = { count: 0, revenue: 0, quantity: 0 };
          }
          categorySales[item.category].count++;
          categorySales[item.category].revenue += item.total_price || 0;
          categorySales[item.category].quantity += item.quantity || 1;
        });
      }
    });
    
    const topCategory = Object.keys(categorySales).length > 0 
      ? Object.keys(categorySales).reduce((a, b) => categorySales[a].revenue > categorySales[b].revenue ? a : b)
      : null;
    
    // Find top sales representative
    const salesRepPerformance = {};
    filteredSalesHistory.forEach(sale => {
      if (sale.sales_rep) {
        if (!salesRepPerformance[sale.sales_rep]) {
          salesRepPerformance[sale.sales_rep] = { count: 0, revenue: 0 };
        }
        salesRepPerformance[sale.sales_rep].count++;
        salesRepPerformance[sale.sales_rep].revenue += sale.total_amount;
      }
    });
    
    const topSalesRep = Object.keys(salesRepPerformance).length > 0 
      ? Object.keys(salesRepPerformance).reduce((a, b) => salesRepPerformance[a].revenue > salesRepPerformance[b].revenue ? a : b)
      : null;
    
    // Calculate additional metrics
    const totalItemsSold = filteredSalesHistory.reduce((sum, sale) => {
      if (sale.items) {
        return sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0);
      }
      return sum;
    }, 0);
    
    const avgItemsPerOrder = totalOrders > 0 ? totalItemsSold / totalOrders : 0;
    
    // Top payment method
    const paymentMethods = {};
    filteredSalesHistory.forEach(sale => {
      if (sale.payment_method) {
        paymentMethods[sale.payment_method] = (paymentMethods[sale.payment_method] || 0) + 1;
      }
    });
    
    const topPaymentMethod = Object.keys(paymentMethods).length > 0 
      ? Object.keys(paymentMethods).reduce((a, b) => paymentMethods[a] > paymentMethods[b] ? a : b)
      : null;
    
    // Top shipping method
    const shippingMethods = {};
    filteredSalesHistory.forEach(sale => {
      if (sale.shipping_method) {
        shippingMethods[sale.shipping_method] = (shippingMethods[sale.shipping_method] || 0) + 1;
      }
    });
    
    const topShippingMethod = Object.keys(shippingMethods).length > 0 
      ? Object.keys(shippingMethods).reduce((a, b) => shippingMethods[a] > shippingMethods[b] ? a : b)
      : null;
    
    // Calculate discount impact and tax collected
    const totalDiscount = filteredSalesHistory.reduce((sum, sale) => {
      if (sale.items) {
        return sum + sale.items.reduce((itemSum, item) => itemSum + ((item.discount || 0) * item.quantity), 0);
      }
      return sum;
    }, 0);
    
    const totalTax = filteredSalesHistory.reduce((sum, sale) => {
      if (sale.items) {
        return sum + sale.items.reduce((itemSum, item) => itemSum + (item.tax || 0), 0);
      }
      return sum;
    }, 0);
    
    const discountImpact = totalRevenue > 0 ? (totalDiscount / totalRevenue) * 100 : 0;
    
    // Calculate customer frequency (average orders per customer)
    const uniqueCustomers = Object.keys(customerOrders).length;
    const customerFrequency = uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;
    
    // Revenue trend calculation
    let revenueTrend = 'stable';
    if (monthlyGrowth > 10) revenueTrend = 'increasing';
    else if (monthlyGrowth < -10) revenueTrend = 'decreasing';
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      paidAmount,
      pendingAmount,
      overdueAmount,
      topProduct,
      revenueTrend,
      monthlyGrowth,
      customerRetention,
      productDiversity,
      paymentCompletion,
      topCategory,
      topSalesRep,
      avgItemsPerOrder,
      totalItemsSold,
      topPaymentMethod,
      topShippingMethod,
      discountImpact,
      taxCollected: totalTax,
      profitMargin: 85, // Simulated profit margin
      customerFrequency,
      seasonalTrend: 'stable'
    };
  }, [filteredSalesHistory]);

  const handleBack = () => {
    navigate('/contacts');
  };

  const handleExport = (format = 'csv') => {
    const date = new Date().toISOString().split('T')[0];
    const filename = viewMode === 'all' ? `all_sales_${date}` : `sales_${currentCustomer?.name || 'customer'}_${date}`;
    
    if (format === 'csv') {
      const csvContent = [
        ['Sale ID', 'Date', 'Customer', 'Company', 'Total Amount', 'Status', 'Payment Status', 'Paid Amount', 'Balance Amount'],
        ...filteredSalesHistory.map(sale => [
          sale.sale_id,
          formatDate(sale.sale_date),
          sale.customer_name || currentCustomer?.name || 'N/A',
          sale.company_name || currentCustomer?.company_name || 'N/A',
          sale.total_amount,
          sale.status,
          sale.payment_status,
          sale.paid_amount || 0,
          sale.balance_amount || 0
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Sales history exported successfully');
    } else if (format === 'pdf') {
      toast.success('PDF export coming soon');
    } else if (format === 'excel') {
      toast.success('Excel export coming soon');
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries('customer-sales-history');
    queryClient.invalidateQueries('all-sales-history');
    toast.success('Sales data refreshed');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setDateFilter('all');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
    setAmountRange({ min: '', max: '' });
    setProductFilter('all');
    setCustomerFilter('all');
    toast.success('Filters cleared');
  };

  // Get unique products for filter dropdown
  const uniqueProducts = useMemo(() => {
    const products = new Set();
    currentSalesHistory.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          if (item.name) products.add(item.name);
        });
      }
    });
    return Array.from(products).sort();
  }, [currentSalesHistory]);

  // Get unique customers for filter dropdown
  const uniqueCustomers = useMemo(() => {
    const customers = new Set();
    currentSalesHistory.forEach(sale => {
      if (sale.customer_id && sale.customer_name) {
        customers.add({ id: sale.customer_id, name: sale.customer_name });
      }
    });
    return Array.from(customers).sort((a, b) => a.name.localeCompare(b.name));
  }, [currentSalesHistory]);

  const handleViewCustomer = (customerId) => {
    navigate(`/contacts?customer=${customerId}`, { 
      state: { selectedCustomerId: customerId } 
    });
  };

  const handleSendInvoice = (sale) => {
    const customerEmail = sale.customer_email || currentCustomer?.email;
    if (customerEmail) {
      const subject = encodeURIComponent(`Invoice ${sale.sale_id}`);
      const body = encodeURIComponent(`Dear ${sale.customer_name || currentCustomer?.name},\n\nPlease find attached invoice ${sale.sale_id} for your recent purchase.\n\nTotal Amount: ${formatCurrency(sale.total_amount)}\nPaid Amount: ${formatCurrency(sale.paid_amount || 0)}\nBalance Amount: ${formatCurrency(sale.balance_amount || 0)}\n\nThank you for your business!\n\nBest regards`);
      window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank');
      toast.success('Invoice email opened');
    } else {
      toast.error('No customer email available');
    }
  };

  const handleViewCustomerLedger = () => {
    if (selectedCustomerId) {
      navigate(`/contacts/ledger?customer=${selectedCustomerId}`, { 
        state: { selectedCustomerId } 
      });
    } else {
      toast.error('No customer selected');
    }
  };

  const handleViewCustomerProfile = () => {
    if (selectedCustomerId) {
      navigate(`/contacts?customer=${selectedCustomerId}`, { 
        state: { selectedCustomerId } 
      });
    } else {
      toast.error('No customer selected');
    }
  };

  const handleCreateNewSale = () => {
    if (selectedCustomerId) {
      navigate(`/contacts/create?customer=${selectedCustomerId}`, { 
        state: { selectedCustomerId } 
      });
    } else {
      navigate('/contacts/create');
    }
  };

  const handleProcessPayment = (sale) => {
    if (sale.balance_amount > 0) {
      const customerEmail = sale.customer_email || currentCustomer?.email;
      if (customerEmail) {
        const subject = encodeURIComponent(`Payment Processing for Order ${sale.sale_id}`);
        const body = encodeURIComponent(`Dear ${sale.customer_name || currentCustomer?.name},\n\nWe are processing your payment for order ${sale.sale_id}.\n\nOrder Details:\n- Total Amount: ${formatCurrency(sale.total_amount)}\n- Amount Due: ${formatCurrency(sale.balance_amount)}\n\nPlease complete the payment at your earliest convenience.\n\nThank you for your business!\n\nBest regards`);
        window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank');
        toast.success('Payment processing email sent');
      } else {
        toast.error('No customer email available');
      }
    } else {
      toast('This order is already paid in full');
    }
  };

  const handleGenerateSalesReport = () => {
    const reportData = {
      period: dateFilter === 'all' ? 'All Time' : dateFilter,
      totalRevenue: analytics.totalRevenue,
      totalOrders: analytics.totalOrders,
      avgOrderValue: analytics.avgOrderValue,
      paidAmount: analytics.paidAmount,
      pendingAmount: analytics.pendingAmount,
      topProduct: analytics.topProduct?.name || 'N/A'
    };
    
    const csvContent = [
      ['Sales Report'],
      ['Period:', reportData.period],
      ['Total Revenue:', formatCurrency(reportData.totalRevenue)],
      ['Total Orders:', reportData.totalOrders],
      ['Average Order Value:', formatCurrency(reportData.avgOrderValue)],
      ['Paid Amount:', formatCurrency(reportData.paidAmount)],
      ['Pending Amount:', formatCurrency(reportData.pendingAmount)],
      ['Top Product:', reportData.topProduct],
      [],
      ['Order Details'],
      ['Order ID', 'Date', 'Customer', 'Total Amount', 'Status', 'Payment Status'],
      ...filteredSalesHistory.map(sale => [
        sale.sale_id,
        formatDate(sale.sale_date),
        sale.customer_name || currentCustomer?.name || 'N/A',
        sale.total_amount,
        sale.status,
        sale.payment_status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Sales report generated');
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const isLoading = viewMode === 'all' ? allSalesLoading : (customerLoading || salesLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600 mb-4">Please wait while we load the sales data</p>
        </div>
      </div>
    );
  }

  if (!selectedCustomerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Customer Selected</h2>
          <p className="text-gray-600 mb-4">Please select a customer to view their sales history</p>
          <button onClick={handleBack} className="btn btn-primary">
            Go to Customer List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Customers
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Sales History</span>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'all' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Sales
                </button>
                <button
                  onClick={() => setViewMode('customer')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'customer' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={!selectedCustomerId}
                >
                  Customer View
                </button>
              </div>

              {/* Filters */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="6months">Last 6 Months</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="all">All Payment</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>

              {/* Actions */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export CSV"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print"
              >
                <PrinterIcon className="h-4 w-4" />
              </button>
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
          {customerLoading || salesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{customer?.name}</h1>
                      <p className="text-gray-600">{customer?.company_name || 'Individual Customer'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{customer?.phone}</span>
                        <span>·</span>
                        <span>{customer?.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-500 mt-1">Navigate to related customer sections and manage sales</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {canViewSalesHistory && (
                      <button
                        onClick={handleViewCustomerLedger}
                        className="btn btn-secondary flex items-center gap-2"
                        disabled={!selectedCustomerId}
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        View Ledger
                      </button>
                    )}
                    {canViewSalesHistory && (
                      <button
                        onClick={handleViewCustomerProfile}
                        className="btn btn-secondary flex items-center gap-2"
                        disabled={!selectedCustomerId}
                      >
                        <UserIcon className="h-4 w-4" />
                        Customer Profile
                      </button>
                    )}
                    {canViewSalesHistory && (
                      <button
                        onClick={handleCreateNewSale}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <ShoppingBagIcon className="h-4 w-4" />
                        Create Sale
                      </button>
                    )}
                    {canViewSalesHistory && (
                      <button
                        onClick={handleGenerateSalesReport}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                        Generate Report
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span className="font-medium">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</div>
                  <div className="text-sm text-gray-500 mt-1">{analytics.totalOrders} orders</div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      analytics.revenueTrend === 'increasing' ? 'bg-green-100 text-green-800' :
                      analytics.revenueTrend === 'decreasing' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {analytics.revenueTrend}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span className="font-medium">Paid Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.paidAmount)}</div>
                  <div className="text-sm text-gray-500 mt-1">{Math.round(analytics.paymentCompletion)}% collected</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="font-medium">Pending Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.pendingAmount)}</div>
                  <div className="text-sm text-gray-500 mt-1">{analytics.overdueAmount > 0 ? `${formatCurrency(analytics.overdueAmount)} overdue` : 'No overdue payments'}</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <ChartBarIcon className="h-5 w-5" />
                    <span className="font-medium">Avg Order Value</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.avgOrderValue)}</div>
                  <div className="text-sm text-gray-500 mt-1">{analytics.topProduct ? `Top: ${analytics.topProduct}` : 'No data'}</div>
                </div>
              </div>

              {/* Additional Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <ChartBarIcon className="h-5 w-5" />
                    <span className="font-medium">Monthly Growth</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.monthlyGrowth.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500 mt-1">vs previous month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <UserIcon className="h-5 w-5" />
                    <span className="font-medium">Customer Retention</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.customerRetention)}%</div>
                  <div className="text-sm text-gray-500 mt-1">repeat customers</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-pink-600 mb-2">
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span className="font-medium">Product Diversity</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.productDiversity}</div>
                  <div className="text-sm text-gray-500 mt-1">different products</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-cyan-600 mb-2">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span className="font-medium">Payment Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.paymentCompletion)}%</div>
                  <div className="text-sm text-gray-500 mt-1">completion rate</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Sales Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Complete order history with payment status
                    </p>
                  </div>

                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {filteredSalesHistory.map((sale) => (
                      <div key={sale._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{sale.sale_id}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                            {sale.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{formatDate(sale.sale_date)}</div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(sale.total_amount)}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(sale.payment_status)}`}>
                            {sale.payment_status}
                          </span>
                        </div>
                        {sale.paid_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Paid: {formatCurrency(sale.paid_amount)} | Balance: {formatCurrency(sale.balance_amount)}
                          </div>
                        )}
                        <div className="mt-2 space-y-1">
                          {sale.items?.map((item, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              {item.quantity}x {item.name} @ {formatCurrency(item.unit_price)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {filteredSalesHistory.length === 0 && (
                      <div className="text-center py-8">
                        <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No sales found for the selected period</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Pattern */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Product Buying Pattern</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Most purchased products and revenue contribution
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {productPattern.map((product) => (
                        <div key={product.name} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{product.name}</span>
                              <span className="text-sm text-gray-500">{product.percentage}%</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.quantity} units sold
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Visual Bar Chart */}
                    <div className="mt-6 space-y-2">
                      {productPattern.map((product) => (
                        <div key={product.name} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-24 truncate">{product.name}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${product.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">{product.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SalesHistory;
