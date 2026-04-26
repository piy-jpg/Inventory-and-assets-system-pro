import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  ChartBarIcon,
  MapPinIcon,
  PhotoIcon,
  SignalIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import ProductSectionNav from '../components/ProductSectionNav';
import LoadingSpinner from '../components/LoadingSpinner';
import useRealTimeInventory from '../hooks/useRealTimeInventory';
import { inventoryAPI, metadataAPI, suppliersAPI } from '../services/api';

const PRODUCT_MEDIA_KEY = 'smart_inventory_product_media';

const readProductMedia = () => {
  try {
    return JSON.parse(localStorage.getItem(PRODUCT_MEDIA_KEY) || '{}');
  } catch (error) {
    return {};
  }
};

const writeProductMedia = (value) => {
  localStorage.setItem(PRODUCT_MEDIA_KEY, JSON.stringify(value));
};

const sectionMeta = {
  pricing: {
    title: 'Pricing & Discounts',
    subtitle: 'Monitor selling price, margin, and category pricing performance in real time.',
    icon: TagIcon,
  },
  stock: {
    title: 'Stock per Product',
    subtitle: 'See product-by-product stock health, reorder pressure, and inventory value.',
    icon: CubeIcon,
  },
  locations: {
    title: 'Product Locations',
    subtitle: 'Track where each product is stored across warehouses, aisles, shelves, and bins.',
    icon: MapPinIcon,
  },
  media: {
    title: 'Media & Attachments',
    subtitle: 'Manage product image and attachment readiness for your catalog workflow.',
    icon: PhotoIcon,
  },
  reports: {
    title: 'Product Reports',
    subtitle: 'Review inventory summary, category mix, stock value, and realtime product KPIs.',
    icon: ChartBarIcon,
  },
  'low-stock': {
    title: 'Low Stock Products',
    subtitle: 'Work the reorder queue and respond quickly to critical inventory gaps.',
    icon: ExclamationTriangleIcon,
  },
};

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

const ProductWorkspace = ({ section }) => {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [mediaDraft, setMediaDraft] = useState(() => readProductMedia());
  const meta = sectionMeta[section] || sectionMeta.reports;
  const SectionIcon = meta.icon;

  const { isConnected, realTimeUpdates } = useRealTimeInventory();
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery(
    ['products-workspace-inventory'],
    () => inventoryAPI.getAll({ limit: 500, sortBy: 'name', sortOrder: 'ASC' }),
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      keepPreviousData: true,
    }
  );

  const lowStockQuery = useQuery(['products-workspace-low-stock'], inventoryAPI.getLowStock, {
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  // Real-time updates for low stock
  useEffect(() => {
    if (realTimeUpdates.length > 0) {
      console.log('Real-time updates detected in ProductWorkspace - Low Stock:', realTimeUpdates.length);
      
      // Check if any real-time updates affect low stock items
      const lowStockUpdates = realTimeUpdates.filter(update => {
        const lowStockItems = lowStockQuery.data?.data?.data?.items || [];
        return lowStockItems.some(item => item._id === update._id);
      });
      
      if (lowStockUpdates.length > 0) {
        console.log('Low stock items updated in real-time:', lowStockUpdates.length);
        toast.success(`${lowStockUpdates.length} low stock items updated in real-time`);
      }
      
      // Refresh low stock data when real-time updates occur
      queryClient.invalidateQueries('products-workspace-low-stock');
      queryClient.invalidateQueries('products-workspace-inventory');
    }
  }, [realTimeUpdates, queryClient, lowStockQuery.data]);

  // Continuous real-time monitoring for low stock
  useEffect(() => {
    if (!isConnected) {
      console.log('Real-time connection lost for low stock monitoring');
      // Attempt to refresh data when connection is lost
      const refreshInterval = setInterval(() => {
        if (isConnected) {
          clearInterval(refreshInterval);
          console.log('Real-time connection restored for low stock monitoring');
          toast.success('Real-time connection restored for low stock monitoring');
        } else {
          // Fallback polling when connection is lost
          lowStockQuery.refetch();
          inventoryQuery.refetch();
        }
      }, 5000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [isConnected, lowStockQuery, inventoryQuery]);

  const reportsQuery = useQuery(['products-workspace-reports'], inventoryAPI.getReportsSummary, {
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const categoriesQuery = useQuery(['products-workspace-categories'], metadataAPI.getCategories, {
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const suppliersQuery = useQuery(['products-workspace-suppliers'], () => suppliersAPI.getAll({ limit: 200 }), {
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const products = useMemo(
    () =>
      inventoryQuery.data?.data?.data?.inventory ||
      inventoryQuery.data?.data?.inventory ||
      [],
    [inventoryQuery.data]
  );
  const lowStockItems =
    lowStockQuery.data?.data?.data?.lowStockItems ||
    lowStockQuery.data?.data?.lowStockItems ||
    [];
  const reportSummary =
    reportsQuery.data?.data?.data ||
    reportsQuery.data?.data ||
    {};
  const categories =
    categoriesQuery.data?.data?.data?.categories ||
    categoriesQuery.data?.data?.categories ||
    categoriesQuery.data?.data?.data ||
    [];
  const suppliers = useMemo(
    () =>
      suppliersQuery.data?.data?.data?.suppliers ||
      suppliersQuery.data?.data?.suppliers ||
      suppliersQuery.data?.data?.data ||
      [],
    [suppliersQuery.data]
  );

  const derivedProducts = useMemo(
    () =>
      products.map((product) => {
        const cost = Number(product.price?.cost || product.cost || 0);
        const selling = Number(product.price?.selling || product.price || 0);
        const quantity = Number(product.quantity || 0);
        const minStock = Number(product.minStock || product.minStockLevel || 0);
        const maxStock = Number(product.maxStock || product.maxStockLevel || 0);
        const marginValue = selling - cost;
        const marginPct = selling > 0 ? (marginValue / selling) * 100 : 0;
        const mediaRecord = mediaDraft[product._id] || {};

        return {
          ...product,
          cost,
          selling,
          quantity,
          minStock,
          maxStock,
          marginValue,
          marginPct,
          inventoryValue: selling * quantity,
          supplierName: product.supplier || suppliers.find((item) => item._id === product.supplier_id)?.name || 'Unassigned',
          warehouse: product.location?.warehouse || 'Main Warehouse',
          aisle: product.location?.aisle || '-',
          shelf: product.location?.shelf || '-',
          bin: product.location?.bin || '-',
          mediaStatus: mediaRecord.status || (mediaRecord.coverImage ? 'ready' : 'pending'),
          coverImage: mediaRecord.coverImage || '',
          attachmentCount: Number(mediaRecord.attachmentCount || 0),
        };
      }),
    [mediaDraft, products, suppliers]
  );

  const selectedProduct = derivedProducts.find((item) => item._id === selectedProductId) || derivedProducts[0] || null;

  const categoryPricing = useMemo(() => {
    const bucket = new Map();

    derivedProducts.forEach((product) => {
      const key = product.category || 'Uncategorized';
      const current = bucket.get(key) || {
        category: key,
        products: 0,
        value: 0,
        averageMarginPct: 0,
      };

      current.products += 1;
      current.value += product.inventoryValue;
      current.averageMarginPct += product.marginPct;
      bucket.set(key, current);
    });

    return Array.from(bucket.values())
      .map((item) => ({
        ...item,
        averageMarginPct: item.products ? item.averageMarginPct / item.products : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [derivedProducts]);

  const locationSummary = useMemo(() => {
    const bucket = new Map();

    derivedProducts.forEach((product) => {
      const key = product.warehouse;
      const current = bucket.get(key) || {
        warehouse: key,
        products: 0,
        units: 0,
        value: 0,
      };

      current.products += 1;
      current.units += product.quantity;
      current.value += product.inventoryValue;
      bucket.set(key, current);
    });

    return Array.from(bucket.values()).sort((a, b) => b.value - a.value);
  }, [derivedProducts]);

  const mediaSummary = useMemo(() => {
    const ready = derivedProducts.filter((product) => product.mediaStatus === 'ready').length;
    const pending = derivedProducts.filter((product) => product.mediaStatus !== 'ready').length;
    const attachments = derivedProducts.reduce((sum, product) => sum + product.attachmentCount, 0);

    return { ready, pending, attachments };
  }, [derivedProducts]);

  const inventorySummary = useMemo(() => {
    const totalValue = derivedProducts.reduce((sum, product) => sum + product.inventoryValue, 0);
    const outOfStock = derivedProducts.filter((product) => product.quantity === 0).length;
    const lowStock = derivedProducts.filter((product) => product.quantity > 0 && product.quantity <= product.minStock).length;

    return {
      totalProducts: derivedProducts.length,
      totalValue,
      outOfStock,
      lowStock,
    };
  }, [derivedProducts]);

  const saveMediaRecord = () => {
    if (!selectedProduct) {
      toast.error('Select a product first.');
      return;
    }

    writeProductMedia(mediaDraft);
    toast.success(`Saved media details for ${selectedProduct.name}.`);
  };

  const updateSelectedMedia = (field, value) => {
    if (!selectedProduct) return;

    setMediaDraft((prev) => ({
      ...prev,
      [selectedProduct._id]: {
        ...(prev[selectedProduct._id] || {}),
        [field]: value,
      },
    }));
  };

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Tracked Products" value={inventorySummary.totalProducts} tone="blue" />
        <StatCard
          label="Average Margin"
          value={percent(
            derivedProducts.length
              ? derivedProducts.reduce((sum, product) => sum + product.marginPct, 0) / derivedProducts.length
              : 0
          )}
          tone="emerald"
        />
        <StatCard label="Inventory Value" value={currency(inventorySummary.totalValue)} tone="amber" />
      </div>

      <SectionTable
        title="Live Pricing by Product"
        description="These values update as the inventory dataset changes."
        columns={['Product', 'Category', 'Cost', 'Selling', 'Margin', 'Stock Value']}
        rows={derivedProducts.map((product) => [
          product.name,
          product.category || 'Uncategorized',
          currency(product.cost),
          currency(product.selling),
          percent(product.marginPct),
          currency(product.inventoryValue),
        ])}
      />

      <SectionTable
        title="Category Pricing Mix"
        description="Use this to spot which categories carry the most value and margin."
        columns={['Category', 'Products', 'Average Margin', 'Inventory Value']}
        rows={categoryPricing.map((item) => [
          item.category,
          item.products,
          percent(item.averageMarginPct),
          currency(item.value),
        ])}
      />
    </div>
  );

  const renderStock = () => (
    <div className="space-y-6">
      
      <SectionTable
        title="Stock by Product"
        description="Realtime stock health from the products dataset."
        columns={['Product', 'SKU', 'Quantity', 'Min', 'Max', 'Supplier']}
        rows={derivedProducts.map((product) => [
          product.name,
          product.sku,
          product.quantity,
          product.minStock,
          product.maxStock,
          product.supplierName,
        ])}
      />
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Warehouses" value={locationSummary.length} tone="blue" />
        <StatCard label="Located Products" value={derivedProducts.filter((item) => item.warehouse).length} tone="emerald" />
        <StatCard label="Stored Units" value={derivedProducts.reduce((sum, item) => sum + item.quantity, 0)} tone="amber" />
      </div>

      <SectionTable
        title="Warehouse Summary"
        description="Storage distribution across the current product catalog."
        columns={['Warehouse', 'Products', 'Units', 'Inventory Value']}
        rows={locationSummary.map((item) => [
          item.warehouse,
          item.products,
          item.units,
          currency(item.value),
        ])}
      />

      <SectionTable
        title="Storage Map"
        description="Exact product placement for picking and replenishment."
        columns={['Product', 'Warehouse', 'Aisle', 'Shelf', 'Bin']}
        rows={derivedProducts.map((product) => [
          product.name,
          product.warehouse,
          product.aisle,
          product.shelf,
          product.bin,
        ])}
      />
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Ready Media" value={mediaSummary.ready} tone="emerald" />
        <StatCard label="Pending Media" value={mediaSummary.pending} tone="amber" />
        <StatCard label="Attachments Logged" value={mediaSummary.attachments} tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Catalog Media Queue</h3>
          <p className="mt-1 text-sm text-gray-500">Track media readiness for each product and keep the catalog publishable.</p>
          <div className="mt-5 space-y-3">
            {derivedProducts.map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() => setSelectedProductId(product._id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  selectedProduct?._id === product._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category || 'Uncategorized'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.mediaStatus === 'ready'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {product.mediaStatus === 'ready' ? 'Ready' : 'Pending'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Selected Product Media</h3>
          {selectedProduct ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Product</p>
                <p className="mt-1 text-base text-gray-900">{selectedProduct.name}</p>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Cover Image URL</span>
                <input
                  className="input mt-2"
                  value={mediaDraft[selectedProduct._id]?.coverImage || ''}
                  onChange={(event) => updateSelectedMedia('coverImage', event.target.value)}
                  placeholder="https://example.com/product-image.jpg"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Attachment Count</span>
                <input
                  type="number"
                  min="0"
                  className="input mt-2"
                  value={mediaDraft[selectedProduct._id]?.attachmentCount || 0}
                  onChange={(event) => updateSelectedMedia('attachmentCount', Number(event.target.value))}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <select
                  className="input mt-2"
                  value={mediaDraft[selectedProduct._id]?.status || 'pending'}
                  onChange={(event) => updateSelectedMedia('status', event.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="ready">Ready</option>
                </select>
              </label>
              <button type="button" onClick={saveMediaRecord} className="btn btn-primary w-full">
                Save Media Details
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No product available for media management yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Products" value={reportSummary.inventory?.totalProducts || inventorySummary.totalProducts} tone="blue" />
        <StatCard label="Low Stock Items" value={reportSummary.inventory?.lowStockItems || inventorySummary.lowStock} tone="amber" />
        <StatCard label="Out of Stock" value={reportSummary.inventory?.outOfStockItems || inventorySummary.outOfStock} tone="red" />
        <StatCard label="Inventory Value" value={currency(reportSummary.inventory?.totalValue || inventorySummary.totalValue)} tone="emerald" />
      </div>

      <SectionTable
        title="Product Mix by Category"
        description="Live category coverage against the current catalog."
        columns={['Category', 'Products']}
        rows={(Array.isArray(categories) ? categories : []).map((item) => [
          item.name,
          item.product_count || derivedProducts.filter((product) => product.category === item.name).length,
        ])}
      />

      <SectionTable
        title="Top Inventory Value"
        description="Highest-value products right now."
        columns={['Product', 'Category', 'Units', 'Value']}
        rows={[...derivedProducts]
          .sort((a, b) => b.inventoryValue - a.inventoryValue)
          .slice(0, 10)
          .map((product) => [
            product.name,
            product.category || 'Uncategorized',
            product.quantity,
            currency(product.inventoryValue),
          ])}
      />
    </div>
  );

  const renderLowStock = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Real-time Active' : 'Reconnecting...'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {realTimeUpdates.length > 0 && (
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                {realTimeUpdates.length} live updates
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              lowStockQuery.refetch();
              inventoryQuery.refetch();
              toast.success('Low stock data refreshed');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ArrowPathIcon className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Low Stock Queue" value={lowStockItems.length} tone="amber" />
        <StatCard label="Critical Items" value={lowStockItems.filter((item) => item.urgency === 'critical').length} tone="red" />
        <StatCard label="High Priority" value={lowStockItems.filter((item) => item.urgency === 'high').length} tone="orange" />
        <StatCard
          label="Reorder Value"
          value={currency(lowStockQuery.data?.data?.data?.summary?.totalReorderValue || 0)}
          tone="blue"
        />
      </div>

      <SectionTable
        title="Low Stock Action Queue"
        description="These products need attention before they interrupt operations."
        columns={['Product', 'Quantity', 'Min', 'Urgency', 'Supplier', 'Real-time', 'Action']}
        rows={lowStockItems.map((item) => [
          item.name,
          item.quantity,
          item.minStock,
          item.urgency,
          item.supplier,
          <div key={`${item._id}-realtime`} className="flex items-center gap-2">
            {realTimeUpdates.some(update => update._id === item._id) && (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </>
            )}
            {!realTimeUpdates.some(update => update._id === item._id) && (
              <span className="text-xs text-gray-400">Static</span>
            )}
          </div>,
          <button
            key={`${item._id}-action`}
            type="button"
            onClick={() => {
              navigate('/products/import-stock');
              toast.success(`Opening stock import for ${item.name}`);
            }}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Replenish
          </button>,
        ])}
      />
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'pricing':
        return renderPricing();
      case 'stock':
        return renderStock();
      case 'locations':
        return renderLocations();
      case 'media':
        return renderMedia();
      case 'reports':
        return renderReports();
      case 'low-stock':
        return renderLowStock();
      default:
        return renderReports();
    }
  };

  const isLoading =
    inventoryQuery.isLoading ||
    lowStockQuery.isLoading ||
    reportsQuery.isLoading;

  return (
    <div className="space-y-6">
      <ProductSectionNav />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <SectionIcon className="mr-2 h-4 w-4" />
              Products Workspace
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">{meta.title}</h1>
            <p className="mt-2 max-w-3xl text-gray-600">{meta.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <SignalIcon className="mr-2 h-4 w-4" />
              {isConnected ? 'Realtime online' : 'Polling fallback active'}
            </span>
            <button
              type="button"
              onClick={() => {
                inventoryQuery.refetch();
                lowStockQuery.refetch();
                reportsQuery.refetch();
                toast.success('Products workspace refreshed.');
              }}
              className="btn btn-secondary flex items-center"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <QuickLinkCard
            title="Create Product"
            description="Add a new product into the connected inventory workflow."
            to="/products/create"
          />
          <QuickLinkCard
            title="Stock Intake"
            description="Apply opening stock or replenishment to product records."
            to="/products/import-stock"
          />
          <QuickLinkCard
            title="Labels & Variations"
            description="Open the label and variation tools for product operations."
            to="/products/labels"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <LoadingSpinner size="large" />
      ) : (
        renderSection()
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Recent Product Updates</h3>
        <p className="mt-1 text-sm text-gray-500">Latest realtime payloads received by the inventory listener.</p>
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

const StatCard = ({ label, value, tone }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.blue}`}>
        {label}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const QuickLinkCard = ({ title, description, to }) => (
  <Link to={to} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-blue-200 hover:bg-blue-50">
    <p className="font-semibold text-gray-900">{title}</p>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
  </Link>
);

const SectionTable = ({ title, description, columns, rows }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`} className="px-4 py-3 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                No rows available in this section yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default ProductWorkspace;
