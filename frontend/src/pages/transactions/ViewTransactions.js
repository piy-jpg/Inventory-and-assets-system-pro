import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  TruckIcon,
  ReceiptRefundIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ViewTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Mock transactions data
  useEffect(() => {
    const mockTransactions = [
      {
        id: 'TXN-001',
        type: 'sale',
        amount: 15499.99,
        date: '2024-04-20',
        description: 'Bulk sale to ABC Corporation',
        customerName: 'ABC Corporation',
        paymentMethod: 'credit_card',
        referenceNumber: 'INV-2024-001',
        status: 'completed'
      },
      {
        id: 'TXN-002',
        type: 'purchase',
        amount: 8750.50,
        date: '2024-04-19',
        description: 'Purchase from XYZ Suppliers',
        supplierName: 'XYZ Suppliers',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'PO-2024-002',
        status: 'completed'
      },
      {
        id: 'TXN-003',
        type: 'return',
        amount: 2500.00,
        date: '2024-04-18',
        description: 'Return from customer - defective items',
        customerName: 'John Doe',
        paymentMethod: 'cash',
        referenceNumber: 'RET-2024-001',
        status: 'processed'
      },
      {
        id: 'TXN-004',
        type: 'payment',
        amount: 5000.00,
        date: '2024-04-17',
        description: 'Payment received for invoice INV-2024-003',
        customerName: 'Global Tech Inc',
        paymentMethod: 'check',
        referenceNumber: 'PAY-2024-001',
        status: 'completed'
      },
      {
        id: 'TXN-005',
        type: 'expense',
        amount: 1200.00,
        date: '2024-04-16',
        description: 'Office supplies and utilities',
        paymentMethod: 'cash',
        referenceNumber: 'EXP-2024-001',
        status: 'approved'
      }
    ];
    setTransactions(mockTransactions);
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (transaction.customerName && transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (transaction.supplierName && transaction.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesDate = filterDateRange === 'all' || true; // Add date filtering logic if needed
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale':
        return <ShoppingCartIcon className="h-4 w-4" />;
      case 'purchase':
        return <TruckIcon className="h-4 w-4" />;
      case 'return':
        return <ReceiptRefundIcon className="h-4 w-4" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'expense':
        return <ReceiptRefundIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'sale':
        return 'Sale';
      case 'purchase':
        return 'Purchase';
      case 'return':
        return 'Return';
      case 'payment':
        return 'Payment';
      case 'expense':
        return 'Expense';
      default:
        return 'Other';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const completedTransactions = filteredTransactions.filter(txn => txn.status === 'completed').length;
  const pendingTransactions = filteredTransactions.filter(txn => txn.status === 'pending').length;

  const openDetailsModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handlePrintTransactions = () => {
    toast.loading('Preparing transactions for printing...');
    
    setTimeout(() => {
      // Simulate print functionality
      const printContent = filteredTransactions.map(txn => 
        `${txn.id} - ${getTransactionTypeLabel(txn.type)} - $${txn.amount.toFixed(2)} - ${txn.date}`
      ).join('\n');
      
      console.log('Print content:', printContent);
      toast.success('Transactions sent to printer!');
      
      // Real-time logging
      const logEntry = {
        action: 'print_transactions',
        count: filteredTransactions.length,
        totalAmount: totalAmount,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      window.dispatchEvent(new CustomEvent('transactionsPrinted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`🖨️ Real-time: ${filteredTransactions.length} transactions printed`);
    }, 1000);
  };

  const handleDownloadTransactions = () => {
    toast.loading('Preparing transactions for download...');
    
    setTimeout(() => {
      // Create CSV content
      const csvContent = [
        ['ID', 'Type', 'Amount', 'Date', 'Description', 'Status'],
        ...filteredTransactions.map(txn => [
          txn.id,
          getTransactionTypeLabel(txn.type),
          txn.amount.toFixed(2),
          txn.date,
          txn.description,
          txn.status
        ])
      ].map(row => row.join(',')).join('\n');
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Transactions downloaded successfully!');
      
      // Real-time logging
      const logEntry = {
        action: 'download_transactions',
        count: filteredTransactions.length,
        totalAmount: totalAmount,
        filename: `transactions_${new Date().toISOString().split('T')[0]}.csv`,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      window.dispatchEvent(new CustomEvent('transactionsDownloaded', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`📄 Real-time: ${filteredTransactions.length} transactions downloaded`);
    }, 1000);
  };

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">View All Transactions</h1>
            <p className="page-subtitle">Browse and manage all transactions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrintTransactions}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadTransactions}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={() => window.location.href = '/transactions/add'}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{completedTransactions}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="h-4 w-4 text-blue-600" />
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
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="sale">Sales</option>
              <option value="purchase">Purchases</option>
              <option value="return">Returns</option>
              <option value="payment">Payments</option>
              <option value="expense">Expenses</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                      <div className="text-xs text-gray-500">{transaction.referenceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-400">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <span className="text-sm text-gray-900">
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.customerName || transaction.supplierName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(transaction)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details - {selectedTransaction.id}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaction Type</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getTransactionIcon(selectedTransaction.type)}
                  <span className="text-sm text-gray-900">
                    {getTransactionTypeLabel(selectedTransaction.type)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900 mt-1">{selectedTransaction.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-lg font-medium text-gray-900 mt-1">
                  ${selectedTransaction.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-sm text-gray-900 mt-1">{selectedTransaction.date}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                  {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                </span>
              </div>

              {selectedTransaction.referenceNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Reference Number</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedTransaction.referenceNumber}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ViewTransactions;
