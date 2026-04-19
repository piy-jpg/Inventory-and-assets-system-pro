const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../config/auth');
const { validateLogin, validateUser } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateUser, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, role, department, phone } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    const permissions = role === 'admin' 
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
      permissions
    });

    await user.save();

    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || '').trim().toLowerCase();

    const user = await User.findOne({
      isActive: true,
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id });
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

router.put('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({ user_id: req.user.user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
