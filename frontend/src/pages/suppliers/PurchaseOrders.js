import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
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

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplierId: '',
    items: [],
    totalAmount: 0,
    expectedDeliveryDate: '',
    notes: '',
    status: 'pending'
  });

  const queryClient = useQueryClient();

  const canManagePurchaseOrders = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeletePurchaseOrders = ['admin', 'manager'].includes(user?.role);

  // Real-time purchase orders data
  const { data: ordersData, isLoading, refetch } = useQuery(
    'purchaseOrders',
    () => {
      const storedOrders = localStorage.getItem('purchaseOrders');
      if (storedOrders) {
        return JSON.parse(storedOrders);
      }
      
      return [
        {
          _id: 'PO_001',
          orderNumber: 'PO-2024-001',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          items: [
            { name: 'Laptop Pro 15"', quantity: 5, unitPrice: 1199.99, total: 5999.95 },
            { name: 'Wireless Mouse', quantity: 10, unitPrice: 24.99, total: 249.90 }
          ],
          totalAmount: 6249.85,
          expectedDeliveryDate: '2024-04-30',
          actualDeliveryDate: null,
          status: 'pending',
          notes: 'Urgent order for new equipment',
          createdBy: 'John Smith',
          createdAt: '2024-04-23T10:30:00Z',
          updatedAt: '2024-04-23T10:30:00Z'
        },
        {
          _id: 'PO_002',
          orderNumber: 'PO-2024-002',
          supplierId: 'SUP_002',
          supplierName: 'Office Furniture Co.',
          items: [
            { name: 'Office Chair Ergonomic', quantity: 3, unitPrice: 389.99, total: 1169.97 }
          ],
          totalAmount: 1169.97,
          expectedDeliveryDate: '2024-04-25',
          actualDeliveryDate: '2024-04-24',
          status: 'received',
          notes: 'Regular furniture order',
          createdBy: 'Sarah Johnson',
          createdAt: '2024-04-20T14:15:00Z',
          updatedAt: '2024-04-24T16:30:00Z'
        },
        {
          _id: 'PO_003',
          orderNumber: 'PO-2024-003',
          supplierId: 'SUP_003',
          supplierName: 'Stationery World',
          items: [
            { name: 'Notebook Set', quantity: 20, unitPrice: 12.99, total: 259.80 },
            { name: 'Pen Set', quantity: 50, unitPrice: 5.99, total: 299.50 }
          ],
          totalAmount: 559.30,
          expectedDeliveryDate: '2024-04-22',
          actualDeliveryDate: null,
          status: 'cancelled',
          notes: 'Cancelled due to budget constraints',
          createdBy: 'Mike Wilson',
          createdAt: '2024-04-18T09:20:00Z',
          updatedAt: '2024-04-19T11:45:00Z'
        },
        {
          _id: 'PO_004',
          orderNumber: 'PO-2024-004',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          items: [
            { name: 'Desktop Computer', quantity: 2, unitPrice: 899.99, total: 1799.98 }
          ],
          totalAmount: 1799.98,
          expectedDeliveryDate: '2024-04-28',
          actualDeliveryDate: null,
          status: 'pending',
          notes: 'Replacement for failed units',
          createdBy: 'John Smith',
          createdAt: '2024-04-22T16:45:00Z',
          updatedAt: '2024-04-22T16:45:00Z'
        }
      ];
    },
    {
      refetchInterval: 8000, // Real-time refresh every 8 seconds
      onSuccess: (data) => {
        console.log('Purchase orders data refreshed:', data);
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

  // Mutation for creating new purchase order
  const createOrderMutation = useMutation(
    async (orderData) => {
      const orders = ordersData || [];
      const newOrder = {
        ...orderData,
        _id: `PO_${Date.now()}`,
        orderNumber: orderData.orderNumber || `PO-2024-${String(orders.length + 1).padStart(3, '0')}`,
        supplierName: suppliersData.find(s => s._id === orderData.supplierId)?.name || 'Unknown Supplier',
        actualDeliveryDate: null,
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedOrders = [...orders, newOrder];
      localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
      queryClient.setQueryData('purchaseOrders', updatedOrders);
      return newOrder;
    },
    {
      onSuccess: () => {
        toast.success('Purchase order created successfully');
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create purchase order');
      }
    }
  );

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation(
    async ({ orderId, status, actualDeliveryDate }) => {
      const orders = ordersData || [];
      const updatedOrders = orders.map(order => 
        order._id === orderId ? {
          ...order,
          status,
          actualDeliveryDate: actualDeliveryDate || order.actualDeliveryDate,
          updatedAt: new Date().toISOString()
        } : order
      );
      localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
      queryClient.setQueryData('purchaseOrders', updatedOrders);
      return updatedOrders;
    },
    {
      onSuccess: () => {
        toast.success('Order status updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update order status');
      }
    }
  );

  const orders = ordersData || [];
  const suppliers = suppliersData || [];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSupplier = filterSupplier === 'all' || order.supplierId === filterSupplier;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      supplierId: '',
      items: [],
      totalAmount: 0,
      expectedDeliveryDate: '',
      notes: '',
      status: 'pending'
    });
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleCreateOrder = () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (!formData.expectedDeliveryDate) {
      toast.error('Expected delivery date is required');
      return;
    }

    createOrderMutation.mutate(formData);
  };

  const handleUpdateStatus = (status) => {
    if (!selectedOrder) return;

    updateOrderStatusMutation.mutate({
      orderId: selectedOrder._id,
      status,
      actualDeliveryDate: status === 'received' ? new Date().toISOString().split('T')[0] : null
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Purchase orders data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />;
      case 'received':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const receivedOrders = orders.filter(order => order.status === 'received').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const overdueOrders = orders.filter(order => 
    order.status === 'pending' && new Date(order.expectedDeliveryDate) < new Date()
  ).length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Purchase Orders</h1>
            <p className="page-subtitle">Create purchase order, View order history, Track order status (Pending / Received / Cancelled)</p>
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
            {canManagePurchaseOrders && (
              <button 
                onClick={openCreateModal}
                className="btn btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create PO</span>
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
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Received</p>
              <p className="text-2xl font-bold text-green-600">{receivedOrders}</p>
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
              <p className="text-2xl font-bold text-gray-900">${Number(totalValue || 0).toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-xl font-bold text-blue-600">
                {orders.filter(order => order.status === 'confirmed').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-xl font-bold text-purple-600">
                {orders.filter(order => order.status === 'shipped').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-red-600">{overdueOrders}</p>
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
                placeholder="Search orders..."
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
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
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

      {/* Orders Table */}
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
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">Created: {new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.supplierName}</div>
                      <div className="text-xs text-gray-500">Created by: {order.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Array.isArray(order.items) ? order.items.length : 0} items</div>
                      <div className="text-xs text-gray-500">
                        {Array.isArray(order.items) && order.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.name}
                            {index < Math.min(2, order.items.length) - 1 && ', '}
                          </span>
                        ))}
                        {Array.isArray(order.items) && order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${Number(order.totalAmount || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.expectedDeliveryDate}</div>
                      {order.actualDeliveryDate && (
                        <div className="text-xs text-green-600">Received: {order.actualDeliveryDate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(order)}
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

      {/* Create Purchase Order Modal */}
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
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Purchase Order</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateOrder();
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                    className="input"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date *</label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this order"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Items will be added after creating the order</p>
                  <p className="text-xs text-gray-500">Total Amount: ${Number(formData.totalAmount || 0).toFixed(2)}</p>
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
                  disabled={createOrderMutation.isLoading}
                >
                  {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
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
              <h3 className="text-lg font-semibold text-gray-900">Order Details - {selectedOrder.orderNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedOrder.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-sm font-medium text-gray-900">${Number(selectedOrder.totalAmount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Delivery</p>
                <p className="text-sm text-gray-900">{selectedOrder.expectedDeliveryDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created By</p>
                <p className="text-sm text-gray-900">{selectedOrder.createdBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Order Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${Number(item.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">${Number(item.unitPrice || 0).toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                  <span> | Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                {selectedOrder.status === 'pending' && canManagePurchaseOrders && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('confirmed')}
                      className="btn btn-primary btn-sm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('cancelled')}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {selectedOrder.status === 'confirmed' && canManagePurchaseOrders && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('shipped')}
                      className="btn btn-primary btn-sm"
                    >
                      Mark Shipped
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('cancelled')}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {selectedOrder.status === 'shipped' && canManagePurchaseOrders && (
                  <button
                    onClick={() => handleUpdateStatus('received')}
                    className="btn btn-primary btn-sm"
                  >
                    Mark Received
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

export default PurchaseOrders;
