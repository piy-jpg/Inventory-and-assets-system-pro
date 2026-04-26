import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const ReturnsToSupplier = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    purchaseOrderId: '',
    items: [],
    returnReason: 'damaged',
    description: '',
    quantity: 1,
    refundAmount: 0,
    refundMethod: 'credit',
    status: 'pending',
    expectedResolutionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const canManageReturns = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteReturns = ['admin', 'manager'].includes(user?.role);

  const queryClient = useQueryClient();

  // Real-time returns to supplier data
  const { data: returnsData, isLoading, refetch } = useQuery(
    'returnsToSupplier',
    () => {
      const storedReturns = localStorage.getItem('returnsToSupplier');
      if (storedReturns) {
        return JSON.parse(storedReturns);
      }
      
      return [
        {
          _id: 'RET_001',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          purchaseOrderId: 'PO_001',
          purchaseOrderNumber: 'PO-2024-001',
          items: [
            { name: 'Laptop Pro 15"', quantity: 1, unitPrice: 1199.99, total: 1199.99 }
          ],
          returnReason: 'damaged',
          description: 'Screen cracked during shipping',
          quantity: 1,
          refundAmount: 1199.99,
          refundMethod: 'credit',
          status: 'approved',
          expectedResolutionDate: '2024-04-30',
          actualResolutionDate: '2024-04-28',
          resolutionType: 'refund',
          notes: 'Customer reported damaged screen on arrival',
          requestedBy: 'John Smith',
          approvedBy: 'Sarah Johnson',
          createdAt: '2024-04-23T10:30:00Z',
          updatedAt: '2024-04-28T14:20:00Z'
        },
        {
          _id: 'RET_002',
          supplierId: 'SUP_002',
          supplierName: 'Office Furniture Co.',
          purchaseOrderId: 'PO_002',
          purchaseOrderNumber: 'PO-2024-002',
          items: [
            { name: 'Office Chair Ergonomic', quantity: 1, unitPrice: 389.99, total: 389.99 }
          ],
          returnReason: 'defective',
          description: 'Chair armrest broken',
          quantity: 1,
          refundAmount: 389.99,
          refundMethod: 'replacement',
          status: 'pending',
          expectedResolutionDate: '2024-05-05',
          actualResolutionDate: null,
          resolutionType: null,
          notes: 'Defective part identified during assembly',
          requestedBy: 'Mike Wilson',
          approvedBy: null,
          createdAt: '2024-04-25T09:15:00Z',
          updatedAt: '2024-04-25T09:15:00Z'
        },
        {
          _id: 'RET_003',
          supplierId: 'SUP_003',
          supplierName: 'Stationery World',
          purchaseOrderId: 'PO_003',
          purchaseOrderNumber: 'PO-2024-003',
          items: [
            { name: 'Notebook Set', quantity: 5, unitPrice: 12.99, total: 64.95 }
          ],
          returnReason: 'wrong_item',
          description: 'Received wrong color notebooks',
          quantity: 5,
          refundAmount: 64.95,
          refundMethod: 'credit',
          status: 'completed',
          expectedResolutionDate: '2024-04-26',
          actualResolutionDate: '2024-04-26',
          resolutionType: 'replacement',
          notes: 'Wrong color sent, replacement received',
          requestedBy: 'Sarah Johnson',
          approvedBy: 'John Smith',
          createdAt: '2024-04-22T14:45:00Z',
          updatedAt: '2024-04-26T11:30:00Z'
        },
        {
          _id: 'RET_004',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          purchaseOrderId: 'PO_004',
          purchaseOrderNumber: 'PO-2024-004',
          items: [
            { name: 'Wireless Mouse', quantity: 2, unitPrice: 24.99, total: 49.98 }
          ],
          returnReason: 'damaged',
          description: 'Mice not working properly',
          quantity: 2,
          refundAmount: 49.98,
          refundMethod: 'refund',
          status: 'rejected',
          expectedResolutionDate: null,
          actualResolutionDate: '2024-04-24',
          resolutionType: 'rejected',
          notes: 'Supplier claims damage due to improper handling',
          requestedBy: 'Mike Wilson',
          approvedBy: 'John Smith',
          createdAt: '2024-04-20T16:20:00Z',
          updatedAt: '2024-04-24T10:15:00Z'
        }
      ];
    },
    {
      refetchInterval: 11000, // Real-time refresh every 11 seconds
      onSuccess: (data) => {
        console.log('Returns to supplier data refreshed:', data);
      }
    }
  );

  // Get suppliers data for dropdown
  const { data: suppliersData } = useQuery(
    'suppliers',
    () => {
      const storedSuppliers = localStorage.getItem('suppliers');
      return storedSuppliers ? JSON.parse(storedSuppliers) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Get purchase orders data for dropdown
  const { data: purchaseOrdersData } = useQuery(
    'purchaseOrders',
    () => {
      const storedOrders = localStorage.getItem('purchaseOrders');
      return storedOrders ? JSON.parse(storedOrders) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Mutation for creating new return
  const createReturnMutation = useMutation(
    async (returnData) => {
      const returns = returnsData || [];
      const newReturn = {
        ...returnData,
        _id: `RET_${Date.now()}`,
        supplierName: suppliersData.find(s => s._id === returnData.supplierId)?.name || 'Unknown Supplier',
        purchaseOrderNumber: purchaseOrdersData.find(po => po._id === returnData.purchaseOrderId)?.orderNumber || 'Unknown PO',
        requestedBy: 'Current User',
        approvedBy: null,
        actualResolutionDate: null,
        resolutionType: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedReturns = [...returns, newReturn];
      localStorage.setItem('returnsToSupplier', JSON.stringify(updatedReturns));
      queryClient.setQueryData('returnsToSupplier', updatedReturns);
      
      // Real-time logging
      const logEntry = {
        action: 'create_return',
        returnId: newReturn._id,
        supplierId: returnData.supplierId,
        refundAmount: returnData.refundAmount,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierReturnLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierReturnLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierReturnCreated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierReturnsActivityUpdate', { detail: logEntry }));
      
      console.log('📦 Real-time: Supplier return created', logEntry);
      
      return newReturn;
    },
    {
      onSuccess: () => {
        toast.success('Return request created successfully');
        setShowReturnModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create return request');
      }
    }
  );

  // Mutation for updating return status
  const updateReturnStatusMutation = useMutation(
    async ({ returnId, status, resolutionType }) => {
      const returns = returnsData || [];
      const updatedReturns = returns.map(returnItem => 
        returnItem._id === returnId ? {
          ...returnItem,
          status,
          resolutionType,
          actualResolutionDate: status === 'completed' ? new Date().toISOString().split('T')[0] : returnItem.actualResolutionDate,
          approvedBy: status === 'approved' ? 'Current User' : returnItem.approvedBy,
          updatedAt: new Date().toISOString()
        } : returnItem
      );
      localStorage.setItem('returnsToSupplier', JSON.stringify(updatedReturns));
      queryClient.setQueryData('returnsToSupplier', updatedReturns);
      
      // Real-time logging
      const logEntry = {
        action: 'update_return_status',
        returnId,
        status,
        resolutionType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierReturnLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierReturnLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierReturnStatusUpdated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierReturnsActivityUpdate', { detail: logEntry }));
      
      console.log('🔄 Real-time: Supplier return status updated', logEntry);
      
      return updatedReturns;
    },
    {
      onSuccess: () => {
        toast.success('Return status updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update return status');
      }
    }
  );

  const returns = returnsData || [];
  const suppliers = suppliersData || [];
  const purchaseOrders = purchaseOrdersData || [];

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        returnItem.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        returnItem.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || returnItem.status === filterStatus;
    const matchesSupplier = filterSupplier === 'all' || returnItem.supplierId === filterSupplier;
    const matchesReason = filterReason === 'all' || returnItem.returnReason === filterReason;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesReason;
  });

  const resetForm = () => {
    setFormData({
      supplierId: '',
      purchaseOrderId: '',
      items: [],
      returnReason: 'damaged',
      description: '',
      quantity: 1,
      refundAmount: 0,
      refundMethod: 'credit',
      status: 'pending',
      expectedResolutionDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openDetailsModal = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailsModal(true);
  };

  const openReturnModal = () => {
    resetForm();
    setShowReturnModal(true);
  };

  const handleCreateReturn = () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (!formData.purchaseOrderId) {
      toast.error('Please select a purchase order');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    createReturnMutation.mutate(formData);
  };

  const handleUpdateStatus = (status, resolutionType = null) => {
    if (!selectedReturn) return;

    updateReturnStatusMutation.mutate({
      returnId: selectedReturn._id,
      status,
      resolutionType
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Returns data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'damaged':
        return 'bg-red-100 text-red-800';
      case 'defective':
        return 'bg-orange-100 text-orange-800';
      case 'wrong_item':
        return 'bg-purple-100 text-purple-800';
      case 'quality_issue':
        return 'bg-yellow-100 text-yellow-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalReturns = returns.length;
  const pendingReturns = returns.filter(returnItem => returnItem.status === 'pending').length;
  const approvedReturns = returns.filter(returnItem => returnItem.status === 'approved').length;
  const completedReturns = returns.filter(returnItem => returnItem.status === 'completed').length;
  const totalRefundAmount = returns.reduce((sum, returnItem) => sum + returnItem.refundAmount, 0);

  // Return reason breakdown
  const reasonBreakdown = returns.reduce((acc, returnItem) => {
    acc[returnItem.returnReason] = (acc[returnItem.returnReason] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Returns to Supplier</h1>
            <p className="page-subtitle">Return damaged goods, Track return status, Refund/adjustment handling</p>
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
              onClick={openReturnModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Return</span>
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
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">{totalReturns}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingReturns}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedReturns}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refund Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalRefundAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Return Reason Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {Object.entries(reasonBreakdown).map(([reason, count]) => (
          <div key={reason} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {reason.replace('_', ' ').charAt(0).toUpperCase() + reason.replace('_', ' ').slice(1)}
                </p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </div>
        ))}
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
                placeholder="Search returns..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              className="input"
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
            >
              <option value="all">All Reasons</option>
              <option value="damaged">Damaged</option>
              <option value="defective">Defective</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="other">Other</option>
            </select>
            
            <select
              className="input"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Returns Table */}
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
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
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
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colCols="8" className="px-6 py-4 text-center text-gray-500">
                    No returns found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((returnItem) => (
                  <tr key={returnItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{returnItem.purchaseOrderNumber}</div>
                      <div className="text-xs text-gray-500">Requested: {new Date(returnItem.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{returnItem.supplierName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(returnItem.returnReason)}`}>
                        {returnItem.returnReason.replace('_', ' ').charAt(0).toUpperCase() + returnItem.returnReason.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{returnItem.items.length} items</div>
                      <div className="text-xs text-gray-500">
                        {returnItem.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.name}
                            {index < Math.min(2, returnItem.items.length) - 1 && ', '}
                          </span>
                        ))}
                        {returnItem.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${returnItem.refundAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{returnItem.refundMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(returnItem)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
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

      {/* Create Return Modal */}
      {showReturnModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowReturnModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Return Request</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateReturn();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order *</label>
                  <select
                    value={formData.purchaseOrderId}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseOrderId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a purchase order</option>
                    {purchaseOrders
                      .filter(po => po.supplierId === formData.supplierId || !formData.supplierId)
                      .map(po => (
                        <option key={po._id} value={po._id}>
                          {po.orderNumber}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason *</label>
                  <select
                    value={formData.returnReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnReason: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="damaged">Damaged</option>
                    <option value="defective">Defective</option>
                    <option value="wrong_item">Wrong Item</option>
                    <option value="quality_issue">Quality Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Describe the issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="input"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.refundAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, refundAmount: parseFloat(e.target.value) || 0 }))}
                      className="input"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
                  <select
                    value={formData.refundMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, refundMethod: e.target.value }))}
                    className="input"
                  >
                    <option value="credit">Credit Note</option>
                    <option value="refund">Cash Refund</option>
                    <option value="replacement">Replacement</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Resolution Date</label>
                  <input
                    type="date"
                    value={formData.expectedResolutionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedResolutionDate: e.target.value }))}
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
                    placeholder="Add any additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createReturnMutation.isLoading}
                >
                  {createReturnMutation.isLoading ? 'Creating...' : 'Create Return'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Return Details Modal */}
      {showDetailsModal && selectedReturn && (
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
              <h3 className="text-lg font-semibold text-gray-900">Return Details - {selectedReturn.purchaseOrderNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Order</p>
                <p className="text-sm text-gray-900">{selectedReturn.purchaseOrderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedReturn.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReturn.status)}`}>
                  {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Return Reason</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(selectedReturn.returnReason)}`}>
                  {selectedReturn.returnReason.replace('_', ' ').charAt(0).toUpperCase() + selectedReturn.returnReason.replace('_', ' ').slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Amount</p>
                <p className="text-sm font-medium text-gray-900">${selectedReturn.refundAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Method</p>
                <p className="text-sm text-gray-900 capitalize">{selectedReturn.refundMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Requested By</p>
                <p className="text-sm text-gray-900">{selectedReturn.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved By</p>
                <p className="text-sm text-gray-900">{selectedReturn.approvedBy || 'Not approved yet'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Resolution</p>
                <p className="text-sm text-gray-900">{selectedReturn.expectedResolutionDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Actual Resolution</p>
                <p className="text-sm text-gray-900">{selectedReturn.actualResolutionDate || 'Pending'}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Returned Items</p>
              <div className="space-y-2">
                {selectedReturn.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${item.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">${item.unitPrice.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedReturn.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">{selectedReturn.description}</p>
              </div>
            )}

            {selectedReturn.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedReturn.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedReturn.createdAt).toLocaleString()}
                {selectedReturn.updatedAt !== selectedReturn.createdAt && (
                  <span> | Updated: {new Date(selectedReturn.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                {selectedReturn.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('approved')}
                      className="btn btn-primary btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('rejected')}
                      className="btn btn-outline btn-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedReturn.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus('completed', 'replacement')}
                    className="btn btn-primary btn-sm"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReturnsToSupplier;
