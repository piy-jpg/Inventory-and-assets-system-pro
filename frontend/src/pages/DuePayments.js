import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { customersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DuePayments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('all'); // all, customermount
  const [filter, setFilter] = useState('all');
  const [filterBy, setFilterBy] = useState('amount');

  const { data: duePaymentsData, isLoading: duePaymentsLoading, refetch } = useQuery(
    viewMode === 'all' ? 'all-due-payments' : ['customer-due-payments', selectedCustomerId],
    () => viewMode === 'all' ? customersAPI.getDuePayments() : customersAPI.getDuePayments(selectedCustomerId),
    { 
      enabled: viewMode === 'all' || Boolean(selectedCustomerId),
      refetchInterval: 8000, // Real-time updates every 8 seconds
      refetchOnWindowFocus: true,
      keepPreviousData: true
    }
  );

  // Additional query for frequent buyers data
  const { data: frequentBuyersData, isLoading: frequentBuyersLoading } = useQuery(
    'frequent-buyers',
    () => customersAPI.getFrequentBuyers(),
    {
      refetchInterval: 60000, // Update every minute
      refetchOnWindowFocus: true,
      keepPreviousData: true
    }
  );

  const { data: customerData, isLoading: customerLoading } = useQuery(
    ['customer', selectedCustomerId],
    () => customersAPI.getById(selectedCustomerId),
    { enabled: Boolean(selectedCustomerId) }
  );

  // Enhanced mock data for due payments when API data is not available
  const mockDuePayments = [
    {
      _id: '1',
      customerId: 'cust_001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '+1-555-0123',
      amount: 2500,
      dueDate: '2024-04-15',
      status: 'overdue',
      priority: 'high',
      type: 'Invoice #INV-2024-001',
      description: 'Bulk order - Electronics',
      daysOverdue: 12,
      lastReminderDate: '2024-04-10',
      paymentHistory: [
        { date: '2024-03-15', amount: 1500, status: 'paid' },
        { date: '2024-04-01', amount: 500, status: 'pending' }
      ]
    },
    {
      _id: '2',
      customerId: 'cust_002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@company.com',
      customerPhone: '+1-555-0124',
      amount: 1200,
      dueDate: '2024-04-25',
      status: 'pending',
      priority: 'medium',
      type: 'Invoice #INV-2024-002',
      description: 'Office supplies',
      daysOverdue: 0,
      lastReminderDate: null,
      paymentHistory: []
    },
    {
      _id: '3',
      customerId: 'cust_003',
      customerName: 'Michael Davis',
      customerEmail: 'm.davis@business.com',
      customerPhone: '+1-555-0125',
      amount: 5750,
      dueDate: '2024-04-10',
      status: 'overdue',
      priority: 'high',
      type: 'Invoice #INV-2024-003',
      description: 'Software licenses',
      daysOverdue: 17,
      lastReminderDate: '2024-04-08',
      paymentHistory: [
        { date: '2024-03-20', amount: 2000, status: 'paid' }
      ]
    },
    {
      _id: '4',
      customerId: 'cust_004',
      customerName: 'Emily Wilson',
      customerEmail: 'emily.w@retail.com',
      customerPhone: '+1-555-0126',
      amount: 850,
      dueDate: '2024-05-05',
      status: 'pending',
      priority: 'low',
      type: 'Invoice #INV-2024-004',
      description: 'Marketing materials',
      daysOverdue: 0,
      lastReminderDate: null,
      paymentHistory: []
    },
    {
      _id: '5',
      customerId: 'cust_005',
      customerName: 'Robert Brown',
      customerEmail: 'r.brown@construction.com',
      customerPhone: '+1-555-0127',
      amount: 3200,
      dueDate: '2024-04-20',
      status: 'overdue',
      priority: 'high',
      type: 'Invoice #INV-2024-005',
      description: 'Construction equipment',
      daysOverdue: 7,
      lastReminderDate: '2024-04-18',
      paymentHistory: [
        { date: '2024-03-10', amount: 1000, status: 'paid' },
        { date: '2024-04-01', amount: 800, status: 'paid' }
      ]
    },
    {
      _id: '6',
      customerId: 'cust_006',
      customerName: 'Lisa Anderson',
      customerEmail: 'lisa.a@healthcare.com',
      customerPhone: '+1-555-0128',
      amount: 1800,
      dueDate: '2024-04-30',
      status: 'pending',
      priority: 'medium',
      type: 'Invoice #INV-2024-006',
      description: 'Medical supplies',
      daysOverdue: 0,
      lastReminderDate: null,
      paymentHistory: []
    },
    {
      _id: '7',
      customerId: 'cust_007',
      customerName: 'David Martinez',
      customerEmail: 'd.martinez@tech.com',
      customerPhone: '+1-555-0129',
      amount: 4500,
      dueDate: '2024-04-18',
      status: 'overdue',
      priority: 'high',
      type: 'Invoice #INV-2024-007',
      description: 'IT infrastructure',
      daysOverdue: 9,
      lastReminderDate: '2024-04-15',
      paymentHistory: [
        { date: '2024-03-25', amount: 1500, status: 'paid' }
      ]
    },
    {
      _id: '8',
      customerId: 'cust_008',
      customerName: 'Jennifer Taylor',
      customerEmail: 'j.taylor@education.com',
      customerPhone: '+1-555-0130',
      amount: 950,
      dueDate: '2024-05-10',
      status: 'pending',
      priority: 'low',
      type: 'Invoice #INV-2024-008',
      description: 'Educational materials',
      daysOverdue: 0,
      lastReminderDate: null,
      paymentHistory: []
    },
    {
      _id: '9',
      customerId: 'cust_009',
      customerName: 'James Garcia',
      customerEmail: 'j.garcia@restaurant.com',
      customerPhone: '+1-555-0131',
      amount: 2100,
      dueDate: '2024-04-22',
      status: 'overdue',
      priority: 'medium',
      type: 'Invoice #INV-2024-009',
      description: 'Kitchen equipment',
      daysOverdue: 5,
      lastReminderDate: '2024-04-20',
      paymentHistory: [
        { date: '2024-03-15', amount: 700, status: 'paid' }
      ]
    },
    {
      _id: '10',
      customerId: 'cust_010',
      customerName: 'Maria Rodriguez',
      customerEmail: 'm.rodriguez@logistics.com',
      customerPhone: '+1-555-0132',
      amount: 3800,
      dueDate: '2024-05-08',
      status: 'pending',
      priority: 'medium',
      type: 'Invoice #INV-2024-010',
      description: 'Logistics services',
      daysOverdue: 0,
      lastReminderDate: null,
      paymentHistory: []
    }
  ];

  const duePayments = duePaymentsData?.data?.data?.duePayments || mockDuePayments;

  // Sync due payments to localStorage for PaymentAlerts integration
  useEffect(() => {
    if (duePaymentsData?.data?.data?.duePayments) {
      localStorage.setItem('duePayments', JSON.stringify(duePaymentsData.data.data.duePayments));
      
      // Auto-generate alerts for overdue payments in PaymentAlerts
      const paymentAlerts = JSON.parse(localStorage.getItem('paymentAlerts') || '[]');
      const overduePayments = duePaymentsData.data.data.duePayments.filter(p => p.status === 'overdue');
      
      overduePayments.forEach(payment => {
        const existingAlert = paymentAlerts.find(alert => 
          alert.invoiceId === payment._id || alert.invoiceId === payment.type
        );
        
        if (!existingAlert) {
          const newAlert = {
            _id: `PAY_DUE_${payment._id}`,
            type: 'overdue_payment',
            title: 'Overdue Payment Alert',
            message: `${payment.type} from ${payment.customerName} is overdue by ${payment.daysOverdue} days`,
            severity: 'error',
            status: 'unread',
            timestamp: new Date().toISOString(),
            invoiceId: payment._id,
            supplierId: payment.customerId,
            supplierName: payment.customerName,
            amount: payment.amount,
            dueDate: payment.dueDate,
            overdueDays: payment.daysOverdue,
            paymentMethod: 'customer_payment',
            metadata: {
              customerEmail: payment.customerEmail,
              customerPhone: payment.customerPhone,
              priority: payment.priority,
              description: payment.description
            }
          };
          paymentAlerts.push(newAlert);
        }
      });
      
      localStorage.setItem('paymentAlerts', JSON.stringify(paymentAlerts));
      queryClient.invalidateQueries('paymentAlerts');
      queryClient.invalidateQueries('all-alerts-aggregated');
    }
  }, [duePaymentsData, queryClient]);
  const summary = duePaymentsData?.data?.data?.summary || {};
  const customer = customerData?.data?.data?.customer;
  const frequentBuyers = frequentBuyersData?.data?.data?.buyers || [];

  // Enhanced real-time statistics calculation
  const realTimeStats = useMemo(() => {
    const totalOutstanding = duePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const overduePayments = duePayments.filter(payment => payment.status === 'overdue');
    const overdueAmount = overduePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const customersWithDues = new Set(duePayments.map(p => p.customerId)).size;
    const overdueAccounts = new Set(overduePayments.map(p => p.customerId)).size;
    
    // Priority-based analysis
    const highPriorityPayments = duePayments.filter(p => p.priority === 'high');
    const mediumPriorityPayments = duePayments.filter(p => p.priority === 'medium');
    const lowPriorityPayments = duePayments.filter(p => p.priority === 'low');
    
    const highPriorityAmount = highPriorityPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const mediumPriorityAmount = mediumPriorityPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lowPriorityAmount = lowPriorityPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Aging analysis
    const now = new Date();
    const agingBuckets = {
      current: { count: 0, amount: 0 }, // 0-30 days
      overdue30: { count: 0, amount: 0 }, // 31-60 days
      overdue60: { count: 0, amount: 0 }, // 61-90 days
      overdue90: { count: 0, amount: 0 }  // 90+ days
    };
    
    duePayments.forEach(payment => {
      const dueDate = new Date(payment.dueDate);
      const daysDiff = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 0) {
        agingBuckets.current.count++;
        agingBuckets.current.amount += payment.amount || 0;
      } else if (daysDiff <= 30) {
        agingBuckets.overdue30.count++;
        agingBuckets.overdue30.amount += payment.amount || 0;
      } else if (daysDiff <= 60) {
        agingBuckets.overdue60.count++;
        agingBuckets.overdue60.amount += payment.amount || 0;
      } else {
        agingBuckets.overdue90.count++;
        agingBuckets.overdue90.amount += payment.amount || 0;
      }
    });
    
    // Calculate frequent buyers from due payments
    const customerPaymentCounts = {};
    duePayments.forEach(payment => {
      if (!customerPaymentCounts[payment.customerId]) {
        customerPaymentCounts[payment.customerId] = {
          name: payment.customerName,
          email: payment.customerEmail,
          phone: payment.customerPhone,
          count: 0,
          totalAmount: 0,
          overdueCount: 0,
          overdueAmount: 0
        };
      }
      customerPaymentCounts[payment.customerId].count++;
      customerPaymentCounts[payment.customerId].totalAmount += payment.amount || 0;
      
      if (payment.status === 'overdue') {
        customerPaymentCounts[payment.customerId].overdueCount++;
        customerPaymentCounts[payment.customerId].overdueAmount += payment.amount || 0;
      }
    });
    
    const frequentBuyersFromPayments = Object.values(customerPaymentCounts)
      .filter(customer => customer.count >= 2) // 2 or more payments
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
    
    // Risk assessment
    const highRiskCustomers = Object.values(customerPaymentCounts)
      .filter(customer => customer.overdueAmount > 2000)
      .length;
    
    const averagePaymentAmount = duePayments.length > 0 ? totalOutstanding / duePayments.length : 0;
    const averageOverdueAmount = overduePayments.length > 0 ? overdueAmount / overduePayments.length : 0;

    return {
      totalOutstanding,
      overdueAmount,
      customersWithDues,
      overdueAccounts,
      frequentBuyers: frequentBuyersFromPayments.length > 0 ? frequentBuyersFromPayments : frequentBuyers.slice(0, 5),
      totalPayments: duePayments.length,
      overduePayments: overduePayments.length,
      highPriorityPayments: highPriorityPayments.length,
      highPriorityAmount,
      mediumPriorityPayments: mediumPriorityPayments.length,
      mediumPriorityAmount,
      lowPriorityPayments: lowPriorityPayments.length,
      lowPriorityAmount,
      agingBuckets,
      highRiskCustomers,
      averagePaymentAmount,
      averageOverdueAmount,
      customerPaymentDetails: customerPaymentCounts
    };
  }, [duePayments, frequentBuyers]);

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

  const filteredDuePayments = duePayments.filter(payment => {
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const dueDate = new Date(payment.dueDate);
      const daysDiff = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'overdue': return daysDiff < 0;
        case '7days': return daysDiff <= 7 && daysDiff >= 0;
        case '30days': return daysDiff <= 30 && daysDiff >= 0;
        case '60days': return daysDiff <= 60 && daysDiff >= 0;
        default: return true;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      return payment.status === statusFilter;
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      return payment.priority === priorityFilter;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.customerName?.toLowerCase().includes(searchLower) ||
        payment.description?.toLowerCase().includes(searchLower) ||
        payment.type?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'dueDate':
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case 'customerName':
        aValue = a.customerName?.toLowerCase() || '';
        bValue = b.customerName?.toLowerCase() || '';
        break;
      default:
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  
  const handleBack = () => {
    navigate('/contacts');
  };

  const handleSendReminder = (payment) => {
    if (payment.customerEmail) {
      const subject = encodeURIComponent(`Payment Reminder - ${payment.type} Due ${formatDate(payment.dueDate)}`);
      const body = encodeURIComponent(`Dear ${payment.customerName},\n\nThis is a friendly reminder that your ${payment.type} payment of ${formatCurrency(payment.amount)} is due on ${formatDate(payment.dueDate)}.\n\nPayment Details:\n- Amount: ${formatCurrency(payment.amount)}\n- Due Date: ${formatDate(payment.dueDate)}\n- Type: ${payment.type}\n- Priority: ${payment.priority}\n\nPlease arrange for payment at your earliest convenience.\n\nThank you for your business!\n\nBest regards`);
      window.open(`mailto:${payment.customerEmail}?subject=${subject}&body=${body}`, '_blank');
      toast.success('Payment reminder sent');
    } else {
      toast.error('No customer email available');
    }
  };

  const handleCallCustomer = (payment) => {
    if (payment.customerPhone) {
      window.open(`tel:${payment.customerPhone}`, '_blank');
      toast.success('Calling customer');
    } else {
      toast.error('No customer phone available');
    }
  };

  const handleViewCustomerProfile = (payment) => {
    navigate(`/contacts?customer=${payment.customerId}`, { 
      state: { selectedCustomerId: payment.customerId } 
    });
  };

  const handleViewCustomerLedger = (payment) => {
    navigate(`/contacts/ledger?customer=${payment.customerId}`, { 
      state: { selectedCustomerId: payment.customerId } 
    });
  };

  const handleViewSalesHistory = (payment) => {
    navigate(`/contacts/sales-history?customer=${payment.customerId}`, { 
      state: { selectedCustomerId: payment.customerId } 
    });
  };

  // Mutation to mark payment as paid
  const markAsPaidMutation = useMutation(
    async (paymentId) => {
      const currentPayments = JSON.parse(localStorage.getItem('duePayments') || '[]');
      const updatedPayments = currentPayments.map(p => 
        p._id === paymentId ? { ...p, status: 'paid' } : p
      );
      localStorage.setItem('duePayments', JSON.stringify(updatedPayments));
      
      // Sync with PaymentAlerts - remove corresponding alert
      const paymentAlerts = JSON.parse(localStorage.getItem('paymentAlerts') || '[]');
      const updatedAlerts = paymentAlerts.filter(alert => 
        alert.invoiceId !== paymentId && alert.invoiceId !== `INV-${paymentId}`
      );
      localStorage.setItem('paymentAlerts', JSON.stringify(updatedAlerts));
      queryClient.invalidateQueries('paymentAlerts');
      queryClient.invalidateQueries('all-alerts-aggregated');
      
      return updatedPayments;
    },
    {
      onSuccess: () => {
        toast.success('Payment marked as paid');
        refetch();
      },
      onError: () => {
        toast.error('Failed to mark payment as paid');
      }
    }
  );

  // Mutation to delete payment
  const deletePaymentMutation = useMutation(
    async (paymentId) => {
      const currentPayments = JSON.parse(localStorage.getItem('duePayments') || '[]');
      const updatedPayments = currentPayments.filter(p => p._id !== paymentId);
      localStorage.setItem('duePayments', JSON.stringify(updatedPayments));
      
      // Sync with PaymentAlerts - remove corresponding alert
      const paymentAlerts = JSON.parse(localStorage.getItem('paymentAlerts') || '[]');
      const updatedAlerts = paymentAlerts.filter(alert => 
        alert.invoiceId !== paymentId && alert.invoiceId !== `INV-${paymentId}` && alert._id !== `PAY_DUE_${paymentId}`
      );
      localStorage.setItem('paymentAlerts', JSON.stringify(updatedAlerts));
      queryClient.invalidateQueries('paymentAlerts');
      queryClient.invalidateQueries('all-alerts-aggregated');
      
      return updatedPayments;
    },
    {
      onSuccess: () => {
        toast.success('Payment deleted successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete payment');
      }
    }
  );

  const handleMarkAsPaid = (payment) => {
    markAsPaidMutation.mutate(payment._id);
  };

  const handleDelete = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      deletePaymentMutation.mutate(paymentId);
    }
  };

  const handleExport = (format = 'csv') => {
    const date = new Date().toISOString().split('T')[0];
    const filename = viewMode === 'all' ? `due_payments_${date}` : `due_payments_${customer?.name || 'customer'}_${date}`;
    
    if (format === 'csv') {
      const csvContent = [
        ['Customer Name', 'Type', 'Amount', 'Due Date', 'Status', 'Priority', 'Description'],
        ...filteredDuePayments.map(payment => [
          payment.customerName || 'N/A',
          payment.type || 'N/A',
          payment.amount || 0,
          formatDate(payment.dueDate),
          payment.status || 'N/A',
          payment.priority || 'N/A',
          payment.description || 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Due payments exported successfully');
    } else if (format === 'pdf') {
      toast.success('PDF export coming soon');
    } else if (format === 'excel') {
      toast.success('Excel export coming soon');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(viewMode === 'all' ? 'all-due-payments' : ['customer-due-payments', selectedCustomerId]);
    queryClient.invalidateQueries('paymentAlerts');
    queryClient.invalidateQueries('all-alerts-aggregated');
    queryClient.invalidateQueries('customer');
    toast.success('Due payments data refreshed');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setDateFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
    setSortBy('dueDate');
    setSortOrder('asc');
    toast.success('Filters cleared');
  };

  
  const getStatusColor = (status) => {
    const colors = {
      overdue: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.pending;
  };

  const getSeverityColor = (amount) => {
    if (amount > 10000) return 'text-red-600';
    if (amount > 5000) return 'text-orange-600';
    if (amount > 1000) return 'text-yellow-600';
    return 'text-blue-600';
  };

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
              <span className="text-gray-900 font-medium">Due Payments</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="all">All Customers</option>
                <option value="overdue">Overdue Only</option>
                <option value="high">High Amount (&gt;$5,000)</option>
                <option value="medium">Medium Amount ($1,000-$5,000)</option>
                <option value="low">Low Amount (&lt;$1,000)</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input text-sm"
              >
                <option value="amount">Sort by Amount</option>
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Last Purchase</option>
              </select>
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
          {duePaymentsLoading || customerLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span className="font-medium">Total Outstanding</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(realTimeStats.totalOutstanding)}</div>
                  <div className="text-sm text-gray-500 mt-1">{realTimeStats.totalPayments} payments</div>
                  <div className="mt-2 text-xs text-gray-400">Avg: {formatCurrency(realTimeStats.averagePaymentAmount)}</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="font-medium">Overdue Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(realTimeStats.overdueAmount)}</div>
                  <div className="text-sm text-gray-500 mt-1">{realTimeStats.overduePayments} overdue</div>
                  <div className="mt-2 text-xs text-red-500">Avg overdue: {formatCurrency(realTimeStats.averageOverdueAmount)}</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span className="font-medium">High Priority</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{realTimeStats.highPriorityPayments}</div>
                  <div className="text-sm text-gray-500 mt-1">{formatCurrency(realTimeStats.highPriorityAmount)}</div>
                  <div className="mt-2 text-xs text-orange-500">High risk accounts</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="font-medium">Risk Analysis</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{realTimeStats.highRiskCustomers}</div>
                  <div className="text-sm text-gray-500 mt-1">{realTimeStats.overdueAccounts} overdue</div>
                  <div className="mt-2 text-xs text-purple-500">Customers &gt;$2k overdue</div>
                </div>
              </div>

              {/* Aging Analysis */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Aging Analysis</h3>
                    <p className="text-sm text-gray-500 mt-1">Payment aging by time periods</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Real-time</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{realTimeStats.agingBuckets.current.count}</div>
                    <div className="text-sm text-green-600 mt-1">Current</div>
                    <div className="text-xs text-gray-500 mt-1">{formatCurrency(realTimeStats.agingBuckets.current.amount)}</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-700">{realTimeStats.agingBuckets.overdue30.count}</div>
                    <div className="text-sm text-yellow-600 mt-1">1-30 Days</div>
                    <div className="text-xs text-gray-500 mt-1">{formatCurrency(realTimeStats.agingBuckets.overdue30.amount)}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-700">{realTimeStats.agingBuckets.overdue60.count}</div>
                    <div className="text-sm text-orange-600 mt-1">31-60 Days</div>
                    <div className="text-xs text-gray-500 mt-1">{formatCurrency(realTimeStats.agingBuckets.overdue60.amount)}</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{realTimeStats.agingBuckets.overdue90.count}</div>
                    <div className="text-sm text-red-600 mt-1">60+ Days</div>
                    <div className="text-xs text-gray-500 mt-1">{formatCurrency(realTimeStats.agingBuckets.overdue90.amount)}</div>
                  </div>
                </div>
              </div>

              {/* Frequent Buyers Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Frequent Buyers</h3>
                    <p className="text-sm text-gray-500 mt-1">Customers with multiple outstanding payments</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Real-time</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {realTimeStats.frequentBuyers.map((buyer, index) => (
                    <div key={buyer.name || index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-semibold text-lg">
                          {(buyer.name || 'Customer').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm truncate">{buyer.name || 'Unknown'}</h4>
                      <p className="text-xs text-gray-500 mt-1">{buyer.count || 0} payments</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(buyer.totalAmount || 0)}</p>
                    </div>
                  ))}
                  
                  {realTimeStats.frequentBuyers.length === 0 && (
                    <div className="col-span-5 text-center py-8">
                      <p className="text-gray-500">No frequent buyers found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Customers with Outstanding Payments</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {realTimeStats.totalPayments} payments with total outstanding of {formatCurrency(realTimeStats.totalOutstanding)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outstanding
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDuePayments.map((payment) => {
                        return (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{payment.customerName}</p>
                                <p className="text-sm text-gray-500">{payment.type}</p>
                                <p className="text-xs text-gray-400 mt-1">{payment.description}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <PhoneIcon className="h-4 w-4" />
                                  {payment.customerPhone || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <EnvelopeIcon className="h-4 w-4" />
                                  <span className="truncate max-w-[150px]">{payment.customerEmail || 'No email'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`font-semibold ${getSeverityColor(payment.amount)}`}>
                                {formatCurrency(payment.amount)}
                              </div>
                              {payment.daysOverdue > 0 && (
                                <div className="text-xs text-red-500 mt-1">
                                  {payment.daysOverdue} days overdue
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                payment.priority === 'high' ? 'bg-red-100 text-red-800' :
                                payment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {payment.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">
                                <div>{formatDate(payment.dueDate)}</div>
                                {payment.lastReminderDate && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Last reminder: {formatDate(payment.lastReminderDate)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleCallCustomer(payment)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Call Customer"
                                >
                                  <PhoneIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleSendReminder(payment)}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Send Email Reminder"
                                >
                                  <EnvelopeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleViewCustomerLedger(payment)}
                                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View Ledger"
                                >
                                  <DocumentTextIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleMarkAsPaid(payment)}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Mark as Paid"
                                >
                                  <CurrencyDollarIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(payment._id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Payment"
                                  disabled={deletePaymentMutation.isLoading}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredDuePayments.length === 0 && (
                    <div className="text-center py-8">
                      <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No customers with outstanding payments found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DuePayments;
