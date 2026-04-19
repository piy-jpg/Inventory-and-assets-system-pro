import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    department: '',
    phone: '',
    permissions: [],
  });

  const queryClient = useQueryClient();
  const isEditing = !!user;

  const createMutation = useMutation(usersAPI.create, {
    onSuccess: () => {
      toast.success('User created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => usersAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('User updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      },
    }
  );

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'employee',
        department: user.department || '',
        phone: user.phone || '',
        permissions: user.permissions || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getDefaultPermissions = (role) => {
    switch (role) {
      case 'admin':
        return ['inventory_read', 'inventory_write', 'assets_read', 'assets_write', 
                'transactions_read', 'transactions_write', 'users_read', 'users_write',
                'analytics_view', 'settings_manage'];
      case 'manager':
        return ['inventory_read', 'inventory_write', 'assets_read', 'assets_write',
                'transactions_read', 'transactions_write', 'users_read', 'analytics_view'];
      default:
        return ['inventory_read', 'assets_read', 'transactions_read'];
    }
  };

  const handleRoleChange = (role) => {
    const defaultPermissions = getDefaultPermissions(role);
    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = { ...formData };
    if (isEditing && !data.password) {
      delete data.password;
    }

    if (isEditing) {
      updateMutation.mutate({ id: user._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const availablePermissions = [
    { id: 'inventory_read', label: 'Read Inventory' },
    { id: 'inventory_write', label: 'Write Inventory' },
    { id: 'assets_read', label: 'Read Assets' },
    { id: 'assets_write', label: 'Write Assets' },
    { id: 'transactions_read', label: 'Read Transactions' },
    { id: 'transactions_write', label: 'Write Transactions' },
    { id: 'users_read', label: 'Read Users' },
    { id: 'users_write', label: 'Write Users' },
    { id: 'analytics_view', label: 'View Analytics' },
    { id: 'settings_manage', label: 'Manage Settings' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Username *</label>
                    <input
                      type="text"
                      name="username"
                      required
                      className="input"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isEditing}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="input"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Password {isEditing ? '(leave blank to keep current)' : '*'}</label>
                    <input
                      type="password"
                      name="password"
                      required={!isEditing}
                      className="input"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Role *</label>
                    <select
                      name="role"
                      required
                      className="input"
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="input"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="input"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Department</label>
                    <input
                      type="text"
                      name="department"
                      className="input"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="btn btn-primary flex items-center"
                  >
                    {createMutation.isLoading || updateMutation.isLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      isEditing ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default UserForm;
