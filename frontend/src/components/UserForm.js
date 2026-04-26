import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation } from 'react-query';
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

  const isEditing = !!user;

  const createMutation = useMutation(usersAPI.create, {
    onSuccess: (data) => {
      toast.success('User created successfully! They can now log in with their credentials.');
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
        return ['users_read', 'users_write', 'users_delete', 'inventory_read', 'inventory_write', 'inventory_delete', 'assets_read', 'assets_write', 'assets_delete', 'transactions_read', 'transactions_write', 'transactions_delete', 'sales_read', 'sales_write', 'sales_delete', 'purchases_read', 'purchases_write', 'purchases_delete', 'reports_view', 'reports_export', 'analytics_view', 'settings_manage', 'system_admin', 'backup_manage', 'roles_manage'];
      case 'manager':
        return ['users_read', 'users_write', 'inventory_read', 'inventory_write', 'inventory_delete', 'assets_read', 'assets_write', 'transactions_read', 'transactions_write', 'sales_read', 'sales_write', 'purchases_read', 'purchases_write', 'reports_view', 'reports_export', 'analytics_view'];
      case 'staff':
        return ['inventory_read', 'inventory_write', 'assets_read', 'transactions_read', 'transactions_write', 'sales_read', 'sales_write', 'reports_view'];
      case 'viewer':
        return ['inventory_read', 'assets_read', 'transactions_read', 'sales_read', 'purchases_read', 'reports_view'];
      default:
        return ['inventory_read', 'assets_read', 'transactions_read', 'sales_read', 'reports_view'];
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username || formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.role) {
      errors.role = 'Please select a role';
    }
    
    if (formData.permissions.length === 0) {
      errors.permissions = 'Please select at least one permission';
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }
    
    const data = { 
      ...formData,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
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
    { id: 'users_read', label: 'View Users' },
    { id: 'users_write', label: 'Create/Edit Users' },
    { id: 'users_delete', label: 'Delete Users' },
    { id: 'inventory_read', label: 'View Inventory' },
    { id: 'inventory_write', label: 'Manage Inventory' },
    { id: 'inventory_delete', label: 'Delete Inventory' },
    { id: 'assets_read', label: 'View Assets' },
    { id: 'assets_write', label: 'Manage Assets' },
    { id: 'assets_delete', label: 'Delete Assets' },
    { id: 'transactions_read', label: 'View Transactions' },
    { id: 'transactions_write', label: 'Manage Transactions' },
    { id: 'transactions_delete', label: 'Delete Transactions' },
    { id: 'sales_read', label: 'View Sales' },
    { id: 'sales_write', label: 'Manage Sales' },
    { id: 'sales_delete', label: 'Delete Sales' },
    { id: 'purchases_read', label: 'View Purchases' },
    { id: 'purchases_write', label: 'Manage Purchases' },
    { id: 'purchases_delete', label: 'Delete Purchases' },
    { id: 'reports_view', label: 'View Reports' },
    { id: 'reports_export', label: 'Export Reports' },
    { id: 'analytics_view', label: 'View Analytics' },
    { id: 'settings_manage', label: 'Manage Settings' },
    { id: 'system_admin', label: 'System Admin' },
    { id: 'backup_manage', label: 'Manage Backups' },
    { id: 'roles_manage', label: 'Manage Roles' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-[9999] w-full max-w-4xl overflow-hidden rounded-2xl bg-white text-left shadow-2xl"
          >
            <div className="max-h-[90vh] overflow-y-auto bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4 flex items-center justify-between">
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
                      <option value="staff">Staff</option>
                      <option value="viewer">Viewer</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
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

                <div className="sticky bottom-0 flex justify-end space-x-3 border-t border-gray-100 bg-white pt-4">
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
