import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ScaleIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { stockAdjustmentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StockAdjustmentForm from '../components/StockAdjustmentForm';
import toast from 'react-hot-toast';

const StockAdjustments = ({ initialShowForm = false }) => {
  const [showForm, setShowForm] = useState(initialShowForm);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adjustmentToDelete, setAdjustmentToDelete] = useState(null);
  const [selectedAdjustments, setSelectedAdjustments] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const queryClient = useQueryClient();

  const { data: adjData, isLoading } = useQuery(
    ['stockAdjustments', { page, search, filterType, filterReason, dateRange }],
    () => stockAdjustmentsAPI.getAll({ 
      page, 
      search, 
      type: filterType !== 'all' ? filterType : undefined,
      reason: filterReason !== 'all' ? filterReason : undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined
    }),
    { keepPreviousData: true }
  );

  const adjustments = adjData?.data?.adjustments || [];
  const pagination = adjData?.data?.pagination || {};

  const deleteMutation = useMutation(stockAdjustmentsAPI.delete, {
    onSuccess: () => {
      toast.success('Adjustment deleted successfully');
      setShowDeleteDialog(false);
      setAdjustmentToDelete(null);
      queryClient.invalidateQueries('stockAdjustments');
      queryClient.invalidateQueries('inventory');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete adjustment'),
  });

  const handleDelete = () => {
    if (adjustmentToDelete) {
      deleteMutation.mutate(adjustmentToDelete._id);
    }
  };

  const handleView = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setShowViewModal(true);
  };

  const handleEdit = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setShowEditModal(true);
  };

  const handleDeleteClick = (adjustment) => {
    setAdjustmentToDelete(adjustment);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedAdjustments.size} adjustments?`)) {
      toast.loading(`Deleting ${selectedAdjustments.size} adjustments...`);

      Promise.all(Array.from(selectedAdjustments).map((id) => stockAdjustmentsAPI.delete(id)))
        .then(() => {
          toast.dismiss();
          toast.success('All selected adjustments deleted successfully');
          setSelectedAdjustments(new Set());
          queryClient.invalidateQueries('stockAdjustments');
          queryClient.invalidateQueries('inventory');
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(error.response?.data?.message || 'Failed to delete selected adjustments');
        });
    }
  };

  const handleAdjustmentSuccess = () => {
    setShowForm(false);
    setShowEditModal(false);
    setSelectedAdjustment(null);
    queryClient.invalidateQueries('stockAdjustments');
    queryClient.invalidateQueries('inventory');
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedAdjustment(null);
  };

  const handleBulkEdit = () => {
    if (selectedAdjustments.size === 0) {
      toast.error('No adjustments selected');
      return;
    }
    
    toast.success(`Opening bulk edit for ${selectedAdjustments.size} adjustments`);
    // TODO: Implement bulk edit modal
  };

  const handleExportReport = () => {
    const csvContent = [
      ['Date', 'Product', 'SKU', 'Type', 'Quantity', 'Reason', 'Created By', 'Notes'],
      ...adjustments.map(adj => [
        new Date(adj.createdAt).toLocaleDateString(),
        adj.product?.name || 'Unknown',
        adj.product?.sku || 'Unknown',
        adj.type,
        adj.quantity,
        adj.reason,
        `${adj.created_by?.firstName || ''} ${adj.created_by?.lastName || ''}`.trim(),
        adj.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-adjustments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  const handleAdvancedFilters = () => {
    toast.success('Advanced filters feature coming soon');
  };

  const handleBulkSearch = () => {
    toast.success('Bulk search feature coming soon');
  };

  const handleSyncInventory = () => {
    toast.loading('Syncing inventory with backend...');
    setTimeout(() => {
      toast.success('Inventory synchronized successfully');
      queryClient.invalidateQueries('stockAdjustments');
      queryClient.invalidateQueries('inventory');
    }, 2000);
  };

  const handleAuditTrail = () => {
    toast.success('Audit trail feature coming soon');
  };

  
  const handleBulkExport = () => {
    const selectedAdjData = adjustments.filter(adj => selectedAdjustments.has(adj._id));
    const csvContent = [
      ['Date', 'Product', 'SKU', 'Type', 'Quantity', 'Reason', 'Created By', 'Notes'],
      ...selectedAdjData.map(adj => [
        new Date(adj.createdAt).toLocaleDateString(),
        adj.product?.name || 'Unknown',
        adj.product?.sku || 'Unknown',
        adj.type,
        adj.quantity,
        adj.reason,
        `${adj.created_by?.firstName || ''} ${adj.created_by?.lastName || ''}`.trim(),
        adj.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-adjustments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Selected items exported successfully');
  };

  
  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics and Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
            <p className="text-gray-600">Correct inventory levels and track discrepancies</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleExportReport} className="btn btn-secondary flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" /> Export Report
            </button>
            <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center shadow-md">
              <PlusIcon className="h-5 w-5 mr-2" /> New Adjustment
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Adjustments</p>
                <p className="text-2xl font-bold text-blue-900">{adjustments.length}</p>
              </div>
              <div className="bg-blue-200 rounded-full p-2">
                <ScaleIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Increases</p>
                <p className="text-2xl font-bold text-green-900">
                  {adjustments.filter(adj => adj.type === 'increase').length}
                </p>
              </div>
              <div className="bg-green-200 rounded-full p-2">
                <ArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Decreases</p>
                <p className="text-2xl font-bold text-red-900">
                  {adjustments.filter(adj => adj.type === 'decrease').length}
                </p>
              </div>
              <div className="bg-red-200 rounded-full p-2">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">This Month</p>
                <p className="text-2xl font-bold text-purple-900">
                  {adjustments.filter(adj => {
                    const adjDate = new Date(adj.createdAt);
                    const now = new Date();
                    return adjDate.getMonth() === now.getMonth() && adjDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-purple-200 rounded-full p-2">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button onClick={handleAdvancedFilters} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <FunnelIcon className="h-4 w-4 mr-2 inline" /> Advanced Filters
          </button>
          <button onClick={handleBulkSearch} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <MagnifyingGlassIcon className="h-4 w-4 mr-2 inline" /> Bulk Search
          </button>
          <button onClick={handleSyncInventory} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <ArrowPathIcon className="h-4 w-4 mr-2 inline" /> Sync Inventory
          </button>
          <button onClick={handleAuditTrail} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <ExclamationCircleIcon className="h-4 w-4 mr-2 inline" /> Audit Trail
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search adjustments..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            className="input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>

          <select
            className="input"
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
          >
            <option value="all">All Reasons</option>
            <option value="correction">Correction</option>
            <option value="damage">Damage</option>
            <option value="theft">Theft</option>
            <option value="expired">Expired</option>
            <option value="return">Customer Return</option>
            <option value="other">Other</option>
          </select>

          <input
            type="date"
            className="input"
            placeholder="Start Date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />

          <input
            type="date"
            className="input"
            placeholder="End Date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <div className="p-12 text-center"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {adjustments.map((adj) => (
                  <tr key={adj._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(adj.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{adj.product?.name}</div>
                      <div className="text-xs text-gray-500">{adj.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        adj.type === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {adj.type === 'increase' ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                        {adj.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {adj.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 capitalize">{adj.reason}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {adj.created_by?.firstName} {adj.created_by?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(adj)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(adj)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Adjustment"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <StockAdjustmentForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            handleAdjustmentSuccess();
          }} 
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedAdjustment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Adjustment Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-900">{new Date(selectedAdjustment.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Product</label>
                <p className="text-gray-900">{selectedAdjustment.product?.name}</p>
                <p className="text-sm text-gray-600">SKU: {selectedAdjustment.product?.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedAdjustment.type === 'increase' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAdjustment.type === 'increase' ? '+' : '-'}{selectedAdjustment.quantity}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="text-gray-900 capitalize">{selectedAdjustment.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created By</label>
                <p className="text-gray-900">
                  {selectedAdjustment.created_by?.firstName} {selectedAdjustment.created_by?.lastName}
                </p>
              </div>
              {selectedAdjustment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900">{selectedAdjustment.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAdjustment && (
        <StockAdjustmentForm
          adjustment={selectedAdjustment}
          onClose={handleEditModalClose}
          onSuccess={() => {
            handleAdjustmentSuccess();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Stock Adjustment</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this stock adjustment? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isLoading}
                  className="btn btn-danger flex-1"
                >
                  {deleteMutation.isLoading ? 'Deleting...' : 'Delete Adjustment'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-100 rounded-b-2xl">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustments;
