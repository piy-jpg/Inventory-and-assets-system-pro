import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

const CustomerProfile = ({ 
  customer, 
  ledgerData, 
  onEdit, 
  onDelete,
  isLoading,
  canManageCustomers = true
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  if (!customer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Selected</h3>
        <p className="text-gray-500">Select a customer from the list to view their profile</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'No record';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.active;
  };

  const handleDelete = () => {
    setDeleteDialog({
      open: true,
      item: customer
    });
  };

  const confirmDelete = () => {
    onDelete(customer._id);
    setDeleteDialog({ open: false, item: null });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, item: null });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'ledger', label: 'Ledger', icon: DocumentTextIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'contact', label: 'Contact', icon: PhoneIcon }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
            <p className="text-gray-600">{customer.company_name || 'Individual Customer'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                {customer.status || 'active'}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.payment_status)}`}>
                {customer.payment_status || 'paid'}
              </span>
            </div>
          </div>
        </div>
        {canManageCustomers ? (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(customer)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            <span className="font-medium">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(customer.metrics?.totalSpent || customer.total_spent || 0)}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <ExclamationCircleIcon className="h-5 w-5" />
            <span className="font-medium">Outstanding</span>
          </div>
          <div className="text-2xl font-bold text-red-900">
            {formatCurrency(customer.metrics?.outstandingBalance || customer.outstanding_balance || 0)}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <CreditCardIcon className="h-5 w-5" />
            <span className="font-medium">Credit Limit</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(customer.credit_limit || 0)}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-800 mb-2">
            <CalendarIcon className="h-5 w-5" />
            <span className="font-medium">Last Purchase</span>
          </div>
          <div className="text-lg font-bold text-purple-900">
            {formatDate(customer.metrics?.lastPurchaseDate || customer.last_purchase_date)}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{customer.phone || 'No phone'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{customer.email || 'No email'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium text-gray-900">{customer.company_name || 'Individual'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">
                  {customer.address ? 
                    `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}` :
                    'No address on file'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">GST Number</p>
              <p className="font-medium text-gray-900">{customer.gst_number || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
        <p className="text-gray-700">
          {customer.notes || 'No notes yet. Click Edit to add notes about this customer.'}
        </p>
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Transaction Ledger</h3>
      {ledgerData?.ledger && ledgerData.ledger.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ledgerData.ledger.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(entry.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.reference}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{entry.description}</td>
                  <td className="px-6 py-4 text-sm text-red-600">{entry.debit ? formatCurrency(entry.debit) : '-'}</td>
                  <td className="px-6 py-4 text-sm text-green-600">{entry.credit ? formatCurrency(entry.credit) : '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(entry.runningBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No ledger entries found for this customer</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-4">Purchase Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Total Purchases:</span>
              <span className="font-semibold text-blue-900">
                {customer.metrics?.totalPurchases || customer.total_purchases || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Average Order Value:</span>
              <span className="font-semibold text-blue-900">
                {formatCurrency(
                  (customer.metrics?.totalSpent || customer.total_spent || 0) / 
                  (customer.metrics?.totalPurchases || customer.total_purchases || 1)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Customer Since:</span>
              <span className="font-semibold text-blue-900">
                {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="font-medium text-green-900 mb-4">Payment Status</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-700">Payment Status:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.payment_status)}`}>
                {customer.payment_status || 'paid'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Credit Used:</span>
              <span className="font-semibold text-green-900">
                {formatCurrency(customer.metrics?.outstandingBalance || customer.outstanding_balance || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Available Credit:</span>
              <span className="font-semibold text-green-900">
                {formatCurrency(
                  (customer.credit_limit || 0) - 
                  (customer.metrics?.outstandingBalance || customer.outstanding_balance || 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href={`tel:${customer.phone}`}
          className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <PhoneIcon className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Call Customer</p>
            <p className="text-sm text-blue-700">{customer.phone}</p>
          </div>
        </a>
        <a
          href={`mailto:${customer.email}`}
          className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <EnvelopeIcon className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Send Email</p>
            <p className="text-sm text-green-700">{customer.email || 'No email'}</p>
          </div>
        </a>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'ledger':
        return renderLedger();
      case 'analytics':
        return renderAnalytics();
      case 'contact':
        return renderContact();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone and all associated data will be permanently removed."
        itemName={deleteDialog.item ? `${deleteDialog.item.name} (${deleteDialog.item.email})` : ''}
        type="delete"
        loading={false}
      />
    </div>
  );
};

export default CustomerProfile;
