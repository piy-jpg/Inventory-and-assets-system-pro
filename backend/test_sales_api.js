// Test sales API directly
const { mockSales } = require('../frontend/src/data/mockData.js');

console.log('Testing sales data directly from mockData...');

console.log('\n1. Checking mockSales export:');
console.log('- mockSales exists:', !!mockSales);
console.log('- mockSales is array:', Array.isArray(mockSales));
console.log('- mockSales length:', mockSales?.length || 0);

if (mockSales && mockSales.length > 0) {
  console.log('\n2. First few sales records:');
  mockSales.slice(0, 3).forEach((sale, index) => {
    console.log(`\nSale ${index + 1}:`);
    console.log('- ID:', sale._id);
    console.log('- Customer:', sale.customer_name);
    console.log('- Date:', sale.sale_date);
    console.log('- Amount:', sale.total_amount);
    console.log('- Status:', sale.status);
  });

  console.log('\n3. Date range analysis:');
  const dates = mockSales.map(sale => new Date(sale.sale_date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  console.log('- Earliest sale:', minDate.toISOString().split('T')[0]);
  console.log('- Latest sale:', maxDate.toISOString().split('T')[0]);

  console.log('\n4. Testing date filtering (March 23, 2026 to April 30, 2026):');
  const startDate = '2026-03-23';
  const endDate = '2026-04-30';
  
  const filteredSales = mockSales.filter(item => {
    const saleDate = new Date(item.sale_date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return saleDate >= start && saleDate <= end;
  });
  
  console.log('- Sales in date range:', filteredSales.length);
  console.log('- Filtered sales IDs:', filteredSales.map(s => s.sale_id));
} else {
  console.log('\nERROR: No sales data found in mockSales export');
}

// Also test the API structure
console.log('\n5. Testing API structure simulation:');
const mockData = require('../frontend/src/data/mockData.js');
console.log('- mockData exists:', !!mockData);
console.log('- mockData.sales exists:', !!mockData?.sales);
console.log('- mockData.sales length:', mockData?.sales?.length || 0);
