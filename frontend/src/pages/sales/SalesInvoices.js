import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EnvelopeIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SalesInvoices = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const canManageInvoices = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteInvoices = ['admin', 'manager'].includes(user?.role);

  // Mock invoices data
  const [invoices] = useState([
    {
      id: 'INV-2024-001',
      invoiceNumber: 'INV-2024-001',
      customerName: 'ABC Corporation',
      customerEmail: 'purchasing@abc.com',
      saleId: 'SAL-001',
      issueDate: '2024-04-20',
      dueDate: '2024-05-20',
      amount: 15499.99,
      tax: 1239.99,
      total: 16739.98,
      status: 'paid',
      paymentDate: '2024-04-22',
      paymentMethod: 'Credit Card',
      items: 12,
      notes: 'Bulk order for office equipment',
      createdAt: '2024-04-20T14:30:00Z',
      sentAt: '2024-04-20T14:35:00Z'
    },
    {
      id: 'INV-2024-002',
      invoiceNumber: 'INV-2024-002',
      customerName: 'XYZ Retail Store',
      customerEmail: 'orders@xyz.com',
      saleId: 'SAL-002',
      issueDate: '2024-04-20',
      dueDate: '2024-05-05',
      amount: 8750.00,
      tax: 700.00,
      total: 9450.00,
      status: 'paid',
      paymentDate: '2024-04-25',
      paymentMethod: 'Bank Transfer',
      items: 8,
      notes: 'Regular monthly restock',
      createdAt: '2024-04-20T11:15:00Z',
      sentAt: '2024-04-20T11:20:00Z'
    },
    {
      id: 'INV-2024-003',
      invoiceNumber: 'INV-2024-003',
      customerName: 'Tech Solutions Ltd',
      customerEmail: 'procurement@techsol.com',
      saleId: 'SAL-003',
      issueDate: '2024-04-19',
      dueDate: '2024-06-03',
      amount: 23450.50,
      tax: 1876.04,
      total: 25326.54,
      status: 'pending',
      paymentDate: null,
      paymentMethod: null,
      items: 25,
      notes: 'Large enterprise order - awaiting approval',
      createdAt: '2024-04-19T16:45:00Z',
      sentAt: '2024-04-19T16:50:00Z'
    },
    {
      id: 'INV-2024-004',
      invoiceNumber: 'INV-2024-004',
      customerName: 'Local Business Inc',
      customerEmail: 'contact@localbusiness.com',
      saleId: 'SAL-004',
      issueDate: '2024-04-19',
      dueDate: '2024-05-04',
      amount: 3250.75,
      tax: 260.06,
      total: 3510.81,
      status: 'overdue',
      paymentDate: null,
      paymentMethod: null,
      items: 5,
      notes: 'Small business starter package',
      createdAt: '2024-04-19T09:30:00Z',
      sentAt: '2024-04-19T09:35:00Z'
    },
    {
      id: 'INV-2024-005',
      invoiceNumber: 'INV-2024-005',
      customerName: 'Global Trading Co',
      customerEmail: 'orders@globaltrading.com',
      saleId: 'SAL-005',
      issueDate: '2024-04-18',
      dueDate: '2024-06-17',
      amount: 45800.00,
      tax: 3664.00,
      total: 49464.00,
      status: 'cancelled',
      paymentDate: null,
      paymentMethod: null,
      items: 40,
      notes: 'Order cancelled by customer',
      createdAt: '2024-04-18T13:20:00Z',
      sentAt: null
    }
  ]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.saleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesDate = filterDateRange === 'all' || true; // Add date filtering logic if needed
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalInvoices = filteredInvoices.length;
  const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'pending').length;
  const overdueInvoices = filteredInvoices.filter(inv => inv.status === 'overdue').length;
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingAmount = filteredInvoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const openDetailsModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const openSendModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowSendModal(true);
  };

  const sendInvoice = () => {
    console.log('Sending invoice:', selectedInvoice);
    toast.success('Invoice sent successfully!');
    setShowSendModal(false);
    setSelectedInvoice(null);
  };

  const downloadInvoice = (invoice) => {
    console.log('Downloading invoice:', invoice);
    toast.success('Invoice downloaded successfully!');
  };

  const printInvoice = (invoice) => {
    console.log('Printing invoice:', invoice);
    toast.success('Invoice sent to printer!');
  };

  // Enhanced handler functions for new action buttons with real-time functionality
  const handleEditInvoice = (invoice) => {
    toast.loading(`Opening editor for invoice ${invoice.invoiceNumber}...`);
    
    setTimeout(() => {
      toast.success(`Edit mode activated for invoice ${invoice.invoiceNumber}`);
      console.log('Edit invoice:', invoice);
      
      // Real-time logging
      const logEntry = {
        action: 'edit_invoice',
        invoiceId: invoice.invoiceNumber,
        customerName: invoice.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('invoiceEdited', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`✏️ Real-time: Invoice ${invoice.invoiceNumber} opened for editing`);
    }, 600);
  };

  const handlePreviewInvoice = (invoice) => {
    toast.loading(`Generating preview for invoice ${invoice.invoiceNumber}...`);
    
    setTimeout(() => {
      toast.success(`Preview generated for invoice ${invoice.invoiceNumber}`);
      console.log('Preview invoice:', invoice);
      
      // Real-time logging
      const logEntry = {
        action: 'preview_invoice',
        invoiceId: invoice.invoiceNumber,
        customerName: invoice.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('invoicePreviewed', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`👁️ Real-time: Preview generated for invoice ${invoice.invoiceNumber}`);
    }, 800);
  };

  const handleDeleteInvoice = (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      toast.loading(`Deleting invoice ${invoice.invoiceNumber}...`);
      
      setTimeout(() => {
        toast.success(`Invoice ${invoice.invoiceNumber} deleted successfully`);
        console.log('Delete invoice:', invoice);
        
        // Real-time logging
        const logEntry = {
          action: 'delete_invoice',
          invoiceId: invoice.invoiceNumber,
          customerName: invoice.customerName,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: Date.now()
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('invoiceDeleted', { detail: logEntry }));
        window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
        
        console.log(`🗑️ Real-time: Invoice ${invoice.invoiceNumber} deleted`);
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
            <h1 className="page-title">Sales Invoices</h1>
            <p className="page-subtitle">Manage and track sales invoices</p>
          </div>
          {canManageInvoices && (
            <button className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create Invoice</span>
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
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">${outstandingAmount.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-orange-600" />
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
                placeholder="Search invoices..."
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
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
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

      {/* Invoices Table */}
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
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{invoice.saleId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.issueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${invoice.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{invoice.items} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
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
                              setSelectedInvoice(invoice);
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
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const data = [
                              ['Invoice Number', 'Customer', 'Email', 'Issue Date', 'Due Date', 'Total', 'Status'],
                              [invoice.invoiceNumber, invoice.customerName, invoice.customerEmail, invoice.issueDate, invoice.dueDate, invoice.total, invoice.status]
                            ];
                            const csv = data.map(row => row.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `invoice-${invoice.invoiceNumber}.csv`;
                            link.click();
                            URL.revokeObjectURL(url);
                            toast.success('Invoice downloaded successfully');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        {['admin', 'manager'].includes(user?.role) && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
                                toast.success(`Invoice ${invoice.invoiceNumber} deleted`);
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
                            const newStatus = invoice.status === 'paid' ? 'pending' : 'paid';
                            toast.success(`Invoice ${invoice.invoiceNumber} status updated to ${newStatus}`);
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

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
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
              <h3 className="text-lg font-semibold text-gray-900">Invoice Details - {selectedInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Invoice Number</p>
                <p className="text-sm text-gray-900">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sale ID</p>
                <p className="text-sm text-gray-900">{selectedInvoice.saleId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-sm text-gray-900">{selectedInvoice.customerName}</p>
                <p className="text-xs text-gray-500">{selectedInvoice.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Issue Date</p>
                <p className="text-sm text-gray-900">{selectedInvoice.issueDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-sm text-gray-900">{selectedInvoice.dueDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Subtotal</p>
                <p className="text-sm text-gray-900">${selectedInvoice.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tax</p>
                <p className="text-sm text-gray-900">${selectedInvoice.tax.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-sm font-medium text-gray-900">${selectedInvoice.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Items</p>
                <p className="text-sm text-gray-900">{selectedInvoice.items}</p>
              </div>
              {selectedInvoice.paymentDate && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Date</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.paymentDate}</p>
                </div>
              )}
              {selectedInvoice.paymentMethod && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.paymentMethod}</p>
                </div>
              )}
            </div>

            {selectedInvoice.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900 mt-1">{selectedInvoice.notes}</p>
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
                onClick={() => downloadInvoice(selectedInvoice)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => printInvoice(selectedInvoice)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Send Invoice Modal */}
      {showSendModal && selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSendModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Send Invoice</h3>
                <p className="text-sm text-gray-600">
                  Send {selectedInvoice.invoiceNumber} to {selectedInvoice.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={selectedInvoice.customerEmail}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={`Invoice ${selectedInvoice.invoiceNumber}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  rows={4}
                  value={`Dear ${selectedInvoice.customerName},

Please find attached invoice ${selectedInvoice.invoiceNumber} for your recent purchase.

Invoice Amount: $${selectedInvoice.total.toFixed(2)}
Due Date: ${selectedInvoice.dueDate}

Please let us know if you have any questions.

Best regards,
Your Sales Team`}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={sendInvoice}
                className="btn btn-primary flex items-center space-x-2"
              >
                <EnvelopeIcon className="h-4 w-4" />
                <span>Send Invoice</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesInvoices;
