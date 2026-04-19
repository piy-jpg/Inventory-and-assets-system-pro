import React from 'react';
import { motion } from 'framer-motion';
import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  NoSymbolIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import { analyticsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';

const StockReport = () => {
  const { data: reportData, isLoading } = useQuery('stockReport', analyticsAPI.getStockReport);

  const stats = reportData?.data?.stats || { total_items: 0, low_stock_items: 0, out_of_stock: 0, total_value: 0 };
  const items = reportData?.data?.items || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
        <button onClick={() => window.print()} className="btn btn-secondary text-sm">Print Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Items" value={stats.total_items} icon={<CubeIcon className="h-6 w-6" />} color="blue" />
        <StatCard title="Low Stock" value={stats.low_stock_items} icon={<ExclamationTriangleIcon className="h-6 w-6" />} color="orange" />
        <StatCard title="Out of Stock" value={stats.out_of_stock} icon={<NoSymbolIcon className="h-6 w-6" />} color="red" />
        <StatCard title="Inventory Value" value={formatCurrency(stats.total_value)} icon={<CurrencyDollarIcon className="h-6 w-6" />} color="green" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <div className="p-12 text-center"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stock Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Min Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Unit Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Total Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${item.quantity <= item.minStockLevel ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.minStockLevel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.price.cost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(item.quantity * item.price.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockReport;
