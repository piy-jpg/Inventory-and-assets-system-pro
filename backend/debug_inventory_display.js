// Debug inventory display issue
const axios = require('axios');

console.log('Debugging inventory display issue...');

const debugInventoryAPI = async () => {
  try {
    console.log('\n1. Testing inventory API endpoint...');
    
    const response = await axios.get('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      const inventory = response.data.data.inventory || response.data.data;
      console.log(`\nTotal items in API response: ${inventory.length}`);
      
      if (inventory.length > 0) {
        console.log('\nFirst few items:');
        inventory.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name} - ${item.category} - Stock: ${item.quantity}`);
        });
      } else {
        console.log('No items found in API response!');
      }
    } else {
      console.log('API response structure is unexpected');
    }
    
    // Test with different query parameters
    console.log('\n2. Testing with pagination...');
    const paginatedResponse = await axios.get('http://localhost:3001/api/inventory?page=1&limit=10', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Paginated response items:', paginatedResponse.data.data?.inventory?.length || 0);
    
    // Test search functionality
    console.log('\n3. Testing search functionality...');
    const searchResponse = await axios.get('http://localhost:3001/api/inventory?search=laptop', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Search results for "laptop":', searchResponse.data.data?.inventory?.length || 0);
    
    // Test category filter
    console.log('\n4. Testing category filter...');
    const categoryResponse = await axios.get('http://localhost:3001/api/inventory?category=Laptops', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Laptops category results:', categoryResponse.data.data?.inventory?.length || 0);
    
  } catch (error) {
    console.error('Error debugging inventory API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

debugInventoryAPI();
