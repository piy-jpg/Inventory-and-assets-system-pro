import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PrinterIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PrintTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printPreview, setPrintPreview] = useState(false);

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

  const totalAmount = selectedTransactions.reduce((sum, txn) => sum + txn.amount, 0);

  const handlePrintTransactions = () => {
    if (selectedTransactions.length === 0) {
      toast.error('No transactions selected for printing');
      return;
    }

    setIsPrinting(true);
    toast.loading('Preparing transactions for printing...');

    setTimeout(() => {
      // Create print content
      const printContent = generatePrintContent();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      // Real-time logging
      const logEntry = {
        action: 'print_transactions',
        count: selectedTransactions.length,
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
      
      console.log(`🖨️ Real-time: ${selectedTransactions.length} transactions printed`);
      
      setIsPrinting(false);
      toast.success(`${selectedTransactions.length} transactions sent to printer!`);
    }, 2000);
  };

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 5px; }
          .header p { color: #666; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .summary div { margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .status-completed { color: #059669; }
          .status-processed { color: #2563eb; }
          .status-approved { color: #7c3aed; }
          .status-pending { color: #d97706; }
          .status-cancelled { color: #dc2626; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transaction Report</h1>
          <p>Generated on ${currentDate} at ${currentTime}</p>
        </div>
        
        <div class="summary">
          <div><strong>Total Transactions:</strong> ${selectedTransactions.length}</div>
          <div><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</div>
          <div><strong>Report Type:</strong> All Selected Transactions</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Customer/Supplier</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${selectedTransactions.map(txn => `
              <tr>
                <td>${txn.id}</td>
                <td>${getTransactionTypeLabel(txn.type)}</td>
                <td>${txn.description}</td>
                <td>${txn.customerName || txn.supplierName || 'N/A'}</td>
                <td>${txn.date}</td>
                <td>$${txn.amount.toFixed(2)}</td>
                <td class="status-${txn.status}">${txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is a system-generated report. For any questions, please contact the administrator.</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    if (selectedTransactions.length === 0) {
      toast.error('No transactions selected for download');
      return;
    }

    toast.loading('Generating PDF report...');

    setTimeout(() => {
      // Create PDF content (simplified version)
      const pdfContent = generatePrintContent();
      const filename = `transactions_report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create a blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      // Real-time logging
      const logEntry = {
        action: 'download_transactions_pdf',
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
      
      console.log(`📄 Real-time: PDF report downloaded for ${selectedTransactions.length} transactions`);
      
      toast.success('PDF report downloaded successfully!');
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

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Print Transactions</h1>
            <p className="page-subtitle">Generate and print transaction reports</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPrintPreview(!printPreview)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <EyeIcon className="h-4 w-4" />
              <span>{printPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrintTransactions}
              disabled={isPrinting || selectedTransactions.length === 0}
              className="btn btn-primary flex items-center space-x-2"
            >
              {isPrinting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Printing...</span>
                </>
              ) : (
                <>
                  <PrinterIcon className="h-4 w-4" />
                  <span>Print Selected ({selectedTransactions.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selected Transactions</p>
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
              <p className="text-sm font-medium text-gray-600">Print Status</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedTransactions.length > 0 ? 'Ready' : 'No Selection'}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <PrinterIcon className="h-4 w-4 text-purple-600" />
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
            
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedTransactions.length === filteredTransactions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Print Preview */}
      {printPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Transaction Report</h2>
              <p className="text-gray-600">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-xl font-bold">{selectedTransactions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Report Type</p>
                  <p className="text-xl font-bold">Selected</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransactions.slice(0, 5).map((txn) => (
                    <tr key={txn.id} className="border-b">
                      <td className="px-4 py-2 text-sm">{txn.id}</td>
                      <td className="px-4 py-2 text-sm">{getTransactionTypeLabel(txn.type)}</td>
                      <td className="px-4 py-2 text-sm truncate max-w-xs">{txn.description}</td>
                      <td className="px-4 py-2 text-sm">${txn.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedTransactions.length > 5 && (
                <div className="text-center py-2 text-sm text-gray-600">
                  ... and {selectedTransactions.length - 5} more transactions
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

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
                        ${transaction.amount.toFixed(2)}
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
    </div>
  );
};

export default PrintTransactions;
