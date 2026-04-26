#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('Starting Smart Inventory System with Prisma...');
console.log('');

process.env.DATABASE_URL = (process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/smart_inventory')
  .replace('://localhost', '://127.0.0.1');

const { prisma } = require('./config/prisma');

// Initialize database
const initializeDatabase = async () => {
  try {
    // Test connection
    await prisma.$connect();
    console.log('Prisma Database Connected Successfully');
    
    // Check if database has users
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('Database is empty, creating seed data...');
      
      // Create default admin user
      const adminUser = await prisma.user.create({
        data: {
          username: 'jaanu',
          email: 'jaanu@1',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 123456
          role: 'admin',
          isActive: true,
        },
      });
      
      console.log('Default admin user created: jaanu / 123456');
      
      // Create categories
      const categories = await Promise.all([
        prisma.category.create({
          data: {
            name: 'Electronics',
            description: 'Electronic devices and components',
            color: '#3B82F6',
            icon: 'cpu',
            createdById: adminUser.id,
          },
        }),
        prisma.category.create({
          data: {
            name: 'Computer Hardware',
            description: 'Computer parts and peripherals',
            color: '#10B981',
            icon: 'monitor',
            createdById: adminUser.id,
          },
        }),
        prisma.category.create({
          data: {
            name: 'Furniture',
            description: 'Office and home furniture',
            color: '#F59E0B',
            icon: 'home',
            createdById: adminUser.id,
          },
        }),
      ]);
      
      console.log(`${categories.length} categories created`);
      
      // Create inventory items
      const inventoryItems = await Promise.all([
        prisma.inventory.create({
          data: {
            itemId: 'INV_LAPTOP_001',
            name: 'Laptop Pro 15"',
            description: 'High-performance laptop with 15" display, 16GB RAM, 512GB SSD',
            categoryId: categories[0].id,
            brand: 'TechBrand',
            sku: 'LP-001',
            priceCost: 899.99,
            priceSelling: 1299.99,
            quantity: 25,
            minStock: 5,
            maxStock: 50,
            reorderPoint: 5,
            reorderQuantity: 45,
            unit: 'pieces',
            location: {
              warehouse: 'Main Warehouse',
              aisle: 'A3',
              shelf: 'S12',
              bin: 'B05',
            },
            tags: ['electronics', 'laptop', 'computer'],
            specifications: {
              screen: '15.6"',
              processor: 'Intel i7',
              ram: '16GB',
              storage: '512GB SSD',
            },
            warrantyPeriod: 24,
            warrantyType: 'manufacturer',
            status: 'active',
            createdById: adminUser.id,
          },
        }),
        prisma.inventory.create({
          data: {
            itemId: 'INV_MOUSE_002',
            name: 'Wireless Mouse',
            description: 'Ergonomic wireless mouse with precision tracking',
            categoryId: categories[1].id,
            brand: 'MouseCo',
            sku: 'WM-002',
            priceCost: 15.99,
            priceSelling: 29.99,
            quantity: 150,
            minStock: 20,
            maxStock: 200,
            reorderPoint: 20,
            reorderQuantity: 180,
            unit: 'pieces',
            location: {
              warehouse: 'Main Warehouse',
              aisle: 'B2',
              shelf: 'S08',
              bin: 'B15',
            },
            tags: ['computer', 'mouse', 'wireless'],
            warrantyPeriod: 12,
            warrantyType: 'manufacturer',
            status: 'active',
            createdById: adminUser.id,
          },
        }),
        prisma.inventory.create({
          data: {
            itemId: 'INV_KEYBOARD_011',
            name: 'Mechanical Keyboard RGB',
            description: 'RGB mechanical keyboard with blue switches',
            categoryId: categories[1].id,
            brand: 'KeyMaster',
            sku: 'KB-011',
            priceCost: 79.99,
            priceSelling: 129.99,
            quantity: 60,
            minStock: 15,
            maxStock: 100,
            reorderPoint: 15,
            reorderQuantity: 80,
            unit: 'pieces',
            location: {
              warehouse: 'Main Warehouse',
              aisle: 'B4',
              shelf: 'S16',
              bin: 'B20',
            },
            tags: ['keyboard', 'mechanical', 'rgb'],
            warrantyPeriod: 24,
            warrantyType: 'manufacturer',
            status: 'active',
            createdById: adminUser.id,
          },
        }),
      ]);
      
      console.log(`${inventoryItems.length} inventory items created`);
      
      console.log('Database seed data created successfully!');
    } else {
      console.log(`Database already has ${userCount} users, ready to use`);
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    
    // If MySQL is not available, create mock data
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Access denied')) {
      console.log('MySQL not available - Using mock data for demo');
      return false;
    }
    
    throw error;
  }
};

// Create mock data for frontend
const createMockData = () => {
  const mockData = {
    products: [
      {
        _id: 'INV_001',
        item_id: 'INV_LAPTOP_001',
        name: 'Laptop Pro 15"',
        category: 'Electronics',
        brand: 'TechBrand',
        sku: 'LP-001',
        price: { cost: 899.99, selling: 1299.99 },
        quantity: 25,
        minStock: 5,
        maxStock: 50,
        status: 'active'
      },
      {
        _id: 'INV_002',
        item_id: 'INV_MOUSE_002',
        name: 'Wireless Mouse',
        category: 'Computer Hardware',
        brand: 'MouseCo',
        sku: 'WM-002',
        price: { cost: 15.99, selling: 29.99 },
        quantity: 150,
        minStock: 20,
        maxStock: 200,
        status: 'active'
      },
      {
        _id: 'INV_003',
        item_id: 'INV_KEYBOARD_011',
        name: 'Mechanical Keyboard RGB',
        category: 'Computer Hardware',
        brand: 'KeyMaster',
        sku: 'KB-011',
        price: { cost: 79.99, selling: 129.99 },
        quantity: 60,
        minStock: 15,
        maxStock: 100,
        status: 'active'
      }
    ],
    customers: [
      {
        _id: 'CUST_001',
        customer_id: 'CUST_ABC_001',
        name: 'ABC Corporation',
        email: 'purchasing@abc.com',
        phone: '+1234567893',
        company_name: 'ABC Corporation',
        gst_number: 'GST123456789',
        credit_limit: 50000,
        current_balance: 15000,
        payment_status: 'pending',
        rating: 4.7
      },
      {
        _id: 'CUST_002',
        customer_id: 'CUST_XYZ_002',
        name: 'XYZ Retail Store',
        email: 'orders@xyzretail.com',
        phone: '+1234567894',
        company_name: 'XYZ Retail Store',
        gst_number: 'GST987654321',
        credit_limit: 25000,
        current_balance: 8000,
        payment_status: 'paid',
        rating: 4.3
      }
    ],
    contacts: [
      {
        _id: 'CONT_001',
        contact_id: 'CONT_001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'ABC Corporation',
        job_title: 'Purchasing Manager',
        contact_type: 'customer',
        is_active: true
      },
      {
        _id: 'CONT_002',
        contact_id: 'CONT_002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        company: 'XYZ Retail Store',
        job_title: 'Store Manager',
        contact_type: 'customer',
        is_active: true
      }
    ]
  };

  // Write mock data to frontend
  const mockPath = path.join(__dirname, '../frontend/src/data/mockData.js');
  const mockContent = `// Auto-generated mock data for Smart Inventory System
// Generated on: ${new Date().toISOString()}

const mockData = ${JSON.stringify(mockData, null, 2)};

export default mockData;
`;

  fs.writeFileSync(mockPath, mockContent);
  console.log('Mock data created for frontend');
};

// Update API service to use mock data
const updateApiService = () => {
  const apiPath = path.join(__dirname, '../frontend/src/services/api.js');
  
  const apiContent = `// Smart Inventory System API Configuration
// Auto-generated for offline development

// Mock data import
import mockData from '../data/mockData.js';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const isDevelopment = process.env.NODE_ENV === 'development';

// Mock API service
const mockApi = {
  inventory: {
    getAll: async (params = {}) => {
      return {
        data: {
          success: true,
          data: {
            inventory: mockData.products,
            total: mockData.products.length,
            page: 1,
            totalPages: 1
          }
        }
      };
    },
    getById: async (id) => {
      const product = mockData.products.find(p => p._id === id);
      return {
        data: {
          success: true,
          data: product
        }
      };
    },
    create: async (data) => {
      const newProduct = {
        _id: 'INV_' + Date.now(),
        ...data,
        status: 'active'
      };
      mockData.products.push(newProduct);
      return {
        data: {
          success: true,
          data: newProduct
        }
      };
    },
    update: async (id, data) => {
      const index = mockData.products.findIndex(p => p._id === id);
      if (index !== -1) {
        mockData.products[index] = { ...mockData.products[index], ...data };
      }
      return {
        data: {
          success: true,
          data: mockData.products[index]
        }
      };
    }
  },

  customers: {
    getAll: async (params = {}) => {
      return {
        data: {
          success: true,
          data: {
            customers: mockData.customers,
            total: mockData.customers.length,
            page: 1,
            totalPages: 1
          }
        }
      };
    },
    getById: async (id) => {
      const customer = mockData.customers.find(c => c._id === id);
      return {
        data: {
          success: true,
          data: customer
        }
      };
    }
  },

  contacts: {
    getAll: async (params = {}) => {
      return {
        data: {
          success: true,
          data: {
            contacts: mockData.contacts,
            total: mockData.contacts.length,
            page: 1,
            totalPages: 1
          }
        }
      };
    },
    getById: async (id) => {
      const contact = mockData.contacts.find(c => c._id === id);
      return {
        data: {
          success: true,
          data: contact
        }
      };
    }
  }
};

// Export API service
const inventoryAPI = mockApi.inventory;
const customersAPI = mockApi.customers;
const contactsAPI = mockApi.contacts;

export {
  inventoryAPI,
  customersAPI,
  contactsAPI
};
`;

  fs.writeFileSync(apiPath, apiContent);
  console.log('API service updated to use mock data');
};

// Main startup function
const main = async () => {
  console.log('Smart Inventory System with Prisma ORM');
  console.log('');
  
  try {
    // Try to initialize database with Prisma
    const databaseInitialized = await initializeDatabase();
    
    if (databaseInitialized) {
      console.log('');
      console.log('Prisma Database System Ready!');
      console.log('');
      console.log('Features Available:');
      console.log('  Products Management');
      console.log('  Customer Management');
      console.log('  Contact Management');
      console.log('  Sales & Purchases');
      console.log('  Stock Management');
      console.log('  Reports & Analytics');
      console.log('  Real-time Updates');
      console.log('');
      console.log('Login: jaanu / 123456');
      console.log('');
      
      // Start backend server
      console.log('Starting backend server...');
      const backendProcess = spawn('npm', ['start'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, DATABASE_URL: 'mysql://root:@127.0.0.1:3306/smart_inventory' }
      });
      
      backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
      });
      
    } else {
      console.log('');
      console.log('Prisma Demo Mode (Mock Data)');
      console.log('');
      
      // Create mock data
      createMockData();
      updateApiService();
      
      console.log('');
      console.log('Demo Features Available:');
      console.log('  Products Management (3+ items)');
      console.log('  Customer Management');
      console.log('  Contact Management');
      console.log('  Sales & Purchases');
      console.log('  Stock Management');
      console.log('  Reports & Analytics');
      console.log('');
      console.log('Login: jaanu / 123456');
      console.log('');
    }
    
    // Start frontend
    console.log('Starting frontend server...');
    const frontendProcess = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '../frontend'),
      stdio: 'inherit',
      shell: true
    });
    
    frontendProcess.on('close', (code) => {
      console.log(`Frontend process exited with code ${code}`);
    });
    
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nShutting down Smart Inventory System...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down Smart Inventory System...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the system
main().catch(error => {
  console.error('Failed to start system:', error);
  process.exit(1);
});
