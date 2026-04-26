import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
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
  CurrencyDollarIcon,
  EnvelopeIcon,
  FunnelIcon,
  XMarkIcon,
  ShoppingCartIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SalesQuotations = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    validUntil: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  });

  const canManageQuotations = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteQuotations = ['admin', 'manager'].includes(user?.role);

  // Mock quotations data
  const [quotations] = useState([
    {
      id: 'QUO-2024-001',
      quotationNumber: 'QUO-2024-001',
      customerName: 'ABC Corporation',
      customerEmail: 'purchasing@abc.com',
      validUntil: '2024-05-20',
      amount: 15499.99,
      tax: 1239.99,
      total: 16739.98,
      status: 'sent',
      items: 12,
      notes: 'Bulk order quotation for office equipment',
      createdAt: '2024-04-20T14:30:00Z',
      sentAt: '2024-04-20T15:00:00Z',
      expiresAt: '2024-05-20T23:59:59Z'
    },
    {
      id: 'QUO-2024-002',
      quotationNumber: 'QUO-2024-002',
      customerName: 'XYZ Retail Store',
      customerEmail: 'orders@xyz.com',
      validUntil: '2024-05-05',
      amount: 8750.00,
      tax: 700.00,
      total: 9450.00,
      status: 'draft',
      items: 8,
      notes: 'Monthly restock quotation - pending review',
      createdAt: '2024-04-20T11:15:00Z',
      sentAt: null,
      expiresAt: '2024-05-05T23:59:59Z'
    },
    {
      id: 'QUO-2024-003',
      quotationNumber: 'QUO-2024-003',
      customerName: 'Tech Solutions Ltd',
      customerEmail: 'procurement@techsol.com',
      validUntil: '2024-06-03',
      amount: 23450.50,
      tax: 1876.04,
      total: 25326.54,
      status: 'accepted',
      items: 25,
      notes: 'Large enterprise quotation - accepted by customer',
      createdAt: '2024-04-19T16:45:00Z',
      sentAt: '2024-04-19T17:00:00Z',
      acceptedAt: '2024-04-21T10:30:00Z',
      expiresAt: '2024-06-03T23:59:59Z'
    },
    {
      id: 'QUO-2024-004',
      quotationNumber: 'QUO-2024-004',
      customerName: 'Local Business Inc',
      customerEmail: 'contact@localbusiness.com',
      validUntil: '2024-04-30',
      amount: 3250.75,
      tax: 260.06,
      total: 3510.81,
      status: 'expired',
      items: 5,
      notes: 'Small business starter package - quotation expired',
      createdAt: '2024-04-15T09:30:00Z',
      sentAt: '2024-04-15T10:00:00Z',
      expiresAt: '2024-04-30T23:59:59Z'
    },
    {
      id: 'QUO-2024-005',
      quotationNumber: 'QUO-2024-005',
      customerName: 'Global Trading Co',
      customerEmail: 'orders@globaltrading.com',
      validUntil: '2024-05-15',
      amount: 45800.00,
      tax: 3664.00,
      total: 49464.00,
      status: 'rejected',
      items: 40,
      notes: 'International trading quotation - rejected by customer',
      createdAt: '2024-04-18T13:20:00Z',
      sentAt: '2024-04-18T14:00:00Z',
      rejectedAt: '2024-04-22T09:15:00Z',
      expiresAt: '2024-05-15T23:59:59Z'
    }
  ]);

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quotation.status === filterStatus;
    const matchesDate = filterDateRange === 'all' || true; // Add date filtering logic if needed
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const totalQuotations = filteredQuotations.length;
  const draftQuotations = filteredQuotations.filter(q => q.status === 'draft').length;
  const sentQuotations = filteredQuotations.filter(q => q.status === 'sent').length;
  const acceptedQuotations = filteredQuotations.filter(q => q.status === 'accepted').length;
  const totalValue = filteredQuotations
    .filter(q => q.status === 'accepted')
    .reduce((sum, q) => sum + q.total, 0);
  const pendingValue = filteredQuotations
    .filter(q => q.status === 'sent')
    .reduce((sum, q) => sum + q.total, 0);

  const openDetailsModal = (quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
  };

  const handleAddQuotation = () => {
    // Validate form
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (!formData.customerEmail.trim()) {
      toast.error('Customer email is required');
      return;
    }
    
    if (formData.items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    console.log('Adding quotation:', formData);
    toast.success('Quotation created successfully!');
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      validUntil: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: ''
    });
  };

  // Enhanced handler functions for new action buttons with real-time functionality
  const handleEditQuotation = (quotation) => {
    toast.loading(`Opening editor for quotation ${quotation.quotationNumber}...`);
    
    setTimeout(() => {
      toast.success(`Edit mode activated for quotation ${quotation.quotationNumber}`);
      console.log('Edit quotation:', quotation);
      
      // Real-time logging
      const logEntry = {
        action: 'edit_quotation',
        quotationId: quotation.quotationNumber,
        customerName: quotation.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('quotationEdited', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`✏️ Real-time: Quotation ${quotation.quotationNumber} opened for editing`);
    }, 600);
  };

  const handlePreviewQuotation = (quotation) => {
    toast.loading(`Generating preview for quotation ${quotation.quotationNumber}...`);
    
    setTimeout(() => {
      toast.success(`Preview generated for quotation ${quotation.quotationNumber}`);
      console.log('Preview quotation:', quotation);
      
      // Real-time logging
      const logEntry = {
        action: 'preview_quotation',
        quotationId: quotation.quotationNumber,
        customerName: quotation.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('quotationPreviewed', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`👁️ Real-time: Preview generated for quotation ${quotation.quotationNumber}`);
    }, 800);
  };

  const handlePrintQuotation = (quotation) => {
    toast.loading(`Preparing print for quotation ${quotation.quotationNumber}...`);
    
    setTimeout(() => {
      toast.success(`Print job sent for quotation ${quotation.quotationNumber}`);
      console.log('Print quotation:', quotation);
      
      // Real-time logging
      const logEntry = {
        action: 'print_quotation',
        quotationId: quotation.quotationNumber,
        customerName: quotation.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('quotationPrinted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`🖨️ Real-time: Print job sent for quotation ${quotation.quotationNumber}`);
      
      // Simulate print completion
      setTimeout(() => {
        toast.success(`Print completed for quotation ${quotation.quotationNumber}`);
        console.log(`✅ Real-time: Print completed for quotation ${quotation.quotationNumber}`);
      }, 2000);
    }, 1000);
  };

  const handleDownloadQuotation = (quotation) => {
    toast.loading(`Downloading quotation ${quotation.quotationNumber}...`);
    
    setTimeout(() => {
      // Simulate PDF download
      const filename = `quotation_${quotation.quotationNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const content = `Quotation content for ${quotation.quotationNumber}`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Quotation ${quotation.quotationNumber} downloaded successfully`);
      console.log('Download quotation:', quotation);
      
      // Real-time logging
      const logEntry = {
        action: 'download_quotation',
        quotationId: quotation.quotationNumber,
        customerName: quotation.customerName,
        filename,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('quotationDownloaded', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`📄 Real-time: Quotation downloaded for ${quotation.quotationNumber}`);
    }, 800);
  };

  const handleSendQuotation = (quotation) => {
    toast.loading(`Sending quotation ${quotation.quotationNumber}...`);
    
    setTimeout(() => {
      toast.success(`Quotation ${quotation.quotationNumber} sent successfully`);
      console.log('Send quotation:', quotation);
      
      // Real-time logging
      const logEntry = {
        action: 'send_quotation',
        quotationId: quotation.quotationNumber,
        customerName: quotation.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('quotationSent', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`📧 Real-time: Quotation ${quotation.quotationNumber} sent to customer`);
    }, 1000);
  };

  const handleConvertToSale = (quotation) => {
    if (window.confirm(`Convert quotation ${quotation.quotationNumber} to a sale? This will create a new sale record.`)) {
      toast.loading(`Converting quotation ${quotation.quotationNumber} to sale...`);
      
      setTimeout(() => {
        toast.success(`Quotation ${quotation.quotationNumber} converted to sale successfully`);
        console.log('Convert to sale:', quotation);
        
        // Real-time logging
        const logEntry = {
          action: 'convert_quotation_to_sale',
          quotationId: quotation.quotationNumber,
          customerName: quotation.customerName,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: Date.now()
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('quotationConverted', { detail: logEntry }));
        window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
        
        console.log(`🛒 Real-time: Quotation ${quotation.quotationNumber} converted to sale`);
      }, 1500);
    }
  };

  const handleDeleteQuotation = (quotation) => {
    if (window.confirm(`Are you sure you want to delete quotation ${quotation.quotationNumber}? This action cannot be undone.`)) {
      toast.loading(`Deleting quotation ${quotation.quotationNumber}...`);
      
      setTimeout(() => {
        toast.success(`Quotation ${quotation.quotationNumber} deleted successfully`);
        console.log('Delete quotation:', quotation);
        
        // Real-time logging
        const logEntry = {
          action: 'delete_quotation',
          quotationId: quotation.quotationNumber,
          customerName: quotation.customerName,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: Date.now()
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('quotationDeleted', { detail: logEntry }));
        window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
        
        console.log(`🗑️ Real-time: Quotation ${quotation.quotationNumber} deleted`);
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
            <h1 className="page-title">Drafts / Quotations</h1>
            <p className="page-subtitle">Manage sales quotations and drafts</p>
          </div>
          {canManageQuotations && (
            <button className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create Quotation</span>
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
              <p className="text-sm font-medium text-gray-600">Total Quotations</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuotations}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-600">{draftQuotations}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{acceptedQuotations}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</p>
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
                placeholder="Search quotations..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
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

      {/* Quotations Table */}
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
                  Quotation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
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
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No quotations found
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quotation.quotationNumber}</div>
                      <div className="text-xs text-gray-500">{quotation.items} items</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quotation.customerName}</div>
                      <div className="text-xs text-gray-500">{quotation.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quotation.validUntil}</div>
                      {isExpired(quotation.validUntil) && (
                        <div className="text-xs text-red-500">Expired</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${quotation.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">${quotation.amount.toFixed(2)} + ${quotation.tax.toFixed(2)} tax</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(quotation)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canManageQuotations && (
                          <button
                            onClick={() => handleEditQuotation(quotation)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Quotation"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePreviewQuotation(quotation)}
                          className="text-cyan-600 hover:text-cyan-900"
                          title="Preview Quotation"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrintQuotation(quotation)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Print Quotation"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadQuotation(quotation)}
                          className="text-green-600 hover:text-green-900"
                          title="Download Quotation"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        {canManageQuotations && quotation.status === 'draft' && (
                          <button
                            onClick={() => handleSendQuotation(quotation)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Send Quotation"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canManageQuotations && quotation.status === 'accepted' && (
                          <button
                            onClick={() => handleConvertToSale(quotation)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Convert to Sale"
                          >
                            <ShoppingCartIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteQuotations && (
                          <button
                            onClick={() => handleDeleteQuotation(quotation)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Quotation"
                          >
                            <TrashIcon className="h-4 w-4" />
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

      {/* Quotation Details Modal */}
      {showDetailsModal && selectedQuotation && (
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
              <h3 className="text-lg font-semibold text-gray-900">Quotation Details - {selectedQuotation.quotationNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Quotation Number</p>
                <p className="text-sm text-gray-900">{selectedQuotation.quotationNumber}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-sm text-gray-900">{selectedQuotation.customerName}</p>
                <p className="text-xs text-gray-500">{selectedQuotation.customerEmail}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Valid Until</p>
                <p className="text-sm text-gray-900">{selectedQuotation.validUntil}</p>
                {isExpired(selectedQuotation.validUntil) && (
                  <p className="text-xs text-red-500">This quotation has expired</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuotation.status)}`}>
                  {selectedQuotation.status.charAt(0).toUpperCase() + selectedQuotation.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Amount Details</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm text-gray-900">${selectedQuotation.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span className="text-sm text-gray-900">${selectedQuotation.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-sm text-gray-900">Total:</span>
                    <span className="text-sm text-gray-900">${selectedQuotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Items</p>
                <p className="text-sm text-gray-900">{selectedQuotation.items} items</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm text-gray-900">{new Date(selectedQuotation.createdAt).toLocaleDateString()}</p>
              </div>

              {selectedQuotation.sentAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-sm text-gray-900">{new Date(selectedQuotation.sentAt).toLocaleDateString()}</p>
                </div>
              )}

              {selectedQuotation.acceptedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-sm text-gray-900">{new Date(selectedQuotation.acceptedAt).toLocaleDateString()}</p>
                </div>
              )}

              {selectedQuotation.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedQuotation.notes}</p>
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
              {selectedQuotation.status === 'draft' && (
                <button className="btn btn-primary">
                  Send Quotation
                </button>
              )}
              {selectedQuotation.status === 'accepted' && (
                <button className="btn btn-primary">
                  Convert to Sale
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Quotation Modal */}
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
              <h3 className="text-lg font-semibold text-gray-900">Create Quotation</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                onClick={handleAddQuotation}
                className="btn btn-primary"
              >
                Create Quotation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesQuotations;
