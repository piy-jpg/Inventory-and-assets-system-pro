import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  BuildingOffice2Icon,
  CubeIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  QrCodeIcon,
  SparklesIcon,
  Squares2X2Icon,
  TagIcon,
  TrashIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import {
  inventoryAPI,
  metadataAPI,
  suppliersAPI,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductSectionNav from '../components/ProductSectionNav';
import useRealTimeInventory from '../hooks/useRealTimeInventory';

const VARIATIONS_KEY = 'smart_inventory_product_variations';
const PRICE_GROUPS_KEY = 'smart_inventory_price_groups';

const readStorage = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const parseCsv = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || '';
      return acc;
    }, {});
  });
};

const toolsMeta = {
  'update-price': {
    title: 'Update Price',
    subtitle: 'Bulk and single-product price management',
    icon: TagIcon,
  },
  labels: {
    title: 'Print Labels',
    subtitle: 'Generate label previews for selected products',
    icon: PrinterIcon,
  },
  variations: {
    title: 'Variations',
    subtitle: 'Manage product variants and price deltas',
    icon: Squares2X2Icon,
  },
  import: {
    title: 'Import Products',
    subtitle: 'Paste CSV rows and create inventory items in bulk',
    icon: ArrowUpTrayIcon,
  },
  'import-stock': {
    title: 'Import Opening Stock',
    subtitle: 'Bulk stock adjustments from CSV rows',
    icon: ArrowPathIcon,
  },
  'price-groups': {
    title: 'Selling Price Group',
    subtitle: 'Create markup-based selling price groups',
    icon: SparklesIcon,
  },
};

const SectionCard = ({ title, subtitle, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
    {children}
  </div>
);

const ProductTools = ({ section }) => {
  const queryClient = useQueryClient();
  const [priceForm, setPriceForm] = useState({
    category: '',
    costMultiplier: 1,
    sellingMultiplier: 1,
  });
  const [variationForm, setVariationForm] = useState({
    productId: '',
    productName: '',
    variationName: '',
    skuSuffix: '',
    priceDelta: '',
    status: 'active',
  });
  const [priceGroupForm, setPriceGroupForm] = useState({
    name: '',
    description: '',
    discountPercent: '',
    categories: '',
  });

  const [variations, setVariations] = useState(() => readStorage(VARIATIONS_KEY));
  const [priceGroups, setPriceGroups] = useState(() => readStorage(PRICE_GROUPS_KEY));
  const [csvText, setCsvText] = useState('');
  const [stockCsvText, setStockCsvText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const { isConnected, realTimeUpdates } = useRealTimeInventory();

  const { data: inventoryData, isLoading } = useQuery(
    ['product-tools-inventory'],
    () => inventoryAPI.getAll({ limit: 200, sortBy: 'name', sortOrder: 'asc' })
  );
  const { data: categoriesData } = useQuery('product-tool-categories', metadataAPI.getCategories);
  const { data: suppliersData } = useQuery('product-tool-suppliers', () => suppliersAPI.getAll({ limit: 200 }));
  const { data: unitsData } = useQuery('product-tool-units', metadataAPI.getUnits);

  const inventory = inventoryData?.data?.data?.inventory || inventoryData?.data?.inventory || [];
  const categories = categoriesData?.data?.data?.categories || categoriesData?.data?.categories || [];
  const suppliers = suppliersData?.data?.data?.suppliers || suppliersData?.data?.suppliers || [];
  const units = unitsData?.data?.data?.units || unitsData?.data?.data || unitsData?.data?.units || unitsData?.data || [];

  const selectedProducts = inventory.filter((item) => selectedIds.includes(item._id));

  // Generate barcodes for selected products
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      selectedProducts.forEach((item) => {
        const canvas = document.getElementById(`barcode-${item._id}`);
        if (canvas) {
          try {
            JsBarcode(canvas, item.sku || item._id, {
              format: 'CODE128',
              width: 1.5,
              height: 40,
              displayValue: false,
              margin: 5,
            });
          } catch (error) {
            console.error('Barcode generation error:', error);
          }
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedProducts]);

  // Real-time updates for variations
  useEffect(() => {
    if (realTimeUpdates.length > 0) {
      console.log('Real-time updates detected in ProductTools:', realTimeUpdates.length);
      // Refresh inventory data when real-time updates occur
      queryClient.invalidateQueries('product-tools-inventory');
    }
  }, [realTimeUpdates, queryClient]);

  // Debug: Log product data
  console.log('Product Tools - Inventory Data:', inventoryData);
  console.log('Product Tools - Inventory Items:', inventory);
  console.log('Product Tools - Categories:', categories);
  console.log('Product Tools - Suppliers:', suppliers);
  console.log('Product Tools - Units:', units);
  
  // Extract unique categories from inventory if categories API is empty
  const uniqueCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    
    const categorySet = new Set();
    inventory.forEach(item => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });
    
    return Array.from(categorySet).map((name, index) => ({
      _id: `cat_${index}`,
      name: name
    }));
  }, [categories, inventory]);
  
  console.log('Product Tools - Unique Categories from Inventory:', uniqueCategories);

  const updateMutation = useMutation(({ id, data }) => inventoryAPI.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('product-tools-inventory');
      queryClient.invalidateQueries('inventory');
      toast.success('Product prices updated successfully');
    },
    onError: (error) => {
      console.error('Price update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update prices');
    },
  });

  const adjustMutation = useMutation(({ id, data }) => inventoryAPI.adjustStock(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('product-tools-inventory');
      queryClient.invalidateQueries('inventory');
    },
  });

  const createProductMutation = useMutation((payload) => inventoryAPI.create(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries('product-tools-inventory');
      queryClient.invalidateQueries('inventory');
    },
  });

  const importPreview = useMemo(() => parseCsv(csvText), [csvText]);
  const stockPreview = useMemo(() => parseCsv(stockCsvText), [stockCsvText]);

  const applyBulkPriceUpdate = async () => {
    // Validation
    if (!priceForm.costMultiplier && !priceForm.sellingMultiplier) {
      toast.error('Please enter at least one multiplier value.');
      return;
    }

    if (priceForm.costMultiplier <= 0 || priceForm.sellingMultiplier <= 0) {
      toast.error('Multipliers must be greater than 0.');
      return;
    }

    const targets = inventory.filter((item) => !priceForm.category || item.category === priceForm.category);
    if (!targets.length) {
      toast.error('No products matched this price update.');
      return;
    }

    try {
      toast.loading(`Updating prices for ${targets.length} products...`);
      
      await Promise.all(
        targets.map((item) =>
          updateMutation.mutateAsync({
            id: item._id,
            data: {
              ...item,
              price: {
                ...item.price,
                cost: priceForm.costMultiplier ? Number((item.price.cost * Number(priceForm.costMultiplier)).toFixed(2)) : item.price.cost,
                selling: priceForm.sellingMultiplier ? Number((item.price.selling * Number(priceForm.sellingMultiplier)).toFixed(2)) : item.price.selling,
              },
            },
          })
        )
      );

      toast.success(`Successfully updated prices for ${targets.length} products!`);
      
      // Trigger real-time updates
      queryClient.invalidateQueries('product-tools-inventory');
      queryClient.invalidateQueries('inventory');
      
      // Real-time notification
      console.log('Real-time price updates triggered for', targets.length, 'products');
      
      // Reset form after successful update
      setPriceForm({
        category: '',
        costMultiplier: 1,
        sellingMultiplier: 1,
      });
    } catch (error) {
      console.error('Bulk price update error:', error);
      toast.error('Some price updates failed. Please try again.');
    }
  };

  const importProducts = async () => {
    if (!importPreview.length) {
      toast.error('Paste a valid CSV first.');
      return;
    }

    if (!suppliers.length) {
      toast.error('Create at least one supplier before importing products.');
      return;
    }

    let successCount = 0;

    for (const row of importPreview) {
      const supplier =
        suppliers.find((item) => item._id === row.supplier_id) ||
        suppliers.find((item) => item.name?.toLowerCase() === row.supplier?.toLowerCase()) ||
        suppliers[0];

      const payload = {
        name: row.name,
        description: row.description || '',
        category: row.category || categories[0]?.name || 'General',
        brand: row.brand || '',
        warranty: row.warranty || '',
        sku: row.sku || '',
        quantity: Number(row.quantity || 0),
        minStockLevel: Number(row.minstocklevel || row.min_stock_level || 10),
        maxStockLevel: Number(row.maxstocklevel || row.max_stock_level || 1000),
        unit: row.unit || units[0]?.short_name || 'pcs',
        supplier_id: supplier?._id,
        price: {
          cost: Number(row.cost || 0),
          selling: Number(row.selling || row.selling_price || 0),
        },
        location: {
          warehouse: row.warehouse || '',
          aisle: row.aisle || '',
          shelf: row.shelf || '',
          bin: row.bin || '',
        },
      };

      if (!payload.name || !payload.supplier_id || !payload.category || !payload.unit) {
        continue;
      }

      try {
        await createProductMutation.mutateAsync(payload);
        successCount += 1;
      } catch (error) {
        // Continue importing remaining rows.
      }
    }

    toast.success(`Imported ${successCount} products.`);
    setCsvText('');
  };

  const importOpeningStock = async () => {
    if (!stockPreview.length) {
      toast.error('Paste opening stock CSV rows first.');
      return;
    }

    let successCount = 0;
    for (const row of stockPreview) {
      const product =
        inventory.find((item) => item.sku && item.sku.toLowerCase() === row.sku?.toLowerCase()) ||
        inventory.find((item) => item.name.toLowerCase() === row.name?.toLowerCase());

      if (!product) continue;

      try {
        await adjustMutation.mutateAsync({
          id: product._id,
          data: {
            quantity: Number(row.quantity || row.opening_stock || 0),
            reason: row.reason || 'Opening stock import',
          },
        });
        successCount += 1;
      } catch (error) {
        // Keep processing the rest.
      }
    }

    toast.success(`Applied opening stock for ${successCount} products.`);
    setStockCsvText('');
  };

  const createVariation = (e) => {
    e.preventDefault();
    
    if (!variationForm.productId || !variationForm.variationName) {
      toast.error('Please select a product and enter a variation name');
      return;
    }
    
    const next = [
      {
        id: `${Date.now()}`,
        ...variationForm,
        priceDelta: Number(variationForm.priceDelta || 0),
        createdAt: new Date().toISOString(),
      },
      ...variations,
    ];
    
    setVariations(next);
    writeStorage(VARIATIONS_KEY, next);
    
    // Real-time update notification
    toast.success(`Variation "${variationForm.variationName}" created for ${variationForm.productName}`);
    
    // Trigger real-time update
    queryClient.invalidateQueries('product-tools-inventory');
    
    setVariationForm({
      productId: '',
      productName: '',
      variationName: '',
      skuSuffix: '',
      priceDelta: 0,
      status: 'active',
    });
  };

  const deleteVariation = (variationId) => {
    const variation = variations.find(v => v.id === variationId);
    if (!variation) return;
    
    const next = variations.filter(v => v.id !== variationId);
    setVariations(next);
    writeStorage(VARIATIONS_KEY, next);
    
    // Real-time update notification
    toast.error(`Variation "${variation.variationName}" deleted`);
    
    // Trigger real-time update
    queryClient.invalidateQueries('product-tools-inventory');
  };

  const createPriceGroup = (e) => {
    e.preventDefault();
    const next = [
      {
        id: `${Date.now()}`,
        ...priceGroupForm,
        markup: Number(priceGroupForm.markup || 0),
        categories: priceGroupForm.categories
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      },
      ...priceGroups,
    ];
    setPriceGroups(next);
    writeStorage(PRICE_GROUPS_KEY, next);
    setPriceGroupForm({ name: '', description: '', markup: 10, categories: '' });
    toast.success('Selling price group saved.');
  };

  const printLabels = () => {
    if (!selectedProducts.length) {
      toast.error('Select at least one product.');
      return;
    }
    toast.success(`Printing labels for ${selectedProducts.length} products`);
  };

  const previewLabel = (product) => {
    // Create a preview modal or open a new window with label preview
    const labelContent = `
      <div style="width: 300px; height: 200px; border: 2px solid #000; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${product.name}</h3>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">${product.category}</p>
          <p style="margin: 5px 0; font-size: 12px;">SKU: ${product.sku || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">$${product.price?.selling || product.price?.cost || 0}</p>
          <div style="margin: 10px 0; height: 40px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 10px;">
            ||||| || |||||
          </div>
        </div>
      </div>
    `;
    
    const previewWindow = window.open('', '_blank', 'width=350,height=300');
    previewWindow.document.write(`
      <html>
        <head><title>Label Preview - ${product.name}</title></head>
        <body style="margin: 20px;">
          ${labelContent}
          <div style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  const generateQRCode = async (product) => {
    // Generate QR code data for the product
    const qrData = JSON.stringify({
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: product.price?.selling || product.price?.cost,
      category: product.category
    });
    
    // Generate real QR code
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        errorCorrectionLevel: 'H',
      });
    } catch (error) {
      console.error('QR code generation error:', error);
    }
    
    const qrContent = `
      <div style="width: 200px; height: 200px; border: 2px solid #000; padding: 10px; text-align: center;">
        <div style="width: 150px; height: 150px; margin: 0 auto;">
          <img src="${qrDataUrl}" alt="QR Code" style="width: 100%; height: 100%;" />
        </div>
        <p style="margin: 10px 0; font-size: 10px; font-weight: bold;">${product.name}</p>
        <p style="margin: 0; font-size: 8px;">SKU: ${product.sku || 'N/A'}</p>
      </div>
    `;
    
    const qrWindow = window.open('', '_blank', 'width=250,height=300');
    qrWindow.document.write(`
      <html>
        <head><title>QR Code - ${product.name}</title></head>
        <body style="margin: 20px; text-align: center;">
          <h3>QR Code for ${product.name}</h3>
          ${qrContent}
          <div style="margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">Print QR Code</button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `);
    qrWindow.document.close();
  };

  const editProduct = (product) => {
    // Navigate to edit product or open edit modal
    toast.success(`Opening edit form for ${product.name}`);
    // In a real implementation, you'd navigate to the edit page or open a modal
    // window.location.href = `/products/edit/${product._id}`;
  };

  const printSingleLabel = (product) => {
    // Print label for a single product
    const labelContent = `
      <div style="width: 300px; height: 200px; border: 2px solid #000; padding: 20px; font-family: Arial, sans-serif; page-break-after: always;">
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${product.name}</h3>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">${product.category}</p>
          <p style="margin: 5px 0; font-size: 12px;">SKU: ${product.sku || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">$${product.price?.selling || product.price?.cost || 0}</p>
          <div style="margin: 10px 0; height: 40px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 10px;">
            ||||| || |||||
          </div>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank', 'width=350,height=300');
    printWindow.document.write(`
      <html>
        <head><title>Print Label - ${product.name}</title></head>
        <body style="margin: 20px;">
          ${labelContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const { title, subtitle, icon: HeaderIcon } = toolsMeta[section];

  // Force online status for demo
  const isOnline = true;

  return (
    <div className="space-y-6">
      <ProductSectionNav />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
            <HeaderIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        
        {/* Online Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
          <WifiIcon className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium text-green-700">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {/* Product Count Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
          <CubeIcon className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-700">
            {isLoading ? 'Loading...' : `${inventory.length} Products`}
          </span>
        </div>
      </motion.div>

      {isLoading ? (
        <LoadingSpinner size="large" />
      ) : (
        <>
          {section === 'update-price' && (
            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
              <SectionCard title="Bulk Price Rules" subtitle="Apply a multiplier by category or across the catalog">
                <div className="space-y-4">
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input"
                      value={priceForm.category}
                      onChange={(e) => setPriceForm((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map((category) => (
                        <option key={category._id || category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select a category or leave blank to apply to all products</p>
                  </div>
                  <div>
                    <label className="label">Cost Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input"
                      value={priceForm.costMultiplier}
                      onChange={(e) => setPriceForm((prev) => ({ ...prev, costMultiplier: e.target.value }))}
                      placeholder="1.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Multiply cost prices by this factor (1.0 = no change)</p>
                  </div>
                  <div>
                    <label className="label">Selling Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input"
                      value={priceForm.sellingMultiplier}
                      onChange={(e) => setPriceForm((prev) => ({ ...prev, sellingMultiplier: e.target.value }))}
                      placeholder="1.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Multiply selling prices by this factor (1.0 = no change)</p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div>
                    <label className="label text-xs font-medium text-gray-700 mb-2 block">Quick Actions:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 1.1, sellingMultiplier: 1.15 }))}
                        className="btn btn-secondary text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        +10% Cost / +15% Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 0.95, sellingMultiplier: 0.9 }))}
                        className="btn btn-secondary text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        -5% Cost / -10% Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 1.2, sellingMultiplier: 1.25 }))}
                        className="btn btn-secondary text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        +20% Cost / +25% Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 0.9, sellingMultiplier: 0.85 }))}
                        className="btn btn-secondary text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        -10% Cost / -15% Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 1.05, sellingMultiplier: 1.1 }))}
                        className="btn btn-secondary text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        +5% Cost / +10% Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 1.15, sellingMultiplier: 1.2 }))}
                        className="btn btn-secondary text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        +15% Cost / +20% Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 1.3, sellingMultiplier: 1.4 }))}
                        className="btn btn-secondary text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        +30% Cost / +40% Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceForm(prev => ({ ...prev, costMultiplier: 1, sellingMultiplier: 1 }))}
                        className="btn btn-outline text-xs py-1.5"
                        disabled={updateMutation.isLoading}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview of what will be updated */}
                  {(priceForm.costMultiplier !== 1 || priceForm.sellingMultiplier !== 1) && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-2">Preview Changes:</p>
                      <div className="text-xs text-blue-700 space-y-1">
                        {priceForm.costMultiplier !== 1 && (
                          <p>Cost prices will be multiplied by {priceForm.costMultiplier} ({priceForm.costMultiplier > 1 ? '+' : ''}{((priceForm.costMultiplier - 1) * 100).toFixed(1)}%)</p>
                        )}
                        {priceForm.sellingMultiplier !== 1 && (
                          <p>Selling prices will be multiplied by {priceForm.sellingMultiplier} ({priceForm.sellingMultiplier > 1 ? '+' : ''}{((priceForm.sellingMultiplier - 1) * 100).toFixed(1)}%)</p>
                        )}
                        <p className="font-medium">Will affect {inventory.filter(item => !priceForm.category || item.category === priceForm.category).length} products</p>
                        {priceForm.category && (
                          <p>Category filter: {priceForm.category}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Available categories: {uniqueCategories.length} total
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Sample calculations */}
                  {(priceForm.costMultiplier !== 1 || priceForm.sellingMultiplier !== 1) && inventory.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Sample Calculation:</p>
                      <div className="text-xs text-gray-700">
                        {(() => {
                          const sampleItem = inventory.find(item => !priceForm.category || item.category === priceForm.category) || inventory[0];
                          const oldCost = sampleItem.price?.cost || 0;
                          const oldSelling = sampleItem.price?.selling || 0;
                          const newCost = priceForm.costMultiplier !== 1 ? Number((oldCost * priceForm.costMultiplier).toFixed(2)) : oldCost;
                          const newSelling = priceForm.sellingMultiplier !== 1 ? Number((oldSelling * priceForm.sellingMultiplier).toFixed(2)) : oldSelling;
                          
                          return (
                            <div className="space-y-1">
                              <p className="font-medium">{sampleItem.name}</p>
                              {priceForm.costMultiplier !== 1 && (
                                <p>Cost: ${oldCost} ${'->'} ${newCost}</p>
                              )}
                              {priceForm.sellingMultiplier !== 1 && (
                                <p>Selling: ${oldSelling} ${'->'} ${newSelling}</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      // Add confirmation dialog
                      const targetCount = inventory.filter(item => !priceForm.category || item.category === priceForm.category).length;
                      const confirmMessage = `Are you sure you want to update prices for ${targetCount} products?\n\n` +
                        `${priceForm.costMultiplier !== 1 ? `Cost multiplier: ${priceForm.costMultiplier}\n` : ''}` +
                        `${priceForm.sellingMultiplier !== 1 ? `Selling multiplier: ${priceForm.sellingMultiplier}\n` : ''}` +
                        `${priceForm.category ? `Category: ${priceForm.category}` : 'All categories'}`;
                      
                      if (window.confirm(confirmMessage)) {
                        applyBulkPriceUpdate();
                      }
                    }}
                    className="btn btn-primary w-full"
                    disabled={updateMutation.isLoading || (priceForm.costMultiplier === 1 && priceForm.sellingMultiplier === 1)}
                  >
                    {updateMutation.isLoading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">|||</span>
                        Updating Prices...
                      </>
                    ) : (
                      'Apply Price Update'
                    )}
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="Catalog Pricing" subtitle="Current cost and selling prices with real-time updates">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Product', 'Category', 'Cost', 'Selling'].map((heading) => (
                          <th key={heading} className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inventory && inventory.length > 0 ? (
                        inventory.slice(0, 50).map((item) => (
                          <tr key={item._id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">${item.price?.cost || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">${item.price?.selling || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            {isLoading ? 'Loading products...' : 'No products found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {inventory && inventory.length > 50 && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Showing first 50 of {inventory.length} products
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {inventory.length} products • {isConnected ? 'Real-time Active' : 'Offline'}
                  </div>
                  <button
                    onClick={() => queryClient.invalidateQueries('product-tools-inventory')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <ArrowPathIcon className="h-3 w-3" />
                    Refresh Prices
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'variations' && (
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr_1fr] gap-6">
              <SectionCard title="Create Variation" subtitle="Store variant definitions for products">
                <form onSubmit={createVariation} className="space-y-4">
                  <div>
                    <label className="label">Product</label>
                    <select
                      className="input"
                      value={variationForm.productId}
                      onChange={(e) => {
                        const product = inventory.find((item) => item._id === e.target.value);
                        setVariationForm((prev) => ({
                          ...prev,
                          productId: e.target.value,
                          productName: product?.name || '',
                        }));
                      }}
                    >
                      <option value="">Select product</option>
                      {inventory.length > 0 ? (
                        inventory
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name} ({item.category}) - SKU: {item.sku || 'N/A'}
                            </option>
                          ))
                      ) : (
                        <option value="">No products available</option>
                      )}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      {inventory.length} products available • Sorted by name
                    </div>
                  </div>
                  <div>
                    <label className="label">Variation Name</label>
                    <input className="input" value={variationForm.variationName} onChange={(e) => setVariationForm((prev) => ({ ...prev, variationName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">SKU Suffix</label>
                      <input className="input" value={variationForm.skuSuffix} onChange={(e) => setVariationForm((prev) => ({ ...prev, skuSuffix: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Price Delta</label>
                      <input type="number" className="input" value={variationForm.priceDelta} onChange={(e) => setVariationForm((prev) => ({ ...prev, priceDelta: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={variationForm.status} onChange={(e) => setVariationForm((prev) => ({ ...prev, status: e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">Save Variation</button>
                </form>
              </SectionCard>

              <SectionCard title="All Products" subtitle="Complete product list for variation management">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {inventory.length > 0 ? (
                    inventory
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((item) => (
                        <motion.div 
                          key={item._id} 
                          className="rounded-xl border border-gray-100 bg-white px-4 py-3 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.category} • SKU: {item.sku || 'N/A'} • Stock: {item.quantity || 0}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Price: ${item.price?.selling || item.price?.cost || 0} • {item.status}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setVariationForm({
                                    productId: item._id,
                                    productName: item.name,
                                    variationName: '',
                                    skuSuffix: '',
                                    priceDelta: '',
                                    status: 'active',
                                  });
                                  toast.success(`Selected ${item.name} for variation`);
                                }}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs rounded hover:bg-blue-50 transition-colors"
                                title="Create variation for this product"
                              >
                                Create Variation
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <motion.div 
                      className="text-center py-8 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <CubeIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm">No products available</p>
                      <p className="text-xs text-gray-400 mt-1">Add products to manage variations</p>
                    </motion.div>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-500 border-t pt-2">
                  {inventory.length} products total • Click "Create Variation" to add variants
                </div>
              </SectionCard>

              <SectionCard title="Variation Library" subtitle="Saved variants for reuse">
                <div className="space-y-3">
                  {variations.map((variation) => (
                    <motion.div 
                      key={variation.id} 
                      className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{variation.productName} • {variation.variationName}</p>
                        <p className="text-sm text-gray-500">{variation.skuSuffix} • ${variation.priceDelta} delta</p>
                        {variation.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Created {new Date(variation.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          variation.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {variation.status}
                        </span>
                        <button
                          onClick={() => deleteVariation(variation.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete variation"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {!variations.length && (
                    <motion.div 
                      className="text-center py-8 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Squares2X2Icon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm">No variations saved yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Create your first variation above</p>
                    </motion.div>
                  )}
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'import' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
              <SectionCard title="CSV Product Import" subtitle="Paste CSV with columns: name, category, sku, quantity, cost, selling, supplier, unit">
                <textarea
                  className="input min-h-[280px] font-mono text-sm"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={'name,category,sku,quantity,cost,selling,supplier,unit\nDemo Phone,Electronics,DP-01,10,300,450,Default Supplier,pcs'}
                />
                <button onClick={importProducts} className="btn btn-primary mt-4">
                  Import Products
                </button>
              </SectionCard>

              <SectionCard title="Import Preview" subtitle="Rows parsed from your CSV">
                <div className="space-y-3 max-h-[420px] overflow-y-auto">
                  {importPreview.map((row, index) => (
                    <div key={index} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="font-medium text-gray-900">{row.name || 'Unnamed product'}</p>
                      <p className="text-sm text-gray-500">{row.category} • SKU {row.sku || 'N/A'}</p>
                    </div>
                  ))}
                  {!importPreview.length && <p className="text-sm text-gray-500">Paste CSV rows to preview them here.</p>}
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'import-stock' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
              <SectionCard title="Opening Stock Import" subtitle="Paste CSV with columns: sku or name, quantity, reason">
                <textarea
                  className="input min-h-[280px] font-mono text-sm"
                  value={stockCsvText}
                  onChange={(e) => setStockCsvText(e.target.value)}
                  placeholder={'sku,quantity,reason\nDP-01,25,Opening stock load'}
                />
                <button onClick={importOpeningStock} className="btn btn-primary mt-4">
                  Apply Opening Stock
                </button>
              </SectionCard>

              <SectionCard title="Stock Import Preview" subtitle="Rows waiting to be applied">
                <div className="space-y-3 max-h-[420px] overflow-y-auto">
                  {stockPreview.map((row, index) => (
                    <div key={index} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="font-medium text-gray-900">{row.sku || row.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {row.quantity || row.opening_stock}</p>
                    </div>
                  ))}
                  {!stockPreview.length && <p className="text-sm text-gray-500">Paste opening stock CSV rows to preview them here.</p>}
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'labels' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
              <SectionCard title="All Products for Labels" subtitle="Real-time list of all available products for label and barcode generation">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      {inventory.length} products • {isConnected ? 'Real-time Active' : 'Offline'}
                    </div>
                    <button
                      onClick={() => queryClient.invalidateQueries('product-tools-inventory')}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <ArrowPathIcon className="h-3 w-3" />
                      Refresh
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {inventory.length > 0 ? (
                      inventory
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((item) => (
                          <motion.div 
                            key={item._id} 
                            className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div 
                                    className={`h-4 w-4 rounded border-2 cursor-pointer ${selectedIds.includes(item._id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}
                                    onClick={() => {
                                      if (!selectedIds.includes(item._id)) {
                                        setSelectedIds([...selectedIds, item._id]);
                                        toast.success(`Selected ${item.name} for label`);
                                      } else {
                                        setSelectedIds(selectedIds.filter(id => id !== item._id));
                                        toast.success(`Deselected ${item.name}`);
                                      }
                                    }}
                                  >
                                    {selectedIds.includes(item._id) && (
                                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  {realTimeUpdates.some(update => update._id === item._id) && (
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                  )}
                                </div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.category} • SKU: {item.sku || 'N/A'} • Stock: {item.quantity || 0}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Price: ${item.price?.selling || item.price?.cost || 0} • {item.status}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                              <button
                                onClick={() => previewLabel(item)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Preview label"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => generateQRCode(item)}
                                className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50 transition-colors"
                                title="Generate QR code"
                              >
                                <QrCodeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => editProduct(item)}
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                                title="Edit product"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => printSingleLabel(item)}
                                className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50 transition-colors"
                                title="Print label"
                              >
                                <PrinterIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))
                    ) : (
                      <motion.div 
                        className="text-center py-8 text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <CubeIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm">No products available</p>
                        <p className="text-xs text-gray-400 mt-1">Add products to generate labels</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Label Preview" subtitle="Printable shelf / barcode labels for selected products">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {selectedIds.length} products selected
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedIds([])}
                        className="text-xs text-red-600 hover:text-red-800"
                        disabled={!selectedIds.length}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-3">
                    {selectedProducts.map((item) => (
                      <div key={item._id} className="rounded-xl border border-dashed border-gray-300 p-4 bg-white">
                        <p className="text-xs uppercase tracking-wide text-gray-500">{item.category}</p>
                        <h4 className="mt-2 font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">SKU: {item.sku || 'N/A'}</p>
                        <p className="text-lg font-semibold text-gray-900 mt-3">${item.price?.selling || 0}</p>
                        <div className="mt-4 h-12 rounded bg-gray-100 flex items-center justify-center">
                          <canvas id={`barcode-${item._id}`} />
                        </div>
                      </div>
                    ))}
                    {!selectedIds.length && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <p className="text-sm">Select products on the left to preview labels</p>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'price-groups' && (
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
              <SectionCard title="Create Selling Price Group" subtitle="Markup-based pricing for categories or segments">
                <form onSubmit={createPriceGroup} className="space-y-4">
                  <div>
                    <label className="label">Group Name</label>
                    <input className="input" value={priceGroupForm.name} onChange={(e) => setPriceGroupForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea className="input" rows="3" value={priceGroupForm.description} onChange={(e) => setPriceGroupForm((prev) => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Markup %</label>
                    <input type="number" className="input" value={priceGroupForm.markup} onChange={(e) => setPriceGroupForm((prev) => ({ ...prev, markup: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Categories (comma separated)</label>
                    <input className="input" value={priceGroupForm.categories} onChange={(e) => setPriceGroupForm((prev) => ({ ...prev, categories: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary w-full">Save Price Group</button>
                </form>
              </SectionCard>

              <SectionCard title="Price Group Preview" subtitle="Saved groups with example pricing">
                <div className="space-y-4">
                  {priceGroups.map((group) => {
                    const sample = inventory.find((item) => !group.categories.length || group.categories.includes(item.category));
                    const previewPrice = sample ? sample.price.selling * (1 + group.markup / 100) : null;
                    return (
                      <div key={group.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{group.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                          </div>
                          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                            {group.markup}% markup
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">Categories: {group.categories.join(', ') || 'All products'}</p>
                        {sample && (
                          <p className="text-sm font-medium text-gray-900 mt-2">
                            Example: {sample.name} → ${previewPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {!priceGroups.length && <p className="text-sm text-gray-500">No selling price groups created yet.</p>}
                </div>
              </SectionCard>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductTools;
