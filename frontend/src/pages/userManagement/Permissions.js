import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const DEFAULT_PERMISSIONS = [
  { _id: 'PERM_001', permission_name: 'user.create', description: 'Create new users', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 2 },
  { _id: 'PERM_002', permission_name: 'user.read', description: 'View user information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 5 },
  { _id: 'PERM_003', permission_name: 'user.update', description: 'Update user information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 3 },
  { _id: 'PERM_004', permission_name: 'user.delete', description: 'Delete users', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 1 },
  { _id: 'PERM_005', permission_name: 'product.create', description: 'Create new products', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 3 },
  { _id: 'PERM_006', permission_name: 'product.read', description: 'View product information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 5 },
  { _id: 'PERM_007', permission_name: 'product.update', description: 'Update product information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 4 },
  { _id: 'PERM_008', permission_name: 'product.delete', description: 'Delete products', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 2 },
  { _id: 'PERM_009', permission_name: 'order.create', description: 'Create new orders', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 4 },
  { _id: 'PERM_010', permission_name: 'order.read', description: 'View order information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 5 },
  { _id: 'PERM_011', permission_name: 'order.update', description: 'Update order information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 3 },
  { _id: 'PERM_012', permission_name: 'order.delete', description: 'Delete orders', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 1 },
  { _id: 'PERM_013', permission_name: 'stock.create', description: 'Create stock entries', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 2 },
  { _id: 'PERM_014', permission_name: 'stock.read', description: 'View stock information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 5 },
  { _id: 'PERM_015', permission_name: 'stock.update', description: 'Update stock information', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', role_count: 3 }
];

const Permissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, permission: null });
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    permission_name: '',
    description: '',
    role_count: 0,
    created_at: new Date().toISOString().slice(0, 10)
  });

  const queryClient = useQueryClient();

  const { data: permissionsData, isLoading, refetch } = useQuery(
    'permissions',
    () => {
      const storedPermissions = localStorage.getItem('permissions');
      return storedPermissions ? JSON.parse(storedPermissions) : DEFAULT_PERMISSIONS;
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        console.log('Permissions data refreshed:', data);
      }
    }
  );

  const createPermissionMutation = useMutation(
    async (permissionData) => {
      const permissions = permissionsData || [];
      const newPermission = {
        ...permissionData,
        _id: `PERM_${Date.now()}`,
        created_at: new Date(permissionData.created_at).toISOString(),
        updated_at: new Date().toISOString(),
        role_count: Number(permissionData.role_count) || 0
      };
      const updatedPermissions = [...permissions, newPermission];
      localStorage.setItem('permissions', JSON.stringify(updatedPermissions));
      queryClient.setQueryData('permissions', updatedPermissions);
      return newPermission;
    },
    {
      onSuccess: () => {
        toast.success('Permission created successfully');
        setShowCreateModal(false);
        resetForm();
        setShowActionMenu(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to create permission');
      }
    }
  );

  const updatePermissionMutation = useMutation(
    async (updatedPermission) => {
      const permissions = permissionsData || [];
      const updatedPermissions = permissions.map((permission) =>
        permission._id === updatedPermission._id
          ? {
              ...updatedPermission,
              updated_at: new Date().toISOString()
            }
          : permission
      );
      localStorage.setItem('permissions', JSON.stringify(updatedPermissions));
      queryClient.setQueryData('permissions', updatedPermissions);
      return updatedPermissions.find((permission) => permission._id === updatedPermission._id) || updatedPermission;
    },
    {
      onSuccess: (updatedPermission) => {
        toast.success('Permission updated successfully');
        setSelectedPermission(updatedPermission);
        setShowEditModal(false);
        setShowDetailsModal(false);
        setShowActionMenu(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update permission');
      }
    }
  );

  const deletePermissionMutation = useMutation(
    async (permissionId) => {
      const permissions = permissionsData || [];
      const updatedPermissions = permissions.filter((permission) => permission._id !== permissionId);
      localStorage.setItem('permissions', JSON.stringify(updatedPermissions));
      queryClient.setQueryData('permissions', updatedPermissions);
      return updatedPermissions;
    },
    {
      onSuccess: () => {
        toast.success('Permission deleted successfully');
        setShowDetailsModal(false);
        setShowActionMenu(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete permission');
      }
    }
  );

  const permissions = permissionsData || DEFAULT_PERMISSIONS;

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.permission_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      permission_name: '',
      description: '',
      role_count: 0,
      created_at: new Date().toISOString().slice(0, 10)
    });
  };

  const openDetailsModal = (permission) => {
    setSelectedPermission(permission);
    setShowActionMenu(null);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedPermission(null);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowActionMenu(null);
    setShowCreateModal(true);
  };

  const openEditModal = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      permission_name: permission.permission_name,
      description: permission.description || '',
      role_count: permission.role_count ?? 0,
      created_at: permission.created_at ? new Date(permission.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
    setShowDetailsModal(false);
    setShowActionMenu(null);
    setShowEditModal(true);
  };

  const openDeleteDialog = (permission) => {
    setSelectedPermission(permission);
    setShowActionMenu(null);
    setDeleteDialog({
      open: true,
      permission
    });
  };

  const closeDeleteDialog = () => {
    if (deletePermissionMutation.isLoading) return;
    setDeleteDialog({ open: false, permission: null });
  };

  const handleCreatePermission = () => {
    if (!formData.permission_name.trim()) {
      toast.error('Permission name is required');
      return;
    }

    if ((Number(formData.role_count) || 0) < 0) {
      toast.error('Roles count cannot be negative');
      return;
    }

    createPermissionMutation.mutate({
      ...formData,
      permission_name: formData.permission_name.trim(),
      description: formData.description.trim(),
      role_count: Number(formData.role_count) || 0
    });
  };

  const handleUpdatePermission = () => {
    if (!selectedPermission) return;

    if (!formData.permission_name.trim()) {
      toast.error('Permission name is required');
      return;
    }

    if ((Number(formData.role_count) || 0) < 0) {
      toast.error('Roles count cannot be negative');
      return;
    }

    updatePermissionMutation.mutate({
      ...selectedPermission,
      permission_name: formData.permission_name.trim(),
      description: formData.description.trim(),
      role_count: Number(formData.role_count) || 0,
      created_at: new Date(formData.created_at).toISOString()
    });
  };

  const handleDeletePermission = (permissionToDelete) => {
    if (!permissionToDelete?._id) {
      toast.error('Unable to delete permission: missing permission details');
      return;
    }

    deletePermissionMutation.mutate(permissionToDelete._id);
  };

  const confirmDeletePermission = () => {
    if (!deleteDialog.permission) return;
    const permissionToDelete = deleteDialog.permission;
    closeDeleteDialog();
    handleDeletePermission(permissionToDelete);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Permissions data refreshed');
  };

  const handleMenuAction = (action, targetPermission) => {
    switch (action) {
      case 'view':
        openDetailsModal(targetPermission);
        return;
      case 'edit':
        openEditModal(targetPermission);
        return;
      case 'delete':
        openDeleteDialog(targetPermission);
        return;
      default:
        setShowActionMenu(null);
    }
  };

  const totalPermissions = permissions.length;
  const totalRoles = permissions.reduce((sum, permission) => sum + permission.role_count, 0);
  const avgRolesPerPermission = totalPermissions > 0 ? (totalRoles / totalPermissions).toFixed(1) : 0;

  const categories = permissions.reduce((acc, permission) => {
    const category = permission.permission_name.split('.')[0];
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Permissions</h1>
            <p className="page-subtitle">Manage system permissions and access controls</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleRefresh} className="btn btn-secondary flex items-center space-x-2" disabled={isLoading}>
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button onClick={openCreateModal} className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Add Permission</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{totalPermissions}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-green-600">{totalRoles}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Roles/Permission</p>
              <p className="text-2xl font-bold text-purple-600">{avgRolesPerPermission}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <KeyIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(categories).map(([category, count]) => (
          <div key={category} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">{category}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search permissions..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No permissions found</td>
                </tr>
              ) : (
                filteredPermissions.map((permission) => (
                  <tr key={permission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{permission.permission_name}</div>
                      <div className="text-xs text-gray-500">ID: {permission._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{permission.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{permission.role_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(permission.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMenuAction('view', permission)}
                          style={{ backgroundColor: '#6b7280', color: 'white', border: '2px solid #4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          VIEW
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMenuAction('edit', permission)}
                          style={{ backgroundColor: '#2563eb', color: 'white', border: '2px solid #1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(permission)}
                          disabled={deletePermissionMutation.isLoading && deletePermissionMutation.variables === permission._id}
                          className={`
                            ${deletePermissionMutation.isLoading && deletePermissionMutation.variables === permission._id
                              ? 'bg-gray-400 border-gray-500 cursor-not-allowed animate-pulse'
                              : 'bg-red-600 border-red-700 hover:bg-red-700 cursor-pointer transition-all duration-300'}
                            text-white font-bold text-xs px-2 py-1 rounded border-2
                          `}
                          style={{
                            minWidth: '65px',
                            boxShadow: deletePermissionMutation.isLoading && deletePermissionMutation.variables === permission._id
                              ? '0 0 0 0 rgba(220, 38, 38, 0.7)'
                              : '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {deletePermissionMutation.isLoading && deletePermissionMutation.variables === permission._id ? 'DELETING...' : 'DELETE'}
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowActionMenu(showActionMenu === permission._id ? null : permission._id)}
                            style={{ backgroundColor: '#6b7280', color: 'white', border: '2px solid #4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', minWidth: '50px' }}
                          >
                            MORE
                          </button>
                          {showActionMenu === permission._id && (
                            <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="py-1">
                                <button onClick={() => handleMenuAction('view', permission)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <EyeIcon className="h-4 w-4 mr-2 text-gray-600" />
                                  View Permission
                                </button>
                                <button onClick={() => handleMenuAction('edit', permission)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <PencilIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  Edit Permission
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPermission(permission);
                                    setShowActionMenu(null);
                                    toast.success(`${permission.permission_name} is assigned to ${permission.role_count} roles`);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <KeyIcon className="h-4 w-4 mr-2 text-purple-600" />
                                  Quick Summary
                                </button>
                                <div className="border-t border-gray-100"></div>
                                <button onClick={() => handleMenuAction('delete', permission)} className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete Permission
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

      {showCreateModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Permission</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreatePermission(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission Name *</label>
                  <input type="text" value={formData.permission_name} onChange={(e) => setFormData((prev) => ({ ...prev, permission_name: e.target.value }))} className="input" placeholder="e.g., user.create" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className="input" rows="3" placeholder="Enter permission description" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                  <input type="number" min="0" value={formData.role_count} onChange={(e) => setFormData((prev) => ({ ...prev, role_count: e.target.value }))} className="input" placeholder="0" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <input type="date" value={formData.created_at} onChange={(e) => setFormData((prev) => ({ ...prev, created_at: e.target.value }))} className="input" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createPermissionMutation.isLoading}>
                  {createPermissionMutation.isLoading ? 'Creating...' : 'Create Permission'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {showEditModal && selectedPermission && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Permission</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdatePermission(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission Name *</label>
                  <input type="text" value={formData.permission_name} onChange={(e) => setFormData((prev) => ({ ...prev, permission_name: e.target.value }))} className="input" placeholder="e.g., user.create" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className="input" rows="3" placeholder="Enter permission description" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                  <input type="number" min="0" value={formData.role_count} onChange={(e) => setFormData((prev) => ({ ...prev, role_count: e.target.value }))} className="input" placeholder="0" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <input type="date" value={formData.created_at} onChange={(e) => setFormData((prev) => ({ ...prev, created_at: e.target.value }))} className="input" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updatePermissionMutation.isLoading}>
                  {updatePermissionMutation.isLoading ? 'Updating...' : 'Update Permission'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {showDetailsModal && selectedPermission && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Permission Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Permission Name</p>
                <p className="text-sm text-gray-900">{selectedPermission.permission_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">{selectedPermission.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Roles Count</p>
                <p className="text-sm text-gray-900">{selectedPermission.role_count}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm text-gray-900">{new Date(selectedPermission.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-900">{new Date(selectedPermission.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button onClick={() => openEditModal(selectedPermission)} className="btn btn-primary btn-sm">Edit</button>
                <button onClick={() => openDeleteDialog(selectedPermission)} className="btn btn-outline btn-sm">Delete</button>
                <button onClick={() => setShowDetailsModal(false)} className="btn btn-secondary btn-sm">Close</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeletePermission}
        title="Delete Permission"
        message={
          deleteDialog.permission
            ? `Are you sure you want to delete ${deleteDialog.permission.permission_name}? This action cannot be undone.`
            : 'Are you sure you want to delete this permission?'
        }
        itemName={deleteDialog.permission ? `${deleteDialog.permission.permission_name} (${deleteDialog.permission.role_count} roles)` : ''}
        type="delete"
        loading={deletePermissionMutation.isLoading}
      />
    </div>
  );
};

export default Permissions;
