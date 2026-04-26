const {
  buildUserId,
  getDefaultPermissions,
  hashPassword,
  prisma,
} = require('../utils/userService');

const DEFAULT_ADMIN = {
  username: 'jaanu@1',
  email: 'jaanu@example.com',
  password: '123456',
  firstName: 'Jaanu',
  lastName: 'User',
  role: 'admin',
  department: 'IT',
  phone: '+1234567890',
};

const ensureDefaultAdmin = async () => {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: DEFAULT_ADMIN.email }, { username: DEFAULT_ADMIN.username }],
    },
  });

  const permissions = getDefaultPermissions(DEFAULT_ADMIN.role);

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        userId: buildUserId(),
        username: DEFAULT_ADMIN.username,
        email: DEFAULT_ADMIN.email,
        password: await hashPassword(DEFAULT_ADMIN.password),
        firstName: DEFAULT_ADMIN.firstName,
        lastName: DEFAULT_ADMIN.lastName,
        role: DEFAULT_ADMIN.role,
        department: DEFAULT_ADMIN.department,
        phone: DEFAULT_ADMIN.phone,
        isActive: true,
        permissions,
      },
    });
    console.log(`Default admin created: ${DEFAULT_ADMIN.email}`);
    return;
  }

  await prisma.user.update({
    where: { id: existingAdmin.id },
    data: {
      userId: existingAdmin.userId || buildUserId(),
      role: DEFAULT_ADMIN.role,
      isActive: true,
      permissions,
      firstName: existingAdmin.firstName || DEFAULT_ADMIN.firstName,
      lastName: existingAdmin.lastName || DEFAULT_ADMIN.lastName,
      department: existingAdmin.department || DEFAULT_ADMIN.department,
      phone: existingAdmin.phone || DEFAULT_ADMIN.phone,
    },
  });
};

module.exports = ensureDefaultAdmin;
