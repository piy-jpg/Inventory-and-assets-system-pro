// Simple Server for Smart Inventory System
// This server runs without database dependency for demo purposes

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time updates
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock auth middleware (simplified for demo)
const authMiddleware = (req, res, next) => {
  // For demo purposes, we'll skip authentication
  // In production, this would verify JWT tokens
  next();
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    // For demo purposes, we'll allow all permissions
    // In production, this would check user permissions
    next();
  };
};

// Load mock data
const mockData = require('./data/mockData.js');

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected to real-time inventory updates:', socket.id);

  // Send initial connection status
  socket.emit('connected', { message: 'Connected to real-time inventory updates' });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected from real-time inventory updates:', socket.id);
  });

  // Handle inventory updates
  socket.on('inventory:update', (data) => {
    console.log('Inventory update received:', data);
    
    // Broadcast to all connected clients
    io.emit('inventory:updated', data);
  });

  // Handle stock adjustments
  socket.on('inventory:stock-adjust', (data) => {
    console.log('Stock adjustment received:', data);
    
    // Find and update the item in mock data
    const itemIndex = mockData.products.findIndex(p => p._id === data._id);
    if (itemIndex !== -1) {
      mockData.products[itemIndex] = { ...mockData.products[itemIndex], ...data };
      
      // Check for low stock
      if (data.quantity <= data.minStockLevel) {
        io.emit('inventory:low-stock', data);
      }
      
      // Broadcast stock adjustment
      io.emit('inventory:stock-adjusted', data);
    }
  });

  // Handle new inventory items
  socket.on('inventory:create', (data) => {
    console.log('New inventory item received:', data);
    
    // Add to mock data
    mockData.products.push(data);
    
    // Broadcast to all clients
    io.emit('inventory:created', data);
  });

  // Handle inventory deletions
  socket.on('inventory:delete', (data) => {
    console.log('Inventory deletion received:', data);
    
    // Remove from mock data
    const itemIndex = mockData.products.findIndex(p => p._id === data._id);
    if (itemIndex !== -1) {
      mockData.products.splice(itemIndex, 1);
      
      // Broadcast to all clients
      io.emit('inventory:deleted', data);
    }
  });
});

// Function to emit real-time updates
const emitInventoryUpdate = (data) => {
  io.emit('inventory:updated', data);
};

const emitStockAdjustment = (data) => {
  io.emit('inventory:stock-adjusted', data);
  
  // Check for low stock alerts
  if (data.quantity <= data.minStockLevel) {
    io.emit('inventory:low-stock', data);
  }
};

const emitLowStockAlert = (data) => {
  io.emit('inventory:low-stock', data);
};

const emitInventoryCreated = (data) => {
  io.emit('inventory:created', data);
};

const emitInventoryDeleted = (data) => {
  io.emit('inventory:deleted', data);
};

// Inventory routes
app.get('/api/inventory', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      minStock,
      maxStock
    } = req.query;

    let items = [...mockData.products];
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.brand.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    if (status) {
      items = items.filter(item => item.status === status);
    }
    
    if (minStock) {
      items = items.filter(item => item.quantity <= parseInt(minStock));
    }
    
    if (maxStock) {
      items = items.filter(item => item.quantity >= parseInt(maxStock));
    }
    
    // Sort
    items.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return sortOrder === 'asc' 
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = items.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        inventory: paginatedItems,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(items.length / limit),
          total: items.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/inventory/categories/list', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const categories = [...new Set(mockData.products.map(p => p.category))];
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// Metadata API endpoints for dropdown data
app.get('/api/metadata/categories', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const categories = [...new Set(mockData.products.map(p => p.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/metadata/brands', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const brands = [...new Set(mockData.products.map(p => p.brand))];
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/metadata/units', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const units = ['pieces', 'kg', 'liters', 'meters', 'boxes', 'packs', 'sets', 'pairs'];
    
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/metadata/suppliers', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const suppliers = [...new Set(mockData.products.map(p => p.supplier))];
    
    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/metadata/warranties', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const warranties = ['No warranty', '1 Year', '2 Years', '3 Years', '5 Years', 'Lifetime'];
    
    res.json({
      success: true,
      data: warranties
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/inventory/low-stock/alerts', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const lowStockItems = mockData.products.filter(item => item.quantity <= item.minStock);
    
    res.json({
      success: true,
      data: { lowStockItems }
    });
    
    // Emit real-time update
    emitLowStockAlert(lowStockItems);
  } catch (error) {
    next(error);
  }
});

app.get('/api/inventory/:id', authMiddleware, checkPermission('inventory_read'), async (req, res, next) => {
  try {
    const inventory = mockData.products.find(p => p._id === req.params.id || p.item_id === req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: { inventory }
    });
    
    // Emit real-time update
    emitInventoryUpdate(inventory);
  } catch (error) {
    next(error);
  }
});

// Create inventory item
app.post('/api/inventory', authMiddleware, checkPermission('inventory_write'), async (req, res, next) => {
  try {
    const newInventory = {
      _id: 'INV_' + Date.now(),
      item_id: req.body.item_id || 'INV_' + Date.now(),
      ...req.body,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, this would save to database
    mockData.products.push(newInventory);

    // Emit real-time update
    emitInventoryCreated(newInventory);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: { inventory: newInventory }
    });
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`Simple server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Inventory data is available without database dependency');
      console.log('Real-time WebSocket support enabled');
      console.log('Socket.IO server ready for inventory updates');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
