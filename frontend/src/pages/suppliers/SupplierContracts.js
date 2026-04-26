import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SupplierContracts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    contractTitle: '',
    contractType: 'supply',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    termsAndConditions: '',
    renewalTerms: '',
    status: 'active',
    value: 0,
    notes: ''
  });

  const canManageContracts = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteContracts = ['admin', 'manager'].includes(user?.role);

  const queryClient = useQueryClient();

  // Real-time supplier contracts data
  const { data: contractsData, isLoading, refetch } = useQuery(
    'supplierContracts',
    () => {
      const storedContracts = localStorage.getItem('supplierContracts');
      if (storedContracts) {
        return JSON.parse(storedContracts);
      }
      
      return [
        {
          _id: 'CON_001',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          contractTitle: 'Annual Electronics Supply Agreement',
          contractType: 'supply',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          termsAndConditions: 'Supplier agrees to provide electronic components with 30-day delivery terms and 90-day payment terms.',
          renewalTerms: 'Automatic renewal for 1-year periods with 30-day notice for cancellation.',
          status: 'active',
          value: 250000.00,
          notes: 'Primary supplier for all electronic components',
          renewalReminder: '2024-12-01',
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T09:00:00Z'
        },
        {
          _id: 'CON_002',
          supplierId: 'SUP_002',
          supplierName: 'Office Furniture Co.',
          contractTitle: 'Office Furniture Maintenance Agreement',
          contractType: 'service',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          termsAndConditions: 'Quarterly maintenance visits and emergency repair services within 48 hours.',
          renewalTerms: 'Renewal subject to performance review and price adjustment.',
          status: 'active',
          value: 15000.00,
          notes: 'Annual maintenance contract for all office furniture',
          renewalReminder: '2025-01-01',
          createdAt: '2024-02-01T10:30:00Z',
          updatedAt: '2024-02-01T10:30:00Z'
        },
        {
          _id: 'CON_003',
          supplierId: 'SUP_003',
          supplierName: 'Stationery World',
          contractTitle: 'Stationery Supply Contract',
          contractType: 'supply',
          startDate: '2024-03-01',
          endDate: '2024-08-31',
          termsAndConditions: 'Monthly delivery of stationery items with bulk pricing discounts.',
          renewalTerms: '6-month contract with option to extend based on volume requirements.',
          status: 'active',
          value: 35000.00,
          notes: 'Seasonal contract for high-demand periods',
          renewalReminder: '2024-08-01',
          createdAt: '2024-03-01T14:20:00Z',
          updatedAt: '2024-03-01T14:20:00Z'
        },
        {
          _id: 'CON_004',
          supplierId: 'SUP_004',
          supplierName: 'Computer Parts Ltd.',
          contractTitle: 'Backup Supplier Agreement',
          contractType: 'supply',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          termsAndConditions: 'Secondary supplier for computer components with 7-day delivery terms.',
          renewalTerms: 'Contract review required based on primary supplier performance.',
          status: 'expired',
          value: 50000.00,
          notes: 'Backup supplier agreement, not actively used',
          renewalReminder: '2024-06-01',
          createdAt: '2024-01-15T11:45:00Z',
          updatedAt: '2024-06-30T23:59:00Z'
        }
      ];
    },
    {
      refetchInterval: 12000, // Real-time refresh every 12 seconds
      onSuccess: (data) => {
        console.log('Supplier contracts data refreshed:', data);
      }
    }
  );

  // Get suppliers data for dropdown
  const { data: suppliersData } = useQuery(
    'suppliers',
    () => {
      const storedSuppliers = localStorage.getItem('suppliers');
      return storedSuppliers ? JSON.parse(storedSuppliers) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Mutation for creating new contract
  const createContractMutation = useMutation(
    async (contractData) => {
      const contracts = contractsData || [];
      const newContract = {
        ...contractData,
        _id: `CON_${Date.now()}`,
        supplierName: suppliersData.find(s => s._id === contractData.supplierId)?.name || 'Unknown Supplier',
        renewalReminder: contractData.endDate ? new Date(new Date(contractData.endDate).setDate(new Date(contractData.endDate).getDate() - 30)).toISOString().split('T')[0] : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedContracts = [...contracts, newContract];
      localStorage.setItem('supplierContracts', JSON.stringify(updatedContracts));
      queryClient.setQueryData('supplierContracts', updatedContracts);
      
      // Real-time logging
      const logEntry = {
        action: 'create_contract',
        contractId: newContract._id,
        supplierId: contractData.supplierId,
        contractTitle: contractData.contractTitle,
        value: contractData.value,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierContractLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierContractLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierContractCreated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierContractsActivityUpdate', { detail: logEntry }));
      
      console.log('📄 Real-time: Supplier contract created', logEntry);
      
      return newContract;
    },
    {
      onSuccess: () => {
        toast.success('Contract created successfully');
        setShowContractModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create contract');
      }
    }
  );

  // Mutation for updating contract
  const updateContractMutation = useMutation(
    async (updatedContract) => {
      const contracts = contractsData || [];
      const updatedContracts = contracts.map(contract => 
        contract._id === updatedContract._id ? {
          ...updatedContract,
          supplierName: suppliersData.find(s => s._id === updatedContract.supplierId)?.name || contract.supplierName,
          renewalReminder: updatedContract.endDate ? new Date(new Date(updatedContract.endDate).setDate(new Date(updatedContract.endDate).getDate() - 30)).toISOString().split('T')[0] : contract.renewalReminder,
          updatedAt: new Date().toISOString()
        } : contract
      );
      localStorage.setItem('supplierContracts', JSON.stringify(updatedContracts));
      queryClient.setQueryData('supplierContracts', updatedContracts);
      
      // Real-time logging
      const logEntry = {
        action: 'update_contract',
        contractId: updatedContract._id,
        supplierId: updatedContract.supplierId,
        contractTitle: updatedContract.contractTitle,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierContractLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierContractLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierContractUpdated', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierContractsActivityUpdate', { detail: logEntry }));
      
      console.log('📝 Real-time: Supplier contract updated', logEntry);
      
      return updatedContracts;
    },
    {
      onSuccess: () => {
        toast.success('Contract updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update contract');
      }
    }
  );

  // Mutation for deleting contract
  const deleteContractMutation = useMutation(
    async (contractId) => {
      const contracts = contractsData || [];
      const deletedContract = contracts.find(c => c._id === contractId);
      const updatedContracts = contracts.filter(contract => contract._id !== contractId);
      localStorage.setItem('supplierContracts', JSON.stringify(updatedContracts));
      queryClient.setQueryData('supplierContracts', updatedContracts);
      
      // Real-time logging
      const logEntry = {
        action: 'delete_contract',
        contractId,
        contractTitle: deletedContract?.contractTitle,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierContractLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierContractLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierContractDeleted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierContractsActivityUpdate', { detail: logEntry }));
      
      console.log('🗑️ Real-time: Supplier contract deleted', logEntry);
      
      return updatedContracts;
    },
    {
      onSuccess: () => {
        toast.success('Contract deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete contract');
      }
    }
  );

  const contracts = contractsData || [];
  const suppliers = suppliersData || [];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contract.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contract.termsAndConditions?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const matchesSupplier = filterSupplier === 'all' || contract.supplierId === filterSupplier;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const resetForm = () => {
    setFormData({
      supplierId: '',
      contractTitle: '',
      contractType: 'supply',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      termsAndConditions: '',
      renewalTerms: '',
      status: 'active',
      value: 0,
      notes: ''
    });
  };

  const openDetailsModal = (contract) => {
    setSelectedContract(contract);
    setShowDetailsModal(true);
  };

  const openContractModal = () => {
    resetForm();
    setShowContractModal(true);
  };

  const handleCreateContract = () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (!formData.contractTitle.trim()) {
      toast.error('Contract title is required');
      return;
    }

    if (!formData.startDate) {
      toast.error('Start date is required');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    createContractMutation.mutate(formData);
  };

  const handleUpdateContract = () => {
    if (!selectedContract) return;

    updateContractMutation.mutate({
      ...selectedContract,
      ...formData
    });
  };

  const handleDeleteContract = () => {
    if (!selectedContract) return;

    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      deleteContractMutation.mutate(selectedContract._id);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Supplier contracts data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'supply':
        return 'bg-blue-100 text-blue-800';
      case 'service':
        return 'bg-purple-100 text-purple-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'consulting':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate statistics
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(contract => contract.status === 'active').length;
  const expiredContracts = contracts.filter(contract => contract.status === 'expired').length;
  const totalValue = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const expiringSoon = contracts.filter(contract => {
    const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
    return daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  // Contract type breakdown
  const typeBreakdown = contracts.reduce((acc, contract) => {
    acc[contract.contractType] = (acc[contract.contractType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Supplier Contracts</h1>
            <p className="page-subtitle">Upload agreements, Terms & conditions, Renewal reminders</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={openContractModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Contract</span>
            </button>
          </div>
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
              <p className="text-sm font-medium text-gray-600">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeContracts}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{expiringSoon}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contract Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">{type}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
              <option value="terminated">Terminated</option>
            </select>
            
            <select
              className="input"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Contracts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
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
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No contracts found
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
                  return (
                    <tr key={contract._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contract.contractTitle}</div>
                        {contract.renewalReminder && (
                          <div className="text-xs text-gray-500">
                            Renewal reminder: {contract.renewalReminder}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contract.supplierName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contract.contractType)}`}>
                          {contract.contractType.charAt(0).toUpperCase() + contract.contractType.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contract.startDate}</div>
                        <div className="text-xs text-gray-500">to {contract.endDate || 'No end date'}</div>
                        {daysUntilExpiry !== null && (
                          <div className={`text-xs ${daysUntilExpiry <= 30 && daysUntilExpiry > 0 ? 'text-yellow-600' : daysUntilExpiry <= 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {daysUntilExpiry <= 0 ? 'Expired' : daysUntilExpiry <= 30 ? `${daysUntilExpiry} days left` : `${daysUntilExpiry} days left`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${contract.value.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailsModal(contract)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Contract Modal */}
      {showContractModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowContractModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Contract</h3>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateContract();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value }))}
                      className="input"
                      required
                    >
                      <option value="supply">Supply</option>
                      <option value="service">Service</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="consulting">Consulting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
                  <input
                    type="text"
                    value={formData.contractTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractTitle: e.target.value }))}
                    className="input"
                    placeholder="Enter contract title"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input"
                      placeholder="Leave empty for no end date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    className="input"
                    rows="4"
                    placeholder="Enter contract terms and conditions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Terms</label>
                  <textarea
                    value={formData.renewalTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, renewalTerms: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Enter renewal terms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add any notes about this contract"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createContractMutation.isLoading}
                >
                  {createContractMutation.isLoading ? 'Creating...' : 'Create Contract'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Contract Details Modal */}
      {showDetailsModal && selectedContract && (
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
              <h3 className="text-lg font-semibold text-gray-900">Contract Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Contract Title</p>
                <p className="text-sm text-gray-900">{selectedContract.contractTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedContract.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedContract.contractType)}`}>
                  {selectedContract.contractType.charAt(0).toUpperCase() + selectedContract.contractType.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContract.status)}`}>
                  {selectedContract.status.charAt(0).toUpperCase() + selectedContract.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Start Date</p>
                <p className="text-sm text-gray-900">{selectedContract.startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">End Date</p>
                <p className="text-sm text-gray-900">{selectedContract.endDate || 'No end date'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Contract Value</p>
                <p className="text-sm font-medium text-gray-900">${selectedContract.value.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Renewal Reminder</p>
                <p className="text-sm text-gray-900">{selectedContract.renewalReminder || 'No reminder set'}</p>
              </div>
            </div>

            {selectedContract.termsAndConditions && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Terms & Conditions</p>
                <p className="text-sm text-gray-900">{selectedContract.termsAndConditions}</p>
              </div>
            )}

            {selectedContract.renewalTerms && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Renewal Terms</p>
                <p className="text-sm text-gray-900">{selectedContract.renewalTerms}</p>
              </div>
            )}

            {selectedContract.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-900">{selectedContract.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Created: {new Date(selectedContract.createdAt).toLocaleString()}
                {selectedContract.updatedAt !== selectedContract.createdAt && (
                  <span> | Updated: {new Date(selectedContract.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteContract}
                  className="btn btn-outline btn-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SupplierContracts;
