const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { prisma, sanitizeUser } = require('../utils/userService');
const { isDatabaseAvailable } = require('./prisma');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const isDemoMode = !isDatabaseAvailable();

      if (!token) {
        if (isDemoMode) {
          socket.user = {
            user_id: 'demo-socket-user',
            role: 'admin',
            permissions: ['inventory_read', 'inventory_write', 'reports_view'],
          };
          return next();
        }

        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      if (isDemoMode) {
        socket.user = {
          user_id: decoded.user_id || 'demo-socket-user',
          role: decoded.role || 'admin',
          permissions: decoded.permissions || ['inventory_read', 'inventory_write', 'reports_view'],
        };
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { userId: decoded.user_id },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = sanitizeUser(user);
      next();
    } catch (err) {
      if (!isDatabaseAvailable()) {
        socket.user = {
          user_id: 'demo-socket-user',
          role: 'admin',
          permissions: ['inventory_read', 'inventory_write', 'reports_view'],
        };
        return next();
      }

      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.user_id} connected to real-time inventory updates`);

    // Join user to their role-based room for targeted updates
    socket.join(`role_${socket.user.role}`);
    socket.join(`user_${socket.user.user_id}`);

    // Handle inventory updates
    socket.on('inventory:update', (data) => {
      // Broadcast to all users in the same role
      socket.to(`role_${socket.user.role}`).emit('inventory:updated', data);
      socket.to(`user_${socket.user.user_id}`).emit('inventory:updated', data);
    });

    // Handle stock adjustments
    socket.on('inventory:stock-adjust', (data) => {
      // Check for low stock and send alerts
      if (data.quantity <= data.minStockLevel) {
        io.emit('inventory:low-stock', data);
      }
      
      // Broadcast stock adjustment
      socket.to(`role_${socket.user.role}`).emit('inventory:stock-adjusted', data);
      socket.to(`user_${socket.user.user_id}`).emit('inventory:stock-adjusted', data);
    });

    // Handle new inventory items
    socket.on('inventory:created', (data) => {
      socket.to(`role_${socket.user.role}`).emit('inventory:created', data);
      socket.to(`user_${socket.user.user_id}`).emit('inventory:created', data);
    });

    // Handle deleted inventory items
    socket.on('inventory:deleted', (data) => {
      socket.to(`role_${socket.user.role}`).emit('inventory:deleted', data);
      socket.to(`user_${socket.user.user_id}`).emit('inventory:deleted', data);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.user_id} disconnected from real-time inventory updates`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    return null;
  }
  return io;
};

// Helper functions to emit events
const emitInventoryUpdate = (data) => {
  const socketIO = getIO();
  if (!socketIO) return;
  socketIO.emit('inventory:updated', data);
};

const emitStockAdjustment = (data) => {
  const socketIO = getIO();
  if (!socketIO) return;
  
  // Check for low stock
  if (data.quantity <= data.minStockLevel) {
    socketIO.emit('inventory:low-stock', data);
  }
  
  socketIO.emit('inventory:stock-adjusted', data);
};

const emitInventoryCreated = (data) => {
  const socketIO = getIO();
  if (!socketIO) return;
  socketIO.emit('inventory:created', data);
};

const emitInventoryDeleted = (data) => {
  const socketIO = getIO();
  if (!socketIO) return;
  socketIO.emit('inventory:deleted', data);
};

const emitLowStockAlert = (data) => {
  const socketIO = getIO();
  if (!socketIO) return;
  socketIO.emit('inventory:low-stock', data);
};

module.exports = {
  initializeSocket,
  getIO,
  emitInventoryUpdate,
  emitStockAdjustment,
  emitInventoryCreated,
  emitInventoryDeleted,
  emitLowStockAlert
};
