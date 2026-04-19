const express = require('express');
const User = require('../models/User');
const { authMiddleware, authorize, checkPermission } = require('../config/auth');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

router.get('/', authMiddleware, checkPermission('users_read'), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      department,
      status,
      sortBy = 'firstName',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (status !== undefined) filter.isActive = status === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, checkPermission('users_read'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, authorize('admin'), validateUser, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, role, department, phone, permissions } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    const defaultPermissions = role === 'admin' 
      ? ['inventory_read', 'inventory_write', 'assets_read', 'assets_write', 
         'transactions_read', 'transactions_write', 'users_read', 'users_write',
         'analytics_view', 'settings_manage']
      : role === 'manager'
      ? ['inventory_read', 'inventory_write', 'assets_read', 'assets_write',
         'transactions_read', 'transactions_write', 'users_read', 'analytics_view']
      : ['inventory_read', 'assets_read', 'transactions_read'];

    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee',
      department,
      phone,
      permissions: permissions || defaultPermissions
    });

    await user.save();

    const io = req.app.get('io');
    io.emit('user-created', {
      type: 'created',
      data: user
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, authorize('admin'), validateUser, async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, role, department, phone, permissions, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) {
      user.role = role;
      if (!permissions) {
        const defaultPermissions = role === 'admin' 
          ? ['inventory_read', 'inventory_write', 'assets_read', 'assets_write', 
             'transactions_read', 'transactions_write', 'users_read', 'users_write',
             'analytics_view', 'settings_manage']
          : role === 'manager'
          ? ['inventory_read', 'inventory_write', 'assets_read', 'assets_write',
             'transactions_read', 'transactions_write', 'users_read', 'analytics_view']
          : ['inventory_read', 'assets_read', 'transactions_read'];
        user.permissions = defaultPermissions;
      }
    }
    if (department) user.department = department;
    if (phone) user.phone = phone;
    if (permissions) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const io = req.app.get('io');
    io.emit('user-updated', {
      type: 'updated',
      data: user
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const io = req.app.get('io');
    io.emit('user-deleted', {
      type: 'deleted',
      data: { _id: req.params.id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/permissions', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.permissions = permissions;
    await user.save();

    const io = req.app.get('io');
    io.emit('user-permissions-updated', {
      userId: user._id,
      permissions
    });

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    const io = req.app.get('io');
    io.emit('user-status-updated', {
      userId: user._id,
      isActive
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
