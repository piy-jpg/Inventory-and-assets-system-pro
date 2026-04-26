import React, { useMemo, useState } from 'react';
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
  KeyIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const DEFAULT_ROLES = [
  { _id: 'ROLE_001', role_name: 'Administrator' },
  { _id: 'ROLE_002', role_name: 'Manager' },
  { _id: 'ROLE_003', role_name: 'Sales Executive' },
  { _id: 'ROLE_004', role_name: 'Warehouse Staff' },
  { _id: 'ROLE_005', role_name: 'Customer Support' }
];

const DEFAULT_PERMISSIONS = [
  { _id: 'PERM_001', permission_name: 'user.create' },
  { _id: 'PERM_002', permission_name: 'user.read' },
  { _id: 'PERM_003', permission_name: 'user.update' },
  { _id: 'PERM_004', permission_name: 'user.delete' },
  { _id: 'PERM_009', permission_name: 'order.create' },
  { _id: 'PERM_010', permission_name: 'order.read' },
  { _id: 'PERM_011', permission_name: 'order.update' },
  { _id: 'PERM_013', permission_name: 'stock.create' },
  { _id: 'PERM_014', permission_name: 'stock.read' },
  { _id: 'PERM_015', permission_name: 'stock.update' }
];

const DEFAULT_ROLE_PERMISSIONS = [
  { _id: 'RP_001', roleId: 'ROLE_001', permissionId: 'PERM_001', roleName: 'Administrator', permissionName: 'user.create', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_002', roleId: 'ROLE_001', permissionId: 'PERM_002', roleName: 'Administrator', permissionName: 'user.read', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_003', roleId: 'ROLE_001', permissionId: 'PERM_003', roleName: 'Administrator', permissionName: 'user.update', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_004', roleId: 'ROLE_001', permissionId: 'PERM_004', roleName: 'Administrator', permissionName: 'user.delete', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_005', roleId: 'ROLE_002', permissionId: 'PERM_001', roleName: 'Manager', permissionName: 'user.create', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_006', roleId: 'ROLE_002', permissionId: 'PERM_002', roleName: 'Manager', permissionName: 'user.read', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_007', roleId: 'ROLE_002', permissionId: 'PERM_003', roleName: 'Manager', permissionName: 'user.update', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_008', roleId: 'ROLE_003', permissionId: 'PERM_002', roleName: 'Sales Executive', permissionName: 'user.read', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_009', roleId: 'ROLE_003', permissionId: 'PERM_009', roleName: 'Sales Executive', permissionName: 'order.create', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { _id: 'RP_010', roleId: 'ROLE_003', permissionId: 'PERM_010', roleName: 'Sales Executive', permissionName: 'order.read', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
];

const getCurrentSessionUser = () => {
  const storedMockUser = localStorage.getItem('mockUser');
  const storedUser = localStorage.getItem('user');
  const rawUser = storedMockUser || storedUser;

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const appendUserLog = ({ action, description, status = 'success' }) => {
  const currentUser = getCurrentSessionUser();
  if (!currentUser?._id && !currentUser?.user_id) return;

  const currentLogs = (() => {
    try {
      return JSON.parse(localStorage.getItem('userLogs') || '[]');
    } catch {
      return [];
    }
  })();

  const newLog = {
    _id: `LOG_${Date.now()}`,
    user_id: currentUser._id || currentUser.user_id,
    userName: [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') || currentUser.username || currentUser.email || 'Current User',
    action,
    description,
    timestamp: new Date().toISOString(),
    ip_address: '127.0.0.1',
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Browser Session',
    status
  };

  localStorage.setItem('userLogs', JSON.stringify([newLog, ...currentLogs]));
};

const RolePermissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, mapping: null });
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [formData, setFormData] = useState({
    roleId: '',
    permissionId: '',
    created_at: new Date().toISOString().slice(0, 10)
  });

  const queryClient = useQueryClient();

  const { data: rolePermissionsData, isLoading, refetch } = useQuery(
    'rolePermissions',
    () => {
      const storedRolePermissions = localStorage.getItem('rolePermissions');
      return storedRolePermissions ? JSON.parse(storedRolePermissions) : DEFAULT_ROLE_PERMISSIONS;
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        console.log('Role permissions data refreshed:', data);
      }
    }
  );

  const { data: rolesData } = useQuery(
    'roles',
    () => {
      const storedRoles = localStorage.getItem('roles');
      return storedRoles ? JSON.parse(storedRoles) : DEFAULT_ROLES;
    },
    {
      refetchInterval: 15000
    }
  );

  const { data: permissionsData } = useQuery(
    'permissions',
    () => {
      const storedPermissions = localStorage.getItem('permissions');
      return storedPermissions ? JSON.parse(storedPermissions) : DEFAULT_PERMISSIONS;
    },
    {
      refetchInterval: 15000
    }
  );

  const createRolePermissionMutation = useMutation(
    async (mappingData) => {
      const mappings = rolePermissionsData || [];
      const existingMapping = mappings.find(
        (rp) => rp.roleId === mappingData.roleId && rp.permissionId === mappingData.permissionId
      );

      if (existingMapping) {
        throw new Error('This role already has this permission');
      }

      const roleName = rolesData.find((r) => r._id === mappingData.roleId)?.role_name || 'Unknown Role';
      const permissionName = permissionsData.find((p) => p._id === mappingData.permissionId)?.permission_name || 'Unknown Permission';

      const newMapping = {
        ...mappingData,
        _id: `RP_${Date.now()}`,
        roleName,
        permissionName,
        created_at: new Date(mappingData.created_at).toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedMappings = [...mappings, newMapping];
      localStorage.setItem('rolePermissions', JSON.stringify(updatedMappings));
      queryClient.setQueryData('rolePermissions', updatedMappings);
      appendUserLog({
        action: 'assign_role_permission',
        description: `Assigned ${permissionName} to role ${roleName}`
      });
      return newMapping;
    },
    {
      onSuccess: () => {
        toast.success('Role permission mapping created successfully');
        setShowCreateModal(false);
        resetForm();
        setShowActionMenu(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create role permission mapping');
      }
    }
  );

  const updateRolePermissionMutation = useMutation(
    async (updatedMapping) => {
      const mappings = rolePermissionsData || [];
      const duplicateMapping = mappings.find(
        (rp) =>
          rp._id !== updatedMapping._id &&
          rp.roleId === updatedMapping.roleId &&
          rp.permissionId === updatedMapping.permissionId
      );

      if (duplicateMapping) {
        throw new Error('This role already has this permission');
      }

      const roleName = rolesData.find((r) => r._id === updatedMapping.roleId)?.role_name || 'Unknown Role';
      const permissionName = permissionsData.find((p) => p._id === updatedMapping.permissionId)?.permission_name || 'Unknown Permission';

      const nextMapping = {
        ...updatedMapping,
        roleName,
        permissionName,
        created_at: new Date(updatedMapping.created_at).toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedMappings = mappings.map((rp) => (rp._id === updatedMapping._id ? nextMapping : rp));
      localStorage.setItem('rolePermissions', JSON.stringify(updatedMappings));
      queryClient.setQueryData('rolePermissions', updatedMappings);
      appendUserLog({
        action: 'update_role_permission',
        description: `Updated mapping for role ${roleName} and permission ${permissionName}`
      });
      return nextMapping;
    },
    {
      onSuccess: (updatedMapping) => {
        toast.success('Role permission mapping updated successfully');
        setSelectedMapping(updatedMapping);
        setShowEditModal(false);
        setShowDetailsModal(false);
        setShowActionMenu(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update role permission mapping');
      }
    }
  );

  const deleteRolePermissionMutation = useMutation(
    async (mappingId) => {
      const mappings = rolePermissionsData || [];
      const mappingToDelete = mappings.find((rp) => rp._id === mappingId);
      const updatedMappings = mappings.filter((rp) => rp._id !== mappingId);
      localStorage.setItem('rolePermissions', JSON.stringify(updatedMappings));
      queryClient.setQueryData('rolePermissions', updatedMappings);

      if (mappingToDelete) {
        appendUserLog({
          action: 'remove_role_permission',
          description: `Removed ${mappingToDelete.permissionName} from role ${mappingToDelete.roleName}`
        });
      }

      return updatedMappings;
    },
    {
      onSuccess: () => {
        toast.success('Role permission mapping deleted successfully');
        setShowDetailsModal(false);
        setShowActionMenu(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete role permission mapping');
      }
    }
  );

  const rolePermissions = rolePermissionsData || DEFAULT_ROLE_PERMISSIONS;
  const roles = rolesData?.length ? rolesData : DEFAULT_ROLES;
  const permissions = permissionsData?.length ? permissionsData : DEFAULT_PERMISSIONS;

  const filteredRolePermissions = useMemo(
    () =>
      rolePermissions.filter((rp) => {
        const matchesSearch =
          rp.roleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rp.permissionName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || rp.roleId === filterRole;
        return matchesSearch && matchesRole;
      }),
    [filterRole, rolePermissions, searchTerm]
  );

  const resetForm = () => {
    setFormData({
      roleId: '',
      permissionId: '',
      created_at: new Date().toISOString().slice(0, 10)
    });
  };

  const openDetailsModal = (mapping) => {
    setSelectedMapping(mapping);
    setShowActionMenu(null);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedMapping(null);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowActionMenu(null);
    setShowCreateModal(true);
  };

  const openEditModal = (mapping) => {
    setSelectedMapping(mapping);
    setFormData({
      roleId: mapping.roleId,
      permissionId: mapping.permissionId,
      created_at: mapping.created_at ? new Date(mapping.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
    setShowDetailsModal(false);
    setShowActionMenu(null);
    setShowEditModal(true);
  };

  const openDeleteDialog = (mapping) => {
    setSelectedMapping(mapping);
    setShowActionMenu(null);
    setDeleteDialog({
      open: true,
      mapping
    });
  };

  const closeDeleteDialog = () => {
    if (deleteRolePermissionMutation.isLoading) return;
    setDeleteDialog({ open: false, mapping: null });
  };

  const handleCreateMapping = () => {
    if (!formData.roleId) {
      toast.error('Role is required');
      return;
    }
    if (!formData.permissionId) {
      toast.error('Permission is required');
      return;
    }
    createRolePermissionMutation.mutate(formData);
  };

  const handleUpdateMapping = () => {
    if (!selectedMapping) return;
    if (!formData.roleId) {
      toast.error('Role is required');
      return;
    }
    if (!formData.permissionId) {
      toast.error('Permission is required');
      return;
    }
    updateRolePermissionMutation.mutate({
      ...selectedMapping,
      ...formData
    });
  };

  const handleDeleteMapping = (mappingToDelete) => {
    if (!mappingToDelete?._id) {
      toast.error('Unable to delete mapping: missing details');
      return;
    }
    deleteRolePermissionMutation.mutate(mappingToDelete._id);
  };

  const confirmDeleteMapping = () => {
    if (!deleteDialog.mapping) return;
    const mappingToDelete = deleteDialog.mapping;
    closeDeleteDialog();
    handleDeleteMapping(mappingToDelete);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Role permissions data refreshed');
  };

  const handleMenuAction = (action, targetMapping) => {
    switch (action) {
      case 'view':
        openDetailsModal(targetMapping);
        return;
      case 'edit':
        openEditModal(targetMapping);
        return;
      case 'delete':
        openDeleteDialog(targetMapping);
        return;
      default:
        setShowActionMenu(null);
    }
  };

  const totalMappings = rolePermissions.length;
  const totalRoles = new Set(rolePermissions.map((rp) => rp.roleId)).size;
  const totalPermissions = new Set(rolePermissions.map((rp) => rp.permissionId)).size;
  const rolePermissionCounts = rolePermissions.reduce((acc, rp) => {
    acc[rp.roleId] = (acc[rp.roleId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Role Permissions</h1>
            <p className="page-subtitle">Manage role-permission mappings and access controls</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleRefresh} className="btn btn-secondary flex items-center space-x-2" disabled={isLoading}>
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button onClick={openCreateModal} className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Add Mapping</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mappings</p>
              <p className="text-2xl font-bold text-gray-900">{totalMappings}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Roles with Permissions</p>
              <p className="text-2xl font-bold text-green-600">{totalRoles}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Permissions</p>
              <p className="text-2xl font-bold text-purple-600">{totalPermissions}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <KeyIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(rolePermissionCounts).map(([roleId, count]) => {
          const role = roles.find((r) => r._id === roleId);
          return (
            <div key={roleId} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{role?.role_name || 'Unknown'}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search role-permission mappings..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="input" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRolePermissions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No role-permission mappings found</td>
                </tr>
              ) : (
                filteredRolePermissions.map((rp) => (
                  <tr key={rp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rp.roleName}</div>
                      <div className="text-xs text-gray-500">ID: {rp.roleId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rp.permissionName}</div>
                      <div className="text-xs text-gray-500">ID: {rp.permissionId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(rp.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleMenuAction('view', rp)} style={{ backgroundColor: '#6b7280', color: 'white', border: '2px solid #4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          VIEW
                        </button>
                        <button type="button" onClick={() => handleMenuAction('edit', rp)} style={{ backgroundColor: '#2563eb', color: 'white', border: '2px solid #1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(rp)}
                          disabled={deleteRolePermissionMutation.isLoading && deleteRolePermissionMutation.variables === rp._id}
                          className={`
                            ${deleteRolePermissionMutation.isLoading && deleteRolePermissionMutation.variables === rp._id
                              ? 'bg-gray-400 border-gray-500 cursor-not-allowed animate-pulse'
                              : 'bg-red-600 border-red-700 hover:bg-red-700 cursor-pointer transition-all duration-300'}
                            text-white font-bold text-xs px-2 py-1 rounded border-2
                          `}
                          style={{
                            minWidth: '65px',
                            boxShadow: deleteRolePermissionMutation.isLoading && deleteRolePermissionMutation.variables === rp._id ? '0 0 0 0 rgba(220, 38, 38, 0.7)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {deleteRolePermissionMutation.isLoading && deleteRolePermissionMutation.variables === rp._id ? 'DELETING...' : 'DELETE'}
                        </button>
                        <div className="relative">
                          <button type="button" onClick={() => setShowActionMenu(showActionMenu === rp._id ? null : rp._id)} style={{ backgroundColor: '#6b7280', color: 'white', border: '2px solid #4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', minWidth: '50px' }}>
                            MORE
                          </button>
                          {showActionMenu === rp._id && (
                            <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="py-1">
                                <button onClick={() => handleMenuAction('view', rp)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <EyeIcon className="h-4 w-4 mr-2 text-gray-600" />
                                  View Mapping
                                </button>
                                <button onClick={() => handleMenuAction('edit', rp)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <PencilIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  Edit Mapping
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedMapping(rp);
                                    setShowActionMenu(null);
                                    toast.success(`${rp.permissionName} is assigned to ${rp.roleName}`);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <ShieldCheckIcon className="h-4 w-4 mr-2 text-purple-600" />
                                  Quick Summary
                                </button>
                                <div className="border-t border-gray-100"></div>
                                <button onClick={() => handleMenuAction('delete', rp)} className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete Mapping
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
              <h3 className="text-lg font-semibold text-gray-900">Add Role Permission</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateMapping(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={formData.roleId} onChange={(e) => setFormData((prev) => ({ ...prev, roleId: e.target.value }))} className="input" required>
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission *</label>
                  <select value={formData.permissionId} onChange={(e) => setFormData((prev) => ({ ...prev, permissionId: e.target.value }))} className="input" required>
                    <option value="">Select a permission</option>
                    {permissions.map((permission) => (
                      <option key={permission._id} value={permission._id}>
                        {permission.permission_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <input type="date" value={formData.created_at} onChange={(e) => setFormData((prev) => ({ ...prev, created_at: e.target.value }))} className="input" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createRolePermissionMutation.isLoading}>
                  {createRolePermissionMutation.isLoading ? 'Creating...' : 'Add Mapping'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {showEditModal && selectedMapping && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Role Permission</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateMapping(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={formData.roleId} onChange={(e) => setFormData((prev) => ({ ...prev, roleId: e.target.value }))} className="input" required>
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission *</label>
                  <select value={formData.permissionId} onChange={(e) => setFormData((prev) => ({ ...prev, permissionId: e.target.value }))} className="input" required>
                    <option value="">Select a permission</option>
                    {permissions.map((permission) => (
                      <option key={permission._id} value={permission._id}>
                        {permission.permission_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <input type="date" value={formData.created_at} onChange={(e) => setFormData((prev) => ({ ...prev, created_at: e.target.value }))} className="input" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updateRolePermissionMutation.isLoading}>
                  {updateRolePermissionMutation.isLoading ? 'Updating...' : 'Update Mapping'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {showDetailsModal && selectedMapping && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Role Permission Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-sm text-gray-900">{selectedMapping.roleName}</p>
                <p className="text-xs text-gray-500">ID: {selectedMapping.roleId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Permission</p>
                <p className="text-sm text-gray-900">{selectedMapping.permissionName}</p>
                <p className="text-xs text-gray-500">ID: {selectedMapping.permissionId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm text-gray-900">{new Date(selectedMapping.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-900">{new Date(selectedMapping.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button onClick={() => openEditModal(selectedMapping)} className="btn btn-primary btn-sm">Edit</button>
                <button onClick={() => openDeleteDialog(selectedMapping)} className="btn btn-outline btn-sm">Delete</button>
                <button onClick={() => setShowDetailsModal(false)} className="btn btn-secondary btn-sm">Close</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteMapping}
        title="Delete Mapping"
        message={
          deleteDialog.mapping
            ? `Are you sure you want to remove ${deleteDialog.mapping.permissionName} from ${deleteDialog.mapping.roleName}?`
            : 'Are you sure you want to delete this mapping?'
        }
        itemName={deleteDialog.mapping ? `${deleteDialog.mapping.roleName} -> ${deleteDialog.mapping.permissionName}` : ''}
        type="delete"
        loading={deleteRolePermissionMutation.isLoading}
      />
    </div>
  );
};

export default RolePermissions;
