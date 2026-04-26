import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CubeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetAssignment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const queryClient = useQueryClient();

  // Real-time asset assignments data
  const { data: assignmentsData, isLoading, refetch } = useQuery(
    'assetAssignments',
    () => {
      const storedAssignments = localStorage.getItem('assetAssignments');
      if (storedAssignments) {
        return JSON.parse(storedAssignments);
      }
      
      return [
        {
          _id: 'ASG_001',
          asset_id: 'AST_001',
          asset_name: 'Laptop Pro 15"',
          asset_tag: 'LAPTOP-001',
          employee_id: 'EMP_001',
          employee_name: 'John Smith',
          employee_email: 'john.smith@company.com',
          department: 'Sales',
          assigned_date: '2023-06-15',
          return_date: null,
          status: 'assigned',
          notes: 'Assigned to Sales Manager for client meetings',
          condition_assigned: 'Good',
          condition_returned: null,
          created_at: '2023-06-15T10:00:00Z',
          updated_at: '2023-06-15T10:00:00Z'
        },
        {
          _id: 'ASG_002',
          asset_id: 'AST_002',
          asset_name: 'Office Chair Ergonomic',
          asset_tag: 'CHAIR-001',
          employee_id: 'EMP_002',
          employee_name: 'Sarah Johnson',
          employee_email: 'sarah.johnson@company.com',
          department: 'HR',
          assigned_date: '2023-07-20',
          return_date: null,
          status: 'assigned',
          notes: 'Ergonomic chair for back support',
          condition_assigned: 'Excellent',
          condition_returned: null,
          created_at: '2023-07-20T10:00:00Z',
          updated_at: '2023-07-20T10:00:00Z'
        },
        {
          _id: 'ASG_003',
          asset_id: 'AST_003',
          asset_name: 'Desktop Computer',
          asset_tag: 'DESKTOP-001',
          employee_id: 'EMP_003',
          employee_name: 'Mike Wilson',
          employee_email: 'mike.wilson@company.com',
          department: 'IT',
          assigned_date: '2022-09-10',
          return_date: '2024-03-01',
          status: 'returned',
          notes: 'Returned for hardware upgrade',
          condition_assigned: 'Good',
          condition_returned: 'Fair',
          created_at: '2022-09-10T10:00:00Z',
          updated_at: '2024-03-01T10:00:00Z'
        },
        {
          _id: 'ASG_004',
          asset_id: 'AST_004',
          asset_name: 'Conference Table',
          asset_tag: 'TABLE-001',
          employee_id: null,
          employee_name: null,
          employee_email: null,
          department: null,
          assigned_date: null,
          return_date: null,
          status: 'available',
          notes: 'Available for assignment',
          condition_assigned: null,
          condition_returned: null,
          created_at: '2022-05-15T10:00:00Z',
          updated_at: '2022-05-15T10:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 9000, // Real-time refresh every 9 seconds
      onSuccess: (data) => {
        console.log('Asset assignments data refreshed:', data);
      }
    }
  );

  // Mock assets data for assignment
  const { data: assetsData } = useQuery(
    'availableAssets',
    () => {
      return [
        { _id: 'AST_001', asset_name: 'Laptop Pro 15"', asset_tag: 'LAPTOP-001', status: 'active' },
        { _id: 'AST_002', asset_name: 'Office Chair Ergonomic', asset_tag: 'CHAIR-001', status: 'active' },
        { _id: 'AST_003', asset_name: 'Desktop Computer', asset_tag: 'DESKTOP-001', status: 'active' },
        { _id: 'AST_004', asset_name: 'Conference Table', asset_tag: 'TABLE-001', status: 'active' }
      ];
    }
  );

  // Mock employees data
  const { data: employeesData } = useQuery(
    'employees',
    () => {
      return [
        { _id: 'EMP_001', name: 'John Smith', email: 'john.smith@company.com', department: 'Sales' },
        { _id: 'EMP_002', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'HR' },
        { _id: 'EMP_003', name: 'Mike Wilson', email: 'mike.wilson@company.com', department: 'IT' },
        { _id: 'EMP_004', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Marketing' }
      ];
    }
  );

  // Mutation for assigning asset
  const assignAssetMutation = useMutation(
    async (assignmentData) => {
      const assignments = assignmentsData || [];
      const newAssignment = {
        ...assignmentData,
        _id: `ASG_${Date.now()}`,
        assigned_date: new Date().toISOString().split('T')[0],
        status: 'assigned',
        condition_assigned: 'Good',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedAssignments = [...assignments, newAssignment];
      localStorage.setItem('assetAssignments', JSON.stringify(updatedAssignments));
      queryClient.setQueryData('assetAssignments', updatedAssignments);
      return updatedAssignments;
    },
    {
      onSuccess: () => {
        toast.success('Asset assigned successfully');
        setShowAssignModal(false);
        resetAssignForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to assign asset');
      }
    }
  );

  // Mutation for returning asset
  const returnAssetMutation = useMutation(
    async (assignmentId) => {
      const assignments = assignmentsData || [];
      const updatedAssignments = assignments.map(assignment => 
        assignment._id === assignmentId ? {
          ...assignment,
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        } : assignment
      );
      localStorage.setItem('assetAssignments', JSON.stringify(updatedAssignments));
      queryClient.setQueryData('assetAssignments', updatedAssignments);
      return updatedAssignments;
    },
    {
      onSuccess: () => {
        toast.success('Asset returned successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to return asset');
      }
    }
  );

  const assignments = assignmentsData || [];
  const assets = assetsData || [];
  const employees = employeesData || [];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        assignment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        assignment.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const resetAssignForm = () => {
    setSelectedAsset(null);
    setSelectedEmployee(null);
    setAssignmentNotes('');
  };

  const openDetailsModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  const handleAssign = () => {
    if (!selectedAsset || !selectedEmployee) {
      toast.error('Please select both an asset and an employee');
      return;
    }

    const assignmentData = {
      asset_id: selectedAsset._id,
      asset_name: selectedAsset.asset_name,
      asset_tag: selectedAsset.asset_tag,
      employee_id: selectedEmployee._id,
      employee_name: selectedEmployee.name,
      employee_email: selectedEmployee.email,
      department: selectedEmployee.department,
      notes: assignmentNotes
    };

    assignAssetMutation.mutate(assignmentData);
  };

  const handleReturn = (assignmentId) => {
    if (window.confirm('Are you sure you want to return this asset?')) {
      returnAssetMutation.mutate(assignmentId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Assignment data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const assignedAssets = assignments.filter(a => a.status === 'assigned').length;
  const returnedAssets = assignments.filter(a => a.status === 'returned').length;
  const availableAssets = assignments.filter(a => a.status === 'available').length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Asset Assignment</h1>
            <p className="page-subtitle">Assign assets to employees and track issued assets</p>
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
              onClick={() => setShowAssignModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Assign Asset</span>
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
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-green-600">{assignedAssets}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Returned</p>
              <p className="text-2xl font-bold text-gray-600">{returnedAssets}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-blue-600">{availableAssets}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
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
              <option value="assigned">Assigned</option>
              <option value="returned">Returned</option>
              <option value="available">Available</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Assignments Table */}
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
                  Asset Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
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
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No assignments found
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.asset_name}</div>
                      <div className="text-xs text-gray-500">Tag: {assignment.asset_tag}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assignment.employee_name || 'Unassigned'}
                      </div>
                      {assignment.employee_email && (
                        <div className="text-xs text-gray-500">{assignment.employee_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.assigned_date || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.return_date || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(assignment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {assignment.status === 'assigned' && (
                          <button
                            onClick={() => handleReturn(assignment._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Return Asset"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
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

      {/* Assign Asset Modal */}
      {showAssignModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Asset</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset *</label>
                <select
                  className="input"
                  value={selectedAsset?._id || ''}
                  onChange={(e) => setSelectedAsset(assets.find(a => a._id === e.target.value))}
                  required
                >
                  <option value="">Select an asset</option>
                  {assets.map(asset => (
                    <option key={asset._id} value={asset._id}>
                      {asset.asset_name} ({asset.asset_tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee *</label>
                <select
                  className="input"
                  value={selectedEmployee?._id || ''}
                  onChange={(e) => setSelectedEmployee(employees.find(e => e._id === e.target.value))}
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map(employee => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} ({employee.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="input"
                  rows="3"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Add any notes about this assignment"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="btn btn-primary"
                disabled={assignAssetMutation.isLoading}
              >
                Assign Asset
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
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
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assignment Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Asset</p>
                <p className="text-sm text-gray-900">{selectedAssignment.asset_name}</p>
                <p className="text-xs text-gray-500">Tag: {selectedAssignment.asset_tag}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Assigned To</p>
                <p className="text-sm text-gray-900">{selectedAssignment.employee_name || 'Unassigned'}</p>
                {selectedAssignment.employee_email && (
                  <p className="text-xs text-gray-500">{selectedAssignment.employee_email}</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Department</p>
                <p className="text-sm text-gray-900">{selectedAssignment.department || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Date</p>
                  <p className="text-sm text-gray-900">{selectedAssignment.assigned_date || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Return Date</p>
                  <p className="text-sm text-gray-900">{selectedAssignment.return_date || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                  {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                </span>
              </div>

              {selectedAssignment.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-sm text-gray-900">{selectedAssignment.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Condition (Assigned)</p>
                  <p className="text-sm text-gray-900">{selectedAssignment.condition_assigned || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Condition (Returned)</p>
                  <p className="text-sm text-gray-900">{selectedAssignment.condition_returned || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {selectedAssignment.status === 'assigned' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleReturn(selectedAssignment._id);
                  }}
                  className="btn btn-primary"
                >
                  Return Asset
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetAssignment;
