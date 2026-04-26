import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  XMarkIcon,
  ReceiptRefundIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SalesPayments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    amount: 0,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: ''
  });

  const canManagePayments = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeletePayments = ['admin', 'manager'].includes(user?.role);

  // Mock payments data
  const [payments] = useState([
    {
      id: 'PAY-001',
      invoiceNumber: 'INV-2024-001',
      customerName: 'ABC Corporation',
      customerEmail: 'purchasing@abc.com',
      amount: 16739.98,
      paymentMethod: 'credit_card',
      paymentDate: '2024-04-22',
      paymentTime: '14:30:00',
      status: 'completed',
      referenceNumber: 'CC-1234-5678',
      processedBy: 'John Smith',
      notes: 'Full payment for bulk order',
      createdAt: '2024-04-22T14:30:00Z'
    },
    {
      id: 'PAY-002',
      invoiceNumber: 'INV-2024-002',
      customerName: 'XYZ Retail Store',
      customerEmail: 'orders@xyz.com',
      amount: 9450.00,
      paymentMethod: 'bank_transfer',
      paymentDate: '2024-04-25',
      paymentTime: '09:15:00',
      status: 'completed',
      referenceNumber: 'BT-9876-5432',
      processedBy: 'Sarah Johnson',
      notes: 'Monthly restock payment',
      createdAt: '2024-04-25T09:15:00Z'
    },
    {
      id: 'PAY-003',
      invoiceNumber: 'INV-2024-003',
      customerName: 'Tech Solutions Ltd',
      customerEmail: 'procurement@techsol.com',
      amount: 12663.27,
      paymentMethod: 'check',
      paymentDate: '2024-04-24',
      paymentTime: '11:45:00',
      status: 'pending',
      referenceNumber: 'CK-4567-8901',
      processedBy: 'Mike Wilson',
      notes: 'Partial payment - awaiting clearance',
      createdAt: '2024-04-24T11:45:00Z'
    },
    {
      id: 'PAY-004',
      invoiceNumber: 'INV-2024-004',
      customerName: 'Local Business Inc',
      customerEmail: 'contact@localbusiness.com',
      amount: 3510.81,
      paymentMethod: 'cash',
      paymentDate: '2024-04-19',
      paymentTime: '16:20:00',
      status: 'completed',
      referenceNumber: 'CS-2345-6789',
      processedBy: 'Emily Davis',
      notes: 'Cash payment for starter package',
      createdAt: '2024-04-19T16:20:00Z'
    },
    {
      id: 'PAY-005',
      invoiceNumber: 'INV-2024-006',
      customerName: 'Global Trading Co',
      customerEmail: 'orders@globaltrading.com',
      amount: 25000.00,
      paymentMethod: 'credit_card',
      paymentDate: '2024-04-23',
      paymentTime: '10:30:00',
      status: 'failed',
      referenceNumber: 'CC-3456-7890',
      processedBy: 'John Smith',
      notes: 'Payment declined - insufficient funds',
      createdAt: '2024-04-23T10:30:00Z'
    }
  ]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    const matchesDate = filterDateRange === 'all' || true; // Add date filtering logic if needed
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'bank_transfer':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'cash':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'check':
        return <ReceiptRefundIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      case 'check':
        return 'Check';
      default:
        return 'Other';
    }
  };

  const totalPayments = filteredPayments.length;
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;
  const failedPayments = filteredPayments.filter(p => p.status === 'failed').length;
  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const openDetailsModal = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleAddPayment = () => {
    // Validate form
    if (!formData.invoiceNumber.trim()) {
      toast.error('Invoice number is required');
      return;
    }
    
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    console.log('Adding payment:', formData);
    toast.success('Payment added successfully!');
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      customerName: '',
      amount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: ''
    });
  };

  // Enhanced handler functions for new action buttons with real-time functionality
  const handleEditPayment = (payment) => {
    toast.loading(`Opening editor for payment ${payment.id}...`);
    
    setTimeout(() => {
      toast.success(`Edit mode activated for payment ${payment.id}`);
      console.log('Edit payment:', payment);
      
      // Real-time logging
      const logEntry = {
        action: 'edit_payment',
        paymentId: payment.id,
        customerName: payment.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('paymentEdited', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`✏️ Real-time: Payment ${payment.id} opened for editing`);
    }, 600);
  };

  const handlePreviewPayment = (payment) => {
    toast.loading(`Generating preview for payment ${payment.id}...`);
    
    setTimeout(() => {
      toast.success(`Preview generated for payment ${payment.id}`);
      console.log('Preview payment:', payment);
      
      // Real-time logging
      const logEntry = {
        action: 'preview_payment',
        paymentId: payment.id,
        customerName: payment.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('paymentPreviewed', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`👁️ Real-time: Preview generated for payment ${payment.id}`);
    }, 800);
  };

  const handlePrintPayment = (payment) => {
    toast.loading(`Preparing print for payment ${payment.id}...`);
    
    setTimeout(() => {
      toast.success(`Print job sent for payment ${payment.id}`);
      console.log('Print payment:', payment);
      
      // Real-time logging
      const logEntry = {
        action: 'print_payment',
        paymentId: payment.id,
        customerName: payment.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('paymentPrinted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`🖨️ Real-time: Print job sent for payment ${payment.id}`);
      
      // Simulate print completion
      setTimeout(() => {
        toast.success(`Print completed for payment ${payment.id}`);
        console.log(`✅ Real-time: Print completed for payment ${payment.id}`);
      }, 2000);
    }, 1000);
  };

  const handleDownloadPayment = (payment) => {
    toast.loading(`Downloading receipt for payment ${payment.id}...`);
    
    setTimeout(() => {
      // Simulate PDF download
      const filename = `receipt_${payment.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      const content = `Payment receipt for ${payment.id}`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Receipt ${payment.id} downloaded successfully`);
      console.log('Download payment:', payment);
      
      // Real-time logging
      const logEntry = {
        action: 'download_payment',
        paymentId: payment.id,
        customerName: payment.customerName,
        filename,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('paymentDownloaded', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`📄 Real-time: Receipt downloaded for payment ${payment.id}`);
    }, 800);
  };

  const handleRefundPayment = (payment) => {
    if (window.confirm(`Are you sure you want to refund payment ${payment.id}? This action cannot be undone.`)) {
      toast.loading(`Processing refund for payment ${payment.id}...`);
      
      setTimeout(() => {
        toast.success(`Refund processed for payment ${payment.id}`);
        console.log('Refund payment:', payment);
        
        // Real-time logging
        const logEntry = {
          action: 'refund_payment',
          paymentId: payment.id,
          customerName: payment.customerName,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: Date.now()
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('paymentRefunded', { detail: logEntry }));
        window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
        
        console.log(`💰 Real-time: Refund processed for payment ${payment.id}`);
      }, 1200);
    }
  };

  const handleDeletePayment = (payment) => {
    if (window.confirm(`Are you sure you want to delete payment ${payment.id}? This action cannot be undone.`)) {
      toast.loading(`Deleting payment ${payment.id}...`);
      
      setTimeout(() => {
        toast.success(`Payment ${payment.id} deleted successfully`);
        console.log('Delete payment:', payment);
        
        // Real-time logging
        const logEntry = {
          action: 'delete_payment',
          paymentId: payment.id,
          customerName: payment.customerName,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: Date.now()
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('paymentDeleted', { detail: logEntry }));
        window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
        
        console.log(`🗑️ Real-time: Payment ${payment.id} deleted`);
      }, 1200);
    }
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
            <h1 className="page-title">Sales Payments</h1>
            <p className="page-subtitle">Track and manage sales payments</p>
          </div>
          {canManagePayments && (
            <button className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedPayments}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-purple-600">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.id}</div>
                      <div className="text-xs text-gray-500">{payment.referenceNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                      <div className="text-xs text-gray-500">{payment.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-400">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </div>
                        <span className="text-sm text-gray-900">
                          {getPaymentMethodName(payment.paymentMethod)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.paymentDate}</div>
                      <div className="text-xs text-gray-500">{payment.paymentTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {['admin', 'manager', 'staff'].includes(user?.role) && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          className="text-purple-600 hover:text-purple-900"
                          title="Print"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const data = [
                              ['Payment ID', 'Customer', 'Email', 'Invoice', 'Amount', 'Payment Method', 'Date', 'Status'],
                              [payment.id, payment.customerName, payment.customerEmail, payment.invoiceNumber, payment.amount, payment.paymentMethod, payment.paymentDate, payment.status]
                            ];
                            const csv = data.map(row => row.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `payment-${payment.id}.csv`;
                            link.click();
                            URL.revokeObjectURL(url);
                            toast.success('Payment downloaded successfully');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        {['admin', 'manager'].includes(user?.role) && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete payment ${payment.id}?`)) {
                                toast.success(`Payment ${payment.id} deleted`);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const newStatus = payment.status === 'completed' ? 'pending' : 'completed';
                            toast.success(`Payment ${payment.id} status updated to ${newStatus}`);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                          title="Update Status"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details - {selectedPayment.id}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Payment ID</p>
                <p className="text-sm text-gray-900">{selectedPayment.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-sm text-gray-900">{selectedPayment.customerName}</p>
                <p className="text-xs text-gray-500">{selectedPayment.customerEmail}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Invoice</p>
                <p className="text-sm text-gray-900">{selectedPayment.invoiceNumber}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-lg font-medium text-gray-900">${selectedPayment.amount.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <div className="flex items-center space-x-2">
                  <div className="text-gray-400">
                    {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                  </div>
                  <span className="text-sm text-gray-900">
                    {getPaymentMethodName(selectedPayment.paymentMethod)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Reference Number</p>
                <p className="text-sm text-gray-900">{selectedPayment.referenceNumber}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Payment Date</p>
                <p className="text-sm text-gray-900">{selectedPayment.paymentDate} at {selectedPayment.paymentTime}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Processed By</p>
                <p className="text-sm text-gray-900">{selectedPayment.processedBy}</p>
              </div>

              {selectedPayment.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedPayment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {selectedPayment.status === 'completed' && (
                <button className="btn btn-secondary flex items-center space-x-2">
                  <ReceiptRefundIcon className="h-4 w-4" />
                  <span>Process Refund</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Payment Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter invoice number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reference number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="btn btn-primary"
              >
                Record Payment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesPayments;
