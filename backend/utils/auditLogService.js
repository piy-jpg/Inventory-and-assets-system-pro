const { prisma } = require('./userService');
const { getIO } = require('../config/socket');

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const getUserDisplayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
  user?.username ||
  user?.email ||
  'Unknown User';

const formatLoginAuditLog = (log, user) => {
  const details = log.newValues && typeof log.newValues === 'object' ? log.newValues : {};
  const loginAt = details.loginAt || log.createdAt;

  return {
    _id: `AUDIT_${log.id}`,
    id: log.id,
    user_id: user?.userId || String(log.userId),
    internal_user_id: log.userId,
    userName: getUserDisplayName(user),
    username: user?.username || details.username || '',
    email: user?.email || details.email || '',
    role: user?.role || details.role || '',
    action: log.action,
    description:
      details.description ||
      `${getUserDisplayName(user)} logged in`,
    timestamp: loginAt,
    ip_address: details.ipAddress || 'unknown',
    user_agent: details.userAgent || 'unknown',
    status: details.status || 'success',
    createdAt: log.createdAt,
  };
};

const buildAuthEventPayload = ({ action, status, description, req, user, identifier }) => ({
  eventType: action === 'failed_login' ? 'failed_login' : 'user_login',
  loginAt: new Date().toISOString(),
  ipAddress: getClientIp(req),
  userAgent: req.get('user-agent') || 'unknown',
  status,
  description,
  username: user?.username || identifier || '',
  email: user?.email || '',
  role: user?.role || '',
  userId: user?.userId || '',
});

const formatRealtimeAuthEvent = ({ action, details, user }) => ({
  _id: `RT_${action}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  user_id: user?.userId || details.userId || details.username || 'unknown',
  internal_user_id: user?.id || null,
  userName: getUserDisplayName(user) || details.username || 'Unknown User',
  username: user?.username || details.username || '',
  email: user?.email || details.email || '',
  role: user?.role || details.role || '',
  action,
  description: details.description || `${getUserDisplayName(user)} ${action}`,
  timestamp: details.loginAt || new Date().toISOString(),
  ip_address: details.ipAddress || 'unknown',
  user_agent: details.userAgent || 'unknown',
  status: details.status || 'success',
  createdAt: details.loginAt || new Date().toISOString(),
});

const createLoginAuditLog = async ({ user, req }) => {
  try {
    const createdAt = new Date();
    const loginDetails = buildAuthEventPayload({
      action: 'login',
      status: 'success',
      description: `${getUserDisplayName(user)} logged in`,
      req,
      user,
    });

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'login',
        table: 'users',
        recordId: user.id,
        newValues: loginDetails,
        createdAt,
      },
    });

    const formattedLog = formatLoginAuditLog(auditLog, user);

    try {
      const io = getIO();
      io.to('role_admin').emit('user:login', formattedLog);
    } catch (error) {
      // Socket delivery is optional; persistence is the primary source of truth.
    }

    return formattedLog;
  } catch (error) {
    console.error('Failed to create login audit log:', error.message);
    return null;
  }
};

const createFailedLoginAuditLog = async ({ req, user = null, identifier }) => {
  const failedDetails = buildAuthEventPayload({
    action: 'failed_login',
    status: 'error',
    description: `Failed login attempt for ${user?.username || identifier || 'unknown user'}`,
    req,
    user,
    identifier,
  });

  if (!user?.id) {
    try {
      const io = getIO();
      io.to('role_admin').emit(
        'user:login',
        formatRealtimeAuthEvent({
          action: 'failed_login',
          details: failedDetails,
          user,
        })
      );
    } catch (error) {
      // Best-effort live notification for unknown usernames.
    }

    return null;
  }

  try {
    const createdAt = new Date();
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'failed_login',
        table: 'users',
        recordId: user.id,
        newValues: failedDetails,
        createdAt,
      },
    });

    const formattedLog = formatLoginAuditLog(auditLog, user);

    try {
      const io = getIO();
      io.to('role_admin').emit('user:login', formattedLog);
    } catch (error) {
      // Socket delivery is optional.
    }

    return formattedLog;
  } catch (error) {
    console.error('Failed to create failed login audit log:', error.message);
    return null;
  }
};

const getLoginHistory = async ({ limit = 200 } = {}) => {
  try {
    const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 500) : 200;
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        table: 'users',
        action: { in: ['login', 'failed_login'] },
      },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });

    const userIds = [...new Set(auditLogs.map((log) => log.userId).filter(Boolean))];
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
        })
      : [];
    const usersById = new Map(users.map((user) => [user.id, user]));

    return auditLogs.map((log) => formatLoginAuditLog(log, usersById.get(log.userId)));
  } catch (error) {
    console.error('Failed to fetch login history:', error.message);
    return [];
  }
};

module.exports = {
  createFailedLoginAuditLog,
  createLoginAuditLog,
  formatLoginAuditLog,
  getLoginHistory,
};
