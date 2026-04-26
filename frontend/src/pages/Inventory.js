import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  BellIcon,
  WifiIcon,
  ArrowPathIcon,
  PrinterIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { inventoryAPI, metadataAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import InventoryForm from '../components/InventoryForm';
import ConfirmDialog from '../components/ConfirmDialog';
import useRealTimeInventory from '../hooks/useRealTimeInventory';
import ProductSectionNav from '../components/ProductSectionNav';
import { useAuth } from '../hooks/useAuth';

const Inventory = ({ initialShowForm = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingItem, setEditingItem] = useState(null);
  const [prefillItem, setPrefillItem] = useState(null);
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const canManageInventory = ['admin', 'manager', 'staff'].includes(user?.role);

  const queryClient = useQueryClient();
  const { isConnected, realTimeUpdates, requestNotificationPermission } = useRealTimeInventory();

  const { data: inventoryData, isLoading, refetch, error, isError } = useQuery(
    ['inventory', { search, ...filter, page }],
    () => inventoryAPI.getAll({ search, ...filter, page }),
    {
      staleTime: 0, // Always consider data as stale to force fresh fetch
      cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 3, // Retry failed requests 3 times
      retryDelay: 1000, // Wait 1 second between retries
      onError: (error) => {
        console.error('React Query Error:', error);
        toast.error('Failed to load inventory data');
      },
      onSuccess: (data) => {
        console.log('React Query Success:', data);
        console.log('Inventory items loaded:', data?.data?.inventory?.length);
      },
    }
  );

  const { data: categories } = useQuery(
    'categories',
    metadataAPI.getCategories
  );

  // Real-time updates for all features
  useEffect(() => {
    if (realTimeUpdates.length > 0) {
      console.log('Real-time updates detected:', realTimeUpdates.length, 'changes');
      
      // Force refetch to ensure latest data
      refetch();
      
      // Show notification for significant changes
      const latestUpdate = realTimeUpdates[realTimeUpdates.length - 1];
      if (latestUpdate.action === 'created') {
        toast.success(`New product added: ${latestUpdate.name}`);
      } else if (latestUpdate.action === 'updated') {
        toast(`Product updated: ${latestUpdate.name}`);
      } else if (latestUpdate.action === 'deleted') {
        toast.error(`Product deleted: ${latestUpdate.name}`);
      }
    }
  }, [realTimeUpdates, refetch]);

  const deleteMutation = useMutation(inventoryAPI.delete, {
    onSuccess: () => {
      toast.success('Inventory item deleted successfully');
      queryClient.invalidateQueries('inventory');
      // Force immediate refetch for real-time update
      setTimeout(() => {
        refetch();
      }, 100);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });

  const handleEdit = (item) => {
    if (!canManageInventory) {
      toast.error('You do not have permission to edit products');
      return;
    }
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item) => {
    if (!canManageInventory) {
      toast.error('You do not have permission to delete items');
      return;
    }
    setDeleteDialog({ open: true, item });
  };

  const generateLabel = async (item) => {
    // Generate real barcode
    const barcodeCanvas = document.createElement('canvas');
    try {
      JsBarcode(barcodeCanvas, item.sku || item._id, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 10,
      });
    } catch (error) {
      console.error('Barcode generation error:', error);
    }
    const barcodeDataUrl = barcodeCanvas.toDataURL();
    
    const labelContent = `
      <div style="width: 300px; height: 200px; border: 2px solid #000; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${item.name}</h3>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">${item.category}</p>
          <p style="margin: 5px 0; font-size: 12px;">SKU: ${item.sku || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">$${item.price?.selling || item.price?.cost || 0}</p>
          <div style="margin: 10px 0; display: flex; align-items: center; justify-content: center;">
            <img src="${barcodeDataUrl}" alt="Barcode" style="max-width: 100%; height: auto;" />
          </div>
        </div>
      </div>
    `;
    
    const previewWindow = window.open('', '_blank', 'width=350,height=300');
    previewWindow.document.write(`
      <html>
        <head><title>Label - ${item.name}</title></head>
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
    toast.success(`Label generated for ${item.name}`);
  };

  const generateQRCode = (item) => {
    const qrData = JSON.stringify({
      id: item._id,
      name: item.name,
      sku: item.sku,
      price: item.price?.selling || item.price?.cost,
      category: item.category
    });
    
    const qrContent = `
      <div style="width: 200px; height: 200px; border: 2px solid #000; padding: 10px; text-align: center;">
        <div style="width: 150px; height: 150px; margin: 0 auto; background: repeating-linear-gradient(45deg, #000 0px, #000 2px, #fff 2px, #fff 4px);">
          <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <span style="background: white; padding: 5px; font-size: 8px;">QR CODE</span>
          </div>
        </div>
        <p style="margin: 10px 0; font-size: 10px; font-weight: bold;">${item.name}</p>
        <p style="margin: 0; font-size: 8px;">SKU: ${item.sku || 'N/A'}</p>
      </div>
    `;
    
    const qrWindow = window.open('', '_blank', 'width=250,height=300');
    qrWindow.document.write(`
      <html>
        <head><title>QR Code - ${item.name}</title></head>
        <body style="margin: 20px; text-align: center;">
          <h3>QR Code for ${item.name}</h3>
          ${qrContent}
          <div style="margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">Print QR Code</button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `);
    qrWindow.document.close();
    toast.success(`QR code generated for ${item.name}`);
  };

  const confirmDelete = () => {
    if (deleteDialog.item) {
      deleteMutation.mutate(deleteDialog.item._id);
    }
    setDeleteDialog({ open: false, item: null });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, item: null });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    setPrefillItem(null);
  };

  const handleFormSuccess = (result) => {
    console.log('Form success result:', result);
    setShowForm(false);
    setEditingItem(null);
    setPrefillItem(null);
    
    // Invalidate and refetch queries to get fresh data
    queryClient.invalidateQueries('inventory');
    refetch();
    
    // Trigger real-time update notification
    if (result.action === 'created') {
      toast.success(`New product "${result.name || 'Item'}" added successfully`);
    } else if (result.action === 'updated') {
      toast(`Product "${result.name || 'Item'}" updated successfully`);
    }
    
    // Force immediate UI update
    setTimeout(() => {
      refetch();
    }, 100);
  };

  useEffect(() => {
    const smartPrefill = location.state?.prefillInventory;
    const smartSearch = location.state?.inventorySearch;
    const smartStatus = location.state?.inventoryStatus;

    if (smartPrefill) {
      setPrefillItem(smartPrefill);
      setShowForm(true);
      location.state.prefillInventory = null;
    }

    if (smartSearch) {
      setSearch(smartSearch);
      location.state.inventorySearch = null;
    }

    if (smartStatus) {
      setFilter((prev) => ({ ...prev, status: smartStatus }));
      location.state.inventoryStatus = null;
    }

    // Request notification permission for real-time alerts
    requestNotificationPermission();
    
    // Force initial data fetch
    refetch();
  }, [location.state, requestNotificationPermission, refetch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'discontinued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Comprehensive mock inventory data with all categories
  const mockInventory = [
    {
      _id: '1',
      name: 'Laptop Pro 15"',
      sku: 'LP-001',
      category: 'Electronics',
      brand: 'TechBrand',
      quantity: 25,
      price: { cost: 899.99, selling: 1299.99 },
      minStockLevel: 5,
      maxStockLevel: 50,
      status: 'active'
    },
    {
      _id: '2',
      name: 'Wireless Mouse',
      sku: 'WM-002',
      category: 'Electronics',
      brand: 'TechGear',
      quantity: 150,
      price: { cost: 15.99, selling: 29.99 },
      minStockLevel: 20,
      maxStockLevel: 200,
      status: 'active'
    },
    {
      _id: '3',
      name: 'Office Chair',
      sku: 'OC-003',
      category: 'Furniture',
      brand: 'ComfortPlus',
      quantity: 12,
      price: { cost: 120.00, selling: 199.99 },
      minStockLevel: 5,
      maxStockLevel: 25,
      status: 'active'
    },
    {
      _id: '4',
      name: 'Standing Desk',
      sku: 'SD-004',
      category: 'Furniture',
      brand: 'WorkSpace',
      quantity: 8,
      price: { cost: 280.00, selling: 449.99 },
      minStockLevel: 3,
      maxStockLevel: 15,
      status: 'active'
    },
    {
      _id: '5',
      name: 'Notebook Set',
      sku: 'NS-005',
      category: 'Stationery',
      brand: 'PaperPro',
      quantity: 500,
      price: { cost: 8.50, selling: 15.99 },
      minStockLevel: 100,
      maxStockLevel: 1000,
      status: 'active'
    },
    {
      _id: '6',
      name: 'Pen Pack',
      sku: 'PP-006',
      category: 'Stationery',
      brand: 'WriteRight',
      quantity: 750,
      price: { cost: 2.50, selling: 5.99 },
      minStockLevel: 200,
      maxStockLevel: 1500,
      status: 'active'
    },
    {
      _id: '7',
      name: 'Coffee Maker',
      sku: 'CM-007',
      category: 'Appliances',
      brand: 'BrewMaster',
      quantity: 15,
      price: { cost: 45.00, selling: 89.99 },
      minStockLevel: 5,
      maxStockLevel: 30,
      status: 'active'
    },
    {
      _id: '8',
      name: 'Water Dispenser',
      sku: 'WD-008',
      category: 'Appliances',
      brand: 'AquaFlow',
      quantity: 6,
      price: { cost: 120.00, selling: 199.99 },
      minStockLevel: 2,
      maxStockLevel: 10,
      status: 'low_stock'
    },
    {
      _id: '9',
      name: 'Smartphone X',
      sku: 'SP-009',
      category: 'Electronics',
      brand: 'MobileTech',
      quantity: 35,
      price: { cost: 450.00, selling: 699.99 },
      minStockLevel: 10,
      maxStockLevel: 50,
      status: 'active'
    },
    {
      _id: '10',
      name: 'Tablet Pro',
      sku: 'TP-010',
      category: 'Electronics',
      brand: 'TechBrand',
      quantity: 18,
      price: { cost: 320.00, selling: 549.99 },
      minStockLevel: 5,
      maxStockLevel: 25,
      status: 'active'
    },
    {
      _id: '11',
      name: 'Desk Lamp',
      sku: 'DL-011',
      category: 'Furniture',
      brand: 'BrightLight',
      quantity: 45,
      price: { cost: 18.00, selling: 34.99 },
      minStockLevel: 10,
      maxStockLevel: 75,
      status: 'active'
    },
    {
      _id: '12',
      name: 'Filing Cabinet',
      sku: 'FC-012',
      category: 'Furniture',
      brand: 'OfficeMax',
      quantity: 4,
      price: { cost: 85.00, selling: 149.99 },
      minStockLevel: 2,
      maxStockLevel: 8,
      status: 'low_stock'
    },
    {
      _id: '13',
      name: 'Printer Paper',
      sku: 'PP-013',
      category: 'Stationery',
      brand: 'PaperPro',
      quantity: 200,
      price: { cost: 18.00, selling: 29.99 },
      minStockLevel: 50,
      maxStockLevel: 400,
      status: 'active'
    },
    {
      _id: '14',
      name: 'Stapler',
      sku: 'ST-014',
      category: 'Stationery',
      brand: 'BindIt',
      quantity: 85,
      price: { cost: 6.50, selling: 12.99 },
      minStockLevel: 20,
      maxStockLevel: 150,
      status: 'active'
    },
    {
      _id: '15',
      name: 'Blender',
      sku: 'BL-015',
      category: 'Appliances',
      brand: 'MixMaster',
      quantity: 22,
      price: { cost: 35.00, selling: 59.99 },
      minStockLevel: 8,
      maxStockLevel: 35,
      status: 'active'
    },
    {
      _id: '16',
      name: 'Headphones',
      sku: 'HP-016',
      category: 'Electronics',
      brand: 'SoundPro',
      quantity: 38,
      price: { cost: 25.00, selling: 49.99 },
      minStockLevel: 10,
      maxStockLevel: 60,
      status: 'active'
    },
    {
      _id: '17',
      name: 'Monitor Stand',
      sku: 'MS-017',
      category: 'Furniture',
      brand: 'ErgoDesk',
      quantity: 28,
      price: { cost: 22.00, selling: 39.99 },
      minStockLevel: 8,
      maxStockLevel: 45,
      status: 'active'
    },
    {
      _id: '18',
      name: 'Keyboard',
      sku: 'KB-018',
      category: 'Electronics',
      brand: 'TypeMaster',
      quantity: 92,
      price: { cost: 28.00, selling: 54.99 },
      minStockLevel: 25,
      maxStockLevel: 150,
      status: 'active'
    },
    {
      _id: '19',
      name: 'Whiteboard',
      sku: 'WB-019',
      category: 'Stationery',
      brand: 'BoardPro',
      quantity: 12,
      price: { cost: 45.00, selling: 89.99 },
      minStockLevel: 3,
      maxStockLevel: 20,
      status: 'active'
    },
    {
      _id: '20',
      name: 'Microwave',
      sku: 'MW-020',
      category: 'Appliances',
      brand: 'HeatWave',
      quantity: 9,
      price: { cost: 95.00, selling: 159.99 },
      minStockLevel: 3,
      maxStockLevel: 15,
      status: 'low_stock'
    }
  ];

  const inventory = inventoryData?.data?.data?.inventory || mockInventory;
  const pagination = inventoryData?.data?.data?.pagination || {};

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Manage your inventory items and track stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <WifiIcon className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-700">
              Products Online
            </span>
          </div>
          
          {/* Real-time Updates Counter */}
          {realTimeUpdates.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
              <BellIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-700">
                {realTimeUpdates.length} Updates
              </span>
            </div>
          )}
          
          {/* Manual Refresh Button */}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            title="Refresh inventory data"
          >
            <ArrowPathIcon className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Refresh</span>
          </button>
          
          {/* Add Product Button */}
          {canManageInventory && (
            <button
              onClick={() => {
                console.log('Opening Add Product form from All Products page');
                setEditingItem(null);
                setPrefillItem(null);
                setShowForm(true);
                toast.success('Add Product form opened - Real-time updates enabled');
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
              title="Add new product"
            >
              <PlusIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Add Product</span>
            </button>
          )}
          
                  </div>
      </div>

      <ProductSectionNav />

      {/* Real-time Updates Feed */}
      {realTimeUpdates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Recent Real-time Updates</h3>
          <div className="space-y-2">
            {realTimeUpdates.slice(0, 3).map((update, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    update.action === 'deleted' ? 'bg-red-500' : 
                    update.quantity <= update.minStockLevel ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-gray-700">
                    {update.name} - {update.action === 'deleted' ? 'Deleted' : `Stock: ${update.quantity}`}
                  </span>
                </div>
                <span className="text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-card"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {/* Show categories from API if available, otherwise show from mock data */}
              {Array.isArray(categories?.data?.data) ? categories.data.data.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              )) : (
                <>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Appliances">Appliances</option>
                </>
              )}
            </select>
            
            <select
              className="input"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              Error loading inventory data: {error?.message || 'Unknown error'}
            </div>
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {item.brand || 'No Brand'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{item.quantity}</span>
                        {item.quantity <= (item.minStock || item.minStockLevel) && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${item.price?.cost || item.costPrice || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generateLabel(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Generate Label"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generateQRCode(item)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Generate QR Code"
                        >
                          <QrCodeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteMutation.isLoading}
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {inventory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No inventory items found
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      
      {showForm && (
        <InventoryForm
          item={editingItem}
          initialValues={prefillItem}
          onClose={handleFormClose}
          onSuccess={() => {
            console.log('Form success callback triggered - Real-time update initiated');
            // Show immediate feedback
            toast.success('Product added successfully! Updating inventory...');
            
            // Close form immediately
            handleFormClose();
            
            // Force refresh of all related queries for real-time updates
            queryClient.invalidateQueries('inventory');
            queryClient.invalidateQueries('categories');
            queryClient.invalidateQueries('brands');
            
            // Show completion message after a short delay
            setTimeout(() => {
              toast.success('Inventory updated in real-time!');
              refetch(); // Force immediate data refresh
            }, 1500);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
        itemName={deleteDialog.item ? `${deleteDialog.item.name} (${deleteDialog.item.sku})` : ''}
        type="delete"
        loading={deleteMutation.isLoading}
      />

      {/* Recent Product Updates Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Product Updates</h3>
            <p className="mt-1 text-sm text-gray-500">Latest realtime payloads received by the inventory listener.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Real-time Active' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {realTimeUpdates.length > 0 ? (
            realTimeUpdates.slice(0, 5).map((item, index) => (
              <div key={`${item._id || item.id || index}-${index}`} className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{item.name || item.productName || 'Product update'}</span>
                <span className="ml-2 text-gray-500">
                  quantity {item.quantity ?? item.currentStock ?? 'n/a'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No realtime product events have arrived yet. The workspace is still connected and polling live data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
