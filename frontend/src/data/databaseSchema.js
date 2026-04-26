// Database Schema for Smart Inventory System
// This file defines the structure and relationships for the database

export const databaseSchema = {
  // Inventory Items Collection
  inventory: {
    collection: 'inventory',
    fields: {
      _id: 'ObjectId',
      item_id: 'String',
      name: 'String',
      sku: 'String',
      category: 'String',
      brand: 'String',
      description: 'String',
      price: 'Number',
      cost: 'Number',
      quantity: 'Number',
      minStock: 'Number',
      maxStock: 'Number',
      unit: 'String',
      supplier: 'ObjectId',
      location: 'Object',
      tags: 'Array',
      reorderPoint: 'Number',
      reorderQuantity: 'Number',
      isActive: 'Boolean',
      warranty: 'Object',
      specifications: 'Object',
      images: 'Array',
      barcode: 'String',
      weight: 'Number',
      dimensions: 'Object',
      createdAt: 'Date',
      updatedAt: 'Date'
    },
    indexes: ['sku', 'category', 'supplier', 'isActive'],
    relationships: {
      supplier: 'many-to-one',
      category: 'many-to-one',
      transactions: 'one-to-many'
    }
  },

  // Customers Collection
  customers: {
    collection: 'customers',
    fields: {
      _id: 'ObjectId',
      customer_id: 'String',
      name: 'String',
      email: 'String',
      phone: 'String',
      address: 'Object',
      company_name: 'String',
      gst_number: 'String',
      credit_limit: 'Number',
      outstanding_balance: 'Number',
      payment_status: 'String',
      group: 'String',
      status: 'String',
      totalSpent: 'Number',
      totalPurchases: 'Number',
      metrics: 'Object',
      tags: 'Array',
      follow_up_reminder: 'String',
      notes: 'String',
      createdAt: 'Date',
      updatedAt: 'Date'
    },
    indexes: ['customer_id', 'email', 'status', 'group'],
    relationships: {
      transactions: 'one-to-many',
      communication_log: 'one-to-many'
    }
  },

  // Suppliers Collection
  suppliers: {
    collection: 'suppliers',
    fields: {
      _id: 'ObjectId',
      supplier_id: 'String',
      name: 'String',
      company_name: 'String',
      email: 'String',
      phone: 'String',
      address: 'Object',
      category: 'String',
      contact_person: 'String',
      performance: 'Object',
      status: 'String',
      payment_terms: 'String',
      lead_time: 'Number',
      products_supplied: 'Array',
      tags: 'Array',
      notes: 'String',
      createdAt: 'Date',
      updatedAt: 'Date'
    },
    indexes: ['supplier_id', 'category', 'status'],
    relationships: {
      inventory: 'one-to-many',
      transactions: 'one-to-many'
    }
  },

  // Transactions Collection
  transactions: {
    collection: 'transactions',
    fields: {
      _id: 'ObjectId',
      transaction_id: 'String',
      type: 'String',
      category: 'String',
      amount: 'Number',
      date: 'Date',
      description: 'String',
      customer_id: 'ObjectId',
      customer_name: 'String',
      supplier_id: 'ObjectId',
      supplier_name: 'String',
      items: 'Array',
      payment_method: 'String',
      payment_status: 'String',
      reference: 'String',
      created_by: 'String',
      tags: 'Array',
      createdAt: 'Date'
    },
    indexes: ['transaction_id', 'type', 'category', 'customer_id', 'supplier_id', 'date'],
    relationships: {
      customer: 'many-to-one',
      supplier: 'many-to-one',
      inventory: 'one-to-many'
    }
  },

  // Categories Collection
  categories: {
    collection: 'categories',
    fields: {
      _id: 'ObjectId',
      name: 'String',
      description: 'String',
      parent_id: 'ObjectId',
      level: 'Number',
      status: 'String',
      tags: 'Array',
      created_at: 'Date'
    },
    indexes: ['name', 'parent_id', 'level', 'status'],
    relationships: {
      parent: 'many-to-one',
      children: 'one-to-many',
      inventory: 'one-to-many'
    }
  },

  // Assets Collection
  assets: {
    collection: 'assets',
    fields: {
      _id: 'ObjectId',
      asset_id: 'String',
      name: 'String',
      category: 'String',
      description: 'String',
      purchase_date: 'Date',
      purchase_cost: 'Number',
      current_value: 'Number',
      depreciation_rate: 'Number',
      status: 'String',
      location: 'Object',
      assigned_to: 'ObjectId',
      maintenance_records: 'Array',
      warranty_expiry: 'Date',
      last_maintenance: 'Date',
      created_at: 'Date',
      updated_at: 'Date'
    },
    indexes: ['asset_id', 'category', 'status', 'assigned_to'],
    relationships: {
      maintenance_records: 'one-to-many',
      assigned_user: 'many-to-one',
      inventory: 'one-to-one'
    }
  }
};

// Database Relationships Summary
export const relationships = {
  // Customer can have many transactions
  customer_transactions: {
    from: 'customers',
    to: 'transactions',
    type: 'one-to-many',
    foreignKey: 'customer_id'
  },
  
  // Supplier can have many transactions
  supplier_transactions: {
    from: 'suppliers',
    to: 'transactions',
    type: 'one-to-many',
    foreignKey: 'supplier_id'
  },
  
  // Supplier can supply many inventory items
  supplier_inventory: {
    from: 'suppliers',
    to: 'inventory',
    type: 'one-to-many',
    foreignKey: 'supplier'
  },
  
  // Inventory items can be in many transactions
  inventory_transactions: {
    from: 'inventory',
    to: 'transactions',
    type: 'one-to-many',
    foreignKey: 'item_id'
  },
  
  // Categories can have parent-child relationships
  category_hierarchy: {
    from: 'categories',
    to: 'categories',
    type: 'self-reference',
    foreignKey: 'parent_id'
  },
  
  // Assets can have maintenance records
  asset_maintenance: {
    from: 'assets',
    to: 'maintenance_records',
    type: 'one-to-many',
    foreignKey: 'asset_id'
  }
};
