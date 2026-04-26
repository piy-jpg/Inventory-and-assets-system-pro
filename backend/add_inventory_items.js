// Add 10 new inventory items to the database
const axios = require('axios');

console.log('Adding 10 new inventory items to the database...');

const newInventoryItems = [
  {
    name: 'Gaming Laptop Pro X1',
    description: 'High-performance gaming laptop with RTX 4080 graphics',
    category: 'Laptops',
    brand: 'ASUS',
    warranty: '2 Years',
    sku: 'LAP-GAME-001',
    quantity: 15,
    price: {
      cost: 1899.99,
      selling: 2499.99
    },
    minStockLevel: 5,
    maxStockLevel: 50,
    unit: 'pieces',
    supplier_id: 'ASUS Inc.',
    location: {
      warehouse: 'Warehouse A',
      aisle: 'A2',
      shelf: 'S3',
      bin: 'B1'
    }
  },
  {
    name: 'Wireless Ergonomic Keyboard',
    description: 'Ergonomic wireless keyboard with backlit keys',
    category: 'Keyboards',
    brand: 'Logitech',
    warranty: '3 Years',
    sku: 'KEY-ERGO-001',
    quantity: 45,
    price: {
      cost: 79.99,
      selling: 119.99
    },
    minStockLevel: 10,
    maxStockLevel: 100,
    unit: 'pieces',
    supplier_id: 'Logitech Inc.',
    location: {
      warehouse: 'Warehouse B',
      aisle: 'B1',
      shelf: 'S2',
      bin: 'B3'
    }
  },
  {
    name: '4K Ultra HD Monitor 32"',
    description: '32-inch 4K monitor with HDR support',
    category: 'Monitors',
    brand: 'Samsung',
    warranty: '3 Years',
    sku: 'MON-4K-001',
    quantity: 8,
    price: {
      cost: 599.99,
      selling: 899.99
    },
    minStockLevel: 3,
    maxStockLevel: 25,
    unit: 'pieces',
    supplier_id: 'Samsung Electronics',
    location: {
      warehouse: 'Warehouse A',
      aisle: 'A3',
      shelf: 'S1',
      bin: 'B2'
    }
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'High-precision wireless gaming mouse with RGB lighting',
    category: 'Mice',
    brand: 'Razer',
    warranty: '2 Years',
    sku: 'MOUSE-GAME-001',
    quantity: 62,
    price: {
      cost: 49.99,
      selling: 79.99
    },
    minStockLevel: 15,
    maxStockLevel: 150,
    unit: 'pieces',
    supplier_id: 'Razer Inc.',
    location: {
      warehouse: 'Warehouse B',
      aisle: 'B2',
      shelf: 'S4',
      bin: 'B1'
    }
  },
  {
    name: 'Enterprise Network Switch 24-Port',
    description: '24-port gigabit network switch with management features',
    category: 'Networking',
    brand: 'Cisco',
    warranty: '5 Years',
    sku: 'SW-NET-001',
    quantity: 12,
    price: {
      cost: 449.99,
      selling: 699.99
    },
    minStockLevel: 2,
    maxStockLevel: 20,
    unit: 'pieces',
    supplier_id: 'Cisco Systems',
    location: {
      warehouse: 'Warehouse C',
      aisle: 'C1',
      shelf: 'S1',
      bin: 'B3'
    }
  },
  {
    name: 'External SSD 2TB USB-C',
    description: 'Portable 2TB SSD with USB-C connectivity',
    category: 'Storage',
    brand: 'Western Digital',
    warranty: '3 Years',
    sku: 'SSD-2TB-001',
    quantity: 38,
    price: {
      cost: 149.99,
      selling: 229.99
    },
    minStockLevel: 8,
    maxStockLevel: 80,
    unit: 'pieces',
    supplier_id: 'Western Digital',
    location: {
      warehouse: 'Warehouse B',
      aisle: 'B3',
      shelf: 'S2',
      bin: 'B2'
    }
  },
  {
    name: 'HD Webcam 1080p',
    description: 'Professional 1080p webcam with auto-focus',
    category: 'Webcams',
    brand: 'Logitech',
    warranty: '2 Years',
    sku: 'CAM-HD-001',
    quantity: 55,
    price: {
      cost: 69.99,
      selling: 99.99
    },
    minStockLevel: 12,
    maxStockLevel: 120,
    unit: 'pieces',
    supplier_id: 'Logitech Inc.',
    location: {
      warehouse: 'Warehouse A',
      aisle: 'A4',
      shelf: 'S3',
      bin: 'B1'
    }
  },
  {
    name: 'Laptop Cooling Stand',
    description: 'Adjustable laptop cooling stand with built-in fans',
    category: 'Accessories',
    brand: 'Cooler Master',
    warranty: '1 Year',
    sku: 'STAND-COOL-001',
    quantity: 73,
    price: {
      cost: 24.99,
      selling: 39.99
    },
    minStockLevel: 20,
    maxStockLevel: 200,
    unit: 'pieces',
    supplier_id: 'Cooler Master',
    location: {
      warehouse: 'Warehouse C',
      aisle: 'C2',
      shelf: 'S1',
      bin: 'B4'
    }
  },
  {
    name: 'Tablet Pro 12.9"',
    description: 'Professional tablet with stylus support',
    category: 'Tablets',
    brand: 'Apple',
    warranty: '1 Year',
    sku: 'TAB-PRO-001',
    quantity: 18,
    price: {
      cost: 899.99,
      selling: 1299.99
    },
    minStockLevel: 5,
    maxStockLevel: 40,
    unit: 'pieces',
    supplier_id: 'Apple Inc.',
    location: {
      warehouse: 'Warehouse A',
      aisle: 'A1',
      shelf: 'S2',
      bin: 'B3'
    }
  },
  {
    name: 'Laser Printer All-in-One',
    description: 'Multifunction laser printer with scanning and copying',
    category: 'Printers',
    brand: 'HP',
    warranty: '2 Years',
    sku: 'PRINT-LASER-001',
    quantity: 9,
    price: {
      cost: 299.99,
      selling: 449.99
    },
    minStockLevel: 3,
    maxStockLevel: 30,
    unit: 'pieces',
    supplier_id: 'HP Inc.',
    location: {
      warehouse: 'Warehouse C',
      aisle: 'C3',
      shelf: 'S2',
      bin: 'B1'
    }
  }
];

const addInventoryItems = async () => {
  try {
    console.log(`\nAdding ${newInventoryItems.length} new inventory items...\n`);
    
    for (let i = 0; i < newInventoryItems.length; i++) {
      const item = newInventoryItems[i];
      
      console.log(`Adding item ${i + 1}/${newInventoryItems.length}: ${item.name}`);
      
      try {
        const response = await axios.post('http://localhost:3001/api/inventory', item, {
          headers: {
            'Authorization': 'Bearer demo-token',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          console.log(`  SUCCESS: ${item.name} added (ID: ${response.data.data.inventory._id})`);
        } else {
          console.log(`  FAILED: ${response.data.message}`);
        }
        
        // Small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`  ERROR: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\nVerifying items were added...');
    
    // Get updated inventory count
    const inventoryResponse = await axios.get('http://localhost:3001/api/inventory', {
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json'
      }
    });
    
    const totalItems = inventoryResponse.data.data.inventory.length;
    console.log(`Total inventory items now: ${totalItems}`);
    
    // Show categories distribution
    const categories = {};
    inventoryResponse.data.data.inventory.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    
    console.log('\nItems by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} items`);
    });
    
    console.log('\nInventory items addition completed successfully!');
    
  } catch (error) {
    console.error('Error adding inventory items:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

addInventoryItems();
