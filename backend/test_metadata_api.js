// Test metadata API for dropdown data
const axios = require('axios');

console.log('Testing metadata API for dropdown data...');

const testMetadataAPI = async () => {
  try {
    // Test categories
    console.log('\n1. Testing Categories API...');
    const categoriesResponse = await axios.get('http://localhost:3001/api/inventory/categories', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Categories:', categoriesResponse.data);

    // Test brands (extracted from inventory items)
    console.log('\n2. Testing Brands (from inventory)...');
    const inventoryResponse = await axios.get('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    const brands = [...new Set(inventoryResponse.data.data.inventory.map(item => item.brand))];
    console.log('Brands:', brands);

    // Test suppliers (extracted from inventory items)
    console.log('\n3. Testing Suppliers (from inventory)...');
    const suppliers = [...new Set(inventoryResponse.data.data.inventory.map(item => item.supplier))];
    console.log('Suppliers:', suppliers);

    console.log('\nMetadata API test completed successfully!');
    
  } catch (error) {
    console.error('Error testing metadata API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testMetadataAPI();
