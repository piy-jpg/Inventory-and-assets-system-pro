const ContactModel = require('../models/Contact');

class ContactController {
  // Get all contacts
  static async getAllContacts(req, res) {
    try {
      const filters = {
        search: req.query.search,
        contact_type: req.query.contact_type,
        category_id: req.query.category_id ? parseInt(req.query.category_id) : undefined,
        is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
        is_favorite: req.query.is_favorite === 'true' ? true : req.query.is_favorite === 'false' ? false : undefined,
        department: req.query.department,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined,
        sortBy: req.query.sortBy || 'last_name',
        sortOrder: req.query.sortOrder || 'ASC'
      };

      const contacts = await ContactModel.getAll(filters);
      
      res.json({
        success: true,
        data: {
          contacts,
          pagination: {
            total: contacts.length,
            limit: filters.limit || 50,
            offset: filters.offset || 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contacts',
        error: error.message
      });
    }
  }

  // Get contact by ID
  static async getContactById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Contact ID is required'
        });
      }

      const contact = await ContactModel.getById(id);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.json({
        success: true,
        data: { contact }
      });
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contact',
        error: error.message
      });
    }
  }

  // Create new contact
  static async createContact(req, res) {
    try {
      const contactData = {
        ...req.body,
        created_by: req.user.id
      };

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'contact_id'];
      const missingFields = requiredFields.filter(field => !contactData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const contact = await ContactModel.create(contactData);
      
      res.status(201).json({
        success: true,
        message: 'Contact created successfully',
        data: { contact }
      });
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create contact',
        error: error.message
      });
    }
  }

  // Update contact
  static async updateContact(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updated_by: req.user.id
      };

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Contact ID is required'
        });
      }

      const contact = await ContactModel.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Contact updated successfully',
        data: { contact }
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update contact',
        error: error.message
      });
    }
  }

  // Delete contact
  static async deleteContact(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Contact ID is required'
        });
      }

      await ContactModel.delete(id);
      
      res.json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete contact',
        error: error.message
      });
    }
  }

  // Toggle favorite status
  static async toggleFavorite(req, res) {
    try {
      const { id } = req.params;
      const { is_favorite } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Contact ID is required'
        });
      }

      const contact = await ContactModel.toggleFavorite(id, is_favorite, req.user.id);
      
      res.json({
        success: true,
        message: `Contact ${is_favorite ? 'added to' : 'removed from'} favorites`,
        data: { contact }
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle favorite status',
        error: error.message
      });
    }
  }

  // Add interaction
  static async addInteraction(req, res) {
    try {
      const { id } = req.params;
      const interactionData = {
        ...req.body,
        created_by: req.user.id
      };

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Contact ID is required'
        });
      }

      const contact = await ContactModel.addInteraction(id, interactionData);
      
      res.json({
        success: true,
        message: 'Interaction added successfully',
        data: { contact }
      });
    } catch (error) {
      console.error('Error adding interaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add interaction',
        error: error.message
      });
    }
  }

  // Get contact interactions
  static async getInteractions(req, res) {
    try {
      const { id } = req.params;
      const filters = {
        interaction_type: req.query.interaction_type,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      const interactions = await ContactModel.getInteractions(id, filters);
      
      res.json({
        success: true,
        data: { interactions }
      });
    } catch (error) {
      console.error('Error fetching interactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch interactions',
        error: error.message
      });
    }
  }

  // Get contact categories
  static async getCategories(req, res) {
    try {
      const categories = await ContactModel.getCategories();
      
      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  }

  // Create contact category
  static async createCategory(req, res) {
    try {
      const categoryData = {
        ...req.body,
        created_by: req.user.id
      };

      const category = await ContactModel.createCategory(categoryData);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }

  // Search contacts
  static async searchContacts(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const contacts = await ContactModel.search(q, {
        contact_type: req.query.contact_type,
        category_id: req.query.category_id ? parseInt(req.query.category_id) : undefined,
        department: req.query.department
      });
      
      res.json({
        success: true,
        data: { contacts }
      });
    } catch (error) {
      console.error('Error searching contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search contacts',
        error: error.message
      });
    }
  }

  // Get favorite contacts
  static async getFavorites(req, res) {
    try {
      const contacts = await ContactModel.getFavorites();
      
      res.json({
        success: true,
        data: { contacts }
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch favorites',
        error: error.message
      });
    }
  }

  // Get recent contacts
  static async getRecentContacts(req, res) {
    try {
      const { days = 30 } = req.query;
      const contacts = await ContactModel.getRecent(days);
      
      res.json({
        success: true,
        data: { contacts }
      });
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent contacts',
        error: error.message
      });
    }
  }

  // Export contacts
  static async exportContacts(req, res) {
    try {
      const filters = {
        contact_type: req.query.contact_type,
        category_id: req.query.category_id ? parseInt(req.query.category_id) : undefined,
        is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
        department: req.query.department
      };

      const contacts = await ContactModel.export(filters);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
      
      // Create CSV content
      const csvHeader = 'Contact ID,First Name,Last Name,Email,Phone,Mobile,Company,Job Title,Department,Contact Type,Category,Tags,Is Active,Created At\n';
      const csvRows = contacts.map(contact => {
        const address = contact.address ? JSON.parse(contact.address) : {};
        return [
          contact.contact_id,
          `"${contact.first_name || ''}"`,
          `"${contact.last_name || ''}"`,
          `"${contact.email || ''}"`,
          `"${contact.phone || ''}"`,
          `"${contact.mobile || ''}"`,
          `"${contact.company || ''}"`,
          `"${contact.job_title || ''}"`,
          `"${contact.department || ''}"`,
          `"${contact.contact_type || ''}"`,
          `"${contact.category_name || ''}"`,
          `"${contact.tags ? JSON.parse(contact.tags).join(';') : ''}"`,
          `${contact.is_active}`,
          `"${contact.created_at}"`
        ].join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export contacts',
        error: error.message
      });
    }
  }

  // Import contacts
  static async importContacts(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const csvContent = req.file.buffer.toString('utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV format'
        });
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const expectedHeaders = ['contact_id', 'first_name', 'last_name', 'email', 'phone', 'mobile', 'company', 'job_title', 'department', 'address', 'contact_type', 'category_id', 'tags'];
      
      // Validate headers
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required headers: ${missingHeaders.join(', ')}`
        });
      }

      const contactsData = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const contact = {};
        
        headers.forEach((header, i) => {
          if (values[i]) {
            let value = values[i];
            
            // Handle special fields
            if (header === 'address' || header === 'tags') {
              try {
                value = JSON.parse(value);
              } catch (e) {
                value = {};
              }
            }
            
            contact[header] = value;
          }
        });
        
        return {
          ...contact,
          created_by: req.user.id
        };
      });

      const result = await ContactModel.import(contactsData, req.user.id);
      
      res.json({
        success: true,
        message: `Successfully imported ${result.imported} contacts`,
        data: {
          imported: result.imported,
          updated: result.updated,
          created: result.created
        }
      });
    } catch (error) {
      console.error('Error importing contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import contacts',
        error: error.message
      });
    }
  }

  // Get contact statistics
  static async getStatistics(req, res) {
    try {
      const statistics = await ContactModel.getStatistics();
      
      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  // Bulk operations
  static async bulkCreateContacts(req, res) {
    try {
      const { contacts } = req.body;
      
      if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Contacts array is required'
        });
      }

      const result = await ContactModel.bulkCreate(contacts.map(contact => ({
        ...contact,
        created_by: req.user.id
      })));
      
      res.json({
        success: true,
        message: `Successfully created ${result.created} contacts`,
        data: {
          created: result.created,
          updated: result.updated
        }
      });
    } catch (error) {
      console.error('Error bulk creating contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk create contacts',
        error: error.message
      });
    }
  }

  // Bulk update contacts
  static async bulkUpdateContacts(req, res) {
    try {
      const { updates } = req.body;
      
      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
      }

      const result = await ContactModel.bulkUpdate(updates.map(update => ({
        ...update,
        updated_by: req.user.id
      })));
      
      res.json({
        success: true,
        message: `Successfully updated ${result.updated} contacts`,
        data: {
          updated: result.updated
        }
      });
    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update contacts',
        error: error.message
      });
    }
  }
}

module.exports = ContactController;
