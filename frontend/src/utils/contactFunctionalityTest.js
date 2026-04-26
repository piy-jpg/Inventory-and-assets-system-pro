// Comprehensive Contact Functionality Test
// This file contains tests to verify all customer/contact functions are working

import { customersAPI } from '../services/api';

// Test Data
const testCustomer = {
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '+1-555-0123',
  company_name: 'Test Company',
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip: '12345'
  },
  gst_number: 'TEST123456',
  credit_limit: 10000,
  notes: 'Test customer for functionality verification',
  tags: ['test', 'verification'],
  status: 'active',
  payment_status: 'paid'
};

// Test Functions
export const testContactFunctionality = async () => {
  console.log('=== Testing Contact Functionality ===');
  
  const results = {
    api: {},
    crud: {},
    search: {},
    navigation: {},
    data: {}
  };

  try {
    // Test 1: API Connectivity
    console.log('1. Testing API Connectivity...');
    try {
      const allCustomers = await customersAPI.getAll();
      results.api.getAll = {
        success: true,
        count: allCustomers.data?.data?.customers?.length || 0,
        message: 'API connection successful'
      };
      console.log('   API GetAll: SUCCESS');
    } catch (error) {
      results.api.getAll = {
        success: false,
        error: error.message,
        message: 'API connection failed'
      };
      console.log('   API GetAll: FAILED -', error.message);
    }

    // Test 2: Create Customer
    console.log('2. Testing Create Customer...');
    try {
      const createdCustomer = await customersAPI.create(testCustomer);
      results.crud.create = {
        success: true,
        customerId: createdCustomer.data?.data?._id,
        message: 'Customer creation successful'
      };
      console.log('   Create: SUCCESS - ID:', createdCustomer.data?.data?._id);
      
      // Test 3: Get Customer by ID
      console.log('3. Testing Get Customer by ID...');
      try {
        const retrievedCustomer = await customersAPI.getById(createdCustomer.data?.data?._id);
        results.crud.getById = {
          success: true,
          customerName: retrievedCustomer.data?.data?.customer?.name,
          message: 'Customer retrieval successful'
        };
        console.log('   GetById: SUCCESS - Name:', retrievedCustomer.data?.data?.customer?.name);
      } catch (error) {
        results.crud.getById = {
          success: false,
          error: error.message,
          message: 'Customer retrieval failed'
        };
        console.log('   GetById: FAILED -', error.message);
      }

      // Test 4: Update Customer
      console.log('4. Testing Update Customer...');
      try {
        const updatedData = { ...testCustomer, notes: 'Updated test customer' };
        const updatedCustomer = await customersAPI.update(createdCustomer.data?.data?._id, updatedData);
        results.crud.update = {
          success: true,
          updatedNotes: updatedCustomer.data?.data?.notes,
          message: 'Customer update successful'
        };
        console.log('   Update: SUCCESS - Notes updated');
      } catch (error) {
        results.crud.update = {
          success: false,
          error: error.message,
          message: 'Customer update failed'
        };
        console.log('   Update: FAILED -', error.message);
      }

      // Test 5: Customer Ledger
      console.log('5. Testing Customer Ledger...');
      try {
        const ledgerData = await customersAPI.getLedger(createdCustomer.data?.data?._id);
        results.data.ledger = {
          success: true,
          entriesCount: ledgerData.data?.data?.ledger?.length || 0,
          message: 'Ledger data retrieval successful'
        };
        console.log('   Ledger: SUCCESS - Entries:', ledgerData.data?.data?.ledger?.length);
      } catch (error) {
        results.data.ledger = {
          success: false,
          error: error.message,
          message: 'Ledger data retrieval failed'
        };
        console.log('   Ledger: FAILED -', error.message);
      }

      // Test 6: Sales History
      console.log('6. Testing Sales History...');
      try {
        const salesData = await customersAPI.getSalesHistory(createdCustomer.data?.data?._id);
        results.data.salesHistory = {
          success: true,
          salesCount: salesData.data?.data?.salesHistory?.length || 0,
          message: 'Sales history retrieval successful'
        };
        console.log('   Sales History: SUCCESS - Sales:', salesData.data?.data?.salesHistory?.length);
      } catch (error) {
        results.data.salesHistory = {
          success: false,
          error: error.message,
          message: 'Sales history retrieval failed'
        };
        console.log('   Sales History: FAILED -', error.message);
      }

      // Test 7: Communication Log
      console.log('7. Testing Communication Log...');
      try {
        const commData = await customersAPI.getCommunication(createdCustomer.data?.data?._id);
        results.data.communication = {
          success: true,
          entriesCount: commData.data?.data?.communicationLog?.length || 0,
          message: 'Communication log retrieval successful'
        };
        console.log('   Communication: SUCCESS - Entries:', commData.data?.data?.communicationLog?.length);
      } catch (error) {
        results.data.communication = {
          success: false,
          error: error.message,
          message: 'Communication log retrieval failed'
        };
        console.log('   Communication: FAILED -', error.message);
      }

      // Test 8: Delete Customer (Cleanup)
      console.log('8. Testing Delete Customer...');
      try {
        const deletedCustomer = await customersAPI.delete(createdCustomer.data?.data?._id);
        results.crud.delete = {
          success: true,
          deletedId: createdCustomer.data?.data?._id,
          message: 'Customer deletion successful'
        };
        console.log('   Delete: SUCCESS - ID:', createdCustomer.data?.data?._id);
      } catch (error) {
        results.crud.delete = {
          success: false,
          error: error.message,
          message: 'Customer deletion failed'
        };
        console.log('   Delete: FAILED -', error.message);
      }

    } catch (error) {
      results.crud.create = {
        success: false,
        error: error.message,
        message: 'Customer creation failed - subsequent tests skipped'
      };
      console.log('   Create: FAILED -', error.message);
    }

    // Test 9: Search and Filter
    console.log('9. Testing Search and Filter...');
    try {
      const searchResults = await customersAPI.getAll({ search: 'test' });
      results.search.basic = {
        success: true,
        resultsCount: searchResults.data?.data?.customers?.length || 0,
        message: 'Basic search successful'
      };
      console.log('   Search: SUCCESS - Results:', searchResults.data?.data?.customers?.length);
    } catch (error) {
      results.search.basic = {
        success: false,
        error: error.message,
        message: 'Basic search failed'
      };
      console.log('   Search: FAILED -', error.message);
    }

    // Test 10: Analytics
    console.log('10. Testing Analytics...');
    try {
      const analyticsData = await customersAPI.getAnalytics();
      results.data.analytics = {
        success: true,
        totalCustomers: analyticsData.data?.data?.totalCustomers || 0,
        message: 'Analytics retrieval successful'
      };
      console.log('   Analytics: SUCCESS - Total Customers:', analyticsData.data?.data?.totalCustomers);
    } catch (error) {
      results.data.analytics = {
        success: false,
        error: error.message,
        message: 'Analytics retrieval failed'
      };
      console.log('   Analytics: FAILED -', error.message);
    }

    // Test 11: Tags and Segments
    console.log('11. Testing Tags and Segments...');
    try {
      const tagsData = await customersAPI.getTagsAndSegments();
      results.data.tagsSegments = {
        success: true,
        tagsCount: tagsData.data?.data?.tags?.length || 0,
        segmentsCount: tagsData.data?.data?.segments?.length || 0,
        message: 'Tags and segments retrieval successful'
      };
      console.log('   Tags/Segments: SUCCESS - Tags:', tagsData.data?.data?.tags?.length, 'Segments:', tagsData.data?.data?.segments?.length);
    } catch (error) {
      results.data.tagsSegments = {
        success: false,
        error: error.message,
        message: 'Tags and segments retrieval failed'
      };
      console.log('   Tags/Segments: FAILED -', error.message);
    }

    // Test 12: Import/Export
    console.log('12. Testing Import/Export...');
    try {
      const importExportData = await customersAPI.getImportExport();
      results.data.importExport = {
        success: true,
        hasTemplates: importExportData.data?.data?.templates?.length > 0,
        message: 'Import/Export data retrieval successful'
      };
      console.log('   Import/Export: SUCCESS - Templates:', importExportData.data?.data?.templates?.length);
    } catch (error) {
      results.data.importExport = {
        success: false,
        error: error.message,
        message: 'Import/Export data retrieval failed'
      };
      console.log('   Import/Export: FAILED -', error.message);
    }

  } catch (error) {
    console.error('Test suite failed:', error);
  }

  // Calculate overall success rate
  const totalTests = Object.keys(results).reduce((acc, category) => {
    return acc + Object.keys(results[category]).length;
  }, 0);
  
  const successfulTests = Object.keys(results).reduce((acc, category) => {
    return acc + Object.values(results[category]).filter(test => test.success).length;
  }, 0);
  
  const successRate = Math.round((successfulTests / totalTests) * 100);

  console.log('\n=== Test Results Summary ===');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${successfulTests}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log('\nDetailed Results:', JSON.stringify(results, null, 2));

  return {
    successRate,
    totalTests,
    successfulTests,
    results
  };
};

// Frontend Component Test (for browser console)
export const runFrontendTests = () => {
  console.log('=== Frontend Contact Functionality Test ===');
  
  // Test navigation
  const navigationTests = {
    customerList: window.location.pathname === '/contacts',
    addCustomer: window.location.pathname === '/contacts/create',
    customerLedger: window.location.pathname === '/contacts/ledger',
    salesHistory: window.location.pathname === '/contacts/sales-history',
    duePayments: window.location.pathname === '/contacts/due-payments',
    analytics: window.location.pathname === '/contacts/analytics'
  };

  // Test DOM elements
  const domTests = {
    hasSearchInput: !!document.querySelector('input[placeholder*="Search"]'),
    hasFilterButtons: !!document.querySelector('button[class*="filter"]'),
    hasCustomerTable: !!document.querySelector('table'),
    hasAddButton: !!document.querySelector('button[class*="primary"]'),
    hasNavigation: !!document.querySelector('nav[class*="flex"]')
  };

  // Test data loading
  const dataTests = {
    hasCustomers: !!document.querySelector('[data-testid="customer-list"]'),
    hasMetrics: !!document.querySelector('[data-testid="customer-metrics"]'),
    hasCharts: !!document.querySelector('[data-testid="customer-charts"]')
  };

  console.log('Navigation Tests:', navigationTests);
  console.log('DOM Tests:', domTests);
  console.log('Data Tests:', dataTests);

  return {
    navigation: navigationTests,
    dom: domTests,
    data: dataTests
  };
};

// Export for use in components
export default testContactFunctionality;
