import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { purchasesAPI } from '../services/api';
import mockData from '../data/mockData';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PurchaseForm from '../components/PurchaseForm';
import { useAuth } from '../hooks/useAuth';

const sectionCards = [
  { key: 'list', label: 'List Purchases', href: '/purchases' },
  { key: 'order', label: 'Purchase Order', href: '/purchases/order' },
  { key: 'create', label: 'Add Purchase', href: '/purchases/create' },
  { key: 'returns', label: 'List Purchase Return', href: '/purchases/returns' },
];

const Purchases = ({ initialShowForm = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const section = location.pathname.split('/')[2] || 'list';

  const canManagePurchases = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeletePurchases = ['admin', 'manager'].includes(user?.role);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(initialShowForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '2024-04-01',
    endDate: '2024-04-30'
  });
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setShowForm(initialShowForm || section === 'create' || section === 'order');
  }, [initialShowForm, section]);

  useEffect(() => {
    if (location.state?.purchaseSearch) {
      setSearch(location.state.purchaseSearch);
    }

    if (location.state?.purchaseStatus) {
      setStatusFilter(location.state.purchaseStatus);
    }
  }, [location.state]);

  const { data: purchasesData, isLoading } = useQuery(
    ['purchases', { search, statusFilter, dateRange }],
    () => purchasesAPI.getAll({ 
      page: 1, 
      search, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }),
    { keepPreviousData: true }
  );

  const statusMutation = useMutation(
    ({ id, status }) => purchasesAPI.updateStatus(id, status),
    {
      onSuccess: (data, variables) => {
        const statusMessages = {
          'received': 'Purchase marked as received - inventory updated',
          'ordered': 'Purchase order confirmed',
          'cancelled': 'Purchase cancelled successfully',
          'returned': 'Purchase return processed'
        };
        toast.success(statusMessages[variables.status] || 'Purchase status updated');
        queryClient.invalidateQueries('purchases');
        queryClient.invalidateQueries('inventory');
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('purchaseStatusUpdated', { detail: { id: variables.id, status: variables.status } }));
        window.dispatchEvent(new CustomEvent('purchasesActivityUpdate', { detail: { action: 'status_update', purchaseId: variables.id, status: variables.status } }));
        console.log('🔄 Real-time: Purchase status updated', variables);
      },
      onError: (error) => {
        console.error('Failed to update purchase status:', error);
        toast.error(error.response?.data?.message || 'Failed to update purchase status');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => purchasesAPI.delete(id),
    {
      onSuccess: (data, variables) => {
        toast.success('Purchase deleted successfully');
        queryClient.invalidateQueries('purchases');
        setSelectedPurchase(null);
        setShowDetails(false);
        
        // Trigger real-time events
        window.dispatchEvent(new CustomEvent('purchaseDeleted', { detail: { id: variables } }));
        window.dispatchEvent(new CustomEvent('purchasesActivityUpdate', { detail: { action: 'delete', purchaseId: variables } }));
        console.log('🗑️ Real-time: Purchase deleted', variables);
      },
      onError: (error) => {
        console.error('Failed to delete purchase:', error);
        toast.error(error.response?.data?.message || 'Failed to delete purchase');
      },
    }
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold uppercase">Received</span>;
      case 'ordered':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold uppercase">Ordered</span>;
      case 'cancelled':
      case 'returned':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  const purchases = purchasesData?.data?.data?.purchases || purchasesData?.data?.purchases || mockData.purchases || [];
  
  const visiblePurchases = useMemo(() => {
    let filtered = purchases;

    // Filter by section
    if (section === 'returns') {
      filtered = filtered.filter((purchase) => ['returned', 'cancelled'].includes(purchase.status));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((purchase) => purchase.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((purchase) => {
        const purchaseDate = new Date(purchase.purchase_date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return purchaseDate >= start && purchaseDate <= end;
      });
    }

    return filtered;
  }, [purchases, section, statusFilter, dateRange]);
  
  // Debug logging
  console.log('Purchases Data:', purchasesData);
  console.log('Extracted Purchases:', purchases);
  console.log('Visible Purchases:', visiblePurchases);

  const closeForm = () => {
    setShowForm(false);
    if (section !== 'list') {
      navigate('/purchases');
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchases</h1>
          <p className="page-subtitle">Orders, receiving, and purchase return tracking</p>
        </div>
        {canManagePurchases && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" /> New Purchase
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {sectionCards.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${section === item.key || (section === 'list' && item.key === 'list') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="flex flex-wrap gap-4">
          <div className="relative max-w-md flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by purchase ID or supplier"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input text-sm"
            >
              <option value="all">All Status</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="input text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12"><LoadingSpinner /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visiblePurchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{purchase.purchase_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{purchase.supplier_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{purchase.items?.length || 0} items</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(purchase.total_amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(purchase.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {purchase.status === 'ordered' && canManagePurchases && (
                        <button
                          onClick={() => statusMutation.mutate({ id: purchase._id, status: 'received' })}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Received"
                          disabled={statusMutation.isLoading}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {purchase.status === 'received' && canManagePurchases && (
                        <button
                          onClick={() => statusMutation.mutate({ id: purchase._id, status: 'returned' })}
                          className="text-orange-600 hover:text-orange-900"
                          title="Return Purchase"
                          disabled={statusMutation.isLoading}
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                      {canDeletePurchases && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this purchase?')) {
                              deleteMutation.mutate(purchase._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Purchase"
                          disabled={deleteMutation.isLoading}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!visiblePurchases.length && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No purchases found for this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <PurchaseForm
          onClose={closeForm}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries('purchases');
            navigate('/purchases');
          }}
        />
      )}

      {/* Purchase Details Modal */}
      {showDetails && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Purchase Details</h3>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedPurchase(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purchase ID</label>
                    <p className="text-sm text-gray-900">{selectedPurchase.purchase_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div>{getStatusBadge(selectedPurchase.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedPurchase.purchase_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedPurchase.total_amount)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <p className="text-sm text-gray-900">{selectedPurchase.supplier?.name || selectedPurchase.supplier?.company_name}</p>
                  {selectedPurchase.supplier?.email && (
                    <p className="text-sm text-gray-500">{selectedPurchase.supplier.email}</p>
                  )}
                  {selectedPurchase.supplier?.phone && (
                    <p className="text-sm text-gray-500">{selectedPurchase.supplier.phone}</p>
                  )}
                </div>
                
                {selectedPurchase.items && selectedPurchase.items.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Items</label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedPurchase.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.product?.name || item.product_name}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{item.quantity} {item.unit || 'pcs'}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{formatCurrency(item.unit_price)}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 font-semibold">{formatCurrency(item.quantity * item.unit_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {selectedPurchase.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm text-gray-900">{selectedPurchase.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {selectedPurchase.status === 'ordered' && canManagePurchases && (
                    <button
                      onClick={() => {
                        statusMutation.mutate({ id: selectedPurchase._id, status: 'received' });
                        setShowDetails(false);
                      }}
                      className="btn btn-primary"
                      disabled={statusMutation.isLoading}
                    >
                      Mark as Received
                    </button>
                  )}
                  {selectedPurchase.status === 'received' && canManagePurchases && (
                    <button
                      onClick={() => {
                        statusMutation.mutate({ id: selectedPurchase._id, status: 'returned' });
                        setShowDetails(false);
                      }}
                      className="btn btn-secondary"
                      disabled={statusMutation.isLoading}
                    >
                      Return Purchase
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedPurchase(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
