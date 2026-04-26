import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ArrowPathIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { stockTransfersAPI } from '../services/api';
import toast from 'react-hot-toast';
import StockTransferForm from '../components/StockTransferForm';
import { useAuth } from '../hooks/useAuth';

const StockTransfers = ({ initialShowForm = false }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(initialShowForm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFromWarehouse, setFilterFromWarehouse] = useState('all');
  const [filterToWarehouse, setFilterToWarehouse] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState(null);
  const [selectedTransfers, setSelectedTransfers] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const canManageTransfers = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteTransfers = ['admin', 'manager'].includes(user?.role);

  // Direct data fetch without React Query
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setIsLoading(true);
        const result = await stockTransfersAPI.getAll();
        console.log('API Response:', result);
        const transferData = result?.data?.data?.transfers || [];
        console.log('Extracted transfers:', transferData);
        console.log('Transfer count:', transferData.length);
        setTransfers(transferData);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const result = await stockTransfersAPI.getAll();
      const transferData = result?.data?.data?.transfers || [];
      setTransfers(transferData);
      toast.success('Data refreshed successfully');
      
      // Trigger real-time event
      window.dispatchEvent(new CustomEvent('stockTransfersDataRefreshed', { detail: { timestamp: new Date().toISOString(), count: transferData.length } }));
      console.log('🔄 Real-time: Stock transfers data refreshed', { count: transferData.length });
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const result = await stockTransfersAPI.updateStatus(id, status);
      if (result.data.success) {
        toast.success(result.data.message || 'Transfer status updated');
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('stockTransferStatusUpdated', { detail: { id, status } }));
        window.dispatchEvent(new CustomEvent('transfersActivityUpdate', { detail: { action: 'status_update', transferId: id, status } }));
        console.log('🔄 Real-time: Transfer status updated', { id, status });
        
        handleRefresh();
      } else {
        toast.error(result.data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleViewTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setShowViewModal(true);
  };

  const handleEditTransfer = (transfer) => {
    toast.loading(`Opening editor for transfer ${transfer.transferNumber || transfer._id}...`);
    
    setTimeout(() => {
      setSelectedTransfer(transfer);
      setShowEditModal(true);
      
      toast.success(`Edit mode activated for transfer ${transfer.transferNumber || transfer._id}`);
      console.log('✏️ Real-time: Transfer opened for editing', transfer);
      
      // Trigger real-time event
      window.dispatchEvent(new CustomEvent('stockTransferEditOpened', { detail: transfer }));
    }, 600);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setShowEditModal(false);
    handleRefresh();
    
    // Trigger real-time event
    window.dispatchEvent(new CustomEvent('stockTransferUpdated', { detail: { timestamp: new Date().toISOString() } }));
    console.log('✅ Real-time: Transfer form submitted, refreshing data');
  };

  const handleDeleteTransfer = (transfer) => {
    setTransferToDelete(transfer);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!transferToDelete) return;
    
    try {
      await stockTransfersAPI.delete(transferToDelete._id);
      toast.success('Transfer deleted successfully');
      setTransfers(transfers.filter(t => t._id !== transferToDelete._id));
      setShowDeleteDialog(false);
      setTransferToDelete(null);
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('stockTransferDeleted', { detail: transferToDelete }));
      window.dispatchEvent(new CustomEvent('transfersActivityUpdate', { detail: { action: 'delete', transferId: transferToDelete._id } }));
      console.log('🗑️ Real-time: Transfer deleted', transferToDelete);
    } catch (err) {
      toast.error('Failed to delete transfer');
    }
  };

  const handleSelectTransfer = (transferId) => {
    const newSelected = new Set(selectedTransfers);
    if (newSelected.has(transferId)) {
      newSelected.delete(transferId);
    } else {
      newSelected.add(transferId);
    }
    setSelectedTransfers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedTransfers.size === filteredTransfers.length) {
      setSelectedTransfers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedTransfers(new Set(filteredTransfers.map(t => t._id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedTransfers.size === 0) return;
    
    try {
      const promises = Array.from(selectedTransfers).map(id => 
        stockTransfersAPI.updateStatus(id, status)
      );
      await Promise.all(promises);
      toast.success(`${selectedTransfers.size} transfers updated to ${status}`);
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('stockTransferBulkStatusUpdated', { detail: { transferIds: Array.from(selectedTransfers), status } }));
      window.dispatchEvent(new CustomEvent('transfersActivityUpdate', { detail: { action: 'bulk_status_update', transferIds: Array.from(selectedTransfers), status } }));
      console.log('🔄 Real-time: Bulk status update', { transferIds: Array.from(selectedTransfers), status });
      
      setSelectedTransfers(new Set());
      setShowBulkActions(false);
      handleRefresh();
    } catch (err) {
      toast.error('Failed to update transfers');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransfers.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedTransfers.size} selected transfers?`)) {
      return;
    }
    
    try {
      const promises = Array.from(selectedTransfers).map(id => 
        stockTransfersAPI.delete(id)
      );
      await Promise.all(promises);
      toast.success(`${selectedTransfers.size} transfers deleted`);
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('stockTransferBulkDeleted', { detail: { transferIds: Array.from(selectedTransfers) } }));
      window.dispatchEvent(new CustomEvent('transfersActivityUpdate', { detail: { action: 'bulk_delete', transferIds: Array.from(selectedTransfers) } }));
      console.log('🗑️ Real-time: Bulk delete', { transferIds: Array.from(selectedTransfers) });
      
      setSelectedTransfers(new Set());
      setShowBulkActions(false);
      handleRefresh();
    } catch (err) {
      toast.error('Failed to delete transfers');
    }
  };

  const handleBulkEdit = () => {
    if (selectedTransfers.size !== 1) {
      return toast.error('Please select exactly one transfer to edit');
    }
    
    const transferId = Array.from(selectedTransfers)[0];
    const transfer = transfers.find(t => t._id === transferId);
    
    if (transfer) {
      handleEditTransfer(transfer);
      setSelectedTransfers(new Set());
      setShowBulkActions(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Transfer ID', 'From Warehouse', 'To Warehouse', 'Status', 'Date', 'Items', 'Value', 'Carrier'],
      ...filteredTransfers.map(t => [
        t.transfer_id,
        t.from_warehouse?.name || '',
        t.to_warehouse?.name || '',
        t.status,
        new Date(t.date).toLocaleDateString(),
        t.total_items,
        t.total_value,
        t.carrier || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_transfers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Stock transfers exported successfully');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Stock Transfers Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; }
            .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .status-completed { background-color: #d1fae5; color: #065f46; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-in_transit { background-color: #dbeafe; color: #1e40af; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            .summary { margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
            .summary-item { margin-bottom: 5px; }
            @media print { body { margin: 10px; } }
          </style>
        </head>
        <body>
          <h1>Stock Transfers Report</h1>
          <div class="summary">
            <div class="summary-item"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
            <div class="summary-item"><strong>Total Transfers:</strong> ${filteredTransfers.length}</div>
            <div class="summary-item"><strong>Completed:</strong> ${filteredTransfers.filter(t => t.status === 'completed').length}</div>
            <div class="summary-item"><strong>In Transit:</strong> ${filteredTransfers.filter(t => t.status === 'in_transit').length}</div>
            <div class="summary-item"><strong>Total Value:</strong> ${formatCurrency(filteredTransfers.reduce((sum, t) => sum + (t.total_value || 0), 0))}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>From Warehouse</th>
                <th>To Warehouse</th>
                <th>Status</th>
                <th>Date</th>
                <th>Items</th>
                <th>Value</th>
                <th>Carrier</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransfers.map(t => `
                <tr>
                  <td>${t.transfer_id}</td>
                  <td>${t.from_warehouse?.name || ''}</td>
                  <td>${t.to_warehouse?.name || ''}</td>
                  <td><span class="status-badge status-${t.status}">${t.status.replace('_', ' ')}</span></td>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.total_items}</td>
                  <td>${formatCurrency(t.total_value || 0)}</td>
                  <td>${t.carrier || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    toast.success('Print report generated');
  };

  // Apply all filters to get filtered transfers
  const filteredTransfers = transfers.filter(transfer => {
    // Search filter - Enhanced with better null checks and debugging
    const searchLower = search.toLowerCase();
    const searchMatch = search === '' || 
      transfer.transfer_id?.toLowerCase().includes(searchLower) ||
      transfer.from_warehouse?.name?.toLowerCase().includes(searchLower) ||
      transfer.to_warehouse?.name?.toLowerCase().includes(searchLower) ||
      transfer.carrier?.toLowerCase().includes(searchLower) ||
      transfer.notes?.toLowerCase().includes(searchLower) ||
      // Add additional searchable fields
      transfer.status?.toLowerCase().includes(searchLower) ||
      transfer.total_items?.toString().includes(searchLower) ||
      transfer.total_value?.toString().includes(searchLower);

    // Status filter
    const statusMatch = filterStatus === 'all' || transfer.status === filterStatus;

    // Date range filter
    let dateMatch = true;
    if (dateRange.startDate || dateRange.endDate) {
      const transferDate = new Date(transfer.date);
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        dateMatch = dateMatch && transferDate >= startDate;
      }
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        dateMatch = dateMatch && transferDate <= endDate;
      }
    }

    // Warehouse filters
    const fromWarehouseMatch = filterFromWarehouse === 'all' || 
      transfer.from_warehouse?.name === filterFromWarehouse ||
      transfer.from_warehouse?.id === filterFromWarehouse;

    const toWarehouseMatch = filterToWarehouse === 'all' || 
      transfer.to_warehouse?.name === filterToWarehouse ||
      transfer.to_warehouse?.id === filterToWarehouse;

    const result = searchMatch && statusMatch && dateMatch && fromWarehouseMatch && toWarehouseMatch;
    
    // Optional: Log search results for debugging
    if (search !== '' && transfers.length > 0) {
      console.log(`Search "${search}": ${filteredTransfers.length} results from ${transfers.length} transfers`);
    }
    
    return result;
  });

  // Get unique warehouse names for dropdowns
  const warehouseNames = [...new Set([
    ...transfers.map(t => t.from_warehouse?.name).filter(Boolean),
    ...transfers.map(t => t.to_warehouse?.name).filter(Boolean)
  ])].sort();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border bg-green-100 text-green-800 border-green-200">
          <CheckCircleIcon className="h-3 w-3 mr-1" /> Completed
        </span>;
      case 'in_transit': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border bg-blue-100 text-blue-800 border-blue-200">
          <TruckIcon className="h-3 w-3 mr-1" /> In Transit
        </span>;
      case 'pending': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border bg-yellow-100 text-yellow-800 border-yellow-200">
          <ClockIcon className="h-3 w-3 mr-1" /> Pending
        </span>;
      case 'cancelled': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border bg-red-100 text-red-800 border-red-200">
          <XCircleIcon className="h-3 w-3 mr-1" /> Cancelled
        </span>;
      default: 
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading stock transfers</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Transfers</h1>
          <p className="mt-1 text-sm text-gray-500">Move products between warehouses and track shipments</p>
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-400">
            Debug: {transfers.length} transfers loaded | Loading: {isLoading ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh} 
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button 
            onClick={handleExport} 
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button 
            onClick={handlePrint} 
            className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Print
          </button>
          <button 
            onClick={() => {
              console.log('Test search - setting search to "TRF"');
              setSearch('TRF');
            }} 
            className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Test Search
          </button>
          {canManageTransfers && (
            <button 
              onClick={() => setShowForm(true)} 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Transfer
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransfers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTransfers.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTransfers.filter(t => t.status === 'in_transit').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredTransfers.reduce((sum, t) => sum + (t.total_value || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Debug Indicator */}
      {search !== '' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Searching for: <span className="font-semibold">"{search}"</span>
              </span>
            </div>
            <span className="text-sm text-yellow-700">
              Found {filteredTransfers.length} results
            </span>
          </div>
          <div className="mt-2 text-xs text-yellow-600">
            Try searching for: "TRF", "Main", "Warehouse", "completed", "Laptop"
          </div>
        </div>
      )}

      {/* Filter Results Indicator */}
      {(search || filterStatus !== 'all' || filterFromWarehouse !== 'all' || filterToWarehouse !== 'all' || dateRange.startDate || dateRange.endDate) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FunnelIcon className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Showing <span className="font-semibold">{filteredTransfers.length}</span> of <span className="font-semibold">{transfers.length}</span> transfers
              </span>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('all');
                setFilterFromWarehouse('all');
                setFilterToWarehouse('all');
                setDateRange({ startDate: '', endDate: '' });
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transfers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearch('');
                  }
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterFromWarehouse}
              onChange={(e) => setFilterFromWarehouse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">From Warehouse</option>
              {warehouseNames.map(warehouse => (
                <option key={warehouse} value={warehouse}>{warehouse}</option>
              ))}
            </select>
            <select
              value={filterToWarehouse}
              onChange={(e) => setFilterToWarehouse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">To Warehouse</option>
              {warehouseNames.map(warehouse => (
                <option key={warehouse} value={warehouse}>{warehouse}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="End date"
              />
              {(search || filterStatus !== 'all' || filterFromWarehouse !== 'all' || filterToWarehouse !== 'all' || dateRange.startDate || dateRange.endDate) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterStatus('all');
                    setFilterFromWarehouse('all');
                    setFilterToWarehouse('all');
                    setDateRange({ startDate: '', endDate: '' });
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {selectedTransfers.size} transfer{selectedTransfers.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {canManageTransfers && (
                <button
                  onClick={() => handleBulkStatusUpdate('pending')}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Pending
                </button>
              )}
              {canManageTransfers && (
                <button
                  onClick={() => handleBulkStatusUpdate('in_transit')}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  In Transit
                </button>
              )}
              {canManageTransfers && (
                <button
                  onClick={() => handleBulkStatusUpdate('completed')}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}
              {canManageTransfers && (
                <button
                  onClick={() => handleBulkStatusUpdate('cancelled')}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              {canDeleteTransfers && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedTransfers(new Set());
                  setShowBulkActions(false);
                }}
                className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectedTransfers.size === filteredTransfers.length && filteredTransfers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTransfers.has(transfer._id)}
                      onChange={() => handleSelectTransfer(transfer._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{transfer.transfer_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transfer.from_warehouse?.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {transfer.from_warehouse?.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transfer.to_warehouse?.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {transfer.to_warehouse?.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transfer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transfer.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transfer.total_items} items
                    </div>
                    <div className="text-xs text-gray-500">
                      {transfer.items?.length} products
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transfer.total_value)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transfer.carrier}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewTransfer(transfer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {canManageTransfers && transfer.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(transfer._id, 'in_transit')} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ship
                        </button>
                      )}
                      {canManageTransfers && transfer.status === 'in_transit' && (
                        <button 
                          onClick={() => handleStatusUpdate(transfer._id, 'completed')} 
                          className="text-green-600 hover:text-green-900"
                        >
                          Receive
                        </button>
                      )}
                      {canManageTransfers && transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleStatusUpdate(transfer._id, 'cancelled')} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      {canDeleteTransfers && (
                        <button 
                          onClick={() => handleDeleteTransfer(transfer)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Transfer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransfers.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stock transfers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {transfers.length === 0 
                ? "Get started by creating a new transfer." 
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {transfers.length > 0 && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterStatus('all');
                  setFilterFromWarehouse('all');
                  setFilterToWarehouse('all');
                  setDateRange({ startDate: '', endDate: '' });
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Transfer Modal */}
      {showViewModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Transfer Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transfer ID</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedTransfer.transfer_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">{getStatusBadge(selectedTransfer.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">From Warehouse</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedTransfer.from_warehouse?.name}</p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {selectedTransfer.from_warehouse?.location}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{selectedTransfer.from_warehouse?.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">To Warehouse</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedTransfer.to_warehouse?.name}</p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {selectedTransfer.to_warehouse?.location}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{selectedTransfer.to_warehouse?.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transfer Date</h3>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(selectedTransfer.date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Expected Delivery</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedTransfer.expected_delivery ? formatDate(selectedTransfer.expected_delivery) : 'Not set'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedTransfer.total_items}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedTransfer.total_value)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Carrier</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedTransfer.carrier || 'Not assigned'}</p>
                </div>
              </div>

              {selectedTransfer.tracking_number && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedTransfer.tracking_number}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedTransfer.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.total_cost)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTransfer.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="text-gray-700 mt-1">{selectedTransfer.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && transferToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">Delete Transfer</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete transfer <span className="font-semibold">{transferToDelete.transfer_id}</span>? 
                This will permanently remove the transfer record from the system.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Transfer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create/Edit Transfer Form Modal */}
      {(showForm || showEditModal) && (
        <StockTransferForm
          onClose={() => {
            setShowForm(false);
            setShowEditModal(false);
          }}
          onSuccess={handleFormSuccess}
          transfer={showEditModal ? selectedTransfer : null}
        />
      )}
    </motion.div>
  );
};

export default StockTransfers;
