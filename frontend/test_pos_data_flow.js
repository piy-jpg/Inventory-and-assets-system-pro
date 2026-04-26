// Test POS data flow simulation
import mockData from './src/data/mockData.js';

console.log('Testing POS data flow simulation...');

// Simulate the exact same API calls that POS component makes
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

const inventoryAPI = {
  getAll: async (params = {}) => {
    const items = [...mockData.inventory];
    return {
      data: {
        success: true,
        data: {
          inventory: items,
          total: items.length,
          page: 1,
          totalPages: 1
        }
      }
    };
  }
};

const customersAPI = {
  getAll: async () => {
    const items = [...mockData.customers];
    return {
      data: {
        success: true,
        data: {
          customers: items,
          total: items.length,
          page: 1,
          totalPages: 1
        }
      }
    };
  }
};

// Simulate the exact same data extraction as POS component
async function testPOSDataFlow() {
  console.log('\n=== Testing POS Data Flow ===');
  
  // Simulate the React Query calls
  const search = '';
  const filterStatus = 'all';
  const dateRange = {
    startDate: '2026-03-23',
    endDate: '2026-04-30'
  };
  
  try {
    // Sales data
    console.log('\n1. Testing sales data extraction:');
    const salesData = await salesAPI.getAll({ search, status: filterStatus, startDate: dateRange.startDate, endDate: dateRange.endDate });
    const sales = salesData?.data?.sales || [];
    console.log('- salesData:', salesData);
    console.log('- extracted sales:', sales);
    console.log('- sales count:', sales.length);
    
    // Inventory data
    console.log('\n2. Testing inventory data extraction:');
    const inventoryData = await inventoryAPI.getAll({ search, limit: 12 });
    const inventory = inventoryData?.data?.inventory || [];
    console.log('- inventoryData exists:', !!inventoryData);
    console.log('- extracted inventory:', inventory);
    console.log('- inventory count:', inventory.length);
    
    // Customers data
    console.log('\n3. Testing customers data extraction:');
    const customersData = await customersAPI.getAll();
    const customers = customersData?.data?.customers || [];
    console.log('- customersData exists:', !!customersData);
    console.log('- extracted customers:', customers);
    console.log('- customers count:', customers.length);
    
    // Summary
    console.log('\n4. POS Data Flow Summary:');
    console.log('- Sales:', sales.length, 'records');
    console.log('- Inventory:', inventory.length, 'records');
    console.log('- Customers:', customers.length, 'records');
    
    if (sales.length === 0) {
      console.log('\nWARNING: No sales data found! This indicates the frontend issue.');
    } else {
      console.log('\nSUCCESS: Sales data is properly flowing through the system.');
    }
    
  } catch (error) {
    console.error('Error in POS data flow:', error);
  }
}

testPOSDataFlow();
