const { executeQuery, executeTransaction } = require('../database/config');

class ProductModel {
  // Get all products with optional filtering
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name,
        (i.quantity * i.price_selling) as total_value,
        CASE 
          WHEN i.quantity <= i.min_stock THEN 'Low Stock'
          WHEN i.quantity = 0 THEN 'Out of Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.search) {
      query += ` AND (i.name LIKE ? OR i.sku LIKE ? OR i.description LIKE ?)`;
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (filters.category) {
      query += ` AND c.name = ?`;
      params.push(filters.category);
    }
    
    if (filters.status) {
      query += ` AND i.status = ?`;
      params.push(filters.status);
    }
    
    if (filters.supplier_id) {
      query += ` AND i.supplier_id = ?`;
      params.push(filters.supplier_id);
    }
    
    if (filters.min_stock) {
      query += ` AND i.quantity <= i.min_stock`;
    }
    
    // Sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'ASC';
    query += ` ORDER BY i.${sortBy} ${sortOrder}`;
    
    // Pagination
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
    }
    
    if (filters.offset) {
      query += ` OFFSET ?`;
      params.push(parseInt(filters.offset));
    }
    
    return await executeQuery(query, params);
  }
  
  // Get product by ID
  static async getById(id) {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name,
        (i.quantity * i.price_selling) as total_value
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.id = ?
    `;
    
    const results = await executeQuery(query, [id]);
    return results[0];
  }
  
  // Get product by SKU
  static async getBySku(sku) {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.sku = ?
    `;
    
    const results = await executeQuery(query, [sku]);
    return results[0];
  }
  
  // Create new product
  static async create(productData) {
    const query = `
      INSERT INTO inventory (
        item_id, name, description, category_id, brand, sku, barcode,
        price_cost, price_selling, quantity, min_stock, max_stock,
        reorder_point, reorder_quantity, unit, supplier_id, location,
        tags, specifications, warranty_period, warranty_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      productData.item_id,
      productData.name,
      productData.description || '',
      productData.category_id,
      productData.brand || '',
      productData.sku,
      productData.barcode || '',
      productData.price_cost,
      productData.price_selling,
      productData.quantity || 0,
      productData.min_stock || 0,
      productData.max_stock || 0,
      productData.reorder_point || 0,
      productData.reorder_quantity || 0,
      productData.unit || 'pieces',
      productData.supplier_id || null,
      JSON.stringify(productData.location || {}),
      JSON.stringify(productData.tags || []),
      JSON.stringify(productData.specifications || {}),
      productData.warranty_period || 0,
      productData.warranty_type || '',
      productData.status || 'active'
    ];
    
    const result = await executeQuery(query, params);
    return await this.getById(result.insertId);
  }
  
  // Update product
  static async update(id, productData) {
    const query = `
      UPDATE inventory SET
        name = ?, description = ?, category_id = ?, brand = ?, sku = ?,
        barcode = ?, price_cost = ?, price_selling = ?, quantity = ?,
        min_stock = ?, max_stock = ?, reorder_point = ?, reorder_quantity = ?,
        unit = ?, supplier_id = ?, location = ?, tags = ?,
        specifications = ?, warranty_period = ?, warranty_type = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      productData.name,
      productData.description || '',
      productData.category_id,
      productData.brand || '',
      productData.sku,
      productData.barcode || '',
      productData.price_cost,
      productData.price_selling,
      productData.quantity || 0,
      productData.min_stock || 0,
      productData.max_stock || 0,
      productData.reorder_point || 0,
      productData.reorder_quantity || 0,
      productData.unit || 'pieces',
      productData.supplier_id || null,
      JSON.stringify(productData.location || {}),
      JSON.stringify(productData.tags || []),
      JSON.stringify(productData.specifications || {}),
      productData.warranty_period || 0,
      productData.warranty_type || '',
      productData.status || 'active',
      id
    ];
    
    await executeQuery(query, params);
    return await this.getById(id);
  }
  
  // Delete product
  static async delete(id) {
    const query = 'DELETE FROM inventory WHERE id = ?';
    await executeQuery(query, [id]);
  }
  
  // Adjust stock
  static async adjustStock(id, adjustmentData) {
    const queries = [
      {
        query: 'SELECT quantity FROM inventory WHERE id = ?',
        params: [id]
      },
      {
        query: `
          INSERT INTO inventory_adjustments 
          (inventory_id, adjustment_type, previous_quantity, new_quantity, quantity_change, reason, reference_type, reference_id, notes, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          id,
          adjustmentData.type || 'adjustment',
          adjustmentData.previous_quantity,
          adjustmentData.new_quantity,
          adjustmentData.quantity_change,
          adjustmentData.reason || 'Manual adjustment',
          adjustmentData.reference_type || 'adjustment',
          adjustmentData.reference_id || null,
          adjustmentData.notes || '',
          adjustmentData.created_by
        ]
      },
      {
        query: 'UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        params: [adjustmentData.new_quantity, id]
      }
    ];
    
    await executeTransaction(queries);
    return await this.getById(id);
  }
  
  // Get low stock products
  static async getLowStock() {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name,
        (i.min_stock - i.quantity) as deficit
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.quantity <= i.min_stock AND i.is_active = TRUE
      ORDER BY (i.min_stock - i.quantity) DESC
    `;
    
    return await executeQuery(query);
  }
  
  // Get out of stock products
  static async getOutOfStock() {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.quantity = 0 AND i.is_active = TRUE
      ORDER BY i.name ASC
    `;
    
    return await executeQuery(query);
  }
  
  // Get product statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_products,
        SUM(quantity) as total_quantity,
        SUM(quantity * price_cost) as total_cost_value,
        SUM(quantity * price_selling) as total_selling_value,
        COUNT(CASE WHEN quantity <= min_stock THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count,
        AVG(price_selling) as avg_selling_price
      FROM inventory
      WHERE is_active = TRUE
    `;
    
    const result = await executeQuery(query);
    return result[0];
  }
  
  // Search products
  static async search(searchTerm, filters = {}) {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name,
        MATCH(i.name, i.description, i.sku) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE MATCH(i.name, i.description, i.sku) AGAINST(? IN NATURAL LANGUAGE MODE)
      AND i.is_active = TRUE
      ORDER BY relevance_score DESC
    `;
    
    return await executeQuery(query, [searchTerm, searchTerm]);
  }
  
  // Bulk update prices
  static async bulkUpdatePrice(updates) {
    const queries = updates.map(update => ({
      query: 'UPDATE inventory SET price_cost = ?, price_selling = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      params: [update.cost, update.selling, update.id]
    }));
    
    await executeTransaction(queries);
  }
  
  // Get products by supplier
  static async getBySupplier(supplierId) {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.supplier_id = ? AND i.is_active = TRUE
      ORDER BY i.name ASC
    `;
    
    return await executeQuery(query, [supplierId]);
  }
  
  // Get products by category
  static async getByCategory(categoryId) {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.category_id = ? AND i.is_active = TRUE
      ORDER BY i.name ASC
    `;
    
    return await executeQuery(query, [categoryId]);
  }
}

module.exports = ProductModel;
