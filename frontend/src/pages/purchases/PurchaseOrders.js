import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
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
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon,
  TruckIcon,
  BuildingOfficeIcon,
  BellIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../hooks/useAuth';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplierName: '',
    supplierEmail: '',
    orderDate: '',
    expectedDate: '',
    amount: 0,
    tax: 0,
    total: 0,
    items: 0,
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
      // Get orders from localStorage or use mock data
      const storedOrders = localStorage.getItem('purchaseOrders');
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        // If localStorage has empty array, use default data
        if (parsed.length === 0) {
          localStorage.removeItem('purchaseOrders');
        } else {
          return parsed;
        }
      }
      
      // Default mock data with real-time timestamps
      const defaultOrders = [
        {
          id: 'PO-2024-001',
          orderNumber: 'PO-2024-001',
          supplierName: 'Tech Supplies Inc',
          supplierEmail: 'orders@techsupplies.com',
          orderDate: '2024-04-20',
          expectedDate: '2024-04-27',
          amount: 15499.99,
          tax: 1239.99,
          total: 16739.98,
          status: 'pending',
          items: 12,
          createdBy: 'John Smith',
          notes: 'Bulk order for office equipment',
          createdAt: '2024-04-20T14:30:00Z'
        },
        {
          id: 'PO-2024-002',
          orderNumber: 'PO-2024-002',
          supplierName: 'Office Depot Wholesale',
          supplierEmail: 'wholesale@officedepot.com',
          orderDate: '2024-04-19',
          expectedDate: '2024-04-26',
          amount: 8750.00,
          tax: 700.00,
          total: 9450.00,
          status: 'confirmed',
          items: 8,
          createdBy: 'Sarah Johnson',
          notes: 'Monthly office supplies restock',
          createdAt: '2024-04-19T11:15:00Z'
        },
        {
          id: 'PO-2024-003',
          orderNumber: 'PO-2024-003',
          supplierName: 'Global Furniture Co',
          supplierEmail: 'orders@globalfurniture.com',
          orderDate: '2024-04-18',
          expectedDate: '2024-05-02',
          amount: 23450.50,
          tax: 1876.04,
          total: 25326.54,
          status: 'received',
          items: 25,
          createdBy: 'Mike Wilson',
          notes: 'Large furniture order for new office',
          createdAt: '2024-04-18T16:45:00Z'
        },
        {
          id: 'PO-2024-004',
          orderNumber: 'PO-2024-004',
          supplierName: 'Stationery Plus',
          supplierEmail: 'orders@stationeryplus.com',
          orderDate: '2024-04-17',
          expectedDate: '2024-04-24',
          amount: 3250.75,
          tax: 260.06,
          total: 3510.81,
          status: 'cancelled',
          items: 5,
          createdBy: 'Emily Davis',
          notes: 'Order cancelled - supplier out of stock',
          createdAt: '2024-04-17T09:30:00Z'
        },
        {
          id: 'PO-2024-005',
          orderNumber: 'PO-2024-005',
          supplierName: 'Computer Hardware Ltd',
          supplierEmail: 'procurement@computerhardware.com',
          orderDate: '2024-04-16',
          expectedDate: '2024-04-23',
          amount: 12450.25,
          tax: 996.02,
          total: 13446.27,
          status: 'pending',
          items: 15,
          createdBy: 'John Smith',
          notes: 'Computer components for IT department',
          createdAt: '2024-04-16T13:20:00Z'
        }
      ];
      
      // Save default data to localStorage
      localStorage.setItem('purchaseOrders', JSON.stringify(defaultOrders));
      return defaultOrders;
    },
    {
      refetchInterval: 5000, // Real-time refresh every 5 seconds
      onSuccess: (data) => {
        console.log('Purchase orders data refreshed:', data);
      }
    }
  );

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation(
    async ({ orderId, newStatus }) => {
      const orders = ordersData || [];
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      );
      localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
      queryClient.setQueryData('purchaseOrders', updatedOrders);
      return updatedOrders;
    },
    {
      onSuccess: () => {
        toast.success('Order status updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update order status');
      }
    }
  );

  const orders = ordersData || [];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSupplier = filterSupplier === 'all' || order.supplierName === filterSupplier;
    const matchesDate = filterDateRange === 'all' || true; // Add date filtering logic if needed
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const confirmedOrders = filteredOrders.filter(o => o.status === 'confirmed').length;
  const receivedOrders = filteredOrders.filter(o => o.status === 'received').length;
  const totalAmount = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingAmount = filteredOrders
    .filter(o => o.status === 'pending')
    .reduce((sum, o) => sum + o.total, 0);

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleEditOrder = (order) => {
    toast.loading(`Opening editor for order ${order.id}...`);
    
    setTimeout(() => {
      setSelectedOrder(order);
      setFormData({
        orderNumber: order.orderNumber,
        supplierName: order.supplierName,
        supplierEmail: order.supplierEmail,
        orderDate: order.orderDate,
        expectedDate: order.expectedDate,
        amount: order.amount,
        tax: order.tax,
        total: order.total,
        items: order.items,
        notes: order.notes,
        status: order.status
      });
      setShowEditModal(true);
      
      toast.success(`Edit mode activated for order ${order.id}`);
      console.log('✏️ Real-time: Order opened for editing', order);
      
      // Trigger real-time event
      window.dispatchEvent(new CustomEvent('purchaseOrderEditOpened', { detail: order }));
    }, 600);
  };

  const handleUpdateOrder = () => {
    if (!selectedOrder) return;
    
    toast.loading(`Updating order ${selectedOrder.id}...`);
    
    setTimeout(() => {
      const storedOrders = localStorage.getItem('purchaseOrders');
      let orders = storedOrders ? JSON.parse(storedOrders) : [];
      
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            orderNumber: formData.orderNumber,
            supplierName: formData.supplierName,
            supplierEmail: formData.supplierEmail,
            orderDate: formData.orderDate,
            expectedDate: formData.expectedDate,
            amount: formData.amount,
            tax: formData.tax,
            total: formData.total,
            items: formData.items,
            notes: formData.notes,
            status: formData.status,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });
      
      localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('purchaseOrderUpdated', { detail: { ...selectedOrder, ...formData } }));
      window.dispatchEvent(new CustomEvent('ordersActivityUpdate', { detail: { action: 'update', orderId: selectedOrder.id } }));
      
      toast.success(`Order ${selectedOrder.id} updated successfully`);
      console.log('✏️ Real-time: Order updated', selectedOrder.id);
      
      setShowEditModal(false);
      setSelectedOrder(null);
      refetch();
    }, 800);
  };

  // Workflow actions
  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, newStatus });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  // Real-time statistics
  
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
            <p className="page-subtitle">Manage and track purchase orders</p>
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
              <button className="btn btn-primary flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Create Order</span>
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
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{confirmedOrders}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
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
                placeholder="Search orders..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="received">Received</option>
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

      {/* Orders Table */}
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
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Date
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{order.items} items</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.supplierName}</div>
                      <div className="text-xs text-gray-500">{order.supplierEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.orderDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.expectedDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${Number(order.total || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">${Number(order.amount || 0).toFixed(2)} + ${Number(order.tax || 0).toFixed(2)} tax</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
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
                        {canManagePurchaseOrders && (
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canDeletePurchaseOrders && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
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
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Order Number</p>
                <p className="text-sm text-gray-900">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedOrder.supplierName}</p>
                <p className="text-xs text-gray-500">{selectedOrder.supplierEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Order Date</p>
                <p className="text-sm text-gray-900">{selectedOrder.orderDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Date</p>
                <p className="text-sm text-gray-900">{selectedOrder.expectedDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-sm font-medium text-gray-900">${Number(selectedOrder.total || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created By</p>
                <p className="text-sm text-gray-900">{selectedOrder.createdBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Items</p>
                <p className="text-sm text-gray-900">{selectedOrder.items}</p>
              </div>
            </div>

            {/* Workflow Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Workflow Actions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'pending' && canManagePurchaseOrders && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                      className="btn btn-primary flex items-center space-x-2"
                      disabled={updateOrderStatusMutation.isLoading}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Confirm Order</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      className="btn btn-secondary flex items-center space-x-2"
                      disabled={updateOrderStatusMutation.isLoading}
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Cancel Order</span>
                    </button>
                  </>
                )}
                {selectedOrder.status === 'confirmed' && canManagePurchaseOrders && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'received')}
                      className="btn btn-primary flex items-center space-x-2"
                      disabled={updateOrderStatusMutation.isLoading}
                    >
                      <TruckIcon className="h-4 w-4" />
                      <span>Mark as Received</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      className="btn btn-secondary flex items-center space-x-2"
                      disabled={updateOrderStatusMutation.isLoading}
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Cancel Order</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
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
              <h3 className="text-lg font-semibold text-gray-900">Edit Order - {selectedOrder.orderNumber}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Email</label>
                <input
                  type="email"
                  value={formData.supplierEmail}
                  onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                <input
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ($)</label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total ($)</label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                <input
                  type="number"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
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

export default PurchaseOrders;
