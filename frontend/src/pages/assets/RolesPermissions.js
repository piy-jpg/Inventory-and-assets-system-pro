import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const RolesPermissions = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {
      users: ['view'],
      assets: ['view'],
      inventory: ['view'],
      reports: ['view']
    }
  });

  const queryClient = useQueryClient();

  // Real-time roles data
  const { data: rolesData, isLoading, refetch } = useQuery(
    'rolesPermissions',
    () => {
      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) {
        return JSON.parse(storedRoles);
      }
      
      return [
        {
          _id: 'ROLE_001',
          name: 'Admin',
          description: 'Full system access with all permissions',
          permissions: {
            users: ['view', 'create', 'edit', 'delete'],
            assets: ['view', 'create', 'edit', 'delete'],
            inventory: ['view', 'create', 'edit', 'delete'],
            reports: ['view', 'create', 'export']
          },
          userCount: 1,
          createdAt: '2023-01-15T10:00:00Z',
          updatedAt: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'ROLE_002',
          name: 'Inventory Manager',
          description: 'Manage inventory and assets with reporting',
          permissions: {
            users: ['view'],
            assets: ['view', 'create', 'edit', 'delete'],
            inventory: ['view', 'create', 'edit', 'delete'],
            reports: ['view', 'create', 'export']
          },
          userCount: 3,
          createdAt: '2023-01-15T10:00:00Z',
          updatedAt: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'ROLE_003',
          name: 'Accountant',
          description: 'Financial reporting and view access',
          permissions: {
            users: ['view'],
            assets: ['view'],
            inventory: ['view'],
            reports: ['view', 'create', 'export']
          },
          userCount: 2,
          createdAt: '2023-01-15T10:00:00Z',
          updatedAt: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'ROLE_004',
          name: 'Staff',
          description: 'Basic access for daily operations',
          permissions: {
            users: ['view'],
            assets: ['view', 'edit'],
            inventory: ['view', 'create'],
            reports: ['view']
          },
          userCount: 8,
          createdAt: '2023-01-15T10:00:00Z',
          updatedAt: '2023-01-15T10:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 15000, // Real-time refresh every 15 seconds
      onSuccess: (data) => {
        console.log('Roles data refreshed:', data);
      }
    }
  );

  // Mutation for creating new role
  const createRoleMutation = useMutation(
    async (roleData) => {
      const roles = rolesData || [];
      const newRoleWithId = {
        ...roleData,
        _id: `ROLE_${Date.now()}`,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedRoles = [...roles, newRoleWithId];
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      queryClient.setQueryData('rolesPermissions', updatedRoles);
      return updatedRoles;
    },
    {
      onSuccess: () => {
        toast.success('Role created successfully');
        setShowCreateModal(false);
        resetNewRole();
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
        role._id === updatedRole._id ? { ...updatedRole, updatedAt: new Date().toISOString() } : role
      );
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      queryClient.setQueryData('rolesPermissions', updatedRoles);
      return updatedRoles;
    },
    {
      onSuccess: () => {
        toast.success('Role updated successfully');
        setShowEditModal(false);
        setEditingRole(null);
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
      const roleToDelete = roles.find(r => r._id === roleId);
      
      if (roleToDelete && roleToDelete.userCount > 0) {
        throw new Error('Cannot delete role with assigned users');
      }
      
      const updatedRoles = roles.filter(role => role._id !== roleId);
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      queryClient.setQueryData('rolesPermissions', updatedRoles);
      return updatedRoles;
    },
    {
      onSuccess: () => {
        toast.success('Role deleted successfully');
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete role');
      }
    }
  );

  const roles = rolesData || [];

  const permissionOptions = ['view', 'create', 'edit', 'delete', 'export'];
  const modules = [
    { key: 'users', name: 'Users', icon: UserGroupIcon },
    { key: 'assets', name: 'Assets', icon: CubeIcon },
    { key: 'inventory', name: 'Inventory', icon: DocumentTextIcon },
    { key: 'reports', name: 'Reports', icon: ChartBarIcon }
  ];

  const resetNewRole = () => {
    setNewRole({
      name: '',
      description: '',
      permissions: {
        users: ['view'],
        assets: ['view'],
        inventory: ['view'],
        reports: ['view']
      }
    });
  };

  const handlePermissionToggle = (roleData, module, permission) => {
    if (editingRole && editingRole._id) {
      setEditingRole(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: prev.permissions[module].includes(permission)
            ? prev.permissions[module].filter(p => p !== permission)
            : [...prev.permissions[module], permission]
        }
      }));
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: prev.permissions[module].includes(permission)
            ? prev.permissions[module].filter(p => p !== permission)
            : [...prev.permissions[module], permission]
        }
      }));
    }
  };

  const openEditModal = (role) => {
    setEditingRole({ ...role });
    setShowEditModal(true);
  };

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    createRoleMutation.mutate(newRole);
  };

  const handleUpdateRole = () => {
    if (!editingRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    updateRoleMutation.mutate(editingRole);
  };

  const handleDeleteRole = (roleId) => {
    const role = roles.find(r => r._id === roleId);
    if (role && role.userCount > 0) {
      toast.error(`Cannot delete role "${role.name}" as it has ${role.userCount} assigned users`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Roles data refreshed');
  };

  const getPermissionColor = (permission) => {
    switch (permission) {
      case 'view':
        return 'bg-blue-100 text-blue-800';
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'edit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'export':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="page-title">Roles & Permissions</h1>
            <p className="page-subtitle">Create roles and assign permissions with RBAC</p>
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
              onClick={() => {
                resetNewRole();
                setShowCreateModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Role</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Roles Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {roles.map((role) => (
          <motion.div
            key={role._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.userCount} users</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditModal(role)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="Edit Role"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteRole(role._id)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Delete Role"
                  disabled={role.userCount > 0}
                >
                  <TrashIcon className={`h-4 w-4 ${role.userCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{role.description}</p>

            <div className="space-y-3">
              {modules.map(module => (
                <div key={module.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <module.icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{module.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions[module.key]?.map(permission => (
                      <span
                        key={permission}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getPermissionColor(permission)}`}
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Created: {new Date(role.createdAt).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
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
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Role</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="e.g., Inventory Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows="3"
                  placeholder="Describe the role and its responsibilities"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Permissions
                </h4>
                <div className="space-y-4">
                  {modules.map(module => (
                    <div key={module.key} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <module.icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{module.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {permissionOptions.map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newRole.permissions[module.key]?.includes(permission) || false}
                              onChange={() => handlePermissionToggle(null, module.key, permission)}
                              className="mr-2"
                            />
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPermissionColor(permission)}`}>
                              {permission}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="btn btn-primary"
                disabled={createRoleMutation.isLoading}
              >
                {createRoleMutation.isLoading ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
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
              <h3 className="text-lg font-semibold text-gray-900">Edit Role</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows="3"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Permissions
                </h4>
                <div className="space-y-4">
                  {modules.map(module => (
                    <div key={module.key} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <module.icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{module.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {permissionOptions.map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingRole.permissions[module.key]?.includes(permission) || false}
                              onChange={() => handlePermissionToggle(editingRole, module.key, permission)}
                              className="mr-2"
                            />
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPermissionColor(permission)}`}>
                              {permission}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                onClick={handleUpdateRole}
                className="btn btn-primary"
                disabled={updateRoleMutation.isLoading}
              >
                {updateRoleMutation.isLoading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RolesPermissions;
