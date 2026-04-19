import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useQuery, useQueryClient } from 'react-query';
import { customersAPI } from '../services/api';
import CustomerForm from '../components/CustomerForm';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#ef4444'];

const sectionConfig = [
  { key: 'list', label: 'Customer List', href: '/contacts' },
  { key: 'create', label: 'Add Customer', href: '/contacts/create' },
  { key: 'ledger', label: 'Customer Ledger', href: '/contacts/ledger' },
  { key: 'sales-history', label: 'Sales History', href: '/contacts/sales-history' },
  { key: 'due-payments', label: 'Due Payments', href: '/contacts/due-payments' },
  { key: 'analytics', label: 'Analytics', href: '/contacts/analytics' },
  { key: 'communication', label: 'Notes / Communication', href: '/contacts/communication' },
  { key: 'alerts-reminders', label: 'Alerts / Reminders', href: '/contacts/alerts-reminders' },
  { key: 'import-export', label: 'Import / Export', href: '/contacts/import-export' },
  { key: 'segments', label: 'Tags / Segments', href: '/contacts/segments' },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (value) => {
  if (!value) return 'No record';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusTone = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  vip: 'bg-purple-100 text-purple-800',
  wholesale: 'bg-blue-100 text-blue-800',
  retail: 'bg-orange-100 text-orange-800',
};

const MetricCard = ({ label, value, tone = 'blue' }) => {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    red: 'bg-red-50 text-red-900',
    orange: 'bg-orange-50 text-orange-900',
    purple: 'bg-purple-50 text-purple-900',
  };

  return (
    <div className={`rounded-2xl p-4 ${toneClasses[tone] || toneClasses.blue}`}>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
};

const SectionCard = ({ title, subtitle, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
    {children}
  </div>
);

const Customers = ({ initialShowForm = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const section = location.pathname.split('/')[2] || 'list';

  const [showForm, setShowForm] = useState(initialShowForm || section === 'create');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({
    status: '',
    highValue: false,
    duePayments: false,
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    setShowForm(initialShowForm || section === 'create');
  }, [initialShowForm, section]);

  const { data: customerData, isLoading } = useQuery(
    ['customers', { search, ...filter }],
    () =>
      customersAPI.getAll({
        search,
        status: filter.status || undefined,
        highValue: filter.highValue || undefined,
        duePayments: filter.duePayments || undefined,
        limit: 100,
      }),
    { keepPreviousData: true }
  );

  const { data: analyticsData } = useQuery('customer-analytics', customersAPI.getAnalytics);

  const customers = useMemo(() => customerData?.data?.data?.customers || [], [customerData]);
  const analytics = analyticsData?.data?.data || {};

  useEffect(() => {
    if (!selectedCustomerId && customers[0]?._id) {
      setSelectedCustomerId(customers[0]._id);
    }
  }, [customers, selectedCustomerId]);

  const { data: selectedCustomerQuery } = useQuery(
    ['customer', selectedCustomerId],
    () => customersAPI.getById(selectedCustomerId),
    { enabled: Boolean(selectedCustomerId) }
  );

  const { data: ledgerQuery } = useQuery(
    ['customer-ledger', selectedCustomerId],
    () => customersAPI.getLedger(selectedCustomerId),
    { enabled: Boolean(selectedCustomerId) }
  );

  const selectedCustomer = selectedCustomerQuery?.data?.data?.customer || customers.find((customer) => customer._id === selectedCustomerId);
  const ledgerData = ledgerQuery?.data?.data;

  const dueCustomers = useMemo(
    () => customers.filter((customer) => (customer.metrics?.outstandingBalance || 0) > 0),
    [customers]
  );

  const segmentCards = useMemo(() => {
    const groups = customers.reduce((acc, customer) => {
      const tags = customer.tags?.length ? customer.tags : [customer.group || 'retail'];
      tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(groups).map(([name, count]) => ({ name, count }));
  }, [customers]);

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    if (section === 'create') {
      navigate('/contacts');
    }
  };

  const refreshCustomers = () => {
    closeForm();
    queryClient.invalidateQueries('customers');
    queryClient.invalidateQueries('customer');
    queryClient.invalidateQueries('customer-ledger');
    queryClient.invalidateQueries('customer-analytics');
  };

  const renderListSection = () => (
    <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6">
      <SectionCard title="Customer List" subtitle="Search, filter, and open any customer profile">
        <div className="flex flex-col lg:flex-row gap-4 mb-5">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search by name, phone, email, company, or GST"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="input"
              value={filter.status}
              onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All / Active / Inactive</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => setFilter((prev) => ({ ...prev, highValue: !prev.highValue }))}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${filter.highValue ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
            >
              High-value customers
            </button>
            <button
              onClick={() => setFilter((prev) => ({ ...prev, duePayments: !prev.duePayments }))}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${filter.duePayments ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}
            >
              Due payments
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Phone / Email', 'Total Purchases', 'Outstanding Balance', 'Last Purchase', 'Status'].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    onClick={() => setSelectedCustomerId(customer._id)}
                    className={`cursor-pointer hover:bg-blue-50 ${selectedCustomerId === customer._id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.company_name || customer.group}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <p>{customer.phone}</p>
                      <p>{customer.email || 'No email'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{customer.metrics?.totalPurchases || 0}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-red-600">{formatCurrency(customer.metrics?.outstandingBalance || 0)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{formatDate(customer.metrics?.lastPurchaseDate)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[customer.status] || statusTone.active}`}>
                          {customer.status}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[customer.payment_status] || statusTone.pending}`}>
                          {customer.payment_status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Customer Profile" subtitle="Split view with info, notes, ledger, and payment status">
        {selectedCustomer ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h4>
                <p className="text-sm text-gray-500">{selectedCustomer.company_name || 'Individual customer'}</p>
              </div>
              <button onClick={() => openEdit(selectedCustomer)} className="btn btn-secondary">Edit</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Total Spent" value={formatCurrency(selectedCustomer.metrics?.totalSpent || selectedCustomer.total_spent)} tone="green" />
              <MetricCard label="Outstanding" value={formatCurrency(selectedCustomer.metrics?.outstandingBalance || selectedCustomer.outstanding_balance)} tone="red" />
              <MetricCard label="Credit Limit" value={formatCurrency(selectedCustomer.credit_limit)} tone="blue" />
              <MetricCard label="Last Purchase" value={formatDate(selectedCustomer.metrics?.lastPurchaseDate || selectedCustomer.last_purchase_date)} tone="orange" />
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600"><PhoneIcon className="h-4 w-4" /> {selectedCustomer.phone}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><EnvelopeIcon className="h-4 w-4" /> {selectedCustomer.email || 'No email added'}</div>
              <div className="text-sm text-gray-600">GST: {selectedCustomer.gst_number || 'Not provided'}</div>
              <div className="text-sm text-gray-600">Address: {[selectedCustomer.address?.street, selectedCustomer.address?.city, selectedCustomer.address?.state, selectedCustomer.address?.zip].filter(Boolean).join(', ') || 'No address on file'}</div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Notes</p>
              <p className="rounded-2xl bg-yellow-50 p-4 text-sm text-gray-700">{selectedCustomer.notes || 'No notes yet.'}</p>
            </div>

            <div className="flex gap-3">
              <a href={`tel:${selectedCustomer.phone}`} className="btn btn-secondary flex-1">Call</a>
              <a href={`mailto:${selectedCustomer.email || ''}`} className="btn btn-secondary flex-1">Email</a>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Recent Ledger</p>
              <div className="space-y-2">
                {(ledgerData?.ledger || []).slice(-4).reverse().map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{entry.reference}</p>
                      <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-2">Balance: {formatCurrency(entry.runningBalance)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select a customer to open the profile panel.</p>
        )}
      </SectionCard>
    </div>
  );

  const renderLedgerSection = () => (
    <SectionCard title="Customer Ledger" subtitle="Credit / debit history with running balance">
      {selectedCustomer ? (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h4>
              <p className="text-sm text-gray-500">Running balance and transaction ledger</p>
            </div>
            <select className="input max-w-xs" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <MetricCard label="Total Purchases" value={ledgerData?.summary?.totalPurchases || 0} tone="blue" />
            <MetricCard label="Total Spent" value={formatCurrency(ledgerData?.summary?.totalSpent)} tone="green" />
            <MetricCard label="Outstanding" value={formatCurrency(ledgerData?.summary?.outstandingBalance)} tone="red" />
            <MetricCard label="Overdue" value={formatCurrency(ledgerData?.summary?.overdueAmount)} tone="orange" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Running Balance'].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(ledgerData?.ledger || []).map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{entry.debit ? formatCurrency(entry.debit) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{entry.credit ? formatCurrency(entry.credit) : '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(entry.runningBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Add a customer to start tracking ledgers.</p>
      )}
    </SectionCard>
  );

  const renderSalesHistorySection = () => (
    <SectionCard title="Customer Sales History" subtitle="Purchases, invoice references, and buying pattern">
      {selectedCustomer ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-3">
            {(ledgerData?.salesHistory || []).map((sale) => (
              <div key={sale._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{sale.sale_id}</p>
                  <Link to="/sell" className="text-sm font-medium text-blue-600">Open Invoice</Link>
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatDate(sale.sale_date)}</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">{formatCurrency(sale.total_amount)}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h4 className="font-semibold text-gray-900 mb-4">Product-wise Buying Pattern</h4>
            <div className="space-y-3">
              {(ledgerData?.productPattern || []).map((product) => (
                <div key={product.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Select a customer to view sales history.</p>
      )}
    </SectionCard>
  );

  const renderDuePaymentsSection = () => (
    <SectionCard title="Due Payments" subtitle="Outstanding amount, overdue risk, and reminder tracking">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Customers With Dues" value={dueCustomers.length} tone="red" />
        <MetricCard label="Total Outstanding" value={formatCurrency(dueCustomers.reduce((sum, customer) => sum + (customer.metrics?.outstandingBalance || 0), 0))} tone="orange" />
        <MetricCard label="Overdue Accounts" value={dueCustomers.filter((customer) => customer.payment_status === 'overdue').length} tone="purple" />
      </div>
      <div className="space-y-3">
        {dueCustomers.map((customer) => (
          <div key={customer._id} className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">Reminder: {formatDate(customer.follow_up_reminder)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-700">{formatCurrency(customer.metrics?.outstandingBalance || customer.outstanding_balance)}</p>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[customer.payment_status] || statusTone.pending}`}>
                  {customer.payment_status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderAnalyticsSection = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <SectionCard title="Customer Analytics" subtitle="Top customers, frequent buyers, and revenue segments">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricCard label="Total Customers" value={analytics.totalCustomers || 0} tone="blue" />
          <MetricCard label="Active Customers" value={analytics.activeCustomers || 0} tone="green" />
          <MetricCard label="Due Payments" value={analytics.duePayments || 0} tone="red" />
          <MetricCard label="VIP / High Value" value={(analytics.topCustomers || []).length} tone="purple" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={analytics.topCustomers || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="totalSpent" fill="#2563eb" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Customer Segments" subtitle="VIP, wholesale, retail, and custom tags">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={analytics.segmentDistribution || []} dataKey="value" nameKey="name" outerRadius={90} label>
              {(analytics.segmentDistribution || []).map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {(analytics.frequentBuyers || []).map((customer) => (
            <div key={customer._id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <p className="font-medium text-gray-900">{customer.name}</p>
              <p className="text-sm text-gray-500">{customer.totalPurchases} purchases</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );

  const renderCommunicationSection = () => (
    <SectionCard title="Notes / Communication" subtitle="Customer notes, contact actions, and follow-up reminders">
      {selectedCustomer ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
          <div className="rounded-2xl bg-gray-50 p-5 space-y-4">
            <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
            <div className="flex gap-3">
              <a href={`tel:${selectedCustomer.phone}`} className="btn btn-secondary flex-1">Call</a>
              <a href={`mailto:${selectedCustomer.email || ''}`} className="btn btn-secondary flex-1">Email</a>
            </div>
            <div className="text-sm text-gray-600">Follow-up reminder: {formatDate(selectedCustomer.follow_up_reminder)}</div>
            <div className="text-sm text-gray-600">Tags: {(selectedCustomer.tags || []).join(', ') || 'None'}</div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-3">Communication Notes</p>
            <div className="space-y-3">
              {(selectedCustomer.communication_log || []).length > 0 ? (
                selectedCustomer.communication_log.map((entry, index) => (
                  <div key={`${entry.created_at}-${index}`} className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{entry.type}</span>
                      <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                    </div>
                    <p className="font-medium text-gray-900 mt-3">{entry.subject || 'Customer note'}</p>
                    <p className="text-sm text-gray-600 mt-1">{entry.content}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                  No communication notes yet. Use the edit form to add notes and reminders.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Select a customer to view communication details.</p>
      )}
    </SectionCard>
  );

  const renderAlertsSection = () => (
    <SectionCard title="Alerts / Reminders" subtitle="Payment due reminders and follow-up alert queue">
      <div className="space-y-4">
        {customers
          .filter((customer) => customer.payment_status === 'overdue' || customer.follow_up_reminder)
          .map((customer) => (
            <div key={customer._id} className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">Follow-up: {formatDate(customer.follow_up_reminder)}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[customer.payment_status] || statusTone.pending}`}>
                    {customer.payment_status}
                  </span>
                  <p className="text-sm font-semibold text-red-700 mt-2">{formatCurrency(customer.metrics?.outstandingBalance || customer.outstanding_balance)}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </SectionCard>
  );

  const renderImportExportSection = () => (
    <SectionCard title="Import / Export" subtitle="Useful actions for real business operations">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <ArrowUpTrayIcon className="h-8 w-8 text-blue-600 mb-3" />
          <h4 className="font-semibold text-gray-900">Import Customers (CSV)</h4>
          <p className="text-sm text-gray-500 mt-2">Bring in customer data from your existing system or spreadsheet.</p>
          <button className="btn btn-secondary mt-4">Open Import Flow</button>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <ArrowDownTrayIcon className="h-8 w-8 text-green-600 mb-3" />
          <h4 className="font-semibold text-gray-900">Export Customer Data</h4>
          <p className="text-sm text-gray-500 mt-2">Export contacts, ledgers, due payments, and sales summaries.</p>
          <button className="btn btn-secondary mt-4">Export Data</button>
        </div>
      </div>
    </SectionCard>
  );

  const renderSegmentsSection = () => (
    <SectionCard title="Tags / Segments" subtitle="VIP, wholesale, retail, and custom customer groups">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {segmentCards.map((segment) => (
          <div key={segment.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 capitalize">{segment.name}</p>
                <p className="text-sm text-gray-500">Customers in this segment</p>
              </div>
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{segment.count}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {customers.map((customer) => (
          <div key={customer._id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{customer.name}</p>
              <p className="text-sm text-gray-500">{(customer.tags || []).join(', ') || customer.group}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[customer.group] || statusTone.retail}`}>
              {customer.group}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const sectionRenderer = {
    list: renderListSection,
    create: renderListSection,
    ledger: renderLedgerSection,
    'sales-history': renderSalesHistorySection,
    'due-payments': renderDuePaymentsSection,
    analytics: renderAnalyticsSection,
    communication: renderCommunicationSection,
    'alerts-reminders': renderAlertsSection,
    'import-export': renderImportExportSection,
    segments: renderSegmentsSection,
  };

  const ActiveSection = sectionRenderer[section] || renderListSection;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Contacts, ledger, sales history, due payments, analytics, reminders, and segments.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" /> Add Customer
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Customers" value={customers.length} tone="blue" />
        <MetricCard label="Outstanding" value={formatCurrency(dueCustomers.reduce((sum, customer) => sum + (customer.metrics?.outstandingBalance || 0), 0))} tone="red" />
        <MetricCard label="Due Accounts" value={dueCustomers.length} tone="orange" />
        <MetricCard label="Frequent Buyers" value={(analytics.frequentBuyers || []).length} tone="purple" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {sectionConfig.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${section === item.key || (section === 'list' && item.key === 'list') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <ActiveSection />

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={closeForm}
          onSuccess={refreshCustomers}
        />
      )}
    </div>
  );
};

export default Customers;
