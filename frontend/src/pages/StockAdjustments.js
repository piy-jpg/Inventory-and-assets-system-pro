import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ScaleIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import { stockAdjustmentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StockAdjustmentForm from '../components/StockAdjustmentForm';

const StockAdjustments = ({ initialShowForm = false }) => {
  const [showForm, setShowForm] = useState(initialShowForm);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: adjData, isLoading } = useQuery(
    ['stockAdjustments', { page }],
    () => stockAdjustmentsAPI.getAll({ page }),
    { keepPreviousData: true }
  );

  const adjustments = adjData?.data?.adjustments || [];
  const pagination = adjData?.data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600">Correct inventory levels and track discrepancies</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center shadow-md">
          <PlusIcon className="h-5 w-5 mr-2" /> New Adjustment
        </button>
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
            setShowForm(false);
            queryClient.invalidateQueries('stockAdjustments');
            queryClient.invalidateQueries('inventory');
          }} 
        />
      )}
    </div>
  );
};

export default StockAdjustments;
