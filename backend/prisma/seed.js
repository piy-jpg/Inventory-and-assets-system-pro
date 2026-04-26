process.env.DATABASE_URL = (process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/smart_inventory')
  .replace('://localhost', '://127.0.0.1');

const { prisma } = require('../config/prisma');

async function main() {
  console.log('Starting database seeding with Prisma...');
  
  try {
    // Create default admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'jaanu@example.com' },
      update: {
        username: 'jaanu@1',
        userId: 'USR_jaanu_admin',
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
      create: {
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
    
    console.log('Default admin user created: jaanu / 123456');
    
    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Electronics' },
        update: {},
        create: {
          name: 'Electronics',
          description: 'Electronic devices and components',
          color: '#3B82F6',
          icon: 'cpu',
          createdById: adminUser.id,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Computer Hardware' },
        update: {},
        create: {
          name: 'Computer Hardware',
          description: 'Computer parts and peripherals',
          color: '#10B981',
          icon: 'monitor',
          createdById: adminUser.id,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Furniture' },
        update: {},
        create: {
          name: 'Furniture',
          description: 'Office and home furniture',
          color: '#F59E0B',
          icon: 'home',
          createdById: adminUser.id,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Mobile Devices' },
        update: {},
        create: {
          name: 'Mobile Devices',
          description: 'Smartphones and tablets',
          color: '#EF4444',
          icon: 'smartphone',
          createdById: adminUser.id,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Office Supplies' },
        update: {},
        create: {
          name: 'Office Supplies',
          description: 'Stationery and office items',
          color: '#8B5CF6',
          icon: 'briefcase',
          createdById: adminUser.id,
        },
      }),
    ]);
    
    console.log(`${categories.length} categories created`);
    
    // Create suppliers
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { supplierId: 'SUP_TECH_001' },
        update: {},
        create: {
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
      prisma.supplier.upsert({
        where: { supplierId: 'SUP_OFFICE_002' },
        update: {},
        create: {
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
      prisma.supplier.upsert({
        where: { supplierId: 'SUP_ELEC_003' },
        update: {},
        create: {
          supplierId: 'SUP_ELEC_003',
          name: 'Electronics World',
          email: 'sales@electronicsworld.com',
          phone: '+1234567892',
          address: {
            street: '789 Electronics Blvd',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            country: 'USA',
          },
          products: 'Smartphones, Tablets, Accessories, Gadgets',
          paymentTerms: 'COD',
          rating: 4.2,
          createdById: adminUser.id,
        },
      }),
    ]);
    
    console.log(`${suppliers.length} suppliers created`);
    
    // Create customers
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { customerId: 'CUST_ABC_001' },
        update: {},
        create: {
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
      prisma.customer.upsert({
        where: { customerId: 'CUST_XYZ_002' },
        update: {},
        create: {
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
      prisma.customer.upsert({
        where: { customerId: 'CUST_SMALL_003' },
        update: {},
        create: {
          customerId: 'CUST_SMALL_003',
          name: 'Small Business LLC',
          email: 'contact@smallbusiness.com',
          phone: '+1234567895',
          address: {
            street: '300 Main Street',
            city: 'Phoenix',
            state: 'AZ',
            zip: '85001',
            country: 'USA',
          },
          companyName: 'Small Business LLC',
          gstNumber: 'GST456123789',
          creditLimit: 10000,
          currentBalance: 2500,
          paymentStatus: 'paid',
          rating: 4.9,
          tags: ['small_business', 'regular'],
          notes: 'Local small business with consistent orders',
          createdById: adminUser.id,
        },
      }),
    ]);
    
    console.log(`${customers.length} customers created`);
    
    // Create inventory items
    const inventoryItems = await Promise.all([
      prisma.inventory.upsert({
        where: { itemId: 'INV_LAPTOP_001' },
        update: {},
        create: {
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
      prisma.inventory.upsert({
        where: { itemId: 'INV_MOUSE_002' },
        update: {},
        create: {
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
      prisma.inventory.upsert({
        where: { itemId: 'INV_KEYBOARD_011' },
        update: {},
        create: {
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
      prisma.inventory.upsert({
        where: { itemId: 'INV_MONITOR_012' },
        update: {},
        create: {
          itemId: 'INV_MONITOR_012',
          name: '4K Monitor 27"',
          description: '27-inch 4K UHD monitor with HDR',
          categoryId: categories[0].id,
          brand: 'ViewTech',
          sku: 'MN-012',
          priceCost: 299.99,
          priceSelling: 499.99,
          quantity: 20,
          minStock: 5,
          maxStock: 40,
          reorderPoint: 5,
          reorderQuantity: 35,
          unit: 'pieces',
          supplierId: suppliers[0].id,
          location: {
            warehouse: 'Main Warehouse',
            aisle: 'A5',
            shelf: 'S18',
            bin: 'B08',
          },
          tags: ['monitor', '4k', 'hdr'],
          warrantyPeriod: 36,
          warrantyType: 'manufacturer',
          status: 'active',
          createdById: adminUser.id,
        },
      }),
      prisma.inventory.upsert({
        where: { itemId: 'INV_TABLET_013' },
        update: {},
        create: {
          itemId: 'INV_TABLET_013',
          name: 'Tablet Pro 10"',
          description: '10-inch professional tablet with stylus support',
          categoryId: categories[3].id,
          brand: 'TabTech',
          sku: 'TB-013',
          priceCost: 399.99,
          priceSelling: 599.99,
          quantity: 30,
          minStock: 8,
          maxStock: 60,
          reorderPoint: 8,
          reorderQuantity: 50,
          unit: 'pieces',
          supplierId: suppliers[2].id,
          location: {
            warehouse: 'Main Warehouse',
            aisle: 'C1',
            shelf: 'S10',
            bin: 'B12',
          },
          tags: ['tablet', 'mobile', 'stylus'],
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
      prisma.contact.upsert({
        where: { contactId: 'CONT_001' },
        update: {},
        create: {
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
      prisma.contact.upsert({
        where: { contactId: 'CONT_002' },
        update: {},
        create: {
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
      prisma.contact.upsert({
        where: { contactId: 'CONT_003' },
        update: {},
        create: {
          contactId: 'CONT_003',
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@techsupplies.com',
          phone: '+1234567892',
          company: 'Tech Supplies Inc.',
          jobTitle: 'Sales Representative',
          contactType: 'supplier',
          categoryId: categories[0].id,
          tags: ['supplier', 'sales'],
          isActive: true,
          createdById: adminUser.id,
        },
      }),
    ]);
    
    console.log(`${contacts.length} contacts created`);
    
    // Create payment accounts
    const paymentAccounts = await Promise.all([
      prisma.paymentAccount.upsert({
        where: { accountId: 'ACC_BANK_001' },
        update: {},
        create: {
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
      prisma.paymentAccount.upsert({
        where: { accountId: 'ACC_CASH_001' },
        update: {},
        create: {
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
    
    // Create notification templates
    const templates = await Promise.all([
      prisma.notificationTemplate.upsert({
        where: { templateId: 'NT_WELCOME_001' },
        update: {},
        create: {
          templateId: 'NT_WELCOME_001',
          name: 'Customer Welcome',
          type: 'email',
          subject: 'Welcome to Smart Inventory System',
          message: 'Dear {{customer_name}},\n\nWelcome to our Smart Inventory System! Your account has been successfully created.\n\nBest regards,\n{{company_name}}',
          variables: ['customer_name', 'company_name'],
          isActive: true,
          createdById: adminUser.id,
        },
      }),
      prisma.notificationTemplate.upsert({
        where: { templateId: 'NT_LOWSTOCK_001' },
        update: {},
        create: {
          templateId: 'NT_LOWSTOCK_001',
          name: 'Low Stock Alert',
          type: 'email',
          subject: 'Low Stock Alert - {{product_name}}',
          message: 'Alert: Product "{{product_name}}" is running low on stock. Current quantity: {{current_quantity}}, Minimum stock: {{min_stock}}.\n\nPlease reorder soon.\n\nBest regards,\nInventory Team',
          variables: ['product_name', 'current_quantity', 'min_stock'],
          isActive: true,
          createdById: adminUser.id,
        },
      }),
    ]);
    
    console.log(`${templates.length} notification templates created`);
    
    // Create sample AI insights
    const insights = await Promise.all([
      prisma.aIInsight.upsert({
        where: { insightId: 'AI_001' },
        update: {},
        create: {
          insightId: 'AI_001',
          title: 'High-Value Products Analysis',
          description: 'Identify top-performing products by revenue and margin',
          insightType: 'trend',
          category: 'products',
          data: {
            top_products: [
              { name: 'Laptop Pro 15"', revenue: 25999.80, margin: 30.8 },
              { name: '4K Monitor 27"', revenue: 9999.80, margin: 40.0 },
              { name: 'Tablet Pro 10"', revenue: 17999.70, margin: 33.3 }
            ],
            trend_period: 'last_30_days',
            analysis_date: new Date().toISOString()
          },
          confidenceScore: 0.95,
          priority: 'high',
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          createdById: adminUser.id,
        },
      }),
      prisma.aIInsight.upsert({
        where: { insightId: 'AI_002' },
        update: {},
        create: {
          insightId: 'AI_002',
          title: 'Inventory Optimization Recommendation',
          description: 'Recommend reorder points based on sales velocity',
          insightType: 'recommendation',
          category: 'inventory',
          data: {
            recommendations: [
              { product: 'Wireless Mouse', current_reorder: 20, recommended_reorder: 35 },
              { product: 'Mechanical Keyboard RGB', current_reorder: 15, recommended_reorder: 25 }
            ],
            optimization_potential: '15% cost reduction'
          },
          confidenceScore: 0.88,
          priority: 'medium',
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          createdById: adminUser.id,
        },
      }),
    ]);
    
    console.log(`${insights.length} AI insights created`);
    
    // Create sample alerts
    const alerts = await Promise.all([
      prisma.alert.upsert({
        where: { alertId: 'ALT_001' },
        update: {},
        create: {
          alertId: 'ALT_001',
          title: 'Critical: Out of Stock',
          message: 'Product "Laptop Pro 15"" is completely out of stock. Immediate action required.',
          alertType: 'out_of_stock',
          severity: 'critical',
          module: 'inventory',
          referenceId: 'INV_LAPTOP_001',
          referenceType: 'product',
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          createdById: adminUser.id,
        },
      }),
      prisma.alert.upsert({
        where: { alertId: 'ALT_002' },
        update: {},
        create: {
          alertId: 'ALT_002',
          title: 'Payment Due',
          message: 'Customer "ABC Corporation" has overdue payment of $15,000.',
          alertType: 'payment_due',
          severity: 'warning',
          module: 'customers',
          referenceId: 'CUST_ABC_001',
          referenceType: 'customer',
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          createdById: adminUser.id,
        },
      }),
    ]);
    
    console.log(`${alerts.length} alerts created`);
    
    console.log('');
    console.log('Database seeding completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`  Users: 1 (admin)`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Suppliers: ${suppliers.length}`);
    console.log(`  Customers: ${customers.length}`);
    console.log(`  Products: ${inventoryItems.length}`);
    console.log(`  Contacts: ${contacts.length}`);
    console.log(`  Payment Accounts: ${paymentAccounts.length}`);
    console.log(`  Notification Templates: ${templates.length}`);
    console.log(`  AI Insights: ${insights.length}`);
    console.log(`  Alerts: ${alerts.length}`);
    console.log('');
    console.log('Login credentials: jaanu / 123456');
    
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
