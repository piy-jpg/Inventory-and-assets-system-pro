import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  KeyIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const UserPermissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePermissions, setOverridePermissions] = useState({});

  const queryClient = useQueryClient();

  // Real-time users data with permissions
  const { data: usersData, isLoading, refetch } = useQuery(
    'usersWithPermissions',
    () => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
      
      return [
        {
          _id: 'USR_001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@company.com',
          username: 'johnsmith',
          role: 'admin',
          status: 'active',
          department: 'Management',
          defaultPermissions: {
            users: ['view', 'create', 'edit', 'delete'],
            assets: ['view', 'create', 'edit', 'delete'],
            inventory: ['view', 'create', 'edit', 'delete'],
            reports: ['view', 'create', 'export']
          },
          overridePermissions: {},
          hasOverride: false
        },
        {
          _id: 'USR_002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@company.com',
          username: 'sarahjohnson',
          role: 'manager',
          status: 'active',
          department: 'HR',
          defaultPermissions: {
            users: ['view'],
            assets: ['view', 'create', 'edit'],
            inventory: ['view', 'create', 'edit'],
            reports: ['view', 'export']
          },
          overridePermissions: {
            users: ['view', 'create'],
            assets: ['view', 'create', 'edit', 'delete'],
            inventory: ['view', 'create', 'edit', 'delete'],
            reports: ['view', 'create', 'export']
          },
          hasOverride: true
        },
        {
          _id: 'USR_003',
          firstName: 'Mike',
          lastName: 'Wilson',
          email: 'mike.wilson@company.com',
          username: 'mikewilson',
          role: 'staff',
          status: 'active',
          department: 'IT',
          defaultPermissions: {
            users: ['view'],
            assets: ['view', 'edit'],
            inventory: ['view', 'create'],
            reports: ['view']
          },
          overridePermissions: {
            assets: ['view', 'create', 'edit', 'delete'],
            inventory: ['view', 'create', 'edit', 'delete']
          },
          hasOverride: true
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('User permissions data refreshed:', data);
      }
    }
  );

  // Mutation for updating user permissions
  const updatePermissionsMutation = useMutation(
    async ({ userId, overridePermissions }) => {
      const users = usersData || [];
      const updatedUsers = users.map(user => 
        user._id === userId ? {
          ...user,
          overridePermissions,
          hasOverride: Object.keys(overridePermissions).some(module => 
            overridePermissions[module].length > 0
          ),
          updatedAt: new Date().toISOString()
        } : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      queryClient.setQueryData('usersWithPermissions', updatedUsers);
      return updatedUsers;
    },
    {
      onSuccess: () => {
        toast.success('User permissions updated successfully');
        setShowOverrideModal(false);
        setSelectedUser(null);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update user permissions');
      }
    }
  );

  // Mutation for removing permission overrides
  const removeOverrideMutation = useMutation(
    async (userId) => {
      const users = usersData || [];
      const updatedUsers = users.map(user => 
        user._id === userId ? {
          ...user,
          overridePermissions: {},
          hasOverride: false,
          updatedAt: new Date().toISOString()
        } : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      queryClient.setQueryData('usersWithPermissions', updatedUsers);
      return updatedUsers;
    },
    {
      onSuccess: () => {
        toast.success('Permission overrides removed successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to remove permission overrides');
      }
    }
  );

  const users = usersData || [];

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const permissionOptions = ['view', 'create', 'edit', 'delete', 'export'];
  const modules = [
    { key: 'users', name: 'Users', icon: UserGroupIcon },
    { key: 'assets', name: 'Assets', icon: CubeIcon },
    { key: 'inventory', name: 'Inventory', icon: DocumentTextIcon },
    { key: 'reports', name: 'Reports', icon: ChartBarIcon }
  ];

  const openOverrideModal = (user) => {
    setSelectedUser(user);
    setOverridePermissions(user.overridePermissions || {});
    setShowOverrideModal(true);
  };

  const handlePermissionToggle = (module, permission) => {
    setOverridePermissions(prev => ({
      ...prev,
      [module]: prev[module]?.includes(permission)
        ? prev[module].filter(p => p !== permission)
        : [...(prev[module] || []), permission]
    }));
  };

  const handleSaveOverrides = () => {
    if (!selectedUser) return;

    updatePermissionsMutation.mutate({
      userId: selectedUser._id,
      overridePermissions
    });
  };

  const handleRemoveOverride = (userId) => {
    if (window.confirm('Are you sure you want to remove all permission overrides for this user?')) {
      removeOverrideMutation.mutate(userId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('User permissions data refreshed');
  };

  const getEffectivePermissions = (user) => {
    const effective = {};
    modules.forEach(module => {
      effective[module.key] = [
        ...(user.defaultPermissions[module.key] || []),
        ...(user.overridePermissions[module.key] || [])
      ];
      // Remove duplicates
      effective[module.key] = [...new Set(effective[module.key])];
    });
    return effective;
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

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">User Permissions (Advanced)</h1>
            <p className="page-subtitle">Override permissions for specific users with fine-grained control</p>
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

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
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
      </motion.div>

      {/* Users with Permissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const effectivePermissions = getEffectivePermissions(user);
            
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      {user.hasOverride && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Override Applied
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openOverrideModal(user)}
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <KeyIcon className="h-4 w-4" />
                      <span>Override Permissions</span>
                    </button>
                    {user.hasOverride && (
                      <button
                        onClick={() => handleRemoveOverride(user._id)}
                        className="btn btn-outline flex items-center space-x-2"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <span>Remove Override</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Default Permissions (Role-based)</h4>
                    <div className="space-y-2">
                      {modules.map(module => (
                        <div key={module.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <module.icon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">{module.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {user.defaultPermissions[module.key]?.map(permission => (
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
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Effective Permissions 
                      {user.hasOverride && (
                        <span className="text-xs text-orange-600 ml-2">(with overrides)</span>
                      )}
                    </h4>
                    <div className="space-y-2">
                      {modules.map(module => (
                        <div key={module.key} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center space-x-2">
                            <module.icon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">{module.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {effectivePermissions[module.key]?.map(permission => (
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
                  </div>
                </div>

                {user.hasOverride && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-800">
                      <strong>Override Active:</strong> This user has custom permissions that override their default role permissions.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Override Permissions Modal */}
      {showOverrideModal && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowOverrideModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Override Permissions for {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Override the default role permissions for this user. Leave permissions empty to use default role permissions.
              </p>
            </div>

            <div className="space-y-4">
              {modules.map(module => (
                <div key={module.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <module.icon className="h-5 w-5 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900">{module.name}</h4>
                    </div>
                    <div className="text-xs text-gray-500">
                      Default: {selectedUser.defaultPermissions[module.key]?.join(', ') || 'None'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {permissionOptions.map(permission => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={overridePermissions[module.key]?.includes(permission) || false}
                          onChange={() => handlePermissionToggle(module.key, permission)}
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

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverrides}
                className="btn btn-primary"
                disabled={updatePermissionsMutation.isLoading}
              >
                {updatePermissionsMutation.isLoading ? 'Saving...' : 'Save Overrides'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserPermissions;
