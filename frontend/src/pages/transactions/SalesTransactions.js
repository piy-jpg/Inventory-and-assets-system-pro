import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CreditCardIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const SalesTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'cash',
    status: 'completed',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time sales transactions data
  const { data: salesData, isLoading, refetch } = useQuery(
    'salesTransactions',
    () => {
      const storedSales = localStorage.getItem('salesTransactions');
      if (storedSales) {
        return JSON.parse(storedSales);
      }
      
      return [
        {
          _id: 'SAL_001',
          invoiceNumber: 'INV-2024-001',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          customerPhone: '+1-555-0101',
          items: [
            { name: 'Laptop Pro 15"', quantity: 1, price: 1299.99, total: 1299.99 },
            { name: 'Wireless Mouse', quantity: 2, price: 29.99, total: 59.98 }
          ],
          subtotal: 1359.97,
          tax: 163.20,
          discount: 50.00,
          total: 1473.17,
          paymentMethod: 'credit_card',
          status: 'completed',
          date: '2024-04-23',
          time: '14:30:00',
          salesPerson: 'Sarah Johnson',
          notes: 'Customer requested extended warranty',
          createdAt: '2024-04-23T14:30:00Z',
          updatedAt: '2024-04-23T14:30:00Z'
        },
        {
          _id: 'SAL_002',
          invoiceNumber: 'INV-2024-002',
          customerName: 'Emily Davis',
          customerEmail: 'emily.davis@email.com',
          customerPhone: '+1-555-0102',
          items: [
            { name: 'Office Chair Ergonomic', quantity: 1, price: 399.99, total: 399.99 }
          ],
          subtotal: 399.99,
          tax: 48.00,
          discount: 0.00,
          total: 447.99,
          paymentMethod: 'cash',
          status: 'completed',
          date: '2024-04-23',
          time: '11:15:00',
          salesPerson: 'Mike Wilson',
          notes: 'Customer paid in cash',
          createdAt: '2024-04-23T11:15:00Z',
          updatedAt: '2024-04-23T11:15:00Z'
        },
        {
          _id: 'SAL_003',
          invoiceNumber: 'INV-2024-003',
          customerName: 'David Brown',
          customerEmail: 'david.brown@email.com',
          customerPhone: '+1-555-0103',
          items: [
            { name: 'Desktop Computer', quantity: 1, price: 899.99, total: 899.99 },
            { name: 'Monitor 24"', quantity: 1, price: 299.99, total: 299.99 }
          ],
          subtotal: 1199.98,
          tax: 144.00,
          discount: 100.00,
          total: 1243.98,
          paymentMethod: 'upi',
          status: 'pending',
          date: '2024-04-22',
          time: '16:45:00',
          salesPerson: 'Sarah Johnson',
          notes: 'Payment pending from customer',
          createdAt: '2024-04-22T16:45:00Z',
          updatedAt: '2024-04-22T16:45:00Z'
        },
        {
          _id: 'SAL_004',
          invoiceNumber: 'INV-2024-004',
          customerName: 'Lisa Anderson',
          customerEmail: 'lisa.anderson@email.com',
          customerPhone: '+1-555-0104',
          items: [
            { name: 'Conference Table', quantity: 1, price: 1599.99, total: 1599.99 }
          ],
          subtotal: 1599.99,
          tax: 192.00,
          discount: 0.00,
          total: 1791.99,
          paymentMethod: 'bank_transfer',
          status: 'completed',
          date: '2024-04-21',
          time: '09:30:00',
          salesPerson: 'Mike Wilson',
          notes: 'Bank transfer received',
          createdAt: '2024-04-21T09:30:00Z',
          updatedAt: '2024-04-21T09:30:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Sales transactions data refreshed:', data);
      }
    }
  );

  // Mutation for creating new sale
  const createSaleMutation = useMutation(
    async (saleData) => {
      const sales = salesData || [];
      const newSale = {
        ...saleData,
        _id: `SAL_${Date.now()}`,
        invoiceNumber: `INV-2024-${String(sales.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedSales = [...sales, newSale];
      localStorage.setItem('salesTransactions', JSON.stringify(updatedSales));
      queryClient.setQueryData('salesTransactions', updatedSales);
      return updatedSales;
    },
    {
      onSuccess: () => {
        toast.success('Sale created successfully');
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create sale');
      }
    }
  );

  const sales = salesData || [];

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sale.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'all' || sale.paymentMethod === filterPaymentMethod;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      paymentMethod: 'cash',
      status: 'completed',
      notes: ''
    });
  };

  const openDetailsModal = (sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const openInvoiceModal = (sale) => {
    setSelectedSale(sale);
    setShowInvoiceModal(true);
  };

  const handleCreateSale = () => {
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    createSaleMutation.mutate(formData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Sales data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'debit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'upi':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'bank_transfer':
        return <BanknotesIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'credit_card':
        return 'bg-blue-100 text-blue-800';
      case 'debit_card':
        return 'bg-purple-100 text-purple-800';
      case 'upi':
        return 'bg-orange-100 text-orange-800';
      case 'bank_transfer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalSales = sales.length;
  const completedSales = sales.filter(sale => sale.status === 'completed').length;
  const pendingSales = sales.filter(sale => sale.status === 'pending').length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  }).length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Sales Transactions</h1>
            <p className="page-subtitle">Create Sale, View All Sales, Sales Invoice, POS (Point of Sale)</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Sale</span>
            </button>
          </div>
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
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedSales}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{pendingSales}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <select
              className="input"
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Sales Table */}
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
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">Sales: {sale.salesPerson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                      <div className="text-xs text-gray-500">{sale.customerEmail}</div>
                      <div className="text-xs text-gray-500">{sale.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sale.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.name}
                            {index < Math.min(2, sale.items.length) - 1 && ', '}
                          </span>
                        ))}
                        {sale.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${sale.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Subtotal: ${sale.subtotal.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(sale.paymentMethod)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(sale.paymentMethod)}`}>
                          {sale.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + sale.paymentMethod.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.date}</div>
                      <div className="text-xs text-gray-500">{sale.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(sale)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openInvoiceModal(sale)}
                          className="text-green-600 hover:text-green-900"
                          title="View Invoice"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
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

      {/* Create Sale Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Sale</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSale();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="input"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="input"
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="input"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this sale"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                    <input
                      type="number"
                      value={formData.subtotal}
                      readOnly
                      className="input bg-gray-50"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                    <input
                      type="number"
                      value={formData.tax}
                      readOnly
                      className="input bg-gray-50"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <input
                      type="number"
                      value={formData.total}
                      readOnly
                      className="input bg-gray-50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createSaleMutation.isLoading}
                >
                  {createSaleMutation.isLoading ? 'Creating...' : 'Create Sale'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Sale Details Modal */}
      {showDetailsModal && selectedSale && (
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
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sale Details - {selectedSale.invoiceNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Name</p>
                <p className="text-sm text-gray-900">{selectedSale.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Email</p>
                <p className="text-sm text-gray-900">{selectedSale.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Phone</p>
                <p className="text-sm text-gray-900">{selectedSale.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sales Person</p>
                <p className="text-sm text-gray-900">{selectedSale.salesPerson}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(selectedSale.paymentMethod)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(selectedSale.paymentMethod)}`}>
                    {selectedSale.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + selectedSale.paymentMethod.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSale.status)}`}>
                  {selectedSale.status.charAt(0).toUpperCase() + selectedSale.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Items</p>
              <div className="space-y-2">
                {selectedSale.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Total: ${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">${selectedSale.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tax</p>
                <p className="text-sm font-medium text-gray-900">${selectedSale.tax.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-sm font-medium text-gray-900">${selectedSale.total.toFixed(2)}</p>
              </div>
            </div>

            {selectedSale.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedSale.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openInvoiceModal(selectedSale);
                }}
                className="btn btn-primary"
              >
                View Invoice
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedSale && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowInvoiceModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales Invoice - {selectedSale.invoiceNumber}</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-sm text-gray-600">Your Company Name</p>
                  <p className="text-sm text-gray-600">123 Business Ave</p>
                  <p className="text-sm text-gray-600">City, State 12345</p>
                  <p className="text-sm text-gray-600">Phone: +1-555-0123</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Invoice Number</p>
                  <p className="text-lg font-bold text-gray-900">{selectedSale.invoiceNumber}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">Date</p>
                  <p className="text-lg font-bold text-gray-900">{selectedSale.date}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
                <p className="text-sm font-medium text-gray-900">{selectedSale.customerName}</p>
                <p className="text-sm text-gray-600">{selectedSale.customerEmail}</p>
                <p className="text-sm text-gray-600">{selectedSale.customerPhone}</p>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-900">Item</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-900">Quantity</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-900">Price</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="py-2 text-sm text-center text-gray-900">{item.quantity}</td>
                        <td className="py-2 text-sm text-right text-gray-900">${item.price.toFixed(2)}</td>
                        <td className="py-2 text-sm text-right text-gray-900">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-900">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900">${selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-900">Tax:</span>
                    <span className="text-sm font-medium text-gray-900">${selectedSale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-900">Discount:</span>
                    <span className="text-sm font-medium text-gray-900">-${selectedSale.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${selectedSale.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">Thank you for your business!</p>
                <p className="text-sm text-gray-600">Payment Method: {selectedSale.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + selectedSale.paymentMethod.replace('_', ' ').slice(1)}</p>
                {selectedSale.notes && (
                  <p className="text-sm text-gray-600 mt-2">Notes: {selectedSale.notes}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Simulate print/download
                  window.print();
                }}
                className="btn btn-primary"
              >
                Print / Download
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesTransactions;
