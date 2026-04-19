import React, { useState } from 'react';
import {
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { purchasesAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PurchaseForm from '../components/PurchaseForm';

const Purchases = ({ initialShowForm = false }) => {
  const [showForm, setShowForm] = useState(initialShowForm);
  const queryClient = useQueryClient();

  const { data: purchasesData, isLoading } = useQuery(
    ['purchases'],
    () => purchasesAPI.getAll({ page: 1 }),
    { keepPreviousData: true }
  );

  const statusMutation = useMutation(
    ({ id, status }) => purchasesAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        toast.success('Purchase status updated');
        queryClient.invalidateQueries('purchases');
        queryClient.invalidateQueries('inventory');
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
      case 'received': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold uppercase">Received</span>;
      case 'ordered': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold uppercase">Ordered</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold uppercase">Cancelled</span>;
      default: return null;
    }
  };

  const purchases = purchasesData?.data?.purchases || [];
  return (
    <div className="page-stack">
      <div className="page-header">
        <h1 className="page-title">Purchases</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" /> New Purchase
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <div className="p-12"><LoadingSpinner /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchases.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.purchase_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.supplier?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(p.total_amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.purchase_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'ordered' && (
                      <button 
                        onClick={() => statusMutation.mutate({ id: p._id, status: 'received' })}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Mark Received
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <PurchaseForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries('purchases'); }} />}
    </div>
  );
};

export default Purchases;
