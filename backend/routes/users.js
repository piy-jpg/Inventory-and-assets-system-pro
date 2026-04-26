const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, authorize, checkPermission } = require('../config/auth');
const { validateUser, validateUserUpdate } = require('../middleware/validation');
const {
  buildUserId,
  buildUserSearchWhere,
  getDefaultPermissions,
  hashPassword,
  normalizePermissions,
  prisma,
  sanitizeUser,
} = require('../utils/userService');
const { getLoginHistory } = require('../utils/auditLogService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profile-photos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

const emitUserEvent = (req, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(event, data);
  }
};

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
      sortOrder = 'asc',
    } = req.query;

    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const orderableFields = new Set([
      'firstName',
      'lastName',
      'email',
      'username',
      'role',
      'department',
      'lastLogin',
      'createdAt',
    ]);
    const orderField = orderableFields.has(sortBy) ? sortBy : 'firstName';

    const where = buildUserSearchWhere({ search, role, department, status });
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [orderField]: sortOrder === 'desc' ? 'desc' : 'asc' },
        skip: (numericPage - 1) * numericLimit,
        take: numericLimit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(sanitizeUser),
        pagination: {
          current: numericPage,
          pages: Math.ceil(total / numericLimit),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/login-history', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const loginHistory = await getLoginHistory({
      limit: req.query.limit,
    });

    res.json({
      success: true,
      data: {
        logs: loginHistory,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, checkPermission('users_read'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
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

router.post('/', authMiddleware, authorize('admin'), validateUser, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, role, department, phone, permissions } = req.body;

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
        role: role || 'employee',
        department,
        phone,
        permissions: normalizePermissions(permissions, role || 'employee'),
      },
    });

    const publicUser = sanitizeUser(user);
    emitUserEvent(req, 'user-created', {
      type: 'created',
      data: publicUser,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: publicUser },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, authorize('admin'), validateUserUpdate, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, role, department, phone, permissions, isActive } = req.body;
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    if (username && username !== user.username) {
      const usernameExists = await prisma.user.findUnique({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username ?? user.username,
        email: email ?? user.email,
        password: password ? await hashPassword(password) : undefined,
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        role: role ?? user.role,
        department: department ?? user.department,
        phone: phone ?? user.phone,
        permissions:
          permissions ??
          (role ? getDefaultPermissions(role) : Array.isArray(user.permissions) ? user.permissions : []),
        isActive: typeof isActive === 'boolean' ? isActive : user.isActive,
      },
    });

    const publicUser = sanitizeUser(updatedUser);
    emitUserEvent(req, 'user-updated', {
      type: 'updated',
      data: publicUser,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: publicUser },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    emitUserEvent(req, 'user-deleted', {
      type: 'deleted',
      data: { _id: String(userId) },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/permissions', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const userId = Number(req.params.id);

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { permissions },
    });

    emitUserEvent(req, 'user-permissions-updated', {
      userId: String(userId),
      permissions,
    });

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      data: { user: sanitizeUser(updatedUser) },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const userId = Number(req.params.id);

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    emitUserEvent(req, 'user-status-updated', {
      userId: String(userId),
      isActive,
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: sanitizeUser(updatedUser) },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/profile-photo', authMiddleware, upload.single('profilePhoto'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const authUserId = req.user.user_id;

    if (authUserId !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only upload your own profile photo',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const user = await prisma.user.findUnique({
      where: { userId: id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.profilePhoto) {
      const oldPhotoPath = path.join(
        __dirname,
        '../uploads/profile-photos',
        path.basename(user.profilePhoto)
      );
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { profilePhoto: photoUrl },
    });

    emitUserEvent(req, 'user-profile-photo-updated', {
      userId: String(user.id),
      profilePhoto: photoUrl,
    });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: { profilePhoto: photoUrl },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
