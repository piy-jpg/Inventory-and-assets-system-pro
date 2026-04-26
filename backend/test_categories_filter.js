// Test categories filter functionality
const axios = require('axios');

console.log('Testing categories filter functionality...');

const testCategoriesFilter = async () => {
  try {
    // Test categories endpoint
    console.log('\n1. Testing Categories endpoint...');
    const categoriesResponse = await axios.get('http://localhost:3001/api/metadata/categories', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Categories available:', categoriesResponse.data.data);

    // Test filtering by category
    console.log('\n2. Testing inventory filter by category...');
    const inventoryResponse = await axios.get('http://localhost:3001/api/inventory?category=Laptops', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    const filteredItems = inventoryResponse.data.data.inventory;
    console.log(`Found ${filteredItems.length} items in Laptops category`);
    
    // Verify all items are in the correct category
    const allCorrectCategory = filteredItems.every(item => item.category === 'Laptops');
    console.log('All items in correct category:', allCorrectCategory);

    // Test filtering by different category
    console.log('\n3. Testing filter by Monitors category...');
    const monitorsResponse = await axios.get('http://localhost:3001/api/inventory?category=Monitors', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    const monitorItems = monitorsResponse.data.data.inventory;
    console.log(`Found ${monitorItems.length} items in Monitors category`);
    
    const allMonitors = monitorItems.every(item => item.category === 'Monitors');
    console.log('All items are monitors:', allMonitors);

    console.log('\nCategories filter functionality test completed successfully!');
    
  } catch (error) {
    console.error('Error testing categories filter:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testCategoriesFilter();
