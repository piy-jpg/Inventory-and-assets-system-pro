// Test frontend API response structure
const axios = require('axios');

console.log('=== Testing Frontend API Response Structure ===\n');

const testFrontendAPI = async () => {
  try {
    console.log('1. Testing frontend API call structure...');
    
    // Test the exact API call the frontend makes
    const response = await axios.get('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers['content-type']);
    console.log('Response Structure:');
    console.log('- response.data:', !!response.data);
    console.log('- response.data.success:', response.data.success);
    console.log('- response.data.data:', !!response.data.data);
    console.log('- response.data.data.inventory:', !!response.data.data?.inventory);
    console.log('- response.data.data.inventory.length:', response.data.data?.inventory?.length || 0);
    
    console.log('\n2. Full Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n3. Frontend Expected Structure:');
    console.log('inventoryData?.data?.inventory should be:', response.data?.data?.inventory?.length || 0, 'items');
    console.log('inventoryData?.data?.pagination should be:', !!response.data?.data?.pagination);
    
    console.log('\n4. Testing with fetch (like frontend does)...');
    const fetchResponse = await fetch('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json();
      console.log('Fetch Response Structure:');
      console.log('- fetchData.data.inventory.length:', fetchData?.data?.inventory?.length || 0);
      console.log('- Fetch matches Axios:', JSON.stringify(fetchData) === JSON.stringify(response.data));
    } else {
      console.log('Fetch failed:', fetchResponse.status);
    }
    
  } catch (error) {
    console.error('Error testing frontend API:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
};

testFrontendAPI();
