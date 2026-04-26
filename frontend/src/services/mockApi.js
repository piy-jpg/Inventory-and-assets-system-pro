import { 
  mockInventory, 
  mockSuppliers, 
  mockCustomers, 
  mockTransactions, 
  mockCategories, 
  mockAnalytics,
  mockSales 
} from '../data/mockData';

class MockApiService {
  constructor() {
    this.inventory = [...mockInventory];
    this.suppliers = [...mockSuppliers];
    this.customers = [...mockCustomers];
    this.transactions = [...mockTransactions];
    this.categories = [...mockCategories];
    this.analytics = { ...mockAnalytics };
    this.sales = [...mockSales];
  }

  // Simulate network delay
  delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Inventory API
  async getInventory(params = {}) {
    await this.delay();
    let items = [...this.inventory];
    
    if (params.search) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(params.search.toLowerCase()) ||
        item.sku.toLowerCase().includes(params.search.toLowerCase()) ||
        item.category.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    if (params.category) {
      items = items.filter(item => item.category === params.category);
    }
    
    if (params.minStock) {
      items = items.filter(item => item.quantity <= item.minStock);
    }

    return {
      data: {
        success: true,
        data: {
          inventory: items,
          items: items,
          total: items.length,
          page: 1,
          totalPages: 1
        }
      }
    };
  }

  async getInventoryById(id) {
    await this.delay();
    const item = this.inventory.find(item => item._id === id);
    
    if (!item) {
      throw new Error('Item not found');
    }

    return {
      data: {
        success: true,
        data: { item }
      }
    };
  }

  async createInventory(data) {
    await this.delay();
    const newItem = {
      _id: `INV_${Date.now()}`,
      item_id: `INV_${data.sku}_${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.inventory.push(newItem);
    
    return {
      data: {
        success: true,
        data: { item: newItem }
      }
    };
  }

  async updateInventory(id, data) {
    await this.delay();
    const index = this.inventory.findIndex(item => item._id === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    this.inventory[index] = {
      ...this.inventory[index],
      ...data,
      updatedAt: new Date()
    };

    return {
      data: {
        success: true,
        data: { item: this.inventory[index] }
      }
    };
  }

  async deleteInventory(id) {
    await this.delay();
    const index = this.inventory.findIndex(item => item._id === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    const deletedItem = this.inventory.splice(index, 1)[0];

    return {
      data: {
        success: true,
        data: { item: deletedItem }
      }
    };
  }

  async getCategories() {
    await this.delay();
    return {
      data: {
        success: true,
        data: { categories: this.categories }
      }
    };
  }

  async getLowStockItems() {
    await this.delay();
    const lowStockItems = this.inventory.filter(item => item.quantity <= item.minStock);
    
    return {
      data: {
        success: true,
        data: { items: lowStockItems }
      }
    };
  }

  // Suppliers API
  async getSuppliers(params = {}) {
    await this.delay();
    let items = [...this.suppliers];
    
    if (params.search) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(params.search.toLowerCase()) ||
        item.company_name.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    if (params.limit) {
      items = items.slice(0, params.limit);
    }

    return {
      data: {
        success: true,
        data: {
          suppliers: items,
          total: items.length,
          page: 1,
          totalPages: 1
        }
      }
    };
  }

  async getSupplierById(id) {
    await this.delay();
    const supplier = this.suppliers.find(supplier => supplier._id === id);
    
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return {
      data: {
        success: true,
        data: { supplier }
      }
    };
  }

  async createSupplier(data) {
    await this.delay();
    const newSupplier = {
      _id: `SUP_${Date.now()}`,
      supplier_id: `SUP_${data.name.replace(/\s+/g, '_')}_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.suppliers.push(newSupplier);
    
    return {
      data: {
        success: true,
        data: { supplier: newSupplier }
      }
    };
  }

  async updateSupplier(id, data) {
    await this.delay();
    const index = this.suppliers.findIndex(supplier => supplier._id === id);
    
    if (index === -1) {
      throw new Error('Supplier not found');
    }
    
    this.suppliers[index] = {
      ...this.suppliers[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return {
      data: {
        success: true,
        data: { supplier: this.suppliers[index] }
      }
    };
  }

  async deleteSupplier(id) {
    await this.delay();
    const index = this.suppliers.findIndex(supplier => supplier._id === id);
    
    if (index === -1) {
      throw new Error('Supplier not found');
    }
    
    const deletedSupplier = this.suppliers.splice(index, 1)[0];
    
    return {
      data: {
        success: true,
        data: { supplier: deletedSupplier }
      }
    };
  }

  // Customers API
  async getCustomers() {
    await this.delay();
    return {
      data: {
        success: true,
        data: { customers: this.customers }
      }
    };
  }

  async updateCustomer(id, data) {
    await this.delay();
    const index = this.customers.findIndex(c => c._id === id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...data, updatedAt: new Date() };
    }
    return {
      data: {
        success: true,
        data: { customer: this.customers[index] || this.customers.find(c => c._id === id) }
      }
    };
  }

  async createCustomer(data) {
    await this.delay();
    const newCustomer = {
      _id: `CUST_${Date.now()}`,
      customer_id: `CUST_${data.name.replace(/\s+/g, '_')}_${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.customers.push(newCustomer);
    
    return {
      data: {
        success: true,
        data: { customer: newCustomer }
      }
    };
  }

  // Transactions API
  async getTransactions(params = {}) {
    await this.delay();
    let transactions = [...this.transactions];
    
    if (params.type) {
      transactions = transactions.filter(t => t.type === params.type);
    }
    
    if (params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }

    return {
      data: {
        success: true,
        data: {
          transactions,
          total: transactions.length,
          page: 1,
          totalPages: 1
        }
      }
    };
  }

  async createTransaction(data) {
    await this.delay();
    const newTransaction = {
      _id: `TRANS_${Date.now()}`,
      transaction_id: `TRANS_${data.type.toUpperCase()}_${Date.now()}`,
      ...data,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.transactions.push(newTransaction);
    
    // Update inventory quantity
    if (data.item) {
      const inventoryItem = this.inventory.find(item => item._id === data.item);
      if (inventoryItem) {
        if (data.type === 'sale' || data.type === 'return') {
          inventoryItem.quantity -= data.quantity;
        } else if (data.type === 'purchase' || data.type === 'adjustment') {
          inventoryItem.quantity += data.quantity;
        }
        inventoryItem.updatedAt = new Date();
      }
    }
    
    return {
      data: {
        success: true,
        data: { transaction: newTransaction }
      }
    };
  }

  // Analytics API
  async getAnalytics() {
    await this.delay();
    
    // Recalculate analytics based on current data
    const totalRevenue = this.transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.totalPrice, 0);
    
    const totalCost = this.transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.totalPrice, 0);
    
    const lowStockItems = this.inventory.filter(item => item.quantity <= item.minStock);
    
    const categoryDistribution = this.categories.map(cat => {
      const categoryItems = this.inventory.filter(item => item.category === cat.name);
      const totalValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        category: cat.name,
        value: totalValue,
        count: categoryItems.length
      };
    });

    return {
      data: {
        success: true,
        data: {
          totalRevenue,
          totalCost,
          totalProfit: totalRevenue - totalCost,
          totalItems: this.inventory.length,
          lowStockItems: lowStockItems.length,
          outOfStockItems: this.inventory.filter(item => item.quantity === 0).length,
          recentTransactions: this.transactions.length,
          categoryDistribution,
          inventoryValue: this.inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      }
    };
  }

  // Dashboard API
  async getDashboardData() {
    await this.delay();
    
    const analytics = await this.getAnalytics();
    const recentTransactions = this.transactions.slice(-5).reverse();
    const lowStockItems = this.inventory.filter(item => item.quantity <= item.minStock);
    
    return {
      data: {
        success: true,
        data: {
          analytics: analytics.data.data,
          recentTransactions,
          lowStockItems,
          topSellingItems: this.transactions
            .filter(t => t.type === 'sale')
            .reduce((acc, t) => {
              const existing = acc.find(item => item.itemName === t.itemName);
              if (existing) {
                existing.quantity += t.quantity;
                existing.revenue += t.totalPrice;
              } else {
                acc.push({
                  itemName: t.itemName,
                  quantity: t.quantity,
                  revenue: t.totalPrice
                });
              }
              return acc;
            }, [])
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
        }
      }
    };
  }

  // Sales API
  async getAllSales(params = {}) {
    await this.delay();
    let items = [...this.sales];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter(item => 
        item.customer_name.toLowerCase().includes(searchLower) ||
        item.sale_id.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.status) {
      items = items.filter(item => item.status === params.status);
    }
    
    if (params.startDate && params.endDate) {
      items = items.filter(item => {
        const saleDate = new Date(item.sale_date);
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        return saleDate >= start && saleDate <= end;
      });
    }

    return {
      data: {
        success: true,
        data: {
          sales: items,
          total: items.length,
          page: 1,
          totalPages: 1
        }
      }
    };
  }

  async getSaleById(id) {
    await this.delay();
    const sale = this.sales.find(s => s._id === id || s.sale_id === id);
    return {
      data: {
        success: true,
        data: sale
      }
    };
  }

  async createSale(data) {
    await this.delay();
    const newSale = {
      _id: `SALE_${String(this.sales.length + 1).padStart(3, '0')}`,
      sale_id: `SALE_${String(this.sales.length + 1).padStart(3, '0')}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.sales.push(newSale);
    
    return {
      data: {
        success: true,
        data: newSale
      }
    };
  }

  async updateSale(id, data) {
    await this.delay();
    const index = this.sales.findIndex(s => s._id === id);
    if (index === -1) {
      throw new Error('Sale not found');
    }
    
    this.sales[index] = {
      ...this.sales[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    return {
      data: {
        success: true,
        data: this.sales[index]
      }
    };
  }

  async deleteSale(id) {
    await this.delay();
    const index = this.sales.findIndex(s => s._id === id);
    if (index === -1) {
      throw new Error('Sale not found');
    }
    
    const deletedSale = this.sales.splice(index, 1)[0];
    
    return {
      data: {
        success: true,
        data: deletedSale
      }
    };
  }
}

export default new MockApiService();
