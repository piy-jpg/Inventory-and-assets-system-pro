// Test inventory creation functionality
const axios = require('axios');

console.log('Testing inventory creation functionality...');

const testItem = {
  name: 'Test Laptop Model XYZ',
  description: 'A test laptop for verifying Add Item functionality',
  category: 'Laptops',
  brand: 'TestBrand',
  warranty: '2 Years',
  sku: 'TEST-LAPTOP-001',
  quantity: 25,
  price: {
    cost: 899.99,
    selling: 1199.99
  },
  minStockLevel: 5,
  maxStockLevel: 100,
  unit: 'pieces',
  supplier_id: null,
  location: {
    warehouse: 'Warehouse A',
    aisle: 'A1',
    shelf: 'S1',
    bin: 'B1'
  }
};

const createInventoryItem = async () => {
  try {
    console.log('Creating test inventory item...');
    
    const response = await axios.post('http://localhost:3001/api/inventory', testItem, {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });

    console.log('Inventory item created successfully!');
    console.log('Response:', response.data);
    
    // Verify the item was added by fetching the inventory list
    console.log('Verifying item was added to inventory...');
    const inventoryResponse = await axios.get('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });

    const items = inventoryResponse.data.data.inventory;
    const createdItem = items.find(item => item.sku === testItem.sku);
    
    if (createdItem) {
      console.log('SUCCESS: Test item found in inventory list');
      console.log('Created item:', createdItem);
    } else {
      console.log('ERROR: Test item not found in inventory list');
    }
    
  } catch (error) {
    console.error('Error creating inventory item:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

createInventoryItem();
