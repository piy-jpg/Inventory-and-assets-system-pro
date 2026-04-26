import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { salesAPI } from '../../services/api';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AllSales = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    customerEmail: '',
    amount: 0,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: '',
    salesAgent: '',
    notes: ''
  });

  const canManageSales = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteSales = ['admin', 'manager'].includes(user?.role);

  // Update mutation for database integration
  const updateSaleMutation = useMutation(
    ({ id, data }) => salesAPI.update(id, data),
    {
      onSuccess: (data, variables) => {
        toast.success(`Sale ${variables.id} updated successfully in database`);
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('saleUpdated', { detail: { id: variables.id, data: variables.data } }));
        window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: { action: 'update', saleId: variables.id } }));
        console.log('✅ Real-time: Sale updated in database', variables);
      },
      onError: (error) => {
        console.error('Update sale error:', error);
        toast.error(error.response?.data?.message || 'Failed to update sale in database');
      }
    }
  );

  // Mock sales data combined with real sales from localStorage
  const [sales, setSales] = useState(() => {
    const mockSales = [
      {
        id: 'SAL-001',
        customerName: 'ABC Corporation',
        customerEmail: 'purchasing@abc.com',
        date: '2024-04-20',
        time: '14:30:00',
        amount: 15499.99,
        status: 'completed',
        paymentStatus: 'paid',
        items: 12,
        salesAgent: 'John Smith',
        invoiceNumber: 'INV-2024-001',
        paymentMethod: 'Credit Card',
        notes: 'Bulk order for office equipment'
      },
      {
        id: 'SAL-002',
        customerName: 'XYZ Retail Store',
        customerEmail: 'orders@xyz.com',
        date: '2024-04-20',
        time: '11:15:00',
        amount: 8750.00,
        status: 'completed',
        paymentStatus: 'paid',
        items: 8,
        salesAgent: 'Sarah Johnson',
        invoiceNumber: 'INV-2024-002',
        paymentMethod: 'Bank Transfer',
        notes: 'Regular monthly restock'
      },
      {
        id: 'SAL-003',
        customerName: 'Tech Solutions Ltd',
        customerEmail: 'procurement@techsol.com',
        date: '2024-04-19',
        time: '16:45:00',
        amount: 23450.50,
        status: 'pending',
        paymentStatus: 'pending',
        items: 25,
        salesAgent: 'Mike Wilson',
        invoiceNumber: 'INV-2024-003',
        paymentMethod: 'Pending',
        notes: 'Large enterprise order - awaiting approval'
      },
      {
        id: 'SAL-004',
        customerName: 'Local Business Inc',
        customerEmail: 'contact@localbusiness.com',
        date: '2024-04-19',
        time: '09:30:00',
        amount: 3250.75,
        status: 'completed',
        paymentStatus: 'paid',
        items: 5,
        salesAgent: 'Emily Davis',
        invoiceNumber: 'INV-2024-004',
        paymentMethod: 'Cash',
        notes: 'Small business starter package'
      },
      {
        id: 'SAL-005',
        customerName: 'Global Trading Co',
        customerEmail: 'orders@globaltrading.com',
        date: '2024-04-18',
        time: '13:20:00',
        amount: 45800.00,
        status: 'cancelled',
        paymentStatus: 'refunded',
        items: 40,
        salesAgent: 'John Smith',
        invoiceNumber: 'INV-2024-005',
        paymentMethod: 'Refunded',
        notes: 'Order cancelled by customer - full refund processed'
      }
    ];
    
    // Get real sales from localStorage
    const realSales = JSON.parse(localStorage.getItem('salesData') || '[]');
    
    // Combine and sort by date (newest first)
    const allSales = [...realSales, ...mockSales];
    return allSales.sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00:00')) - new Date(a.date + ' ' + (a.time || '00:00:00')));
  });

  // Update sales when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const realSales = JSON.parse(localStorage.getItem('salesData') || '[]');
      const mockSales = [
        {
          id: 'SAL-001',
          customerName: 'ABC Corporation',
          customerEmail: 'purchasing@abc.com',
          date: '2024-04-20',
          time: '14:30:00',
          amount: 15499.99,
          status: 'completed',
          paymentStatus: 'paid',
          items: 12,
          salesAgent: 'John Smith',
          invoiceNumber: 'INV-2024-001',
          paymentMethod: 'Credit Card',
          notes: 'Bulk order for office equipment'
        },
        {
          id: 'SAL-002',
          customerName: 'XYZ Retail Store',
          customerEmail: 'orders@xyz.com',
          date: '2024-04-20',
          time: '11:15:00',
          amount: 8750.00,
          status: 'completed',
          paymentStatus: 'paid',
          items: 8,
          salesAgent: 'Sarah Johnson',
          invoiceNumber: 'INV-2024-002',
          paymentMethod: 'Bank Transfer',
          notes: 'Regular monthly restock'
        },
        {
          id: 'SAL-003',
          customerName: 'Tech Solutions Ltd',
          customerEmail: 'procurement@techsol.com',
          date: '2024-04-19',
          time: '16:45:00',
          amount: 23450.50,
          status: 'pending',
          paymentStatus: 'pending',
          items: 25,
          salesAgent: 'Mike Wilson',
          invoiceNumber: 'INV-2024-003',
          paymentMethod: 'Pending',
          notes: 'Large enterprise order - awaiting approval'
        },
        {
          id: 'SAL-004',
          customerName: 'Local Business Inc',
          customerEmail: 'contact@localbusiness.com',
          date: '2024-04-19',
          time: '09:30:00',
          amount: 3250.75,
          status: 'completed',
          paymentStatus: 'paid',
          items: 5,
          salesAgent: 'Emily Davis',
          invoiceNumber: 'INV-2024-004',
          paymentMethod: 'Cash',
          notes: 'Small business starter package'
        },
        {
          id: 'SAL-005',
          customerName: 'Global Trading Co',
          customerEmail: 'orders@globaltrading.com',
          date: '2024-04-18',
          time: '13:20:00',
          amount: 45800.00,
          status: 'cancelled',
          paymentStatus: 'refunded',
          items: 40,
          salesAgent: 'John Smith',
          invoiceNumber: 'INV-2024-005',
          paymentMethod: 'Refunded',
          notes: 'Order cancelled by customer - full refund processed'
        }
      ];
      
      const allSales = [...realSales, ...mockSales];
      setSales(allSales.sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00:00')) - new Date(a.date + ' ' + (a.time || '00:00:00'))));
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for localStorage changes
    const interval = setInterval(() => {
      handleStorageChange();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
    const matchesDate = filterDateRange === 'all' || true; // Add date filtering logic if needed
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = filteredSales.filter(sale => sale.status === 'completed').length;
  const pendingSales = filteredSales.filter(sale => sale.status === 'pending').length;
  const cancelledSales = filteredSales.filter(sale => sale.status === 'cancelled').length;

  const openDetailsModal = (sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  // Enhanced handler functions for action buttons with real-time functionality
  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setEditFormData({
      customerName: sale.customerName,
      customerEmail: sale.customerEmail,
      amount: sale.amount,
      status: sale.status,
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod,
      salesAgent: sale.salesAgent,
      notes: sale.notes
    });
    setShowEditModal(true);
    
    toast.loading(`Opening editor for sale ${sale.id}...`);
    
    setTimeout(() => {
      toast.success(`Edit mode activated for sale ${sale.id}`);
      console.log('Edit sale:', sale);
      
      // Real-time logging
      const logEntry = {
        action: 'edit_sale',
        saleId: sale.id,
        customerName: sale.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('saleEdited', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`✏️ Real-time: Sale ${sale.id} opened for editing`);
    }, 600);
  };

  const handlePreviewSale = (sale) => {
    toast.loading(`Generating preview for sale ${sale.id}...`);
    
    setTimeout(() => {
      toast.success(`Preview generated for sale ${sale.id}`);
      console.log('Preview sale:', sale);
      
      // Real-time logging
      const logEntry = {
        action: 'preview_sale',
        saleId: sale.id,
        customerName: sale.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('salePreviewed', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`👁️ Real-time: Preview generated for sale ${sale.id}`);
    }, 800);
  };

  const handlePrintSale = (sale) => {
    toast.loading(`Preparing print for sale ${sale.id}...`);
    
    setTimeout(() => {
      toast.success(`Print job sent for sale ${sale.id}`);
      console.log('Print sale:', sale);
      
      // Real-time logging
      const logEntry = {
        action: 'print_sale',
        saleId: sale.id,
        customerName: sale.customerName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('salePrinted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`🖨️ Real-time: Print job sent for sale ${sale.id}`);
      
      // Simulate print completion
      setTimeout(() => {
        toast.success(`Print completed for sale ${sale.id}`);
        console.log(`✅ Real-time: Print completed for sale ${sale.id}`);
      }, 2000);
    }, 1000);
  };

  const handleDownloadSale = (sale) => {
    toast.loading(`Downloading invoice for sale ${sale.id}...`);
    
    setTimeout(() => {
      // Simulate PDF download
      const filename = `invoice_${sale.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      const content = `Invoice content for sale ${sale.id}`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Invoice ${sale.id} downloaded successfully`);
      console.log('Download sale:', sale);
      
      // Real-time logging
      const logEntry = {
        action: 'download_invoice',
        saleId: sale.id,
        customerName: sale.customerName,
        filename,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('invoiceDownloaded', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`📄 Real-time: Invoice downloaded for sale ${sale.id}`);
    }, 800);
  };

  const handleDeleteSale = (sale) => {
    if (window.confirm(`Are you sure you want to delete sale ${sale.id}? This action cannot be undone.`)) {
      toast.loading(`Deleting sale ${sale.id}...`);
      
      setTimeout(() => {
        // Remove sale from state
        setSales(prev => prev.filter(s => s.id !== sale.id));
        
        toast.success(`Sale ${sale.id} deleted successfully`);
        console.log('Delete sale:', sale);
        
        // Real-time logging
        const logEntry = {
          action: 'delete_sale',
          saleId: sale.id,
          customerName: sale.customerName,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: Date.now()
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('saleDeleted', { detail: logEntry }));
        window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
        
        console.log(`🗑️ Real-time: Sale ${sale.id} deleted`);
      }, 1200);
    }
  };

  const handleGenerateInvoice = (sale) => {
    toast.loading(`Generating invoice for sale ${sale.id}...`);
    
    setTimeout(() => {
      // Simulate invoice generation
      const invoiceNumber = sale.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      toast.success(`Invoice ${invoiceNumber} generated successfully`);
      console.log('Generate invoice:', sale);
      
      // Real-time logging
      const logEntry = {
        action: 'generate_invoice',
        saleId: sale.id,
        customerName: sale.customerName,
        invoiceNumber,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('invoiceGenerated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`📄 Real-time: Invoice ${invoiceNumber} generated for sale ${sale.id}`);
      
      // Update sale with new invoice number
      setSales(prev => prev.map(s => 
        s.id === sale.id ? { ...s, invoiceNumber } : s
      ));
    }, 1000);
  };

  const handleSaveEdit = () => {
    if (!selectedSale) return;
    
    console.log('=== Saving sale changes ===');
    console.log('Selected sale:', selectedSale);
    console.log('Form data:', editFormData);
    
    toast.loading(`Saving changes for sale ${selectedSale.id}...`);
    
    // Prepare data for API
    const saleData = {
      customerName: editFormData.customerName,
      customerEmail: editFormData.customerEmail,
      amount: editFormData.amount,
      status: editFormData.status,
      paymentStatus: editFormData.paymentStatus,
      paymentMethod: editFormData.paymentMethod,
      salesAgent: editFormData.salesAgent,
      notes: editFormData.notes
    };
    
    console.log('Prepared sale data for API:', saleData);
    
    // Update local state immediately for visibility
    setSales(prev => {
      const updatedSales = prev.map(s => 
        s.id === selectedSale.id 
          ? { 
              ...s, 
              ...saleData
            } 
          : s
      );
      console.log('✅ Updated sales array (immediate):', updatedSales);
      return updatedSales;
    });
    
    // Call API mutation for database sync
    updateSaleMutation.mutate(
      { id: selectedSale.id, data: saleData },
      {
        onSuccess: (response) => {
          console.log('✅ API call successful:', response);
          setShowEditModal(false);
          toast.success(`Sale ${selectedSale.id} updated successfully`);
          
          // Real-time logging
          const logEntry = {
            action: 'update_sale',
            saleId: selectedSale.id,
            customerName: editFormData.customerName,
            changes: saleData,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            sessionId: Date.now()
          };
          
          const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
          existingLogs.push(logEntry);
          localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
          
          console.log(`💾 Real-time: Sale ${selectedSale.id} updated with database sync`, saleData);
        },
        onError: (error) => {
          console.error('❌ API call failed:', error);
          // Revert changes on error
          setSales(prev => prev.map(s => 
            s.id === selectedSale.id ? selectedSale : s
          ));
          toast.error('Failed to save changes. Please try again.');
        }
      }
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
            <h1 className="page-title">All Sales</h1>
            <p className="page-subtitle">View and manage all sales transactions</p>
          </div>
          {canManageSales && (
            <button 
              onClick={() => navigate('/sales/pos')}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Sale</span>
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
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
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
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{cancelledSales}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-red-600" />
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
                placeholder="Search sales..."
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
                  Sale ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.id}</div>
                      <div className="text-xs text-gray-500">{sale.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                      <div className="text-xs text-gray-500">{sale.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.date}</div>
                      <div className="text-xs text-gray-500">{sale.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${sale.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{sale.items} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(sale.paymentStatus)}`}>
                        {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.salesAgent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canManageSales && (
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setEditFormData({
                                customerName: sale.customerName,
                                customerEmail: sale.customerEmail,
                                amount: sale.amount,
                                status: sale.status,
                                paymentStatus: sale.paymentStatus,
                                paymentMethod: sale.paymentMethod,
                                salesAgent: sale.salesAgent,
                                notes: sale.notes || ''
                              });
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
                              ['ID', 'Customer', 'Email', 'Date', 'Amount', 'Status', 'Payment Status', 'Sales Agent'],
                              [sale.id, sale.customerName, sale.customerEmail, sale.date, sale.amount, sale.status, sale.paymentStatus, sale.salesAgent]
                            ];
                            const csv = data.map(row => row.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `sale-${sale.id}.csv`;
                            link.click();
                            URL.revokeObjectURL(url);
                            toast.success('Sale downloaded successfully');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                        {canDeleteSales && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete sale ${sale.id}?`)) {
                                toast.success(`Sale ${sale.id} deleted`);
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
                            const newStatus = sale.status === 'completed' ? 'pending' : 'completed';
                            toast.success(`Sale ${sale.id} status updated to ${newStatus}`);
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
              <h3 className="text-lg font-semibold text-gray-900">Sale Details - {selectedSale.id}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-sm text-gray-900">{selectedSale.customerName}</p>
                <p className="text-xs text-gray-500">{selectedSale.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date & Time</p>
                <p className="text-sm text-gray-900">{selectedSale.date} at {selectedSale.time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-sm font-medium text-gray-900">${selectedSale.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{selectedSale.items} items</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Invoice Number</p>
                <p className="text-sm text-gray-900">{selectedSale.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sales Agent</p>
                <p className="text-sm text-gray-900">{selectedSale.salesAgent}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <p className="text-sm text-gray-900">{selectedSale.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSale.status)}`}>
                  {selectedSale.status.charAt(0).toUpperCase() + selectedSale.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedSale.paymentStatus)}`}>
                  {selectedSale.paymentStatus.charAt(0).toUpperCase() + selectedSale.paymentStatus.slice(1)}
                </span>
              </div>
            </div>

            {selectedSale.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900 mt-1">{selectedSale.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {canManageSales && (
                <button 
                  onClick={() => handleGenerateInvoice(selectedSale)}
                  className="btn btn-primary"
                >
                  Generate Invoice
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Sale Modal */}
      {showEditModal && selectedSale && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Sale - {selectedSale.id}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editFormData.customerName}
                  onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                <input
                  type="email"
                  value={editFormData.customerEmail}
                  onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="input"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={editFormData.paymentStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value })}
                  className="input"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <input
                  type="text"
                  value={editFormData.paymentMethod}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Agent</label>
                <input
                  type="text"
                  value={editFormData.salesAgent}
                  onChange={(e) => setEditFormData({ ...editFormData, salesAgent: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                className="input"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AllSales;
