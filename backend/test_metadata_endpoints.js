// Test updated metadata API endpoints
const axios = require('axios');

console.log('Testing updated metadata API endpoints...');

const testMetadataEndpoints = async () => {
  try {
    // Test categories
    console.log('\n1. Testing Categories endpoint...');
    const categoriesResponse = await axios.get('http://localhost:3001/api/metadata/categories', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Categories:', categoriesResponse.data.data);

    // Test brands
    console.log('\n2. Testing Brands endpoint...');
    const brandsResponse = await axios.get('http://localhost:3001/api/metadata/brands', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Brands:', brandsResponse.data.data);

    // Test units
    console.log('\n3. Testing Units endpoint...');
    const unitsResponse = await axios.get('http://localhost:3001/api/metadata/units', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Units:', unitsResponse.data.data);

    // Test suppliers
    console.log('\n4. Testing Suppliers endpoint...');
    const suppliersResponse = await axios.get('http://localhost:3001/api/metadata/suppliers', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Suppliers:', suppliersResponse.data.data);

    // Test warranties
    console.log('\n5. Testing Warranties endpoint...');
    const warrantiesResponse = await axios.get('http://localhost:3001/api/metadata/warranties', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Warranties:', warrantiesResponse.data.data);

    console.log('\nAll metadata endpoints are working successfully!');
    
  } catch (error) {
    console.error('Error testing metadata endpoints:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testMetadataEndpoints();
