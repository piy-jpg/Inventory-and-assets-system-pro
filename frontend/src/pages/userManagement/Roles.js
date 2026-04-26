import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, role: null });
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    user_count: 0,
    permission_count: 0,
    created_at: new Date().toISOString().slice(0, 10)
  });

  const queryClient = useQueryClient();

  // Real-time roles data
  const { data: rolesData, isLoading, refetch } = useQuery(
    'roles',
    () => {
      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) {
        return JSON.parse(storedRoles);
      }
      
      return [
        {
          _id: 'ROLE_001',
          role_name: 'Administrator',
          description: 'Full system access with all permissions',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_count: 1,
          permission_count: 15
        },
        {
          _id: 'ROLE_002',
          role_name: 'Manager',
          description: 'Management access with limited permissions',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_count: 1,
          permission_count: 10
        },
        {
          _id: 'ROLE_003',
          role_name: 'Sales Executive',
          description: 'Sales operations and customer management',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_count: 1,
          permission_count: 8
        },
        {
          _id: 'ROLE_004',
          role_name: 'Warehouse Staff',
          description: 'Inventory and stock management',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_count: 1,
          permission_count: 6
        },
        {
          _id: 'ROLE_005',
          role_name: 'Customer Support',
          description: 'Customer service and support operations',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_count: 1,
          permission_count: 5
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Roles data refreshed:', data);
      }
    }
  );

  // Get permissions data for role-permission mapping
  const { data: permissionsData } = useQuery(
    'permissions',
    () => {
      const storedPermissions = localStorage.getItem('permissions');
      return storedPermissions ? JSON.parse(storedPermissions) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Mutation for creating role
  const createRoleMutation = useMutation(
    async (roleData) => {
      const roles = rolesData || [];
      const newRole = {
        ...roleData,
        _id: `ROLE_${Date.now()}`,
        created_at: new Date(roleData.created_at).toISOString(),
        updated_at: new Date().toISOString(),
        user_count: Number(roleData.user_count) || 0,
        permission_count: Number(roleData.permission_count) || 0
      };
      const updatedRoles = [...roles, newRole];
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      queryClient.setQueryData('roles', updatedRoles);
      return newRole;
    },
    {
      onSuccess: () => {
        toast.success('Role created successfully');
        setShowCreateModal(false);
        resetForm();
        setShowActionMenu(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to create role');
      }
    }
  );

  // Mutation for updating role
  const updateRoleMutation = useMutation(
    async (updatedRole) => {
      const roles = rolesData || [];
      const updatedRoles = roles.map(role => 
        role._id === updatedRole._id ? {
          ...updatedRole,
          updated_at: new Date().toISOString()
        } : role
      );
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      queryClient.setQueryData('roles', updatedRoles);
      return updatedRoles.find(role => role._id === updatedRole._id) || updatedRole;
    },
    {
      onSuccess: (updatedRole) => {
        toast.success('Role updated successfully');
        setSelectedRole(updatedRole);
        setShowEditModal(false);
        setShowDetailsModal(false);
        setShowActionMenu(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update role');
      }
    }
  );

  // Mutation for deleting role
  const deleteRoleMutation = useMutation(
    async (roleId) => {
      const roles = rolesData || [];
      const updatedRoles = roles.filter(role => role._id !== roleId);
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      queryClient.setQueryData('roles', updatedRoles);
      return updatedRoles;
    },
    {
      onSuccess: () => {
        toast.success('Role deleted successfully');
        setShowDetailsModal(false);
        setShowActionMenu(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete role');
      }
    }
  );

  const roles = rolesData || [];
  const permissions = permissionsData || [];

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      role_name: '',
      description: '',
      user_count: 0,
      permission_count: 0,
      created_at: new Date().toISOString().slice(0, 10)
    });
  };

  const openDetailsModal = (role) => {
    setSelectedRole(role);
    setShowActionMenu(null);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedRole(null);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowActionMenu(null);
    setShowCreateModal(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      role_name: role.role_name,
      description: role.description || '',
      user_count: role.user_count ?? 0,
      permission_count: role.permission_count ?? 0,
      created_at: role.created_at ? new Date(role.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
    setShowDetailsModal(false);
    setShowActionMenu(null);
    setShowEditModal(true);
  };

  const openDeleteDialog = (role) => {
    setSelectedRole(role);
    setShowActionMenu(null);
    setDeleteDialog({
      open: true,
      role
    });
  };

  const closeDeleteDialog = () => {
    if (deleteRoleMutation.isLoading) return;
    setDeleteDialog({ open: false, role: null });
  };

  const handleCreateRole = () => {
    if (!formData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if ((Number(formData.user_count) || 0) < 0) {
      toast.error('Users count cannot be negative');
      return;
    }

    if ((Number(formData.permission_count) || 0) < 0) {
      toast.error('Permissions count cannot be negative');
      return;
    }

    createRoleMutation.mutate({
      ...formData,
      role_name: formData.role_name.trim(),
      description: formData.description.trim(),
      user_count: Number(formData.user_count) || 0,
      permission_count: Number(formData.permission_count) || 0
    });
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    if (!formData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if ((Number(formData.user_count) || 0) < 0) {
      toast.error('Users count cannot be negative');
      return;
    }

    if ((Number(formData.permission_count) || 0) < 0) {
      toast.error('Permissions count cannot be negative');
      return;
    }

    updateRoleMutation.mutate({
      ...selectedRole,
      ...formData,
      role_name: formData.role_name.trim(),
      description: formData.description.trim(),
      user_count: Number(formData.user_count) || 0,
      permission_count: Number(formData.permission_count) || 0,
      created_at: new Date(formData.created_at).toISOString()
    });
  };

  const handleDeleteRole = (roleToDelete) => {
    if (!roleToDelete?._id) {
      toast.error('Unable to delete role: missing role details');
      return;
    }

    deleteRoleMutation.mutate(roleToDelete._id);
  };

  const confirmDeleteRole = () => {
    if (!deleteDialog.role) return;
    const roleToDelete = deleteDialog.role;
    closeDeleteDialog();
    handleDeleteRole(roleToDelete);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Roles data refreshed');
  };

  const handleMenuAction = (action, targetRole) => {
    switch (action) {
      case 'view':
        openDetailsModal(targetRole);
        return;
      case 'edit':
        openEditModal(targetRole);
        return;
      case 'delete':
        openDeleteDialog(targetRole);
        return;
      default:
        setShowActionMenu(null);
    }
  };

  // Calculate statistics
  const totalRoles = roles.length;
  const totalUsers = roles.reduce((sum, role) => sum + role.user_count, 0);
  const totalPermissions = roles.reduce((sum, role) => sum + role.permission_count, 0);

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Roles</h1>
            <p className="page-subtitle">Manage user roles and their permissions</p>
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
              onClick={openCreateModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Role</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{totalRoles}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-green-600">{totalUsers}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Permissions</p>
              <p className="text-2xl font-bold text-purple-600">{totalPermissions}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
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
                placeholder="Search roles..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Roles Table */}
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
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No roles found
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{role.role_name}</div>
                      <div className="text-xs text-gray-500">ID: {role._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{role.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{role.user_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{role.permission_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(role.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMenuAction('view', role)}
                          style={{
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: '2px solid #4b5563',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          VIEW
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMenuAction('edit', role)}
                          style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: '2px solid #1d4ed8',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(role)}
                          disabled={deleteRoleMutation.isLoading && deleteRoleMutation.variables === role._id}
                          className={`
                            ${deleteRoleMutation.isLoading && deleteRoleMutation.variables === role._id
                              ? 'bg-gray-400 border-gray-500 cursor-not-allowed animate-pulse'
                              : 'bg-red-600 border-red-700 hover:bg-red-700 cursor-pointer transition-all duration-300'}
                            text-white font-bold text-xs px-2 py-1 rounded border-2
                          `}
                          style={{
                            minWidth: '65px',
                            boxShadow: deleteRoleMutation.isLoading && deleteRoleMutation.variables === role._id
                              ? '0 0 0 0 rgba(220, 38, 38, 0.7)'
                              : '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {deleteRoleMutation.isLoading && deleteRoleMutation.variables === role._id ? 'DELETING...' : 'DELETE'}
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowActionMenu(showActionMenu === role._id ? null : role._id)}
                            style={{
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: '2px solid #4b5563',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              minWidth: '50px'
                            }}
                          >
                            MORE
                          </button>
                          {showActionMenu === role._id && (
                            <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="py-1">
                                <button
                                  onClick={() => handleMenuAction('view', role)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <EyeIcon className="h-4 w-4 mr-2 text-gray-600" />
                                  View Role
                                </button>
                                <button
                                  onClick={() => handleMenuAction('edit', role)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <PencilIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  Edit Role
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setShowActionMenu(null);
                                    toast.success(`${role.role_name} has ${role.user_count} users and ${role.permission_count} permissions`);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <ShieldCheckIcon className="h-4 w-4 mr-2 text-purple-600" />
                                  Quick Summary
                                </button>
                                <div className="border-t border-gray-100"></div>
                                <button
                                  onClick={() => handleMenuAction('delete', role)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete Role
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Role</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateRole();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    value={formData.role_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_name: e.target.value }))}
                    className="input"
                    placeholder="Enter role name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Enter role description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Users</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.user_count}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_count: e.target.value }))}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.permission_count}
                      onChange={(e) => setFormData(prev => ({ ...prev, permission_count: e.target.value }))}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <input
                    type="date"
                    value={formData.created_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, created_at: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createRoleMutation.isLoading}
                >
                  {createRoleMutation.isLoading ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
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
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Role</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateRole();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    value={formData.role_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_name: e.target.value }))}
                    className="input"
                    placeholder="Enter role name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Enter role description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Users</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.user_count}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_count: e.target.value }))}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.permission_count}
                      onChange={(e) => setFormData(prev => ({ ...prev, permission_count: e.target.value }))}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <input
                    type="date"
                    value={formData.created_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, created_at: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateRoleMutation.isLoading}
                >
                  {updateRoleMutation.isLoading ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Role Details Modal */}
      {showDetailsModal && selectedRole && (
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
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Role Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Role Name</p>
                <p className="text-sm text-gray-900">{selectedRole.role_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">{selectedRole.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Users Count</p>
                <p className="text-sm text-gray-900">{selectedRole.user_count}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Permissions Count</p>
                <p className="text-sm text-gray-900">{selectedRole.permission_count}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm text-gray-900">{new Date(selectedRole.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-900">{new Date(selectedRole.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(selectedRole)}
                  className="btn btn-primary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteDialog(selectedRole)}
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

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteRole}
        title="Delete Role"
        message={
          deleteDialog.role
            ? `Are you sure you want to delete ${deleteDialog.role.role_name}? This action cannot be undone.`
            : 'Are you sure you want to delete this role?'
        }
        itemName={deleteDialog.role ? `${deleteDialog.role.role_name} (${deleteDialog.role.user_count} users)` : ''}
        type="delete"
        loading={deleteRoleMutation.isLoading}
      />
    </div>
  );
};

export default Roles;
