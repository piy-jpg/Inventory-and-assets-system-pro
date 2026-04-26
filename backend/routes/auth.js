const express = require('express');
const { generateToken, authMiddleware } = require('../config/auth');
const { validateLogin, validateUser } = require('../middleware/validation');
const {
  buildUserId,
  comparePassword,
  hashPassword,
  getDefaultPermissions,
  normalizePermissions,
  prisma,
  sanitizeUser,
} = require('../utils/userService');
const { isDatabaseAvailable } = require('../config/prisma');
const { createFailedLoginAuditLog, createLoginAuditLog } = require('../utils/auditLogService');

const router = express.Router();
const DEMO_CREDENTIALS = {
  username: 'jaanu@1',
  email: 'jaanu@example.com',
  password: '123456',
};

const buildDemoUser = () => ({
  id: 0,
  user_id: 'USR_jaanu_demo',
  username: DEMO_CREDENTIALS.username,
  email: DEMO_CREDENTIALS.email,
  firstName: 'Jaanu',
  lastName: 'User',
  role: 'admin',
  department: 'IT',
  phone: '+1234567890',
  profilePhoto: null,
  isActive: true,
  lastLogin: new Date().toISOString(),
  permissions: getDefaultPermissions('admin'),
  createdAt: null,
  updatedAt: null,
});

const isDemoLogin = (identifier, password) => {
  const normalizedIdentifier = (identifier || '').trim().toLowerCase();
  return (
    password === DEMO_CREDENTIALS.password &&
    [DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.email].includes(normalizedIdentifier)
  );
};

router.post('/register', validateUser, async (req, res, next) => {
  try {
    if (!isDatabaseAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Registration is unavailable until the database connection is restored.',
      });
    }

    const { username, email, password, firstName, lastName, role, department, phone } = req.body;
    const normalizedRole = ['admin', 'manager', 'staff', 'viewer'].includes((role || '').toLowerCase())
      ? role.toLowerCase()
      : 'staff';

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    const user = await prisma.user.create({
      data: {
        userId: buildUserId(),
        username,
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        role: normalizedRole,
        department,
        phone,
        permissions: normalizePermissions(null, normalizedRole),
      },
    });

    const publicUser = sanitizeUser(user);
    const token = generateToken({
      user_id: publicUser.user_id,
      email: publicUser.email,
      role: publicUser.role,
      permissions: publicUser.permissions,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: publicUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || '').trim().toLowerCase();

    if (!isDatabaseAvailable()) {
      if (!isDemoLogin(loginIdentifier, password)) {
        await createFailedLoginAuditLog({
          req,
          identifier: loginIdentifier,
        });
        return res.status(401).json({
          success: false,
          message: 'Invalid email/username or password',
        });
      }

      const demoUser = buildDemoUser();
      const token = generateToken({
        user_id: demoUser.user_id,
        email: demoUser.email,
        role: demoUser.role,
        permissions: demoUser.permissions,
      });

      return res.json({
        success: true,
        message: 'Login successful (demo mode)',
        data: {
          user: demoUser,
          token,
          mode: 'demo',
        },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [{ email: loginIdentifier }, { username: loginIdentifier }],
      },
    });

    if (!user) {
      await createFailedLoginAuditLog({
        req,
        identifier: loginIdentifier,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await createFailedLoginAuditLog({
        req,
        user,
        identifier: loginIdentifier,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await createLoginAuditLog({
      user: updatedUser,
      req,
    });

    const publicUser = sanitizeUser(updatedUser);
    const token = generateToken({
      user_id: publicUser.user_id,
      email: publicUser.email,
      role: publicUser.role,
      permissions: publicUser.permissions,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: publicUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    if (!isDatabaseAvailable()) {
      const demoUser = buildDemoUser();
      const isDemoToken =
        req.user?.email === demoUser.email ||
        req.user?.user_id === demoUser.user_id;

      if (!isDemoToken) {
        return res.status(503).json({
          success: false,
          message: 'User profile is unavailable until the database connection is restored.',
        });
      }

      return res.json({
        success: true,
        data: { user: demoUser },
      });
    }

    const user = await prisma.user.findUnique({
      where: { userId: req.user.user_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', authMiddleware, async (req, res, next) => {
  try {
    if (!isDatabaseAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Password changes are unavailable until the database connection is restored.',
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await prisma.user.findUnique({
      where: { userId: req.user.user_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(newPassword),
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
