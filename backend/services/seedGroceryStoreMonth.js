const Alert = require('../models/Alert');
const Asset = require('../models/Asset');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');
const PaymentAccount = require('../models/PaymentAccount');
const PaymentAccountTransaction = require('../models/PaymentAccountTransaction');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const StockAdjustment = require('../models/StockAdjustment');
const StockTransfer = require('../models/StockTransfer');
const Supplier = require('../models/Supplier');
const Transaction = require('../models/Transaction');
const Unit = require('../models/Unit');
const Warehouse = require('../models/Warehouse');
const Warranty = require('../models/Warranty');

const daysAgoAt = (daysAgo, hour = 10, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const makeDemoId = (prefix, suffix) => `${prefix}_${suffix}`;

const syncInventoryStatus = async (item, touchedAt = new Date()) => {
  if (item.quantity <= 0) {
    item.status = 'out_of_stock';
  } else if (item.quantity <= item.minStockLevel) {
    item.status = 'low_stock';
  } else {
    item.status = 'active';
  }

  item.updatedAt = touchedAt;
  await item.save();
  return item;
};

const seedGroceryStoreMonth = async ({ createdBy, replaceExisting = true }) => {
  if (!createdBy) {
    throw new Error('A valid user id is required to seed grocery demo data.');
  }

  if (replaceExisting) {
    await Promise.all([
      Alert.deleteMany({}),
      Asset.deleteMany({}),
      Brand.deleteMany({}),
      Category.deleteMany({}),
      Customer.deleteMany({}),
      Expense.deleteMany({}),
      Inventory.deleteMany({}),
      PaymentAccount.deleteMany({}),
      PaymentAccountTransaction.deleteMany({}),
      Purchase.deleteMany({}),
      Sale.deleteMany({}),
      StockAdjustment.deleteMany({}),
      StockTransfer.deleteMany({}),
      Supplier.deleteMany({}),
      Transaction.deleteMany({}),
      Unit.deleteMany({}),
      Warehouse.deleteMany({}),
      Warranty.deleteMany({}),
    ]);
  }

  await Unit.insertMany([
    { name: 'Pieces', short_name: 'pc', allow_decimal: false, created_by: createdBy },
    { name: 'Kilograms', short_name: 'kg', allow_decimal: true, created_by: createdBy },
    { name: 'Liters', short_name: 'ltr', allow_decimal: true, created_by: createdBy },
    { name: 'Packs', short_name: 'pk', allow_decimal: false, created_by: createdBy },
    { name: 'Bottles', short_name: 'btl', allow_decimal: false, created_by: createdBy },
  ]);

  await Brand.insertMany([
    { name: 'FreshFarm', description: 'Produce and dairy essentials', created_by: createdBy },
    { name: 'DailyMoo', description: 'Milk and yogurt line', created_by: createdBy },
    { name: 'BakeHouse', description: 'Bakery staples', created_by: createdBy },
    { name: 'SnackJoy', description: 'Snacks and impulse items', created_by: createdBy },
    { name: 'CleanNest', description: 'Household cleaners', created_by: createdBy },
  ]);

  await Category.insertMany([
    { name: 'Produce', description: 'Fresh fruits and vegetables', code: 'PROD', created_by: createdBy },
    { name: 'Dairy', description: 'Milk, yogurt, and chilled goods', code: 'DAIRY', created_by: createdBy },
    { name: 'Bakery', description: 'Bread and baked items', code: 'BAKE', created_by: createdBy },
    { name: 'Pantry', description: 'Rice, flour, and packaged staples', code: 'PANTRY', created_by: createdBy },
    { name: 'Beverages', description: 'Juices and soft drinks', code: 'BEV', created_by: createdBy },
    { name: 'Snacks', description: 'Impulse and snack products', code: 'SNACK', created_by: createdBy },
    { name: 'Frozen', description: 'Frozen grocery items', code: 'FROZEN', created_by: createdBy },
    { name: 'Household', description: 'Cleaning and utility products', code: 'HOME', created_by: createdBy },
  ]);

  await Warranty.create({
    name: 'Store Equipment Cover',
    description: 'Basic maintenance warranty for grocery equipment',
    duration: 12,
    duration_type: 'months',
    created_by: createdBy,
  });

  const warehouses = await Warehouse.insertMany([
    {
      name: 'Main Store Floor',
      location: { address: '14 Market Road', city: 'Smart City', state: 'CA', country: 'USA' },
      manager: createdBy,
      status: 'active',
    },
    {
      name: 'Backroom Storage',
      location: { address: '14 Market Road', city: 'Smart City', state: 'CA', country: 'USA' },
      manager: createdBy,
      status: 'active',
    },
    {
      name: 'Cold Storage',
      location: { address: '14 Market Road', city: 'Smart City', state: 'CA', country: 'USA' },
      manager: createdBy,
      status: 'active',
    },
  ]);

  const warehouseMap = Object.fromEntries(warehouses.map((warehouse) => [warehouse.name, warehouse]));

  const suppliers = await Supplier.insertMany([
    {
      supplier_id: makeDemoId('SUP', 'GROCERY-01'),
      name: 'Green Basket Wholesale',
      company_name: 'Green Basket Wholesale LLC',
      contact_person: {
        name: 'Ivy Brooks',
        position: 'Account Manager',
        email: 'ivy@greenbasket.example',
        phone: '+1-555-0101',
      },
      address: { street: '100 Orchard Way', city: 'Smart City', state: 'CA', country: 'USA', postal_code: '90210' },
      categories: ['Produce'],
      payment_terms: { method: 'bank_transfer', credit_period: 14 },
      lead_time: { average: 2, min: 1, max: 3, unit: 'days' },
      minimum_order: { amount: 200, quantity: 25 },
      performance: { rating: 5, on_time_delivery: 98, quality_score: 97, total_orders: 0, total_value: 0 },
      status: 'active',
      tags: ['produce', 'fast-moving'],
    },
    {
      supplier_id: makeDemoId('SUP', 'GROCERY-02'),
      name: 'Sunrise Dairy Co.',
      company_name: 'Sunrise Dairy Co.',
      contact_person: {
        name: 'Mia Lopez',
        position: 'Sales Lead',
        email: 'mia@sunrisedairy.example',
        phone: '+1-555-0102',
      },
      address: { street: '55 Creamery Park', city: 'Smart City', state: 'CA', country: 'USA', postal_code: '90211' },
      categories: ['Dairy'],
      payment_terms: { method: 'credit', credit_period: 7 },
      lead_time: { average: 1, min: 1, max: 2, unit: 'days' },
      minimum_order: { amount: 150, quantity: 20 },
      performance: { rating: 4, on_time_delivery: 95, quality_score: 96, total_orders: 0, total_value: 0 },
      status: 'active',
      tags: ['dairy', 'chilled'],
    },
    {
      supplier_id: makeDemoId('SUP', 'GROCERY-03'),
      name: 'Golden Grain Foods',
      company_name: 'Golden Grain Foods Inc.',
      contact_person: {
        name: 'Noah Kim',
        position: 'Regional Executive',
        email: 'noah@goldengrain.example',
        phone: '+1-555-0103',
      },
      address: { street: '89 Mill Avenue', city: 'Smart City', state: 'CA', country: 'USA', postal_code: '90212' },
      categories: ['Pantry', 'Bakery'],
      payment_terms: { method: 'bank_transfer', credit_period: 21 },
      lead_time: { average: 4, min: 3, max: 6, unit: 'days' },
      minimum_order: { amount: 250, quantity: 30 },
      performance: { rating: 4, on_time_delivery: 93, quality_score: 94, total_orders: 0, total_value: 0 },
      status: 'active',
      tags: ['dry-goods'],
    },
    {
      supplier_id: makeDemoId('SUP', 'GROCERY-04'),
      name: 'Fizz & Fun Distributors',
      company_name: 'Fizz & Fun Distributors',
      contact_person: {
        name: 'Ava Patel',
        position: 'Distributor',
        email: 'ava@fizzfun.example',
        phone: '+1-555-0104',
      },
      address: { street: '22 Beverage Lane', city: 'Smart City', state: 'CA', country: 'USA', postal_code: '90213' },
      categories: ['Beverages', 'Snacks'],
      payment_terms: { method: 'cash', credit_period: 0 },
      lead_time: { average: 3, min: 2, max: 4, unit: 'days' },
      minimum_order: { amount: 180, quantity: 24 },
      performance: { rating: 5, on_time_delivery: 97, quality_score: 95, total_orders: 0, total_value: 0 },
      status: 'active',
      tags: ['promo'],
    },
    {
      supplier_id: makeDemoId('SUP', 'GROCERY-05'),
      name: 'HomeCare Essentials',
      company_name: 'HomeCare Essentials',
      contact_person: {
        name: 'Liam Reed',
        position: 'Field Rep',
        email: 'liam@homecare.example',
        phone: '+1-555-0105',
      },
      address: { street: '7 Utility Park', city: 'Smart City', state: 'CA', country: 'USA', postal_code: '90214' },
      categories: ['Household', 'Frozen'],
      payment_terms: { method: 'bank_transfer', credit_period: 14 },
      lead_time: { average: 5, min: 4, max: 7, unit: 'days' },
      minimum_order: { amount: 220, quantity: 18 },
      performance: { rating: 4, on_time_delivery: 92, quality_score: 93, total_orders: 0, total_value: 0 },
      status: 'active',
      tags: ['household', 'frozen'],
    },
  ]);

  const supplierMap = {
    produce: suppliers[0],
    dairy: suppliers[1],
    pantry: suppliers[2],
    snacks: suppliers[3],
    household: suppliers[4],
  };

  const customers = await Customer.insertMany([
    {
      customer_id: makeDemoId('CUST', 'GROCERY-01'),
      name: 'Grace Harper',
      email: 'grace.harper@example.com',
      phone: '+1-555-1001',
      address: { street: '11 Cherry Street', city: 'Smart City', state: 'CA', zip: '90220' },
      group: 'vip',
      status: 'active',
      credit_limit: 500,
      tags: ['loyalty', 'weekly-shop'],
    },
    {
      customer_id: makeDemoId('CUST', 'GROCERY-02'),
      name: 'Oak Street Cafe',
      email: 'orders@oakstreetcafe.example',
      phone: '+1-555-1002',
      company_name: 'Oak Street Cafe',
      address: { street: '90 Oak Street', city: 'Smart City', state: 'CA', zip: '90221' },
      group: 'wholesale',
      status: 'active',
      credit_limit: 2500,
      tags: ['b2b', 'bulk'],
    },
    {
      customer_id: makeDemoId('CUST', 'GROCERY-03'),
      name: 'Riverside Hostel',
      email: 'frontdesk@riversidehostel.example',
      phone: '+1-555-1003',
      company_name: 'Riverside Hostel',
      address: { street: '5 River Road', city: 'Smart City', state: 'CA', zip: '90222' },
      group: 'wholesale',
      status: 'active',
      credit_limit: 1800,
      tags: ['hospitality'],
    },
    {
      customer_id: makeDemoId('CUST', 'GROCERY-04'),
      name: 'Nina Carter',
      email: 'nina.carter@example.com',
      phone: '+1-555-1004',
      address: { street: '22 Park Ave', city: 'Smart City', state: 'CA', zip: '90223' },
      group: 'retail',
      status: 'active',
      credit_limit: 0,
      tags: ['family-shopper'],
    },
    {
      customer_id: makeDemoId('CUST', 'GROCERY-05'),
      name: 'Samir Khan',
      email: 'samir.khan@example.com',
      phone: '+1-555-1005',
      address: { street: '48 Pine Street', city: 'Smart City', state: 'CA', zip: '90224' },
      group: 'retail',
      status: 'active',
      credit_limit: 100,
      tags: ['mobile-pay'],
    },
  ]);

  const customerMap = {
    grace: customers[0],
    cafe: customers[1],
    hostel: customers[2],
    nina: customers[3],
    samir: customers[4],
  };

  const accounts = await PaymentAccount.insertMany([
    {
      name: 'Main Cash Drawer',
      account_type: 'cash',
      opening_balance: 900,
      balance: 900,
      status: 'active',
      created_by: createdBy,
    },
    {
      name: 'Store Current Account',
      account_number: '4589217301',
      account_type: 'bank',
      bank_name: 'Smart Bank',
      bank_branch: 'Downtown',
      opening_balance: 8500,
      balance: 8500,
      status: 'active',
      created_by: createdBy,
    },
    {
      name: 'Front Desk UPI',
      account_type: 'upi',
      upi_id: 'smartinventory@upi',
      opening_balance: 1200,
      balance: 1200,
      status: 'active',
      created_by: createdBy,
    },
    {
      name: 'Card Terminal',
      account_type: 'credit',
      card_type: 'credit',
      opening_balance: 300,
      balance: 300,
      status: 'active',
      created_by: createdBy,
    },
  ]);

  const accountMap = {
    cash: accounts[0],
    bank: accounts[1],
    upi: accounts[2],
    card: accounts[3],
  };

  const recordAccountMovement = async ({
    accountKey,
    amount,
    transactionType,
    description,
    transactionDate,
    relatedAccountKey,
  }) => {
    const account = accountMap[accountKey];
    const relatedAccount = relatedAccountKey ? accountMap[relatedAccountKey] : null;

    if (!account) return null;

    if (transactionType === 'deposit') {
      account.balance += amount;
    } else if (transactionType === 'withdraw') {
      account.balance -= amount;
    } else if (transactionType === 'transfer' && relatedAccount) {
      account.balance -= amount;
      relatedAccount.balance += amount;
      await relatedAccount.save();
    }

    await account.save();

    return PaymentAccountTransaction.create({
      account: account._id,
      related_account: relatedAccount?._id,
      amount,
      transaction_type: transactionType,
      description,
      transaction_date: transactionDate,
      created_by: createdBy,
    });
  };

  const inventoryDefinitions = [
    ['BAN-001', 'Bananas', 'Produce', 'FreshFarm', 'kg', 'produce', 0.7, 1.2, 18, 120, 28, 'Main Store Floor', ['fruit', 'fresh']],
    ['APP-001', 'Red Apples', 'Produce', 'FreshFarm', 'kg', 'produce', 1.1, 1.9, 16, 100, 24, 'Main Store Floor', ['fruit', 'premium']],
    ['TOM-001', 'Tomatoes', 'Produce', 'FreshFarm', 'kg', 'produce', 0.9, 1.7, 14, 90, 20, 'Main Store Floor', ['vegetable']],
    ['POT-001', 'Potatoes', 'Produce', 'FreshFarm', 'kg', 'produce', 0.5, 1.0, 20, 140, 30, 'Main Store Floor', ['vegetable', 'staple']],
    ['MLK-001', 'Milk 1L', 'Dairy', 'DailyMoo', 'ltr', 'dairy', 0.95, 1.6, 20, 120, 24, 'Cold Storage', ['dairy', 'fast-moving']],
    ['YGT-001', 'Greek Yogurt Cup', 'Dairy', 'DailyMoo', 'pc', 'dairy', 0.65, 1.25, 16, 100, 20, 'Cold Storage', ['dairy']],
    ['BRD-001', 'Whole Wheat Bread', 'Bakery', 'BakeHouse', 'pc', 'pantry', 1.1, 2.0, 12, 70, 16, 'Main Store Floor', ['bakery']],
    ['EGG-001', 'Eggs 12 Pack', 'Dairy', 'DailyMoo', 'pk', 'dairy', 1.7, 3.1, 14, 90, 18, 'Cold Storage', ['protein']],
    ['RIC-001', 'Rice 5kg', 'Pantry', 'Golden Grain Foods', 'pk', 'pantry', 4.9, 7.8, 10, 65, 12, 'Backroom Storage', ['staple']],
    ['FLR-001', 'Wheat Flour 5kg', 'Pantry', 'Golden Grain Foods', 'pk', 'pantry', 3.9, 6.4, 10, 60, 12, 'Backroom Storage', ['staple']],
    ['SGR-001', 'Sugar 1kg', 'Pantry', 'Golden Grain Foods', 'pc', 'pantry', 0.95, 1.7, 12, 80, 16, 'Backroom Storage', ['baking']],
    ['CHP-001', 'Potato Chips Family Pack', 'Snacks', 'SnackJoy', 'pc', 'snacks', 1.05, 1.95, 18, 110, 22, 'Main Store Floor', ['snack']],
    ['JCE-001', 'Orange Juice 1L', 'Beverages', 'SnackJoy', 'btl', 'snacks', 1.45, 2.6, 10, 72, 14, 'Main Store Floor', ['beverage']],
    ['COL-001', 'Cola 2L', 'Beverages', 'SnackJoy', 'btl', 'snacks', 1.1, 2.15, 14, 96, 18, 'Main Store Floor', ['beverage']],
    ['DSP-001', 'Dish Soap 500ml', 'Household', 'CleanNest', 'pc', 'household', 1.9, 3.4, 8, 48, 10, 'Backroom Storage', ['cleaning']],
    ['FPE-001', 'Frozen Peas 500g', 'Frozen', 'CleanNest', 'pk', 'household', 1.6, 2.9, 10, 56, 12, 'Cold Storage', ['frozen']],
  ];

  const inventoryItems = await Inventory.insertMany(
    inventoryDefinitions.map(([sku, name, category, brand, unit, supplierKey, cost, selling, minStockLevel, maxStockLevel, reorderPoint, warehouse, tags]) => ({
      product_id: `PRD-${sku}`,
      name,
      description: `${name} stocked for the grocery demo flow`,
      category,
      brand,
      sku,
      barcode: `BAR-${sku}`,
      quantity: 0,
      minStockLevel,
      maxStockLevel,
      unit,
      price: {
        cost,
        selling,
        currency: 'USD',
      },
      supplier_id: supplierMap[supplierKey]._id,
      location: { warehouse, aisle: 'A', shelf: '1', bin: '01' },
      status: 'out_of_stock',
      reorderPoint,
      reorderQuantity: Math.max(reorderPoint * 2, minStockLevel + 12),
      batchNumber: `BATCH-${sku}`,
      tags,
      aiPredictedDemand: {
        next30Days: Math.max(reorderPoint * 2, minStockLevel + 10),
        next90Days: Math.max(reorderPoint * 5, minStockLevel + 24),
        confidence: 0.84,
        lastUpdated: daysAgoAt(1, 8),
      },
    }))
  );

  const inventoryMap = Object.fromEntries(inventoryItems.map((item) => [item.sku, item]));

  await Promise.all(
    Object.values(supplierMap).map(async (supplier) => {
      supplier.products = inventoryItems
        .filter((item) => String(item.supplier_id) === String(supplier._id))
        .map((item) => item._id);
      await supplier.save();
    })
  );

  const assets = await Asset.insertMany([
    {
      asset_id: makeDemoId('AST', 'GROCERY-01'),
      asset_name: 'Front POS Terminal',
      description: 'Main billing counter machine',
      category: 'POS',
      type: 'electronics',
      purchase_date: daysAgoAt(220),
      purchase_cost: { amount: 1200, currency: 'USD' },
      depreciation: { method: 'straight_line', usefulLife: 5, salvageValue: 100 },
      status: 'active',
      assigned_to: {
        user_id: createdBy,
        department: 'Operations',
        location: 'Billing Counter',
        assigned_date: daysAgoAt(200),
      },
      location: { building: 'Main Store', floor: 'Ground', room: 'Counter 1' },
      maintenance: {
        lastMaintenance: daysAgoAt(45),
        nextMaintenanceDue: daysAgoAt(40),
        maintenanceInterval: 90,
      },
      specifications: { make: 'RetailTech', model: 'RT-200', serialNumber: 'POS-RT200-001', year: 2025 },
      current_value: { amount: 980, currency: 'USD', lastUpdated: daysAgoAt(1) },
    },
    {
      asset_id: makeDemoId('AST', 'GROCERY-02'),
      asset_name: 'Dairy Display Chiller',
      description: 'Cold chain display for milk and yogurt',
      category: 'Refrigeration',
      type: 'equipment',
      purchase_date: daysAgoAt(380),
      purchase_cost: { amount: 3600, currency: 'USD' },
      depreciation: { method: 'straight_line', usefulLife: 8, salvageValue: 400 },
      status: 'maintenance_due',
      location: { building: 'Main Store', floor: 'Ground', room: 'Dairy Zone' },
      maintenance: {
        lastMaintenance: daysAgoAt(122),
        nextMaintenanceDue: daysAgoAt(12),
        maintenanceInterval: 90,
      },
      specifications: { make: 'CoolSafe', model: 'CS-500', serialNumber: 'CS500-DAIRY-09', year: 2024 },
      current_value: { amount: 3100, currency: 'USD', lastUpdated: daysAgoAt(1) },
    },
    {
      asset_id: makeDemoId('AST', 'GROCERY-03'),
      asset_name: 'Delivery Scooter',
      description: 'Local delivery vehicle for nearby orders',
      category: 'Logistics',
      type: 'vehicle',
      purchase_date: daysAgoAt(500),
      purchase_cost: { amount: 2200, currency: 'USD' },
      depreciation: { method: 'straight_line', usefulLife: 6, salvageValue: 300 },
      status: 'active',
      location: { building: 'Backroom', floor: 'Ground', room: 'Garage' },
      maintenance: {
        lastMaintenance: daysAgoAt(28),
        nextMaintenanceDue: daysAgoAt(62),
        maintenanceInterval: 90,
      },
      specifications: { make: 'SwiftRide', model: 'SR-125', serialNumber: 'VEH-SR125-21', year: 2023 },
      current_value: { amount: 1675, currency: 'USD', lastUpdated: daysAgoAt(1) },
    },
  ]);

  const purchaseEvents = [
    {
      daysAgo: 28,
      supplierKey: 'produce',
      status: 'received',
      paymentStatus: 'paid',
      accountKey: 'bank',
      notes: 'Weekly produce opening stock',
      items: [
        ['BAN-001', 48, 0.72],
        ['APP-001', 32, 1.08],
        ['TOM-001', 30, 0.91],
        ['POT-001', 40, 0.52],
      ],
    },
    {
      daysAgo: 26,
      supplierKey: 'dairy',
      status: 'received',
      paymentStatus: 'paid',
      accountKey: 'bank',
      notes: 'Initial dairy fill',
      items: [
        ['MLK-001', 54, 0.94],
        ['YGT-001', 42, 0.62],
        ['EGG-001', 30, 1.72],
      ],
    },
    {
      daysAgo: 24,
      supplierKey: 'pantry',
      status: 'received',
      paymentStatus: 'paid',
      accountKey: 'bank',
      notes: 'Pantry staples launch stock',
      items: [
        ['BRD-001', 28, 1.08],
        ['RIC-001', 24, 4.82],
        ['FLR-001', 20, 3.85],
        ['SGR-001', 36, 0.92],
      ],
    },
    {
      daysAgo: 21,
      supplierKey: 'snacks',
      status: 'received',
      paymentStatus: 'paid',
      accountKey: 'cash',
      notes: 'Weekend impulse items',
      items: [
        ['CHP-001', 42, 1.02],
        ['JCE-001', 24, 1.42],
        ['COL-001', 36, 1.08],
      ],
    },
    {
      daysAgo: 15,
      supplierKey: 'produce',
      status: 'received',
      paymentStatus: 'paid',
      accountKey: 'bank',
      notes: 'Mid-month produce replenishment',
      items: [
        ['BAN-001', 36, 0.69],
        ['APP-001', 24, 1.06],
        ['TOM-001', 22, 0.89],
      ],
    },
    {
      daysAgo: 11,
      supplierKey: 'dairy',
      status: 'received',
      paymentStatus: 'partial',
      notes: 'Dairy top-up ahead of weekend',
      items: [
        ['MLK-001', 34, 0.97],
        ['YGT-001', 24, 0.64],
        ['EGG-001', 18, 1.75],
      ],
    },
    {
      daysAgo: 8,
      supplierKey: 'household',
      status: 'received',
      paymentStatus: 'paid',
      accountKey: 'bank',
      notes: 'Household and frozen fill',
      items: [
        ['DSP-001', 18, 1.88],
        ['FPE-001', 20, 1.55],
      ],
    },
    {
      daysAgo: 3,
      supplierKey: 'snacks',
      status: 'ordered',
      paymentStatus: 'pending',
      notes: 'Upcoming weekend beverage reorder',
      items: [
        ['JCE-001', 18, 1.45],
        ['COL-001', 24, 1.12],
      ],
    },
  ];

  const purchases = [];

  for (const event of purchaseEvents) {
    const purchaseDate = daysAgoAt(event.daysAgo, 9, 30);
    const supplier = supplierMap[event.supplierKey];
    const purchaseItems = event.items.map(([sku, quantity, purchasePrice]) => {
      const product = inventoryMap[sku];
      return {
        product: product._id,
        quantity,
        purchase_price: purchasePrice,
        total: Number((quantity * purchasePrice).toFixed(2)),
      };
    });

    const totalAmount = Number(purchaseItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));

    const purchase = await Purchase.create({
      purchase_id: makeDemoId('PUR', `GROCERY-${String(event.daysAgo).padStart(2, '0')}`),
      supplier: supplier._id,
      items: purchaseItems,
      total_amount: totalAmount,
      status: event.status,
      payment_status: event.paymentStatus,
      purchase_date: purchaseDate,
      notes: event.notes,
      created_by: createdBy,
    });
    purchases.push(purchase);

    await Transaction.create({
      type: 'purchase',
      status: event.status === 'received' ? 'completed' : 'pending',
      date: purchaseDate,
      amount: {
        total: totalAmount,
        currency: 'USD',
      },
      items: purchaseItems.map((item) => ({
        inventory_item: item.product,
        quantity: item.quantity,
        unit_price: item.purchase_price,
        total_price: item.total,
      })),
      parties: {
        from: supplier._id,
        fromType: 'Supplier',
      },
      payment: {
        method: event.paymentStatus === 'paid' ? 'bank_transfer' : 'credit',
        status: event.paymentStatus,
        paid_amount: event.paymentStatus === 'partial' ? Number((totalAmount * 0.5).toFixed(2)) : event.paymentStatus === 'paid' ? totalAmount : 0,
        due_date: daysAgoAt(Math.max(event.daysAgo - 7, 0), 17),
        payment_date: event.paymentStatus === 'pending' ? undefined : purchaseDate,
      },
      created_by: createdBy,
      reference: {
        purchase_order: purchase.purchase_id,
        order_id: purchase.purchase_id,
        notes: event.notes,
      },
    });

    if (event.status === 'received') {
      for (const [sku, quantity] of event.items) {
        const inventoryItem = inventoryMap[sku];
        inventoryItem.quantity += quantity;
        inventoryItem.lastRestocked = purchaseDate;
        await syncInventoryStatus(inventoryItem, purchaseDate);
      }
    }

    supplier.performance.total_orders += 1;
    supplier.performance.total_value += totalAmount;
    supplier.performance.last_order_date = purchaseDate;
    await supplier.save();

    if (event.paymentStatus === 'paid' && event.accountKey) {
      await recordAccountMovement({
        accountKey: event.accountKey,
        amount: totalAmount,
        transactionType: 'withdraw',
        description: `Supplier purchase ${purchase.purchase_id}`,
        transactionDate: purchaseDate,
      });
    }

    if (event.paymentStatus === 'partial') {
      await recordAccountMovement({
        accountKey: 'bank',
        amount: Number((totalAmount * 0.5).toFixed(2)),
        transactionType: 'withdraw',
        description: `Partial payment for ${purchase.purchase_id}`,
        transactionDate: purchaseDate,
      });
    }
  }

  const saleTemplates = [
    { customerKey: 'grace', payment: 'card', items: [['MLK-001', 2], ['BRD-001', 1], ['EGG-001', 1], ['BAN-001', 2]] },
    { customerKey: null, payment: 'cash', items: [['BAN-001', 3], ['APP-001', 2], ['CHP-001', 2]] },
    { customerKey: 'cafe', payment: 'other', items: [['MLK-001', 8], ['BRD-001', 6], ['EGG-001', 4], ['JCE-001', 3]] },
    { customerKey: 'nina', payment: 'upi', items: [['TOM-001', 3], ['POT-001', 4], ['SGR-001', 2]] },
    { customerKey: null, payment: 'cash', items: [['COL-001', 4], ['CHP-001', 4], ['JCE-001', 2]] },
    { customerKey: 'samir', payment: 'upi', items: [['RIC-001', 1], ['FLR-001', 1], ['DSP-001', 1]] },
    { customerKey: 'hostel', payment: 'card', items: [['MLK-001', 6], ['EGG-001', 3], ['BRD-001', 4], ['FPE-001', 2]] },
    { customerKey: null, payment: 'cash', items: [['BAN-001', 2], ['MLK-001', 1], ['BRD-001', 1], ['CHP-001', 1]] },
    { customerKey: 'grace', payment: 'card', items: [['APP-001', 3], ['YGT-001', 4], ['JCE-001', 2]] },
    { customerKey: 'cafe', payment: 'other', items: [['RIC-001', 3], ['FLR-001', 3], ['SGR-001', 4], ['COL-001', 6]] },
    { customerKey: null, payment: 'cash', items: [['POT-001', 4], ['TOM-001', 2], ['BAN-001', 2]] },
    { customerKey: 'nina', payment: 'card', items: [['MLK-001', 2], ['YGT-001', 2], ['EGG-001', 1], ['FPE-001', 1]] },
  ];

  const saleDays = [27, 25, 23, 22, 20, 18, 17, 16, 14, 12, 10, 9, 7, 6, 5, 4, 3, 2, 1];

  const sales = [];
  const creditSalesByCustomer = {};

  for (let index = 0; index < saleDays.length; index += 1) {
    const template = saleTemplates[index % saleTemplates.length];
    const saleDate = daysAgoAt(saleDays[index], 15, 20);
    const saleCustomer = template.customerKey ? customerMap[template.customerKey] : null;

    const saleItems = template.items.map(([sku, quantity]) => {
      const product = inventoryMap[sku];
      const price = product.price.selling;
      return {
        product: product._id,
        quantity,
        selling_price: price,
        total: Number((price * quantity).toFixed(2)),
      };
    });

    const totalAmount = Number(saleItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));

    for (const [sku, quantity] of template.items) {
      const product = inventoryMap[sku];
      product.quantity = Math.max(product.quantity - quantity, 0);
      await syncInventoryStatus(product, saleDate);
    }

    const sale = await Sale.create({
      sale_id: makeDemoId('SAL', `GROCERY-${String(index + 1).padStart(2, '0')}`),
      customer_id: saleCustomer?._id,
      customer_name: saleCustomer?.name || 'Walk-in Customer',
      items: saleItems,
      total_amount: totalAmount,
      payment_method: template.payment === 'upi' ? 'online' : template.payment,
      status: 'completed',
      sale_date: saleDate,
      created_by: createdBy,
    });
    sales.push(sale);

    await Transaction.create({
      type: 'sale',
      status: 'completed',
      date: saleDate,
      amount: {
        total: totalAmount,
        currency: 'USD',
      },
      items: saleItems.map((item) => ({
        inventory_item: item.product,
        quantity: item.quantity,
        unit_price: item.selling_price,
        total_price: item.total,
      })),
      parties: saleCustomer
        ? {
            to: saleCustomer._id,
            toType: 'Customer',
          }
        : undefined,
      payment: {
        method: template.payment === 'upi' ? 'other' : template.payment,
        status: template.payment === 'other' ? 'pending' : 'paid',
        paid_amount: template.payment === 'other' ? 0 : totalAmount,
        due_date: template.payment === 'other' ? daysAgoAt(Math.max(saleDays[index] - 7, 0), 18) : undefined,
        payment_date: template.payment === 'other' ? undefined : saleDate,
      },
      created_by: createdBy,
      reference: {
        order_id: sale.sale_id,
        invoice_id: sale.sale_id,
      },
    });

    if (saleCustomer) {
      saleCustomer.total_spent += totalAmount;
      saleCustomer.last_purchase_date = saleDate;

      if (template.payment === 'other') {
        saleCustomer.outstanding_balance += totalAmount;
        saleCustomer.payment_status = 'pending';
        creditSalesByCustomer[saleCustomer._id] = (creditSalesByCustomer[saleCustomer._id] || 0) + totalAmount;
      } else {
        saleCustomer.payment_history.push({
          amount: totalAmount,
          date: saleDate,
          method: template.payment === 'upi' ? 'online' : template.payment,
          reference: sale.sale_id,
          note: `Payment captured for ${sale.sale_id}`,
        });
        if (saleCustomer.outstanding_balance <= 0) {
          saleCustomer.payment_status = 'paid';
        }
      }

      await saleCustomer.save();
    }

    if (template.payment !== 'other') {
      const accountKey = template.payment === 'cash'
        ? 'cash'
        : template.payment === 'card'
          ? 'card'
          : 'upi';

      await recordAccountMovement({
        accountKey,
        amount: totalAmount,
        transactionType: 'deposit',
        description: `Customer sale ${sale.sale_id}`,
        transactionDate: saleDate,
      });
    }
  }

  const settlementEvents = [
    { customerKey: 'cafe', amount: 68, daysAgo: 5, accountKey: 'bank', note: 'Invoice part payment' },
    { customerKey: 'cafe', amount: 42, daysAgo: 1, accountKey: 'bank', note: 'Weekly settlement' },
  ];

  for (const settlement of settlementEvents) {
    const customer = customerMap[settlement.customerKey];
    const paymentDate = daysAgoAt(settlement.daysAgo, 16, 45);

    customer.outstanding_balance = Math.max(customer.outstanding_balance - settlement.amount, 0);
    customer.payment_status = customer.outstanding_balance > 0 ? 'pending' : 'paid';
    customer.payment_history.push({
      amount: settlement.amount,
      date: paymentDate,
      method: 'bank_transfer',
      reference: `PAY-${settlement.customerKey.toUpperCase()}-${settlement.daysAgo}`,
      note: settlement.note,
    });
    await customer.save();

    await recordAccountMovement({
      accountKey: settlement.accountKey,
      amount: settlement.amount,
      transactionType: 'deposit',
      description: `Customer settlement from ${customer.name}`,
      transactionDate: paymentDate,
    });
  }

  const expenseEvents = [
    { category: 'Rent', amount: 1800, daysAgo: 29, paymentMethod: 'bank_transfer', accountKey: 'bank', description: 'Monthly storefront rent' },
    { category: 'Utilities', amount: 260, daysAgo: 18, paymentMethod: 'bank_transfer', accountKey: 'bank', description: 'Electricity and cold storage power' },
    { category: 'Payroll', amount: 940, daysAgo: 14, paymentMethod: 'bank_transfer', accountKey: 'bank', description: 'Mid-month payroll payout' },
    { category: 'Cleaning', amount: 85, daysAgo: 12, paymentMethod: 'cash', accountKey: 'cash', description: 'Floor cleaning supplies' },
    { category: 'Delivery Fuel', amount: 64, daysAgo: 9, paymentMethod: 'card', accountKey: 'card', description: 'Delivery scooter fuel' },
    { category: 'Maintenance', amount: 145, daysAgo: 6, paymentMethod: 'bank_transfer', accountKey: 'bank', description: 'POS printer maintenance visit' },
    { category: 'Internet', amount: 92, daysAgo: 4, paymentMethod: 'bank_transfer', accountKey: 'bank', description: 'Internet and billing connectivity' },
  ];

  for (const event of expenseEvents) {
    const expenseDate = daysAgoAt(event.daysAgo, 11, 0);
    await Expense.create({
      expense_id: makeDemoId('EXP', `GROCERY-${String(event.daysAgo).padStart(2, '0')}`),
      category: event.category,
      amount: event.amount,
      currency: 'USD',
      date: expenseDate,
      description: event.description,
      payment_method: event.paymentMethod,
      status: 'paid',
      created_by: createdBy,
    });

    await recordAccountMovement({
      accountKey: event.accountKey,
      amount: event.amount,
      transactionType: 'withdraw',
      description: event.description,
      transactionDate: expenseDate,
    });
  }

  const stockAdjustment = await StockAdjustment.create({
    adjustment_id: makeDemoId('ADJ', 'GROCERY-01'),
    product: inventoryMap['BAN-001']._id,
    type: 'decrease',
    quantity: 6,
    reason: 'expired',
    notes: 'Removed overripe bananas from shelf stock',
    date: daysAgoAt(2, 19, 0),
    created_by: createdBy,
  });

  inventoryMap['BAN-001'].quantity = Math.max(inventoryMap['BAN-001'].quantity - 6, 0);
  await syncInventoryStatus(inventoryMap['BAN-001'], daysAgoAt(2, 19, 0));

  await Transaction.create({
    type: 'adjustment',
    status: 'completed',
    date: stockAdjustment.date,
    amount: { total: Number((6 * inventoryMap['BAN-001'].price.cost).toFixed(2)), currency: 'USD' },
    items: [{
      inventory_item: inventoryMap['BAN-001']._id,
      quantity: 6,
      unit_price: inventoryMap['BAN-001'].price.cost,
      total_price: Number((6 * inventoryMap['BAN-001'].price.cost).toFixed(2)),
    }],
    created_by: createdBy,
    reference: {
      order_id: stockAdjustment.adjustment_id,
      notes: stockAdjustment.notes,
    },
  });

  await StockTransfer.create({
    transfer_id: makeDemoId('TRF', 'GROCERY-01'),
    from_warehouse: warehouseMap['Backroom Storage']._id,
    to_warehouse: warehouseMap['Main Store Floor']._id,
    items: [
      { product: inventoryMap['RIC-001']._id, quantity: 4 },
      { product: inventoryMap['COL-001']._id, quantity: 6 },
    ],
    status: 'completed',
    shipping_charges: 0,
    notes: 'Shifted fast movers to store floor before weekend rush',
    date: daysAgoAt(4, 8, 45),
    created_by: createdBy,
  });

  for (const item of Object.values(inventoryMap)) {
    await syncInventoryStatus(item, daysAgoAt(0, 20, 0));
  }

  const lowStockItems = Object.values(inventoryMap)
    .filter((item) => item.quantity <= item.minStockLevel)
    .slice(0, 4);

  for (const [index, item] of lowStockItems.entries()) {
    await Alert.create({
      alert_id: makeDemoId('ALT', `LOW-${index + 1}`),
      type: 'low_stock',
      severity: item.quantity <= 0 ? 'critical' : 'high',
      title: `Low Stock Alert: ${item.name}`,
      message: `Stock level for ${item.name} is ${item.quantity} (Min: ${item.minStockLevel})`,
      entity_type: 'inventory',
      entity_id: item._id,
      entity_name: item.name,
      status: 'active',
      priority: 'high',
      timestamps: {
        created: daysAgoAt(Math.max(index, 1), 8, 15),
      },
      details: {
        current_value: item.quantity,
        threshold_value: item.minStockLevel,
        percentage: item.minStockLevel ? (item.quantity / item.minStockLevel) * 100 : 0,
        location: item.location?.warehouse,
      },
      metadata: {
        source: 'system',
        category: 'inventory',
        tags: ['grocery-demo', 'replenishment'],
      },
    });
  }

  await Alert.create({
    alert_id: makeDemoId('ALT', 'MAINT-01'),
    type: 'maintenance_due',
    severity: 'medium',
    title: `Maintenance Due: ${assets[1].asset_name}`,
    message: `Scheduled maintenance is due for ${assets[1].asset_name}`,
    entity_type: 'asset',
    entity_id: assets[1]._id,
    entity_name: assets[1].asset_name,
    status: 'active',
    priority: 'medium',
    timestamps: {
      created: daysAgoAt(2, 7, 45),
      due_date: assets[1].maintenance.nextMaintenanceDue,
    },
    details: {
      location: assets[1].location?.building,
      department: assets[1].assigned_to?.department,
    },
    metadata: {
      source: 'system',
      category: 'maintenance',
      tags: ['grocery-demo'],
    },
  });

  await Alert.create({
    alert_id: makeDemoId('ALT', 'AI-01'),
    type: 'ai_prediction',
    severity: 'medium',
    title: 'Weekend demand spike forecast',
    message: 'The system expects higher beverage and dairy demand over the next 3 days based on the last month of basket trends.',
    entity_type: 'system',
    entity_id: inventoryMap['MLK-001']._id,
    entity_name: 'Grocery Demand Forecast',
    status: 'active',
    priority: 'medium',
    created_by: createdBy,
    timestamps: {
      created: daysAgoAt(1, 7, 30),
      due_date: daysAgoAt(0, 18, 0),
    },
    metadata: {
      source: 'ai',
      category: 'forecasting',
      tags: ['grocery-demo', 'demand'],
    },
  });

  await Promise.all(customers.map((customer) => customer.save()));
  await Promise.all(accounts.map((account) => account.save()));

  const activeAlerts = await Alert.countDocuments({ status: 'active' });

  return {
    warehouses: warehouses.length,
    suppliers: suppliers.length,
    customers: customers.length,
    inventoryItems: inventoryItems.length,
    purchases: purchases.length,
    sales: sales.length,
    expenses: expenseEvents.length,
    assets: assets.length,
    activeAlerts,
    paymentAccounts: accounts.length,
    lowStockSkus: lowStockItems.map((item) => item.sku),
  };
};

module.exports = seedGroceryStoreMonth;
