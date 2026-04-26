// System Integration Module for Smart Inventory System
// This file provides comprehensive integration between all modules

class SystemIntegration {
  constructor() {
    this.eventListeners = new Map();
    this.setupEventListeners();
  }

  // Setup global event listeners for cross-module communication
  setupEventListeners() {
    // Listen for database changes
    window.addEventListener('databaseChange', this.handleDatabaseChange.bind(this));
    
    // Listen for inventory updates
    window.addEventListener('inventoryUpdate', this.handleInventoryUpdate.bind(this));
    
    // Listen for sales updates
    window.addEventListener('saleComplete', this.handleSaleComplete.bind(this));
    
    // Listen for customer updates
    window.addEventListener('customerUpdate', this.handleCustomerUpdate.bind(this));
    
    // Listen for purchase updates
    window.addEventListener('purchaseUpdate', this.handlePurchaseUpdate.bind(this));
  }

  // Handle database changes and propagate to all modules
  handleDatabaseChange(event) {
    const { operation, table, data } = event.detail;
    
    // Update dashboard analytics
    this.updateDashboardAnalytics(operation, table, data);
    
    // Update related modules based on table changes
    switch (table) {
      case 'inventory':
        this.updateInventoryModules(operation, data);
        break;
      case 'customers':
        this.updateCustomerModules(operation, data);
        break;
      case 'purchases':
        this.updatePurchaseModules(operation, data);
        break;
      case 'sales':
        this.updateSalesModules(operation, data);
        break;
    }
  }

  // Update dashboard analytics in real-time
  updateDashboardAnalytics(operation, table, data) {
    const dashboardEvent = new CustomEvent('dashboardUpdate', {
      detail: {
        operation,
        table,
        data,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(dashboardEvent);
  }

  // Update inventory-related modules
  updateInventoryModules(operation, data) {
    // Notify POS system of inventory changes
    const posEvent = new CustomEvent('inventorySync', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(posEvent);
    
    // Notify purchase system of inventory changes
    const purchaseEvent = new CustomEvent('inventoryChange', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(purchaseEvent);
    
    // Update product tools with inventory changes
    const productToolsEvent = new CustomEvent('productUpdate', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(productToolsEvent);
  }

  // Update customer-related modules
  updateCustomerModules(operation, data) {
    // Notify POS system of customer changes
    const posEvent = new CustomEvent('customerSync', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(posEvent);
    
    // Update sales system with customer changes
    const salesEvent = new CustomEvent('customerChange', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(salesEvent);
  }

  // Update purchase-related modules
  updatePurchaseModules(operation, data) {
    // Notify inventory of purchase changes
    const inventoryEvent = new CustomEvent('purchaseSync', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(inventoryEvent);
    
    // Update suppliers if needed
    const supplierEvent = new CustomEvent('supplierUpdate', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(supplierEvent);
  }

  // Update sales-related modules
  updateSalesModules(operation, data) {
    // Notify dashboard of sales changes
    const dashboardEvent = new CustomEvent('salesAnalytics', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(dashboardEvent);
    
    // Update inventory of sales changes
    const inventoryEvent = new CustomEvent('salesSync', {
      detail: { operation, data, source: 'database' }
    });
    window.dispatchEvent(inventoryEvent);
    
    // Update customer records with sales
    const customerEvent = new CustomEvent('customerSalesUpdate', {
      detail: { operation, data, source: 'sales' }
    });
    window.dispatchEvent(customerEvent);
  }

  // Synchronize data between modules
  syncData(sourceModule, targetModules, data) {
    targetModules.forEach(module => {
      const syncEvent = new CustomEvent('dataSync', {
        detail: {
          source: sourceModule,
          target: module,
          data,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(syncEvent);
    });
  }

  // Real-time stock level updates
  updateStockLevels(changes) {
    changes.forEach(change => {
      const stockEvent = new CustomEvent('stockUpdate', {
        detail: {
          itemId: change.itemId,
          oldQuantity: change.oldQuantity,
          newQuantity: change.newQuantity,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(stockEvent);
    });
  }

  // Cross-module search functionality
  searchAcrossModules(query, type = 'all') {
    const searchResults = {
      inventory: [],
      customers: [],
      sales: [],
      purchases: [],
      suppliers: []
    };

    // Trigger search events in different modules
    const searchEvent = new CustomEvent('globalSearch', {
      detail: { query, type, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(searchEvent);

    return searchResults;
  }

  // Automated workflows
  triggerWorkflow(workflowType, data) {
    const workflowEvent = new CustomEvent('workflow', {
      detail: {
        type: workflowType,
        data,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(workflowEvent);
  }

  // Data validation across modules
  validateCrossModuleData(operation, data, rules = {}) {
    const validationResults = {
      inventory: [],
      customers: [],
      sales: [],
      purchases: []
    };

    // Validate inventory rules
    if (rules.inventory) {
      rules.inventory.forEach(rule => {
        const result = this.validateInventoryRule(data, rule);
        validationResults.inventory.push(result);
      });
    }

    // Validate customer rules
    if (rules.customers) {
      rules.customers.forEach(rule => {
        const result = this.validateCustomerRule(data, rule);
        validationResults.customers.push(result);
      });
    }

    return validationResults;
  }

  validateInventoryRule(data, rule) {
    // Example validation logic
    switch (rule.type) {
      case 'stockLevel':
        return {
          rule,
          valid: data.quantity >= data.minStock,
          message: data.quantity >= data.minStock ? 'Stock level OK' : 'Low stock warning'
        };
      case 'priceRange':
        return {
          rule,
          valid: data.price >= data.cost,
          message: data.price >= data.cost ? 'Price valid' : 'Price below cost'
        };
      default:
        return { rule, valid: true, message: 'Valid' };
    }
  }

  validateCustomerRule(data, rule) {
    // Example validation logic
    switch (rule.type) {
      case 'creditLimit':
        return {
          rule,
          valid: data.outstanding_balance <= data.credit_limit,
          message: data.outstanding_balance <= data.credit_limit ? 'Credit OK' : 'Over credit limit'
        };
      case 'paymentStatus':
        return {
          rule,
          valid: ['paid', 'partial'].includes(data.payment_status),
          message: 'Payment status valid'
        };
      default:
        return { rule, valid: true, message: 'Valid' };
    }
  }

  // Cleanup event listeners
  cleanup() {
    this.eventListeners.forEach((callback, event) => {
      window.removeEventListener(event, callback);
    });
    this.eventListeners.clear();
  }
}

export default SystemIntegration;
