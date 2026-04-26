// Comprehensive Customer Data for Smart Inventory System
// Customer Ledger, Sales History, Due Payments, Analytics, Communication, Alerts

const generateDuePayments = (customerId) => {
  const payments = [];
  
  // Generate sample due payments
  const paymentTypes = ['Invoice', 'Loan', 'Credit', 'Service Fee', 'Subscription'];
  const priorities = ['high', 'medium', 'low'];
  const statuses = ['overdue', 'upcoming', 'pending'];
  
  // Generate 3-5 due payments per customer
  const numPayments = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < numPayments; i++) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) - 30); // -30 to +30 days
    
    const amount = Math.floor(Math.random() * 5000) + 500; // $500 - $5500
    
    payments.push({
      _id: `PAY_${customerId}_${i + 1}`,
      customerId,
      customerName: `Customer ${customerId}`,
      customerEmail: `customer${customerId}@example.com`,
      customerPhone: `+123456789${i}`,
      type: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      amount,
      dueDate: dueDate.toISOString(),
      status: Math.random() > 0.6 ? 'overdue' : (Math.random() > 0.3 ? 'upcoming' : 'pending'),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      description: `Payment for ${paymentTypes[Math.floor(Math.random() * paymentTypes.length)]} #${Math.floor(Math.random() * 1000) + 1}`,
      createdAt: new Date(dueDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return payments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

const generateCustomerLedger = (customerId) => {
  const ledgerEntries = [];
  let runningBalance = 0;
  let entryId = 1;

  // Generate opening balance
  const openingDate = new Date('2024-01-01');
  ledgerEntries.push({
    id: `LED_${customerId}_${String(entryId).padStart(3, '0')}`,
    date: openingDate.toISOString().split('T')[0],
    reference: 'OPEN-2024',
    description: 'Opening Balance - Fiscal Year 2024',
    debit: 0,
    credit: 0,
    runningBalance: 0,
    type: 'opening',
    status: 'completed'
  });
  entryId++;

  // Generate realistic transactions throughout the year
  const transactionTypes = [
    { type: 'sale', weight: 40, description: 'Product Purchase', prefix: 'SALE' },
    { type: 'payment', weight: 30, description: 'Payment Received', prefix: 'PAY' },
    { type: 'credit', weight: 10, description: 'Credit Note', prefix: 'CR' },
    { type: 'debit', weight: 10, description: 'Debit Note', prefix: 'DR' },
    { type: 'refund', weight: 5, description: 'Refund', prefix: 'REF' },
    { type: 'adjustment', weight: 5, description: 'Balance Adjustment', prefix: 'ADJ' }
  ];

  const products = [
    'Laptop Pro 15"', 'Wireless Mouse', 'Mechanical Keyboard RGB', 'USB-C Hub',
    'Monitor 4K', 'Webcam HD', 'Headphones Bluetooth', 'External SSD 1TB',
    'Office Chair Ergonomic', 'Desk Lamp LED', 'Cable Management Set', 'Power Bank'
  ];

  // Generate 15-25 transactions over the year
  const numTransactions = Math.floor(Math.random() * 11) + 15;
  
  for (let i = 0; i < numTransactions; i++) {
    const transactionDate = new Date(openingDate);
    transactionDate.setDate(transactionDate.getDate() + Math.floor(Math.random() * 365));
    
    // Select transaction type based on weights
    const random = Math.random() * 100;
    let accumulated = 0;
    let selectedType = transactionTypes[0];
    
    for (const tType of transactionTypes) {
      accumulated += tType.weight;
      if (random <= accumulated) {
        selectedType = tType;
        break;
      }
    }

    let amount = 0;
    let description = selectedType.description;

    switch (selectedType.type) {
      case 'sale':
        amount = Math.floor(Math.random() * 10000) + 500; // $500 - $10500
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        description = `${product} x${quantity}`;
        runningBalance += amount;
        break;
      case 'payment':
        amount = Math.floor(Math.random() * Math.min(runningBalance, 8000)) + 1000; // $1000 - $8000 or remaining balance
        runningBalance -= amount;
        break;
      case 'credit':
        amount = Math.floor(Math.random() * 2000) + 100; // $100 - $2100
        runningBalance -= amount;
        description = `Credit Note - ${products[Math.floor(Math.random() * products.length)]} Return`;
        break;
      case 'debit':
        amount = Math.floor(Math.random() * 1500) + 200; // $200 - $1700
        runningBalance += amount;
        description = `Debit Note - Additional Charges`;
        break;
      case 'refund':
        amount = Math.floor(Math.random() * 3000) + 500; // $500 - $3500
        runningBalance -= amount;
        description = `Refund - Order Cancellation`;
        break;
      case 'adjustment':
        amount = Math.floor(Math.random() * 1000) - 500; // -$500 to $500
        runningBalance += amount;
        description = amount > 0 ? 'Late Fee Adjustment' : 'Early Payment Discount';
        break;
    }

    // Ensure balance doesn't go negative
    if (runningBalance < 0) {
      runningBalance = 0;
      if (selectedType.type === 'payment' || selectedType.type === 'credit' || selectedType.type === 'refund') {
        continue; // Skip this transaction
      }
    }

    const reference = `${selectedType.prefix}-${2024}-${String(entryId - 1).padStart(3, '0')}`;
    
    ledgerEntries.push({
      id: `LED_${customerId}_${String(entryId).padStart(3, '0')}`,
      date: transactionDate.toISOString().split('T')[0],
      reference,
      description,
      debit: (selectedType.type === 'sale' || selectedType.type === 'debit' || selectedType.type === 'adjustment' && amount > 0) ? Math.abs(amount) : 0,
      credit: (selectedType.type === 'payment' || selectedType.type === 'credit' || selectedType.type === 'refund' || selectedType.type === 'adjustment' && amount < 0) ? Math.abs(amount) : 0,
      runningBalance,
      type: selectedType.type,
      status: 'completed'
    });
    entryId++;
  }

  // Add current balance entry
  const currentDate = new Date();
  ledgerEntries.push({
    id: `LED_${customerId}_${String(entryId).padStart(3, '0')}`,
    date: currentDate.toISOString().split('T')[0],
    reference: 'BAL-CURR',
    description: 'Current Balance',
    debit: 0,
    credit: 0,
    runningBalance,
    type: 'balance',
    status: 'active'
  });

  return ledgerEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const generateSalesHistory = (customerId) => {
  return [
    {
      _id: `SALE_${customerId}_001`,
      sale_id: 'SALE-2024-001',
      sale_date: '2024-01-20',
      total_amount: 25999.80,
      status: 'completed',
      items: [
        { 
          name: 'Laptop Pro 15"', 
          quantity: 20, 
          unit_price: 1299.99, 
          total: 25999.80,
          sku: 'LP-001',
          category: 'Electronics',
          discount: 0,
          tax: 2599.98
        }
      ],
      payment_status: 'partial',
      paid_amount: 15000.00,
      balance_amount: 10999.80,
      payment_method: 'bank_transfer',
      payment_terms: 'net30',
      sales_rep: 'John Smith',
      delivery_address: '123 Business St, Suite 100, City, State 12345',
      shipping_method: 'standard',
      tracking_number: 'TRK123456789',
      notes: 'Bulk order discount applied',
      created_at: '2024-01-20T10:30:00Z',
      updated_at: '2024-01-20T14:45:00Z'
    },
    {
      _id: `SALE_${customerId}_002`,
      sale_id: 'SALE-2024-002',
      sale_date: '2024-02-15',
      total_amount: 3299.76,
      status: 'completed',
      items: [
        { 
          name: 'Wireless Mouse', 
          quantity: 50, 
          unit_price: 29.99, 
          total: 1499.50,
          sku: 'WM-002',
          category: 'Accessories',
          discount: 5,
          tax: 142.45
        },
        { 
          name: 'Mechanical Keyboard RGB', 
          quantity: 60, 
          unit_price: 29.99, 
          total: 1799.40,
          sku: 'KB-003',
          category: 'Accessories',
          discount: 10,
          tax: 161.95
        }
      ],
      payment_status: 'pending',
      paid_amount: 0,
      balance_amount: 3299.76,
      payment_method: 'credit_card',
      payment_terms: 'net15',
      sales_rep: 'Sarah Johnson',
      delivery_address: '456 Commerce Ave, Floor 2, City, State 12345',
      shipping_method: 'express',
      tracking_number: 'TRK987654321',
      notes: 'Rush order requested',
      created_at: '2024-02-15T09:15:00Z',
      updated_at: '2024-02-15T11:30:00Z'
    },
    {
      _id: `SALE_${customerId}_003`,
      sale_id: 'SALE-2024-003',
      sale_date: '2024-03-01',
      total_amount: 7799.28,
      status: 'completed',
      items: [
        { 
          name: 'Monitor 4K Ultra HD', 
          quantity: 6, 
          unit_price: 1299.88, 
          total: 7799.28,
          sku: 'MN-004',
          category: 'Electronics',
          discount: 0,
          tax: 779.93
        }
      ],
      payment_status: 'partial',
      paid_amount: 5000.00,
      balance_amount: 2799.28,
      payment_method: 'wire_transfer',
      payment_terms: 'net30',
      sales_rep: 'Mike Davis',
      delivery_address: '789 Tech Park Blvd, Building A, City, State 12345',
      shipping_method: 'overnight',
      tracking_number: 'TRK555111222',
      notes: 'Premium customer - expedited shipping',
      created_at: '2024-03-01T13:45:00Z',
      updated_at: '2024-03-01T16:20:00Z'
    },
    {
      _id: `SALE_${customerId}_004`,
      sale_id: 'SALE-2024-004',
      sale_date: '2024-04-01',
      total_amount: 4599.90,
      status: 'completed',
      items: [
        { 
          name: 'Office Chair Ergonomic', 
          quantity: 10, 
          unit_price: 299.99, 
          total: 2999.90,
          sku: 'CH-005',
          category: 'Furniture',
          discount: 15,
          tax: 254.99
        },
        { 
          name: 'Desk Lamp LED', 
          quantity: 20, 
          unit_price: 80.00, 
          total: 1600.00,
          sku: 'DL-006',
          category: 'Lighting',
          discount: 5,
          tax: 152.00
        }
      ],
      payment_status: 'pending',
      paid_amount: 0,
      balance_amount: 4599.90,
      payment_method: 'credit_card',
      payment_terms: 'net15',
      sales_rep: 'Emily Wilson',
      delivery_address: '321 Office Park Dr, Suite 500, City, State 12345',
      shipping_method: 'standard',
      tracking_number: 'TRK333777999',
      notes: 'Bulk office furniture order',
      created_at: '2024-04-01T10:00:00Z',
      updated_at: '2024-04-01T12:15:00Z'
    },
    {
      _id: `SALE_${customerId}_005`,
      sale_id: 'SALE-2024-005',
      sale_date: '2024-04-15',
      total_amount: 8999.70,
      status: 'processing',
      items: [
        { 
          name: 'Standing Desk Electric', 
          quantity: 3, 
          unit_price: 2999.90, 
          total: 8999.70,
          sku: 'SD-006',
          category: 'Furniture',
          discount: 5,
          tax: 899.97
        }
      ],
      payment_status: 'partial',
      paid_amount: 4500.00,
      balance_amount: 4499.70,
      payment_method: 'bank_transfer',
      payment_terms: 'net45',
      sales_rep: 'John Smith',
      delivery_address: '555 Corporate Way, Floor 10, City, State 12345',
      shipping_method: 'white_glove',
      tracking_number: 'TRK888444666',
      notes: 'Installation service included',
      created_at: '2024-04-15T11:20:00Z',
      updated_at: '2024-04-16T09:45:00Z'
    }
  ];
};

const generateProductPattern = (customerId) => {
  return [
    { name: 'Laptop Pro 15"', quantity: 20, revenue: 25999.80, percentage: 45.2 },
    { name: 'Mechanical Keyboard RGB', quantity: 120, revenue: 15599.40, percentage: 27.1 },
    { name: 'Wireless Mouse', quantity: 50, revenue: 1499.50, percentage: 2.6 },
    { name: 'Office Chair', quantity: 10, revenue: 2999.90, percentage: 5.2 },
    { name: 'Desk Lamp', quantity: 20, revenue: 1600.00, percentage: 2.8 },
    { name: 'Other Accessories', quantity: 35, revenue: 9700.15, percentage: 16.9 }
  ];
};

const generateCommunicationLog = (customerId) => {
  return [
    {
      id: `COMM_${customerId}_001`,
      type: 'call',
      subject: 'Initial consultation',
      content: 'Customer inquired about bulk pricing for laptop orders. Discussed volume discounts and delivery options.',
      created_at: '2024-01-18T10:30:00Z',
      created_by: 'John Smith',
      priority: 'normal'
    },
    {
      id: `COMM_${customerId}_002`,
      type: 'email',
      subject: 'Quotation for Laptop Pro 15"',
      content: 'Sent detailed quotation for 20 units of Laptop Pro 15" with special pricing. Customer requested delivery timeline.',
      created_at: '2024-01-19T14:15:00Z',
      created_by: 'Sarah Johnson',
      priority: 'high'
    },
    {
      id: `COMM_${customerId}_003`,
      type: 'meeting',
      subject: 'Contract discussion',
      content: 'Met with customer to discuss long-term supply agreement. Customer interested in quarterly bulk orders.',
      created_at: '2024-01-25T11:00:00Z',
      created_by: 'Mike Wilson',
      priority: 'high'
    },
    {
      id: `COMM_${customerId}_004`,
      type: 'call',
      subject: 'Payment follow-up',
      content: 'Called customer regarding outstanding payment for SALE-2024-001. Customer promised payment by end of week.',
      created_at: '2024-02-05T09:45:00Z',
      created_by: 'Lisa Chen',
      priority: 'normal'
    },
    {
      id: `COMM_${customerId}_005`,
      type: 'email',
      subject: 'New product announcement',
      content: 'Informed customer about new Mechanical Keyboard RGB model with enhanced features. Customer showed interest.',
      created_at: '2024-02-20T16:30:00Z',
      created_by: 'David Brown',
      priority: 'low'
    },
    {
      id: `COMM_${customerId}_006`,
      type: 'note',
      subject: 'Customer feedback',
      content: 'Customer provided positive feedback on product quality. Mentioned interest in expanding partnership.',
      created_at: '2024-03-10T13:20:00Z',
      created_by: 'Emily Davis',
      priority: 'normal'
    }
  ];
};

const generateAlerts = (customerId) => {
  return [
    {
      id: `ALERT_${customerId}_001`,
      type: 'payment_due',
      title: 'Payment Overdue',
      message: 'Payment of $10,999.80 for invoice SALE-2024-001 is overdue by 15 days',
      severity: 'high',
      created_at: '2024-02-15T00:00:00Z',
      due_date: '2024-02-01T00:00:00Z',
      status: 'active',
      customer_id: customerId
    },
    {
      id: `ALERT_${customerId}_002`,
      type: 'follow_up',
      title: 'Follow-up Required',
      message: 'Schedule follow-up call for potential new order',
      severity: 'medium',
      created_at: '2024-03-01T00:00:00Z',
      due_date: '2024-03-15T00:00:00Z',
      status: 'pending',
      customer_id: customerId
    },
    {
      id: `ALERT_${customerId}_003`,
      type: 'credit_limit',
      title: 'Credit Limit Warning',
      message: 'Customer has reached 75% of credit limit',
      severity: 'medium',
      created_at: '2024-03-20T00:00:00Z',
      due_date: '2024-04-01T00:00:00Z',
      status: 'active',
      customer_id: customerId
    },
    {
      id: `ALERT_${customerId}_004`,
      type: 'birthday',
      title: 'Customer Birthday',
      message: 'Customer birthday approaching - send greeting and special offer',
      severity: 'low',
      created_at: '2024-03-25T00:00:00Z',
      due_date: '2024-04-10T00:00:00Z',
      status: 'scheduled',
      customer_id: customerId
    }
  ];
};

const generateCustomerAnalytics = () => {
  return {
    totalCustomers: 13,
    activeCustomers: 11,
    totalRevenue: 245678.90,
    averageOrderValue: 3456.78,
    topCustomers: [
      { name: 'ABC Corporation', totalSpent: 45000.00, orders: 8, lastOrder: '2024-04-15' },
      { name: 'Tech Solutions Inc.', totalSpent: 38000.00, orders: 12, lastOrder: '2024-04-10' },
      { name: 'SuperMart Chain', totalSpent: 32000.00, orders: 15, lastOrder: '2024-04-08' },
      { name: 'Government Agency', totalSpent: 28000.00, orders: 6, lastOrder: '2024-04-05' },
      { name: 'Medical Equipment Co.', totalSpent: 25000.00, orders: 9, lastOrder: '2024-04-01' }
    ],
    frequentBuyers: [
      { name: 'XYZ Retail Store', totalPurchases: 15, avgOrderValue: 2345.67 },
      { name: 'Small Business LLC', totalPurchases: 12, avgOrderValue: 1890.45 },
      { name: 'Startup Innovations Lab', totalPurchases: 10, avgOrderValue: 3456.78 },
      { name: 'University Campus Store', totalPurchases: 8, avgOrderValue: 5678.90 },
      { name: 'Restaurant Group LLC', totalPurchases: 7, avgOrderValue: 1234.56 }
    ],
    segmentDistribution: [
      { name: 'Corporate', value: 45, color: '#2563eb' },
      { name: 'Retail', value: 25, color: '#16a34a' },
      { name: 'Small Business', value: 20, color: '#f59e0b' },
      { name: 'Government', value: 7, color: '#7c3aed' },
      { name: 'Education', value: 3, color: '#ef4444' }
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 }
    ],
    paymentStatus: {
      paid: 65,
      pending: 25,
      overdue: 10
    }
  };
};

const generateImportExportData = () => {
  return {
    importHistory: [
      {
        id: 'IMPORT_001',
        filename: 'customers_2024_01.csv',
        importDate: '2024-01-15T10:30:00Z',
        records: 150,
        success: 145,
        failed: 5,
        status: 'completed',
        importedBy: 'John Smith'
      },
      {
        id: 'IMPORT_002',
        filename: 'customers_2024_02.csv',
        importDate: '2024-02-20T14:15:00Z',
        records: 200,
        success: 198,
        failed: 2,
        status: 'completed',
        importedBy: 'Sarah Johnson'
      }
    ],
    exportHistory: [
      {
        id: 'EXPORT_001',
        filename: 'customer_ledger_2024_04.csv',
        exportDate: '2024-04-01T09:00:00Z',
        records: 13,
        type: 'ledger',
        status: 'completed',
        exportedBy: 'Mike Wilson'
      },
      {
        id: 'EXPORT_002',
        filename: 'customer_contacts_2024_04.csv',
        exportDate: '2024-04-10T11:30:00Z',
        records: 13,
        type: 'contacts',
        status: 'completed',
        exportedBy: 'Lisa Chen'
      }
    ],
    templates: [
      {
        name: 'Customer Import Template',
        description: 'Template for importing customer data',
        fields: ['name', 'email', 'phone', 'company_name', 'address', 'gst_number'],
        required: ['name', 'email', 'phone']
      },
      {
        name: 'Customer Export Template',
        description: 'Template for exporting customer data',
        fields: ['name', 'email', 'phone', 'company_name', 'total_spent', 'last_purchase_date'],
        optional: true
      }
    ]
  };
};

const generateTagsAndSegments = () => {
  return {
    tags: [
      { id: 'TAG_001', name: 'VIP', color: '#7c3aed', count: 3 },
      { id: 'TAG_002', name: 'High-Value', color: '#2563eb', count: 5 },
      { id: 'TAG_003', name: 'Regular', color: '#16a34a', count: 7 },
      { id: 'TAG_004', name: 'New', color: '#f59e0b', count: 2 },
      { id: 'TAG_005', name: 'Inactive', color: '#ef4444', count: 2 },
      { id: 'TAG_006', name: 'Wholesale', color: '#8b5cf6', count: 4 },
      { id: 'TAG_007', name: 'Retail', color: '#10b981', count: 6 },
      { id: 'TAG_008', name: 'Government', color: '#f59e0b', count: 1 },
      { id: 'TAG_009', name: 'Education', color: '#3b82f6', count: 1 },
      { id: 'TAG_010', name: 'Healthcare', color: '#06b6d4', count: 1 }
    ],
    segments: [
      {
        id: 'SEG_001',
        name: 'Enterprise',
        description: 'Large corporate clients with annual revenue > $1M',
        criteria: 'total_spent > 25000 AND company_type = "corporate"',
        customerCount: 4,
        avgOrderValue: 8900.00,
        totalRevenue: 145000.00
      },
      {
        id: 'SEG_002',
        name: 'Small Business',
        description: 'Small to medium businesses',
        criteria: 'total_spent BETWEEN 5000 AND 25000',
        customerCount: 6,
        avgOrderValue: 3450.00,
        totalRevenue: 78000.00
      },
      {
        id: 'SEG_003',
        name: 'Individual',
        description: 'Individual customers and freelancers',
        criteria: 'total_spent < 5000',
        customerCount: 3,
        avgOrderValue: 1200.00,
        totalRevenue: 22678.90
      }
    ],
    customerTags: [
      { customerId: 'CUST_001', tags: ['VIP', 'High-Value', 'Corporate'] },
      { customerId: 'CUST_002', tags: ['Regular', 'Retail', 'Wholesale'] },
      { customerId: 'CUST_003', tags: ['Regular', 'Small Business'] },
      { customerId: 'CUST_004', tags: ['High-Value', 'Corporate', 'Technology'] },
      { customerId: 'CUST_005', tags: ['Regular', 'Education', 'New'] },
      { customerId: 'CUST_006', tags: ['High-Value', 'Healthcare', 'VIP'] },
      { customerId: 'CUST_007', tags: ['High-Value', 'Retail', 'Chain'] },
      { customerId: 'CUST_008', tags: ['High-Value', 'Government', 'Enterprise'] },
      { customerId: 'CUST_009', tags: ['Regular', 'Technology', 'New'] },
      { customerId: 'CUST_010', tags: ['Regular', 'Professional', 'Services'] },
      { customerId: 'CUST_011', tags: ['High-Value', 'Manufacturing', 'Industrial'] },
      { customerId: 'CUST_012', tags: ['Regular', 'Hospitality', 'Food Service'] },
      { customerId: 'CUST_013', tags: ['High-Value', 'Logistics', 'Transportation'] }
    ]
  };
};

// Export all data generators
export {
  generateDuePayments,
  generateCustomerLedger,
  generateSalesHistory,
  generateProductPattern,
  generateCommunicationLog,
  generateAlerts,
  generateCustomerAnalytics,
  generateImportExportData,
  generateTagsAndSegments
};
