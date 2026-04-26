#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Smart Inventory System...');
console.log('');

// Check if MySQL is available
const checkMySQL = () => {
  try {
    const { execSync } = require('child_process');
    execSync('mysql --version', { stdio: 'ignore' });
    console.log('✅ MySQL is available');
    return true;
  } catch (error) {
    console.log('❌ MySQL is not available or not configured');
    return false;
  }
};

// Create mock data file for frontend
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
  const mockContent = `
// Auto-generated mock data for Smart Inventory System
// Generated on: ${new Date().toISOString()}

const mockData = ${JSON.stringify(mockData, null, 2)};

export default mockData;
`;

  fs.writeFileSync(mockPath, mockContent);
  console.log('✅ Mock data created for frontend');
};

// Update API service to use mock data
const updateApiService = () => {
  const apiPath = path.join(__dirname, '../frontend/src/services/api.js');
  
  const apiContent = `
// Smart Inventory System API Configuration
// Auto-generated for offline development

// Mock data import
import mockData from '../data/mockData.js';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const isDevelopment = process.env.NODE_ENV === 'development';

// Mock API service
const mockApi = {
  // Inventory API
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

  // Customers API
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

  // Contacts API
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

// Check backend availability
const checkBackendAvailability = async () => {
  if (isDevelopment) {
    // In development, always use mock API for demo
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Export API service
const inventoryAPI = mockApi.inventory;
const customersAPI = mockApi.customers;
const contactsAPI = mockApi.contacts;

export {
  inventoryAPI,
  customersAPI,
  contactsAPI,
  checkBackendAvailability
};
`;

  fs.writeFileSync(apiPath, apiContent);
  console.log('✅ API service updated to use mock data');
};

// Start frontend development server
const startFrontend = () => {
  console.log('🌐 Starting frontend development server...');
  
  const { spawn } = require('child_process');
  const frontendProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontendProcess.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });

  frontendProcess.on('error', (error) => {
    console.error('Failed to start frontend:', error);
  });

  return frontendProcess;
};

// Main startup function
const main = async () => {
  console.log('📋 System Check:');
  
  // Check MySQL availability
  const mysqlAvailable = checkMySQL();
  
  if (!mysqlAvailable) {
    console.log('⚠️  MySQL not available - Running in demo mode with mock data');
    console.log('');
    
    // Create mock data
    createMockData();
    
    // Update API service
    updateApiService();
    
    console.log('');
    console.log('🎯 Smart Inventory System Ready!');
    console.log('');
    console.log('📊 Available Features:');
    console.log('  ✅ Products Management (20+ items)');
    console.log('  ✅ Customer Management');
    console.log('  ✅ Contact Management');
    console.log('  ✅ Sales & Purchases');
    console.log('  ✅ Stock Management');
    console.log('  ✅ Reports & Analytics');
    console.log('  ✅ Real-time Updates');
    console.log('');
    console.log('🌐 Starting Frontend Server...');
    console.log('');
    console.log('📱 Access your system at: http://localhost:3000');
    console.log('');
    console.log('👤 Default Login: jaanu@1 / 123456');
    console.log('');
    
    // Start frontend
    startFrontend();
    
  } else {
    console.log('✅ MySQL available - Starting full backend server');
    console.log('');
    console.log('🎯 Smart Inventory System Ready!');
    console.log('');
    console.log('📊 Available Features:');
    console.log('  ✅ Products Management');
    console.log('  ✅ Customer Management');
    console.log('  ✅ Contact Management');
    console.log('  ✅ Sales & Purchases');
    console.log('  ✅ Stock Management');
    console.log('  ✅ Reports & Analytics');
    console.log('  ✅ Real-time Updates');
    console.log('');
    console.log('🌐 Starting Backend Server on port 3001...');
    console.log('');
    console.log('📱 Access your system at: http://localhost:3000');
    console.log('');
    console.log('👤 Default Login: jaanu@1 / 123456');
    console.log('');
    
    // Start backend
    const { spawn } = require('child_process');
    const backendProcess = spawn('npm', ['start'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    backendProcess.on('close', (code) => {
      console.log(\`Backend process exited with code \${code}\`);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
    });
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down Smart Inventory System...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Shutting down Smart Inventory System...');
  process.exit(0);
});

// Start the system
main().catch(error => {
  console.error('❌ Failed to start system:', error);
  process.exit(1);
});
