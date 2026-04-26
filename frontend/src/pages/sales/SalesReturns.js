import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
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
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SalesReturns = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    originalInvoice: '',
    customerName: '',
    returnDate: new Date().toISOString().split('T')[0],
    reason: 'defective',
    items: [],
    refundAmount: 0,
    refundMethod: 'credit',
    notes: ''
  });

  const canManageReturns = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteReturns = ['admin', 'manager'].includes(user?.role);

  // Mock returns data
  const [returns] = useState([
    {
      id: 'RET-001',
      originalInvoice: 'INV-2024-001',
      customerName: 'ABC Corporation',
      customerEmail: 'purchasing@abc.com',
      returnDate: '2024-04-22',
      returnTime: '10:30:00',
      reason: 'defective',
      items: [
        { name: 'Laptop Pro 15"', quantity: 2, price: 1299.99, reason: 'Screen defects' },
        { name: 'Wireless Mouse', quantity: 5, price: 29.99, reason: 'Not working' }
      ],
      originalAmount: 2874.95,
      refundAmount: 2874.95,
      refundMethod: 'credit_card',
      status: 'approved',
      processedBy: 'John Smith',
      notes: 'Customer reported multiple defective items',
      createdAt: '2024-04-22T10:30:00Z',
      processedAt: '2024-04-22T14:20:00Z'
    },
    {
      id: 'RET-002',
      originalInvoice: 'INV-2024-002',
      customerName: 'XYZ Retail Store',
      customerEmail: 'orders@xyz.com',
      returnDate: '2024-04-21',
      returnTime: '14:15:00',
      reason: 'wrong_item',
      items: [
        { name: 'Office Chair', quantity: 1, price: 299.99, reason: 'Wrong color delivered' }
      ],
      originalAmount: 299.99,
      refundAmount: 299.99,
      refundMethod: 'store_credit',
      status: 'approved',
      processedBy: 'Sarah Johnson',
      notes: 'Customer received wrong color chair',
      createdAt: '2024-04-21T14:15:00Z',
      processedAt: '2024-04-21T16:45:00Z'
    },
    {
      id: 'RET-003',
      originalInvoice: 'INV-2024-003',
      customerName: 'Tech Solutions Ltd',
      customerEmail: 'procurement@techsol.com',
      returnDate: '2024-04-20',
      returnTime: '09:45:00',
      reason: 'damaged',
      items: [
        { name: 'USB-C Cable', quantity: 10, price: 15.99, reason: 'Damaged during shipping' }
      ],
      originalAmount: 159.90,
      refundAmount: 159.90,
      refundMethod: 'bank_transfer',
      status: 'pending',
      processedBy: 'Mike Wilson',
      notes: 'Items arrived damaged to customer',
      createdAt: '2024-04-20T09:45:00Z',
      processedAt: null
    },
    {
      id: 'RET-004',
      originalInvoice: 'INV-2024-004',
      customerName: 'Local Business Inc',
      customerEmail: 'contact@localbusiness.com',
      returnDate: '2024-04-19',
      returnTime: '11:30:00',
      reason: 'no_longer_needed',
      items: [
        { name: 'Notebook Set', quantity: 3, price: 12.99, reason: 'Order cancelled' }
      ],
      originalAmount: 38.97,
      refundAmount: 38.97,
      refundMethod: 'cash',
      status: 'rejected',
      processedBy: 'Emily Davis',
      notes: 'Return rejected - policy violation',
      createdAt: '2024-04-19T11:30:00Z',
      processedAt: '2024-04-19T13:15:00Z'
    },
    {
      id: 'RET-005',
      originalInvoice: 'INV-2024-005',
      customerName: 'Global Trading Co',
      customerEmail: 'orders@globaltrading.com',
      returnDate: '2024-04-18',
      returnTime: '16:20:00',
      reason: 'defective',
      items: [
        { name: 'Keyboard', quantity: 2, price: 79.99, reason: 'Keys not responding' },
        { name: 'Pen Pack', quantity: 5, price: 8.99, reason: 'Poor quality' }
      ],
      originalAmount: 209.93,
      refundAmount: 209.93,
      refundMethod: 'credit_card',
      status: 'approved',
      processedBy: 'John Smith',
      notes: 'Multiple quality issues reported',
      createdAt: '2024-04-18T16:20:00Z',
      processedAt: '2024-04-19T09:30:00Z'
    }
  ]);

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        returnItem.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        returnItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || returnItem.status === filterStatus;
    const matchesReason = filterReason === 'all' || returnItem.reason === filterReason;
    const matchesDate = filterDateRange === 'all' || true; // Add date filtering logic if needed
    
    return matchesSearch && matchesStatus && matchesReason && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonName = (reason) => {
    switch (reason) {
      case 'defective':
        return 'Defective';
      case 'damaged':
        return 'Damaged';
      case 'wrong_item':
        return 'Wrong Item';
      case 'no_longer_needed':
        return 'No Longer Needed';
      case 'late_delivery':
        return 'Late Delivery';
      default:
        return 'Other';
    }
  };

  const getRefundMethodName = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      case 'store_credit':
        return 'Store Credit';
      default:
        return 'Other';
    }
  };

  const totalReturns = filteredReturns.length;
  const approvedReturns = filteredReturns.filter(r => r.status === 'approved').length;
  const pendingReturns = filteredReturns.filter(r => r.status === 'pending').length;
  const rejectedReturns = filteredReturns.filter(r => r.status === 'rejected').length;
  const totalRefundAmount = filteredReturns
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.refundAmount, 0);
  const pendingRefundAmount = filteredReturns
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const openDetailsModal = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailsModal(true);
  };

  const handleAddReturn = () => {
    // Validate form
    if (!formData.originalInvoice.trim()) {
      toast.error('Original invoice is required');
      return;
    }
    
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (formData.items.length === 0) {
      toast.error('At least one item must be returned');
      return;
    }

    console.log('Adding return:', formData);
    toast.success('Return request submitted successfully!');
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      originalInvoice: '',
      customerName: '',
      returnDate: new Date().toISOString().split('T')[0],
      reason: 'defective',
      items: [],
      refundAmount: 0,
      refundMethod: 'credit',
      notes: ''
    });
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
            <h1 className="page-title">Sales Returns</h1>
            <p className="page-subtitle">Manage customer returns and refunds</p>
          </div>
          {canManageReturns && (
            <button className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Process Return</span>
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
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedReturns}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-purple-600">${totalRefundAmount.toLocaleString()}</p>
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
                placeholder="Search returns..."
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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
            </select>
            
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reasons</option>
              <option value="defective">Defective</option>
              <option value="damaged">Damaged</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="no_longer_needed">No Longer Needed</option>
              <option value="late_delivery">Late Delivery</option>
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

      {/* Returns Table */}
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
                  Return ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
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
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No returns found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{returnItem.id}</div>
                      <div className="text-xs text-gray-500">{returnItem.items.length} items</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{returnItem.customerName}</div>
                      <div className="text-xs text-gray-500">{returnItem.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{returnItem.originalInvoice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getReasonName(returnItem.reason)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${returnItem.refundAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{getRefundMethodName(returnItem.refundMethod)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{returnItem.returnDate}</div>
                      <div className="text-xs text-gray-500">{returnItem.returnTime}</div>
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
                        {canManageReturns && (
                          <button
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
                              ['Return ID', 'Customer', 'Email', 'Original Invoice', 'Reason', 'Refund Amount', 'Status'],
                              [returnItem.id, returnItem.customerName, returnItem.customerEmail, returnItem.originalInvoice, returnItem.reason, returnItem.refundAmount, returnItem.status]
                            ];
                            const csv = data.map(row => row.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `return-${returnItem.id}.csv`;
                            link.click();
                            URL.revokeObjectURL(url);
                            toast.success('Return downloaded successfully');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        {canManageReturns && returnItem.status === 'pending' && (
                          <button
                            className="text-orange-600 hover:text-orange-900"
                            title="Process"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteReturns && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canManageReturns && returnItem.status === 'pending' && (
                          <button
                            onClick={() => {
                              toast.success(`Return ${returnItem.id} status updated to approved`);
                            }}
                            className="text-orange-600 hover:text-orange-900"
                            title="Update Status"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
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
              <h3 className="text-lg font-semibold text-gray-900">Return Details - {selectedReturn.id}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Return ID</p>
                <p className="text-sm text-gray-900">{selectedReturn.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Original Invoice</p>
                <p className="text-sm text-gray-900">{selectedReturn.originalInvoice}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-sm text-gray-900">{selectedReturn.customerName}</p>
                <p className="text-xs text-gray-500">{selectedReturn.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Return Reason</p>
                <p className="text-sm text-gray-900">{getReasonName(selectedReturn.reason)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Original Amount</p>
                <p className="text-sm text-gray-900">${selectedReturn.originalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Amount</p>
                <p className="text-sm text-gray-900">${selectedReturn.refundAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Method</p>
                <p className="text-sm text-gray-900">{getRefundMethodName(selectedReturn.refundMethod)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReturn.status)}`}>
                  {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Return Date</p>
                <p className="text-sm text-gray-900">{selectedReturn.returnDate} at {selectedReturn.returnTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processed By</p>
                <p className="text-sm text-gray-900">{selectedReturn.processedBy}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Returned Items</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedReturn.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedReturn.notes && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900 mt-1">{selectedReturn.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {selectedReturn.status === 'pending' && (
                <button className="btn btn-primary">
                  Approve Return
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Return Modal */}
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
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Process Return</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Invoice *</label>
                <input
                  type="text"
                  value={formData.originalInvoice}
                  onChange={(e) => setFormData({ ...formData, originalInvoice: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="defective">Defective</option>
                  <option value="damaged">Damaged</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="no_longer_needed">No Longer Needed</option>
                  <option value="late_delivery">Late Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                <input
                  type="number"
                  value={formData.refundAmount}
                  onChange={(e) => setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
                <select
                  value={formData.refundMethod}
                  onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="store_credit">Store Credit</option>
                </select>
              </div>

              <div className="md:col-span-2">
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
                onClick={handleAddReturn}
                className="btn btn-primary"
              >
                Process Return
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesReturns;
