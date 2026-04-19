import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ArrowPathIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { stockTransfersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StockTransferForm from '../components/StockTransferForm';
import toast from 'react-hot-toast';

const StockTransfers = ({ initialShowForm = false }) => {
  const [showForm, setShowForm] = useState(initialShowForm);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: transferData, isLoading } = useQuery(
    ['stockTransfers', { page }],
    () => stockTransfersAPI.getAll({ page }),
    { keepPreviousData: true }
  );

  const statusMutation = useMutation(
    ({ id, status }) => stockTransfersAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        toast.success('Transfer status updated');
        queryClient.invalidateQueries('stockTransfers');
      },
    }
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center w-fit"><CheckCircleIcon className="h-3 w-3 mr-1" /> Completed</span>;
      case 'in_transit': return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center w-fit"><TruckIcon className="h-3 w-3 mr-1" /> In Transit</span>;
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center w-fit"><ClockIcon className="h-3 w-3 mr-1" /> Pending</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center w-fit"><XCircleIcon className="h-3 w-3 mr-1" /> Cancelled</span>;
      default: return null;
    }
  };

  const transfers = transferData?.data?.transfers || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Transfers</h1>
          <p className="text-gray-600">Move products between warehouses and track shipments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center shadow-md">
          <PlusIcon className="h-5 w-5 mr-2" /> New Transfer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <div className="p-12 text-center"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Transfer ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">From</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">To</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transfers.map((trf) => (
                  <tr key={trf._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{trf.transfer_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{trf.from_warehouse?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{trf.to_warehouse?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(trf.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(trf.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {trf.status === 'pending' && (
                          <button onClick={() => statusMutation.mutate({ id: trf._id, status: 'in_transit' })} className="text-blue-600 hover:text-blue-900">Ship</button>
                        )}
                        {trf.status === 'in_transit' && (
                          <button onClick={() => statusMutation.mutate({ id: trf._id, status: 'completed' })} className="text-green-600 hover:text-green-900">Receive</button>
                        )}
                        {trf.status !== 'completed' && trf.status !== 'cancelled' && (
                          <button onClick={() => statusMutation.mutate({ id: trf._id, status: 'cancelled' })} className="text-red-600 hover:text-red-900">Cancel</button>
                        )}
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
        <StockTransferForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries('stockTransfers');
          }} 
        />
      )}
    </div>
  );
};

export default StockTransfers;
