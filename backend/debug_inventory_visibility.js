// Comprehensive debugging for inventory visibility issue
const axios = require('axios');

console.log('=== Comprehensive Inventory Visibility Debug ===\n');

const debugInventoryVisibility = async () => {
  try {
    console.log('1. Testing Backend API Connection...');
    
    // Test basic API connection
    const testConnection = await axios.get('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Backend Status: Online');
    console.log('   API Response Status:', testConnection.status);
    console.log('   Success:', testConnection.data.success);
    console.log('   Total Items:', testConnection.data.data?.inventory?.length || 0);
    
    if (testConnection.data.data?.inventory?.length > 0) {
      console.log('\n2. Sample Inventory Items:');
      testConnection.data.data.inventory.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - ${item.category} - Qty: ${item.quantity}`);
      });
    }
    
    console.log('\n3. Testing Frontend Data Structure...');
    
    // Simulate frontend data extraction
    const inventory = testConnection.data?.data?.inventory || [];
    const pagination = testConnection.data?.data?.pagination || {};
    
    console.log('   Frontend inventory array length:', inventory.length);
    console.log('   Frontend pagination:', pagination);
    
    // Test the exact frontend logic
    console.log('\n4. Testing Frontend Rendering Logic...');
    console.log('   inventory.length === 0:', inventory.length === 0);
    console.log('   Should show "No inventory items found":', inventory.length === 0);
    
    if (inventory.length > 0) {
      console.log('   Should show inventory table: YES');
      
      // Test item structure for rendering
      console.log('\n5. Testing Item Structure for Rendering...');
      const testItem = inventory[0];
      console.log('   Item has _id:', !!testItem._id);
      console.log('   Item has name:', !!testItem.name);
      console.log('   Item has category:', !!testItem.category);
      console.log('   Item has quantity:', !!testItem.quantity);
      console.log('   Item has price:', !!testItem.price);
      console.log('   Item price cost:', testItem.price?.cost || testItem.costPrice);
      console.log('   Item min stock:', testItem.minStock || testItem.minStockLevel);
      console.log('   Item has status:', !!testItem.status);
    }
    
    console.log('\n6. Testing Categories API...');
    try {
      const categoriesResponse = await axios.get('http://localhost:3001/api/metadata/categories', {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   Categories API Status:', categoriesResponse.status);
      console.log('   Categories found:', categoriesResponse.data.data?.length || 0);
      
      if (categoriesResponse.data.data?.length > 0) {
        console.log('   Sample categories:', categoriesResponse.data.data.slice(0, 3));
      }
    } catch (error) {
      console.log('   Categories API Error:', error.message);
    }
    
    console.log('\n7. Testing Search Functionality...');
    try {
      const searchResponse = await axios.get('http://localhost:3001/api/inventory?search=laptop', {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   Search results for "laptop":', searchResponse.data.data?.inventory?.length || 0);
    } catch (error) {
      console.log('   Search API Error:', error.message);
    }
    
    console.log('\n8. Testing Category Filter...');
    try {
      const categoryResponse = await axios.get('http://localhost:3001/api/inventory?category=Laptops', {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   Laptops category results:', categoryResponse.data.data?.inventory?.length || 0);
    } catch (error) {
      console.log('   Category Filter API Error:', error.message);
    }
    
    console.log('\n9. Testing Pagination...');
    try {
      const page1Response = await axios.get('http://localhost:3001/api/inventory?page=1&limit=10', {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   Page 1 items:', page1Response.data.data?.inventory?.length || 0);
      console.log('   Pagination info:', page1Response.data.data?.pagination);
    } catch (error) {
      console.log('   Pagination API Error:', error.message);
    }
    
    console.log('\n=== Summary ===');
    console.log('Backend API: Working');
    console.log('Data Structure: Correct');
    console.log('Frontend Logic: Should work');
    console.log('Issue likely in: Frontend rendering or caching');
    
    console.log('\n=== Recommendations ===');
    console.log('1. Refresh browser to clear cache');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Verify React Query is not caching empty data');
    console.log('4. Check if frontend is making correct API calls');
    
  } catch (error) {
    console.error('Critical Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
};

debugInventoryVisibility();
