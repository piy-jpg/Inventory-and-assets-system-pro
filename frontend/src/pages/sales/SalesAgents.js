import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  XMarkIcon,
  TrophyIcon,
  ChartBarIcon,
  StarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SalesAgents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPerformance, setFilterPerformance] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    department: 'Sales',
    hireDate: '',
    commissionRate: 5,
    targetAmount: 50000,
    status: 'active',
    notes: ''
  });

  const canManageAgents = ['admin', 'manager'].includes(user?.role);
  const canDeleteAgents = ['admin'].includes(user?.role);

  // Mock agents data
  const [agents] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      department: 'Sales',
      hireDate: '2022-03-15',
      commissionRate: 5.5,
      targetAmount: 75000,
      status: 'active',
      totalSales: 125750.50,
      totalOrders: 45,
      averageOrderValue: 2794.46,
      conversionRate: 68.5,
      customerSatisfaction: 4.8,
      currentMonthSales: 15499.99,
      currentMonthTarget: 12500,
      yearToDateSales: 125750.50,
      yearToDateTarget: 75000,
      topProduct: 'Laptop Pro 15"',
      topCustomer: 'ABC Corporation',
      notes: 'Top performing agent with excellent customer relationships',
      createdAt: '2022-03-15T09:00:00Z',
      lastActive: '2024-04-22T16:30:00Z'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      department: 'Sales',
      hireDate: '2021-11-20',
      commissionRate: 6.0,
      targetAmount: 60000,
      status: 'active',
      totalSales: 98750.00,
      totalOrders: 38,
      averageOrderValue: 2598.68,
      conversionRate: 72.3,
      customerSatisfaction: 4.9,
      currentMonthSales: 8750.00,
      currentMonthTarget: 10000,
      yearToDateSales: 98750.00,
      yearToDateTarget: 60000,
      topProduct: 'Office Equipment Bundle',
      topCustomer: 'XYZ Retail Store',
      notes: 'Consistent performer with high customer satisfaction',
      createdAt: '2021-11-20T10:30:00Z',
      lastActive: '2024-04-22T14:15:00Z'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com',
      phone: '+1 (555) 456-7890',
      address: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
      department: 'Sales',
      hireDate: '2023-01-10',
      commissionRate: 5.0,
      targetAmount: 50000,
      status: 'active',
      totalSales: 45800.75,
      totalOrders: 28,
      averageOrderValue: 1635.74,
      conversionRate: 65.2,
      customerSatisfaction: 4.6,
      currentMonthSales: 23450.50,
      currentMonthTarget: 8333,
      yearToDateSales: 45800.75,
      yearToDateTarget: 50000,
      topProduct: 'Laptop Pro 15"',
      topCustomer: 'Tech Solutions Ltd',
      notes: 'Fast-growing agent with strong technical knowledge',
      createdAt: '2023-01-10T11:45:00Z',
      lastActive: '2024-04-22T11:30:00Z'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 321-6547',
      address: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
      department: 'Sales',
      hireDate: '2022-07-05',
      commissionRate: 5.5,
      targetAmount: 55000,
      status: 'active',
      totalSales: 67800.25,
      totalOrders: 32,
      averageOrderValue: 2118.76,
      conversionRate: 70.1,
      customerSatisfaction: 4.7,
      currentMonthSales: 3250.75,
      currentMonthTarget: 9167,
      yearToDateSales: 67800.25,
      yearToDateTarget: 55000,
      topProduct: 'Office Chair',
      topCustomer: 'Local Business Inc',
      notes: 'Reliable agent with good customer relationships',
      createdAt: '2022-07-05T13:20:00Z',
      lastActive: '2024-04-21T16:45:00Z'
    },
    {
      id: 5,
      name: 'Robert Chen',
      email: 'robert.chen@company.com',
      phone: '+1 (555) 654-3210',
      address: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA',
      department: 'Sales',
      hireDate: '2023-06-15',
      commissionRate: 4.5,
      targetAmount: 45000,
      status: 'inactive',
      totalSales: 12500.00,
      totalOrders: 8,
      averageOrderValue: 1562.50,
      conversionRate: 58.3,
      customerSatisfaction: 4.2,
      currentMonthSales: 0,
      currentMonthTarget: 7500,
      yearToDateSales: 12500.00,
      yearToDateTarget: 45000,
      topProduct: 'USB-C Cable',
      topCustomer: 'Global Trading Co',
      notes: 'On leave - returning next month',
      createdAt: '2023-06-15T09:15:00Z',
      lastActive: '2024-03-15T10:30:00Z'
    }
  ]);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        agent.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    const matchesPerformance = filterPerformance === 'all' || 
      (filterPerformance === 'excellent' && agent.yearToDateSales >= agent.yearToDateTarget) ||
      (filterPerformance === 'good' && agent.yearToDateSales >= agent.yearToDateTarget * 0.8) ||
      (filterPerformance === 'average' && agent.yearToDateSales >= agent.yearToDateTarget * 0.6) ||
      (filterPerformance === 'below' && agent.yearToDateSales < agent.yearToDateTarget * 0.6);
    
    return matchesSearch && matchesStatus && matchesPerformance;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent':
        return 'bg-purple-100 text-purple-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-yellow-100 text-yellow-800';
      case 'below':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceBadge = (agent) => {
    if (agent.yearToDateSales >= agent.yearToDateTarget) return 'excellent';
    if (agent.yearToDateSales >= agent.yearToDateTarget * 0.8) return 'good';
    if (agent.yearToDateSales >= agent.yearToDateTarget * 0.6) return 'average';
    return 'below';
  };

  const totalAgents = filteredAgents.length;
  const activeAgents = filteredAgents.filter(a => a.status === 'active').length;
  const totalSales = filteredAgents.reduce((sum, a) => sum + a.yearToDateSales, 0);
  const totalTarget = filteredAgents.reduce((sum, a) => sum + a.yearToDateTarget, 0);
  const averagePerformance = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;

  const openDetailsModal = (agent) => {
    setSelectedAgent(agent);
    setShowDetailsModal(true);
  };

  const openEditModal = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      address: agent.address,
      city: agent.city,
      state: agent.state,
      zipCode: agent.zipCode,
      country: agent.country,
      department: agent.department,
      hireDate: agent.hireDate,
      commissionRate: agent.commissionRate,
      targetAmount: agent.targetAmount,
      status: agent.status,
      notes: agent.notes
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const handleAddAgent = () => {
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Agent name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    console.log('Adding agent:', formData);
    toast.success('Agent added successfully!');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditAgent = () => {
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Agent name is required');
      return;
    }
    
    console.log('Updating agent:', formData);
    toast.success('Agent updated successfully!');
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteAgent = () => {
    console.log('Deleting agent:', selectedAgent);
    toast.success('Agent deleted successfully!');
    setShowDeleteModal(false);
    setSelectedAgent(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      department: 'Sales',
      hireDate: '',
      commissionRate: 5,
      targetAmount: 50000,
      status: 'active',
      notes: ''
    });
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
            <h1 className="page-title">Sales Agents</h1>
            <p className="page-subtitle">Manage sales team performance and assignments</p>
          </div>
          {canManageAgents && (
            <button className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Add Agent</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-green-600">{activeAgents}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-purple-600">${totalSales.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Performance</p>
              <p className="text-2xl font-bold text-orange-600">{averagePerformance.toFixed(1)}%</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-4 w-4 text-orange-600" />
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
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
            
            <select
              value={filterPerformance}
              onChange={(e) => setFilterPerformance(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Performance</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="below">Below Target</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Agents Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Data
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
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No agents found
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-500">{agent.department}</div>
                          <div className="text-xs text-gray-500">Hired: {agent.hireDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          <span>{agent.email}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          <span>{agent.phone}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span>{agent.city}, {agent.state}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(getPerformanceBadge(agent))}`}>
                            {getPerformanceBadge(agent).charAt(0).toUpperCase() + getPerformanceBadge(agent).slice(1)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(agent.customerSatisfaction)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{agent.customerSatisfaction}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Conversion: {agent.conversionRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Commission: {agent.commissionRate}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>YTD: ${agent.yearToDateSales.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Target: ${agent.yearToDateTarget.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {((agent.yearToDateSales / agent.yearToDateTarget) * 100).toFixed(1)}% of target
                        </div>
                        <div className="text-xs text-gray-500">
                          {agent.totalOrders} orders • Avg: ${agent.averageOrderValue.toFixed(0)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {['admin', 'manager'].includes(user?.role) && (
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          className="text-purple-600 hover:text-purple-900"
                          title="Print"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const data = [
                              ['Name', 'Email', 'Phone', 'City', 'State', 'Performance', 'YTD Sales', 'Target', 'Status'],
                              [agent.name, agent.email, agent.phone, agent.city, agent.state, agent.customerSatisfaction, agent.yearToDateSales, agent.yearToDateTarget, agent.status]
                            ];
                            const csv = data.map(row => row.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `agent-${agent.name.replace(/\s+/g, '-')}.csv`;
                            link.click();
                            URL.revokeObjectURL(url);
                            toast.success('Agent downloaded successfully');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        {['admin', 'manager'].includes(user?.role) && (
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Agent Details Modal */}
      {showDetailsModal && selectedAgent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Agent Details - {selectedAgent.name}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-sm text-gray-900">{selectedAgent.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{selectedAgent.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm text-gray-900">{selectedAgent.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Department</p>
                <p className="text-sm text-gray-900">{selectedAgent.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-sm text-gray-900">{selectedAgent.city}, {selectedAgent.state}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Hire Date</p>
                <p className="text-sm text-gray-900">{selectedAgent.hireDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-sm text-gray-900">{selectedAgent.commissionRate}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgent.status)}`}>
                  {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1).replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Year to Date Sales</p>
                  <p className="text-lg font-medium text-gray-900">${selectedAgent.yearToDateSales.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Target: ${selectedAgent.yearToDateTarget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Month Sales</p>
                  <p className="text-lg font-medium text-gray-900">${selectedAgent.currentMonthSales.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Target: ${selectedAgent.currentMonthTarget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-lg font-medium text-gray-900">{selectedAgent.totalOrders}</p>
                  <p className="text-xs text-gray-500">Avg: ${selectedAgent.averageOrderValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-lg font-medium text-gray-900">{selectedAgent.conversionRate}%</p>
                  <p className="text-xs text-gray-500">Industry avg: 65%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(selectedAgent.customerSatisfaction)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium text-gray-900">{selectedAgent.customerSatisfaction}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(getPerformanceBadge(selectedAgent))}`}>
                    {getPerformanceBadge(selectedAgent).charAt(0).toUpperCase() + getPerformanceBadge(selectedAgent).slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Top Performers</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Product</p>
                  <p className="text-sm text-gray-900">{selectedAgent.topProduct}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Customer</p>
                  <p className="text-sm text-gray-900">{selectedAgent.topCustomer}</p>
                </div>
              </div>
            </div>

            {selectedAgent.notes && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900 mt-1">{selectedAgent.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button className="btn btn-primary">
                View Full Report
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Sales Agent</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Sales">Sales</option>
                  <option value="Enterprise Sales">Enterprise Sales</option>
                  <option value="Inside Sales">Inside Sales</option>
                  <option value="Field Sales">Field Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Target</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAgent}
                className="btn btn-primary"
              >
                Add Agent
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Agent Modal */}
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Sales Agent</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Same form fields as Add Agent Modal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Sales">Sales</option>
                  <option value="Enterprise Sales">Enterprise Sales</option>
                  <option value="Inside Sales">Inside Sales</option>
                  <option value="Field Sales">Field Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Target</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAgent}
                className="btn btn-primary"
              >
                Update Agent
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Agent Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Agent</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete "{selectedAgent?.name}"?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgent}
                className="btn btn-danger"
              >
                Delete Agent
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesAgents;
