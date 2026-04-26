import React from 'react';
import { motion } from 'framer-motion';
import {
  WalletIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import { paymentAccountsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const { data: accountsData } = useQuery('paymentAccounts', paymentAccountsAPI.getAll);
  const { data: transactionsData } = useQuery(
    ['paymentTransactions', {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }],
    () => paymentAccountsAPI.getTransactions({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
  );

  const accounts = accountsData?.data?.data?.accounts || [];
  const transactions = transactionsData?.data?.data?.transactions || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const handleAccountBalanceReport = () => {
    try {
      console.log('Generating Account Balance Report...');
      const reportData = accounts.map(account => ({
        'Account Name': account.name,
        'Type': account.account_type,
        'Current Balance': formatCurrency(account.current_balance),
        'Opening Balance': formatCurrency(account.opening_balance),
        'Net Change': formatCurrency(account.current_balance - account.opening_balance),
        'Status': account.status,
        'Last Transaction': account.last_transaction ? 
          `${formatCurrency(account.last_transaction.amount)} on ${new Date(account.last_transaction.date).toLocaleDateString()}` : 
          'No transactions'
      }));

      const csvContent = [
        Object.keys(reportData[0]),
        ...reportData.map(row => Object.values(row))
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account_balance_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Account Balance Report generated successfully!');
    } catch (error) {
      console.error('Error generating account balance report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleCashFlowReport = () => {
    try {
      console.log('Generating Cash Flow Report...');
      
      const deposits = transactions.filter(txn => txn.transaction_type === 'deposit');
      const withdrawals = transactions.filter(txn => txn.transaction_type === 'withdraw');
      const transfers = transactions.filter(txn => txn.transaction_type === 'transfer');
      
      const totalDeposits = deposits.reduce((sum, txn) => sum + txn.amount, 0);
      const totalWithdrawals = withdrawals.reduce((sum, txn) => sum + txn.amount, 0);
      const totalTransfers = transfers.reduce((sum, txn) => sum + txn.amount, 0);
      
      const cashFlowSummary = {
        'Total Deposits': formatCurrency(totalDeposits),
        'Total Withdrawals': formatCurrency(totalWithdrawals),
        'Total Transfers': formatCurrency(totalTransfers),
        'Net Cash Flow': formatCurrency(totalDeposits - totalWithdrawals),
        'Number of Deposits': deposits.length,
        'Number of Withdrawals': withdrawals.length,
        'Number of Transfers': transfers.length,
        'Total Transactions': transactions.length
      };

      const reportContent = `
Cash Flow Report
================
Generated: ${new Date().toLocaleString()}

Summary:
--------
${Object.entries(cashFlowSummary).map(([key, value]) => `${key}: ${value}`).join('\n')}

Account Breakdown:
-----------------
${accounts.map(account => {
  const accountTransactions = transactions.filter(txn => txn.from_account === account._id);
  const accountDeposits = accountTransactions.filter(txn => txn.transaction_type === 'deposit').reduce((sum, txn) => sum + txn.amount, 0);
  const accountWithdrawals = accountTransactions.filter(txn => txn.transaction_type === 'withdraw').reduce((sum, txn) => sum + txn.amount, 0);
  return `${account.name}:
  Deposits: ${formatCurrency(accountDeposits)}
  Withdrawals: ${formatCurrency(accountWithdrawals)}
  Net Flow: ${formatCurrency(accountDeposits - accountWithdrawals)}
  Transactions: ${accountTransactions.length}`;
}).join('\n\n')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cash_flow_report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Cash Flow Report generated successfully!');
    } catch (error) {
      console.error('Error generating cash flow report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handlePaymentSummaryReport = () => {
    try {
      console.log('Generating Payment Summary Report...');
      
      const transactionsByType = {
        deposit: transactions.filter(txn => txn.transaction_type === 'deposit'),
        withdraw: transactions.filter(txn => txn.transaction_type === 'withdraw'),
        transfer: transactions.filter(txn => txn.transaction_type === 'transfer')
      };

      const transactionsByAccount = accounts.map(account => {
        const accountTransactions = transactions.filter(txn => txn.from_account === account._id);
        return {
          account: account.name,
          type: account.account_type,
          transactionCount: accountTransactions.length,
          totalAmount: accountTransactions.reduce((sum, txn) => sum + txn.amount, 0),
          averageTransaction: accountTransactions.length > 0 ? accountTransactions.reduce((sum, txn) => sum + txn.amount, 0) / accountTransactions.length : 0
        };
      });

      const totalBalance = accounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);

      const reportContent = `
Payment Summary Report
=====================
Generated: ${new Date().toLocaleString()}

Overall Statistics:
------------------
Total Accounts: ${accounts.length}
Active Accounts: ${accounts.filter(acc => acc.status === 'active').length}
Total Balance: ${formatCurrency(totalBalance)}
Total Transactions: ${transactions.length}

Transaction Types:
-----------------
Deposits: ${transactionsByType.deposit.length} (${formatCurrency(transactionsByType.deposit.reduce((sum, txn) => sum + txn.amount, 0))})
Withdrawals: ${transactionsByType.withdraw.length} (${formatCurrency(transactionsByType.withdraw.reduce((sum, txn) => sum + txn.amount, 0))})
Transfers: ${transactionsByType.transfer.length} (${formatCurrency(transactionsByType.transfer.reduce((sum, txn) => sum + txn.amount, 0))})

Account Performance:
-------------------
${transactionsByAccount.map(acc => `
${acc.account} (${acc.type}):
  Transactions: ${acc.transactionCount}
  Total Amount: ${formatCurrency(acc.totalAmount)}
  Average Transaction: ${formatCurrency(acc.averageTransaction)}
`).join('')}

Account Details:
---------------
${accounts.map(account => `
${account.name}:
  Type: ${account.account_type}
  Balance: ${formatCurrency(account.current_balance)}
  Status: ${account.status}
  Created: ${new Date(account.created_at).toLocaleDateString()}
`).join('')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_summary_report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Payment Summary Report generated successfully!');
    } catch (error) {
      console.error('Error generating payment summary report:', error);
      toast.error('Failed to generate report');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            title: 'Account Balance Report', 
            description: 'View balance trends for all accounts', 
            icon: WalletIcon, 
            action: () => handleAccountBalanceReport()
          },
          { 
            title: 'Cash Flow Report', 
            description: 'Track money in and out flow', 
            icon: ArrowTrendingUpIcon,
            action: () => handleCashFlowReport()
          },
          { 
            title: 'Payment Summary', 
            description: 'Comprehensive payment analytics', 
            icon: ChartBarIcon,
            action: () => handlePaymentSummaryReport()
          }
        ].map((report, index) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={report.action}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <report.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{report.description}</p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Generate Report
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Reports;
