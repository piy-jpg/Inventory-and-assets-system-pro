// Test POS data flow with fixed extraction
import mockData from './src/data/mockData.js';

console.log('Testing POS data flow with fixed extraction...');

// Simulate the exact same API calls
const salesAPI = {
  getAll: async (params = {}) => {
    let items = [...mockData.sales];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter(item => 
        item.customer_name.toLowerCase().includes(searchLower) ||
        item.sale_id.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.status && params.status !== 'all') {
      items = items.filter(item => item.status === params.status);
    }
    
    if (params.startDate && params.endDate) {
      items = items.filter(item => {
        const saleDate = new Date(item.sale_date);
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        return saleDate >= start && saleDate <= end;
      });
    }

    return {
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

// Test the fixed data extraction
async function testFixedPOSDataFlow() {
  console.log('\n=== Testing Fixed POS Data Flow ===');
  
  const search = '';
  const filterStatus = 'all';
  const dateRange = {
    startDate: '2026-03-23',
    endDate: '2026-04-30'
  };
  
  try {
    // Get data from APIs
    const salesData = await salesAPI.getAll({ search, status: filterStatus, startDate: dateRange.startDate, endDate: dateRange.endDate });
    const inventoryData = await inventoryAPI.getAll({ search, limit: 12 });
    const customersData = await customersAPI.getAll();
    
    // Test the FIXED extraction path
    console.log('\n1. Testing FIXED sales data extraction:');
    const sales = salesData?.data?.data?.sales || [];
    console.log('- salesData structure:', JSON.stringify(salesData, null, 2).substring(0, 200) + '...');
    console.log('- extracted sales (FIXED):', sales);
    console.log('- sales count (FIXED):', sales.length);
    
    console.log('\n2. Testing FIXED inventory data extraction:');
    const inventory = inventoryData?.data?.data?.inventory || [];
    console.log('- extracted inventory (FIXED):', inventory);
    console.log('- inventory count (FIXED):', inventory.length);
    
    console.log('\n3. Testing FIXED customers data extraction:');
    const customers = customersData?.data?.data?.customers || [];
    console.log('- extracted customers (FIXED):', customers);
    console.log('- customers count (FIXED):', customers.length);
    
    // Summary
    console.log('\n4. Fixed POS Data Flow Summary:');
    console.log('- Sales:', sales.length, 'records');
    console.log('- Inventory:', inventory.length, 'records');
    console.log('- Customers:', customers.length, 'records');
    
    if (sales.length > 0) {
      console.log('\nSUCCESS: Sales data is now properly extracted!');
      console.log('- First sale:', sales[0]);
      console.log('- Last sale:', sales[sales.length - 1]);
    } else {
      console.log('\nERROR: Still no sales data found after fix.');
    }
    
  } catch (error) {
    console.error('Error in fixed POS data flow:', error);
  }
}

testFixedPOSDataFlow();
