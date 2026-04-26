const { prisma, sanitizeUser } = require('./userService');

const getCurrentUser = async (authUser) => {
  if (!authUser) {
    return null;
  }

  if (authUser.user_id) {
    const user = await prisma.user.findUnique({
      where: { userId: authUser.user_id },
    });
    return sanitizeUser(user);
  }

  if (authUser.email) {
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });
    return sanitizeUser(user);
  }

  return null;
};

const getCurrentUserId = async (authUser) => {
  if (!authUser) {
    return null;
  }

  if (authUser.user_id) {
    const user = await prisma.user.findUnique({
      where: { userId: authUser.user_id },
      select: { id: true },
    });
    return user?.id || null;
  }

  if (authUser.email) {
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { id: true },
    });
    return user?.id || null;
  }

  return null;
};

module.exports = {
  getCurrentUser,
  getCurrentUserId,
};
