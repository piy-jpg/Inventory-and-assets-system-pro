import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const InvoicesBilling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGSTModal, setShowGSTModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    type: 'sales',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGSTIN: '',
    items: [],
    subtotal: 0,
    tax: 0,
    gstRate: 18,
    gstAmount: 0,
    discount: 0,
    total: 0,
    status: 'draft',
    dueDate: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Real-time invoices data
  const { data: invoicesData, isLoading, refetch } = useQuery(
    'invoicesBilling',
    () => {
      const storedInvoices = localStorage.getItem('invoicesBilling');
      if (storedInvoices) {
        return JSON.parse(storedInvoices);
      }
      
      return [
        {
          _id: 'INV_001',
          invoiceNumber: 'INV-2024-001',
          type: 'sales',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          customerPhone: '+1-555-0101',
          customerAddress: '123 Main St, New York, NY 10001',
          customerGSTIN: 'GST123456789',
          items: [
            { name: 'Laptop Pro 15"', quantity: 1, price: 1299.99, hsnCode: '8471', taxRate: 18, taxAmount: 233.99, total: 1533.98 },
            { name: 'Wireless Mouse', quantity: 2, price: 29.99, hsnCode: '8471', taxRate: 18, taxAmount: 10.80, total: 70.78 }
          ],
          subtotal: 1359.97,
          tax: 244.79,
          gstRate: 18,
          gstAmount: 244.79,
          discount: 50.00,
          total: 1554.76,
          status: 'sent',
          issueDate: '2024-04-23',
          dueDate: '2024-05-23',
          createdBy: 'Sarah Johnson',
          notes: 'Payment terms: Net 30 days',
          createdAt: '2024-04-23T10:30:00Z',
          updatedAt: '2024-04-23T10:30:00Z'
        },
        {
          _id: 'INV_002',
          invoiceNumber: 'INV-2024-002',
          type: 'sales',
          customerName: 'Emily Davis',
          customerEmail: 'emily.davis@email.com',
          customerPhone: '+1-555-0102',
          customerAddress: '456 Oak Ave, Los Angeles, CA 90001',
          customerGSTIN: 'GST987654321',
          items: [
            { name: 'Office Chair Ergonomic', quantity: 1, price: 399.99, hsnCode: '9401', taxRate: 18, taxAmount: 71.99, total: 471.98 }
          ],
          subtotal: 399.99,
          tax: 71.99,
          gstRate: 18,
          gstAmount: 71.99,
          discount: 0.00,
          total: 471.98,
          status: 'paid',
          issueDate: '2024-04-22',
          dueDate: '2024-05-22',
          createdBy: 'Mike Wilson',
          notes: 'Paid via credit card',
          createdAt: '2024-04-22T14:15:00Z',
          updatedAt: '2024-04-23T09:30:00Z'
        },
        {
          _id: 'INV_003',
          invoiceNumber: 'BILL-2024-001',
          type: 'purchase',
          customerName: 'Tech Supplies Inc.',
          customerEmail: 'billing@techsupplies.com',
          customerPhone: '+1-555-0201',
          customerAddress: '789 Industrial Blvd, Chicago, IL 60601',
          customerGSTIN: 'GST456789123',
          items: [
            { name: 'Laptop Pro 15"', quantity: 5, price: 1199.99, hsnCode: '8471', taxRate: 18, taxAmount: 1079.99, total: 7079.94 },
            { name: 'Wireless Mouse', quantity: 10, price: 24.99, hsnCode: '8471', taxRate: 18, taxAmount: 44.98, total: 294.88 }
          ],
          subtotal: 6249.85,
          tax: 1124.97,
          gstRate: 18,
          gstAmount: 1124.97,
          discount: 200.00,
          total: 7174.82,
          status: 'pending',
          issueDate: '2024-04-21',
          dueDate: '2024-05-21',
          createdBy: 'Sarah Johnson',
          notes: 'Payment terms: Net 45 days',
          createdAt: '2024-04-21T09:30:00Z',
          updatedAt: '2024-04-21T09:30:00Z'
        }
      ];
    },
    {
      refetchInterval: 11000, // Real-time refresh every 11 seconds
      onSuccess: (data) => {
        console.log('Invoices and billing data refreshed:', data);
      }
    }
  );

  // Mutation for generating new invoice
  const generateInvoiceMutation = useMutation(
    async (invoiceData) => {
      const invoices = invoicesData || [];
      const newInvoice = {
        ...invoiceData,
        _id: `INV_${Date.now()}`,
        invoiceNumber: invoiceData.type === 'sales' 
          ? `INV-2024-${String(invoices.filter(inv => inv.type === 'sales').length + 1).padStart(3, '0')}`
          : `BILL-2024-${String(invoices.filter(inv => inv.type === 'purchase').length + 1).padStart(3, '0')}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedInvoices = [...invoices, newInvoice];
      localStorage.setItem('invoicesBilling', JSON.stringify(updatedInvoices));
      queryClient.setQueryData('invoicesBilling', updatedInvoices);
      return updatedInvoices;
    },
    {
      onSuccess: () => {
        toast.success('Invoice generated successfully');
        setShowGenerateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to generate invoice');
      }
    }
  );

  // Mutation for updating invoice status
  const updateInvoiceStatusMutation = useMutation(
    async ({ invoiceId, status }) => {
      const invoices = invoicesData || [];
      const updatedInvoices = invoices.map(invoice => 
        invoice._id === invoiceId ? {
          ...invoice,
          status,
          updatedAt: new Date().toISOString()
        } : invoice
      );
      localStorage.setItem('invoicesBilling', JSON.stringify(updatedInvoices));
      queryClient.setQueryData('invoicesBilling', updatedInvoices);
      return updatedInvoices;
    },
    {
      onSuccess: () => {
        toast.success('Invoice status updated successfully');
        setShowPreviewModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update invoice status');
      }
    }
  );

  const invoices = invoicesData || [];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesType = filterType === 'all' || invoice.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const resetForm = () => {
    setFormData({
      type: 'sales',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      customerGSTIN: '',
      items: [],
      subtotal: 0,
      tax: 0,
      gstRate: 18,
      gstAmount: 0,
      discount: 0,
      total: 0,
      status: 'draft',
      dueDate: '',
      notes: ''
    });
  };

  const openPreviewModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  };

  const openGSTModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowGSTModal(true);
  };

  const handleGenerateInvoice = () => {
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    generateInvoiceMutation.mutate(formData);
  };

  const handleUpdateStatus = (status) => {
    if (!selectedInvoice) return;

    updateInvoiceStatusMutation.mutate({
      invoiceId: selectedInvoice._id,
      status
    });
  };

  const handlePrint = (invoice) => {
    // Simulate print functionality
    window.print();
    toast.success('Print job sent to printer');
  };

  const handleDownload = (invoice) => {
    // Simulate download functionality
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${invoice.invoiceNumber}.pdf`;
    link.click();
    toast.success(`${invoice.invoiceNumber} downloaded successfully`);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Invoices data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalInvoices = invoices.length;
  const salesInvoices = invoices.filter(invoice => invoice.type === 'sales').length;
  const purchaseInvoices = invoices.filter(invoice => invoice.type === 'purchase').length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending' || invoice.status === 'sent').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;

  // GST configuration
  const gstRates = [0, 5, 12, 18, 28];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Invoices & Billing</h1>
            <p className="page-subtitle">Generate invoice, Print/Download invoice, GST billing (if applicable)</p>
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
                setShowGenerateModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Generate Invoice</span>
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
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{pendingInvoices}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invoice Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Invoices</p>
              <p className="text-xl font-bold text-green-600">{salesInvoices}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Purchase Invoices</p>
              <p className="text-xl font-bold text-purple-600">{purchaseInvoices}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-red-600">{overdueInvoices}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="sales">Sales Invoices</option>
              <option value="purchase">Purchase Invoices</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">Created: {invoice.issueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
                      {invoice.customerGSTIN && (
                        <div className="text-xs text-gray-500">GSTIN: {invoice.customerGSTIN}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(invoice.type)}`}>
                        {invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${invoice.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Subtotal: ${invoice.subtotal.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.gstRate}%</div>
                      <div className="text-xs text-gray-500">GST: ${invoice.gstAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.dueDate}</div>
                      {new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && (
                        <div className="text-xs text-red-600">Overdue</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openPreviewModal(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Invoice"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(invoice)}
                          className="text-green-600 hover:text-green-900"
                          title="Print Invoice"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(invoice)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Download Invoice"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        {invoice.customerGSTIN && (
                          <button
                            onClick={() => openGSTModal(invoice)}
                            className="text-orange-600 hover:text-orange-900"
                            title="GST Details"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowGenerateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate New Invoice</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleGenerateInvoice();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="sales">Sales Invoice</option>
                      <option value="purchase">Purchase Invoice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                    <select
                      value={formData.gstRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, gstRate: parseInt(e.target.value) }))}
                      className="input"
                    >
                      {gstRates.map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === 'sales' ? 'Customer Name' : 'Supplier Name'} *
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="input"
                      placeholder={formData.type === 'sales' ? 'Customer name' : 'Supplier name'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === 'sales' ? 'Customer Email' : 'Supplier Email'}
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === 'sales' ? 'Customer Phone' : 'Supplier Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="input"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={formData.customerGSTIN}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerGSTIN: e.target.value }))}
                      className="input"
                      placeholder="GST123456789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.type === 'sales' ? 'Customer Address' : 'Supplier Address'}
                  </label>
                  <textarea
                    value={formData.customerAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    className="input"
                    rows="2"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this invoice"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Amount</label>
                    <input
                      type="number"
                      value={formData.gstAmount}
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
                  onClick={() => setShowGenerateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={generateInvoiceMutation.isLoading}
                >
                  {generateInvoiceMutation.isLoading ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Invoice Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPreviewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Preview - {selectedInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedInvoice.type === 'sales' ? 'TAX INVOICE' : 'PURCHASE INVOICE'}
                  </h2>
                  <p className="text-sm text-gray-600">Your Company Name</p>
                  <p className="text-sm text-gray-600">GSTIN: GST123456789</p>
                  <p className="text-sm text-gray-600">Address: 123 Business Ave, City, State 12345</p>
                  <p className="text-sm text-gray-600">Phone: +1-555-0123</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Invoice Number</p>
                  <p className="text-lg font-bold text-gray-900">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">Issue Date</p>
                  <p className="text-lg font-bold text-gray-900">{selectedInvoice.issueDate}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">Due Date</p>
                  <p className="text-lg font-bold text-gray-900">{selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Customer/Supplier Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedInvoice.type === 'sales' ? 'Bill To:' : 'Ship To:'}
                </h3>
                <p className="text-sm font-medium text-gray-900">{selectedInvoice.customerName}</p>
                <p className="text-sm text-gray-600">{selectedInvoice.customerAddress}</p>
                <p className="text-sm text-gray-600">{selectedInvoice.customerEmail}</p>
                <p className="text-sm text-gray-600">{selectedInvoice.customerPhone}</p>
                {selectedInvoice.customerGSTIN && (
                  <p className="text-sm text-gray-600">GSTIN: {selectedInvoice.customerGSTIN}</p>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-900">Item Description</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-900">HSN Code</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-900">Quantity</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-900">Rate</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-900">Taxable Value</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-900">GST</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="py-2 text-sm text-center text-gray-900">{item.hsnCode}</td>
                        <td className="py-2 text-sm text-center text-gray-900">{item.quantity}</td>
                        <td className="py-2 text-sm text-right text-gray-900">${item.price.toFixed(2)}</td>
                        <td className="py-2 text-sm text-right text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                        <td className="py-2 text-sm text-right text-gray-900">${item.taxAmount.toFixed(2)}</td>
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
                    <span className="text-sm font-medium text-gray-900">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-900">GST ({selectedInvoice.gstRate}%):</span>
                    <span className="text-sm font-medium text-gray-900">${selectedInvoice.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-900">Discount:</span>
                    <span className="text-sm font-medium text-gray-900">-${selectedInvoice.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">Thank you for your business!</p>
                <p className="text-sm text-gray-600">Terms and Conditions: {selectedInvoice.notes || 'Payment terms apply'}</p>
                <p className="text-sm text-gray-600 mt-2">This is a computer generated invoice and does not require signature.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handlePrint(selectedInvoice);
                }}
                className="btn btn-primary"
              >
                Print
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleDownload(selectedInvoice);
                }}
                className="btn btn-outline"
              >
                Download
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* GST Details Modal */}
      {showGSTModal && selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowGSTModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">GST Details - {selectedInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setShowGSTModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">GSTIN</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.customerGSTIN}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">GST Rate</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.gstRate}%</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">GST Calculation Details</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 text-xs font-medium text-gray-700">Item</th>
                        <th className="text-right py-1 text-xs font-medium text-gray-700">Taxable Value</th>
                        <th className="text-right py-1 text-xs font-medium text-gray-700">GST Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-1 text-xs text-gray-900">{item.name}</td>
                          <td className="py-1 text-xs text-right text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                          <td className="py-1 text-xs text-right text-gray-900">${item.taxAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Taxable Value</p>
                  <p className="text-lg font-bold text-blue-900">${selectedInvoice.subtotal.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Total GST</p>
                  <p className="text-lg font-bold text-green-900">${selectedInvoice.gstAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">GST Breakdown</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST ({selectedInvoice.gstRate / 2}%):</span>
                    <span className="text-gray-900">${(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST ({selectedInvoice.gstRate / 2}%):</span>
                    <span className="text-gray-900">${(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span className="text-gray-700">Total GST:</span>
                    <span className="text-gray-900">${selectedInvoice.gstAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowGSTModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InvoicesBilling;
