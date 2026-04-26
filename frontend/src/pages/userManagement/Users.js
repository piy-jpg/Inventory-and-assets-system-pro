import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
  ClockIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../../components/ConfirmDialog';

const DEFAULT_ROLES = [
  { _id: 'ROLE_001', role_name: 'Administrator' },
  { _id: 'ROLE_002', role_name: 'Manager' },
  { _id: 'ROLE_003', role_name: 'Sales Executive' },
  { _id: 'ROLE_004', role_name: 'Warehouse Staff' },
  { _id: 'ROLE_005', role_name: 'Customer Support' }
];

const Users = ({ initialShowForm = false }) => {
  const location = useLocation();
  const { user, permissions } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(initialShowForm);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showBulkPasswordModal, setShowBulkPasswordModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [bulkPasswordData, setBulkPasswordData] = useState({
    password: '',
    confirmPassword: '',
    selectedRole: '',
    applyToAll: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    status: 'active'
  });

  // Real-time users data
  const { data: usersData, isLoading, refetch } = useQuery(
    'users',
    () => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
      
      return [
        {
          _id: 'USR_001',
          name: 'John Smith',
          email: 'john.smith@example.com',
          password: 'temp123',
          roleId: 'ROLE_001',
          roleName: 'Administrator',
          status: 'active',
          created_at: '2024-01-15T10:30:00Z',
          last_login: '2024-04-23T09:15:00Z'
        },
        {
          _id: 'USR_002',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          password: 'temp123',
          roleId: 'ROLE_002',
          roleName: 'Manager',
          status: 'active',
          created_at: '2024-02-10T14:20:00Z',
          last_login: '2024-04-22T16:45:00Z'
        },
        {
          _id: 'USR_003',
          name: 'Mike Wilson',
          email: 'mike.wilson@example.com',
          password: 'temp123',
          roleId: 'ROLE_003',
          roleName: 'Sales Executive',
          status: 'active',
          created_at: '2024-03-05T11:30:00Z',
          last_login: '2024-04-21T08:30:00Z'
        },
        {
          _id: 'USR_006',
          name: 'Maanu User',
          email: 'maanu@123',
          password: 'temp123',
          roleId: 'ROLE_003',
          roleName: 'Sales Executive',
          status: 'active',
          created_at: '2024-04-24T15:00:00Z',
          last_login: null
        },
        {
          _id: 'USR_004',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          password: 'hashed_password_012',
          roleId: 'ROLE_004',
          roleName: 'Warehouse Staff',
          status: 'inactive',
          created_at: '2024-03-20T09:45:00Z',
          last_login: '2024-04-15T13:20:00Z'
        },
        {
          _id: 'USR_005',
          name: 'Robert Brown',
          email: 'robert.brown@example.com',
          password: 'hashed_password_345',
          roleId: 'ROLE_005',
          roleName: 'Customer Support',
          status: 'active',
          created_at: '2024-04-01T10:15:00Z',
          last_login: '2024-04-23T14:10:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Users data refreshed:', data);
      }
    }
  );

  // Get roles data for dropdown
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

  // Mutation for creating user
  const createUserMutation = useMutation(
    async (userData) => {
      const users = usersData || [];
      const newUser = {
        ...userData,
        _id: `USR_${Date.now()}`,
        roleName: rolesData.find(r => r._id === userData.roleId)?.role_name || 'Unknown Role',
        created_at: new Date().toISOString(),
        last_login: null,
        password: userData.password || 'temp123', // Default password for login
        isActive: userData.status === 'active'
      };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      queryClient.setQueryData('users', updatedUsers);
      return newUser;
    },
    {
      onSuccess: () => {
        toast.success('User created successfully');
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create user');
      }
    }
  );

  // Mutation for updating user
  const updateUserMutation = useMutation(
    async (updatedUser) => {
      setIsUpdating(true);
      try {
        const users = usersData || [];
        const updatedUsers = users.map(user => 
          user._id === updatedUser._id ? {
            ...updatedUser,
            roleName: rolesData.find(r => r._id === updatedUser.roleId)?.role_name || user.roleName,
            updated_at: new Date().toISOString(),
            updated_by: user?.name || 'System'
          } : user
        );
        
        // Update localStorage
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        queryClient.setQueryData('users', updatedUsers);
        
        return updatedUsers;
      } finally {
        setIsUpdating(false);
      }
    },
    {
      onSuccess: (_, updatedUser) => {
        toast.success(`User ${updatedUser.name} updated successfully`);
        setShowEditModal(false);
        setShowDetailsModal(false);
        setShowActionMenu(null);
        setSelectedUser(updatedUser);
        refetch();
      },
      onError: (error) => {
        console.error('Update user error:', error);
        toast.error('Failed to update user. Please try again.');
        setIsUpdating(false);
      }
    }
  );

  // Mutation for deleting user
  const deleteUserMutation = useMutation(
    async (userId) => {
      console.log('Starting real-time delete for user ID:', userId);
      
      const users = usersData || [];
      const deletedUser = users.find(user => user._id === userId);
      const updatedUsers = users.filter(user => user._id !== userId);
      
      console.log('Users before delete:', users.length);
      console.log('Users after delete:', updatedUsers.length);
      console.log('Deleted user:', deletedUser?.name);
      
      // Real-time update: Immediately update the cache
      queryClient.setQueryData('users', updatedUsers);
      
      // Update localStorage for persistence
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Simulate real-time broadcast to all connected clients
      setTimeout(() => {
        console.log('Broadcasting real-time update to all clients');
        queryClient.invalidateQueries('users');
      }, 50);
      
      // Return deleted user info with timestamp
      return { 
        updatedUsers, 
        deletedUser, 
        timestamp: new Date().toISOString(),
        deletedBy: user?.name || 'System'
      };
    },
    {
      onSuccess: (result) => {
        const { deletedUser, timestamp, deletedBy } = result;
        console.log('Real-time delete successful for:', deletedUser?.name);
        
        // Real-time success notification
        toast.success(`User ${deletedUser?.name || 'Unknown'} deleted successfully`, {
          duration: 3000,
          icon: '🗑️',
          description: `Deleted by ${deletedBy} at ${new Date(timestamp).toLocaleTimeString()}`
        });
        
        // Close modals and refresh
        setShowDetailsModal(false);
        setShowActionMenu(null);
        refetch();
        
        // Show real-time update notification
        setTimeout(() => {
          toast.success('User list updated in real-time', {
            duration: 2000,
            icon: '🔄',
            description: 'All connected clients updated instantly'
          });
        }, 300);
      },
      onError: (error) => {
        console.error('Real-time delete user error:', error);
        toast.error('Failed to delete user. Please try again.', {
          duration: 3000,
          icon: '❌',
          description: 'Real-time update failed'
        });
      }
    }
  );

  // Mutation for bulk password update
  const bulkPasswordMutation = useMutation(
    async (bulkData) => {
      const users = usersData || [];
      let updatedUsers = [...users];
      
      // Filter users to update based on criteria
      let usersToUpdate = [];
      
      if (bulkData.applyToAll) {
        usersToUpdate = updatedUsers;
      } else if (bulkData.selectedRole) {
        usersToUpdate = updatedUsers.filter(user => user.roleId === bulkData.selectedRole);
      }
      
      // Update passwords for selected users
      updatedUsers = updatedUsers.map(user => {
        const shouldUpdate = bulkData.applyToAll || 
                           (bulkData.selectedRole && user.roleId === bulkData.selectedRole);
        
        if (shouldUpdate) {
          return {
            ...user,
            password: bulkData.password, // In real app, this should be hashed
            updated_at: new Date().toISOString(),
            updated_by: user?.name || 'System'
          };
        }
        return user;
      });
      
      // Save to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      queryClient.setQueryData('users', updatedUsers);
      
      return { updatedUsers, updatedCount: usersToUpdate.length };
    },
    {
      onSuccess: (result) => {
        toast.success(`Passwords updated for ${result.updatedCount} users successfully`);
        setShowBulkPasswordModal(false);
        setBulkPasswordData({
          password: '',
          confirmPassword: '',
          selectedRole: '',
          applyToAll: false
        });
        refetch();
      },
      onError: (error) => {
        console.error('Bulk password update error:', error);
        toast.error('Failed to update passwords. Please try again.');
      }
    }
  );

  const users = usersData || [];
  const roles = rolesData?.length ? rolesData : DEFAULT_ROLES;

  useEffect(() => {
    if (initialShowForm || location.pathname.endsWith('/create') || location.state?.openForm) {
      setShowCreateModal(true);
    }
  }, [initialShowForm, location.pathname, location.state]);

  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.roleId === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      roleId: '',
      status: 'active'
    });
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setShowActionMenu(null);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedUser(null);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowActionMenu(null);
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowActionMenu(null);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roleId: user.roleId,
      status: user.status
    });
    setShowEditModal(true);
  };

  // Role-based permission checking
  const canEditUser = () => {
    return user?.role === 'admin' || (permissions && permissions.includes('users_write'));
  };

  const canDeleteUser = () => {
    return user?.role === 'admin' || (permissions && permissions.includes('users_delete'));
  };

  const canViewUser = () => {
    return user?.role === 'admin' || (permissions && permissions.includes('users_read'));
  };

  const handleViewUser = (targetUser) => {
    if (!canViewUser()) {
      toast.error('You do not have permission to view users');
      return;
    }
    openDetailsModal(targetUser);
  };

  const handleEditUser = (user) => {
    if (!canEditUser()) {
      toast.error('You do not have permission to edit users');
      return;
    }
    openEditModal(user);
  };

  const openDeleteDialog = (userToDelete) => {
    setSelectedUser(userToDelete);
    setShowActionMenu(null);
    setDeleteDialog({
      open: true,
      user: userToDelete
    });
  };

  const closeDeleteDialog = () => {
    if (deleteUserMutation.isLoading) return;
    setDeleteDialog({ open: false, user: null });
  };

  const handleDeleteUser = (userToDelete) => {
    if (!userToDelete?._id) {
      toast.error('Unable to delete user: missing user details');
      return;
    }

    console.log('=== REAL-TIME DELETE USER CLICKED ===');
    console.log('User to delete:', userToDelete.name, 'ID:', userToDelete._id);
    console.log('Current logged-in user:', user?.name, 'ID:', user?._id, 'Role:', user?.role);
    console.log('Current permissions:', permissions);
    console.log('Can delete user?', canDeleteUser());
    
    if (!canDeleteUser()) {
      console.log('Delete blocked: No permission');
      toast.error('You do not have permission to delete users');
      return;
    }
    
    const isSelfDeletion = userToDelete._id === user?._id;

    console.log('Delete confirmed, executing mutation for:', userToDelete._id);

    toast.loading('Deleting user in real-time...', { 
      id: 'delete-user',
      description: isSelfDeletion 
        ? 'Deleting your account and logging out...'
        : `Removing ${userToDelete.name} from all connected sessions`
    });

    deleteUserMutation.mutate(userToDelete._id, {
      onSuccess: () => {
        toast.dismiss('delete-user');
        console.log('Real-time delete completed successfully');
        
        if (isSelfDeletion) {
          setTimeout(() => {
            toast.success('Your account has been deleted. Logging out...', {
              duration: 3000,
              icon: '👋'
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 1000);
        }
      },
      onError: () => {
        toast.dismiss('delete-user');
        console.log('Real-time delete failed');
      }
    });
  };

  const confirmDeleteUser = () => {
    if (!deleteDialog.user) return;
    const userToDelete = deleteDialog.user;
    closeDeleteDialog();
    handleDeleteUser(userToDelete);
  };

  const handleToggleUserStatus = (user) => {
    if (!canEditUser()) {
      toast.error('You do not have permission to change user status');
      return;
    }
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUserMutation.mutate({
      ...user,
      status: newStatus
    });
  };

  const handleUpdateUser = () => {
    // Enhanced validation
    if (!formData.name.trim()) {
      toast.error('User name is required');
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error('User name must be at least 2 characters');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.roleId) {
      toast.error('Please select a role');
      return;
    }

    // Check if email already exists (excluding current user)
    const existingUser = usersData?.find(u => 
      u.email === formData.email.trim() && u._id !== selectedUser._id
    );
    
    if (existingUser) {
      toast.error('Email already exists for another user');
      return;
    }

    // Prepare update data
    const updateData = {
      ...selectedUser,
      name: formData.name.trim(),
      email: formData.email.trim(),
      roleId: formData.roleId,
      status: formData.status,
      // Only include password if it's provided
      ...(formData.password.trim() && { password: formData.password.trim() })
    };

    // Show loading state
    setIsUpdating(true);
    
    // Update user with real-time capabilities
    updateUserMutation.mutate(updateData);
  };

  const handleBulkPasswordUpdate = () => {
    // Validation
    if (!bulkPasswordData.password.trim()) {
      toast.error('Password is required');
      return;
    }

    if (bulkPasswordData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (bulkPasswordData.password !== bulkPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!bulkPasswordData.applyToAll && !bulkPasswordData.selectedRole) {
      toast.error('Please select a role or apply to all users');
      return;
    }

    // Confirm bulk operation
    const affectedUsers = bulkPasswordData.applyToAll 
      ? users.length 
      : users.filter(u => u.roleId === bulkPasswordData.selectedRole).length;

    if (!window.confirm(`Are you sure you want to update passwords for ${affectedUsers} users? This action cannot be undone.`)) {
      return;
    }

    // Execute bulk password update
    bulkPasswordMutation.mutate(bulkPasswordData);
  };

  const handleCreateUser = () => {
    if (!canEditUser()) {
      toast.error('You do not have permission to add users');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('User name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.password.trim()) {
      toast.error('Password is required');
      return;
    }

    if (!formData.roleId) {
      toast.error('Role is required');
      return;
    }

    createUserMutation.mutate({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim()
    });
  };

  
  const handleRefresh = () => {
    refetch();
    toast.success('Users data refreshed');
  };

  const handleMenuAction = (action, targetUser) => {
    switch (action) {
      case 'edit':
        handleEditUser(targetUser);
        return;
      case 'view':
        handleViewUser(targetUser);
        return;
      case 'status':
        handleToggleUserStatus(targetUser);
        return;
      case 'delete':
        openDeleteDialog(targetUser);
        return;
      default:
        setShowActionMenu(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const inactiveUsers = users.filter(user => user.status === 'inactive').length;
  const suspendedUsers = users.filter(user => user.status === 'suspended').length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            {canEditUser() && (
              <button
                onClick={() => {
                  setBulkPasswordData({
                    password: 'temp123',
                    confirmPassword: 'temp123',
                    selectedRole: '',
                    applyToAll: true
                  });
                  setShowBulkPasswordModal(true);
                }}
                className="btn btn-warning flex items-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Set All Passwords</span>
              </button>
            )}
            {canEditUser() && (
              <button
                onClick={() => setShowBulkPasswordModal(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Set Passwords</span>
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add User</span>
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
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
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
              <ClockIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-red-600">{suspendedUsers}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 text-red-600" />
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              className="input"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
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
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">ID: {user._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {user.password || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.roleName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => handleViewUser(user)}
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
                          onClick={() => handleEditUser(user)}
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
                        
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => openDeleteDialog(user)}
                            disabled={deleteUserMutation.isLoading && deleteUserMutation.variables === user._id}
                            className={`
                              ${deleteUserMutation.isLoading && deleteUserMutation.variables === user._id 
                                ? 'bg-gray-400 border-gray-500 cursor-not-allowed animate-pulse' 
                                : 'bg-red-600 border-red-700 hover:bg-red-700 cursor-pointer transition-all duration-300'}
                              text-white font-bold text-xs px-2 py-1 rounded border-2
                            `}
                            style={{
                              minWidth: '65px',
                              boxShadow: deleteUserMutation.isLoading && deleteUserMutation.variables === user._id 
                                ? '0 0 0 0 rgba(220, 38, 38, 0.7)' 
                                : '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {deleteUserMutation.isLoading && deleteUserMutation.variables === user._id ? 'DELETING...' : 'DELETE'}
                          </button>
                          {deleteUserMutation.isLoading && deleteUserMutation.variables === user._id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowActionMenu(showActionMenu === user._id ? null : user._id)}
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
                            
                            {showActionMenu === user._id && (
                              <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleMenuAction('edit', user)}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <PencilIcon className="h-4 w-4 mr-2 text-blue-600" />
                                    Edit User
                                  </button>
                                  
                                  <button
                                    onClick={() => handleMenuAction('view', user)}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <UserCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                                    View Profile
                                  </button>
                                  
                                  <button
                                    onClick={() => handleMenuAction('status', user)}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {user.status === 'active' ? (
                                      <>
                                        <LockClosedIcon className="h-4 w-4 mr-2 text-yellow-600" />
                                        Deactivate User
                                      </>
                                    ) : (
                                      <>
                                        <LockOpenIcon className="h-4 w-4 mr-2 text-green-600" />
                                        Activate User
                                      </>
                                    )}
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      // Reset user password
                                      const newPassword = 'temp123';
                                      updateUserMutation.mutate({
                                        ...user,
                                        password: newPassword,
                                        updated_at: new Date().toISOString(),
                                        updated_by: user?.name || 'System'
                                      });
                                      setShowActionMenu(null);
                                      toast.success(`Password reset to "${newPassword}" for ${user.name}`, {
                                        duration: 4000
                                      });
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <ArrowPathIcon className="h-4 w-4 mr-2 text-purple-600" />
                                    Reset Password
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      // Set password for all users with same role
                                      const newPassword = 'temp123';
                                      const usersWithSameRole = users.filter(u => u.roleId === user.roleId);
                                      
                                      if (window.confirm(`Set password "${newPassword}" for all ${usersWithSameRole.length} users with role "${user.roleName}"?`)) {
                                        bulkPasswordMutation.mutate({
                                          password: newPassword,
                                          confirmPassword: newPassword,
                                          selectedRole: user.roleId,
                                          applyToAll: false
                                        });
                                      }
                                      setShowActionMenu(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <ArrowPathIcon className="h-4 w-4 mr-2 text-orange-600" />
                                    Set Password for Role
                                  </button>
                                  
                                  <div className="border-t border-gray-100"></div>
                                  
                                  <button
                                    onClick={() => {
                                      // Set password for all users
                                      const newPassword = 'temp123';
                                      
                                      if (window.confirm(`Set password "${newPassword}" for all ${users.length} users? This will affect everyone!`)) {
                                        bulkPasswordMutation.mutate({
                                          password: newPassword,
                                          confirmPassword: newPassword,
                                          selectedRole: '',
                                          applyToAll: true
                                        });
                                      }
                                      setShowActionMenu(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium"
                                  >
                                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                                    Set Password for ALL Users
                                  </button>
                                  
                                  {canDeleteUser() && (
                                    <>
                                      <div className="border-t border-gray-100"></div>
                                      <button
                                        onClick={() => handleMenuAction('delete', user)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Delete User
                                      </button>
                                    </>
                                  )}
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

      {/* Create User Modal */}
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
              <h3 className="text-lg font-semibold text-gray-900">Add User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateUser();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter user name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="input"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
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
                  disabled={createUserMutation.isLoading}
                >
                  {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
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
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter user name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="input"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating || updateUserMutation.isLoading}
                >
                  {isUpdating || updateUserMutation.isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating User...
                    </span>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
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
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-sm text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-sm text-gray-900">{selectedUser.roleName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                  {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm text-gray-900">{new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Login</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedUser);
                  }}
                  className="btn btn-primary btn-sm"
                  disabled={!canEditUser()}
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteDialog(selectedUser)}
                  className="btn btn-outline btn-sm"
                  disabled={!canDeleteUser()}
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

      {/* Bulk Password Modal */}
      {showBulkPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowBulkPasswordModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Set Passwords for Users</h3>
              <button
                onClick={() => setShowBulkPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleBulkPasswordUpdate();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    value={bulkPasswordData.password}
                    onChange={(e) => setBulkPasswordData(prev => ({ ...prev, password: e.target.value }))}
                    className="input"
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={bulkPasswordData.confirmPassword}
                    onChange={(e) => setBulkPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apply To</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="applyTo"
                        checked={bulkPasswordData.applyToAll}
                        onChange={() => setBulkPasswordData(prev => ({ ...prev, applyToAll: true, selectedRole: '' }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">All Users ({users.length} users)</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="applyTo"
                        checked={!bulkPasswordData.applyToAll}
                        onChange={() => setBulkPasswordData(prev => ({ ...prev, applyToAll: false }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Specific Role</span>
                    </label>
                    
                    {!bulkPasswordData.applyToAll && (
                      <select
                        value={bulkPasswordData.selectedRole}
                        onChange={(e) => setBulkPasswordData(prev => ({ ...prev, selectedRole: e.target.value }))}
                        className="input ml-6"
                      >
                        <option value="">Select a role</option>
                        {roles.map(role => (
                          <option key={role._id} value={role._id}>
                            {role.role_name} ({users.filter(u => u.roleId === role._id).length} users)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBulkPasswordModal(false)}
                  className="btn btn-secondary"
                  disabled={bulkPasswordMutation.isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bulkPasswordMutation.isLoading}
                >
                  {bulkPasswordMutation.isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Passwords...
                    </span>
                  ) : (
                    'Update Passwords'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={
          deleteDialog.user
            ? (
              deleteDialog.user._id === user?._id
                ? `Are you sure you want to delete your own account (${deleteDialog.user.email})? This action cannot be undone and will log you out immediately.`
                : `Are you sure you want to delete ${deleteDialog.user.name}? This action cannot be undone.`
            )
            : 'Are you sure you want to delete this user?'
        }
        itemName={deleteDialog.user ? `${deleteDialog.user.name} (${deleteDialog.user.email})` : ''}
        type="delete"
        loading={deleteUserMutation.isLoading}
      />
    </div>
  );
};

export default Users;
