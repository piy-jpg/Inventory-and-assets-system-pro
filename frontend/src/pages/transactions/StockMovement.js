import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon as RefreshIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  TruckIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const StockMovement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [formData, setFormData] = useState({
    type: 'stock_in',
    movementType: 'purchase',
    referenceNumber: '',
    items: [],
    fromLocation: '',
    toLocation: '',
    notes: '',
    status: 'completed',
    movementDate: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  // Real-time stock movement data
  const { data: movementsData, isLoading, refetch } = useQuery(
    'stockMovements',
    () => {
      const storedMovements = localStorage.getItem('stockMovements');
      if (storedMovements) {
        return JSON.parse(storedMovements);
      }
      
      return [
        {
          _id: 'MOV_001',
          type: 'stock_in',
          movementType: 'purchase',
          referenceNumber: 'PO-2024-001',
          items: [
            { name: 'Laptop Pro 15"', sku: 'LAPTOP-001', quantity: 5, serialNumbers: ['SN001', 'SN002', 'SN003', 'SN004', 'SN005'] },
            { name: 'Wireless Mouse', sku: 'MOUSE-001', quantity: 10, serialNumbers: [] }
          ],
          fromLocation: 'Supplier Warehouse',
          toLocation: 'Main Store',
          notes: 'Received from Tech Supplies Inc.',
          status: 'completed',
          movementDate: '2024-04-23',
          movementTime: '10:30:00',
          processedBy: 'Mike Wilson',
          createdAt: '2024-04-23T10:30:00Z',
          updatedAt: '2024-04-23T10:30:00Z'
        },
        {
          _id: 'MOV_002',
          type: 'stock_out',
          movementType: 'sale',
          referenceNumber: 'INV-2024-001',
          items: [
            { name: 'Laptop Pro 15"', sku: 'LAPTOP-001', quantity: 1, serialNumbers: ['SN001'] },
            { name: 'Wireless Mouse', sku: 'MOUSE-001', quantity: 2, serialNumbers: [] }
          ],
          fromLocation: 'Main Store',
          toLocation: 'Customer - John Smith',
          notes: 'Sold to John Smith',
          status: 'completed',
          movementDate: '2024-04-23',
          movementTime: '14:30:00',
          processedBy: 'Sarah Johnson',
          createdAt: '2024-04-23T14:30:00Z',
          updatedAt: '2024-04-23T14:30:00Z'
        },
        {
          _id: 'MOV_003',
          type: 'internal_transfer',
          movementType: 'warehouse_transfer',
          referenceNumber: 'TRF-2024-001',
          items: [
            { name: 'Office Chair Ergonomic', sku: 'CHAIR-001', quantity: 3, serialNumbers: [] }
          ],
          fromLocation: 'Main Warehouse',
          toLocation: 'Retail Store',
          notes: 'Transfer to retail location for display',
          status: 'completed',
          movementDate: '2024-04-22',
          movementTime: '09:15:00',
          processedBy: 'Mike Wilson',
          createdAt: '2024-04-22T09:15:00Z',
          updatedAt: '2024-04-22T09:15:00Z'
        },
        {
          _id: 'MOV_004',
          type: 'stock_in',
          movementType: 'return',
          referenceNumber: 'RET-2024-001',
          items: [
            { name: 'Office Chair Ergonomic', sku: 'CHAIR-001', quantity: 1, serialNumbers: [] }
          ],
          fromLocation: 'Customer - Emily Davis',
          toLocation: 'Main Store',
          notes: 'Customer returned item - good condition',
          status: 'completed',
          movementDate: '2024-04-21',
          movementTime: '16:45:00',
          processedBy: 'Sarah Johnson',
          createdAt: '2024-04-21T16:45:00Z',
          updatedAt: '2024-04-21T16:45:00Z'
        },
        {
          _id: 'MOV_005',
          type: 'stock_out',
          movementType: 'adjustment',
          referenceNumber: 'ADJ-2024-001',
          items: [
            { name: 'Desktop Computer', sku: 'DESKTOP-001', quantity: 1, serialNumbers: ['SN006'] }
          ],
          fromLocation: 'Main Store',
          toLocation: 'Damaged/Disposed',
          notes: 'Item damaged during handling - written off',
          status: 'completed',
          movementDate: '2024-04-20',
          movementTime: '11:30:00',
          processedBy: 'Mike Wilson',
          createdAt: '2024-04-20T11:30:00Z',
          updatedAt: '2024-04-20T11:30:00Z'
        }
      ];
    },
    {
      refetchInterval: 9000, // Real-time refresh every 9 seconds
      onSuccess: (data) => {
        console.log('Stock movements data refreshed:', data);
      }
    }
  );

  // Mutation for creating new movement
  const createMovementMutation = useMutation(
    async (movementData) => {
      const movements = movementsData || [];
      const newMovement = {
        ...movementData,
        _id: `MOV_${Date.now()}`,
        movementTime: new Date().toLocaleTimeString(),
        processedBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedMovements = [...movements, newMovement];
      localStorage.setItem('stockMovements', JSON.stringify(updatedMovements));
      queryClient.setQueryData('stockMovements', updatedMovements);
      return updatedMovements;
    },
    {
      onSuccess: () => {
        toast.success('Stock movement recorded successfully');
        setShowMovementModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to record stock movement');
      }
    }
  );

  const movements = movementsData || [];

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        movement.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        movement.items.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || movement.type === filterType;
    const matchesStatus = filterStatus === 'all' || movement.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || 
                        movement.fromLocation?.toLowerCase().includes(filterLocation.toLowerCase()) ||
                        movement.toLocation?.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  const resetForm = () => {
    setFormData({
      type: 'stock_in',
      movementType: 'purchase',
      referenceNumber: '',
      items: [],
      fromLocation: '',
      toLocation: '',
      notes: '',
      status: 'completed',
      movementDate: new Date().toISOString().split('T')[0]
    });
  };

  const openDetailsModal = (movement) => {
    setSelectedMovement(movement);
    setShowDetailsModal(true);
  };

  const handleCreateMovement = () => {
    if (!formData.referenceNumber.trim()) {
      toast.error('Reference number is required');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    if (!formData.fromLocation.trim()) {
      toast.error('From location is required');
      return;
    }

    if (formData.type === 'internal_transfer' && !formData.toLocation.trim()) {
      toast.error('To location is required for transfers');
      return;
    }

    createMovementMutation.mutate(formData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Stock movements data refreshed');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'stock_in':
        return 'bg-green-100 text-green-800';
      case 'stock_out':
        return 'bg-red-100 text-red-800';
      case 'internal_transfer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementTypeColor = (movementType) => {
    switch (movementType) {
      case 'purchase':
        return 'bg-purple-100 text-purple-800';
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'return':
        return 'bg-orange-100 text-orange-800';
      case 'adjustment':
        return 'bg-red-100 text-red-800';
      case 'warehouse_transfer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stock_in':
        return <ArrowDownTrayIcon className="h-4 w-4" />;
      case 'stock_out':
        return <ArrowUpTrayIcon className="h-4 w-4" />;
      case 'internal_transfer':
        return <ArrowPathIcon className="h-4 w-4" />;
      default:
        return <CubeIcon className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalMovements = movements.length;
  const stockInMovements = movements.filter(movement => movement.type === 'stock_in').length;
  const stockOutMovements = movements.filter(movement => movement.type === 'stock_out').length;
  const internalTransfers = movements.filter(movement => movement.type === 'internal_transfer').length;
  const todayMovements = movements.filter(movement => {
    const movementDate = new Date(movement.createdAt).toDateString();
    const today = new Date().toDateString();
    return movementDate === today;
  }).length;

  // Get unique locations
  const uniqueLocations = [...new Set([
    ...movements.map(m => m.fromLocation),
    ...movements.map(m => m.toLocation)
  ].filter(Boolean))];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Stock Movement</h1>
            <p className="page-subtitle">Stock In (purchase), Stock Out (sales), Internal transfers (warehouse → store)</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => {
                resetForm();
                setShowMovementModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Record Movement</span>
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
              <p className="text-sm font-medium text-gray-600">Total Movements</p>
              <p className="text-2xl font-bold text-gray-900">{totalMovements}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock In</p>
              <p className="text-2xl font-bold text-green-600">{stockInMovements}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowDownTrayIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Out</p>
              <p className="text-2xl font-bold text-red-600">{stockOutMovements}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowUpTrayIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Internal Transfers</p>
              <p className="text-2xl font-bold text-blue-600">{internalTransfers}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Movement Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Purchase</p>
              <p className="text-xl font-bold text-purple-600">
                {movements.filter(m => m.movementType === 'purchase').length}
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
              <p className="text-sm font-medium text-gray-600">Sales</p>
              <p className="text-xl font-bold text-green-600">
                {movements.filter(m => m.movementType === 'sale').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CubeIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Returns</p>
              <p className="text-xl font-bold text-orange-600">
                {movements.filter(m => m.movementType === 'return').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Adjustments</p>
              <p className="text-xl font-bold text-red-600">
                {movements.filter(m => m.movementType === 'adjustment').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-red-600" />
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
                placeholder="Search movements..."
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
              <option value="stock_in">Stock In</option>
              <option value="stock_out">Stock Out</option>
              <option value="internal_transfer">Internal Transfer</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              className="input"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Movements Table */}
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
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movement Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No stock movements found
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.referenceNumber}</div>
                      <div className="text-xs text-gray-500">Processed by: {movement.processedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(movement.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movement.type)}`}>
                          {movement.type.replace('_', ' ').charAt(0).toUpperCase() + movement.type.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.movementType)}`}>
                        {movement.movementType.replace('_', ' ').charAt(0).toUpperCase() + movement.movementType.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movement.items.length} item{movement.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {movement.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.name}
                            {index < Math.min(2, movement.items.length) - 1 && ', '}
                          </span>
                        ))}
                        {movement.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{movement.fromLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{movement.toLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                        {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movement.movementDate}</div>
                      <div className="text-xs text-gray-500">{movement.movementTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(movement)}
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

      {/* Record Movement Modal */}
      {showMovementModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowMovementModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record Stock Movement</h3>
              <button
                onClick={() => setShowMovementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateMovement();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="stock_in">Stock In</option>
                      <option value="stock_out">Stock Out</option>
                      <option value="internal_transfer">Internal Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Movement Category *</label>
                    <select
                      value={formData.movementType}
                      onChange={(e) => setFormData(prev => ({ ...prev, movementType: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="purchase">Purchase</option>
                      <option value="sale">Sale</option>
                      <option value="return">Return</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="warehouse_transfer">Warehouse Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number *</label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                      className="input"
                      placeholder="e.g., PO-2024-001, INV-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Movement Date *</label>
                    <input
                      type="date"
                      value={formData.movementDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, movementDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
                    <input
                      type="text"
                      value={formData.fromLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, fromLocation: e.target.value }))}
                      className="input"
                      placeholder="e.g., Main Store, Warehouse, Supplier"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                    <input
                      type="text"
                      value={formData.toLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, toLocation: e.target.value }))}
                      className="input"
                      placeholder="e.g., Customer, Retail Store, Damaged"
                      required={formData.type === 'internal_transfer'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this movement"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                    <input
                      type="text"
                      readOnly
                      className="input bg-gray-50"
                      placeholder="Add items to movement"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                    <input
                      type="number"
                      readOnly
                      className="input bg-gray-50"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="input"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMovementMutation.isLoading}
                >
                  {createMovementMutation.isLoading ? 'Recording...' : 'Record Movement'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Movement Details Modal */}
      {showDetailsModal && selectedMovement && (
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
              <h3 className="text-lg font-semibold text-gray-900">Movement Details - {selectedMovement.referenceNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Movement Type</p>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedMovement.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedMovement.type)}`}>
                    {selectedMovement.type.replace('_', ' ').charAt(0).toUpperCase() + selectedMovement.type.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(selectedMovement.movementType)}`}>
                  {selectedMovement.movementType.replace('_', ' ').charAt(0).toUpperCase() + selectedMovement.movementType.replace('_', ' ').slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMovement.status)}`}>
                  {selectedMovement.status.charAt(0).toUpperCase() + selectedMovement.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processed By</p>
                <p className="text-sm text-gray-900">{selectedMovement.processedBy}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">From Location</p>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{selectedMovement.fromLocation}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">To Location</p>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{selectedMovement.toLocation}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Movement Date</p>
                <p className="text-sm text-gray-900">{selectedMovement.movementDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Movement Time</p>
                <p className="text-sm text-gray-900">{selectedMovement.movementTime}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Items Moved</p>
              <div className="space-y-2">
                {selectedMovement.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                      {item.serialNumbers && item.serialNumbers.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Serial: {item.serialNumbers.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedMovement.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedMovement.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedMovement.createdAt).toLocaleString()}
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary btn-sm"
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

export default StockMovement;
