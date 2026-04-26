
const mockData = 
  "products": [
    {
      "_id": "INV_001",
      "item_id": "INV_LAPTOP_001",
      "name": "Laptop Pro 15\"",
      "description": "High-performance laptop with 15\" display, 16GB RAM, 512GB SSD",
      "category": "Electronics",
      "brand": "TechBrand",
      "sku": "LP-001",
      "price": {
        "cost": 899.99,
        "selling": 1299.99
      },
      "quantity": 25,
      "minStock": 5,
      "maxStock": 50,
      "reorderPoint": 5,
      "reorderQuantity": 45,
      "unit": "pieces",
      "supplier": "Tech Supplies Inc.",
      "location": {
        "warehouse": "Main Warehouse",
        "aisle": "A3",
        "shelf": "S12",
        "bin": "B05"
      },
      "tags": [
        "electronics",
        "laptop",
        "computer"
      ],
      "specifications": {
        "screen": "15.6\"",
        "processor": "Intel i7",
        "ram": "16GB",
        "storage": "512GB SSD"
      },
      "warrantyPeriod": 24,
      "warrantyType": "manufacturer",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "INV_002",
      "item_id": "INV_MOUSE_002",
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse with precision tracking",
      "category": "Computer Hardware",
      "brand": "MouseCo",
      "sku": "WM-002",
      "price": {
        "cost": 15.99,
        "selling": 29.99
      },
      "quantity": 150,
      "minStock": 20,
      "maxStock": 200,
      "reorderPoint": 20,
      "reorderQuantity": 180,
      "unit": "pieces",
      "supplier": "Tech Supplies Inc.",
      "location": {
        "warehouse": "Main Warehouse",
        "aisle": "B2",
        "shelf": "S08",
        "bin": "B15"
      },
      "tags": [
        "computer",
        "mouse",
        "wireless"
      ],
      "warrantyPeriod": 12,
      "warrantyType": "manufacturer",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "INV_003",
      "item_id": "INV_KEYBOARD_011",
      "name": "Mechanical Keyboard RGB",
      "description": "RGB mechanical keyboard with blue switches",
      "category": "Computer Hardware",
      "brand": "KeyMaster",
      "sku": "KB-011",
      "price": {
        "cost": 79.99,
        "selling": 129.99
      },
      "quantity": 60,
      "minStock": 15,
      "maxStock": 100,
      "reorderPoint": 15,
      "reorderQuantity": 80,
      "unit": "pieces",
      "supplier": "Tech Supplies Inc.",
      "location": {
        "warehouse": "Main Warehouse",
        "aisle": "B4",
        "shelf": "S16",
        "bin": "B20"
      },
      "tags": [
        "keyboard",
        "mechanical",
        "rgb"
      ],
      "warrantyPeriod": 24,
      "warrantyType": "manufacturer",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "INV_004",
      "item_id": "INV_MONITOR_012",
      "name": "4K Monitor 27\"",
      "description": "27-inch 4K UHD monitor with HDR",
      "category": "Electronics",
      "brand": "ViewTech",
      "sku": "MN-012",
      "price": {
        "cost": 299.99,
        "selling": 499.99
      },
      "quantity": 20,
      "minStock": 5,
      "maxStock": 40,
      "reorderPoint": 5,
      "reorderQuantity": 35,
      "unit": "pieces",
      "supplier": "Tech Supplies Inc.",
      "location": {
        "warehouse": "Main Warehouse",
        "aisle": "A5",
        "shelf": "S18",
        "bin": "B08"
      },
      "tags": [
        "monitor",
        "4k",
        "hdr"
      ],
      "warrantyPeriod": 36,
      "warrantyType": "manufacturer",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "INV_005",
      "item_id": "INV_TABLET_013",
      "name": "Tablet Pro 10\"",
      "description": "10-inch professional tablet with stylus support",
      "category": "Mobile Devices",
      "brand": "TabTech",
      "sku": "TB-013",
      "price": {
        "cost": 399.99,
        "selling": 599.99
      },
      "quantity": 30,
      "minStock": 8,
      "maxStock": 60,
      "reorderPoint": 8,
      "reorderQuantity": 50,
      "unit": "pieces",
      "supplier": "Electronics World",
      "location": {
        "warehouse": "Main Warehouse",
        "aisle": "C1",
        "shelf": "S10",
        "bin": "B12"
      },
      "tags": [
        "tablet",
        "mobile",
        "stylus"
      ],
      "warrantyPeriod": 24,
      "warrantyType": "manufacturer",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    }
  ],
  "categories": [
    {
      "_id": "CAT_001",
      "name": "Electronics",
      "description": "Electronic devices and components",
      "color": "#3B82F6",
      "icon": "cpu",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CAT_002",
      "name": "Computer Hardware",
      "description": "Computer parts and peripherals",
      "color": "#10B981",
      "icon": "monitor",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CAT_003",
      "name": "Mobile Devices",
      "description": "Smartphones and tablets",
      "color": "#EF4444",
      "icon": "smartphone",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CAT_004",
      "name": "Office Supplies",
      "description": "Stationery and office items",
      "color": "#8B5CF6",
      "icon": "briefcase",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    }
  ],
  "customers": [
    {
      "_id": "CUST_001",
      "customer_id": "CUST_ABC_001",
      "name": "ABC Corporation",
      "email": "purchasing@abc.com",
      "phone": "+1234567893",
      "address": {
        "street": "100 Business Park",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "USA"
      },
      "company_name": "ABC Corporation",
      "gst_number": "GST123456789",
      "credit_limit": 50000,
      "current_balance": 15000,
      "payment_status": "pending",
      "rating": 4.7,
      "tags": [
        "corporate",
        "bulk",
        "regular"
      ],
      "notes": "Major corporate client with bulk purchasing needs",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_002",
      "customer_id": "CUST_XYZ_002",
      "name": "XYZ Retail Store",
      "email": "orders@xyzretail.com",
      "phone": "+1234567894",
      "address": {
        "street": "200 Shopping Mall",
        "city": "Houston",
        "state": "TX",
        "zip": "77001",
        "country": "USA"
      },
      "company_name": "XYZ Retail Store",
      "gst_number": "GST987654321",
      "credit_limit": 25000,
      "current_balance": 8000,
      "payment_status": "paid",
      "rating": 4.3,
      "tags": [
        "retail",
        "regular",
        "electronics"
      ],
      "notes": "Electronics retail store with regular orders",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_003",
      "customer_id": "CUST_SMALL_003",
      "name": "Small Business LLC",
      "email": "contact@smallbusiness.com",
      "phone": "+1234567895",
      "address": {
        "street": "300 Main Street",
        "city": "Phoenix",
        "state": "AZ",
        "zip": "85001",
        "country": "USA"
      },
      "company_name": "Small Business LLC",
      "gst_number": "GST456123789",
      "credit_limit": 10000,
      "current_balance": 2500,
      "payment_status": "paid",
      "rating": 4.9,
      "tags": [
        "small_business",
        "regular"
      ],
      "notes": "Local small business with consistent orders",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_004",
      "customer_id": "CUST_TECH_004",
      "name": "Tech Solutions Inc.",
      "email": "info@techsolutions.com",
      "phone": "+1234567896",
      "address": {
        "street": "400 Tech Boulevard",
        "city": "Seattle",
        "state": "WA",
        "zip": "98101",
        "country": "USA"
      },
      "company_name": "Tech Solutions Inc.",
      "gst_number": "GST789456123",
      "credit_limit": 75000,
      "current_balance": 22000,
      "payment_status": "pending",
      "rating": 4.6,
      "tags": [
        "technology",
        "enterprise",
        "software"
      ],
      "notes": "Technology consulting firm with regular hardware purchases",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_005",
      "customer_id": "CUST_EDU_005",
      "name": "University Campus Store",
      "email": "orders@campusstore.edu",
      "phone": "+1234567897",
      "address": {
        "street": "500 University Avenue",
        "city": "Boston",
        "state": "MA",
        "zip": "02101",
        "country": "USA"
      },
      "company_name": "University Campus Store",
      "gst_number": "GST321654987",
      "credit_limit": 30000,
      "current_balance": 5000,
      "payment_status": "paid",
      "rating": 4.8,
      "tags": [
        "education",
        "bulk",
        "seasonal"
      ],
      "notes": "Educational institution with bulk orders at start of semesters",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_006",
      "customer_id": "CUST_MED_006",
      "name": "Medical Equipment Co.",
      "email": "purchasing@medicalequip.com",
      "phone": "+1234567898",
      "address": {
        "street": "600 Health Center Drive",
        "city": "Miami",
        "state": "FL",
        "zip": "33101",
        "country": "USA"
      },
      "company_name": "Medical Equipment Co.",
      "gst_number": "GST654987321",
      "credit_limit": 100000,
      "current_balance": 45000,
      "payment_status": "pending",
      "rating": 4.4,
      "tags": [
        "healthcare",
        "medical",
        "equipment"
      ],
      "notes": "Medical equipment supplier with specialized needs",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_007",
      "customer_id": "CUST_RETAIL_007",
      "name": "SuperMart Chain",
      "email": "procurement@supermart.com",
      "phone": "+1234567899",
      "address": {
        "street": "700 Retail Plaza",
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90001",
        "country": "USA"
      },
      "company_name": "SuperMart Chain",
      "gst_number": "GST987321654",
      "credit_limit": 150000,
      "current_balance": 75000,
      "payment_status": "paid",
      "rating": 4.2,
      "tags": [
        "retail",
        "chain",
        "large_volume"
      ],
      "notes": "Large retail chain with multiple locations",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_008",
      "customer_id": "CUST_GOV_008",
      "name": "Government Agency",
      "email": "contracts@govagency.gov",
      "phone": "+1234567900",
      "address": {
        "street": "800 Federal Building",
        "city": "Washington",
        "state": "DC",
        "zip": "20001",
        "country": "USA"
      },
      "company_name": "Government Agency",
      "gst_number": "GST147258369",
      "credit_limit": 200000,
      "current_balance": 100000,
      "payment_status": "pending",
      "rating": 4.1,
      "tags": [
        "government",
        "contract",
        "bulk"
      ],
      "notes": "Federal government agency with large procurement contracts",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_009",
      "customer_id": "CUST_STARTUP_009",
      "name": "Startup Innovations Lab",
      "email": "hello@startuplab.io",
      "phone": "+1234567901",
      "address": {
        "street": "900 Innovation Drive",
        "city": "Austin",
        "state": "TX",
        "zip": "78701",
        "country": "USA"
      },
      "company_name": "Startup Innovations Lab",
      "gst_number": "GST258369147",
      "credit_limit": 15000,
      "current_balance": 3000,
      "payment_status": "paid",
      "rating": 4.7,
      "tags": [
        "startup",
        "technology",
        "innovation"
      ],
      "notes": "Tech startup with rapid growth and evolving needs",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_010",
      "customer_id": "CUST_CONSULT_010",
      "name": "Consulting Partners LLC",
      "email": "admin@consultingpartners.com",
      "phone": "+1234567902",
      "address": {
        "street": "1000 Business Tower",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "company_name": "Consulting Partners LLC",
      "gst_number": "GST369147258",
      "credit_limit": 25000,
      "current_balance": 8000,
      "payment_status": "paid",
      "rating": 4.5,
      "tags": [
        "consulting",
        "professional",
        "services"
      ],
      "notes": "Business consulting firm with office equipment needs",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_011",
      "customer_id": "CUST_MANUFACTURE_011",
      "name": "Manufacturing Pro Inc.",
      "email": "procurement@manufacturingpro.com",
      "phone": "+1234567903",
      "address": {
        "street": "1100 Industrial Park",
        "city": "Detroit",
        "state": "MI",
        "zip": "48201",
        "country": "USA"
      },
      "company_name": "Manufacturing Pro Inc.",
      "gst_number": "GST741852963",
      "credit_limit": 80000,
      "current_balance": 35000,
      "payment_status": "pending",
      "rating": 4.3,
      "tags": [
        "manufacturing",
        "industrial",
        "equipment"
      ],
      "notes": "Manufacturing company with industrial equipment requirements",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_012",
      "customer_id": "CUST_RESTAURANT_012",
      "name": "Restaurant Group LLC",
      "email": "orders@restaurantgroup.com",
      "phone": "+1234567904",
      "address": {
        "street": "1200 Food Court",
        "city": "Orlando",
        "state": "FL",
        "zip": "32801",
        "country": "USA"
      },
      "company_name": "Restaurant Group LLC",
      "gst_number": "GST852963741",
      "credit_limit": 20000,
      "current_balance": 6000,
      "payment_status": "paid",
      "rating": 4.6,
      "tags": [
        "restaurant",
        "hospitality",
        "food_service"
      ],
      "notes": "Restaurant group with multiple locations and POS needs",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CUST_013",
      "customer_id": "CUST_LOGISTICS_013",
      "name": "Logistics Solutions Co.",
      "email": "purchasing@logisticsco.com",
      "phone": "+1234567905",
      "address": {
        "street": "1300 Distribution Center",
        "city": "Atlanta",
        "state": "GA",
        "zip": "30301",
        "country": "USA"
      },
      "company_name": "Logistics Solutions Co.",
      "gst_number": "GST963741852",
      "credit_limit": 60000,
      "current_balance": 28000,
      "payment_status": "pending",
      "rating": 4.4,
      "tags": [
        "logistics",
        "transportation",
        "warehouse"
      ],
      "notes": "Logistics company with tracking and warehouse management needs",
      "isActive": true,
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    }
  ],
  "contacts": [
    {
      "_id": "CONT_001",
      "contact_id": "CONT_001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "mobile": "+1234567891",
      "company": "ABC Corporation",
      "job_title": "Purchasing Manager",
      "department": "Procurement",
      "address": {
        "street": "100 Business Park",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "USA"
      },
      "contact_type": "customer",
      "category": "Electronics",
      "tags": [
        "corporate",
        "purchasing"
      ],
      "is_active": true,
      "is_favorite": false,
      "last_contacted": "2024-04-19T14:30:00Z",
      "notes": "Primary contact for bulk purchases",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CONT_002",
      "contact_id": "CONT_002",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1234567892",
      "mobile": "+1234567893",
      "company": "XYZ Retail Store",
      "job_title": "Store Manager",
      "department": "Management",
      "address": {
        "street": "200 Shopping Mall",
        "city": "Houston",
        "state": "TX",
        "zip": "77001",
        "country": "USA"
      },
      "contact_type": "customer",
      "category": "Computer Hardware",
      "tags": [
        "retail",
        "management"
      ],
      "is_active": true,
      "is_favorite": true,
      "last_contacted": "2024-04-18T16:45:00Z",
      "notes": "Key contact for retail orders",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "CONT_003",
      "contact_id": "CONT_003",
      "first_name": "Michael",
      "last_name": "Johnson",
      "email": "michael.johnson@techsupplies.com",
      "phone": "+1234567894",
      "mobile": "+1234567895",
      "company": "Tech Supplies Inc.",
      "job_title": "Sales Representative",
      "department": "Sales",
      "address": {
        "street": "123 Tech Street",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94102",
        "country": "USA"
      },
      "contact_type": "supplier",
      "category": "Electronics",
      "tags": [
        "supplier",
        "sales"
      ],
      "is_active": true,
      "is_favorite": false,
      "last_contacted": "2024-04-17T11:20:00Z",
      "notes": "Main supplier contact for electronics",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    }
  ],
  "sales": [
    {
      "_id": "SALE_001",
      "sale_id": "SALE_001",
      "customer_id": "CUST_ABC_001",
      "customer_name": "ABC Corporation",
      "sale_date": "2026-03-25T10:30:00Z",
      "total_amount": 3249.95,
      "discount": 100,
      "tax_amount": 324.99,
      "final_amount": 3474.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Bulk order for new office setup",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 2,
          "unit_price": 1299.99,
          "total_price": 2599.98,
          "discount": 50
        },
        {
          "inventory_id": "INV_003",
          "product_name": "Mechanical Keyboard RGB",
          "quantity": 5,
          "unit_price": 129.99,
          "total_price": 649.95,
          "discount": 50
        }
      ],
      "created_at": "2026-03-25T10:30:00Z",
      "updated_at": "2026-03-25T10:30:00Z"
    },
    {
      "_id": "SALE_002",
      "sale_id": "SALE_002",
      "customer_id": "CUST_XYZ_002",
      "customer_name": "XYZ Retail Store",
      "sale_date": "2026-03-28T14:15:00Z",
      "total_amount": 1499.95,
      "discount": 75,
      "tax_amount": 142.49,
      "final_amount": 1567.44,
      "payment_status": "partial",
      "payment_method": "credit_card",
      "status": "pending",
      "notes": "Retail equipment purchase",
      "items": [
        {
          "inventory_id": "INV_002",
          "product_name": "Wireless Mouse Pro",
          "quantity": 8,
          "unit_price": 187.49,
          "total_price": 1499.92,
          "discount": 75
        }
      ],
      "created_at": "2026-03-28T14:15:00Z",
      "updated_at": "2026-03-28T14:15:00Z"
    },
    {
      "_id": "SALE_003",
      "sale_id": "SALE_003",
      "customer_id": "CUST_TECH_003",
      "customer_name": "TechStart Solutions",
      "sale_date": "2026-04-02T09:30:00Z",
      "total_amount": 8999.95,
      "discount": 500,
      "tax_amount": 849.99,
      "final_amount": 9349.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Enterprise workstation setup",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 8,
          "unit_price": 1124.99,
          "total_price": 8999.92,
          "discount": 500
        }
      ],
      "created_at": "2026-04-02T09:30:00Z",
      "updated_at": "2026-04-02T09:30:00Z"
    },
    {
      "_id": "SALE_004",
      "sale_id": "SALE_004",
      "customer_id": "CUST_RETAIL_004",
      "customer_name": "Global Retail Chain",
      "sale_date": "2026-04-05T16:45:00Z",
      "total_amount": 5699.94,
      "discount": 200,
      "tax_amount": 549.99,
      "final_amount": 6049.93,
      "payment_status": "partial",
      "payment_method": "credit_card",
      "status": "pending",
      "notes": "Retail display equipment",
      "items": [
        {
          "inventory_id": "INV_004",
          "product_name": "4K Monitor 27\"",
          "quantity": 12,
          "unit_price": 474.99,
          "total_price": 5699.88,
          "discount": 200
        }
      ],
      "created_at": "2026-04-05T16:45:00Z",
      "updated_at": "2026-04-05T16:45:00Z"
    },
    {
      "_id": "SALE_005",
      "sale_id": "SALE_005",
      "customer_id": "CUST_EDU_005",
      "customer_name": "University District",
      "sale_date": "2026-04-08T11:20:00Z",
      "total_amount": 12499.75,
      "discount": 750,
      "tax_amount": 1174.97,
      "final_amount": 13924.72,
      "payment_status": "paid",
      "payment_method": "purchase_order",
      "status": "completed",
      "notes": "Educational lab equipment",
      "items": [
        {
          "inventory_id": "INV_005",
          "product_name": "Desktop Workstation Pro",
          "quantity": 10,
          "unit_price": 1249.97,
          "total_price": 12499.70,
          "discount": 750
        }
      ],
      "created_at": "2026-04-08T11:20:00Z",
      "updated_at": "2026-04-08T11:20:00Z"
    },
    {
      "_id": "SALE_006",
      "sale_id": "SALE_006",
      "customer_id": "CUST_SMALL_006",
      "customer_name": "Small Business LLC",
      "sale_date": "2026-04-12T13:15:00Z",
      "total_amount": 2749.95,
      "discount": 150,
      "tax_amount": 259.99,
      "final_amount": 2859.94,
      "payment_status": "pending",
      "payment_method": "cash",
      "status": "ordered",
      "notes": "Office upgrade package",
      "items": [
        {
          "inventory_id": "INV_006",
          "product_name": "Wireless Mouse Pro",
          "quantity": 25,
          "unit_price": 109.99,
          "total_price": 2749.75,
          "discount": 150
        }
      ],
      "created_at": "2026-04-12T13:15:00Z",
      "updated_at": "2026-04-12T13:15:00Z"
    },
    {
      "_id": "SALE_007",
      "sale_id": "SALE_007",
      "customer_id": "CUST_CORP_007",
      "customer_name": "Corporate Solutions Inc",
      "sale_date": "2026-04-16T10:00:00Z",
      "total_amount": 18499.85,
      "discount": 1000,
      "tax_amount": 1749.98,
      "final_amount": 19249.83,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Complete office setup",
      "items": [
        {
          "inventory_id": "INV_007",
          "product_name": "Server Rack System",
          "quantity": 3,
          "unit_price": 6166.61,
          "total_price": 18499.83,
          "discount": 1000
        }
      ],
      "created_at": "2026-04-16T10:00:00Z",
      "updated_at": "2026-04-16T10:00:00Z"
    },
    {
      "_id": "SALE_008",
      "sale_id": "SALE_008",
      "customer_id": "CUST_STARTUP_008",
      "customer_name": "Startup Hub",
      "sale_date": "2026-04-19T15:30:00Z",
      "total_amount": 4249.96,
      "discount": 250,
      "tax_amount": 399.99,
      "final_amount": 4399.95,
      "payment_status": "pending",
      "payment_method": "credit_card",
      "status": "ordered",
      "notes": "Startup development kits",
      "items": [
        {
          "inventory_id": "INV_008",
          "product_name": "Development Board Set",
          "quantity": 15,
          "unit_price": 283.33,
          "total_price": 4249.95,
          "discount": 250
        }
      ],
      "created_at": "2026-04-19T15:30:00Z",
      "updated_at": "2026-04-19T15:30:00Z"
    },
    {
      "_id": "SALE_009",
      "sale_id": "SALE_009",
      "customer_id": "CUST_GOVT_009",
      "customer_name": "Government Agency",
      "sale_date": "2026-04-22T09:45:00Z",
      "total_amount": 32999.70,
      "discount": 2000,
      "tax_amount": 3099.97,
      "final_amount": 34099.67,
      "payment_status": "paid",
      "payment_method": "purchase_order",
      "status": "completed",
      "notes": "Government contract equipment",
      "items": [
        {
          "inventory_id": "INV_009",
          "product_name": "Security Camera System",
          "quantity": 20,
          "unit_price": 1649.98,
          "total_price": 32999.60,
          "discount": 2000
        }
      ],
      "created_at": "2026-04-22T09:45:00Z",
      "updated_at": "2026-04-22T09:45:00Z"
    },
    {
      "_id": "SALE_010",
      "sale_id": "SALE_010",
      "customer_id": "CUST_HEALTH_010",
      "customer_name": "Healthcare Provider",
      "sale_date": "2026-04-25T14:20:00Z",
      "total_amount": 14999.88,
      "discount": 800,
      "tax_amount": 1419.98,
      "final_amount": 15619.86,
      "payment_status": "partial",
      "payment_method": "bank_transfer",
      "status": "pending",
      "notes": "Medical office equipment",
      "items": [
        {
          "inventory_id": "INV_010",
          "product_name": "Medical Tablet Pro",
          "quantity": 12,
          "unit_price": 1249.99,
          "total_price": 14999.88,
          "discount": 800
        }
      ],
      "created_at": "2026-04-25T14:20:00Z",
      "updated_at": "2026-04-25T14:20:00Z"
    },
    {
      "_id": "SALE_011",
      "sale_id": "SALE_011",
      "customer_id": "CUST_EDU_011",
      "customer_name": "Educational Institute",
      "sale_date": "2026-03-26T08:30:00Z",
      "total_amount": 6799.94,
      "discount": 400,
      "tax_amount": 639.99,
      "final_amount": 7039.93,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Classroom technology upgrade",
      "items": [
        {
          "inventory_id": "INV_011",
          "product_name": "Interactive Whiteboard",
          "quantity": 4,
          "unit_price": 1699.98,
          "total_price": 6799.92,
          "discount": 400
        }
      ],
      "created_at": "2026-03-26T08:30:00Z",
      "updated_at": "2026-03-26T08:30:00Z"
    },
    {
      "_id": "SALE_012",
      "sale_id": "SALE_012",
      "customer_id": "CUST_CORP_012",
      "customer_name": "Enterprise Solutions",
      "sale_date": "2026-03-29T11:45:00Z",
      "total_amount": 22499.88,
      "discount": 1200,
      "tax_amount": 2129.98,
      "final_amount": 23429.86,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Enterprise network infrastructure",
      "items": [
        {
          "inventory_id": "INV_012",
          "product_name": "Network Switch 24-Port",
          "quantity": 8,
          "unit_price": 2812.48,
          "total_price": 22499.84,
          "discount": 1200
        }
      ],
      "created_at": "2026-03-29T11:45:00Z",
      "updated_at": "2026-03-29T11:45:00Z"
    },
    {
      "_id": "SALE_013",
      "sale_id": "SALE_013",
      "customer_id": "CUST_RETAIL_013",
      "customer_name": "Tech Retail Store",
      "sale_date": "2026-04-01T14:20:00Z",
      "total_amount": 3899.97,
      "discount": 200,
      "tax_amount": 369.99,
      "final_amount": 4069.96,
      "payment_status": "partial",
      "payment_method": "cash",
      "status": "ordered",
      "notes": "Retail point of sale systems",
      "items": [
        {
          "inventory_id": "INV_013",
          "product_name": "POS Terminal System",
          "quantity": 3,
          "unit_price": 1299.99,
          "total_price": 3899.97,
          "discount": 200
        }
      ],
      "created_at": "2026-04-01T14:20:00Z",
      "updated_at": "2026-04-01T14:20:00Z"
    },
    {
      "_id": "SALE_014",
      "sale_id": "SALE_014",
      "customer_id": "CUST_SMALL_014",
      "customer_name": "Local Business",
      "sale_date": "2026-04-06T09:15:00Z",
      "total_amount": 1599.96,
      "discount": 100,
      "tax_amount": 149.99,
      "final_amount": 1649.95,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Small business starter kit",
      "items": [
        {
          "inventory_id": "INV_014",
          "product_name": "Business Phone System",
          "quantity": 2,
          "unit_price": 799.98,
          "total_price": 1599.96,
          "discount": 100
        }
      ],
      "created_at": "2026-04-06T09:15:00Z",
      "updated_at": "2026-04-06T09:15:00Z"
    },
    {
      "_id": "SALE_015",
      "sale_id": "SALE_015",
      "customer_id": "CUST_TECH_015",
      "customer_name": "Software Development Co",
      "sale_date": "2026-04-09T16:30:00Z",
      "total_amount": 28999.85,
      "discount": 1500,
      "tax_amount": 2749.98,
      "final_amount": 30249.83,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Development workstations setup",
      "items": [
        {
          "inventory_id": "INV_015",
          "product_name": "High-End Workstation",
          "quantity": 5,
          "unit_price": 5799.97,
          "total_price": 28999.85,
          "discount": 1500
        }
      ],
      "created_at": "2026-04-09T16:30:00Z",
      "updated_at": "2026-04-09T16:30:00Z"
    },
    {
      "_id": "SALE_016",
      "sale_id": "SALE_016",
      "customer_id": "CUST_GOVT_016",
      "customer_name": "Public Sector Agency",
      "sale_date": "2026-04-13T10:45:00Z",
      "total_amount": 18999.90,
      "discount": 1000,
      "tax_amount": 1799.99,
      "final_amount": 19799.89,
      "payment_status": "partial",
      "payment_method": "purchase_order",
      "status": "pending",
      "notes": "Public sector computer upgrade",
      "items": [
        {
          "inventory_id": "INV_016",
          "product_name": "Government Desktop PC",
          "quantity": 10,
          "unit_price": 1899.99,
          "total_price": 18999.90,
          "discount": 1000
        }
      ],
      "created_at": "2026-04-13T10:45:00Z",
      "updated_at": "2026-04-13T10:45:00Z"
    },
    {
      "_id": "SALE_017",
      "sale_id": "SALE_017",
      "customer_id": "CUST_HEALTH_017",
      "customer_name": "Medical Center",
      "sale_date": "2026-04-17T13:20:00Z",
      "total_amount": 25999.88,
      "discount": 1300,
      "tax_amount": 2469.98,
      "final_amount": 27169.86,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Medical diagnostic equipment",
      "items": [
        {
          "inventory_id": "INV_017",
          "product_name": "Medical Diagnostic Device",
          "quantity": 4,
          "unit_price": 6499.97,
          "total_price": 25999.88,
          "discount": 1300
        }
      ],
      "created_at": "2026-04-17T13:20:00Z",
      "updated_at": "2026-04-17T13:20:00Z"
    },
    {
      "_id": "SALE_018",
      "sale_id": "SALE_018",
      "customer_id": "CUST_EDU_018",
      "customer_name": "Training Center",
      "sale_date": "2026-04-20T08:00:00Z",
      "total_amount": 8999.94,
      "discount": 500,
      "tax_amount": 849.99,
      "final_amount": 9349.93,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Training room equipment",
      "items": [
        {
          "inventory_id": "INV_018",
          "product_name": "Training Laptop Set",
          "quantity": 6,
          "unit_price": 1499.99,
          "total_price": 8999.94,
          "discount": 500
        }
      ],
      "created_at": "2026-04-20T08:00:00Z",
      "updated_at": "2026-04-20T08:00:00Z"
    },
    {
      "_id": "SALE_019",
      "sale_id": "SALE_019",
      "customer_id": "CUST_CORP_019",
      "customer_name": "Manufacturing Company",
      "sale_date": "2026-04-21T15:30:00Z",
      "total_amount": 41999.85,
      "discount": 2000,
      "tax_amount": 3999.98,
      "final_amount": 43999.83,
      "payment_status": "partial",
      "payment_method": "bank_transfer",
      "status": "ordered",
      "notes": "Manufacturing control systems",
      "items": [
        {
          "inventory_id": "INV_019",
          "product_name": "Industrial Control System",
          "quantity": 7,
          "unit_price": 5999.98,
          "total_price": 41999.86,
          "discount": 2000
        }
      ],
      "created_at": "2026-04-21T15:30:00Z",
      "updated_at": "2026-04-21T15:30:00Z"
    },
    {
      "_id": "SALE_020",
      "sale_id": "SALE_020",
      "customer_id": "CUST_STARTUP_020",
      "customer_name": "Tech Startup Inc",
      "sale_date": "2026-04-22T11:15:00Z",
      "total_amount": 5499.94,
      "discount": 300,
      "tax_amount": 519.99,
      "final_amount": 5719.93,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Startup office essentials",
      "items": [
        {
          "inventory_id": "INV_020",
          "product_name": "Office Starter Package",
          "quantity": 3,
          "unit_price": 1833.31,
          "total_price": 5499.93,
          "discount": 300
        }
      ],
      "created_at": "2026-04-22T11:15:00Z",
      "updated_at": "2026-04-22T11:15:00Z"
    },
    {
      "_id": "SALE_021",
      "sale_id": "SALE_021",
      "customer_id": "CUST_RETAIL_021",
      "customer_name": "Fashion Boutique",
      "sale_date": "2026-03-27T11:00:00Z",
      "total_amount": 8999.85,
      "discount": 500,
      "tax_amount": 849.98,
      "final_amount": 9349.83,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Seasonal fashion display equipment",
      "items": [
        {
          "inventory_id": "INV_021",
          "product_name": "Digital Display Panel",
          "quantity": 8,
          "unit_price": 1124.98,
          "total_price": 8999.84,
          "discount": 500
        }
      ],
      "created_at": "2026-03-27T11:00:00Z",
      "updated_at": "2026-03-27T11:00:00Z"
    },
    {
      "_id": "SALE_022",
      "sale_id": "SALE_022",
      "customer_id": "CUST_FOOD_022",
      "customer_name": "Restaurant Chain",
      "sale_date": "2026-03-29T16:30:00Z",
      "total_amount": 12499.75,
      "discount": 750,
      "tax_amount": 1174.97,
      "final_amount": 12924.72,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Kitchen automation systems",
      "items": [
        {
          "inventory_id": "INV_022",
          "product_name": "Smart Kitchen Terminal",
          "quantity": 10,
          "unit_price": 1249.97,
          "total_price": 12499.70,
          "discount": 750
        }
      ],
      "created_at": "2026-03-29T16:30:00Z",
      "updated_at": "2026-03-29T16:30:00Z"
    },
    {
      "_id": "SALE_023",
      "sale_id": "SALE_023",
      "customer_id": "CUST_LOGISTICS_023",
      "customer_name": "Logistics Company",
      "sale_date": "2026-04-01T09:15:00Z",
      "total_amount": 18499.80,
      "discount": 1200,
      "tax_amount": 1729.98,
      "final_amount": 19029.78,
      "payment_status": "partial",
      "payment_method": "purchase_order",
      "status": "pending",
      "notes": "Warehouse management equipment",
      "items": [
        {
          "inventory_id": "INV_023",
          "product_name": "Barcode Scanner Pro",
          "quantity": 25,
          "unit_price": 739.99,
          "total_price": 18499.75,
          "discount": 1200
        }
      ],
      "created_at": "2026-04-01T09:15:00Z",
      "updated_at": "2026-04-01T09:15:00Z"
    },
    {
      "_id": "SALE_024",
      "sale_id": "SALE_024",
      "customer_id": "CUST_MEDIA_024",
      "customer_name": "Media Production House",
      "sale_date": "2026-04-03T13:45:00Z",
      "total_amount": 28499.60,
      "discount": 2000,
      "tax_amount": 2649.96,
      "final_amount": 29149.56,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Video production equipment",
      "items": [
        {
          "inventory_id": "INV_024",
          "product_name": "Professional Camera Kit",
          "quantity": 6,
          "unit_price": 4749.93,
          "total_price": 28499.58,
          "discount": 2000
        }
      ],
      "created_at": "2026-04-03T13:45:00Z",
      "updated_at": "2026-04-03T13:45:00Z"
    },
    {
      "_id": "SALE_025",
      "sale_id": "SALE_025",
      "customer_id": "CUST_CONSTRUCTION_025",
      "customer_name": "Construction Firm",
      "sale_date": "2026-04-05T10:20:00Z",
      "total_amount": 15499.85,
      "discount": 900,
      "tax_amount": 1459.98,
      "final_amount": 16059.83,
      "payment_status": "pending",
      "payment_method": "credit_card",
      "status": "ordered",
      "notes": "Site survey equipment",
      "items": [
        {
          "inventory_id": "INV_025",
          "product_name": "Survey Drone Pro",
          "quantity": 5,
          "unit_price": 3099.97,
          "total_price": 15499.85,
          "discount": 900
        }
      ],
      "created_at": "2026-04-05T10:20:00Z",
      "updated_at": "2026-04-05T10:20:00Z"
    },
    {
      "_id": "SALE_026",
      "sale_id": "SALE_026",
      "customer_id": "CUST_LEGAL_026",
      "customer_name": "Law Firm Partnership",
      "sale_date": "2026-04-07T14:30:00Z",
      "total_amount": 9999.88,
      "discount": 600,
      "tax_amount": 939.98,
      "final_amount": 10339.86,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Legal office technology upgrade",
      "items": [
        {
          "inventory_id": "INV_026",
          "product_name": "Document Management System",
          "quantity": 4,
          "unit_price": 2499.97,
          "total_price": 9999.88,
          "discount": 600
        }
      ],
      "created_at": "2026-04-07T14:30:00Z",
      "updated_at": "2026-04-07T14:30:00Z"
    },
    {
      "_id": "SALE_027",
      "sale_id": "SALE_027",
      "customer_id": "CUST_SPORTS_027",
      "customer_name": "Sports Complex",
      "sale_date": "2026-04-09T11:15:00Z",
      "total_amount": 21999.70,
      "discount": 1500,
      "tax_amount": 2049.97,
      "final_amount": 22549.67,
      "payment_status": "partial",
      "payment_method": "purchase_order",
      "status": "pending",
      "notes": "Sports facility monitoring system",
      "items": [
        {
          "inventory_id": "INV_027",
          "product_name": "Stadium Display System",
          "quantity": 3,
          "unit_price": 7333.23,
          "total_price": 21999.69,
          "discount": 1500
        }
      ],
      "created_at": "2026-04-09T11:15:00Z",
      "updated_at": "2026-04-09T11:15:00Z"
    },
    {
      "_id": "SALE_028",
      "sale_id": "SALE_028",
      "customer_id": "CUST_BEAUTY_028",
      "customer_name": "Beauty Salon Chain",
      "sale_date": "2026-04-11T15:45:00Z",
      "total_amount": 7499.91,
      "discount": 400,
      "tax_amount": 709.99,
      "final_amount": 7809.90,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Salon management software and hardware",
      "items": [
        {
          "inventory_id": "INV_028",
          "product_name": "Salon POS System",
          "quantity": 7,
          "unit_price": 1071.41,
          "total_price": 7499.87,
          "discount": 400
        }
      ],
      "created_at": "2026-04-11T15:45:00Z",
      "updated_at": "2026-04-11T15:45:00Z"
    },
    {
      "_id": "SALE_029",
      "sale_id": "SALE_029",
      "customer_id": "CUST_ENERGY_029",
      "customer_name": "Energy Company",
      "sale_date": "2026-04-13T08:30:00Z",
      "total_amount": 32499.65,
      "discount": 2500,
      "tax_amount": 2999.96,
      "final_amount": 32999.61,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Energy monitoring infrastructure",
      "items": [
        {
          "inventory_id": "INV_029",
          "product_name": "Smart Grid Monitor",
          "quantity": 8,
          "unit_price": 4062.45,
          "total_price": 32499.60,
          "discount": 2500
        }
      ],
      "created_at": "2026-04-13T08:30:00Z",
      "updated_at": "2026-04-13T08:30:00Z"
    },
    {
      "_id": "SALE_030",
      "sale_id": "SALE_030",
      "customer_id": "CUST_TELECOM_030",
      "customer_name": "Telecommunications Provider",
      "sale_date": "2026-04-15T12:00:00Z",
      "total_amount": 19499.80,
      "discount": 1300,
      "tax_amount": 1819.98,
      "final_amount": 20019.78,
      "payment_status": "partial",
      "payment_method": "credit_card",
      "status": "pending",
      "notes": "Network testing equipment",
      "items": [
        {
          "inventory_id": "INV_030",
          "product_name": "Network Analyzer Pro",
          "quantity": 6,
          "unit_price": 3249.96,
          "total_price": 19499.76,
          "discount": 1300
        }
      ],
      "created_at": "2026-04-15T12:00:00Z",
      "updated_at": "2026-04-15T12:00:00Z"
    }
  ],
  "purchases": [
    {
      "_id": "PURCH_001",
      "purchase_id": "PURCH_001",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2024-04-10T09:00:00Z",
      "total_amount": 4499.7,
      "discount": 100,
      "tax_amount": 449.97,
      "final_amount": 4849.67,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Monthly inventory restock",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 5,
          "unit_price": 899.99,
          "total_price": 4499.95,
          "discount": 100
        }
      ],
      "created_at": "2024-04-10T09:00:00Z",
      "updated_at": "2024-04-10T09:00:00Z"
    },
    {
      "_id": "PURCH_002",
      "purchase_id": "PURCH_002",
      "supplier_id": "SUP_OFFICE_002",
      "supplier_name": "Office Depot Pro",
      "purchase_date": "2024-04-15T14:30:00Z",
      "total_amount": 1250.00,
      "discount": 50,
      "tax_amount": 120.00,
      "final_amount": 1320.00,
      "payment_status": "pending",
      "payment_method": "credit_card",
      "status": "ordered",
      "notes": "Office supplies for Q2",
      "items": [
        {
          "inventory_id": "INV_003",
          "product_name": "Office Chair Ergonomic",
          "quantity": 10,
          "unit_price": 150.00,
          "total_price": 1500.00,
          "discount": 50
        }
      ],
      "created_at": "2024-04-15T14:30:00Z",
      "updated_at": "2024-04-15T14:30:00Z"
    },
    {
      "_id": "PURCH_003",
      "purchase_id": "PURCH_003",
      "supplier_id": "SUP_GLOBAL_003",
      "supplier_name": "Global Hardware Co.",
      "purchase_date": "2024-04-18T10:15:00Z",
      "total_amount": 3249.99,
      "discount": 0,
      "tax_amount": 325.00,
      "final_amount": 3574.99,
      "payment_status": "paid",
      "payment_method": "cash",
      "status": "received",
      "notes": "Hardware components for assembly",
      "items": [
        {
          "inventory_id": "INV_004",
          "product_name": "Mechanical Keyboard RGB",
          "quantity": 25,
          "unit_price": 129.99,
          "total_price": 3249.75,
          "discount": 0
        }
      ],
      "created_at": "2024-04-18T10:15:00Z",
      "updated_at": "2024-04-18T10:15:00Z"
    },
    {
      "_id": "PURCH_004",
      "purchase_id": "PURCH_004",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2024-04-22T16:45:00Z",
      "total_amount": 8999.95,
      "discount": 200,
      "tax_amount": 879.99,
      "final_amount": 9679.94,
      "payment_status": "partial",
      "payment_method": "bank_transfer",
      "status": "ordered",
      "notes": "Bulk laptop order for new team",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 10,
          "unit_price": 899.99,
          "total_price": 8999.90,
          "discount": 200
        }
      ],
      "created_at": "2024-04-22T16:45:00Z",
      "updated_at": "2024-04-22T16:45:00Z"
    },
    {
      "_id": "PURCH_005",
      "purchase_id": "PURCH_005",
      "supplier_id": "SUP_OFFICE_002",
      "supplier_name": "Office Depot Pro",
      "purchase_date": "2024-04-05T11:20:00Z",
      "total_amount": 750.00,
      "discount": 25,
      "tax_amount": 72.50,
      "final_amount": 797.50,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Stationery and desk supplies",
      "items": [
        {
          "inventory_id": "INV_005",
          "product_name": "Desk Lamp LED",
          "quantity": 15,
          "unit_price": 50.00,
          "total_price": 750.00,
          "discount": 25
        }
      ],
      "created_at": "2024-04-05T11:20:00Z",
      "updated_at": "2024-04-05T11:20:00Z"
    },
    {
      "_id": "PURCH_006",
      "purchase_id": "PURCH_006",
      "supplier_id": "SUP_GLOBAL_003",
      "supplier_name": "Global Hardware Co.",
      "purchase_date": "2024-04-20T09:30:00Z",
      "total_amount": 2150.00,
      "discount": 0,
      "tax_amount": 215.00,
      "final_amount": 2365.00,
      "payment_status": "pending",
      "payment_method": "bank_transfer",
      "status": "received",
      "notes": "Monitor and display equipment",
      "items": [
        {
          "inventory_id": "INV_006",
          "product_name": "Monitor 27\" 4K",
          "quantity": 5,
          "unit_price": 430.00,
          "total_price": 2150.00,
          "discount": 0
        }
      ],
      "created_at": "2024-04-20T09:30:00Z",
      "updated_at": "2024-04-20T09:30:00Z"
    },
    {
      "_id": "PURCH_007",
      "purchase_id": "PURCH_007",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2024-04-12T13:45:00Z",
      "total_amount": 1899.97,
      "discount": 100,
      "tax_amount": 179.99,
      "final_amount": 1979.96,
      "payment_status": "paid",
      "payment_method": "cash",
      "status": "completed",
      "notes": "Computer accessories bundle",
      "items": [
        {
          "inventory_id": "INV_007",
          "product_name": "Wireless Mouse Pro",
          "quantity": 20,
          "unit_price": 94.99,
          "total_price": 1899.80,
          "discount": 100
        }
      ],
      "created_at": "2024-04-12T13:45:00Z",
      "updated_at": "2024-04-12T13:45:00Z"
    },
    {
      "_id": "PURCH_008",
      "purchase_id": "PURCH_008",
      "supplier_id": "SUP_OFFICE_002",
      "supplier_name": "Office Depot Pro",
      "purchase_date": "2024-04-25T15:00:00Z",
      "total_amount": 3200.00,
      "discount": 150,
      "tax_amount": 305.00,
      "final_amount": 3355.00,
      "payment_status": "pending",
      "payment_method": "credit_card",
      "status": "ordered",
      "notes": "Furniture and fixtures for new office",
      "items": [
        {
          "inventory_id": "INV_008",
          "product_name": "Standing Desk Adjustable",
          "quantity": 8,
          "unit_price": 400.00,
          "total_price": 3200.00,
          "discount": 150
        }
      ],
      "created_at": "2024-04-25T15:00:00Z",
      "updated_at": "2024-04-25T15:00:00Z"
    },
    {
      "_id": "PURCH_009",
      "purchase_id": "PURCH_009",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2024-04-08T11:30:00Z",
      "total_amount": 2799.97,
      "discount": 100,
      "tax_amount": 269.99,
      "final_amount": 2969.96,
      "payment_status": "refunded",
      "payment_method": "bank_transfer",
      "status": "returned",
      "notes": "Defective items returned to supplier",
      "items": [
        {
          "inventory_id": "INV_009",
          "product_name": "Wireless Headset Pro",
          "quantity": 30,
          "unit_price": 93.33,
          "total_price": 2799.90,
          "discount": 100
        }
      ],
      "created_at": "2024-04-08T11:30:00Z",
      "updated_at": "2024-04-12T14:20:00Z",
      "return_date": "2024-04-12T14:20:00Z",
      "return_reason": "Defective - audio quality issues",
      "refund_amount": 2969.96
    },
    {
      "_id": "PURCH_010",
      "purchase_id": "PURCH_010",
      "supplier_id": "SUP_GLOBAL_003",
      "supplier_name": "Global Hardware Co.",
      "purchase_date": "2024-04-03T09:15:00Z",
      "total_amount": 1850.00,
      "discount": 0,
      "tax_amount": 185.00,
      "final_amount": 2035.00,
      "payment_status": "refunded",
      "payment_method": "cash",
      "status": "cancelled",
      "notes": "Order cancelled - supplier unable to deliver",
      "items": [
        {
          "inventory_id": "INV_010",
          "product_name": "External Hard Drive 2TB",
          "quantity": 10,
          "unit_price": 185.00,
          "total_price": 1850.00,
          "discount": 0
        }
      ],
      "created_at": "2024-04-03T09:15:00Z",
      "updated_at": "2024-04-05T16:45:00Z",
      "cancellation_date": "2024-04-05T16:45:00Z",
      "cancellation_reason": "Supplier out of stock"
    },
    {
      "_id": "PURCH_011",
      "purchase_id": "PURCH_011",
      "supplier_id": "SUP_OFFICE_002",
      "supplier_name": "Office Depot Pro",
      "purchase_date": "2024-04-15T13:20:00Z",
      "total_amount": 945.00,
      "discount": 45,
      "tax_amount": 90.00,
      "final_amount": 990.00,
      "payment_status": "refunded",
      "payment_method": "credit_card",
      "status": "returned",
      "notes": "Wrong items delivered - returned for correct order",
      "items": [
        {
          "inventory_id": "INV_011",
          "product_name": "Printer Paper A4",
          "quantity": 50,
          "unit_price": 18.90,
          "total_price": 945.00,
          "discount": 45
        }
      ],
      "created_at": "2024-04-15T13:20:00Z",
      "updated_at": "2024-04-18T10:30:00Z",
      "return_date": "2024-04-18T10:30:00Z",
      "return_reason": "Wrong specifications - ordered premium paper received standard"
    },
    {
      "_id": "PURCH_012",
      "purchase_id": "PURCH_012",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2024-04-20T16:00:00Z",
      "total_amount": 5699.94,
      "discount": 300,
      "tax_amount": 539.99,
      "final_amount": 5939.93,
      "payment_status": "refunded",
      "payment_method": "bank_transfer",
      "status": "returned",
      "notes": "Damaged during shipping - full return processed",
      "items": [
        {
          "inventory_id": "INV_012",
          "product_name": "Tablet Pro 12\"",
          "quantity": 6,
          "unit_price": 949.99,
          "total_price": 5699.94,
          "discount": 300
        }
      ],
      "created_at": "2024-04-20T16:00:00Z",
      "updated_at": "2024-04-23T11:15:00Z",
      "return_date": "2024-04-23T11:15:00Z",
      "return_reason": "Damaged in transit - screens cracked"
    }
  ],
  "stockTransfers": [
    {
      "_id": "TRANSFER_001",
      "transfer_id": "ST_001",
      "from_warehouse": "Main Warehouse",
      "to_warehouse": "Branch Office",
      "from_location": {
        "aisle": "A3",
        "shelf": "S12"
      },
      "to_location": {
        "aisle": "B1",
        "shelf": "S05"
      },
      "inventory_id": "INV_002",
      "product_name": "Wireless Mouse",
      "quantity": 20,
      "status": "completed",
      "notes": "Transfer for branch office setup",
      "created_at": "2024-04-16T11:00:00Z",
      "updated_at": "2024-04-16T15:30:00Z"
    }
  ],
  "expenses": [
    {
      "_id": "EXP_001",
      "expense_id": "EXP_001",
      "category": "utilities",
      "description": "Monthly electricity bill for main warehouse",
      "amount": 2500,
      "expense_date": "2024-04-01T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/electricity.pdf",
      "notes": "Monthly recurring utility expense",
      "created_at": "2024-04-01T10:00:00Z",
      "updated_at": "2024-04-01T10:00:00Z"
    },
    {
      "_id": "EXP_002",
      "expense_id": "EXP_002",
      "category": "rent",
      "description": "Monthly warehouse rent",
      "amount": 5000,
      "expense_date": "2024-04-01T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/rent.pdf",
      "notes": "Monthly warehouse rental payment",
      "created_at": "2024-04-01T10:00:00Z",
      "updated_at": "2024-04-01T10:00:00Z"
    }
  ],
  "paymentAccounts": [
    {
      "_id": "ACC_001",
      "account_id": "ACC_BANK_001",
      "account_name": "Main Business Account",
      "account_type": "bank",
      "bank_name": "First National Bank",
      "account_number": "1234567890",
      "ifsc_code": "FNB001",
      "balance": 15000,
      "currency": "USD",
      "is_active": true,
      "is_default": true,
      "created_at": "2024-04-01T00:00:00Z",
      "updated_at": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "ACC_002",
      "account_id": "ACC_CASH_001",
      "account_name": "Petty Cash",
      "account_type": "cash",
      "balance": 2500,
      "currency": "USD",
      "is_active": true,
      "is_default": false,
      "created_at": "2024-04-01T00:00:00Z",
      "updated_at": "2024-04-20T10:00:00Z"
    }
  ],
  "aiInsights": [
    {
      "_id": "AI_001",
      "insight_id": "AI_001",
      "title": "High-Value Products Analysis",
      "description": "Identify top-performing products by revenue and margin",
      "insight_type": "trend",
      "category": "products",
      "data": {
        "top_products": [
          {
            "name": "Laptop Pro 15\"",
            "revenue": 25999.8,
            "margin": 30.8
          },
          {
            "name": "4K Monitor 27\"",
            "revenue": 9999.8,
            "margin": 40
          },
          {
            "name": "Tablet Pro 10\"",
            "revenue": 17999.7,
            "margin": 33.3
          }
        ],
        "trend_period": "last_30_days",
        "analysis_date": "2024-04-20T10:00:00Z"
      },
      "confidence_score": 0.95,
      "priority": "high",
      "generated_at": "2024-04-20T10:00:00Z",
      "expires_at": "2024-04-27T10:00:00Z"
    },
    {
      "_id": "AI_002",
      "insight_id": "AI_002",
      "title": "Inventory Optimization Recommendation",
      "description": "Recommend reorder points based on sales velocity",
      "insight_type": "recommendation",
      "category": "inventory",
      "data": {
        "recommendations": [
          {
            "product": "Wireless Mouse",
            "current_reorder": 20,
            "recommended_reorder": 35
          },
          {
            "product": "Mechanical Keyboard RGB",
            "current_reorder": 15,
            "recommended_reorder": 25
          }
        ],
        "optimization_potential": "15% cost reduction"
      },
      "confidence_score": 0.88,
      "priority": "medium",
      "generated_at": "2024-04-20T11:00:00Z",
      "expires_at": "2024-05-20T11:00:00Z"
    }
  ],
  "alerts": [
    {
      "_id": "ALT_001",
      "alert_id": "ALT_001",
      "title": "Critical: Out of Stock",
      "message": "Product \"Laptop Pro 15\"\" is completely out of stock. Immediate action required.",
      "alert_type": "out_of_stock",
      "severity": "critical",
      "module": "inventory",
      "reference_id": "INV_LAPTOP_001",
      "reference_type": "product",
      "is_active": true,
      "created_at": "2024-04-20T12:00:00Z",
      "expires_at": "2024-04-21T12:00:00Z"
    },
    {
      "_id": "ALT_002",
      "alert_id": "ALT_002",
      "title": "Payment Due",
      "message": "Customer \"ABC Corporation\" has overdue payment of $15,000.",
      "alert_type": "payment_due",
      "severity": "warning",
      "module": "customers",
      "reference_id": "CUST_ABC_001",
      "reference_type": "customer",
      "is_active": true,
      "created_at": "2024-04-20T13:00:00Z",
      "expires_at": "2024-04-25T13:00:00Z"
    }
  ],
  "suppliers": [
    {
      "_id": "SUP_001",
      "supplier_id": "SUP_TECH_001",
      "name": "Tech Supplies Inc.",
      "company_name": "Tech Supplies Inc.",
      "email": "contact@techsupplies.com",
      "phone": "+1-555-0101",
      "address": {
        "street": "123 Tech Street",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94105",
        "country": "USA"
      },
      "contact_person": "John Smith",
      "payment_terms": "Net 30",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "SUP_002",
      "supplier_id": "SUP_OFFICE_002",
      "name": "Office Depot Pro",
      "company_name": "Office Depot Pro",
      "email": "sales@officedepotpro.com",
      "phone": "+1-555-0102",
      "address": {
        "street": "456 Office Park",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "contact_person": "Jane Doe",
      "payment_terms": "Net 15",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    },
    {
      "_id": "SUP_003",
      "supplier_id": "SUP_GLOBAL_003",
      "name": "Global Hardware Co.",
      "company_name": "Global Hardware Co.",
      "email": "info@globalhardware.com",
      "phone": "+1-555-0103",
      "address": {
        "street": "789 Industrial Blvd",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "USA"
      },
      "contact_person": "Mike Johnson",
      "payment_terms": "Net 45",
      "status": "active",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z"
    }
  ]
};

// Add inventory array that maps to products for POS system
mockData.inventory = mockData.products;

// Individual exports
export const mockInventory = mockData.inventory;
export const mockSuppliers = mockData.suppliers;
export const mockCustomers = mockData.customers;
export const mockTransactions = mockData.transactions;
export const mockCategories = mockData.categories;
export const mockAnalytics = mockData.analytics;
export const mockSales = mockData.sales;
export const mockPurchases = mockData.purchases;
export const mockStockTransfers = mockData.stockTransfers;
export const mockExpenses = mockData.expenses;

;
module.exports = { mockData };
