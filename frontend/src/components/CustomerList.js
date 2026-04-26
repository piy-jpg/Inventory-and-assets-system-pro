import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { customersAPI } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

const CustomerList = ({ 
  customers, 
  isLoading, 
  onCustomerSelect, 
  onCustomerEdit, 
  onCustomerDelete,
  selectedCustomerId,
  search,
  setSearch,
  filter,
  setFilter,
  onCallCustomer,
  onEmailCustomer,
  onWhatsAppCustomer,
  onSendSMS,
  onViewLedger,
  onViewSalesHistory,
  onSendReminder,
  onAddNote,
  onScheduleFollowUp,
  onExportData,
  onDuplicateCustomer,
  canManageCustomers = true,
  canUseImportExport = true
}) => {
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  // Enhanced filtering and sorting
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = [...customers];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.company_name?.toLowerCase().includes(searchLower) ||
        customer.gst_number?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filter.status) {
      filtered = filtered.filter(customer => customer.status === filter.status);
    }

    // Apply high-value filter
    if (filter.highValue) {
      filtered = filtered.filter(customer => 
        (customer.metrics?.totalSpent || customer.total_spent || 0) > 2000
      );
    }

    // Apply due payments filter
    if (filter.duePayments) {
      filtered = filtered.filter(customer => 
        (customer.metrics?.outstandingBalance || customer.outstanding_balance || 0) > 0
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'totalSpent':
          aValue = a.metrics?.totalSpent || a.total_spent || 0;
          bValue = b.metrics?.totalSpent || b.total_spent || 0;
          break;
        case 'outstanding':
          aValue = a.metrics?.outstandingBalance || a.outstanding_balance || 0;
          bValue = b.metrics?.outstandingBalance || b.outstanding_balance || 0;
          break;
        case 'lastPurchase':
          aValue = new Date(a.metrics?.lastPurchaseDate || a.last_purchase_date || '1970-01-01');
          bValue = new Date(b.metrics?.lastPurchaseDate || b.last_purchase_date || '1970-01-01');
          break;
        default:
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [customers, search, filter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevSort => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = (customer) => {
    setDeleteDialog({
      open: true,
      item: customer
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.item) {
      onCustomerDelete(deleteDialog.item._id);
    }
    setDeleteDialog({ open: false, item: null });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, item: null });
  };

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setFilter({
      status: '',
      highValue: false,
      duePayments: false
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.active;
  };

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

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer List</h2>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedCustomers.length} of {customers.length} customers
            </p>
          </div>
          {canManageCustomers ? (
            <button
              onClick={() => onCustomerEdit()}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Customer
            </button>
          ) : null}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="input pl-10 pr-24 w-full"
            placeholder="Search customers by name, email, phone, company, or GST..."
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 rotate-180" />}
          </button>

          {(search || filter.status || filter.highValue || filter.duePayments) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Clear Filters
            </button>
          )}

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: "{search}"
              </span>
            )}
            {filter.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Status: {filter.status}
              </span>
            )}
            {filter.highValue && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                High Value
              </span>
            )}
            {filter.duePayments && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Due Payments
              </span>
            )}
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-4 mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="input w-full"
                  value={filter.status}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilter(prev => ({ ...prev, highValue: !prev.highValue }))}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter.highValue 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border`}
                >
                  High Value Customers
                </button>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilter(prev => ({ ...prev, duePayments: !prev.duePayments }))}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter.duePayments 
                      ? 'bg-red-100 text-red-800 border-red-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border`}
                >
                  Due Payments Only
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Customer
                      {sortConfig.key === 'name' && (
                        <ChevronDownIcon className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('totalSpent')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Total Spent
                      {sortConfig.key === 'totalSpent' && (
                        <ChevronDownIcon className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('outstanding')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Outstanding
                      {sortConfig.key === 'outstanding' && (
                        <ChevronDownIcon className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('lastPurchase')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Last Purchase
                      {sortConfig.key === 'lastPurchase' && (
                        <ChevronDownIcon className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCustomerId === customer._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onCustomerSelect(customer._id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <BuildingOfficeIcon className="h-3 w-3" />
                            {customer.company_name || 'Individual'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <EnvelopeIcon className="h-4 w-4" />
                          {customer.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.metrics?.totalSpent || customer.total_spent || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(customer.metrics?.outstandingBalance || customer.outstanding_balance || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(customer.metrics?.lastPurchaseDate || customer.last_purchase_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Contact Actions */}
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCallCustomer(customer);
                            }}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Call Customer"
                          >
                            <PhoneIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmailCustomer(customer);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Email Customer"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onWhatsAppCustomer(customer);
                            }}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.358-.737-1.574-.866-.216-.129-.496-.149-.692.046-.297.297-1.128 1.129-1.425 1.425-.232.232-.496.297-.862.297-.433 0-1.012-.216-1.725-.65-.713-.434-1.425-1.087-1.725-1.654-.297-.567-.297-1.128 0-1.695.297-.567.713-1.128 1.425-1.654.713-.527 1.287-.938 1.725-1.225.438-.297.65-.527.65-.862 0-.335-.216-.65-.65-.862-.434-.216-1.277-.737-1.574-.866-.297-.149-.496-.216-.692-.046-.297.297-1.128 1.129-1.425 1.425-.232.232-.496.297-.862.297-.433 0-1.012-.216-1.725-.65-.713-.434-1.425-1.087-1.725-1.654-.297-.567-.297-1.128 0-1.695.297-.567.713-1.128 1.425-1.654.713-.527 1.287-.938 1.725-1.225.438-.297.65-.527.65-.862 0-.335-.216-.65-.65-.862-.434-.216-1.277-.737-1.574-.866z"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                          </button>
                        </div>

                        {/* Management Actions */}
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewLedger(customer);
                            }}
                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Ledger"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewSalesHistory(customer);
                            }}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Sales History"
                          >
                            <ShoppingBagIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendReminder(customer);
                            }}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Send Reminder"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* More Actions Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle dropdown (simplified for now)
                            }}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="More Actions"
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Preview, Edit and Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCustomerSelect(customer);
                            }}
                            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Preview Customer"
                          >
                            <UserIcon className="h-4 w-4" />
                          </button>
                          {canManageCustomers ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCustomerEdit(customer);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Customer"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          ) : null}
                          {canManageCustomers ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(customer);
                              }}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Customer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredAndSortedCustomers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500">
                  {search || filter.status || filter.highValue || filter.duePayments
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first customer'
                  }
                </p>
                {(!search && !filter.status && !filter.highValue && !filter.duePayments && canManageCustomers) && (
                  <button
                    onClick={() => onCustomerEdit()}
                    className="btn btn-primary mt-4"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Customer
                  </button>
                )}
              </div>
            )}
          </div>
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

export default CustomerList;
