const User = require('../models/User');

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'password123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  department: 'IT',
  phone: '+1234567890',
  permissions: [
    'inventory_read',
    'inventory_write',
    'assets_read',
    'assets_write',
    'transactions_read',
    'transactions_write',
    'users_read',
    'users_write',
    'analytics_view',
    'settings_manage'
  ]
};

const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

  if (!existingAdmin) {
    await User.create(DEFAULT_ADMIN);
    console.log(`Default admin created: ${DEFAULT_ADMIN.email}`);
    return;
  }

  let shouldSave = false;

  if (existingAdmin.role !== DEFAULT_ADMIN.role) {
    existingAdmin.role = DEFAULT_ADMIN.role;
    shouldSave = true;
  }

  const missingPermissions = DEFAULT_ADMIN.permissions.filter(
    (permission) => !existingAdmin.permissions?.includes(permission)
  );

  if (missingPermissions.length > 0) {
    existingAdmin.permissions = DEFAULT_ADMIN.permissions;
    shouldSave = true;
  }

  if (shouldSave) {
    await existingAdmin.save();
    console.log(`Default admin permissions refreshed: ${DEFAULT_ADMIN.email}`);
  }
};

module.exports = ensureDefaultAdmin;
