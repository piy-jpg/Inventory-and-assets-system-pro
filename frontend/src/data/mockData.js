// Smart Inventory System - Complete Database Mock Data
// Prisma ORM Schema Created - All Features Available

const mockData = {
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
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parent_id": null,
      "color": "#3B82F6",
      "icon": "CubeIcon",
      "status": "active",
      "product_count": 45,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-04-20T15:30:00Z",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z",
      "children": [
        {
          "_id": "CAT_011",
          "id": 11,
          "name": "Laptops",
          "description": "Laptop computers and accessories",
          "parent_id": 1,
          "color": "#10B981",
          "icon": "PackageIcon",
          "status": "active",
          "product_count": 12,
          "created_at": "2024-01-16T09:00:00Z",
          "updated_at": "2024-04-18T14:20:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_012",
          "id": 12,
          "name": "Smartphones",
          "description": "Mobile phones and accessories",
          "parent_id": 1,
          "color": "#F59E0B",
          "icon": "ShoppingBagIcon",
          "status": "active",
          "product_count": 18,
          "created_at": "2024-01-16T10:00:00Z",
          "updated_at": "2024-04-19T11:45:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_013",
          "id": 13,
          "name": "Tablets",
          "description": "Tablet computers and accessories",
          "parent_id": 1,
          "color": "#8B5CF6",
          "icon": "DocumentTextIcon",
          "status": "active",
          "product_count": 8,
          "created_at": "2024-01-16T11:00:00Z",
          "updated_at": "2024-04-17T16:30:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_014",
          "id": 14,
          "name": "Accessories",
          "description": "Electronic accessories and peripherals",
          "parent_id": 1,
          "color": "#EF4444",
          "icon": "TagIcon",
          "status": "active",
          "product_count": 7,
          "created_at": "2024-01-16T12:00:00Z",
          "updated_at": "2024-04-16T09:15:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        }
      ]
    },
    {
      "_id": "CAT_002",
      "id": 2,
      "name": "Clothing",
      "description": "Apparel and fashion items",
      "parent_id": null,
      "color": "#EC4899",
      "icon": "ShoppingBagIcon",
      "status": "active",
      "product_count": 67,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-04-20T12:45:00Z",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z",
      "children": [
        {
          "_id": "CAT_021",
          "id": 21,
          "name": "Men's Clothing",
          "description": "Clothing for men",
          "parent_id": 2,
          "color": "#6366F1",
          "icon": "PackageIcon",
          "status": "active",
          "product_count": 28,
          "created_at": "2024-01-16T13:00:00Z",
          "updated_at": "2024-04-19T10:30:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_022",
          "id": 22,
          "name": "Women's Clothing",
          "description": "Clothing for women",
          "parent_id": 2,
          "color": "#F472B6",
          "icon": "ShoppingBagIcon",
          "status": "active",
          "product_count": 32,
          "created_at": "2024-01-16T14:00:00Z",
          "updated_at": "2024-04-18T13:15:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_023",
          "id": 23,
          "name": "Kids' Clothing",
          "description": "Clothing for children",
          "parent_id": 2,
          "color": "#FCD34D",
          "icon": "TagIcon",
          "status": "active",
          "product_count": 7,
          "created_at": "2024-01-16T15:00:00Z",
          "updated_at": "2024-04-17T14:45:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        }
      ]
    },
    {
      "_id": "CAT_003",
      "id": 3,
      "name": "Home & Garden",
      "description": "Home improvement and garden supplies",
      "parent_id": null,
      "color": "#10B981",
      "icon": "BuildingOfficeIcon",
      "status": "active",
      "product_count": 34,
      "created_at": "2024-01-15T12:00:00Z",
      "updated_at": "2024-04-20T14:20:00Z",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z",
      "children": [
        {
          "_id": "CAT_031",
          "id": 31,
          "name": "Furniture",
          "description": "Home furniture and decor",
          "parent_id": 3,
          "color": "#84CC16",
          "icon": "CubeIcon",
          "status": "active",
          "product_count": 15,
          "created_at": "2024-01-16T16:00:00Z",
          "updated_at": "2024-04-19T15:45:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_032",
          "id": 32,
          "name": "Garden Tools",
          "description": "Gardening tools and supplies",
          "parent_id": 3,
          "color": "#22C55E",
          "icon": "TruckIcon",
          "status": "active",
          "product_count": 12,
          "created_at": "2024-01-16T17:00:00Z",
          "updated_at": "2024-04-18T16:30:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_033",
          "id": 33,
          "name": "Kitchen Supplies",
          "description": "Kitchen and dining items",
          "parent_id": 3,
          "color": "#14B8A6",
          "icon": "PackageIcon",
          "status": "active",
          "product_count": 7,
          "created_at": "2024-01-16T18:00:00Z",
          "updated_at": "2024-04-17T17:15:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        }
      ]
    },
    {
      "_id": "CAT_004",
      "id": 4,
      "name": "Sports & Outdoors",
      "description": "Sports equipment and outdoor gear",
      "parent_id": null,
      "color": "#F59E0B",
      "icon": "ArrowPathIcon",
      "status": "active",
      "product_count": 23,
      "created_at": "2024-01-15T13:00:00Z",
      "updated_at": "2024-04-20T13:30:00Z",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z",
      "children": [
        {
          "_id": "CAT_041",
          "id": 41,
          "name": "Fitness Equipment",
          "description": "Exercise and fitness gear",
          "parent_id": 4,
          "color": "#F97316",
          "icon": "CubeIcon",
          "status": "active",
          "product_count": 10,
          "created_at": "2024-01-16T19:00:00Z",
          "updated_at": "2024-04-19T14:15:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_042",
          "id": 42,
          "name": "Outdoor Gear",
          "description": "Camping and outdoor equipment",
          "parent_id": 4,
          "color": "#FB923C",
          "icon": "TruckIcon",
          "status": "active",
          "product_count": 8,
          "created_at": "2024-01-16T20:00:00Z",
          "updated_at": "2024-04-18T15:00:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_043",
          "id": 43,
          "name": "Sports Apparel",
          "description": "Athletic clothing and footwear",
          "parent_id": 4,
          "color": "#FDBA74",
          "icon": "ShoppingBagIcon",
          "status": "active",
          "product_count": 5,
          "created_at": "2024-01-16T21:00:00Z",
          "updated_at": "2024-04-17T15:45:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        }
      ]
    },
    {
      "_id": "CAT_005",
      "id": 5,
      "name": "Books & Media",
      "description": "Books, movies, and media products",
      "parent_id": null,
      "color": "#8B5CF6",
      "icon": "DocumentTextIcon",
      "status": "active",
      "product_count": 19,
      "created_at": "2024-01-15T14:00:00Z",
      "updated_at": "2024-04-20T11:15:00Z",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z",
      "children": [
        {
          "_id": "CAT_051",
          "id": 51,
          "name": "Fiction Books",
          "description": "Fiction literature and novels",
          "parent_id": 5,
          "color": "#A855F7",
          "icon": "PackageIcon",
          "status": "active",
          "product_count": 8,
          "created_at": "2024-01-16T22:00:00Z",
          "updated_at": "2024-04-19T12:30:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_052",
          "id": 52,
          "name": "Non-Fiction Books",
          "description": "Non-fiction and educational books",
          "parent_id": 5,
          "color": "#C084FC",
          "icon": "DocumentTextIcon",
          "status": "active",
          "product_count": 7,
          "created_at": "2024-01-16T23:00:00Z",
          "updated_at": "2024-04-18T13:45:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        },
        {
          "_id": "CAT_053",
          "id": 53,
          "name": "Digital Media",
          "description": "Digital books, music, and videos",
          "parent_id": 5,
          "color": "#E9D5FF",
          "icon": "TagIcon",
          "status": "active",
          "product_count": 4,
          "created_at": "2024-01-17T00:00:00Z",
          "updated_at": "2024-04-17T14:00:00Z",
          "createdAt": "2024-04-20T10:00:00Z",
          "updatedAt": "2024-04-20T10:00:00Z"
        }
      ]
    },
    {
      "_id": "CAT_006",
      "id": 6,
      "name": "Toys & Games",
      "description": "Toys, games, and entertainment",
      "parent_id": null,
      "color": "#EF4444",
      "icon": "TagIcon",
      "status": "inactive",
      "product_count": 0,
      "created_at": "2024-01-15T15:00:00Z",
      "updated_at": "2024-04-10T10:00:00Z",
      "createdAt": "2024-04-20T10:00:00Z",
      "updatedAt": "2024-04-20T10:00:00Z",
      "children": []
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
      "_id": "SALE_TODAY_001",
      "sale_id": "SALE_TODAY_001",
      "customer_id": "CUST_ABC_001",
      "customer_name": "ABC Corporation",
      "sale_date": "2026-04-27T10:30:00Z",
      "total_amount": 5249.95,
      "discount": 150,
      "tax_amount": 524.99,
      "final_amount": 5624.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Today's bulk order for new office setup",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 3,
          "unit_price": 1299.99,
          "total_price": 3899.97,
          "discount": 75
        },
        {
          "inventory_id": "INV_003",
          "product_name": "Mechanical Keyboard RGB",
          "quantity": 10,
          "unit_price": 129.99,
          "total_price": 1299.90,
          "discount": 75
        }
      ],
      "created_at": "2026-04-27T10:30:00Z",
      "updated_at": "2026-04-27T10:30:00Z"
    },
    {
      "_id": "SALE_TODAY_002",
      "sale_id": "SALE_TODAY_002",
      "customer_id": "CUST_XYZ_002",
      "customer_name": "XYZ Retail Store",
      "sale_date": "2026-04-27T14:15:00Z",
      "total_amount": 2499.95,
      "discount": 100,
      "tax_amount": 239.99,
      "final_amount": 2639.94,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Today's retail equipment purchase",
      "items": [
        {
          "inventory_id": "INV_002",
          "product_name": "Wireless Mouse Pro",
          "quantity": 15,
          "unit_price": 166.66,
          "total_price": 2499.90,
          "discount": 100
        }
      ],
      "created_at": "2026-04-27T14:15:00Z",
      "updated_at": "2026-04-27T14:15:00Z"
    },
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
      "customer_id": "CUST_MED_006",
      "customer_name": "Medical Equipment Co.",
      "sale_date": "2026-04-15T11:00:00Z",
      "total_amount": 12499.95,
      "discount": 750,
      "tax_amount": 1174.99,
      "final_amount": 12924.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Medical equipment purchase",
      "items": [
        {
          "inventory_id": "INV_004",
          "product_name": "4K Monitor 27\"",
          "quantity": 25,
          "unit_price": 499.99,
          "total_price": 12499.75,
          "discount": 750
        }
      ],
      "created_at": "2026-04-15T11:00:00Z",
      "updated_at": "2026-04-15T11:00:00Z"
    },
    {
      "_id": "SALE_005",
      "sale_id": "SALE_005",
      "customer_id": "CUST_GOV_008",
      "customer_name": "Government Agency",
      "sale_date": "2026-04-20T14:30:00Z",
      "total_amount": 19999.95,
      "discount": 1000,
      "tax_amount": 1899.99,
      "final_amount": 20899.94,
      "payment_status": "partial",
      "payment_method": "bank_transfer",
      "status": "pending",
      "notes": "Government contract equipment",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 15,
          "unit_price": 1333.33,
          "total_price": 19999.95,
          "discount": 1000
        }
      ],
      "created_at": "2026-04-20T14:30:00Z",
      "updated_at": "2026-04-20T14:30:00Z"
    },
    {
      "_id": "SALE_006",
      "sale_id": "SALE_006",
      "customer_id": "CUST_SUPERMART_007",
      "customer_name": "SuperMart Chain",
      "sale_date": "2026-03-15T10:00:00Z",
      "total_amount": 15499.95,
      "discount": 800,
      "tax_amount": 1469.99,
      "final_amount": 16169.94,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Retail chain bulk order",
      "items": [
        {
          "inventory_id": "INV_002",
          "product_name": "Wireless Mouse",
          "quantity": 100,
          "unit_price": 154.99,
          "total_price": 15499.00,
          "discount": 800
        }
      ],
      "created_at": "2026-03-15T10:00:00Z",
      "updated_at": "2026-03-15T10:00:00Z"
    },
    {
      "_id": "SALE_007",
      "sale_id": "SALE_007",
      "customer_id": "CUST_EDU_005",
      "customer_name": "University Campus Store",
      "sale_date": "2026-02-10T09:00:00Z",
      "total_amount": 22499.95,
      "discount": 1200,
      "tax_amount": 2129.99,
      "final_amount": 23429.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Educational institution bulk order",
      "items": [
        {
          "inventory_id": "INV_005",
          "product_name": "Tablet Pro 10\"",
          "quantity": 40,
          "unit_price": 562.49,
          "total_price": 22499.60,
          "discount": 1200
        }
      ],
      "created_at": "2026-02-10T09:00:00Z",
      "updated_at": "2026-02-10T09:00:00Z"
    },
    {
      "_id": "SALE_008",
      "sale_id": "SALE_008",
      "customer_id": "CUST_CONSULT_010",
      "customer_name": "Consulting Partners LLC",
      "sale_date": "2026-01-05T11:30:00Z",
      "total_amount": 9999.95,
      "discount": 500,
      "tax_amount": 949.99,
      "final_amount": 10449.94,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "Office equipment for consulting firm",
      "items": [
        {
          "inventory_id": "INV_003",
          "product_name": "Mechanical Keyboard RGB",
          "quantity": 80,
          "unit_price": 124.99,
          "total_price": 9999.20,
          "discount": 500
        }
      ],
      "created_at": "2026-01-05T11:30:00Z",
      "updated_at": "2026-01-05T11:30:00Z"
    },
    {
      "_id": "SALE_009",
      "sale_id": "SALE_009",
      "customer_id": "CUST_LOGISTICS_013",
      "customer_name": "Logistics Solutions Co.",
      "sale_date": "2025-12-12T08:00:00Z",
      "total_amount": 17999.95,
      "discount": 900,
      "tax_amount": 1709.99,
      "final_amount": 18809.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Logistics company equipment",
      "items": [
        {
          "inventory_id": "INV_004",
          "product_name": "4K Monitor 27\"",
          "quantity": 36,
          "unit_price": 499.99,
          "total_price": 17999.64,
          "discount": 900
        }
      ],
      "created_at": "2025-12-12T08:00:00Z",
      "updated_at": "2025-12-12T08:00:00Z"
    },
    {
      "_id": "SALE_010",
      "sale_id": "SALE_010",
      "customer_id": "CUST_MANUFACTURE_011",
      "customer_name": "Manufacturing Pro Inc.",
      "sale_date": "2025-11-08T13:00:00Z",
      "total_amount": 24999.95,
      "discount": 1250,
      "tax_amount": 2374.99,
      "final_amount": 26124.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Manufacturing equipment purchase",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 20,
          "unit_price": 1249.99,
          "total_price": 24999.80,
          "discount": 1250
        }
      ],
      "created_at": "2025-11-08T13:00:00Z",
      "updated_at": "2025-11-08T13:00:00Z"
    },
    {
      "_id": "SALE_011",
      "sale_id": "SALE_011",
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
      "_id": "PURCH_TODAY_001",
      "purchase_id": "PURCH_TODAY_001",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2026-04-27T09:00:00Z",
      "total_amount": 3499.95,
      "discount": 75,
      "tax_amount": 349.99,
      "final_amount": 3774.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "Today's inventory restock",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 3,
          "unit_price": 899.99,
          "total_price": 2699.97,
          "discount": 50
        },
        {
          "inventory_id": "INV_003",
          "product_name": "Mechanical Keyboard RGB",
          "quantity": 5,
          "unit_price": 79.99,
          "total_price": 399.95,
          "discount": 25
        }
      ],
      "created_at": "2026-04-27T09:00:00Z",
      "updated_at": "2026-04-27T09:00:00Z"
    },
    {
      "_id": "PURCH_MONTH_001",
      "purchase_id": "PURCH_MONTH_001",
      "supplier_id": "SUP_OFFICE_002",
      "supplier_name": "Office Depot Pro",
      "purchase_date": "2026-04-15T14:30:00Z",
      "total_amount": 2250.00,
      "discount": 100,
      "tax_amount": 215.00,
      "final_amount": 2365.00,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "April office supplies restock",
      "items": [
        {
          "inventory_id": "INV_003",
          "product_name": "Office Chair Ergonomic",
          "quantity": 15,
          "unit_price": 150.00,
          "total_price": 2250.00,
          "discount": 100
        }
      ],
      "created_at": "2026-04-15T14:30:00Z",
      "updated_at": "2026-04-15T14:30:00Z"
    },
    {
      "_id": "PURCH_MONTH_002",
      "purchase_id": "PURCH_MONTH_002",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2026-04-10T09:00:00Z",
      "total_amount": 5499.95,
      "discount": 250,
      "tax_amount": 524.99,
      "final_amount": 5774.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "April tech equipment restock",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 5,
          "unit_price": 1099.99,
          "total_price": 5499.95,
          "discount": 250
        }
      ],
      "created_at": "2026-04-10T09:00:00Z",
      "updated_at": "2026-04-10T09:00:00Z"
    },
    {
      "_id": "PURCH_MONTH_003",
      "purchase_id": "PURCH_MONTH_003",
      "supplier_id": "SUP_GLOBAL_003",
      "supplier_name": "Global Hardware Co.",
      "purchase_date": "2026-04-05T11:00:00Z",
      "total_amount": 7249.99,
      "discount": 350,
      "tax_amount": 689.99,
      "final_amount": 7589.98,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "April hardware bulk purchase",
      "items": [
        {
          "inventory_id": "INV_004",
          "product_name": "4K Monitor 27\"",
          "quantity": 15,
          "unit_price": 483.33,
          "total_price": 7249.95,
          "discount": 350
        }
      ],
      "created_at": "2026-04-05T11:00:00Z",
      "updated_at": "2026-04-05T11:00:00Z"
    },
    {
      "_id": "PURCH_MONTH_004",
      "purchase_id": "PURCH_MONTH_004",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2026-03-20T10:00:00Z",
      "total_amount": 18999.95,
      "discount": 1000,
      "tax_amount": 1799.99,
      "final_amount": 19799.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "March large tech equipment order",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 18,
          "unit_price": 1055.55,
          "total_price": 18999.90,
          "discount": 1000
        }
      ],
      "created_at": "2026-03-20T10:00:00Z",
      "updated_at": "2026-03-20T10:00:00Z"
    },
    {
      "_id": "PURCH_MONTH_005",
      "purchase_id": "PURCH_MONTH_005",
      "supplier_id": "SUP_OFFICE_002",
      "supplier_name": "Office Depot Pro",
      "purchase_date": "2026-03-10T14:00:00Z",
      "total_amount": 6149.95,
      "discount": 300,
      "tax_amount": 584.99,
      "final_amount": 6434.94,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "March office furniture order",
      "items": [
        {
          "inventory_id": "INV_003",
          "product_name": "Office Chair Ergonomic",
          "quantity": 40,
          "unit_price": 153.74,
          "total_price": 6149.60,
          "discount": 300
        }
      ],
      "created_at": "2026-03-10T14:00:00Z",
      "updated_at": "2026-03-10T14:00:00Z"
    },
    {
      "_id": "PURCH_MONTH_006",
      "purchase_id": "PURCH_MONTH_006",
      "supplier_id": "SUP_GLOBAL_003",
      "supplier_name": "Global Hardware Co.",
      "purchase_date": "2026-02-15T09:30:00Z",
      "total_amount": 12499.95,
      "discount": 600,
      "tax_amount": 1189.99,
      "final_amount": 13089.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "February hardware restock",
      "items": [
        {
          "inventory_id": "INV_004",
          "product_name": "4K Monitor 27\"",
          "quantity": 25,
          "unit_price": 499.99,
          "total_price": 12499.75,
          "discount": 600
        }
      ],
      "created_at": "2026-02-15T09:30:00Z",
      "updated_at": "2026-02-15T09:30:00Z"
    },
    {
      "_id": "PURCH_MONTH_007",
      "purchase_id": "PURCH_MONTH_007",
      "supplier_id": "SUP_TECH_001",
      "supplier_name": "Tech Supplies Inc.",
      "purchase_date": "2026-01-20T11:00:00Z",
      "total_amount": 24999.95,
      "discount": 1250,
      "tax_amount": 2374.99,
      "final_amount": 26124.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "January large tech purchase",
      "items": [
        {
          "inventory_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "quantity": 25,
          "unit_price": 999.99,
          "total_price": 24999.75,
          "discount": 1250
        }
      ],
      "created_at": "2026-01-20T11:00:00Z",
      "updated_at": "2026-01-20T11:00:00Z"
    },
    {
      "_id": "PURCH_MONTH_008",
      "purchase_id": "PURCH_MONTH_008",
      "supplier_id": "SUP_OFFICE_002",
      "supplier_name": "Office Depot Pro",
      "purchase_date": "2025-12-10T10:00:00Z",
      "total_amount": 8395.00,
      "discount": 400,
      "tax_amount": 799.50,
      "final_amount": 8794.50,
      "payment_status": "paid",
      "payment_method": "credit_card",
      "status": "completed",
      "notes": "December office supplies",
      "items": [
        {
          "inventory_id": "INV_003",
          "product_name": "Office Chair Ergonomic",
          "quantity": 55,
          "unit_price": 152.63,
          "total_price": 8394.65,
          "discount": 400
        }
      ],
      "created_at": "2025-12-10T10:00:00Z",
      "updated_at": "2025-12-10T10:00:00Z"
    },
    {
      "_id": "PURCH_MONTH_009",
      "purchase_id": "PURCH_MONTH_009",
      "supplier_id": "SUP_GLOBAL_003",
      "supplier_name": "Global Hardware Co.",
      "purchase_date": "2025-11-15T13:00:00Z",
      "total_amount": 17999.95,
      "discount": 900,
      "tax_amount": 1709.99,
      "final_amount": 18809.94,
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "status": "completed",
      "notes": "November hardware purchase",
      "items": [
        {
          "inventory_id": "INV_004",
          "product_name": "4K Monitor 27\"",
          "quantity": 36,
          "unit_price": 499.99,
          "total_price": 17999.64,
          "discount": 900
        }
      ],
      "created_at": "2025-11-15T13:00:00Z",
      "updated_at": "2025-11-15T13:00:00Z"
    },
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
      "_id": "EXP_MONTH_001",
      "title": "April electricity bill for main warehouse",
      "category": "utilities",
      "amount": 2800,
      "date": "2026-04-01",
      "description": "Monthly electricity bill for main warehouse",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Monthly"
    },
    {
      "_id": "EXP_MONTH_002",
      "title": "April warehouse rent",
      "category": "rent",
      "amount": 5500,
      "date": "2026-04-01",
      "description": "Monthly warehouse rental payment",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Monthly"
    },
    {
      "_id": "EXP_MONTH_003",
      "title": "April office stationery and printing supplies",
      "category": "office_supplies",
      "amount": 450,
      "date": "2026-04-05",
      "description": "Monthly office supplies restock",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "paid",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_MONTH_004",
      "title": "April business trip to client meeting",
      "category": "travel",
      "amount": 1500,
      "date": "2026-04-10",
      "description": "Flight and hotel expenses for client meeting",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "paid",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_MONTH_005",
      "title": "April internet and phone services",
      "category": "utilities",
      "amount": 350,
      "date": "2026-04-15",
      "description": "Monthly internet and phone bill",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Monthly"
    },
    {
      "_id": "EXP_001",
      "title": "Monthly electricity bill for main warehouse",
      "category": "utilities",
      "amount": 2500,
      "date": "2024-04-01",
      "description": "Monthly electricity bill for main warehouse",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Monthly"
    },
    {
      "_id": "EXP_002",
      "title": "Monthly warehouse rent",
      "category": "rent",
      "amount": 5000,
      "date": "2024-04-01",
      "description": "Monthly warehouse rental payment",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Monthly"
    },
    {
      "_id": "EXP_003",
      "title": "Office stationery and printing supplies",
      "category": "office_supplies",
      "amount": 350,
      "date": "2024-04-05",
      "description": "Monthly office supplies restock",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "paid",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_004",
      "title": "Business trip to client meeting",
      "category": "travel",
      "amount": 1200,
      "date": "2024-04-08",
      "description": "Flight and hotel expenses for client meeting",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "pending",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_005",
      "title": "Digital marketing campaign",
      "category": "marketing",
      "amount": 3000,
      "date": "2024-04-10",
      "description": "Q2 digital advertising expenses",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_006",
      "title": "Office equipment maintenance",
      "category": "maintenance",
      "amount": 450,
      "date": "2024-04-12",
      "description": "Annual printer and copier maintenance",
      "vendor": "",
      "paymentMethod": "cash",
      "status": "paid",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_007",
      "title": "Annual software licenses",
      "category": "software",
      "amount": 1800,
      "date": "2024-04-15",
      "description": "Microsoft Office and Adobe Creative Cloud licenses",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Annually"
    },
    {
      "_id": "EXP_008",
      "title": "Client dinner meeting",
      "category": "entertainment",
      "amount": 280,
      "date": "2024-04-18",
      "description": "Dinner with potential client",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "pending",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_009",
      "title": "Business insurance premium",
      "category": "insurance",
      "amount": 1200,
      "date": "2024-04-20",
      "description": "Quarterly business liability insurance",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Quarterly"
    },
    {
      "_id": "EXP_010",
      "title": "Employee training program",
      "category": "training",
      "amount": 750,
      "date": "2024-04-22",
      "description": "Sales team training workshop",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "pending",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_011",
      "title": "Water and sewage bill",
      "category": "utilities",
      "amount": 180,
      "date": "2024-04-02",
      "description": "Monthly water and sewage charges",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "paid",
      "recurring": true,
      "frequency": "Monthly"
    },
    {
      "_id": "EXP_012",
      "title": "Internet and phone services",
      "category": "telecommunications",
      "amount": 320,
      "date": "2024-04-03",
      "description": "Monthly internet and phone service charges",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "paid",
      "recurring": true,
      "frequency": "Monthly"
    },
    {
      "_id": "EXP_013",
      "title": "Company vehicle fuel expenses",
      "category": "fuel",
      "amount": 450,
      "date": "2024-04-06",
      "description": "Monthly fuel for delivery vehicles",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "paid",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_014",
      "title": "Legal consultation fees",
      "category": "legal",
      "amount": 800,
      "date": "2024-04-09",
      "description": "Contract review and legal advice",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "status": "pending",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_015",
      "title": "Office cleaning services",
      "category": "cleaning",
      "amount": 200,
      "date": "2024-04-11",
      "description": "Weekly office cleaning service",
      "vendor": "",
      "paymentMethod": "cash",
      "status": "paid",
      "recurring": true,
      "frequency": "Weekly"
    },
    {
      "_id": "EXP_016",
      "title": "Taxi and ride-sharing expenses",
      "category": "transportation",
      "amount": 150,
      "date": "2024-04-13",
      "description": "Business transportation costs",
      "vendor": "",
      "paymentMethod": "credit_card",
      "status": "paid",
      "recurring": false,
      "frequency": "One-time"
    },
    {
      "_id": "EXP_017",
      "title": "Business consulting services",
      "category": "consulting",
      "amount": 2200,
      "date": "2024-04-14",
      "description": "Strategic business consulting",
      "vendor": "",
      "paymentMethod": "bank_transfer",
      "expense_date": "2024-04-14T00:00:00Z",
      "payment_method": "bank_transfer",
      "status": "pending",
      "receipt_url": "https://example.com/receipts/consulting.pdf",
      "notes": "Strategic business consulting",
      "created_at": "2024-04-14T13:45:00Z",
      "updated_at": "2024-04-14T13:45:00Z"
    },
    {
      "_id": "EXP_018",
      "expense_id": "EXP_018",
      "category": "security",
      "description": "Security system monitoring",
      "amount": 125,
      "expense_date": "2024-04-16T00:00:00Z",
      "payment_method": "credit_card",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/security.pdf",
      "notes": "Monthly security monitoring service",
      "created_at": "2024-04-16T09:30:00Z",
      "updated_at": "2024-04-16T09:30:00Z"
    },
    {
      "_id": "EXP_019",
      "expense_id": "EXP_019",
      "category": "advertising",
      "description": "Local newspaper advertisement",
      "amount": 500,
      "expense_date": "2024-04-17T00:00:00Z",
      "payment_method": "cash",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/advertising.pdf",
      "notes": "Weekly newspaper ad placement",
      "created_at": "2024-04-17T12:00:00Z",
      "updated_at": "2024-04-17T12:00:00Z"
    },
    {
      "_id": "EXP_020",
      "expense_id": "EXP_020",
      "category": "supplies",
      "description": "Breakroom supplies and snacks",
      "amount": 85,
      "expense_date": "2024-04-19T00:00:00Z",
      "payment_method": "cash",
      "status": "paid",
      "receipt_url": "https://example.com/receipts/supplies.pdf",
      "notes": "Monthly breakroom restocking",
      "created_at": "2024-04-19T15:45:00Z",
      "updated_at": "2024-04-19T15:45:00Z"
    }
  ],
  "paymentAccounts": [
    {
      "_id": "ACC_001",
      "account_id": "ACC_BANK_001",
      "name": "Main Business Account",
      "account_type": "bank",
      "opening_balance": 10000,
      "current_balance": 15000,
      "bank_name": "First National Bank",
      "bank_branch": "Main Branch",
      "account_number": "1234567890",
      "upi_id": "",
      "card_number": "",
      "card_type": "",
      "status": "active",
      "created_at": "2024-04-01T00:00:00Z",
      "updated_at": "2024-04-20T10:00:00Z",
      "last_transaction": {
        "date": "2024-04-20T10:00:00Z",
        "amount": 5000,
        "type": "credit"
      }
    },
    {
      "_id": "ACC_002",
      "account_id": "ACC_CASH_001",
      "name": "Petty Cash",
      "account_type": "cash",
      "opening_balance": 2000,
      "current_balance": 2500,
      "bank_name": "",
      "bank_branch": "",
      "account_number": "",
      "upi_id": "",
      "card_number": "",
      "card_type": "",
      "status": "active",
      "created_at": "2024-04-01T00:00:00Z",
      "updated_at": "2024-04-20T10:00:00Z",
      "last_transaction": {
        "date": "2024-04-19T15:00:00Z",
        "amount": 500,
        "type": "credit"
      }
    },
    {
      "_id": "ACC_003",
      "account_id": "ACC_UPI_001",
      "name": "PayTM Wallet",
      "account_type": "upi",
      "opening_balance": 1000,
      "current_balance": 750,
      "bank_name": "",
      "bank_branch": "",
      "account_number": "",
      "upi_id": "user@paytm",
      "card_number": "",
      "card_type": "",
      "status": "active",
      "created_at": "2024-04-05T00:00:00Z",
      "updated_at": "2024-04-20T10:00:00Z",
      "last_transaction": {
        "date": "2024-04-18T14:30:00Z",
        "amount": 250,
        "type": "debit"
      }
    },
    {
      "_id": "ACC_004",
      "account_id": "ACC_CC_001",
      "name": "Business Credit Card",
      "account_type": "credit",
      "opening_balance": 0,
      "current_balance": -3200,
      "bank_name": "Chase Bank",
      "bank_branch": "",
      "account_number": "",
      "upi_id": "",
      "card_number": "4532",
      "card_type": "credit",
      "status": "active",
      "created_at": "2024-04-10T00:00:00Z",
      "updated_at": "2024-04-20T10:00:00Z",
      "last_transaction": {
        "date": "2024-04-17T16:45:00Z",
        "amount": 1200,
        "type": "debit"
      }
    }
  ],
  "paymentTransactions": [
    {
      "_id": "TXN_001",
      "transaction_id": "TXN_001",
      "from_account": "ACC_001",
      "to_account": null,
      "amount": 5000,
      "transaction_type": "deposit",
      "description": "Monthly revenue deposit",
      "transaction_date": "2026-04-20T10:00:00Z",
      "status": "completed",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z"
    },
    {
      "_id": "TXN_002",
      "transaction_id": "TXN_002",
      "from_account": "ACC_001",
      "to_account": null,
      "amount": 1200,
      "transaction_type": "withdraw",
      "description": "Office rent payment",
      "transaction_date": "2026-04-19T15:00:00Z",
      "status": "completed",
      "created_at": "2026-04-19T15:00:00Z",
      "updated_at": "2026-04-19T15:00:00Z"
    },
    {
      "_id": "TXN_003",
      "transaction_id": "TXN_003",
      "from_account": "ACC_002",
      "to_account": null,
      "amount": 500,
      "transaction_type": "deposit",
      "description": "Petty cash replenishment",
      "transaction_date": "2026-04-19T15:00:00Z",
      "status": "completed",
      "created_at": "2026-04-19T15:00:00Z",
      "updated_at": "2026-04-19T15:00:00Z"
    },
    {
      "_id": "TXN_004",
      "transaction_id": "TXN_004",
      "from_account": "ACC_003",
      "to_account": null,
      "amount": 250,
      "transaction_type": "withdraw",
      "description": "Online purchase payment",
      "transaction_date": "2026-04-18T14:30:00Z",
      "status": "completed",
      "created_at": "2026-04-18T14:30:00Z",
      "updated_at": "2026-04-18T14:30:00Z"
    },
    {
      "_id": "TXN_005",
      "transaction_id": "TXN_005",
      "from_account": "ACC_004",
      "to_account": null,
      "amount": 1200,
      "transaction_type": "withdraw",
      "description": "Business lunch expense",
      "transaction_date": "2026-04-17T16:45:00Z",
      "status": "completed",
      "created_at": "2026-04-17T16:45:00Z",
      "updated_at": "2026-04-17T16:45:00Z"
    },
    {
      "_id": "TXN_006",
      "transaction_id": "TXN_006",
      "from_account": "ACC_001",
      "to_account": "ACC_002",
      "amount": 800,
      "transaction_type": "transfer",
      "description": "Transfer to petty cash",
      "transaction_date": "2026-04-15T11:20:00Z",
      "status": "completed",
      "created_at": "2026-04-15T11:20:00Z",
      "updated_at": "2026-04-15T11:20:00Z"
    },
    {
      "_id": "TXN_007",
      "transaction_id": "TXN_007",
      "from_account": "ACC_001",
      "to_account": null,
      "amount": 3000,
      "transaction_type": "deposit",
      "description": "Client payment received",
      "transaction_date": "2026-04-14T09:30:00Z",
      "status": "completed",
      "created_at": "2026-04-14T09:30:00Z",
      "updated_at": "2026-04-14T09:30:00Z"
    },
    {
      "_id": "TXN_008",
      "transaction_id": "TXN_008",
      "from_account": "ACC_004",
      "to_account": null,
      "amount": 450,
      "transaction_type": "withdraw",
      "description": "Office supplies purchase",
      "transaction_date": "2026-04-13T14:15:00Z",
      "status": "completed",
      "created_at": "2026-04-13T14:15:00Z",
      "updated_at": "2026-04-13T14:15:00Z"
    },
    {
      "_id": "TXN_009",
      "transaction_id": "TXN_009",
      "from_account": "ACC_003",
      "to_account": null,
      "amount": 150,
      "transaction_type": "withdraw",
      "description": "Mobile recharge",
      "transaction_date": "2026-04-12T18:45:00Z",
      "status": "completed",
      "created_at": "2026-04-12T18:45:00Z",
      "updated_at": "2026-04-12T18:45:00Z"
    },
    {
      "_id": "TXN_010",
      "transaction_id": "TXN_010",
      "from_account": "ACC_002",
      "to_account": null,
      "amount": 75,
      "transaction_type": "withdraw",
      "description": "Coffee and snacks",
      "transaction_date": "2026-04-11T10:30:00Z",
      "status": "completed",
      "created_at": "2026-04-11T10:30:00Z",
      "updated_at": "2026-04-11T10:30:00Z"
    },
    {
      "_id": "TXN_011",
      "transaction_id": "TXN_011",
      "from_account": "ACC_001",
      "to_account": null,
      "amount": 8500,
      "transaction_type": "deposit",
      "description": "Large client payment received",
      "transaction_date": "2026-04-27T09:00:00Z",
      "status": "completed",
      "created_at": "2026-04-27T09:00:00Z",
      "updated_at": "2026-04-27T09:00:00Z"
    },
    {
      "_id": "TXN_012",
      "transaction_id": "TXN_012",
      "from_account": "ACC_001",
      "to_account": "ACC_002",
      "amount": 1500,
      "transaction_type": "transfer",
      "description": "Weekly transfer to petty cash",
      "transaction_date": "2026-04-27T10:30:00Z",
      "status": "completed",
      "created_at": "2026-04-27T10:30:00Z",
      "updated_at": "2026-04-27T10:30:00Z"
    },
    {
      "_id": "TXN_013",
      "transaction_id": "TXN_013",
      "from_account": "ACC_003",
      "to_account": null,
      "amount": 320,
      "transaction_type": "withdraw",
      "description": "Software subscription payment",
      "transaction_date": "2026-04-26T14:00:00Z",
      "status": "completed",
      "created_at": "2026-04-26T14:00:00Z",
      "updated_at": "2026-04-26T14:00:00Z"
    },
    {
      "_id": "TXN_014",
      "transaction_id": "TXN_014",
      "from_account": "ACC_001",
      "to_account": null,
      "amount": 4200,
      "transaction_type": "deposit",
      "description": "Product sales revenue",
      "transaction_date": "2026-04-25T11:00:00Z",
      "status": "completed",
      "created_at": "2026-04-25T11:00:00Z",
      "updated_at": "2026-04-25T11:00:00Z"
    },
    {
      "_id": "TXN_015",
      "transaction_id": "TXN_015",
      "from_account": "ACC_004",
      "to_account": null,
      "amount": 180,
      "transaction_type": "withdraw",
      "description": "Team lunch expense",
      "transaction_date": "2026-04-24T12:30:00Z",
      "status": "completed",
      "created_at": "2026-04-24T12:30:00Z",
      "updated_at": "2026-04-24T12:30:00Z"
    },
    {
      "_id": "TXN_016",
      "transaction_id": "TXN_016",
      "from_account": "ACC_001",
      "to_account": "ACC_003",
      "amount": 2500,
      "transaction_type": "transfer",
      "description": "Vendor payment transfer",
      "transaction_date": "2026-04-23T15:00:00Z",
      "status": "completed",
      "created_at": "2026-04-23T15:00:00Z",
      "updated_at": "2026-04-23T15:00:00Z"
    },
    {
      "_id": "TXN_017",
      "transaction_id": "TXN_017",
      "from_account": "ACC_001",
      "to_account": null,
      "amount": 6800,
      "transaction_type": "deposit",
      "description": "Monthly service revenue",
      "transaction_date": "2026-04-22T09:00:00Z",
      "status": "completed",
      "created_at": "2026-04-22T09:00:00Z",
      "updated_at": "2026-04-22T09:00:00Z"
    },
    {
      "_id": "TXN_018",
      "transaction_id": "TXN_018",
      "from_account": "ACC_002",
      "to_account": null,
      "amount": 95,
      "transaction_type": "withdraw",
      "description": "Office supplies restock",
      "transaction_date": "2026-04-21T16:00:00Z",
      "status": "completed",
      "created_at": "2026-04-21T16:00:00Z",
      "updated_at": "2026-04-21T16:00:00Z"
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
      "created_at": "2024-04-23T12:00:00Z",
      "expires_at": "2024-04-24T12:00:00Z",
      "status": "active"
    },
    {
      "_id": "ALT_003",
      "alert_id": "ALT_003",
      "title": "Low Stock Alert",
      "message": "Product \"Wireless Mouse\" is running low on stock (3 units remaining).",
      "alert_type": "low_stock",
      "severity": "high",
      "module": "inventory",
      "reference_id": "INV_MOUSE_001",
      "reference_type": "product",
      "is_active": true,
      "created_at": "2024-04-23T14:30:00Z",
      "expires_at": "2024-04-26T14:30:00Z",
      "status": "active"
    },
    {
      "_id": "ALT_008",
      "alert_id": "ALT_008",
      "title": "Low Stock Warning",
      "message": "Product \"USB-C Cable\" stock is below reorder point (8 units remaining).",
      "alert_type": "low_stock",
      "severity": "warning",
      "module": "inventory",
      "reference_id": "INV_CABLE_001",
      "reference_type": "product",
      "is_active": true,
      "created_at": "2024-04-23T18:00:00Z",
      "expires_at": "2024-04-25T18:00:00Z",
      "status": "active"
    },
    {
      "_id": "ALT_009",
      "alert_id": "ALT_009",
      "title": "Critical: Out of Stock",
      "message": "Product \"Office Chair\" is completely out of stock. Immediate reorder required.",
      "alert_type": "out_of_stock",
      "severity": "critical",
      "module": "inventory",
      "reference_id": "INV_CHAIR_001",
      "reference_type": "product",
      "is_active": true,
      "created_at": "2024-04-23T19:30:00Z",
      "expires_at": "2024-04-24T19:30:00Z",
      "status": "active"
    },
    {
      "_id": "ALT_010",
      "alert_id": "ALT_010",
      "title": "Low Stock Alert",
      "message": "Product \"Keyboard\" stock is critically low (2 units remaining).",
      "alert_type": "low_stock",
      "severity": "high",
      "module": "inventory",
      "reference_id": "INV_KEYBOARD_001",
      "reference_type": "product",
      "is_active": true,
      "created_at": "2024-04-23T20:15:00Z",
      "expires_at": "2024-04-26T20:15:00Z",
      "status": "active"
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
  ],
  "invoices": [
    {
      "_id": "INV_001",
      "invoice_id": "INV-2026-001",
      "customer_id": "CUST_ABC_001",
      "customer_name": "ABC Corporation",
      "sale_id": "SALE_001",
      "invoice_number": "INV-2026-001",
      "invoice_date": "2026-03-25T10:30:00Z",
      "due_date": "2026-04-24T10:30:00Z",
      "status": "paid",
      "subtotal": 3249.95,
      "tax_amount": 324.99,
      "discount_amount": 100,
      "total_amount": 3474.94,
      "paid_amount": 3474.94,
      "balance_amount": 0,
      "payment_method": "bank_transfer",
      "payment_status": "fully_paid",
      "billing_address": {
        "street": "123 Business Ave",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "shipping_address": {
        "street": "123 Business Ave",
        "city": "New York", 
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "items": [
        {
          "product_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "description": "High-performance laptop with 15\" display",
          "quantity": 2,
          "unit_price": 1299.99,
          "total_price": 2599.98,
          "tax_rate": 0.10,
          "tax_amount": 259.99,
          "discount_amount": 50
        },
        {
          "product_id": "INV_003",
          "product_name": "Mechanical Keyboard RGB",
          "description": "RGB mechanical keyboard with custom switches",
          "quantity": 5,
          "unit_price": 129.99,
          "total_price": 649.95,
          "tax_rate": 0.10,
          "tax_amount": 64.99,
          "discount_amount": 50
        }
      ],
      "notes": "Bulk order for new office setup - Payment received via wire transfer",
      "created_by": "admin",
      "created_at": "2026-03-25T10:30:00Z",
      "updated_at": "2026-03-28T14:15:00Z"
    },
    {
      "_id": "INV_002",
      "invoice_id": "INV-2026-002",
      "customer_id": "CUST_RETAIL_002",
      "customer_name": "XYZ Retail Store",
      "sale_id": "SALE_002",
      "invoice_number": "INV-2026-002",
      "invoice_date": "2026-03-28T14:15:00Z",
      "due_date": "2026-04-27T14:15:00Z",
      "status": "pending",
      "subtotal": 1499.95,
      "tax_amount": 149.99,
      "discount_amount": 75,
      "total_amount": 1574.94,
      "paid_amount": 787.47,
      "balance_amount": 787.47,
      "payment_method": "credit_card",
      "payment_status": "partially_paid",
      "billing_address": {
        "street": "456 Market St",
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90001",
        "country": "USA"
      },
      "shipping_address": {
        "street": "456 Market St",
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90001",
        "country": "USA"
      },
      "items": [
        {
          "product_id": "INV_002",
          "product_name": "Wireless Mouse Pro",
          "description": "Ergonomic wireless mouse with precision tracking",
          "quantity": 10,
          "unit_price": 149.99,
          "total_price": 1499.95,
          "tax_rate": 0.10,
          "tax_amount": 149.99,
          "discount_amount": 75
        }
      ],
      "notes": "Retail store inventory replenishment - Partial payment received",
      "created_by": "sales_agent_1",
      "created_at": "2026-03-28T14:15:00Z",
      "updated_at": "2026-04-01T09:30:00Z"
    },
    {
      "_id": "INV_003",
      "invoice_id": "INV-2026-003",
      "customer_id": "CUST_STARTUP_003",
      "customer_name": "TechStart Solutions",
      "sale_id": "SALE_003",
      "invoice_number": "INV-2026-003",
      "invoice_date": "2026-04-02T09:30:00Z",
      "due_date": "2026-05-02T09:30:00Z",
      "status": "overdue",
      "subtotal": 8999.95,
      "tax_amount": 899.99,
      "discount_amount": 500,
      "total_amount": 9399.94,
      "paid_amount": 0,
      "balance_amount": 9399.94,
      "payment_method": "purchase_order",
      "payment_status": "unpaid",
      "billing_address": {
        "street": "789 Innovation Dr",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94102",
        "country": "USA"
      },
      "shipping_address": {
        "street": "789 Innovation Dr",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94102",
        "country": "USA"
      },
      "items": [
        {
          "product_id": "INV_004",
          "product_name": "4K Monitor Ultra",
          "description": "Professional 4K monitor with HDR support",
          "quantity": 3,
          "unit_price": 2999.98,
          "total_price": 8999.94,
          "tax_rate": 0.10,
          "tax_amount": 899.99,
          "discount_amount": 500
        }
      ],
      "notes": "Startup office equipment upgrade - Payment pending PO approval",
      "created_by": "sales_agent_2",
      "created_at": "2026-04-02T09:30:00Z",
      "updated_at": "2026-04-15T11:20:00Z"
    },
    {
      "_id": "INV_004",
      "invoice_id": "INV-2026-004",
      "customer_id": "CUST_EDU_004",
      "customer_name": "Educational Institution",
      "sale_id": "SALE_004",
      "invoice_number": "INV-2026-004",
      "invoice_date": "2026-04-05T16:45:00Z",
      "due_date": "2026-05-05T16:45:00Z",
      "status": "paid",
      "subtotal": 5699.88,
      "tax_amount": 569.99,
      "discount_amount": 200,
      "total_amount": 6069.87,
      "paid_amount": 6069.87,
      "balance_amount": 0,
      "payment_method": "bank_transfer",
      "payment_status": "fully_paid",
      "billing_address": {
        "street": "321 Campus Blvd",
        "city": "Boston",
        "state": "MA",
        "zip": "02101",
        "country": "USA"
      },
      "shipping_address": {
        "street": "321 Campus Blvd",
        "city": "Boston",
        "state": "MA",
        "zip": "02101",
        "country": "USA"
      },
      "items": [
        {
          "product_id": "INV_005",
          "product_name": "Tablet Pro 12",
          "description": "Professional tablet with stylus support",
          "quantity": 8,
          "unit_price": 712.48,
          "total_price": 5699.84,
          "tax_rate": 0.10,
          "tax_amount": 569.98,
          "discount_amount": 200
        }
      ],
      "notes": "Educational tablet program for students - Payment processed",
      "created_by": "admin",
      "created_at": "2026-04-05T16:45:00Z",
      "updated_at": "2026-04-10T13:15:00Z"
    },
    {
      "_id": "INV_005",
      "invoice_id": "INV-2026-005",
      "customer_id": "CUST_MEDICAL_005",
      "customer_name": "Medical Equipment Supplier",
      "sale_id": "SALE_005",
      "invoice_number": "INV-2026-005",
      "invoice_date": "2026-04-08T11:20:00Z",
      "due_date": "2026-05-08T11:20:00Z",
      "status": "pending",
      "subtotal": 12499.70,
      "tax_amount": 1249.97,
      "discount_amount": 750,
      "total_amount": 12999.67,
      "paid_amount": 6499.83,
      "balance_amount": 6499.84,
      "payment_method": "credit_card",
      "payment_status": "partially_paid",
      "billing_address": {
        "street": "654 Medical Center Dr",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "USA"
      },
      "shipping_address": {
        "street": "654 Medical Center Dr",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "USA"
      },
      "items": [
        {
          "product_id": "INV_006",
          "product_name": "Medical Display System",
          "description": "Medical-grade display system with calibration",
          "quantity": 5,
          "unit_price": 2499.94,
          "total_price": 12499.70,
          "tax_rate": 0.10,
          "tax_amount": 1249.97,
          "discount_amount": 750
        }
      ],
      "notes": "Medical facility display upgrade - 50% payment received",
      "created_by": "sales_agent_1",
      "created_at": "2026-04-08T11:20:00Z",
      "updated_at": "2026-04-12T16:30:00Z"
    }
  ],
  "payments": [
    {
      "_id": "PAY_001",
      "payment_id": "PAY-2026-001",
      "invoice_id": "INV-2026-001",
      "customer_id": "CUST_ABC_001",
      "customer_name": "ABC Corporation",
      "payment_date": "2026-03-28T14:15:00Z",
      "payment_method": "bank_transfer",
      "payment_type": "full_payment",
      "amount": 3474.94,
      "currency": "USD",
      "status": "completed",
      "transaction_id": "TXN-BANK-20260328001",
      "reference_number": "REF-ABC-001",
      "bank_name": "Chase Bank",
      "account_number": "****1234",
      "description": "Full payment for invoice INV-2026-001",
      "notes": "Payment processed successfully - funds cleared",
      "created_by": "admin",
      "created_at": "2026-03-28T14:15:00Z",
      "updated_at": "2026-03-28T14:15:00Z"
    },
    {
      "_id": "PAY_002",
      "payment_id": "PAY-2026-002",
      "invoice_id": "INV-2026-002",
      "customer_id": "CUST_RETAIL_002",
      "customer_name": "XYZ Retail Store",
      "payment_date": "2026-04-01T09:30:00Z",
      "payment_method": "credit_card",
      "payment_type": "partial_payment",
      "amount": 787.47,
      "currency": "USD",
      "status": "completed",
      "transaction_id": "TXN-CC-20260401001",
      "reference_number": "REF-XYZ-002",
      "card_type": "Visa",
      "card_last_four": "4242",
      "description": "Partial payment for invoice INV-2026-002",
      "notes": "50% payment received via credit card",
      "created_by": "sales_agent_1",
      "created_at": "2026-04-01T09:30:00Z",
      "updated_at": "2026-04-01T09:30:00Z"
    },
    {
      "_id": "PAY_003",
      "payment_id": "PAY-2026-003",
      "invoice_id": "INV-2026-004",
      "customer_id": "CUST_EDU_004",
      "customer_name": "Educational Institution",
      "payment_date": "2026-04-10T13:15:00Z",
      "payment_method": "bank_transfer",
      "payment_type": "full_payment",
      "amount": 6069.87,
      "currency": "USD",
      "status": "completed",
      "transaction_id": "TXN-BANK-20260410001",
      "reference_number": "REF-EDU-004",
      "bank_name": "Bank of America",
      "account_number": "****5678",
      "description": "Full payment for invoice INV-2026-004",
      "notes": "Educational institution payment processed",
      "created_by": "admin",
      "created_at": "2026-04-10T13:15:00Z",
      "updated_at": "2026-04-10T13:15:00Z"
    },
    {
      "_id": "PAY_004",
      "payment_id": "PAY-2026-004",
      "invoice_id": "INV-2026-005",
      "customer_id": "CUST_MEDICAL_005",
      "customer_name": "Medical Equipment Supplier",
      "payment_date": "2026-04-12T16:30:00Z",
      "payment_method": "credit_card",
      "payment_type": "partial_payment",
      "amount": 6499.83,
      "currency": "USD",
      "status": "completed",
      "transaction_id": "TXN-CC-20260412001",
      "reference_number": "REF-MED-005",
      "card_type": "Mastercard",
      "card_last_four": "5555",
      "description": "Partial payment for invoice INV-2026-005",
      "notes": "50% down payment for medical equipment",
      "created_by": "sales_agent_1",
      "created_at": "2026-04-12T16:30:00Z",
      "updated_at": "2026-04-12T16:30:00Z"
    },
    {
      "_id": "PAY_005",
      "payment_id": "PAY-2026-005",
      "invoice_id": null,
      "customer_id": "CUST_RETAIL_007",
      "customer_name": "SuperMart Chain",
      "payment_date": "2026-04-15T10:00:00Z",
      "payment_method": "cash",
      "payment_type": "advance_payment",
      "amount": 5000.00,
      "currency": "USD",
      "status": "completed",
      "transaction_id": "TXN-CASH-20260415001",
      "reference_number": "REF-SUP-007",
      "description": "Advance payment for future orders",
      "notes": "Advance payment received for bulk order planning",
      "created_by": "admin",
      "created_at": "2026-04-15T10:00:00Z",
      "updated_at": "2026-04-15T10:00:00Z"
    }
  ],
  "salesReturns": [
    {
      "_id": "RET_001",
      "return_id": "RET-2026-001",
      "invoice_id": "INV-2026-002",
      "customer_id": "CUST_RETAIL_002",
      "customer_name": "XYZ Retail Store",
      "return_date": "2026-04-10T11:30:00Z",
      "reason": "defective_product",
      "reason_description": "2 units not functioning properly - cursor tracking issues",
      "status": "approved",
      "total_refund_amount": 299.98,
      "refund_method": "credit_card",
      "refund_status": "processed",
      "items": [
        {
          "product_id": "INV_002",
          "product_name": "Wireless Mouse Pro",
          "quantity": 2,
          "unit_price": 149.99,
          "total_price": 299.98,
          "return_reason": "defective",
          "condition": "used_defective"
        }
      ],
      "notes": "Customer reported tracking issues with 2 units - Refund processed to original card",
      "processed_by": "admin",
      "created_at": "2026-04-10T11:30:00Z",
      "updated_at": "2026-04-12T14:20:00Z"
    },
    {
      "_id": "RET_002",
      "return_id": "RET-2026-002",
      "invoice_id": "INV-2026-003",
      "customer_id": "CUST_STARTUP_003",
      "customer_name": "TechStart Solutions",
      "return_date": "2026-04-18T15:45:00Z",
      "reason": "wrong_item",
      "reason_description": "Ordered 4K monitors but received standard HD monitors",
      "status": "pending",
      "total_refund_amount": 5999.96,
      "refund_method": "bank_transfer",
      "refund_status": "pending",
      "items": [
        {
          "product_id": "INV_004",
          "product_name": "4K Monitor Ultra",
          "quantity": 2,
          "unit_price": 2999.98,
          "total_price": 5999.96,
          "return_reason": "wrong_item_shipped",
          "condition": "unopened"
        }
      ],
      "notes": "Wrong items shipped - Customer waiting for replacement and refund",
      "processed_by": "sales_agent_2",
      "created_at": "2026-04-18T15:45:00Z",
      "updated_at": "2026-04-20T09:15:00Z"
    },
    {
      "_id": "RET_003",
      "return_id": "RET-2026-003",
      "invoice_id": null,
      "customer_id": "CUST_CONSULT_010",
      "customer_name": "Consulting Partners LLC",
      "return_date": "2026-04-22T13:20:00Z",
      "reason": "damaged_in_transit",
      "reason_description": "Package arrived with damaged items - screen cracked on tablet",
      "status": "approved",
      "total_refund_amount": 712.48,
      "refund_method": "store_credit",
      "refund_status": "processed",
      "items": [
        {
          "product_id": "INV_005",
          "product_name": "Tablet Pro 12",
          "quantity": 1,
          "unit_price": 712.48,
          "total_price": 712.48,
          "return_reason": "shipping_damage",
          "condition": "damaged"
        }
      ],
      "notes": "Shipping damage confirmed via photos - Store credit issued",
      "processed_by": "admin",
      "created_at": "2026-04-22T13:20:00Z",
      "updated_at": "2026-04-23T10:45:00Z"
    }
  ],
  "quotations": [
    {
      "_id": "QUO_001",
      "quotation_id": "QUO-2026-001",
      "customer_id": "CUST_GOV_008",
      "customer_name": "Government Agency",
      "quotation_number": "QUO-2026-001",
      "quotation_date": "2026-04-15T09:00:00Z",
      "valid_until": "2026-05-15T09:00:00Z",
      "status": "pending",
      "subtotal": 15000.00,
      "tax_amount": 1500.00,
      "discount_amount": 750.00,
      "total_amount": 15750.00,
      "contact_person": "John Smith",
      "contact_email": "john.smith@govagency.gov",
      "contact_phone": "+1234567900",
      "items": [
        {
          "product_id": "INV_001",
          "product_name": "Laptop Pro 15\"",
          "description": "High-performance laptop for government use",
          "quantity": 5,
          "unit_price": 1299.99,
          "total_price": 6499.95,
          "tax_rate": 0.10,
          "tax_amount": 649.99,
          "discount_amount": 250.00
        },
        {
          "product_id": "INV_004",
          "product_name": "4K Monitor Ultra",
          "description": "Professional monitors for command center",
          "quantity": 3,
          "unit_price": 2999.98,
          "total_price": 8999.94,
          "tax_rate": 0.10,
          "tax_amount": 899.99,
          "discount_amount": 500.00
        }
      ],
      "terms_and_conditions": "Payment terms: Net 30 days. Delivery within 2 weeks of order confirmation.",
      "notes": "Government procurement quote - Special pricing applied",
      "created_by": "sales_agent_2",
      "created_at": "2026-04-15T09:00:00Z",
      "updated_at": "2026-04-18T14:30:00Z"
    },
    {
      "_id": "QUO_002",
      "quotation_id": "QUO-2026-002",
      "customer_id": "CUST_STARTUP_009",
      "customer_name": "Startup Innovations Lab",
      "quotation_number": "QUO-2026-002",
      "quotation_date": "2026-04-18T11:15:00Z",
      "valid_until": "2026-05-18T11:15:00Z",
      "status": "accepted",
      "subtotal": 8500.00,
      "tax_amount": 850.00,
      "discount_amount": 425.00,
      "total_amount": 8925.00,
      "contact_person": "Sarah Johnson",
      "contact_email": "sarah@startuplab.io",
      "contact_phone": "+1234567901",
      "items": [
        {
          "product_id": "INV_002",
          "product_name": "Wireless Mouse Pro",
          "description": "Ergonomic mice for development team",
          "quantity": 20,
          "unit_price": 149.99,
          "total_price": 2999.80,
          "tax_rate": 0.10,
          "tax_amount": 299.98,
          "discount_amount": 150.00
        },
        {
          "product_id": "INV_003",
          "product_name": "Mechanical Keyboard RGB",
          "description": "RGB keyboards for developers",
          "quantity": 15,
          "unit_price": 129.99,
          "total_price": 1949.85,
          "tax_rate": 0.10,
          "tax_amount": 194.98,
          "discount_amount": 100.00
        },
        {
          "product_id": "INV_005",
          "product_name": "Tablet Pro 12",
          "description": "Tablets for mobile development testing",
          "quantity": 5,
          "unit_price": 712.48,
          "total_price": 3562.40,
          "tax_rate": 0.10,
          "tax_amount": 356.24,
          "discount_amount": 175.00
        }
      ],
      "terms_and_conditions": "Payment terms: 50% advance, 50% on delivery. Startup discount applied.",
      "notes": "Startup package quote - Accepted by customer, converting to order",
      "created_by": "sales_agent_1",
      "created_at": "2026-04-18T11:15:00Z",
      "updated_at": "2026-04-20T16:45:00Z"
    },
    {
      "_id": "QUO_003",
      "quotation_id": "QUO-2026-003",
      "customer_id": "CUST_MANUFACTURE_011",
      "customer_name": "Manufacturing Pro Inc.",
      "quotation_number": "QUO-2026-003",
      "quotation_date": "2026-04-20T14:30:00Z",
      "valid_until": "2026-05-20T14:30:00Z",
      "status": "expired",
      "subtotal": 12000.00,
      "tax_amount": 1200.00,
      "discount_amount": 600.00,
      "total_amount": 12600.00,
      "contact_person": "Mike Wilson",
      "contact_email": "mike@manufacturingpro.com",
      "contact_phone": "+1234567903",
      "items": [
        {
          "product_id": "INV_006",
          "product_name": "Medical Display System",
          "description": "Industrial displays for manufacturing floor",
          "quantity": 4,
          "unit_price": 2999.99,
          "total_price": 11999.96,
          "tax_rate": 0.10,
          "tax_amount": 1199.99,
          "discount_amount": 600.00
        }
      ],
      "terms_and_conditions": "Payment terms: Net 45 days. Installation included.",
      "notes": "Manufacturing display quote - Expired without response",
      "created_by": "sales_agent_2",
      "created_at": "2026-04-20T14:30:00Z",
      "updated_at": "2026-05-21T09:00:00Z"
    }
  ],
  "salesReports": [
    {
      "_id": "RPT_001",
      "report_id": "RPT-SALES-2026-Q1",
      "report_name": "Q1 2026 Sales Performance Report",
      "report_type": "quarterly",
      "period_start": "2026-01-01T00:00:00Z",
      "period_end": "2026-03-31T23:59:59Z",
      "generated_date": "2026-04-01T10:00:00Z",
      "generated_by": "admin",
      "status": "completed",
      "metrics": {
        "total_sales": 125750.00,
        "total_orders": 45,
        "average_order_value": 2794.44,
        "total_customers": 28,
        "new_customers": 12,
        "return_rate": 0.032,
        "top_product": "Laptop Pro 15\"",
        "top_customer": "ABC Corporation",
        "sales_growth": 0.15
      },
      "breakdown": {
        "by_month": [
          {
            "month": "2026-01",
            "sales": 35000.00,
            "orders": 12,
            "customers": 8
          },
          {
            "month": "2026-02", 
            "sales": 42500.00,
            "orders": 15,
            "customers": 10
          },
          {
            "month": "2026-03",
            "sales": 48250.00,
            "orders": 18,
            "customers": 12
          }
        ],
        "by_product": [
          {
            "product_name": "Laptop Pro 15\"",
            "sales": 38999.70,
            "quantity": 30,
            "revenue_percentage": 0.31
          },
          {
            "product_name": "4K Monitor Ultra",
            "sales": 35999.64,
            "quantity": 12,
            "revenue_percentage": 0.29
          },
          {
            "product_name": "Tablet Pro 12",
            "sales": 28499.52,
            "quantity": 40,
            "revenue_percentage": 0.23
          }
        ],
        "by_customer": [
          {
            "customer_name": "ABC Corporation",
            "sales": 15500.00,
            "orders": 3,
            "revenue_percentage": 0.12
          },
          {
            "customer_name": "TechStart Solutions",
            "sales": 12500.00,
            "orders": 2,
            "revenue_percentage": 0.10
          },
          {
            "customer_name": "Medical Equipment Supplier",
            "sales": 11000.00,
            "orders": 2,
            "revenue_percentage": 0.09
          }
        ]
      },
      "created_at": "2026-04-01T10:00:00Z",
      "updated_at": "2026-04-01T10:00:00Z"
    },
    {
      "_id": "RPT_002",
      "report_id": "RPT-SALES-2026-03",
      "report_name": "March 2026 Monthly Sales Report",
      "report_type": "monthly",
      "period_start": "2026-03-01T00:00:00Z",
      "period_end": "2026-03-31T23:59:59Z",
      "generated_date": "2026-04-01T14:30:00Z",
      "generated_by": "sales_agent_1",
      "status": "completed",
      "metrics": {
        "total_sales": 48250.00,
        "total_orders": 18,
        "average_order_value": 2680.56,
        "total_customers": 12,
        "new_customers": 5,
        "return_rate": 0.028,
        "top_product": "Laptop Pro 15\"",
        "top_customer": "ABC Corporation",
        "sales_growth": 0.08
      },
      "breakdown": {
        "by_week": [
          {
            "week": "2026-W13",
            "sales": 11500.00,
            "orders": 4
          },
          {
            "week": "2026-W14",
            "sales": 13250.00,
            "orders": 5
          },
          {
            "week": "2026-W15",
            "sales": 14800.00,
            "orders": 6
          },
          {
            "week": "2026-W16",
            "sales": 8700.00,
            "orders": 3
          }
        ],
        "by_category": [
          {
            "category": "electronics",
            "sales": 35250.00,
            "revenue_percentage": 0.73
          },
          {
            "category": "computer",
            "sales": 13000.00,
            "revenue_percentage": 0.27
          }
        ]
      },
      "created_at": "2026-04-01T14:30:00Z",
      "updated_at": "2026-04-01T14:30:00Z"
    },
    {
      "_id": "RPT_003",
      "report_id": "RPT-SALES-2026-W16",
      "report_name": "Week 16 2026 Sales Report",
      "report_type": "weekly",
      "period_start": "2026-04-13T00:00:00Z",
      "period_end": "2026-04-19T23:59:59Z",
      "generated_date": "2026-04-20T09:15:00Z",
      "generated_by": "admin",
      "status": "completed",
      "metrics": {
        "total_sales": 18750.00,
        "total_orders": 7,
        "average_order_value": 2678.57,
        "total_customers": 6,
        "new_customers": 2,
        "return_rate": 0.043,
        "top_product": "Medical Display System",
        "top_customer": "Medical Equipment Supplier",
        "sales_growth": 0.12
      },
      "breakdown": {
        "by_day": [
          {
            "date": "2026-04-13",
            "sales": 2500.00,
            "orders": 1
          },
          {
            "date": "2026-04-14",
            "sales": 4500.00,
            "orders": 2
          },
          {
            "date": "2026-04-15",
            "sales": 6250.00,
            "orders": 2
          },
          {
            "date": "2026-04-16",
            "sales": 3000.00,
            "orders": 1
          },
          {
            "date": "2026-04-17",
            "sales": 2500.00,
            "orders": 1
          }
        ]
      },
      "created_at": "2026-04-20T09:15:00Z",
      "updated_at": "2026-04-20T09:15:00Z"
    }
  ],
  "salesAgents": [
    {
      "_id": "AGENT_001",
      "agent_id": "AGENT_001",
      "name": "John Smith",
      "email": "john.smith@company.com",
      "phone": "+1234567890",
      "department": "Sales",
      "position": "Senior Sales Representative",
      "hire_date": "2024-01-15T00:00:00Z",
      "status": "active",
      "commission_rate": 0.05,
      "base_salary": 65000.00,
      "target_quota": 500000.00,
      "current_quota": 387500.00,
      "quota_achievement": 0.775,
      "total_sales": 387500.00,
      "total_orders": 145,
      "total_customers": 42,
      "average_order_value": 2672.41,
      "conversion_rate": 0.68,
      "specialization": ["enterprise", "government", "healthcare"],
      "territory": "West Coast",
      "manager_id": "MGR_001",
      "skills": ["negotiation", "relationship_building", "technical_knowledge"],
      "certifications": ["Sales Professional Certification", "Product Expert"],
      "performance_rating": 4.5,
      "last_review_date": "2026-03-15T00:00:00Z",
      "notes": "Top performer in Q1 2026, excellent client relationships",
      "created_at": "2024-01-15T00:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z"
    },
    {
      "_id": "AGENT_002",
      "agent_id": "AGENT_002",
      "name": "Sarah Johnson",
      "email": "sarah.johnson@company.com",
      "phone": "+1234567891",
      "department": "Sales",
      "position": "Sales Representative",
      "hire_date": "2024-03-20T00:00:00Z",
      "status": "active",
      "commission_rate": 0.04,
      "base_salary": 55000.00,
      "target_quota": 400000.00,
      "current_quota": 342000.00,
      "quota_achievement": 0.855,
      "total_sales": 342000.00,
      "total_orders": 128,
      "total_customers": 38,
      "average_order_value": 2671.88,
      "conversion_rate": 0.72,
      "specialization": ["startup", "technology", "retail"],
      "territory": "East Coast",
      "manager_id": "MGR_001",
      "skills": ["cold_calling", "product_demonstration", "closing"],
      "certifications": ["Sales Professional Certification"],
      "performance_rating": 4.7,
      "last_review_date": "2026-03-20T00:00:00Z",
      "notes": "Fastest growing performer, excellent with startups",
      "created_at": "2024-03-20T00:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z"
    },
    {
      "_id": "AGENT_003",
      "agent_id": "AGENT_003",
      "name": "Michael Chen",
      "email": "michael.chen@company.com",
      "phone": "+1234567892",
      "department": "Sales",
      "position": "Junior Sales Representative",
      "hire_date": "2024-06-10T00:00:00Z",
      "status": "active",
      "commission_rate": 0.03,
      "base_salary": 45000.00,
      "target_quota": 300000.00,
      "current_quota": 225000.00,
      "quota_achievement": 0.75,
      "total_sales": 225000.00,
      "total_orders": 89,
      "total_customers": 28,
      "average_order_value": 2528.09,
      "conversion_rate": 0.62,
      "specialization": ["small_business", "retail"],
      "territory": "Midwest",
      "manager_id": "MGR_002",
      "skills": ["customer_service", "follow_up", "product_knowledge"],
      "certifications": ["Product Training Certification"],
      "performance_rating": 4.2,
      "last_review_date": "2026-03-10T00:00:00Z",
      "notes": "Strong potential, improving consistently",
      "created_at": "2024-06-10T00:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z"
    },
    {
      "_id": "AGENT_004",
      "agent_id": "AGENT_004",
      "name": "Emily Davis",
      "email": "emily.davis@company.com",
      "phone": "+1234567893",
      "department": "Sales",
      "position": "Sales Manager",
      "hire_date": "2023-08-01T00:00:00Z",
      "status": "active",
      "commission_rate": 0.06,
      "base_salary": 85000.00,
      "target_quota": 750000.00,
      "current_quota": 612500.00,
      "quota_achievement": 0.817,
      "total_sales": 612500.00,
      "total_orders": 198,
      "total_customers": 56,
      "average_order_value": 3093.43,
      "conversion_rate": 0.74,
      "specialization": ["enterprise", "strategic_accounts"],
      "territory": "National",
      "manager_id": "MGR_003",
      "skills": ["leadership", "strategic_planning", "team_management"],
      "certifications": ["Sales Management Certification", "Executive Leadership"],
      "performance_rating": 4.8,
      "last_review_date": "2026-03-25T00:00:00Z",
      "notes": "Excellent team leader, consistently exceeds targets",
      "created_at": "2023-08-01T00:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z"
    },
    {
      "_id": "AGENT_005",
      "agent_id": "AGENT_005",
      "name": "Robert Wilson",
      "email": "robert.wilson@company.com",
      "phone": "+1234567894",
      "department": "Sales",
      "position": "Sales Representative",
      "hire_date": "2024-02-15T00:00:00Z",
      "status": "on_leave",
      "commission_rate": 0.04,
      "base_salary": 52000.00,
      "target_quota": 350000.00,
      "current_quota": 280000.00,
      "quota_achievement": 0.8,
      "total_sales": 280000.00,
      "total_orders": 112,
      "total_customers": 35,
      "average_order_value": 2500.00,
      "conversion_rate": 0.65,
      "specialization": ["manufacturing", "industrial"],
      "territory": "South",
      "manager_id": "MGR_002",
      "skills": ["technical_sales", "industry_knowledge", "account_management"],
      "certifications": ["Technical Sales Certification"],
      "performance_rating": 4.3,
      "last_review_date": "2026-03-05T00:00:00Z",
      "notes": "On medical leave, expected return May 2026",
      "created_at": "2024-02-15T00:00:00Z",
      "updated_at": "2026-04-10T09:00:00Z"
    }
  ],
  "stockTransfers": [
    {
      "_id": "TRANS_001",
      "transfer_id": "TRF-2026-001",
      "from_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_1",
        "name": "Branch Warehouse 1",
        "location": "Los Angeles, CA",
        "address": "456 Commerce St, Los Angeles, CA 90001"
      },
      "status": "completed",
      "date": "2026-04-01T09:00:00Z",
      "expected_delivery": "2026-04-03T17:00:00Z",
      "actual_delivery": "2026-04-02T14:30:00Z",
      "items": [
        {
          "product_id": "PROD_LAPTOP_001",
          "product_name": "Dell Latitude 5420 Business Laptop",
          "sku": "DL-5420-16-512",
          "quantity": 10,
          "unit_cost": 899.99,
          "total_cost": 8999.90
        },
        {
          "product_id": "PROD_MOUSE_001",
          "product_name": "Wireless Mouse",
          "sku": "WM-001-BLK",
          "quantity": 25,
          "unit_cost": 24.99,
          "total_cost": 624.75
        }
      ],
      "total_items": 35,
      "total_value": 9624.65,
      "tracking_number": "TRK-1234567890",
      "carrier": "FedEx",
      "notes": "Urgent transfer for customer order fulfillment",
      "created_by": "admin",
      "approved_by": "manager_1",
      "created_at": "2026-04-01T09:00:00Z",
      "updated_at": "2026-04-02T14:30:00Z"
    },
    {
      "_id": "TRANS_002",
      "transfer_id": "TRF-2026-002",
      "from_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_2",
        "name": "Branch Warehouse 2",
        "location": "Chicago, IL",
        "address": "789 Logistics Blvd, Chicago, IL 60601"
      },
      "status": "in_transit",
      "date": "2026-04-15T11:30:00Z",
      "expected_delivery": "2026-04-18T16:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_MONITOR_001",
          "product_name": "4K Ultra HD Monitor",
          "sku": "UHD-27-4K",
          "quantity": 5,
          "unit_cost": 349.99,
          "total_cost": 1749.95
        },
        {
          "product_id": "PROD_KEYBOARD_001",
          "product_name": "Mechanical Keyboard",
          "sku": "MK-RGB-01",
          "quantity": 15,
          "unit_cost": 79.99,
          "total_cost": 1199.85
        }
      ],
      "total_items": 20,
      "total_value": 2949.80,
      "tracking_number": "TRK-9876543210",
      "carrier": "UPS",
      "notes": "Stock replenishment for branch inventory",
      "created_by": "warehouse_supervisor",
      "approved_by": "manager_2",
      "created_at": "2026-04-15T11:30:00Z",
      "updated_at": "2026-04-15T11:30:00Z"
    },
    {
      "_id": "TRANS_003",
      "transfer_id": "TRF-2026-003",
      "from_warehouse": {
        "id": "WH_BRANCH_1",
        "name": "Branch Warehouse 1",
        "location": "Los Angeles, CA",
        "address": "456 Commerce St, Los Angeles, CA 90001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_2",
        "name": "Branch Warehouse 2",
        "location": "Chicago, IL",
        "address": "789 Logistics Blvd, Chicago, IL 60601"
      },
      "status": "pending",
      "date": "2026-04-20T08:15:00Z",
      "expected_delivery": "2026-04-23T12:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_TABLET_001",
          "product_name": "10-inch Business Tablet",
          "sku": "TAB-10-128-GRAY",
          "quantity": 8,
          "unit_cost": 299.99,
          "total_cost": 2399.92
        }
      ],
      "total_items": 8,
      "total_value": 2399.92,
      "tracking_number": null,
      "carrier": "Pending Assignment",
      "notes": "Inter-branch transfer to balance inventory levels",
      "created_by": "branch_manager_la",
      "approved_by": null,
      "created_at": "2026-04-20T08:15:00Z",
      "updated_at": "2026-04-20T08:15:00Z"
    },
    {
      "_id": "TRANS_004",
      "transfer_id": "TRF-2026-004",
      "from_warehouse": {
        "id": "WH_BRANCH_2",
        "name": "Branch Warehouse 2",
        "location": "Chicago, IL",
        "address": "789 Logistics Blvd, Chicago, IL 60601"
      },
      "to_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "status": "cancelled",
      "date": "2026-04-10T14:20:00Z",
      "expected_delivery": "2026-04-13T15:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_HEADSET_001",
          "product_name": "Wireless Headset",
          "sku": "WH-001-BT",
          "quantity": 12,
          "unit_cost": 89.99,
          "total_cost": 1079.88
        }
      ],
      "total_items": 12,
      "total_value": 1079.88,
      "tracking_number": "TRK-5555555555",
      "carrier": "DHL",
      "notes": "Cancelled due to insufficient inventory at source",
      "created_by": "branch_manager_chi",
      "approved_by": null,
      "created_at": "2026-04-10T14:20:00Z",
      "updated_at": "2026-04-11T09:45:00Z"
    },
    {
      "_id": "TRANS_005",
      "transfer_id": "TRF-2026-005",
      "from_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "to_warehouse": {
        "id": "WH_TEMP",
        "name": "Temporary Storage",
        "location": "New Jersey, NJ",
        "address": "321 Storage Park, Newark, NJ 07102"
      },
      "status": "in_transit",
      "date": "2026-04-22T10:00:00Z",
      "expected_delivery": "2026-04-22T16:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_PRINTER_001",
          "product_name": "Multi-Function Printer",
          "sku": "MFP-A4-WIFI",
          "quantity": 3,
          "unit_cost": 249.99,
          "total_cost": 749.97
        },
        {
          "product_id": "PROD_SCANNER_001",
          "product_name": "Document Scanner",
          "sku": "DS-USB-01",
          "quantity": 6,
          "unit_cost": 149.99,
          "total_cost": 899.94
        }
      ],
      "total_items": 9,
      "total_value": 1649.91,
      "tracking_number": "TRK-1111222233",
      "carrier": "Local Trucking",
      "notes": "Equipment transfer for office setup",
      "created_by": "admin",
      "approved_by": "manager_1",
      "created_at": "2026-04-22T10:00:00Z",
      "updated_at": "2026-04-22T10:00:00Z"
    },
    {
      "_id": "TRANS_006",
      "transfer_id": "TRF-2026-006",
      "from_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_3",
        "name": "Branch Warehouse 3",
        "location": "Miami, FL",
        "address": "789 Ocean Dr, Miami, FL 33101"
      },
      "status": "completed",
      "date": "2026-04-05T08:30:00Z",
      "expected_delivery": "2026-04-07T17:00:00Z",
      "actual_delivery": "2026-04-06T15:45:00Z",
      "items": [
        {
          "product_id": "PROD_LAPTOP_002",
          "product_name": "HP EliteBook 840 G8",
          "sku": "HP-840-16-256",
          "quantity": 15,
          "unit_cost": 1199.99,
          "total_cost": 17999.85
        },
        {
          "product_id": "PROD_MOUSE_002",
          "product_name": "Bluetooth Mouse",
          "sku": "BM-002-WHT",
          "quantity": 30,
          "unit_cost": 34.99,
          "total_cost": 1049.70
        }
      ],
      "total_items": 45,
      "total_value": 19049.55,
      "tracking_number": "TRK-2468135790",
      "carrier": "FedEx",
      "notes": "Equipment for new branch opening",
      "created_by": "admin",
      "approved_by": "manager_1",
      "created_at": "2026-04-05T08:30:00Z",
      "updated_at": "2026-04-06T15:45:00Z"
    },
    {
      "_id": "TRANS_007",
      "transfer_id": "TRF-2026-007",
      "from_warehouse": {
        "id": "WH_BRANCH_1",
        "name": "Branch Warehouse 1",
        "location": "Los Angeles, CA",
        "address": "456 Commerce St, Los Angeles, CA 90001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_3",
        "name": "Branch Warehouse 3",
        "location": "Miami, FL",
        "address": "789 Ocean Dr, Miami, FL 33101"
      },
      "status": "in_transit",
      "date": "2026-04-21T09:15:00Z",
      "expected_delivery": "2026-04-25T14:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_TABLET_002",
          "product_name": "12-inch Pro Tablet",
          "sku": "TAB-12-256-SLV",
          "quantity": 12,
          "unit_cost": 449.99,
          "total_cost": 5399.88
        },
        {
          "product_id": "PROD_KEYBOARD_002",
          "product_name": "Wireless Keyboard",
          "sku": "WK-002-BLK",
          "quantity": 20,
          "unit_cost": 89.99,
          "total_cost": 1799.80
        }
      ],
      "total_items": 32,
      "total_value": 7199.68,
      "tracking_number": "TRK-3691472580",
      "carrier": "UPS",
      "notes": "Inter-branch inventory balancing",
      "created_by": "branch_manager_la",
      "approved_by": "regional_manager",
      "created_at": "2026-04-21T09:15:00Z",
      "updated_at": "2026-04-21T09:15:00Z"
    },
    {
      "_id": "TRANS_008",
      "transfer_id": "TRF-2026-008",
      "from_warehouse": {
        "id": "WH_BRANCH_2",
        "name": "Branch Warehouse 2",
        "location": "Chicago, IL",
        "address": "789 Logistics Blvd, Chicago, IL 60601"
      },
      "to_warehouse": {
        "id": "WH_TEMP",
        "name": "Temporary Storage",
        "location": "New Jersey, NJ",
        "address": "321 Storage Park, Newark, NJ 07102"
      },
      "status": "pending",
      "date": "2026-04-23T11:00:00Z",
      "expected_delivery": "2026-04-26T16:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_MONITOR_002",
          "product_name": "Curved Gaming Monitor",
          "sku": "CGM-32-144",
          "quantity": 8,
          "unit_cost": 499.99,
          "total_cost": 3999.92
        }
      ],
      "total_items": 8,
      "total_value": 3999.92,
      "tracking_number": null,
      "carrier": "Pending Assignment",
      "notes": "Storage for upcoming trade show",
      "created_by": "branch_manager_chi",
      "approved_by": null,
      "created_at": "2026-04-23T11:00:00Z",
      "updated_at": "2026-04-23T11:00:00Z"
    },
    {
      "_id": "TRANS_009",
      "transfer_id": "TRF-2026-009",
      "from_warehouse": {
        "id": "WH_BRANCH_3",
        "name": "Branch Warehouse 3",
        "location": "Miami, FL",
        "address": "789 Ocean Dr, Miami, FL 33101"
      },
      "to_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "status": "completed",
      "date": "2026-04-08T07:45:00Z",
      "expected_delivery": "2026-04-10T12:00:00Z",
      "actual_delivery": "2026-04-09T10:30:00Z",
      "items": [
        {
          "product_id": "PROD_HEADSET_002",
          "product_name": "Noise-Cancelling Headphones",
          "sku": "NCH-001-BLK",
          "quantity": 25,
          "unit_cost": 149.99,
          "total_cost": 3749.75
        },
        {
          "product_id": "PROD_WEBCAM_001",
          "product_name": "HD Webcam",
          "sku": "WC-1080P-01",
          "quantity": 40,
          "unit_cost": 59.99,
          "total_cost": 2399.60
        }
      ],
      "total_items": 65,
      "total_value": 6149.35,
      "tracking_number": "TRK-9876543211",
      "carrier": "DHL",
      "notes": "Return of excess inventory",
      "created_by": "branch_manager_mia",
      "approved_by": "manager_2",
      "created_at": "2026-04-08T07:45:00Z",
      "updated_at": "2026-04-09T10:30:00Z"
    },
    {
      "_id": "TRANS_010",
      "transfer_id": "TRF-2026-010",
      "from_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_4",
        "name": "Branch Warehouse 4",
        "location": "Seattle, WA",
        "address": "456 Tech Ave, Seattle, WA 98101"
      },
      "status": "in_transit",
      "date": "2026-04-22T13:20:00Z",
      "expected_delivery": "2026-04-26T11:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_DESKTOP_001",
          "product_name": "Gaming Desktop PC",
          "sku": "GDP-RTX-32",
          "quantity": 5,
          "unit_cost": 1899.99,
          "total_cost": 9499.95
        },
        {
          "product_id": "PROD_MONITOR_003",
          "product_name": "Ultra-Wide Monitor",
          "sku": "UWM-34-144",
          "quantity": 5,
          "unit_cost": 799.99,
          "total_cost": 3999.95
        }
      ],
      "total_items": 10,
      "total_value": 13499.90,
      "tracking_number": "TRK-1122334455",
      "carrier": "FedEx",
      "notes": "High-value gaming equipment for new store",
      "created_by": "admin",
      "approved_by": "manager_1",
      "created_at": "2026-04-22T13:20:00Z",
      "updated_at": "2026-04-22T13:20:00Z"
    },
    {
      "_id": "TRANS_011",
      "transfer_id": "TRF-2026-011",
      "from_warehouse": {
        "id": "WH_BRANCH_4",
        "name": "Branch Warehouse 4",
        "location": "Seattle, WA",
        "address": "456 Tech Ave, Seattle, WA 98101"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_2",
        "name": "Branch Warehouse 2",
        "location": "Chicago, IL",
        "address": "789 Logistics Blvd, Chicago, IL 60601"
      },
      "status": "pending",
      "date": "2026-04-24T10:30:00Z",
      "expected_delivery": "2026-04-27T15:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_SERVER_001",
          "product_name": "Rack Server",
          "sku": "RS-2U-64GB",
          "quantity": 3,
          "unit_cost": 2499.99,
          "total_cost": 7499.97
        }
      ],
      "total_items": 3,
      "total_value": 7499.97,
      "tracking_number": null,
      "carrier": "Pending Assignment",
      "notes": "Server equipment for data center upgrade",
      "created_by": "branch_manager_sea",
      "approved_by": null,
      "created_at": "2026-04-24T10:30:00Z",
      "updated_at": "2026-04-24T10:30:00Z"
    },
    {
      "_id": "TRANS_012",
      "transfer_id": "TRF-2026-012",
      "from_warehouse": {
        "id": "WH_TEMP",
        "name": "Temporary Storage",
        "location": "New Jersey, NJ",
        "address": "321 Storage Park, Newark, NJ 07102"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_1",
        "name": "Branch Warehouse 1",
        "location": "Los Angeles, CA",
        "address": "456 Commerce St, Los Angeles, CA 90001"
      },
      "status": "completed",
      "date": "2026-04-12T09:00:00Z",
      "expected_delivery": "2026-04-15T17:00:00Z",
      "actual_delivery": "2026-04-14T12:15:00Z",
      "items": [
        {
          "product_id": "PROD_ROUTER_001",
          "product_name": "Enterprise Router",
          "sku": "ER-10GB-24P",
          "quantity": 10,
          "unit_cost": 599.99,
          "total_cost": 5999.90
        },
        {
          "product_id": "PROD_SWITCH_001",
          "product_name": "Network Switch",
          "sku": "NS-48GB-POE",
          "quantity": 15,
          "unit_cost": 399.99,
          "total_cost": 5999.85
        }
      ],
      "total_items": 25,
      "total_value": 11999.75,
      "tracking_number": "TRK-5556667778",
      "carrier": "UPS",
      "notes": "Network equipment for office expansion",
      "created_by": "warehouse_supervisor",
      "approved_by": "manager_2",
      "created_at": "2026-04-12T09:00:00Z",
      "updated_at": "2026-04-14T12:15:00Z"
    },
    {
      "_id": "TRANS_013",
      "transfer_id": "TRF-2026-013",
      "from_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_5",
        "name": "Branch Warehouse 5",
        "location": "Denver, CO",
        "address": "123 Mountain Rd, Denver, CO 80201"
      },
      "status": "in_transit",
      "date": "2026-04-23T14:45:00Z",
      "expected_delivery": "2026-04-27T10:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_PRINTER_002",
          "product_name": "Laser Printer",
          "sku": "LP-A4-DUPLEX",
          "quantity": 8,
          "unit_cost": 399.99,
          "total_cost": 3199.92
        },
        {
          "product_id": "PROD_SCANNER_002",
          "product_name": "Document Scanner Pro",
          "sku": "DSP-ADF-600",
          "quantity": 12,
          "unit_cost": 299.99,
          "total_cost": 3599.88
        }
      ],
      "total_items": 20,
      "total_value": 6799.80,
      "tracking_number": "TRK-9988776655",
      "carrier": "FedEx",
      "notes": "Office equipment for new Denver branch",
      "created_by": "admin",
      "approved_by": "manager_1",
      "created_at": "2026-04-23T14:45:00Z",
      "updated_at": "2026-04-23T14:45:00Z"
    },
    {
      "_id": "TRANS_014",
      "transfer_id": "TRF-2026-014",
      "from_warehouse": {
        "id": "WH_BRANCH_5",
        "name": "Branch Warehouse 5",
        "location": "Denver, CO",
        "address": "123 Mountain Rd, Denver, CO 80201"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_3",
        "name": "Branch Warehouse 3",
        "location": "Miami, FL",
        "address": "789 Ocean Dr, Miami, FL 33101"
      },
      "status": "pending",
      "date": "2026-04-25T08:00:00Z",
      "expected_delivery": "2026-04-29T14:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_TABLET_003",
          "product_name": "Kids Educational Tablet",
          "sku": "KET-7-32GB",
          "quantity": 50,
          "unit_cost": 129.99,
          "total_cost": 6499.50
        }
      ],
      "total_items": 50,
      "total_value": 6499.50,
      "tracking_number": null,
      "carrier": "Pending Assignment",
      "notes": "Educational tablets for school program",
      "created_by": "branch_manager_den",
      "approved_by": null,
      "created_at": "2026-04-25T08:00:00Z",
      "updated_at": "2026-04-25T08:00:00Z"
    },
    {
      "_id": "TRANS_015",
      "transfer_id": "TRF-2026-015",
      "from_warehouse": {
        "id": "WH_BRANCH_3",
        "name": "Branch Warehouse 3",
        "location": "Miami, FL",
        "address": "789 Ocean Dr, Miami, FL 33101"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_4",
        "name": "Branch Warehouse 4",
        "location": "Seattle, WA",
        "address": "456 Tech Ave, Seattle, WA 98101"
      },
      "status": "cancelled",
      "date": "2026-04-14T16:30:00Z",
      "expected_delivery": "2026-04-18T12:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_LAPTOP_003",
          "product_name": "MacBook Pro 16-inch",
          "sku": "MBP-16-M2-1TB",
          "quantity": 3,
          "unit_cost": 2499.99,
          "total_cost": 7499.97
        }
      ],
      "total_items": 3,
      "total_value": 7499.97,
      "tracking_number": "TRK-1234567891",
      "carrier": "Apple Logistics",
      "notes": "Cancelled due to budget constraints",
      "created_by": "branch_manager_mia",
      "approved_by": null,
      "created_at": "2026-04-14T16:30:00Z",
      "updated_at": "2026-04-15T09:20:00Z"
    },
    {
      "_id": "TRANS_016",
      "transfer_id": "TRF-2026-016",
      "from_warehouse": {
        "id": "WH_BRANCH_4",
        "name": "Branch Warehouse 4",
        "location": "Seattle, WA",
        "address": "456 Tech Ave, Seattle, WA 98101"
      },
      "to_warehouse": {
        "id": "WH_TEMP",
        "name": "Temporary Storage",
        "location": "New Jersey, NJ",
        "address": "321 Storage Park, Newark, NJ 07102"
      },
      "status": "completed",
      "date": "2026-04-09T11:15:00Z",
      "expected_delivery": "2026-04-11T16:00:00Z",
      "actual_delivery": "2026-04-10T13:45:00Z",
      "items": [
        {
          "product_id": "PROD_STORAGE_001",
          "product_name": "NAS Storage System",
          "sku": "NAS-8Bay-64TB",
          "quantity": 4,
          "unit_cost": 1299.99,
          "total_cost": 5199.96
        },
        {
          "product_id": "PROD_BACKUP_001",
          "product_name": "Backup Drive Array",
          "sku": "BDA-12TB-RAID",
          "quantity": 6,
          "unit_cost": 799.99,
          "total_cost": 4799.94
        }
      ],
      "total_items": 10,
      "total_value": 9999.90,
      "tracking_number": "TRK-7890123456",
      "carrier": "DHL",
      "notes": "Storage systems for data migration project",
      "created_by": "branch_manager_sea",
      "approved_by": "manager_2",
      "created_at": "2026-04-09T11:15:00Z",
      "updated_at": "2026-04-10T13:45:00Z"
    },
    {
      "_id": "TRANS_017",
      "transfer_id": "TRF-2026-017",
      "from_warehouse": {
        "id": "WH_TEMP",
        "name": "Temporary Storage",
        "location": "New Jersey, NJ",
        "address": "321 Storage Park, Newark, NJ 07102"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_5",
        "name": "Branch Warehouse 5",
        "location": "Denver, CO",
        "address": "123 Mountain Rd, Denver, CO 80201"
      },
      "status": "in_transit",
      "date": "2026-04-24T12:00:00Z",
      "expected_delivery": "2026-04-28T15:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_CAMERA_001",
          "product_name": "Security Camera System",
          "sku": "SCS-4K-8CH",
          "quantity": 10,
          "unit_cost": 499.99,
          "total_cost": 4999.90
        },
        {
          "product_id": "PROD_NVR_001",
          "product_name": "Network Video Recorder",
          "sku": "NVR-16CH-4K",
          "quantity": 5,
          "unit_cost": 699.99,
          "total_cost": 3499.95
        }
      ],
      "total_items": 15,
      "total_value": 8499.85,
      "tracking_number": "TRK-3456789012",
      "carrier": "UPS",
      "notes": "Security equipment for warehouse upgrade",
      "created_by": "warehouse_supervisor",
      "approved_by": "regional_manager",
      "created_at": "2026-04-24T12:00:00Z",
      "updated_at": "2026-04-24T12:00:00Z"
    },
    {
      "_id": "TRANS_018",
      "transfer_id": "TRF-2026-018",
      "from_warehouse": {
        "id": "WH_BRANCH_5",
        "name": "Branch Warehouse 5",
        "location": "Denver, CO",
        "address": "123 Mountain Rd, Denver, CO 80201"
      },
      "to_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "status": "completed",
      "date": "2026-04-07T10:30:00Z",
      "expected_delivery": "2026-04-09T14:00:00Z",
      "actual_delivery": "2026-04-08T11:20:00Z",
      "items": [
        {
          "product_id": "PROD_PROJECTOR_001",
          "product_name": "4K Projector",
          "sku": "4KP-HDR-3000",
          "quantity": 6,
          "unit_cost": 899.99,
          "total_cost": 5399.94
        },
        {
          "product_id": "PROD_SCREEN_001",
          "product_name": "Projection Screen",
          "sku": "PS-120-16:9",
          "quantity": 6,
          "unit_cost": 299.99,
          "total_cost": 1799.94
        }
      ],
      "total_items": 12,
      "total_value": 7199.88,
      "tracking_number": "TRK-2345678901",
      "carrier": "FedEx",
      "notes": "AV equipment returned after event",
      "created_by": "branch_manager_den",
      "approved_by": "manager_1",
      "created_at": "2026-04-07T10:30:00Z",
      "updated_at": "2026-04-08T11:20:00Z"
    },
    {
      "_id": "TRANS_019",
      "transfer_id": "TRF-2026-019",
      "from_warehouse": {
        "id": "WH_MAIN",
        "name": "Main Warehouse",
        "location": "New York, USA",
        "address": "123 Storage Ave, New York, NY 10001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_6",
        "name": "Branch Warehouse 6",
        "location": "Boston, MA",
        "address": "789 Historic St, Boston, MA 02101"
      },
      "status": "pending",
      "date": "2026-04-26T09:00:00Z",
      "expected_delivery": "2026-04-30T12:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_WORKSTATION_001",
          "product_name": "CAD Workstation",
          "sku": "CAD-WS-RTX-64",
          "quantity": 4,
          "unit_cost": 3499.99,
          "total_cost": 13999.96
        }
      ],
      "total_items": 4,
      "total_value": 13999.96,
      "tracking_number": null,
      "carrier": "Pending Assignment",
      "notes": "High-performance workstations for design team",
      "created_by": "admin",
      "approved_by": null,
      "created_at": "2026-04-26T09:00:00Z",
      "updated_at": "2026-04-26T09:00:00Z"
    },
    {
      "_id": "TRANS_020",
      "transfer_id": "TRF-2026-020",
      "from_warehouse": {
        "id": "WH_BRANCH_6",
        "name": "Branch Warehouse 6",
        "location": "Boston, MA",
        "address": "789 Historic St, Boston, MA 02101"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_2",
        "name": "Branch Warehouse 2",
        "location": "Chicago, IL",
        "address": "789 Logistics Blvd, Chicago, IL 60601"
      },
      "status": "in_transit",
      "date": "2026-04-25T15:30:00Z",
      "expected_delivery": "2026-04-29T11:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_PHONE_001",
          "product_name": "VoIP Business Phone",
          "sku": "VOIP- SIP-486",
          "quantity": 25,
          "unit_cost": 149.99,
          "total_cost": 3749.75
        },
        {
          "product_id": "PROD_PBX_001",
          "product_name": "PBX Phone System",
          "sku": "PBX-50L-ANLG",
          "quantity": 2,
          "unit_cost": 999.99,
          "total_cost": 1999.98
        }
      ],
      "total_items": 27,
      "total_value": 5749.73,
      "tracking_number": "TRK-5678901234",
      "carrier": "UPS",
      "notes": "Telecom equipment for office upgrade",
      "created_by": "branch_manager_bos",
      "approved_by": "regional_manager",
      "created_at": "2026-04-25T15:30:00Z",
      "updated_at": "2026-04-25T15:30:00Z"
    },
    {
      "_id": "TRANS_021",
      "transfer_id": "TRF-2026-021",
      "from_warehouse": {
        "id": "WH_BRANCH_2",
        "name": "Branch Warehouse 2",
        "location": "Chicago, IL",
        "address": "789 Logistics Blvd, Chicago, IL 60601"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_6",
        "name": "Branch Warehouse 6",
        "location": "Boston, MA",
        "address": "789 Historic St, Boston, MA 02101"
      },
      "status": "cancelled",
      "date": "2026-04-16T13:45:00Z",
      "expected_delivery": "2026-04-20T10:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_SERVER_002",
          "product_name": "Blade Server",
          "sku": "BS-16C-256GB",
          "quantity": 2,
          "unit_cost": 4999.99,
          "total_cost": 9999.98
        }
      ],
      "total_items": 2,
      "total_value": 9999.98,
      "tracking_number": "TRK-9876543212",
      "carrier": "DHL",
      "notes": "Cancelled due to technical specifications change",
      "created_by": "branch_manager_chi",
      "approved_by": null,
      "created_at": "2026-04-16T13:45:00Z",
      "updated_at": "2026-04-17T08:30:00Z"
    },
    {
      "_id": "TRANS_022",
      "transfer_id": "TRF-2026-022",
      "from_warehouse": {
        "id": "WH_BRANCH_6",
        "name": "Branch Warehouse 6",
        "location": "Boston, MA",
        "address": "789 Historic St, Boston, MA 02101"
      },
      "to_warehouse": {
        "id": "WH_TEMP",
        "name": "Temporary Storage",
        "location": "New Jersey, NJ",
        "address": "321 Storage Park, Newark, NJ 07102"
      },
      "status": "completed",
      "date": "2026-04-11T08:00:00Z",
      "expected_delivery": "2026-04-13T16:00:00Z",
      "actual_delivery": "2026-04-12T14:15:00Z",
      "items": [
        {
          "product_id": "PROD_CABLE_001",
          "product_name": "Network Cable Kit",
          "sku": "NCK-CAT6-100FT",
          "quantity": 50,
          "unit_cost": 49.99,
          "total_cost": 2499.50
        },
        {
          "product_id": "PROD_TOOL_001",
          "product_name": "Network Installation Tool Kit",
          "sku": "NITK-PRO-SET",
          "quantity": 10,
          "unit_cost": 199.99,
          "total_cost": 1999.90
        }
      ],
      "total_items": 60,
      "total_value": 4499.40,
      "tracking_number": "TRK-3456789013",
      "carrier": "Local Trucking",
      "notes": "Network installation supplies storage",
      "created_by": "branch_manager_bos",
      "approved_by": "manager_2",
      "created_at": "2026-04-11T08:00:00Z",
      "updated_at": "2026-04-12T14:15:00Z"
    },
    {
      "_id": "TRANS_023",
      "transfer_id": "TRF-2026-023",
      "from_warehouse": {
        "id": "WH_TEMP",
        "name": "Temporary Storage",
        "location": "New Jersey, NJ",
        "address": "321 Storage Park, Newark, NJ 07102"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_1",
        "name": "Branch Warehouse 1",
        "location": "Los Angeles, CA",
        "address": "456 Commerce St, Los Angeles, CA 90001"
      },
      "status": "in_transit",
      "date": "2026-04-27T11:45:00Z",
      "expected_delivery": "2026-05-01T14:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_DISPLAY_001",
          "product_name": "Digital Signage Display",
          "sku": "DSD-55-4K-TS",
          "quantity": 8,
          "unit_cost": 1299.99,
          "total_cost": 10399.92
        },
        {
          "product_id": "PROD_MEDIA_001",
          "product_name": "Media Player",
          "sku": "MP-4K-WIFI",
          "quantity": 8,
          "unit_cost": 299.99,
          "total_cost": 2399.92
        }
      ],
      "total_items": 16,
      "total_value": 12799.84,
      "tracking_number": "TRK-7890123457",
      "carrier": "FedEx",
      "notes": "Digital signage for retail store upgrade",
      "created_by": "warehouse_supervisor",
      "approved_by": "regional_manager",
      "created_at": "2026-04-27T11:45:00Z",
      "updated_at": "2026-04-27T11:45:00Z"
    },
    {
      "_id": "TRANS_024",
      "transfer_id": "TRF-2026-024",
      "from_warehouse": {
        "id": "WH_BRANCH_1",
        "name": "Branch Warehouse 1",
        "location": "Los Angeles, CA",
        "address": "456 Commerce St, Los Angeles, CA 90001"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_4",
        "name": "Branch Warehouse 4",
        "location": "Seattle, WA",
        "address": "456 Tech Ave, Seattle, WA 98101"
      },
      "status": "pending",
      "date": "2026-04-28T10:15:00Z",
      "expected_delivery": "2026-05-02T12:00:00Z",
      "actual_delivery": null,
      "items": [
        {
          "product_id": "PROD_CHARGER_001",
          "product_name": "Universal Charging Station",
          "sku": "UCS-10PORT-USB",
          "quantity": 20,
          "unit_cost": 199.99,
          "total_cost": 3999.80
        }
      ],
      "total_items": 20,
      "total_value": 3999.80,
      "tracking_number": null,
      "carrier": "Pending Assignment",
      "notes": "Charging stations for customer waiting area",
      "created_by": "branch_manager_la",
      "approved_by": null,
      "created_at": "2026-04-28T10:15:00Z",
      "updated_at": "2026-04-28T10:15:00Z"
    },
    {
      "_id": "TRANS_025",
      "transfer_id": "TRF-2026-025",
      "from_warehouse": {
        "id": "WH_BRANCH_4",
        "name": "Branch Warehouse 4",
        "location": "Seattle, WA",
        "address": "456 Tech Ave, Seattle, WA 98101"
      },
      "to_warehouse": {
        "id": "WH_BRANCH_5",
        "name": "Branch Warehouse 5",
        "location": "Denver, CO",
        "address": "123 Mountain Rd, Denver, CO 80201"
      },
      "status": "completed",
      "date": "2026-04-13T09:30:00Z",
      "expected_delivery": "2026-04-16T15:00:00Z",
      "actual_delivery": "2026-04-15T11:45:00Z",
      "items": [
        {
          "product_id": "PROD_FURNITURE_001",
          "product_name": "Ergonomic Office Chair",
          "sku": "EOC-ADJ-LUMBAR",
          "quantity": 15,
          "unit_cost": 349.99,
          "total_cost": 5249.85
        },
        {
          "product_id": "PROD_DESK_001",
          "product_name": "Standing Desk",
          "sku": "SD-ELEC-72",
          "quantity": 10,
          "unit_cost": 599.99,
          "total_cost": 5999.90
        }
      ],
      "total_items": 25,
      "total_value": 11249.75,
      "tracking_number": "TRK-4567890123",
      "carrier": "UPS",
      "notes": "Office furniture for new workspace",
      "created_by": "branch_manager_sea",
      "approved_by": "manager_2",
      "created_at": "2026-04-13T09:30:00Z",
      "updated_at": "2026-04-15T11:45:00Z"
    }
  ],
"stockAdjustments": [
  {
    "_id": "ADJ_001",
    "product": {
      "_id": "INV_001",
      "name": "Laptop Pro 15\"",
      "sku": "LP-001"
    },
    "type": "increase",
    "quantity": 5,
    "reason": "correction",
    "notes": "Physical count revealed missing inventory",
    "created_by": {
      "_id": "user_001",
      "firstName": "John",
      "lastName": "Smith"
    },
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T10:30:00Z"
  },
  {
    "_id": "ADJ_002",
    "product": {
      "_id": "INV_002",
      "name": "Wireless Mouse",
      "sku": "WM-002"
    },
    "type": "decrease",
    "quantity": 3,
    "reason": "damage",
    "notes": "Damaged during shipping",
    "created_by": {
      "_id": "user_002",
      "firstName": "Sarah",
      "lastName": "Johnson"
    },
    "createdAt": "2026-04-19T14:15:00Z",
    "updatedAt": "2026-04-19T14:15:00Z"
  },
  {
    "_id": "ADJ_003",
    "product": {
      "_id": "INV_003",
      "name": "Mechanical Keyboard",
      "sku": "KB-003"
    },
    "type": "increase",
    "quantity": 10,
    "reason": "return",
    "notes": "Customer return - item in good condition",
    "created_by": {
      "_id": "user_003",
      "firstName": "Mike",
      "lastName": "Wilson"
    },
    "createdAt": "2026-04-18T09:45:00Z",
    "updatedAt": "2026-04-18T09:45:00Z"
  },
  {
    "_id": "ADJ_004",
    "product": {
      "_id": "INV_004",
      "name": "USB-C Hub",
      "sku": "UC-004"
    },
    "type": "decrease",
    "quantity": 2,
    "reason": "theft",
    "notes": "Reported missing from storage",
    "created_by": {
      "_id": "user_001",
      "firstName": "John",
      "lastName": "Smith"
    },
    "createdAt": "2026-04-17T16:20:00Z",
    "updatedAt": "2026-04-17T16:20:00Z"
  },
  {
    "_id": "ADJ_005",
    "product": {
      "_id": "INV_005",
      "name": "Monitor Stand",
      "sku": "MS-005"
    },
    "type": "increase",
    "quantity": 8,
    "reason": "correction",
    "notes": "System error in inventory count",
    "created_by": {
      "_id": "user_004",
      "firstName": "Emily",
      "lastName": "Davis"
    },
    "createdAt": "2026-04-16T11:30:00Z",
    "updatedAt": "2026-04-16T11:30:00Z"
  },
  {
    "_id": "ADJ_006",
    "product": {
      "_id": "INV_006",
      "name": "Webcam HD",
      "sku": "WC-006"
    },
    "type": "decrease",
    "quantity": 4,
    "reason": "expired",
    "notes": "Warranty expired items removed",
    "created_by": {
      "_id": "user_002",
      "firstName": "Sarah",
      "lastName": "Johnson"
    },
    "createdAt": "2026-04-15T13:10:00Z",
    "updatedAt": "2026-04-15T13:10:00Z"
  },
  {
    "_id": "ADJ_007",
    "product": {
      "_id": "INV_007",
      "name": "Desk Lamp",
      "sku": "DL-007"
    },
    "type": "increase",
    "quantity": 15,
    "reason": "other",
    "notes": "New stock received from supplier",
    "created_by": {
      "_id": "user_003",
      "firstName": "Mike",
      "lastName": "Wilson"
    },
    "createdAt": "2026-04-14T10:00:00Z",
    "updatedAt": "2026-04-14T10:00:00Z"
  },
  {
    "_id": "ADJ_008",
    "product": {
      "_id": "INV_008",
      "name": "Cable Management",
      "sku": "CM-008"
    },
    "type": "decrease",
    "quantity": 6,
    "reason": "damage",
    "notes": "Damaged in warehouse accident",
    "created_by": {
      "_id": "user_004",
      "firstName": "Emily",
      "lastName": "Davis"
    },
    "createdAt": "2026-04-13T15:45:00Z",
    "updatedAt": "2026-04-13T15:45:00Z"
  },
  {
    "_id": "ADJ_009",
    "product": {
      "_id": "INV_009",
      "name": "Phone Holder",
      "sku": "PH-009"
    },
    "type": "increase",
    "quantity": 12,
    "reason": "correction",
    "notes": "Inventory recount adjustment",
    "created_by": {
      "_id": "user_001",
      "firstName": "John",
      "lastName": "Smith"
    },
    "createdAt": "2026-04-12T08:30:00Z",
    "updatedAt": "2026-04-12T08:30:00Z"
  },
  {
    "_id": "ADJ_010",
    "product": {
      "_id": "INV_010",
      "name": "Power Strip",
      "sku": "PS-010"
    },
    "type": "decrease",
    "quantity": 3,
    "reason": "theft",
    "notes": "Items missing from retail floor",
    "created_by": {
      "_id": "user_002",
      "firstName": "Sarah",
      "lastName": "Johnson"
    },
    "createdAt": "2026-04-11T12:20:00Z",
    "updatedAt": "2026-04-11T12:20:00Z"
  },
  {
    "_id": "ADJ_011",
    "product": {
      "_id": "INV_011",
      "name": "Headphone Stand",
      "sku": "HS-011"
    },
    "type": "increase",
    "quantity": 7,
    "reason": "return",
    "notes": "Bulk customer return",
    "created_by": {
      "_id": "user_003",
      "firstName": "Mike",
      "lastName": "Wilson"
    },
    "createdAt": "2026-04-10T14:00:00Z",
    "updatedAt": "2026-04-10T14:00:00Z"
  },
  {
    "_id": "ADJ_012",
    "product": {
      "_id": "INV_012",
      "name": "Cooling Pad",
      "sku": "CP-012"
    },
    "type": "decrease",
    "quantity": 5,
    "reason": "damage",
    "notes": "Defective items removed",
    "created_by": {
      "_id": "user_004",
      "firstName": "Emily",
      "lastName": "Davis"
    },
    "createdAt": "2026-04-09T09:15:00Z",
    "updatedAt": "2026-04-09T09:15:00Z"
  },
  {
    "_id": "ADJ_013",
    "product": {
      "_id": "INV_013",
      "name": "Laptop Sleeve",
      "sku": "LS-013"
    },
    "type": "increase",
    "quantity": 20,
    "reason": "correction",
    "notes": "System reconciliation adjustment",
    "created_by": {
      "_id": "user_001",
      "firstName": "John",
      "lastName": "Smith"
    },
    "createdAt": "2026-04-08T16:30:00Z",
    "updatedAt": "2026-04-08T16:30:00Z"
  },
  {
    "_id": "ADJ_014",
    "product": {
      "_id": "INV_014",
      "name": "Screen Protector",
      "sku": "SP-014"
    },
    "type": "decrease",
    "quantity": 8,
    "reason": "expired",
    "notes": "Expired stock removed",
    "created_by": {
      "_id": "user_002",
      "firstName": "Sarah",
      "lastName": "Johnson"
    },
    "createdAt": "2026-04-07T11:45:00Z",
    "updatedAt": "2026-04-07T11:45:00Z"
  },
  {
    "_id": "ADJ_015",
    "product": {
      "_id": "INV_015",
      "name": "External Drive",
      "sku": "ED-015"
    },
    "type": "increase",
    "quantity": 6,
    "reason": "other",
    "notes": "Supplier bonus stock",
    "created_by": {
      "_id": "user_003",
      "firstName": "Mike",
      "lastName": "Wilson"
    },
    "createdAt": "2026-04-06T13:20:00Z",
    "updatedAt": "2026-04-06T13:20:00Z"
  },
  {
    "_id": "ADJ_016",
    "product": {
      "_id": "INV_016",
      "name": "Mouse Pad",
      "sku": "MP-016"
    },
    "type": "decrease",
    "quantity": 10,
    "reason": "damage",
    "notes": "Water damage in storage",
    "created_by": {
      "_id": "user_004",
      "firstName": "Emily",
      "lastName": "Davis"
    },
    "createdAt": "2026-04-05T10:10:00Z",
    "updatedAt": "2026-04-05T10:10:00Z"
  },
  {
    "_id": "ADJ_017",
    "product": {
      "_id": "INV_017",
      "name": "HDMI Cable",
      "sku": "HC-017"
    },
    "type": "increase",
    "quantity": 25,
    "reason": "correction",
    "notes": "Physical inventory correction",
    "created_by": {
      "_id": "user_001",
      "firstName": "John",
      "lastName": "Smith"
    },
    "createdAt": "2026-04-04T15:00:00Z",
    "updatedAt": "2026-04-04T15:00:00Z"
  },
  {
    "_id": "ADJ_018",
    "product": {
      "_id": "INV_018",
      "name": "Ethernet Cable",
      "sku": "EC-018"
    },
    "type": "decrease",
    "quantity": 4,
    "reason": "theft",
    "notes": "Missing from inventory check",
    "created_by": {
      "_id": "user_002",
      "firstName": "Sarah",
      "lastName": "Johnson"
    },
    "createdAt": "2026-04-03T08:45:00Z",
    "updatedAt": "2026-04-03T08:45:00Z"
  },
  {
    "_id": "ADJ_019",
    "product": {
      "_id": "INV_019",
      "name": "Wireless Charger",
      "sku": "WC-019"
    },
    "type": "increase",
    "quantity": 9,
    "reason": "return",
    "notes": "Customer returns in resalable condition",
    "created_by": {
      "_id": "user_003",
      "firstName": "Mike",
      "lastName": "Wilson"
    },
    "createdAt": "2026-04-02T12:30:00Z",
    "updatedAt": "2026-04-02T12:30:00Z"
  },
  {
    "_id": "ADJ_020",
    "product": {
      "_id": "INV_020",
      "name": "Docking Station",
      "sku": "DS-020"
    },
    "type": "decrease",
    "quantity": 2,
    "reason": "damage",
    "notes": "Damaged during testing",
    "created_by": {
      "_id": "user_004",
      "firstName": "Emily",
      "lastName": "Davis"
    },
    "createdAt": "2026-04-01T14:15:00Z",
    "updatedAt": "2026-04-01T14:15:00Z"
  }
]
};

// Add inventory array that maps to products for POS system
mockData.inventory = mockData.products;

// Individual exports
const mockInventory = mockData.inventory;
const mockSuppliers = mockData.suppliers;
const mockCustomers = mockData.customers;
const mockTransactions = mockData.transactions;
const mockCategories = mockData.categories;
const mockSales = mockData.sales;
const mockPurchases = mockData.purchases;
const mockContacts = mockData.contacts;
const mockInvoices = mockData.invoices;
const mockPayments = mockData.payments;
const mockSalesReturns = mockData.salesReturns;
const mockQuotations = mockData.quotations;
const mockSalesReports = mockData.salesReports;
const mockSalesAgents = mockData.salesAgents;
const mockStockTransfers = mockData.stockTransfers;
const mockAnalytics = mockData.analytics;
const mockExpenses = mockData.expenses;
const mockStockAdjustments = mockData.stockAdjustments;

// Assets data
mockData.assets = [
  {
    _id: "AST_001",
    asset_name: "Dell OptiPlex 7090",
    category: "Electronics",
    type: "computer",
    status: "active",
    purchase_date: "2024-01-15T10:00:00Z",
    purchase_cost: {
      amount: 1200,
      currency: "USD"
    },
    current_value: {
      amount: 960,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 5,
      annual_rate: 20
    },
    assigned_to: {
      user_id: {
        firstName: "John",
        lastName: "Doe"
      },
      department: "IT"
    },
    location: "Office Building - Floor 3",
    specifications: {
      make: "Dell",
      model: "OptiPlex 7090",
      serial_number: "DL-7090-2024-001",
      processor: "Intel Core i7-12700",
      ram: "16GB DDR4",
      storage: "512GB SSD"
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-03-01T10:00:00Z",
      next_maintenance_date: "2024-06-01T10:00:00Z",
      type: "routine_check",
      estimated_cost: 50
    },
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-04-15T10:00:00Z"
  },
  {
    _id: "AST_002",
    asset_name: "HP LaserJet Pro M404n",
    category: "Office Equipment",
    type: "printer",
    status: "active",
    purchase_date: "2024-02-20T14:30:00Z",
    purchase_cost: {
      amount: 450,
      currency: "USD"
    },
    current_value: {
      amount: 405,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 4,
      annual_rate: 25
    },
    assigned_to: {
      user_id: {
        firstName: "Jane",
        lastName: "Smith"
      },
      department: "Administration"
    },
    location: "Office Building - Floor 2",
    specifications: {
      make: "HP",
      model: "LaserJet Pro M404n",
      serial_number: "HP-M404-2024-002",
      type: "Laser Printer",
      speed: "40 ppm",
      resolution: "1200 x 1200 dpi"
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-03-15T09:00:00Z",
      next_maintenance_date: "2024-06-15T09:00:00Z",
      type: "toner_replacement",
      estimated_cost: 80
    },
    created_at: "2024-02-20T14:30:00Z",
    updated_at: "2024-04-10T14:30:00Z"
  },
  {
    _id: "AST_003",
    asset_name: "Toyota Camry 2023",
    category: "Vehicle",
    type: "car",
    status: "active",
    purchase_date: "2023-06-01T11:00:00Z",
    purchase_cost: {
      amount: 25000,
      currency: "USD"
    },
    current_value: {
      amount: 22000,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 8,
      annual_rate: 12.5
    },
    assigned_to: {
      user_id: {
        firstName: "Mike",
        lastName: "Johnson"
      },
      department: "Sales"
    },
    location: "Company Parking - Spot A12",
    specifications: {
      make: "Toyota",
      model: "Camry LE",
      serial_number: "TO-CAMRY-2023-003",
      year: 2023,
      color: "Silver",
      mileage: 15000
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-03-20T08:00:00Z",
      next_maintenance_date: "2024-06-20T08:00:00Z",
      type: "oil_change",
      estimated_cost: 120
    },
    created_at: "2023-06-01T11:00:00Z",
    updated_at: "2024-04-01T11:00:00Z"
  },
  {
    _id: "AST_006",
    asset_name: "Ergonomic Office Chair",
    category: "Furniture",
    type: "chair",
    status: "active",
    purchase_date: "2026-03-15T10:00:00Z",
    purchase_cost: {
      amount: 350,
      currency: "USD"
    },
    current_value: {
      amount: 332,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 5,
      annual_rate: 20
    },
    assigned_to: {
      user_id: {
        firstName: "Sarah",
        lastName: "Williams"
      },
      department: "HR"
    },
    location: "Office Building - Floor 2",
    specifications: {
      make: "Herman Miller",
      model: "Aeron",
      serial_number: "HM-AERON-2026-006",
      material: "Mesh and Aluminum",
      color: "Black"
    },
    maintenance_schedule: {
      last_maintenance_date: "2026-04-01T10:00:00Z",
      next_maintenance_date: "2026-07-01T10:00:00Z",
      type: "cleaning",
      estimated_cost: 25
    },
    created_at: "2026-03-15T10:00:00Z",
    updated_at: "2026-04-15T10:00:00Z"
  },
  {
    _id: "AST_007",
    asset_name: "Projector 4K Ultra HD",
    category: "Electronics",
    type: "projector",
    status: "active",
    purchase_date: "2026-02-10T14:30:00Z",
    purchase_cost: {
      amount: 1800,
      currency: "USD"
    },
    current_value: {
      amount: 1650,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 4,
      annual_rate: 25
    },
    assigned_to: null,
    location: "Conference Room - Floor 4",
    specifications: {
      make: "Epson",
      model: "PowerLite 4K",
      serial_number: "EP-4K-2026-007",
      resolution: "3840 x 2160",
      brightness: "3000 lumens"
    },
    maintenance_schedule: {
      last_maintenance_date: "2026-03-15T09:00:00Z",
      next_maintenance_date: "2026-06-15T09:00:00Z",
      type: "filter_cleaning",
      estimated_cost: 40
    },
    created_at: "2026-02-10T14:30:00Z",
    updated_at: "2026-04-10T14:30:00Z"
  },
  {
    _id: "AST_008",
    asset_name: "Standing Desk Electric",
    category: "Furniture",
    type: "desk",
    status: "active",
    purchase_date: "2026-01-20T11:00:00Z",
    purchase_cost: {
      amount: 650,
      currency: "USD"
    },
    current_value: {
      amount: 585,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 5,
      annual_rate: 20
    },
    assigned_to: {
      user_id: {
        firstName: "David",
        lastName: "Brown"
      },
      department: "Engineering"
    },
    location: "Office Building - Floor 3",
    specifications: {
      make: "Uplift",
      model: "V2 Electric",
      serial_number: "UP-V2-2026-008",
      material: "Laminate and Steel",
      dimensions: "60\" x 30\""
    },
    maintenance_schedule: {
      last_maintenance_date: "2026-04-01T10:00:00Z",
      next_maintenance_date: "2026-07-01T10:00:00Z",
      type: "lubrication",
      estimated_cost: 20
    },
    created_at: "2026-01-20T11:00:00Z",
    updated_at: "2026-04-05T11:00:00Z"
  },
  {
    _id: "AST_009",
    asset_name: "iPad Pro 12.9\"",
    category: "Electronics",
    type: "tablet",
    status: "active",
    purchase_date: "2026-04-01T13:45:00Z",
    purchase_cost: {
      amount: 1100,
      currency: "USD"
    },
    current_value: {
      amount: 1050,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 3,
      annual_rate: 33.3
    },
    assigned_to: {
      user_id: {
        firstName: "Emily",
        lastName: "Chen"
      },
      department: "Marketing"
    },
    location: "Marketing Department",
    specifications: {
      make: "Apple",
      model: "iPad Pro 12.9\"",
      serial_number: "AP-IPAD-2026-009",
      storage: "256GB",
      connectivity: "WiFi + Cellular"
    },
    maintenance_schedule: {
      last_maintenance_date: null,
      next_maintenance_date: "2026-07-01T10:00:00Z",
      type: "software_update",
      estimated_cost: 0
    },
    created_at: "2026-04-01T13:45:00Z",
    updated_at: "2026-04-15T13:45:00Z"
  },
  {
    _id: "AST_010",
    asset_name: "Coffee Machine Commercial",
    category: "Office Equipment",
    type: "appliance",
    status: "active",
    purchase_date: "2026-03-01T09:00:00Z",
    purchase_cost: {
      amount: 2200,
      currency: "USD"
    },
    current_value: {
      amount: 2000,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 5,
      annual_rate: 20
    },
    assigned_to: null,
    location: "Break Room - Floor 1",
    specifications: {
      make: "Breville",
      model: "Barista Express",
      serial_number: "BR-BAR-2026-010",
      capacity: "60 oz",
      type: "Espresso Machine"
    },
    maintenance_schedule: {
      last_maintenance_date: "2026-04-01T08:00:00Z",
      next_maintenance_date: "2026-05-01T08:00:00Z",
      type: "descaling",
      estimated_cost: 15
    },
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-04-10T09:00:00Z"
  },
  {
    _id: "AST_004",
    asset_name: "Conference Room Table",
    category: "Furniture",
    type: "table",
    status: "active",
    purchase_date: "2023-12-10T16:00:00Z",
    purchase_cost: {
      amount: 800,
      currency: "USD"
    },
    current_value: {
      amount: 720,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 10,
      annual_rate: 10
    },
    assigned_to: null,
    location: "Conference Room - Floor 4",
    specifications: {
      make: "Office Depot",
      model: "Executive Conference Table",
      serial_number: "OD-CONF-2023-004",
      material: "Mahogany Wood",
      dimensions: "96\" x 48\"",
      seating_capacity: 8
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-01-15T10:00:00Z",
      next_maintenance_date: "2024-07-15T10:00:00Z",
      type: "polishing",
      estimated_cost: 30
    },
    created_at: "2023-12-10T16:00:00Z",
    updated_at: "2024-03-10T16:00:00Z"
  },
  {
    _id: "AST_005",
    asset_name: "MacBook Pro 16\"",
    category: "Electronics",
    type: "laptop",
    status: "in_repair",
    purchase_date: "2023-09-05T13:45:00Z",
    purchase_cost: {
      amount: 2800,
      currency: "USD"
    },
    current_value: {
      amount: 2100,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 4,
      annual_rate: 25
    },
    assigned_to: {
      user_id: {
        firstName: "Sarah",
        lastName: "Williams"
      },
      department: "Marketing"
    },
    location: "Repair Center - Tech Bay 2",
    specifications: {
      make: "Apple",
      model: "MacBook Pro 16-inch",
      serial_number: "MBP-16-2023-005",
      processor: "Apple M2 Pro",
      ram: "32GB",
      storage: "1TB SSD",
      screen: "16-inch Liquid Retina XDR"
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-04-01T14:00:00Z",
      next_maintenance_date: "2024-04-15T14:00:00Z",
      type: "screen_replacement",
      estimated_cost: 400
    },
    created_at: "2023-09-05T13:45:00Z",
    updated_at: "2024-04-01T14:00:00Z"
  },
  {
    _id: "AST_006",
    asset_name: "Industrial CNC Machine",
    category: "Machinery",
    type: "manufacturing",
    status: "maintenance_due",
    purchase_date: "2022-03-15T09:00:00Z",
    purchase_cost: {
      amount: 45000,
      currency: "USD"
    },
    current_value: {
      amount: 36000,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 15,
      annual_rate: 6.67
    },
    assigned_to: {
      user_id: {
        firstName: "Robert",
        lastName: "Brown"
      },
      department: "Production"
    },
    location: "Factory Floor - Section A",
    specifications: {
      make: "Haas",
      model: "VF-2",
      serial_number: "HA-VF2-2022-006",
      type: "Vertical CNC Mill",
      working_area: "30\" x 16\" x 20\"",
      spindle_speed: "12000 RPM"
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-01-10T08:00:00Z",
      next_maintenance_date: "2024-04-10T08:00:00Z",
      type: "major_service",
      estimated_cost: 1500
    },
    created_at: "2022-03-15T09:00:00Z",
    updated_at: "2024-03-15T09:00:00Z"
  },
  {
    _id: "AST_007",
    asset_name: "Office Chairs Set",
    category: "Furniture",
    type: "seating",
    status: "active",
    purchase_date: "2023-08-20T10:30:00Z",
    purchase_cost: {
      amount: 1200,
      currency: "USD"
    },
    current_value: {
      amount: 1080,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 8,
      annual_rate: 12.5
    },
    assigned_to: null,
    location: "Office Building - Floor 3",
    specifications: {
      make: "Herman Miller",
      model: "Aeron Chair",
      serial_number: "HM-AER-2023-007",
      quantity: 6,
      material: "Mesh and Aluminum",
      adjustable_features: "Height, Lumbar, Armrests"
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-02-15T11:00:00Z",
      next_maintenance_date: "2024-08-15T11:00:00Z",
      type: "general_inspection",
      estimated_cost: 60
    },
    created_at: "2023-08-20T10:30:00Z",
    updated_at: "2024-02-15T11:00:00Z"
  },
  {
    _id: "AST_008",
    asset_name: "Server Rack Infrastructure",
    category: "Electronics",
    type: "server",
    status: "active",
    purchase_date: "2023-05-10T08:00:00Z",
    purchase_cost: {
      amount: 15000,
      currency: "USD"
    },
    current_value: {
      amount: 12000,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 5,
      annual_rate: 20
    },
    assigned_to: {
      user_id: {
        firstName: "David",
        lastName: "Lee"
      },
      department: "IT"
    },
    location: "Server Room - Rack A1",
    specifications: {
      make: "Dell PowerEdge",
      model: "R740",
      serial_number: "DL-PE-2023-008",
      type: "Rack Server",
      processors: "2x Intel Xeon Silver",
      ram: "128GB DDR4",
      storage: "10TB RAID 10"
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-03-25T06:00:00Z",
      next_maintenance_date: "2024-06-25T06:00:00Z",
      type: "system_update",
      estimated_cost: 200
    },
    created_at: "2023-05-10T08:00:00Z",
    updated_at: "2024-03-25T06:00:00Z"
  },
  {
    _id: "AST_009",
    asset_name: "Delivery Van",
    category: "Vehicle",
    type: "van",
    status: "active",
    purchase_date: "2023-11-01T12:00:00Z",
    purchase_cost: {
      amount: 35000,
      currency: "USD"
    },
    current_value: {
      amount: 31500,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 7,
      annual_rate: 14.29
    },
    assigned_to: {
      user_id: {
        firstName: "Tom",
        lastName: "Wilson"
      },
      department: "Logistics"
    },
    location: "Company Parking - Spot B05",
    specifications: {
      make: "Ford",
      model: "Transit Connect",
      serial_number: "FD-TRANS-2023-009",
      year: 2023,
      color: "White",
      cargo_capacity: "300 cu ft",
      mileage: 25000
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-03-10T07:30:00Z",
      next_maintenance_date: "2024-06-10T07:30:00Z",
      type: "routine_service",
      estimated_cost: 180
    },
    created_at: "2023-11-01T12:00:00Z",
    updated_at: "2024-03-10T07:30:00Z"
  },
  {
    _id: "AST_010",
    asset_name: "Projector Epson PowerLite",
    category: "Electronics",
    type: "projector",
    status: "active",
    purchase_date: "2024-01-25T15:45:00Z",
    purchase_cost: {
      amount: 800,
      currency: "USD"
    },
    current_value: {
      amount: 720,
      currency: "USD"
    },
    depreciation: {
      method: "straight_line",
      useful_life: 5,
      annual_rate: 20
    },
    assigned_to: null,
    location: "Conference Room - Floor 4",
    specifications: {
      make: "Epson",
      model: "PowerLite 955WH",
      serial_number: "EP-PL-2024-010",
      brightness: "3200 lumens",
      resolution: "1920 x 1080",
      throw_distance: "1.2m - 8.2m"
    },
    maintenance_schedule: {
      last_maintenance_date: "2024-03-05T16:00:00Z",
      next_maintenance_date: "2024-06-05T16:00:00Z",
      type: "bulb_cleaning",
      estimated_cost: 40
    },
    created_at: "2024-01-25T15:45:00Z",
    updated_at: "2024-03-05T16:00:00Z"
  }
];

const mockAssets = mockData.assets;

export { mockInventory, mockSuppliers, mockCustomers, mockTransactions, mockCategories, mockAnalytics, mockSales, mockPurchases, mockStockTransfers, mockExpenses, mockInvoices, mockPayments, mockSalesReturns, mockQuotations, mockSalesReports, mockSalesAgents, mockStockAdjustments, mockAssets };

export default mockData;
