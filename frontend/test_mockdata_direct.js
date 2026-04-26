// Test mockData object directly
import mockData from './src/data/mockData.js';

console.log('Testing mockData object directly...');

console.log('\n1. mockData object:');
console.log('- mockData exists:', !!mockData);
console.log('- mockData type:', typeof mockData);

if (mockData) {
  console.log('- mockData keys:', Object.keys(mockData));
  console.log('- sales in keys:', Object.keys(mockData).includes('sales'));
  console.log('- mockData.sales:', mockData.sales);
  console.log('- mockData.sales type:', typeof mockData.sales);
  console.log('- mockData.sales length:', mockData.sales?.length || 0);
  
  // Check if sales is accessible through different methods
  console.log('\n2. Alternative access methods:');
  console.log('- mockData["sales"]:', mockData["sales"]);
  console.log('- mockData.hasOwnProperty("sales"):', mockData.hasOwnProperty("sales"));
  console.log('- "sales" in mockData:', "sales" in mockData);
  
  // Check the actual structure
  console.log('\n3. Full object structure:');
  console.log('- Number of properties:', Object.keys(mockData).length);
  Object.keys(mockData).forEach(key => {
    console.log(`- ${key}:`, Array.isArray(mockData[key]) ? `Array(${mockData[key].length})` : typeof mockData[key]);
  });
}
