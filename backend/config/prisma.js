const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

const normalizeDatabaseUrl = (databaseUrl) => {
  if (!databaseUrl) {
    return 'mysql://root:@127.0.0.1:3306/smart_inventory';
  }

  return databaseUrl.replace('://localhost', '://127.0.0.1');
};

const adapter = new PrismaMariaDb(normalizeDatabaseUrl(process.env.DATABASE_URL));

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});
let databaseAvailable = false;

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    databaseAvailable = true;
    console.log('Prisma Database Connected Successfully');
    return true;
  } catch (error) {
    databaseAvailable = false;
    console.error('Prisma Database connection failed:', error.message);
    return false;
  }
};

// Initialize database with seed data
const initializeDatabase = async () => {
  try {
    // Check if database has users
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('Database is empty, creating seed data...');
      
      // Create default admin user
      const adminUser = await prisma.user.create({
        data: {
          userId: 'USR_jaanu_admin',
          username: 'jaanu@1',
          email: 'jaanu@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 123456
          firstName: 'Jaanu',
          lastName: 'User',
          role: 'admin',
          department: 'IT',
          phone: '+1234567890',
          isActive: true,
          permissions: [
            'inventory_read',
            'inventory_write',
            'assets_read',
            'assets_write',
            'transactions_read',
            'transactions_write',
            'users_read',
            'users_write',
            'analytics_view',
            'settings_manage',
          ],
        },
      });
      
      console.log('Default admin user created:', adminUser.username);
      
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
      
      // Create suppliers
      const suppliers = await Promise.all([
        prisma.supplier.create({
          data: {
            supplierId: 'SUP_TECH_001',
            name: 'Tech Supplies Inc.',
            email: 'contact@techsupplies.com',
            phone: '+1234567890',
            address: {
              street: '123 Tech Street',
              city: 'San Francisco',
              state: 'CA',
              zip: '94102',
              country: 'USA',
            },
            products: 'Laptops, Monitors, Keyboards, Mice, Networking',
            paymentTerms: 'NET 30',
            rating: 4.5,
            createdById: adminUser.id,
          },
        }),
        prisma.supplier.create({
          data: {
            supplierId: 'SUP_OFFICE_002',
            name: 'Office Furniture Co.',
            email: 'info@officefurniture.com',
            phone: '+1234567891',
            address: {
              street: '456 Office Ave',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA',
            },
            products: 'Desks, Chairs, Storage, Cabinets',
            paymentTerms: 'NET 15',
            rating: 4.8,
            createdById: adminUser.id,
          },
        }),
      ]);
      
      console.log(`${suppliers.length} suppliers created`);
      
      // Create customers
      const customers = await Promise.all([
        prisma.customer.create({
          data: {
            customerId: 'CUST_ABC_001',
            name: 'ABC Corporation',
            email: 'purchasing@abc.com',
            phone: '+1234567893',
            address: {
              street: '100 Business Park',
              city: 'Chicago',
              state: 'IL',
              zip: '60601',
              country: 'USA',
            },
            companyName: 'ABC Corporation',
            gstNumber: 'GST123456789',
            creditLimit: 50000,
            currentBalance: 15000,
            paymentStatus: 'pending',
            rating: 4.7,
            tags: ['corporate', 'bulk', 'regular'],
            notes: 'Major corporate client with bulk purchasing needs',
            createdById: adminUser.id,
          },
        }),
        prisma.customer.create({
          data: {
            customerId: 'CUST_XYZ_002',
            name: 'XYZ Retail Store',
            email: 'orders@xyzretail.com',
            phone: '+1234567894',
            address: {
              street: '200 Shopping Mall',
              city: 'Houston',
              state: 'TX',
              zip: '77001',
              country: 'USA',
            },
            companyName: 'XYZ Retail Store',
            gstNumber: 'GST987654321',
            creditLimit: 25000,
            currentBalance: 8000,
            paymentStatus: 'paid',
            rating: 4.3,
            tags: ['retail', 'regular', 'electronics'],
            notes: 'Electronics retail store with regular orders',
            createdById: adminUser.id,
          },
        }),
      ]);
      
      console.log(`${customers.length} customers created`);
      
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
            supplierId: suppliers[0].id,
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
            supplierId: suppliers[0].id,
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
            supplierId: suppliers[0].id,
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
      
      // Create contacts
      const contacts = await Promise.all([
        prisma.contact.create({
          data: {
            contactId: 'CONT_001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            company: 'ABC Corporation',
            jobTitle: 'Purchasing Manager',
            contactType: 'customer',
            categoryId: categories[0].id,
            tags: ['corporate', 'purchasing'],
            isActive: true,
            createdById: adminUser.id,
          },
        }),
        prisma.contact.create({
          data: {
            contactId: 'CONT_002',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1234567891',
            company: 'XYZ Retail Store',
            jobTitle: 'Store Manager',
            contactType: 'customer',
            categoryId: categories[1].id,
            tags: ['retail', 'management'],
            isActive: true,
            createdById: adminUser.id,
          },
        }),
      ]);
      
      console.log(`${contacts.length} contacts created`);
      
      // Create payment accounts
      const paymentAccounts = await Promise.all([
        prisma.paymentAccount.create({
          data: {
            accountId: 'ACC_BANK_001',
            accountName: 'Main Business Account',
            accountType: 'bank',
            bankName: 'First National Bank',
            accountNumber: '1234567890',
            ifscCode: 'FNB001',
            balance: 15000.00,
            currency: 'USD',
            isActive: true,
            isDefault: true,
            createdById: adminUser.id,
          },
        }),
        prisma.paymentAccount.create({
          data: {
            accountId: 'ACC_CASH_001',
            accountName: 'Petty Cash',
            accountType: 'cash',
            balance: 2500.00,
            currency: 'USD',
            isActive: true,
            isDefault: false,
            createdById: adminUser.id,
          },
        }),
      ]);
      
      console.log(`${paymentAccounts.length} payment accounts created`);
      
      console.log('Database seed data created successfully!');
    } else {
      console.log(`Database already has ${userCount} users, skipping seed data`);
    }
    
    return true;
  } catch (error) {
    databaseAvailable = false;
    console.error('Database initialization failed:', error.message);
    return false;
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    await prisma.$disconnect();
    databaseAvailable = false;
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

const isDatabaseAvailable = () => databaseAvailable;

// Main database connection function
const connectDB = async () => {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.warn('Starting without database connectivity. API will run in degraded demo mode.');
      return false;
    }
    
    // Initialize database if needed
    const initialized = await initializeDatabase();
    if (!initialized) {
      console.warn('Database initialization was not completed. API will run in degraded mode.');
      return false;
    }
    
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    databaseAvailable = false;
    console.error('Database connection error:', error.message);
    console.warn('Continuing startup without database connectivity.');
    return false;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await closeConnection();
    console.log('Database connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
});

module.exports = {
  prisma,
  connectDB,
  testConnection,
  initializeDatabase,
  closeConnection,
  isDatabaseAvailable,
};
