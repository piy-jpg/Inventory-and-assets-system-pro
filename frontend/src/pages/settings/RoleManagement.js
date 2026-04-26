import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const RoleManagement = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPermissionsHelp, setShowPermissionsHelp] = useState(false);
  
  const queryClient = useQueryClient();

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });

  // Mock data for roles
  const mockRoles = [
    {
      id: 'role_admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: [
        'users_read', 'users_write', 'users_delete',
        'inventory_read', 'inventory_write', 'inventory_delete',
        'assets_read', 'assets_write', 'assets_delete',
        'transactions_read', 'transactions_write', 'transactions_delete',
        'sales_read', 'sales_write', 'sales_delete',
        'purchases_read', 'purchases_write', 'purchases_delete',
        'reports_view', 'reports_export', 'analytics_view',
        'settings_manage', 'system_admin', 'backup_manage'
      ],
      userCount: 2,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-04-20T14:30:00Z'
    },
    {
      id: 'role_manager',
      name: 'Manager',
      description: 'Department management with limited admin access',
      permissions: [
        'users_read', 'users_write',
        'inventory_read', 'inventory_write', 'inventory_delete',
        'assets_read', 'assets_write',
        'transactions_read', 'transactions_write',
        'sales_read', 'sales_write',
        'purchases_read', 'purchases_write',
        'reports_view', 'reports_export', 'analytics_view'
      ],
      userCount: 5,
      isActive: true,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-04-18T16:45:00Z'
    },
    {
      id: 'role_staff',
      name: 'Staff',
      description: 'Basic operational access',
      permissions: [
        'inventory_read', 'inventory_write',
        'assets_read',
        'transactions_read', 'transactions_write',
        'sales_read', 'sales_write',
        'reports_view'
      ],
      userCount: 12,
      isActive: true,
      createdAt: '2024-01-25T11:00:00Z',
      updatedAt: '2024-04-15T10:20:00Z'
    },
    {
      id: 'role_viewer',
      name: 'Viewer',
      description: 'Read-only access for reporting',
      permissions: [
        'inventory_read',
        'assets_read',
        'transactions_read',
        'sales_read',
        'purchases_read',
        'reports_view'
      ],
      userCount: 3,
      isActive: true,
      createdAt: '2024-02-01T13:00:00Z',
      updatedAt: '2024-04-10T09:15:00Z'
    }
  ];

  const [roles, setRoles] = useState(mockRoles);

  // Permission categories
  const permissionCategories = {
    users: {
      name: 'User Management',
      icon: UserGroupIcon,
      permissions: [
        { id: 'users_read', name: 'View Users', description: 'View user list and profiles' },
        { id: 'users_write', name: 'Create/Edit Users', description: 'Create new users and edit existing ones' },
        { id: 'users_delete', name: 'Delete Users', description: 'Remove users from system' }
      ]
    },
    inventory: {
      name: 'Inventory Management',
      icon: Cog6ToothIcon,
      permissions: [
        { id: 'inventory_read', name: 'View Inventory', description: 'View product list and stock levels' },
        { id: 'inventory_write', name: 'Manage Inventory', description: 'Add, edit, and delete products' },
        { id: 'inventory_delete', name: 'Delete Inventory', description: 'Remove products from system' }
      ]
    },
    assets: {
      name: 'Asset Management',
      icon: ShieldCheckIcon,
      permissions: [
        { id: 'assets_read', name: 'View Assets', description: 'View asset list and details' },
        { id: 'assets_write', name: 'Manage Assets', description: 'Add, edit, and delete assets' },
        { id: 'assets_delete', name: 'Delete Assets', description: 'Remove assets from system' }
      ]
    },
    transactions: {
      name: 'Transactions',
      icon: Cog6ToothIcon,
      permissions: [
        { id: 'transactions_read', name: 'View Transactions', description: 'View transaction history' },
        { id: 'transactions_write', name: 'Manage Transactions', description: 'Create and edit transactions' },
        { id: 'transactions_delete', name: 'Delete Transactions', description: 'Remove transactions' }
      ]
    },
    sales: {
      name: 'Sales Management',
      icon: Cog6ToothIcon,
      permissions: [
        { id: 'sales_read', name: 'View Sales', description: 'View sales reports and history' },
        { id: 'sales_write', name: 'Manage Sales', description: 'Create and edit sales' },
        { id: 'sales_delete', name: 'Delete Sales', description: 'Remove sales records' }
      ]
    },
    purchases: {
      name: 'Purchase Management',
      icon: Cog6ToothIcon,
      permissions: [
        { id: 'purchases_read', name: 'View Purchases', description: 'View purchase orders and history' },
        { id: 'purchases_write', name: 'Manage Purchases', description: 'Create and edit purchase orders' },
        { id: 'purchases_delete', name: 'Delete Purchases', description: 'Remove purchase records' }
      ]
    },
    reports: {
      name: 'Reports & Analytics',
      icon: Cog6ToothIcon,
      permissions: [
        { id: 'reports_view', name: 'View Reports', description: 'Access all reports' },
        { id: 'reports_export', name: 'Export Reports', description: 'Download reports in various formats' },
        { id: 'analytics_view', name: 'View Analytics', description: 'Access analytics dashboard' }
      ]
    },
    system: {
      name: 'System Administration',
      icon: ShieldCheckIcon,
      permissions: [
        { id: 'settings_manage', name: 'Manage Settings', description: 'Configure system settings' },
        { id: 'system_admin', name: 'System Admin', description: 'Full system administration' },
        { id: 'backup_manage', name: 'Manage Backups', description: 'Create and restore backups' }
      ]
    }
  };

  const handleCreateRole = () => {
    if (!roleForm.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (roleForm.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    const newRole = {
      id: `role_${Date.now()}`,
      name: roleForm.name,
      description: roleForm.description,
      permissions: roleForm.permissions,
      userCount: 0,
      isActive: roleForm.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoles(prev => [...prev, newRole]);
    toast.success('Role created successfully');
    setShowCreateRoleModal(false);
    resetRoleForm();
  };

  const handleEditRole = () => {
    if (!roleForm.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (roleForm.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    setRoles(prev => prev.map(role => 
      role.id === selectedRole.id 
        ? { ...role, ...roleForm, updatedAt: new Date().toISOString() }
        : role
    ));

    toast.success('Role updated successfully');
    setShowEditRoleModal(false);
    resetRoleForm();
  };

  const handleDeleteRole = () => {
    if (selectedRole.userCount > 0) {
      toast.error('Cannot delete role with assigned users');
      return;
    }

    setRoles(prev => prev.filter(role => role.id !== selectedRole.id));
    toast.success('Role deleted successfully');
    setShowDeleteConfirm(false);
    setSelectedRole(null);
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
      isActive: role.isActive
    });
    setShowEditRoleModal(true);
  };

  const togglePermission = (permissionId) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const toggleRoleStatus = (roleId) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, isActive: !role.isActive, updatedAt: new Date().toISOString() }
        : role
    ));
    toast.success('Role status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPermissionsHelp(true)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <EyeIcon className="h-5 w-5" />
            <span>Permission Guide</span>
          </button>
          <button
            onClick={() => {
              resetRoleForm();
              setShowCreateRoleModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Roles</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    role.name === 'Administrator' ? 'bg-red-100' :
                    role.name === 'Manager' ? 'bg-blue-100' :
                    role.name === 'Staff' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <ShieldCheckIcon className={`h-6 w-6 ${
                      role.name === 'Administrator' ? 'text-red-600' :
                      role.name === 'Manager' ? 'text-blue-600' :
                      role.name === 'Staff' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {role.permissions.length} permissions
                      </span>
                      <span className="text-xs text-gray-500">
                        {role.userCount} users
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        role.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRoleStatus(role.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      role.isActive 
                        ? 'text-gray-400 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                    title={role.isActive ? 'Deactivate Role' : 'Activate Role'}
                  >
                    {role.isActive ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                    title="Edit Role"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete Role"
                    disabled={role.userCount > 0}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showCreateRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Create New Role</h3>
                  <button
                    onClick={() => setShowCreateRoleModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={roleForm.description}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter role description"
                    />
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Permissions *
                    </label>
                    <div className="space-y-4">
                      {Object.entries(permissionCategories).map(([categoryKey, category]) => {
                        const Icon = category.icon;
                        return (
                          <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Icon className="h-5 w-5 text-gray-600" />
                              <h4 className="font-medium text-gray-900">{category.name}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {category.permissions.map(permission => (
                                <label
                                  key={permission.id}
                                  className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={roleForm.permissions.includes(permission.id)}
                                    onChange={() => togglePermission(permission.id)}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {permission.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {permission.description}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={roleForm.isActive}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active Role
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowCreateRoleModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Role
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowEditRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Edit Role</h3>
                  <button
                    onClick={() => setShowEditRoleModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={roleForm.description}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter role description"
                    />
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Permissions *
                    </label>
                    <div className="space-y-4">
                      {Object.entries(permissionCategories).map(([categoryKey, category]) => {
                        const Icon = category.icon;
                        return (
                          <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Icon className="h-5 w-5 text-gray-600" />
                              <h4 className="font-medium text-gray-900">{category.name}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {category.permissions.map(permission => (
                                <label
                                  key={permission.id}
                                  className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={roleForm.permissions.includes(permission.id)}
                                    onChange={() => togglePermission(permission.id)}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {permission.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {permission.description}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={roleForm.isActive}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active Role
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowEditRoleModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Role
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Role</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete the "{selectedRole?.name}" role?
                  </p>
                </div>
              </div>

              {selectedRole?.userCount > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This role has {selectedRole.userCount} assigned users. You cannot delete it until all users are reassigned.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRole}
                  disabled={selectedRole?.userCount > 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Role
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permissions Help Modal */}
      <AnimatePresence>
        {showPermissionsHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowPermissionsHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Permission Guide</h3>
                <button
                  onClick={() => setShowPermissionsHelp(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionCategories).map(([categoryKey, category]) => {
                  const Icon = category.icon;
                  return (
                    <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.permissions.map(permission => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {permission.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPermissionsHelp(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManagement;
