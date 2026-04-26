// Test frontend data flow from API
const axios = require('axios');

console.log('Testing frontend data flow...');

const testFrontendDataFlow = async () => {
  try {
    console.log('\n1. Testing exact API call that frontend makes...');
    
    // Simulate the exact API call the frontend makes
    const response = await axios.get('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response structure check:');
    console.log('- Response has data:', !!response.data);
    console.log('- Response has success:', response.data.success);
    console.log('- Response has data.data:', !!response.data.data);
    console.log('- Response has data.data.inventory:', !!response.data.data?.inventory);
    
    const inventory = response.data?.data?.inventory || [];
    const pagination = response.data?.data?.pagination || {};
    
    console.log('\n2. Frontend data extraction simulation:');
    console.log('- Inventory array length:', inventory.length);
    console.log('- Pagination object:', pagination);
    
    if (inventory.length > 0) {
      console.log('\n3. Testing item structure compatibility...');
      
      // Test first few items for structure compatibility
      const testItems = inventory.slice(0, 3);
      testItems.forEach((item, index) => {
        console.log(`\nItem ${index + 1}: ${item.name}`);
        console.log('- Has _id:', !!item._id);
        console.log('- Has name:', !!item.name);
        console.log('- Has category:', !!item.category);
        console.log('- Has quantity:', !!item.quantity);
        console.log('- Price structure:');
        console.log('  - item.price?.cost:', item.price?.cost);
        console.log('  - item.costPrice:', item.costPrice);
        console.log('- Min stock structure:');
        console.log('  - item.minStock:', item.minStock);
        console.log('  - item.minStockLevel:', item.minStockLevel);
        console.log('- Has status:', !!item.status);
        
        // Test the exact frontend logic
        const price = item.price?.cost || item.costPrice || 0;
        const minStock = item.minStock || item.minStockLevel;
        const lowStock = item.quantity <= minStock;
        
        console.log('- Frontend price calculation:', price);
        console.log('- Frontend min stock calculation:', minStock);
        console.log('- Frontend low stock check:', lowStock);
      });
    }
    
    console.log('\n4. Testing empty state condition...');
    console.log('Frontend will show "No inventory items found":', inventory.length === 0);
    
    if (inventory.length === 0) {
      console.log('ISSUE FOUND: Frontend thinks inventory is empty!');
      console.log('Debugging inventory array:');
      console.log('- Type:', typeof inventory);
      console.log('- Is array:', Array.isArray(inventory));
      console.log('- Length:', inventory.length);
      console.log('- Stringified:', JSON.stringify(inventory));
    }
    
  } catch (error) {
    console.error('Error testing frontend data flow:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testFrontendDataFlow();
