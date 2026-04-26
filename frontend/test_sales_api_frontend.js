// Test sales API in frontend context
import mockData from './src/data/mockData.js';

console.log('Testing sales API in frontend context...');

// Simulate the sales API getAll function
const salesAPI = {
  getAll: async (params = {}) => {
    console.log('Sales API called with params:', params);
    let items = [...mockData.sales];
    console.log('Total sales data available:', items.length);
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter(item => 
        item.customer_name.toLowerCase().includes(searchLower) ||
        item.sale_id.toLowerCase().includes(searchLower)
      );
      console.log('After search filter:', items.length);
    }
    
    if (params.status && params.status !== 'all') {
      items = items.filter(item => item.status === params.status);
      console.log('After status filter:', items.length);
    }
    
    if (params.startDate && params.endDate) {
      items = items.filter(item => {
        const saleDate = new Date(item.sale_date);
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        return saleDate >= start && saleDate <= end;
      });
      console.log('After date filter:', items.length);
    }

    const result = {
      data: {
        success: true,
        data: {
          sales: items,
          total: items.length,
          page: 1,
          totalPages: 1
        }
      }
    };
    console.log('Sales API returning:', result);
    return result;
  }
};

// Test the API with typical POS parameters
async function testSalesAPI() {
  console.log('\n=== Testing Sales API ===');
  
  // Test 1: Get all sales
  console.log('\n1. Testing getAll sales:');
  const allSales = await salesAPI.getAll();
  console.log('- All sales count:', allSales.data.data.sales.length);
  
  // Test 2: Test with date range (March 23, 2026 to April 30, 2026)
  console.log('\n2. Testing with date range:');
  const dateRangeSales = await salesAPI.getAll({
    startDate: '2026-03-23',
    endDate: '2026-04-30'
  });
  console.log('- Date range sales count:', dateRangeSales.data.data.sales.length);
  console.log('- Date range sales IDs:', dateRangeSales.data.data.sales.map(s => s.sale_id));
  
  // Test 3: Test with search
  console.log('\n3. Testing with search:');
  const searchSales = await salesAPI.getAll({
    search: 'ABC'
  });
  console.log('- Search sales count:', searchSales.data.data.sales.length);
  console.log('- Search sales customers:', searchSales.data.data.sales.map(s => s.customer_name));
  
  // Test 4: Test with status filter
  console.log('\n4. Testing with status filter:');
  const statusSales = await salesAPI.getAll({
    status: 'completed'
  });
  console.log('- Status sales count:', statusSales.data.data.sales.length);
  console.log('- Status sales statuses:', statusSales.data.data.sales.map(s => s.status));
}

testSalesAPI().catch(console.error);
