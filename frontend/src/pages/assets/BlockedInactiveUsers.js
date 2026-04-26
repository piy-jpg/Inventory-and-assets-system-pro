import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  UserGroupIcon,
  FunnelIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const BlockedInactiveUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reactivationReason, setReactivationReason] = useState('');

  const queryClient = useQueryClient();

  // Real-time blocked/inactive users data
  const { data: blockedUsersData, isLoading, refetch } = useQuery(
    'blockedInactiveUsers',
    () => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        return users.filter(user => user.status === 'blocked' || user.status === 'inactive' || user.status === 'suspended');
      }
      
      return [
        {
          _id: 'USR_004',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@company.com',
          username: 'emilydavis',
          role: 'staff',
          status: 'inactive',
          department: 'Marketing',
          phone: '+1-555-0104',
          lastLogin: '2024-04-15T11:20:00Z',
          createdAt: '2023-04-05T10:00:00Z',
          updatedAt: '2024-04-15T11:20:00Z',
          blockedReason: 'User requested deactivation',
          blockedAt: '2024-04-15T11:20:00Z',
          blockedBy: 'John Smith'
        },
        {
          _id: 'USR_005',
          firstName: 'David',
          lastName: 'Brown',
          email: 'david.brown@company.com',
          username: 'davidbrown',
          role: 'staff',
          status: 'blocked',
          department: 'Sales',
          phone: '+1-555-0105',
          lastLogin: '2024-04-10T14:30:00Z',
          createdAt: '2023-05-15T10:00:00Z',
          updatedAt: '2024-04-10T14:30:00Z',
          blockedReason: 'Multiple failed login attempts',
          blockedAt: '2024-04-10T14:30:00Z',
          blockedBy: 'System'
        },
        {
          _id: 'USR_006',
          firstName: 'Lisa',
          lastName: 'Anderson',
          email: 'lisa.anderson@company.com',
          username: 'lisanderson',
          role: 'staff',
          status: 'suspended',
          department: 'Finance',
          phone: '+1-555-0106',
          lastLogin: '2024-03-20T09:15:00Z',
          createdAt: '2023-06-10T10:00:00Z',
          updatedAt: '2024-03-20T09:15:00Z',
          blockedReason: 'Policy violation',
          blockedAt: '2024-03-20T09:15:00Z',
          blockedBy: 'Sarah Johnson'
        },
        {
          _id: 'USR_007',
          firstName: 'James',
          lastName: 'Wilson',
          email: 'james.wilson@company.com',
          username: 'jameswilson',
          role: 'manager',
          status: 'blocked',
          department: 'Operations',
          phone: '+1-555-0107',
          lastLogin: '2024-02-28T16:45:00Z',
          createdAt: '2023-07-20T10:00:00Z',
          updatedAt: '2024-02-28T16:45:00Z',
          blockedReason: 'Security breach detected',
          blockedAt: '2024-02-28T16:45:00Z',
          blockedBy: 'System'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Blocked/inactive users data refreshed:', data);
      }
    }
  );

  // Mutation for reactivating user
  const reactivateUserMutation = useMutation(
    async ({ userId, reason }) => {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = allUsers.map(user => 
        user._id === userId ? {
          ...user,
          status: 'active',
          blockedReason: null,
          blockedAt: null,
          blockedBy: null,
          reactivatedAt: new Date().toISOString(),
          reactivatedBy: 'Current User',
          reactivationReason: reason,
          updatedAt: new Date().toISOString()
        } : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      queryClient.setQueryData('allUsers', updatedUsers);
      queryClient.setQueryData('blockedInactiveUsers', updatedUsers.filter(user => 
        user.status === 'blocked' || user.status === 'inactive' || user.status === 'suspended'
      ));
      return updatedUsers;
    },
    {
      onSuccess: () => {
        toast.success('User reactivated successfully');
        setShowReactivateModal(false);
        setSelectedUser(null);
        setReactivationReason('');
        refetch();
      },
      onError: () => {
        toast.error('Failed to reactivate user');
      }
    }
  );

  const blockedUsers = blockedUsersData || [];

  const filteredUsers = blockedUsers.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openReactivateModal = (user) => {
    setSelectedUser(user);
    setShowReactivateModal(true);
  };

  const handleReactivate = () => {
    if (!selectedUser || !reactivationReason.trim()) {
      toast.error('Please provide a reason for reactivation');
      return;
    }

    reactivateUserMutation.mutate({
      userId: selectedUser._id,
      reason: reactivationReason
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Blocked users data refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'inactive':
        return <XCircleIcon className="h-4 w-4" />;
      case 'blocked':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <XCircleIcon className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalBlockedUsers = blockedUsers.length;
  const inactiveUsers = blockedUsers.filter(user => user.status === 'inactive').length;
  const blockedUsersCount = blockedUsers.filter(user => user.status === 'blocked').length;
  const suspendedUsers = blockedUsers.filter(user => user.status === 'suspended').length;

  // Get users by blocking reason
  const blockedByReason = blockedUsers.reduce((acc, user) => {
    const reason = user.blockedReason || 'Unknown';
    acc[reason] = (acc[reason] || 0) + 1;
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
            <h1 className="page-title">Blocked / Inactive Users</h1>
            <p className="page-subtitle">Suspended users list with reactivation options</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
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
              <p className="text-sm font-medium text-gray-600">Total Blocked</p>
              <p className="text-2xl font-bold text-gray-900">{totalBlockedUsers}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{inactiveUsers}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{blockedUsersCount}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-orange-600">{suspendedUsers}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Blocking Reasons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blocking Reasons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(blockedByReason).map(([reason, count]) => (
            <div key={reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{reason}</p>
                <p className="text-xs text-gray-500">{count} users</p>
              </div>
              <div className="text-sm font-medium text-gray-600">{count}</div>
            </div>
          ))}
        </div>
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
                placeholder="Search users..."
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
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Blocked Users Table */}
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
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blocked Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blocked Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No blocked/inactive users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.blockedReason}</div>
                      {user.blockedBy && (
                        <div className="text-xs text-gray-500">by {user.blockedBy}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openReactivateModal(user)}
                        className="btn btn-primary btn-sm"
                      >
                        Reactivate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Reactivate User Modal */}
      {showReactivateModal && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowReactivateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reactivate User</h3>
              <button
                onClick={() => setShowReactivateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                <p className="text-xs text-gray-500">Current Status: {selectedUser.status}</p>
                <p className="text-xs text-gray-500">Blocked Reason: {selectedUser.blockedReason}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reactivation Reason *
                </label>
                <textarea
                  className="input"
                  rows="3"
                  value={reactivationReason}
                  onChange={(e) => setReactivationReason(e.target.value)}
                  placeholder="Provide reason for reactivating this user..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReactivateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivate}
                className="btn btn-primary"
                disabled={reactivateUserMutation.isLoading}
              >
                {reactivateUserMutation.isLoading ? 'Reactivating...' : 'Reactivate User'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BlockedInactiveUsers;
