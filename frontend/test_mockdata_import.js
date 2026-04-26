// Test mockData import in frontend context
import mockData from './data/mockData.js';

console.log('Testing mockData import in frontend context...');

console.log('\n1. mockData import:');
console.log('- mockData exists:', !!mockData);
console.log('- mockData type:', typeof mockData);

if (mockData) {
  console.log('- mockData keys:', Object.keys(mockData));
  console.log('- sales exists in mockData:', 'sales' in mockData);
  console.log('- mockData.sales type:', typeof mockData.sales);
  console.log('- mockData.sales length:', mockData.sales?.length || 0);
  
  if (mockData.sales && mockData.sales.length > 0) {
    console.log('- First sale:', mockData.sales[0]);
    console.log('- Last sale:', mockData.sales[mockData.sales.length - 1]);
  }
}
