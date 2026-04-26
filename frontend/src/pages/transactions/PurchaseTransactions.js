import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const PurchaseTransactions = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'bank_transfer',
    status: 'pending',
    expectedDelivery: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const canManagePurchaseTransactions = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeletePurchaseTransactions = ['admin', 'manager'].includes(user?.role);

  // Real-time purchase transactions data
  const { data: purchasesData, isLoading, refetch } = useQuery(
    'purchaseTransactions',
    () => {
      const storedPurchases = localStorage.getItem('purchaseTransactions');
      if (storedPurchases) {
        return JSON.parse(storedPurchases);
      }
      
      return [
        {
          _id: 'PUR_001',
          purchaseOrderNumber: 'PO-2024-001',
          billNumber: 'BILL-2024-001',
          supplierName: 'Tech Supplies Inc.',
          supplierEmail: 'orders@techsupplies.com',
          supplierPhone: '+1-555-0201',
          items: [
            { name: 'Laptop Pro 15"', quantity: 5, price: 1199.99, total: 5999.95 },
            { name: 'Wireless Mouse', quantity: 10, price: 24.99, total: 249.90 }
          ],
          subtotal: 6249.85,
          tax: 749.98,
          discount: 200.00,
          total: 6799.83,
          paymentMethod: 'bank_transfer',
          status: 'completed',
          date: '2024-04-23',
          time: '10:30:00',
          expectedDelivery: '2024-04-25',
          actualDelivery: '2024-04-24',
          purchaseManager: 'Mike Wilson',
          notes: 'Urgent delivery requested',
          createdAt: '2024-04-23T10:30:00Z',
          updatedAt: '2024-04-24T09:15:00Z'
        },
        {
          _id: 'PUR_002',
          purchaseOrderNumber: 'PO-2024-002',
          billNumber: 'BILL-2024-002',
          supplierName: 'Office Furniture Co.',
          supplierEmail: 'sales@officefurniture.com',
          supplierPhone: '+1-555-0202',
          items: [
            { name: 'Office Chair Ergonomic', quantity: 3, price: 349.99, total: 1049.97 },
            { name: 'Conference Table', quantity: 1, price: 1499.99, total: 1499.99 }
          ],
          subtotal: 2549.96,
          tax: 305.99,
          discount: 100.00,
          total: 2755.95,
          paymentMethod: 'credit',
          status: 'pending',
          date: '2024-04-22',
          time: '14:45:00',
          expectedDelivery: '2024-04-26',
          actualDelivery: null,
          purchaseManager: 'Sarah Johnson',
          notes: 'Payment terms: Net 30 days',
          createdAt: '2024-04-22T14:45:00Z',
          updatedAt: '2024-04-22T14:45:00Z'
        },
        {
          _id: 'PUR_003',
          purchaseOrderNumber: 'PO-2024-003',
          billNumber: 'BILL-2024-003',
          supplierName: 'Computer Parts Ltd.',
          supplierEmail: 'orders@computerparts.com',
          supplierPhone: '+1-555-0203',
          items: [
            { name: 'Desktop Computer', quantity: 2, price: 799.99, total: 1599.98 },
            { name: 'Monitor 24"', quantity: 4, price: 279.99, total: 1119.96 }
          ],
          subtotal: 2719.94,
          tax: 326.39,
          discount: 150.00,
          total: 2896.33,
          paymentMethod: 'bank_transfer',
          status: 'completed',
          date: '2024-04-21',
          time: '09:15:00',
          expectedDelivery: '2024-04-23',
          actualDelivery: '2024-04-22',
          purchaseManager: 'Mike Wilson',
          notes: 'All items received in good condition',
          createdAt: '2024-04-21T09:15:00Z',
          updatedAt: '2024-04-22T16:30:00Z'
        },
        {
          _id: 'PUR_004',
          purchaseOrderNumber: 'PO-2024-004',
          billNumber: 'BILL-2024-004',
          supplierName: 'Stationery World',
          supplierEmail: 'sales@stationeryworld.com',
          supplierPhone: '+1-555-0204',
          items: [
            { name: 'Office Supplies Bundle', quantity: 1, price: 299.99, total: 299.99 }
          ],
          subtotal: 299.99,
          tax: 36.00,
          discount: 0.00,
          total: 335.99,
          paymentMethod: 'cash',
          status: 'returned',
          date: '2024-04-20',
          time: '11:30:00',
          expectedDelivery: '2024-04-21',
          actualDelivery: '2024-04-21',
          purchaseManager: 'Sarah Johnson',
          notes: 'Items returned due to quality issues',
          createdAt: '2024-04-20T11:30:00Z',
          updatedAt: '2024-04-21T14:20:00Z'
        }
      ];
    },
    {
      refetchInterval: 12000, // Real-time refresh every 12 seconds
      onSuccess: (data) => {
        console.log('Purchase transactions data refreshed:', data);
      }
    }
  );

  // Mutation for creating new purchase
  const createPurchaseMutation = useMutation(
    async (purchaseData) => {
      const purchases = purchasesData || [];
      const newPurchase = {
        ...purchaseData,
        _id: `PUR_${Date.now()}`,
        purchaseOrderNumber: `PO-2024-${String(purchases.length + 1).padStart(3, '0')}`,
        billNumber: `BILL-2024-${String(purchases.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        actualDelivery: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedPurchases = [...purchases, newPurchase];
      localStorage.setItem('purchaseTransactions', JSON.stringify(updatedPurchases));
      queryClient.setQueryData('purchaseTransactions', updatedPurchases);
      return updatedPurchases;
    },
    {
      onSuccess: () => {
        toast.success('Purchase created successfully');
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create purchase');
      }
    }
  );

  const purchases = purchasesData || [];

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        purchase.supplierEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        purchase.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus;
    const matchesSupplier = filterSupplier === 'all' || purchase.supplierName === filterSupplier;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const resetForm = () => {
    setFormData({
      supplierName: '',
      supplierEmail: '',
      supplierPhone: '',
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      expectedDelivery: '',
      notes: ''
    });
  };

  const openDetailsModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailsModal(true);
  };

  const openBillModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowBillModal(true);
  };

  const handleCreatePurchase = () => {
    if (!formData.supplierName.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    createPurchaseMutation.mutate(formData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Purchase data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-blue-100 text-blue-800';
      case 'bank_transfer':
        return 'bg-purple-100 text-purple-800';
      case 'check':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalPurchases = purchases.length;
  const completedPurchases = purchases.filter(purchase => purchase.status === 'completed').length;
  const pendingPurchases = purchases.filter(purchase => purchase.status === 'pending').length;
  const totalPurchaseAmount = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const todayPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.createdAt).toDateString();
    const today = new Date().toDateString();
    return purchaseDate === today;
  }).length;

  // Get unique suppliers
  const uniqueSuppliers = [...new Set(purchases.map(purchase => purchase.supplierName))];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Purchase Transactions</h1>
            <p className="page-subtitle">Add Purchase, View Purchases, Supplier Bills, Purchase Returns</p>
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
            {canManagePurchaseTransactions && (
              <button 
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="btn btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Purchase</span>
              </button>
            )}
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
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{totalPurchases}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedPurchases}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{pendingPurchases}</p>
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
              <p className="text-2xl font-bold text-gray-900">${totalPurchaseAmount.toFixed(2)}</p>
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
                placeholder="Search purchases..."
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
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
            
            <select
              className="input"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {uniqueSuppliers.map(supplier => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Purchases Table */}
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
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
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
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No purchases found
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{purchase.purchaseOrderNumber}</div>
                      <div className="text-xs text-gray-500">Bill: {purchase.billNumber}</div>
                      <div className="text-xs text-gray-500">Manager: {purchase.purchaseManager}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{purchase.supplierName}</div>
                      <div className="text-xs text-gray-500">{purchase.supplierEmail}</div>
                      <div className="text-xs text-gray-500">{purchase.supplierPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {purchase.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.name}
                            {index < Math.min(2, purchase.items.length) - 1 && ', '}
                          </span>
                        ))}
                        {purchase.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${purchase.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Subtotal: ${purchase.subtotal.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(purchase.paymentMethod)}`}>
                        {purchase.paymentMethod.charAt(0).toUpperCase() + purchase.paymentMethod.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.actualDelivery ? (
                          <span className="text-green-600">
                            Delivered: {purchase.actualDelivery}
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            Expected: {purchase.expectedDelivery}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(purchase)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openBillModal(purchase)}
                          className="text-green-600 hover:text-green-900"
                          title="View Bill"
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

      {/* Create Purchase Modal */}
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
              <h3 className="text-lg font-semibold text-gray-900">Add New Purchase</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreatePurchase();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                      className="input"
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Email</label>
                    <input
                      type="email"
                      value={formData.supplierEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierEmail: e.target.value }))}
                      className="input"
                      placeholder="supplier@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Phone</label>
                    <input
                      type="tel"
                      value={formData.supplierPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierPhone: e.target.value }))}
                      className="input"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery *</label>
                    <input
                      type="date"
                      value={formData.expectedDelivery}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit">Credit</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
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
                    placeholder="Add any notes about this purchase"
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
                  disabled={createPurchaseMutation.isLoading}
                >
                  {createPurchaseMutation.isLoading ? 'Creating...' : 'Add Purchase'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Purchase Details Modal */}
      {showDetailsModal && selectedPurchase && (
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
              <h3 className="text-lg font-semibold text-gray-900">Purchase Details - {selectedPurchase.purchaseOrderNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier Name</p>
                <p className="text-sm text-gray-900">{selectedPurchase.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier Email</p>
                <p className="text-sm text-gray-900">{selectedPurchase.supplierEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier Phone</p>
                <p className="text-sm text-gray-900">{selectedPurchase.supplierPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Manager</p>
                <p className="text-sm text-gray-900">{selectedPurchase.purchaseManager}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(selectedPurchase.paymentMethod)}`}>
                  {selectedPurchase.paymentMethod.charAt(0).toUpperCase() + selectedPurchase.paymentMethod.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPurchase.status)}`}>
                  {selectedPurchase.status.charAt(0).toUpperCase() + selectedPurchase.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Delivery</p>
                <p className="text-sm text-gray-900">{selectedPurchase.expectedDelivery}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Actual Delivery</p>
                <p className="text-sm text-gray-900">
                  {selectedPurchase.actualDelivery || 'Not delivered yet'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Items</p>
              <div className="space-y-2">
                {selectedPurchase.items.map((item, index) => (
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
                <p className="text-sm font-medium text-gray-900">${selectedPurchase.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tax</p>
                <p className="text-sm font-medium text-gray-900">${selectedPurchase.tax.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-sm font-medium text-gray-900">${selectedPurchase.total.toFixed(2)}</p>
              </div>
            </div>

            {selectedPurchase.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedPurchase.notes}</p>
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
                  openBillModal(selectedPurchase);
                }}
                className="btn btn-primary"
              >
                View Bill
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bill Modal */}
      {showBillModal && selectedPurchase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowBillModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Supplier Bill - {selectedPurchase.billNumber}</h3>
              <button
                onClick={() => setShowBillModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-6">
              {/* Bill Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">PURCHASE BILL</h2>
                  <p className="text-sm text-gray-600">Your Company Name</p>
                  <p className="text-sm text-gray-600">123 Business Ave</p>
                  <p className="text-sm text-gray-600">City, State 12345</p>
                  <p className="text-sm text-gray-600">Phone: +1-555-0123</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Bill Number</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPurchase.billNumber}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">PO Number</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPurchase.purchaseOrderNumber}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">Date</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPurchase.date}</p>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplier:</h3>
                <p className="text-sm font-medium text-gray-900">{selectedPurchase.supplierName}</p>
                <p className="text-sm text-gray-600">{selectedPurchase.supplierEmail}</p>
                <p className="text-sm text-gray-600">{selectedPurchase.supplierPhone}</p>
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
                    {selectedPurchase.items.map((item, index) => (
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
                    <span className="text-sm font-medium text-gray-900">${selectedPurchase.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-900">Tax:</span>
                    <span className="text-sm font-medium text-gray-900">${selectedPurchase.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-900">Discount:</span>
                    <span className="text-sm font-medium text-gray-900">-${selectedPurchase.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${selectedPurchase.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">Payment Method: {selectedPurchase.paymentMethod.charAt(0).toUpperCase() + selectedPurchase.paymentMethod.slice(1)}</p>
                <p className="text-sm text-gray-600">Expected Delivery: {selectedPurchase.expectedDelivery}</p>
                {selectedPurchase.notes && (
                  <p className="text-sm text-gray-600 mt-2">Notes: {selectedPurchase.notes}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBillModal(false)}
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

export default PurchaseTransactions;
