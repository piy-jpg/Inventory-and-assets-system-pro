import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ArrowPathIcon, SignalIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { customersAPI } from '../services/api';
import CustomerList from '../components/CustomerList';
import CustomerForm from '../components/CustomerForm';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomerLedger from './CustomerLedger';
import SalesHistory from './SalesHistory';
import DuePayments from './DuePayments';
import CustomerAnalytics from './CustomerAnalytics';
import { useAuth } from '../hooks/useAuth';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

const sectionConfig = [
  { key: 'list', label: 'Customer List', href: '/contacts' },
  { key: 'create', label: 'Add Customer', href: '/contacts/create' },
  { key: 'ledger', label: 'Customer Ledger', href: '/contacts/ledger' },
  { key: 'sales-history', label: 'Sales History', href: '/contacts/sales-history' },
  { key: 'due-payments', label: 'Due Payments', href: '/contacts/due-payments' },
  { key: 'analytics', label: 'Analytics', href: '/contacts/analytics' },
  { key: 'communication', label: 'Communication', href: '/contacts/communication' },
];

const sectionRoles = {
  list: ['admin', 'manager', 'staff', 'viewer'],
  create: ['admin', 'manager', 'staff'],
  ledger: ['admin', 'manager', 'staff', 'viewer'],
  'sales-history': ['admin', 'manager', 'staff', 'viewer'],
  'due-payments': ['admin', 'manager', 'staff', 'viewer'],
  analytics: ['admin', 'manager', 'staff', 'viewer'],
  communication: ['admin', 'manager', 'staff', 'viewer'],
};

const formatDateTime = (value) => {
  if (!value) return 'No timestamp';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const Customers = ({ initialShowForm = false, section: sectionProp = 'list' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '', highValue: false, duePayments: false });
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showForm, setShowForm] = useState(initialShowForm || sectionProp === 'create');
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);
  const [quickNoteCustomer, setQuickNoteCustomer] = useState(null);
  const [quickNoteContent, setQuickNoteContent] = useState('');

  const { isConnected, subscribe } = useRealTimeUpdates();

  const canManageCustomers = ['admin', 'manager', 'staff'].includes(user?.role);
  const canUseImportExport = ['admin', 'manager'].includes(user?.role);

  const { data: customersResponse, isLoading, refetch, isFetching } = useQuery(
    ['customers', { search, ...filter }],
    () =>
      customersAPI.getAll({
        search,
        status: filter.status || undefined,
        highValue: filter.highValue || undefined,
        duePayments: filter.duePayments || undefined,
      }),
    {
      keepPreviousData: true,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    }
  );

  const { data: analyticsResponse } = useQuery('customer-analytics', customersAPI.getAnalytics, {
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: importExportResponse } = useQuery('customer-import-export', customersAPI.getImportExport, {
    enabled: canUseImportExport,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
  });

  const customers = useMemo(
    () => customersResponse?.data?.data?.customers || [],
    [customersResponse]
  );
  const analytics = analyticsResponse?.data?.data || {};
  const importExport = importExportResponse?.data?.data || {};
  const selectedCustomer = customers.find((customer) => customer._id === selectedCustomerId) || null;

  // Mutation to add quick note
  const addQuickNoteMutation = useMutation(
    async ({ customerId, content }) => {
      const stored = localStorage.getItem(`communication_${customerId}`) || '[]';
      const log = JSON.parse(stored);
      
      const newEntry = {
        id: `COMM_${Date.now()}`,
        type: 'note',
        subject: 'Quick Note',
        content,
        created_at: new Date().toISOString(),
        created_by: user?.firstName + ' ' + user?.lastName || 'Current User',
        priority: 'normal'
      };
      
      log.unshift(newEntry);
      localStorage.setItem(`communication_${customerId}`, JSON.stringify(log));
      
      return newEntry;
    },
    {
      onSuccess: () => {
        toast.success('Quick note added successfully');
        setShowQuickNoteModal(false);
        setQuickNoteContent('');
      },
      onError: () => {
        toast.error('Failed to add quick note');
      }
    }
  );

  useEffect(() => {
    setShowForm(initialShowForm || sectionProp === 'create');
  }, [initialShowForm, sectionProp]);

  useEffect(() => {
    const unsubscribe = subscribe('customers:updated', () => {
      queryClient.invalidateQueries('customers');
      queryClient.invalidateQueries('customer-analytics');
    });

    return unsubscribe;
  }, [queryClient, subscribe]);

  const createOrUpdateSuccess = () => {
    setShowForm(false);
    setEditingCustomer(null);
    queryClient.invalidateQueries('customers');
    queryClient.invalidateQueries('customer-analytics');
  };

  const deleteMutation = useMutation(customersAPI.delete, {
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries('customers');
      queryClient.invalidateQueries('customer-analytics');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    },
  });

  const exportCustomers = () => {
    const blob = new Blob([JSON.stringify(customers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `customers-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Customer export downloaded.');
  };

  const handleOpenCreate = () => {
    if (!canManageCustomers) {
      toast.error('You do not have permission to add customers');
      return;
    }

    setEditingCustomer(null);
    setShowForm(true);
  };

  const renderCommunicationSection = () => (
    <div className="space-y-6">
      <SectionShell
        title="Customer Communication"
        subtitle="View customer notes, reminders, and outreach activity with live refresh."
        isConnected={isConnected}
        isFetching={isFetching}
        onRefresh={refetch}
      />

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
          <div className="mt-4 space-y-2">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition"
              >
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email || customer.phone}</p>
                {customer.description && (
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">{customer.description}</p>
                )}
                <div className="mt-3 flex gap-2">
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                    >
                      <PhoneIcon className="h-3 w-3" />
                      Call
                    </a>
                  )}
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <EnvelopeIcon className="h-3 w-3" />
                      Email
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-3 w-3" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Note Modal */}
      {showQuickNoteModal && quickNoteCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Quick Note - {quickNoteCustomer.name}
              </h3>
              <button
                onClick={() => {
                  setShowQuickNoteModal(false);
                  setQuickNoteCustomer(null);
                  setQuickNoteContent('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <textarea
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  className="input mt-1"
                  rows={4}
                  placeholder="Enter your quick note..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowQuickNoteModal(false);
                    setQuickNoteCustomer(null);
                    setQuickNoteContent('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!quickNoteContent.trim()) {
                      toast.error('Please enter a note');
                      return;
                    }
                    addQuickNoteMutation.mutate({
                      customerId: quickNoteCustomer._id,
                      content: quickNoteContent
                    });
                  }}
                  className="btn btn-primary"
                  disabled={addQuickNoteMutation.isLoading}
                >
                  {addQuickNoteMutation.isLoading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderImportExportSection = () => (
    <div className="space-y-6">
      <SectionShell
        title="Customer Import / Export"
        subtitle="Operational tools for moving contact data in and out of the system."
        isConnected={isConnected}
        isFetching={isFetching}
        onRefresh={refetch}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Export Dataset</h3>
          <p className="mt-1 text-sm text-gray-500">Download the current customer dataset as JSON.</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <MetricCard label="Customers" value={customers.length} />
            <MetricCard label="High Value" value={customers.filter((item) => (item.metrics?.totalSpent || 0) > 2000).length} />
          </div>
          <button type="button" onClick={exportCustomers} className="btn btn-primary mt-5">
            Export Customers
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Import / Sync Insights</h3>
          <p className="mt-1 text-sm text-gray-500">Current import-export analytics from the shared customer API.</p>
          <div className="mt-5 space-y-3 text-sm text-gray-700">
            {Object.keys(importExport).length > 0 ? (
              Object.entries(importExport).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="font-medium capitalize text-gray-900">{key.replace(/_/g, ' ')}</span>
                  <span>{typeof value === 'number' ? value : JSON.stringify(value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-gray-300 p-6 text-gray-500">
                Import/export analytics are not available for this dataset yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderListSection = () => (
    <div className="space-y-6">
      <SectionShell
        title="Contacts"
        subtitle="Manage customer records with live refresh, role-aware editing, and linked customer workflows."
        isConnected={isConnected}
        isFetching={isFetching}
        onRefresh={refetch}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Customers" value={analytics.totalCustomers || customers.length} />
        <MetricCard label="Active" value={analytics.activeCustomers || customers.filter((item) => item.status === 'active').length} />
        <MetricCard label="Due Payments" value={analytics.duePayments || customers.filter((item) => (item.metrics?.outstandingBalance || 0) > 0).length} />
        <MetricCard label="Revenue" value={analytics.totalRevenue || 0} currency />
      </div>

      <CustomerList
        customers={customers}
        isLoading={isLoading}
        onCustomerSelect={(customer) => setSelectedCustomerId(customer._id)}
        onCustomerEdit={(customer) => {
          if (customer?._id) {
            setEditingCustomer(customer);
          } else {
            setEditingCustomer(null);
          }
          setShowForm(true);
        }}
        onCustomerDelete={(customerId) => deleteMutation.mutate(customerId)}
        selectedCustomerId={selectedCustomerId}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        onCallCustomer={(customer) => {
          if (customer?.phone) {
            window.location.href = `tel:${customer.phone}`;
          }
        }}
        onEmailCustomer={(customer) => {
          if (customer?.email) {
            window.location.href = `mailto:${customer.email}`;
          }
        }}
        onWhatsAppCustomer={(customer) => {
          if (customer?.phone) {
            window.open(`https://wa.me/${String(customer.phone).replace(/[^\d]/g, '')}`, '_blank');
          }
        }}
        onSendSMS={(customer) => {
          if (customer?.phone) {
            window.location.href = `sms:${customer.phone}`;
          }
        }}
        onViewLedger={() => navigate('/contacts/ledger')}
        onViewSalesHistory={() => navigate('/contacts/sales-history')}
        onSendReminder={(customer) => toast.success(`Reminder queued for ${customer.name}`)}
        onAddNote={(customer) => toast.success(`Add note flow opened for ${customer.name}`)}
        onScheduleFollowUp={(customer) => toast.success(`Follow-up scheduled for ${customer.name}`)}
        onExportData={(customer) => toast.success(`Export prepared for ${customer.name}`)}
        onDuplicateCustomer={(customer) => {
          if (!canManageCustomers) {
            toast.error('You do not have permission to duplicate customers');
            return;
          }
          customersAPI
            .create({
              ...customer,
              name: `${customer.name} Copy`,
              email: '',
            })
            .then(() => {
              queryClient.invalidateQueries('customers');
              toast.success(`Duplicated ${customer.name}`);
            });
        }}
        canManageCustomers={canManageCustomers}
        canUseImportExport={canUseImportExport}
      />
    </div>
  );

  const visibleSections = useMemo(
    () => sectionConfig.filter((item) => (sectionRoles[item.key] || sectionRoles.list).includes(user?.role)),
    [user?.role]
  );

  const activeSection = sectionProp === 'create' ? 'list' : sectionProp;

  if (sectionProp === 'ledger') {
    return <WrappedSectionNav sections={visibleSections}><CustomerLedger /></WrappedSectionNav>;
  }

  if (sectionProp === 'sales-history') {
    return <WrappedSectionNav sections={visibleSections}><SalesHistory /></WrappedSectionNav>;
  }

  if (sectionProp === 'due-payments') {
    return <WrappedSectionNav sections={visibleSections}><DuePayments /></WrappedSectionNav>;
  }

  if (sectionProp === 'analytics') {
    return <WrappedSectionNav sections={visibleSections}><CustomerAnalytics /></WrappedSectionNav>;
  }

  if (sectionProp === 'communication') {
    return <WrappedSectionNav sections={visibleSections}>{renderCommunicationSection()}</WrappedSectionNav>;
  }

  if (sectionProp === 'import-export') {
    return <WrappedSectionNav sections={visibleSections}>{renderImportExportSection()}</WrappedSectionNav>;
  }

  return (
    <WrappedSectionNav sections={visibleSections} activeSection={activeSection}>
      {isLoading ? <LoadingSpinner size="large" /> : renderListSection()}

      {showForm ? (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSuccess={createOrUpdateSuccess}
        />
      ) : null}

      {!showForm && sectionProp === 'create' && canManageCustomers ? (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <div className="flex items-center justify-between gap-3">
            <span>Use the add customer action to create a new contact record.</span>
            <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
              Add Customer
            </button>
          </div>
        </div>
      ) : null}
    </WrappedSectionNav>
  );
};

const WrappedSectionNav = ({ sections, children, activeSection }) => (
  <div className="space-y-6">
    <div className="flex flex-wrap gap-2">
      {sections.map((item) => (
        <NavLink
          key={item.key}
          to={item.href}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive || activeSection === item.key
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
    {children}
  </div>
);

const SectionShell = ({ title, subtitle, isConnected, isFetching, onRefresh }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-600">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <SignalIcon className="mr-2 h-4 w-4" />
          {isConnected ? 'Realtime online' : 'Realtime fallback'}
        </div>
        <button type="button" onClick={onRefresh} className="btn btn-secondary flex items-center">
          <ArrowPathIcon className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  </div>
);

const MetricCard = ({ label, value, currency = false }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-3 text-2xl font-bold text-gray-900">
      {currency
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(Number(value || 0))
        : value}
    </p>
  </div>
);

export default Customers;
