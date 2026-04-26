const { executeQuery, executeTransaction } = require('../database/config');

class ContactModel {
  // Get all contacts with optional filtering
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        c.*,
        cc.name as category_name,
        cc.color as category_color,
        cc.icon as category_icon,
        u.username as created_by_name,
        COUNT(ci.id) as interaction_count,
        MAX(ci.interaction_date) as last_interaction_date,
        c.is_favorite
      FROM contacts c
      LEFT JOIN contact_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN contact_interactions ci ON c.id = ci.contact_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.search) {
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.company LIKE ? OR c.phone LIKE ?)`;
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    if (filters.contact_type) {
      query += ` AND c.contact_type = ?`;
      params.push(filters.contact_type);
    }
    
    if (filters.category_id) {
      query += ` AND c.category_id = ?`;
      params.push(filters.category_id);
    }
    
    if (filters.is_active !== undefined) {
      query += ` AND c.is_active = ?`;
      params.push(filters.is_active);
    }
    
    if (filters.is_favorite !== undefined) {
      query += ` AND c.is_favorite = ?`;
      params.push(filters.is_favorite);
    }
    
    if (filters.department) {
      query += ` AND c.department LIKE ?`;
      params.push(`%${filters.department}%`);
    }
    
    // Sorting
    const sortBy = filters.sortBy || 'last_name';
    const sortOrder = filters.sortOrder || 'ASC';
    query += ` ORDER BY c.${sortBy} ${sortOrder}`;
    
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
  
  // Get contact by ID
  static async getById(id) {
    const query = `
      SELECT 
        c.*,
        cc.name as category_name,
        cc.color as category_color,
        cc.icon as category_icon,
        u.username as created_by_name,
        COUNT(ci.id) as interaction_count,
        MAX(ci.interaction_date) as last_interaction_date
      FROM contacts c
      LEFT JOIN contact_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN contact_interactions ci ON c.id = ci.contact_id
      WHERE c.id = ?
    `;
    
    const results = await executeQuery(query, [id]);
    return results[0];
  }
  
  // Get contact by contact ID
  static async getByContactId(contactId) {
    const query = `
      SELECT 
        c.*,
        cc.name as category_name,
        cc.color as category_color,
        cc.icon as category_icon,
        u.username as created_by_name,
        COUNT(ci.id) as interaction_count,
        MAX(ci.interaction_date) as last_interaction_date
      FROM contacts c
      LEFT JOIN contact_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN contact_interactions ci ON c.id = ci.contact_id
      WHERE c.contact_id = ?
    `;
    
    const results = await executeQuery(query, [contactId]);
    return results[0];
  }
  
  // Create new contact
  static async create(contactData) {
    const queries = [
      {
        query: `
          INSERT INTO contacts (
            contact_id, first_name, last_name, email, phone, mobile, company,
            job_title, department, address, notes, contact_type, category_id,
            tags, is_active, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          contactData.contact_id,
          contactData.first_name,
          contactData.last_name,
          contactData.email,
          contactData.phone,
          contactData.mobile,
          contactData.company,
          contactData.job_title,
          contactData.department,
          JSON.stringify(contactData.address || {}),
          contactData.notes || '',
          contactData.contact_type || 'other',
          contactData.category_id || null,
          JSON.stringify(contactData.tags || []),
          contactData.is_active !== undefined ? contactData.is_active : true,
          contactData.created_by
        ]
      }
    ];
    
    // Add interaction for new contact
    if (contactData.add_interaction) {
      const [contactResult] = await executeTransaction(queries);
      const contactId = contactResult[0].insertId;
      
      queries.push({
        query: `
          INSERT INTO contact_interactions 
            (contact_id, interaction_type, subject, message, created_by)
          VALUES (?, ?, ?, ?, ?)
        `,
        params: [
          contactId,
          'note',
          'Contact created',
          `New contact "${contactData.first_name} ${contactData.last_name}" added to the system`,
          contactData.created_by
        ]
      });
    }
    
    const results = await executeTransaction(queries);
    return await this.getById(results[0].insertId);
  }
  
  // Update contact
  static async update(id, contactData) {
    const queries = [
      {
        query: `
          UPDATE contacts SET
            first_name = ?, last_name = ?, email = ?, phone = ?, mobile = ?,
            company = ?, job_title = ?, department = ?, address = ?, notes = ?,
            contact_type = ?, category_id = ?, tags = ?, is_active = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        params: [
          contactData.first_name,
          contactData.last_name,
          contactData.email,
          contactData.phone,
          contactData.mobile,
          contactData.company,
          contactData.job_title,
          contactData.department,
          JSON.stringify(contactData.address || {}),
          contactData.notes || '',
          contactData.contact_type,
          contactData.category_id,
          JSON.stringify(contactData.tags || []),
          contactData.is_active !== undefined ? contactData.is_active : true,
          id
        ]
      }
    ];
    
    // Add interaction for updated contact
    if (contactData.add_interaction) {
      queries.push({
        query: `
          INSERT INTO contact_interactions 
            (contact_id, interaction_type, subject, message, created_by)
          VALUES (?, ?, ?, ?, ?)
        `,
        params: [
          id,
          'note',
          'Contact updated',
          `Contact "${contactData.first_name} ${contactData.last_name}" information updated`,
          contactData.updated_by
        ]
      });
    }
    
    await executeTransaction(queries);
    return await this.getById(id);
  }
  
  // Delete contact
  static async delete(id) {
    const queries = [
      {
        query: 'DELETE FROM contacts WHERE id = ?',
        params: [id]
      },
      {
        query: 'DELETE FROM contact_group_members WHERE contact_id = ?',
        params: [id]
      }
    ];
    
    await executeTransaction(queries);
  }
  
  // Toggle favorite status
  static async toggleFavorite(id, isFavorite, userId) {
    const queries = [
      {
        query: 'UPDATE contacts SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        params: [isFavorite, id]
      },
      {
        query: `
          INSERT INTO contact_interactions 
            (contact_id, interaction_type, subject, message, created_by)
          VALUES (?, ?, ?, ?, ?)
        `,
        params: [
          id,
          'note',
          isFavorite ? 'Added to favorites' : 'Removed from favorites',
          `Contact ${isFavorite ? 'added to' : 'removed from'} favorites`,
          userId
        ]
      }
    ];
    
    await executeTransaction(queries);
    return await this.getById(id);
  }
  
  // Add interaction
  static async addInteraction(contactId, interactionData) {
    const query = `
      INSERT INTO contact_interactions 
        (contact_id, interaction_type, subject, message, interaction_date, duration_minutes, outcome, next_follow_up, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      contactId,
      interactionData.interaction_type,
      interactionData.subject || '',
      interactionData.message || '',
      interactionData.interaction_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      interactionData.duration_minutes || null,
      interactionData.outcome || '',
      interactionData.next_follow_up || null,
      interactionData.created_by
    ];
    
    await executeQuery(query, params);
    return await this.getById(contactId);
  }
  
  // Get contact interactions
  static async getInteractions(contactId, filters = {}) {
    let query = `
      SELECT 
        ci.*,
        u.username as created_by_name
      FROM contact_interactions ci
      LEFT JOIN users u ON ci.created_by = u.id
      WHERE ci.contact_id = ?
    `;
    
    const params = [contactId];
    
    if (filters.interaction_type) {
      query += ` AND ci.interaction_type = ?`;
      params.push(filters.interaction_type);
    }
    
    if (filters.date_from) {
      query += ` AND ci.interaction_date >= ?`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      query += ` AND ci.interaction_date <= ?`;
      params.push(filters.date_to);
    }
    
    query += ` ORDER BY ci.interaction_date DESC`;
    
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
    }
    
    return await executeQuery(query, params);
  }
  
  // Get contact categories
  static async getCategories() {
    const query = `
      SELECT 
        cc.*,
        COUNT(c.id) as contact_count
      FROM contact_categories cc
      LEFT JOIN contacts c ON cc.id = c.category_id
      WHERE cc.is_active = TRUE
      GROUP BY cc.id
      ORDER BY cc.name
    `;
    
    return await executeQuery(query);
  }
  
  // Create contact category
  static async createCategory(categoryData) {
    const query = `
      INSERT INTO contact_categories 
        (name, description, color, icon, parent_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      categoryData.name,
      categoryData.description || '',
      categoryData.color || '#6B7280',
      categoryData.icon || 'users',
      categoryData.parent_id || null,
      categoryData.created_by
    ];
    
    const result = await executeQuery(query, params);
    return await this.getCategoryById(result.insertId);
  }
  
  // Get category by ID
  static async getCategoryById(id) {
    const query = `
      SELECT 
        cc.*,
        COUNT(c.id) as contact_count
      FROM contact_categories cc
      LEFT JOIN contacts c ON cc.id = c.category_id
      WHERE cc.id = ? AND cc.is_active = TRUE
      GROUP BY cc.id
    `;
    
    const results = await executeQuery(query, [id]);
    return results[0];
  }
  
  // Get favorite contacts
  static async getFavorites() {
    const query = `
      SELECT 
        c.*,
        cc.name as category_name,
        cc.color as category_color,
        cc.icon as category_icon,
        u.username as created_by_name
      FROM contacts c
      LEFT JOIN contact_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.is_active = TRUE AND c.is_favorite = TRUE
      ORDER BY c.last_name, c.first_name
    `;
    
    return await executeQuery(query);
  }
  
  // Search contacts
  static async search(searchTerm, filters = {}) {
    const query = `
      SELECT 
        c.*,
        cc.name as category_name,
        cc.color as category_color,
        cc.icon as category_icon,
        u.username as created_by_name,
        MATCH(c.first_name, c.last_name, c.email, c.company, c.phone) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score
      FROM contacts c
      LEFT JOIN contact_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE MATCH(c.first_name, c.last_name, c.email, c.company, c.phone) AGAINST(? IN NATURAL LANGUAGE MODE)
        AND c.is_active = TRUE
      ORDER BY relevance_score DESC
    `;
    
    return await executeQuery(query, [searchTerm, searchTerm]);
  }
  
  // Get contacts by type
  static async getByType(contactType, filters = {}) {
    let query = `
      SELECT 
        c.*,
        cc.name as category_name,
        cc.color as category_color,
        cc.icon as category_icon,
        u.username as created_by_name
      FROM contacts c
      LEFT JOIN contact_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.contact_type = ? AND c.is_active = TRUE
    `;
    
    const params = [contactType];
    
    if (filters.department) {
      query += ` AND c.department LIKE ?`;
      params.push(`%${filters.department}%`);
    }
    
    query += ` ORDER BY c.last_name, c.first_name`;
    
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
    }
    
    return await executeQuery(query, params);
  }
  
  // Get recent contacts
  static async getRecent(days = 30) {
    const query = `
      SELECT 
        c.*,
        cc.name as category_name,
        cc.color as category_color,
        cc.icon as category_icon,
        u.username as created_by_name
      FROM contacts c
      LEFT JOIN contact_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.is_active = TRUE 
        AND c.created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)
      ORDER BY c.created_at DESC
      LIMIT 50
    `;
    
    return await executeQuery(query, [days]);
  }
  
  // Get contact statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_contacts,
        COUNT(CASE WHEN is_favorite = TRUE THEN 1 END) as favorite_contacts,
        COUNT(CASE WHEN contact_type = 'customer' THEN 1 END) as customer_contacts,
        COUNT(CASE WHEN contact_type = 'supplier' THEN 1 END) as supplier_contacts,
        COUNT(CASE WHEN contact_type = 'employee' THEN 1 END) as employee_contacts,
        COUNT(CASE WHEN contact_type = 'partner' THEN 1 END) as partner_contacts,
        COUNT(CASE WHEN last_contacted IS NOT NULL AND last_contacted >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY) THEN 1 END) as recently_contacted,
        AVG(DATEDIFF(CURRENT_TIMESTAMP, created_at)) as avg_days_since_creation
      FROM contacts
      WHERE 1=1
    `;
    
    const result = await executeQuery(query);
    return result[0];
  }
  
  // Bulk operations
  static async bulkCreate(contactsData) {
    const queries = contactsData.map(contact => ({
      query: `
        INSERT INTO contacts (
          contact_id, first_name, last_name, email, phone, mobile, company,
          job_title, department, address, notes, contact_type, category_id,
          tags, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        contact.contact_id,
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone,
        contact.mobile,
        contact.company,
        contact.job_title,
        contact.department,
        JSON.stringify(contact.address || {}),
        contact.notes || '',
        contact.contact_type || 'other',
        contact.category_id || null,
        JSON.stringify(contact.tags || []),
        contact.is_active !== undefined ? contact.is_active : true,
        contact.created_by
      ]
    }));
    
    await executeTransaction(queries);
  }
  
  static async bulkUpdate(updates) {
    const queries = updates.map(update => ({
      query: `
        UPDATE contacts SET
          first_name = ?, last_name = ?, email = ?, phone = ?, mobile = ?,
          company = ?, job_title = ?, department = ?, address = ?, notes = ?,
          contact_type = ?, category_id = ?, tags = ?, is_active = ?,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
      `,
      params: [
        update.first_name,
        update.last_name,
        update.email,
        update.phone,
        update.mobile,
        update.company,
        update.job_title,
        update.department,
        JSON.stringify(update.address || {}),
        update.notes || '',
        update.contact_type,
        update.category_id,
        JSON.stringify(update.tags || []),
        update.is_active !== undefined ? update.is_active : true,
        update.id
      ]
    }));
    
    await executeTransaction(queries);
  }
  
  // Export contacts
  static async export(filters = {}) {
    const contacts = await this.getAll(filters);
    
    // Transform contacts for export
    const exportData = contacts.map(contact => ({
      contact_id: contact.contact_id,
      full_name: `${contact.first_name} ${contact.last_name}`,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      company: contact.company,
      job_title: contact.job_title,
      department: contact.department,
      contact_type: contact.contact_type,
      category: contact.category_name,
      address: contact.address ? JSON.parse(contact.address) : null,
      tags: contact.tags ? JSON.parse(contact.tags) : [],
      is_active: contact.is_active,
      is_favorite: contact.is_favorite,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
      last_contacted: contact.last_interaction_date,
      interaction_count: contact.interaction_count
    }));
    
    return exportData;
  }
  
  // Import contacts
  static async import(contactsData, userId) {
    const queries = [];
    
    for (const contactData of contactsData) {
      queries.push({
        query: `
          INSERT INTO contacts (
            contact_id, first_name, last_name, email, phone, mobile, company,
            job_title, department, address, notes, contact_type, category_id,
            tags, is_active, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            email = VALUES(email),
            phone = VALUES(phone),
            mobile = VALUES(mobile),
            company = VALUES(company),
            job_title = VALUES(job_title),
            department = VALUES(department),
            address = VALUES(address),
            notes = VALUES(notes),
            contact_type = VALUES(contact_type),
            category_id = VALUES(category_id),
            tags = VALUES(tags),
            is_active = VALUES(is_active),
            updated_at = CURRENT_TIMESTAMP
        `,
        params: [
          contactData.contact_id,
          contactData.first_name,
          contactData.last_name,
          contactData.email,
          contactData.phone,
          contactData.mobile,
          contactData.company,
          contactData.job_title,
          contactData.department,
          JSON.stringify(contactData.address || {}),
          contactData.notes || '',
          contactData.contact_type || 'other',
          contactData.category_id || null,
          JSON.stringify(contactData.tags || []),
          contactData.is_active !== undefined ? contactData.is_active : true,
          userId
        ]
      });
    }
    
    await executeTransaction(queries);
    
    return {
      imported: contactsData.length,
      updated: 0,
      created: contactsData.length
    };
  }
}

module.exports = ContactModel;
