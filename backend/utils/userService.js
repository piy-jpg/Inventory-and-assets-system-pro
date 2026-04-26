const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');

const ROLE_PERMISSIONS = {
  admin: [
    'users_read',
    'users_write',
    'users_delete',
    'inventory_read',
    'inventory_write',
    'inventory_delete',
    'assets_read',
    'assets_write',
    'assets_delete',
    'transactions_read',
    'transactions_write',
    'transactions_delete',
    'sales_read',
    'sales_write',
    'sales_delete',
    'purchases_read',
    'purchases_write',
    'purchases_delete',
    'reports_view',
    'reports_export',
    'analytics_view',
    'settings_manage',
    'system_admin',
    'backup_manage',
    'roles_manage',
  ],
  manager: [
    'inventory_read',
    'inventory_write',
    'inventory_delete',
    'assets_read',
    'assets_write',
    'transactions_read',
    'transactions_write',
    'users_read',
    'sales_read',
    'sales_write',
    'purchases_read',
    'purchases_write',
    'reports_view',
    'reports_export',
    'analytics_view',
  ],
  staff: [
    'inventory_read',
    'inventory_write',
    'assets_read',
    'transactions_read',
    'transactions_write',
    'sales_read',
    'sales_write',
    'reports_view',
  ],
  viewer: [
    'inventory_read',
    'assets_read',
    'transactions_read',
    'sales_read',
    'purchases_read',
    'reports_view',
  ],
  employee: [
    'inventory_read',
    'inventory_write',
    'assets_read',
    'transactions_read',
    'transactions_write',
    'sales_read',
    'sales_write',
    'reports_view',
  ],
};

const normalizeRoleName = (role = 'staff') => {
  const normalized = String(role || 'staff').toLowerCase();
  if (normalized === 'employee') return 'staff';
  return normalized;
};

const getDefaultPermissions = (role = 'staff') =>
  ROLE_PERMISSIONS[normalizeRoleName(role)] || ROLE_PERMISSIONS.staff;

const buildUserId = () => `USR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const hashPassword = async (password) => bcrypt.hash(password, 12);

const comparePassword = async (candidatePassword, hashedPassword) =>
  bcrypt.compare(candidatePassword, hashedPassword);

const normalizePermissions = (permissions, role) => {
  if (Array.isArray(permissions) && permissions.length > 0) {
    return permissions;
  }

  return getDefaultPermissions(role);
};

const sanitizeUser = (user) => {
  if (!user) return null;

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];

  return {
    _id: String(user.id),
    id: user.id,
    user_id: user.userId,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    department: user.department,
    phone: user.phone,
    profilePhoto: user.profilePhoto,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const buildUserSearchWhere = ({ search, role, department, status }) => {
  const where = {};

  if (role) where.role = role;
  if (department) where.department = department;
  if (status !== undefined && status !== '') where.isActive = status === 'true';
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { username: { contains: search } },
    ];
  }

  return where;
};

module.exports = {
  prisma,
  buildUserId,
  buildUserSearchWhere,
  comparePassword,
  getDefaultPermissions,
  hashPassword,
  normalizePermissions,
  sanitizeUser,
};
