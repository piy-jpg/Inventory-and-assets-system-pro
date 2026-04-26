import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const mockLedgerData = [
  {
    id: 1,
    name: 'Acme Stores',
    email: 'accounts@acmestores.com',
    phone: '+1 555-0101',
    company_name: 'Acme Stores',
    ledger: {
      transactions: [
        {
          id: 'INV-001',
          date: '2024-01-15',
          reference: 'INV-001',
          description: 'Initial inventory purchase',
          type: 'sale',
          debit: 10000,
          credit: 0,
          runningBalance: 10000
        },
        {
          id: 'PAY-001',
          date: '2024-01-20',
          reference: 'PAY-001',
          description: 'Partial payment received',
          type: 'payment',
          debit: 0,
          credit: 5000,
          runningBalance: 5000
        }
      ],
      summary: {
        totalSpent: 10000,
        totalPaid: 5000,
        balance: 5000
      }
    }
  },
  {
    id: 2,
    name: 'BlueWave Retail',
    email: 'finance@bluewave.com',
    phone: '+1 555-0142',
    company_name: 'BlueWave Retail',
    ledger: {
      transactions: [
        {
          id: 'INV-014',
          date: '2024-02-05',
          reference: 'INV-014',
          description: 'February stock order',
          type: 'sale',
          debit: 8200,
          credit: 0,
          runningBalance: 8200
        },
        {
          id: 'CREDIT-004',
          date: '2024-02-18',
          reference: 'CREDIT-004',
          description: 'Credit note applied',
          type: 'credit',
          debit: 0,
          credit: 1200,
          runningBalance: 7000
        }
      ],
      summary: {
        totalSpent: 8200,
        totalPaid: 1200,
        balance: 7000
      }
    }
  }
];

const CustomerLedger = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = React.useState('all');
  const [allLedgers, setAllLedgers] = React.useState([]);
  const [allLedgersLoading, setAllLedgersLoading] = React.useState(true);

  React.useEffect(() => {
    setAllLedgers(mockLedgerData);
    setAllLedgersLoading(false);
  }, []);

  const filteredLedger = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allLedgers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        customer.name?.toLowerCase().includes(normalizedSearch) ||
        customer.email?.toLowerCase().includes(normalizedSearch) ||
        customer.phone?.toLowerCase().includes(normalizedSearch) ||
        customer.company_name?.toLowerCase().includes(normalizedSearch);

      const transactions = customer.ledger?.transactions ?? [];

      const matchesType =
        transactionTypeFilter === 'all' ||
        transactions.some((transaction) => transaction.type === transactionTypeFilter);

      const matchesDate =
        dateFilter === 'all' ||
        transactions.some((transaction) => {
          const transactionDate = new Date(transaction.date);
          const filterDate = new Date();

          switch (dateFilter) {
            case '30days':
              filterDate.setDate(filterDate.getDate() - 30);
              break;
            case '90days':
              filterDate.setDate(filterDate.getDate() - 90);
              break;
            case '6months':
              filterDate.setMonth(filterDate.getMonth() - 6);
              break;
            default:
              return true;
          }

          return transactionDate >= filterDate;
        });

      return matchesSearch && matchesType && matchesDate;
    });
  }, [allLedgers, dateFilter, searchTerm, transactionTypeFilter]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setTransactionTypeFilter('all');
  };

  const handleViewSalesHistory = () => {
    toast.success('Opening sales history...');
  };

  const handleViewCustomerProfile = () => {
    toast.success('Opening customer profile...');
  };

  const handleSendPaymentReminder = () => {
    toast.success('Sending payment reminder...');
  };

  const handleGenerateStatement = () => {
    toast.success('Generating statement...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/contacts')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                Back to Customers
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Customer Ledger</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="input text-sm"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="6months">Last 6 Months</option>
              </select>
              <select
                value={transactionTypeFilter}
                onChange={(event) => setTransactionTypeFilter(event.target.value)}
                className="input text-sm"
              >
                <option value="all">All Types</option>
                <option value="sale">Sales</option>
                <option value="payment">Payments</option>
                <option value="credit">Credits</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {allLedgersLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search customers by name, email, phone, or company..."
                        className="input pl-10 w-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={clearFilters} className="btn btn-secondary">
                      Clear Filters
                    </button>
                    <button onClick={handleViewSalesHistory} className="btn btn-secondary">
                      View Sales History
                    </button>
                    <button onClick={handleViewCustomerProfile} className="btn btn-secondary">
                      View Customer Profile
                    </button>
                    <button onClick={handleSendPaymentReminder} className="btn btn-secondary">
                      Send Payment Reminder
                    </button>
                    <button onClick={handleGenerateStatement} className="btn btn-secondary">
                      Generate Statement
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Debit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLedger.length > 0 ? (
                        filteredLedger.map((customer) => {
                          const latestTransaction = customer.ledger?.transactions?.[0];

                          return (
                            <tr key={customer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatDate(latestTransaction?.date)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {customer.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {latestTransaction?.description || 'No description'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                {latestTransaction?.type || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-right text-gray-600">
                                {formatCurrency(latestTransaction?.debit)}
                              </td>
                              <td className="px-6 py-4 text-sm text-right text-gray-600">
                                {formatCurrency(latestTransaction?.credit)}
                              </td>
                              <td className="px-6 py-4 text-sm text-right text-gray-600">
                                {formatCurrency(customer.ledger?.summary?.balance)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                            No customer ledger entries match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerLedger;
