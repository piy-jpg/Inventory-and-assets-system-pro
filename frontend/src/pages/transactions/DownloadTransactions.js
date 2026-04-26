import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  CalendarIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DownloadTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('csv');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

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
        status: 'completed',
        tax: 1239.99,
        total: 16739.98
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
        status: 'completed',
        tax: 700.04,
        total: 9450.54
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
        status: 'processed',
        tax: 0,
        total: 2500.00
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
        status: 'completed',
        tax: 0,
        total: 5000.00
      },
      {
        id: 'TXN-005',
        type: 'expense',
        amount: 1200.00,
        date: '2024-04-16',
        description: 'Office supplies and utilities',
        paymentMethod: 'cash',
        referenceNumber: 'EXP-2024-001',
        status: 'approved',
        tax: 96.00,
        total: 1296.00
      }
    ];
    setTransactions(mockTransactions);
    setSelectedTransactions(mockTransactions);
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

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'sale': return 'Sale';
      case 'purchase': return 'Purchase';
      case 'return': return 'Return';
      case 'payment': return 'Payment';
      case 'expense': return 'Expense';
      default: return 'Other';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = selectedTransactions.reduce((sum, txn) => sum + txn.total, 0);
  const totalTax = selectedTransactions.reduce((sum, txn) => sum + (txn.tax || 0), 0);

  const generateCSV = () => {
    // Ensure selectedTransactions is an array and has data
    if (!Array.isArray(selectedTransactions) || selectedTransactions.length === 0) {
      return '';
    }

    const headers = includeHeaders ? [
      'Transaction ID',
      'Type',
      'Description',
      'Customer/Supplier',
      'Date',
      'Amount',
      'Tax',
      'Total',
      'Payment Method',
      'Reference Number',
      'Status'
    ] : [];

    const rows = selectedTransactions.map(txn => {
      // Ensure txn is a valid object
      if (!txn || typeof txn !== 'object') {
        return [];
      }
      
      return [
        txn.id || '',
        getTransactionTypeLabel(txn.type) || '',
        txn.description || '',
        txn.customerName || txn.supplierName || 'N/A',
        txn.date || '',
        (txn.amount || 0).toFixed(2),
        (txn.tax || 0).toFixed(2),
        (txn.total || 0).toFixed(2),
        txn.paymentMethod || '',
        txn.referenceNumber || '',
        txn.status || ''
      ];
    }).filter(row => Array.isArray(row) && row.length > 0); // Filter out invalid rows

    const allRows = includeHeaders ? [headers, ...rows] : rows;
    
    // Ensure all rows are arrays before joining
    return allRows.map(row => {
      if (!Array.isArray(row)) {
        console.error('Invalid row data:', row);
        return '';
      }
      return row.join(',');
    }).join('\n');
  };

  const generateJSON = () => {
    // Ensure selectedTransactions is an array and has data
    if (!Array.isArray(selectedTransactions) || selectedTransactions.length === 0) {
      return JSON.stringify([], null, 2);
    }

    const data = selectedTransactions.map(txn => {
      // Ensure txn is a valid object
      if (!txn || typeof txn !== 'object') {
        return null;
      }
      
      return {
        id: txn.id || '',
        type: getTransactionTypeLabel(txn.type) || '',
        description: txn.description || '',
        customer: txn.customerName || txn.supplierName || 'N/A',
        date: txn.date || '',
        amount: txn.amount || 0,
        tax: txn.tax || 0,
        total: txn.total || 0,
        paymentMethod: txn.paymentMethod || '',
        referenceNumber: txn.referenceNumber || '',
        status: txn.status || ''
      };
    }).filter(item => item !== null); // Filter out invalid items

    return JSON.stringify(data, null, 2);
  };

  const generateXML = () => {
    // Ensure selectedTransactions is an array and has data
    if (!Array.isArray(selectedTransactions) || selectedTransactions.length === 0) {
      return '<?xml version="1.0" encoding="UTF-8"?>\n<transactions></transactions>';
    }

    const xmlContent = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<transactions>',
      ...selectedTransactions.map(txn => {
        // Ensure txn is a valid object
        if (!txn || typeof txn !== 'object') {
          return [];
        }
        
        return [
          '  <transaction>',
          `    <id>${(txn.id || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</id>`,
          `    <type>${(getTransactionTypeLabel(txn.type) || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</type>`,
          `    <description>${(txn.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>`,
          `    <customer>${(txn.customerName || txn.supplierName || 'N/A').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</customer>`,
          `    <date>${(txn.date || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</date>`,
          `    <amount>${(txn.amount || 0).toFixed(2)}</amount>`,
          `    <tax>${(txn.tax || 0).toFixed(2)}</tax>`,
          `    <total>${(txn.total || 0).toFixed(2)}</total>`,
          `    <paymentMethod>${(txn.paymentMethod || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</paymentMethod>`,
          `    <referenceNumber>${(txn.referenceNumber || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</referenceNumber>`,
          `    <status>${(txn.status || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</status>`,
          '  </transaction>'
        ];
      }).flat(),
      '</transactions>'
    ].join('\n');

    return xmlContent;
  };

  const handleDownload = () => {
    if (selectedTransactions.length === 0) {
      toast.error('No transactions selected for download');
      return;
    }

    setIsDownloading(true);
    toast.loading(`Generating ${downloadFormat.toUpperCase()} file...`);

    setTimeout(() => {
      let content, mimeType, filename;

      switch (downloadFormat) {
        case 'csv':
          content = generateCSV();
          mimeType = 'text/csv';
          filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'json':
          content = generateJSON();
          mimeType = 'application/json';
          filename = `transactions_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'xml':
          content = generateXML();
          mimeType = 'application/xml';
          filename = `transactions_${new Date().toISOString().split('T')[0]}.xml`;
          break;
        default:
          content = generateCSV();
          mimeType = 'text/csv';
          filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      // Real-time logging
      const logEntry = {
        action: 'download_transactions',
        format: downloadFormat,
        count: selectedTransactions.length,
        totalAmount: totalAmount,
        filename: filename,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('salesActionLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('salesActionLogs', JSON.stringify(existingLogs));
      
      window.dispatchEvent(new CustomEvent('transactionsDownloaded', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('salesActivityUpdate', { detail: logEntry }));
      
      console.log(`📄 Real-time: ${selectedTransactions.length} transactions downloaded as ${downloadFormat.toUpperCase()}`);
      
      setIsDownloading(false);
      toast.success(`${selectedTransactions.length} transactions downloaded as ${filename}!`);
    }, 2000);
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => {
      const isSelected = prev.some(txn => txn.id === transactionId);
      if (isSelected) {
        return prev.filter(txn => txn.id !== transactionId);
      } else {
        const transaction = transactions.find(txn => txn.id === transactionId);
        return transaction ? [...prev, transaction] : prev;
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions);
    }
  };

  const downloadFormats = [
    { value: 'csv', label: 'CSV (Comma Separated)', icon: TableCellsIcon },
    { value: 'json', label: 'JSON (JavaScript Object)', icon: DocumentTextIcon },
    { value: 'xml', label: 'XML (eXtensible Markup)', icon: DocumentTextIcon }
  ];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Download Transactions</h1>
            <p className="page-subtitle">Export transaction data in various formats</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.href = '/transactions/view'}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Download Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-3">
              {downloadFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setDownloadFormat(format.value)}
                    className={`w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                      downloadFormat === format.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs opacity-75">
                        {format.value === 'csv' && 'Ideal for spreadsheet applications'}
                        {format.value === 'json' && 'Perfect for web applications'}
                        {format.value === 'xml' && 'Structured data format'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Options
            </label>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeHeaders"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeHeaders" className="ml-2 text-sm text-gray-700">
                  Include column headers
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selected</p>
              <p className="text-2xl font-bold text-gray-900">{selectedTransactions.length}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subtotal</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalAmount - totalTax).toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tax</p>
              <p className="text-2xl font-bold text-orange-600">${totalTax.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
            
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedTransactions.length === filteredTransactions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === filteredTransactions.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
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
                      <input
                        type="checkbox"
                        checked={selectedTransactions.some(txn => txn.id === transaction.id)}
                        onChange={() => toggleTransactionSelection(transaction.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                      <div className="text-xs text-gray-500">{transaction.referenceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
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
                        ${transaction.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-6"
      >
        <button
          onClick={handleDownload}
          disabled={isDownloading || selectedTransactions.length === 0}
          className="btn btn-primary flex items-center space-x-2 px-8 py-3"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating {downloadFormat.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Download {selectedTransactions.length} Transactions ({downloadFormat.toUpperCase()})</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default DownloadTransactions;
