import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  BuildingOffice2Icon,
  CubeIcon,
  DocumentTextIcon,
  PrinterIcon,
  SparklesIcon,
  Squares2X2Icon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import {
  inventoryAPI,
  metadataAPI,
  suppliersAPI,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [priceForm, setPriceForm] = useState({
    category: '',
    costMultiplier: 1,
    sellingMultiplier: 1,
  });
  const [csvText, setCsvText] = useState('');
  const [stockCsvText, setStockCsvText] = useState('');
  const [variationForm, setVariationForm] = useState({
    productId: '',
    productName: '',
    variationName: '',
    skuSuffix: '',
    priceDelta: 0,
    status: 'active',
  });
  const [priceGroupForm, setPriceGroupForm] = useState({
    name: '',
    description: '',
    markup: 10,
    categories: '',
  });

  const [variations, setVariations] = useState(() => readStorage(VARIATIONS_KEY));
  const [priceGroups, setPriceGroups] = useState(() => readStorage(PRICE_GROUPS_KEY));

  const { data: inventoryData, isLoading } = useQuery(
    ['product-tools-inventory'],
    () => inventoryAPI.getAll({ limit: 200, sortBy: 'name', sortOrder: 'asc' })
  );
  const { data: categoriesData } = useQuery('product-tool-categories', metadataAPI.getCategories);
  const { data: suppliersData } = useQuery('product-tool-suppliers', () => suppliersAPI.getAll({ limit: 200 }));
  const { data: unitsData } = useQuery('product-tool-units', metadataAPI.getUnits);

  const inventory = inventoryData?.data?.data?.inventory || [];
  const categories = categoriesData?.data?.data?.categories || [];
  const suppliers = suppliersData?.data?.data?.suppliers || [];
  const units = unitsData?.data?.data?.units || [];

  const updateMutation = useMutation(({ id, data }) => inventoryAPI.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('product-tools-inventory');
      queryClient.invalidateQueries('inventory');
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

  const selectedProducts = inventory.filter((item) => selectedIds.includes(item._id));

  const importPreview = useMemo(() => parseCsv(csvText), [csvText]);
  const stockPreview = useMemo(() => parseCsv(stockCsvText), [stockCsvText]);

  const applyBulkPriceUpdate = async () => {
    const targets = inventory.filter((item) => !priceForm.category || item.category === priceForm.category);
    if (!targets.length) {
      toast.error('No products matched this price update.');
      return;
    }

    await Promise.all(
      targets.map((item) =>
        updateMutation.mutateAsync({
          id: item._id,
          data: {
            ...item,
            price: {
              ...item.price,
              cost: Number((item.price.cost * Number(priceForm.costMultiplier)).toFixed(2)),
              selling: Number((item.price.selling * Number(priceForm.sellingMultiplier)).toFixed(2)),
            },
          },
        })
      )
    );

    toast.success(`Updated prices for ${targets.length} products.`);
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
    const next = [
      {
        id: `${Date.now()}`,
        ...variationForm,
        priceDelta: Number(variationForm.priceDelta || 0),
      },
      ...variations,
    ];
    setVariations(next);
    writeStorage(VARIATIONS_KEY, next);
    setVariationForm({
      productId: '',
      productName: '',
      variationName: '',
      skuSuffix: '',
      priceDelta: 0,
      status: 'active',
    });
    toast.success('Variation saved.');
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
    window.print();
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const { title, subtitle, icon: HeaderIcon } = toolsMeta[section];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <HeaderIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
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
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Cost Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={priceForm.costMultiplier}
                      onChange={(e) => setPriceForm((prev) => ({ ...prev, costMultiplier: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Selling Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={priceForm.sellingMultiplier}
                      onChange={(e) => setPriceForm((prev) => ({ ...prev, sellingMultiplier: e.target.value }))}
                    />
                  </div>
                  <button onClick={applyBulkPriceUpdate} className="btn btn-primary w-full">
                    Apply Price Update
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="Catalog Pricing" subtitle="Current cost and selling prices">
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
                      {inventory.slice(0, 50).map((item) => (
                        <tr key={item._id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">${item.price.cost}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">${item.price.selling}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'labels' && (
            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
              <SectionCard title="Select Products" subtitle="Pick products for label printing">
                <div className="space-y-2 max-h-[520px] overflow-y-auto">
                  {inventory.slice(0, 80).map((item) => (
                    <label key={item._id} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSelection(item._id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.sku || 'No SKU'} • ${item.price.selling}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button onClick={printLabels} className="btn btn-primary w-full mt-4">
                  Print Selected Labels
                </button>
              </SectionCard>

              <SectionCard title="Label Preview" subtitle="Printable shelf / barcode labels">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-3">
                  {selectedProducts.map((item) => (
                    <div key={item._id} className="rounded-xl border border-dashed border-gray-300 p-4 bg-white">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{item.category}</p>
                      <h4 className="mt-2 font-bold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">SKU: {item.sku || 'N/A'}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-3">${item.price.selling}</p>
                      <div className="mt-4 h-12 rounded bg-gray-100 flex items-center justify-center text-xs tracking-[0.3em] text-gray-600">
                        ||||| || |||||
                      </div>
                    </div>
                  ))}
                  {!selectedProducts.length && (
                    <p className="text-sm text-gray-500">Select products on the left to preview labels.</p>
                  )}
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'variations' && (
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
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
                      {inventory.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
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

              <SectionCard title="Variation Library" subtitle="Saved variants for reuse">
                <div className="space-y-3">
                  {variations.map((variation) => (
                    <div key={variation.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{variation.productName} • {variation.variationName}</p>
                        <p className="text-sm text-gray-500">{variation.skuSuffix} • ${variation.priceDelta} delta</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        {variation.status}
                      </span>
                    </div>
                  ))}
                  {!variations.length && <p className="text-sm text-gray-500">No variations saved yet.</p>}
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

          <SectionCard title="Reference Data" subtitle="Inventory, suppliers, and metadata used by these tools">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-blue-50 p-4">
                <CubeIcon className="h-6 w-6 text-blue-700 mb-2" />
                <p className="text-sm text-blue-800">Products</p>
                <p className="text-2xl font-bold text-blue-900">{inventory.length}</p>
              </div>
              <div className="rounded-xl bg-green-50 p-4">
                <BuildingOffice2Icon className="h-6 w-6 text-green-700 mb-2" />
                <p className="text-sm text-green-800">Suppliers</p>
                <p className="text-2xl font-bold text-green-900">{suppliers.length}</p>
              </div>
              <div className="rounded-xl bg-orange-50 p-4">
                <DocumentTextIcon className="h-6 w-6 text-orange-700 mb-2" />
                <p className="text-sm text-orange-800">Units</p>
                <p className="text-2xl font-bold text-orange-900">{units.length}</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-4">
                <ArrowDownTrayIcon className="h-6 w-6 text-purple-700 mb-2" />
                <p className="text-sm text-purple-800">Categories</p>
                <p className="text-2xl font-bold text-purple-900">{categories.length}</p>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default ProductTools;
