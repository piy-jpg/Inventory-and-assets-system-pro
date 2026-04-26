// Database Seeding Script for Smart Inventory System
// This file contains functions to initialize and populate the database

import { mockInventory, mockCustomers, mockSuppliers, mockTransactions, mockCategories } from './mockData.js';

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Simulate database connection
    const database = {
      inventory: [],
      customers: [],
      suppliers: [],
      transactions: [],
      categories: [],
      assets: []
    };

    // Seed Categories first (needed by inventory items)
    console.log('📁 Seeding categories...');
    mockCategories.forEach(category => {
      database.categories.push({
        ...category,
        _id: `CAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    });

    // Seed Suppliers
    console.log('🏭 Seeding suppliers...');
    mockSuppliers.forEach(supplier => {
      database.suppliers.push({
        ...supplier,
        _id: `SUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    });

    // Seed Customers
    console.log('👥 Seeding customers...');
    mockCustomers.forEach(customer => {
      database.customers.push({
        ...customer,
        _id: `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    });

    // Seed Inventory
    console.log('📦 Seeding inventory...');
    mockInventory.forEach(item => {
      // Link to supplier and category
      const supplier = database.suppliers.find(s => s.name === item.supplier);
      const category = database.categories.find(c => c.name === item.category);
      
      database.inventory.push({
        ...item,
        _id: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        supplier_id: supplier?._id : null,
        category_id: category?._id : null
      });
    });

    // Seed Transactions
    console.log('💰 Seeding transactions...');
    mockTransactions.forEach(transaction => {
      const customer = database.customers.find(c => c.customer_id === transaction.customer_id);
      const supplier = database.suppliers.find(s => s.supplier_id === transaction.supplier_id);
      
      database.transactions.push({
        ...transaction,
        _id: `TRANS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customer_id: customer?._id : null,
        supplier_id: supplier?._id : null
      });
    });

    // Create indexes for performance
    console.log('🔍 Creating database indexes...');
    const indexes = {
      inventory: ['sku', 'category', 'supplier_id', 'isActive'],
      customers: ['customer_id', 'email', 'status', 'group'],
      suppliers: ['supplier_id', 'category', 'status'],
      transactions: ['transaction_id', 'type', 'category', 'customer_id', 'supplier_id', 'date'],
      categories: ['name', 'parent_id', 'level', 'status']
    };

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Database Summary:');
    console.log(`   - Categories: ${database.categories.length}`);
    console.log(`   - Suppliers: ${database.suppliers.length}`);
    console.log(`   - Customers: ${database.customers.length}`);
    console.log(`   - Inventory: ${database.inventory.length}`);
    console.log(`   - Transactions: ${database.transactions.length}`);
    
    return {
      success: true,
      data: database,
      indexes,
      summary: {
        categories: database.categories.length,
        suppliers: database.suppliers.length,
        customers: database.customers.length,
        inventory: database.inventory.length,
        transactions: database.transactions.length
      }
    };
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const validateDatabase = (database) => {
  console.log('🔍 Validating database integrity...');
  
  const validation = {
    categories: {
      total: database.categories?.length || 0,
      valid: 0,
      errors: []
    },
    suppliers: {
      total: database.suppliers?.length || 0,
      valid: 0,
      errors: []
    },
    customers: {
      total: database.customers?.length || 0,
      valid: 0,
      errors: []
    },
    inventory: {
      total: database.inventory?.length || 0,
      valid: 0,
      errors: []
    },
    transactions: {
      total: database.transactions?.length || 0,
      valid: 0,
      errors: []
    }
  };

  // Validate categories
  database.categories?.forEach((category, index) => {
    if (!category.name || !category._id) {
      validation.categories.errors.push(`Category ${index}: Missing name or ID`);
    } else {
      validation.categories.valid++;
    }
  });

  // Validate suppliers
  database.suppliers?.forEach((supplier, index) => {
    if (!supplier.name || !supplier._id) {
      validation.suppliers.errors.push(`Supplier ${index}: Missing name or ID`);
    } else {
      validation.suppliers.valid++;
    }
  });

  // Validate customers
  database.customers?.forEach((customer, index) => {
    if (!customer.name || !customer._id) {
      validation.customers.errors.push(`Customer ${index}: Missing name or ID`);
    } else {
      validation.customers.valid++;
    }
  });

  // Validate inventory
  database.inventory?.forEach((item, index) => {
    if (!item.name || !item._id || !item.price) {
      validation.inventory.errors.push(`Inventory ${index}: Missing name, ID, or price`);
    } else {
      validation.inventory.valid++;
    }
  });

  // Validate transactions
  database.transactions?.forEach((transaction, index) => {
    if (!transaction.type || !transaction._id || !transaction.amount) {
      validation.transactions.errors.push(`Transaction ${index}: Missing type, ID, or amount`);
    } else {
      validation.transactions.valid++;
    }
  });

  const totalErrors = validation.categories.errors.length + 
                   validation.suppliers.errors.length + 
                   validation.customers.errors.length + 
                   validation.inventory.errors.length + 
                   validation.transactions.errors.length;

  console.log('✅ Database validation completed!');
  console.log(`📊 Validation Summary: ${validation.customers.valid + validation.suppliers.valid + validation.inventory.valid + validation.transactions.valid} valid, ${totalErrors} errors`);

  return {
    success: totalErrors === 0,
    validation,
    summary: {
      totalValid: validation.customers.valid + validation.suppliers.valid + validation.inventory.valid + validation.transactions.valid,
      totalErrors
    }
  };
};

export const resetDatabase = () => {
  console.log('🔄 Resetting database...');
  localStorage.clear();
  console.log('✅ Database reset completed');
  return { success: true };
};
