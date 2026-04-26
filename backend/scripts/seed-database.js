const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.abcde.mongodb.net/smart-inventory?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Supplier.deleteMany({});
    await Customer.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data');

    // 1. Create Sample Users
    const users = [];
    const userRoles = [
      { username: 'jaanu@1', email: 'jaanu@example.com', firstName: 'Jaanu', lastName: 'User', role: 'admin' },
      { username: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' },
      { username: 'manager1', email: 'manager1@example.com', firstName: 'John', lastName: 'Smith', role: 'manager' },
      { username: 'staff1', email: 'staff1@example.com', firstName: 'Sarah', lastName: 'Johnson', role: 'staff' },
      { username: 'staff2', email: 'staff2@example.com', firstName: 'Mike', lastName: 'Wilson', role: 'staff' }
    ];

    for (const userData of userRoles) {
      const hashedPassword = await bcrypt.hash('123456', 12);
      const user = new User({
        user_id: `USR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        password: hashedPassword,
        department: userData.role === 'admin' ? 'IT' : 'Operations',
        phone: `+123456789${Math.floor(Math.random() * 1000)}`,
        isActive: true,
        permissions: userData.role === 'admin' ? [
          'inventory_read', 'inventory_write',
          'assets_read', 'assets_write',
          'transactions_read', 'transactions_write',
          'users_read', 'users_write',
          'reports_read', 'reports_write',
          'settings_read', 'settings_write'
        ] : userData.role === 'manager' ? [
          'inventory_read', 'inventory_write',
          'transactions_read', 'transactions_write',
          'reports_read', 'reports_write'
        ] : [
          'inventory_read', 'inventory_write',
          'transactions_read'
        ]
      });
      users.push(await user.save());
    }
    console.log('Created sample users');

    // 2. Create Sample Suppliers
    const suppliers = await Supplier.create([
      {
        supplier_id: `SUP_${Date.now()}_1`,
        name: 'Tech Supplies Inc.',
        email: 'contact@techsupplies.com',
        phone: '+1234567890',
        address: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'USA'
        },
        products: ['Laptops', 'Monitors', 'Keyboards'],
        paymentTerms: 'NET 30',
        isActive: true
      },
      {
        supplier_id: `SUP_${Date.now()}_2`,
        name: 'Office Furniture Co.',
        email: 'info@officefurniture.com',
        phone: '+1234567891',
        address: {
          street: '456 Office Ave',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        products: ['Desks', 'Chairs', 'Storage'],
        paymentTerms: 'NET 15',
        isActive: true
      },
      {
        supplier_id: `SUP_${Date.now()}_3`,
        name: 'Electronics World',
        email: 'sales@electronicsworld.com',
        phone: '+1234567892',
        address: {
          street: '789 Electronics Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          country: 'USA'
        },
        products: ['Smartphones', 'Tablets', 'Accessories'],
        paymentTerms: 'COD',
        isActive: true
      }
    ]);
    console.log('Created sample suppliers');

    // 3. Create Sample Customers
    const customers = await Customer.create([
      {
        customer_id: `CUST_${Date.now()}_1`,
        name: 'ABC Corporation',
        email: 'purchasing@abc.com',
        phone: '+1234567893',
        address: {
          street: '100 Business Park',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          country: 'USA'
        },
        creditLimit: 50000,
        isActive: true
      },
      {
        customer_id: `CUST_${Date.now()}_2`,
        name: 'XYZ Retail Store',
        email: 'orders@xyzretail.com',
        phone: '+1234567894',
        address: {
          street: '200 Shopping Mall',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
          country: 'USA'
        },
        creditLimit: 25000,
        isActive: true
      },
      {
        customer_id: `CUST_${Date.now()}_3`,
        name: 'Small Business LLC',
        email: 'contact@smallbusiness.com',
        phone: '+1234567895',
        address: {
          street: '300 Main Street',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001',
          country: 'USA'
        },
        creditLimit: 10000,
        isActive: true
      }
    ]);
    console.log('Created sample customers');

    // 4. Create Sample Inventory Items
    const categories = ['Electronics', 'Furniture', 'Office Supplies', 'Computer Hardware', 'Mobile Devices'];
    const inventoryItems = [];
    
    const sampleProducts = [
      { name: 'Laptop Pro 15"', category: 'Electronics', brand: 'TechBrand', sku: 'LP-001', price: 1299.99, cost: 899.99, quantity: 25, minStock: 5, maxStock: 50 },
      { name: 'Wireless Mouse', category: 'Computer Hardware', brand: 'MouseCo', sku: 'WM-002', price: 29.99, cost: 15.99, quantity: 150, minStock: 20, maxStock: 200 },
      { name: 'Office Chair', category: 'Furniture', brand: 'ComfortSeat', sku: 'OC-003', price: 199.99, cost: 120.99, quantity: 35, minStock: 10, maxStock: 60 },
      { name: 'Monitor 27"', category: 'Electronics', brand: 'ViewTech', sku: 'MO-004', price: 399.99, cost: 249.99, quantity: 40, minStock: 8, maxStock: 80 },
      { name: 'Desk Phone', category: 'Office Supplies', brand: 'CommTech', sku: 'DP-005', price: 79.99, cost: 45.99, quantity: 60, minStock: 15, maxStock: 100 },
      { name: 'Smartphone X', category: 'Mobile Devices', brand: 'MobileTech', sku: 'SP-006', price: 899.99, cost: 599.99, quantity: 80, minStock: 20, maxStock: 150 },
      { name: 'Keyboard Mechanical', category: 'Computer Hardware', brand: 'KeyMaster', sku: 'KB-007', price: 89.99, cost: 55.99, quantity: 100, minStock: 25, maxStock: 180 },
      { name: 'Standing Desk', category: 'Furniture', brand: 'ErgoDesk', sku: 'SD-008', price: 499.99, cost: 299.99, quantity: 15, minStock: 5, maxStock: 30 },
      { name: 'Printer Ink', category: 'Office Supplies', brand: 'PrintPro', sku: 'PI-009', price: 24.99, cost: 12.99, quantity: 200, minStock: 50, maxStock: 300 },
      { name: 'Tablet Pro', category: 'Mobile Devices', brand: 'TabTech', sku: 'TP-010', price: 599.99, cost: 399.99, quantity: 45, minStock: 10, maxStock: 80 },
      { name: 'Webcam HD', category: 'Electronics', brand: 'CamTech', sku: 'WC-011', price: 69.99, cost: 39.99, quantity: 75, minStock: 20, maxStock: 120 },
      { name: 'Filing Cabinet', category: 'Furniture', brand: 'StoreSafe', sku: 'FC-012', price: 149.99, cost: 89.99, quantity: 25, minStock: 8, maxStock: 50 },
      { name: 'USB Hub', category: 'Computer Hardware', brand: 'ConnectTech', sku: 'UH-013', price: 19.99, cost: 9.99, quantity: 180, minStock: 40, maxStock: 250 },
      { name: 'Notebook Set', category: 'Office Supplies', brand: 'PaperPro', sku: 'NS-014', price: 12.99, cost: 6.99, quantity: 300, minStock: 100, maxStock: 400 },
      { name: 'Headphones Wireless', category: 'Electronics', brand: 'SoundTech', sku: 'HP-015', price: 129.99, cost: 79.99, quantity: 55, minStock: 15, maxStock: 100 }
    ];

    for (const product of sampleProducts) {
      const inventory = new Inventory({
        item_id: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...product,
        supplier: suppliers[Math.floor(Math.random() * suppliers.length)]._id,
        location: {
          warehouse: 'Main Warehouse',
          aisle: `A${Math.floor(Math.random() * 10) + 1}`,
          shelf: `S${Math.floor(Math.random() * 20) + 1}`,
          bin: `B${Math.floor(Math.random() * 50) + 1}`
        },
        tags: [product.category.toLowerCase(), product.brand.toLowerCase()],
        reorderPoint: product.minStock,
        reorderQuantity: product.maxStock - product.minStock,
        isActive: true,
        createdBy: users[0]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      inventoryItems.push(await inventory.save());
    }
    console.log('Created sample inventory items');

    // 5. Create Sample Transactions
    const transactions = [];
    const transactionTypes = ['sale', 'purchase', 'return', 'adjustment'];
    
    for (let i = 0; i < 20; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const item = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      
      let transactionData = {
        transaction_id: `TRANS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        item: item._id,
        quantity: quantity,
        unitPrice: item.price,
        totalPrice: item.price * quantity,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        createdBy: users[Math.floor(Math.random() * users.length)]._id,
        notes: `${type} transaction for ${item.name}`
      };

      if (type === 'sale') {
        transactionData.customer = customers[Math.floor(Math.random() * customers.length)]._id;
        transactionData.paymentMethod = ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)];
        transactionData.status = 'completed';
      } else if (type === 'purchase') {
        transactionData.supplier = suppliers[Math.floor(Math.random() * suppliers.length)]._id;
        transactionData.paymentMethod = ['cash', 'transfer', 'credit'][Math.floor(Math.random() * 3)];
        transactionData.status = 'completed';
      } else if (type === 'return') {
        transactionData.reason = 'Defective product';
        transactionData.status = 'processed';
      } else {
        transactionData.reason = 'Stock adjustment';
        transactionData.status = 'completed';
      }

      transactions.push(await Transaction.create(transactionData));
    }
    console.log('Created sample transactions');

    // 6. Update inventory quantities based on transactions
    for (const transaction of transactions) {
      const item = await Inventory.findById(transaction.item);
      if (item) {
        if (transaction.type === 'sale' || transaction.type === 'return') {
          item.quantity -= transaction.quantity;
        } else if (transaction.type === 'purchase' || transaction.type === 'adjustment') {
          item.quantity += transaction.quantity;
        }
        await item.save();
      }
    }

    console.log('\n=== Database Seeding Complete ===');
    console.log(`Users: ${users.length}`);
    console.log(`Suppliers: ${suppliers.length}`);
    console.log(`Customers: ${customers.length}`);
    console.log(`Inventory Items: ${inventoryItems.length}`);
    console.log(`Transactions: ${transactions.length}`);
    console.log('\nLogin Credentials:');
    console.log('Username: jaanu@1, Password: 123456');
    console.log('Username: admin, Password: 123456');
    console.log('Username: manager1, Password: 123456');
    console.log('Username: staff1, Password: 123456');
    console.log('Username: staff2, Password: 123456');

    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
