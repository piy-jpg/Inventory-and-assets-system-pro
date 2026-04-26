import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CubeIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    general: {
      companyName: 'Smart Inventory System',
      logo: 'https://picsum.photos/seed/company-logo/200/200.jpg',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'America/New_York'
    },
    inventory: {
      defaultThreshold: 10,
      autoUpdate: true,
      unitTypes: ['pieces', 'kg', 'liters', 'meters', 'boxes', 'cartons'],
      lowStockAlert: true,
      outOfStockAlert: true
    },
    transactions: {
      defaultTax: 8.5,
      invoiceFormat: 'INV-YYYY-#####',
      enableDiscounts: true,
      maxDiscount: 20,
      requireApproval: false,
      approvalAmount: 1000
    },
    billing: {
      template: 'modern',
      includeCompanyDetails: true,
      digitalSignature: 'https://picsum.photos/seed/signature/200/100.jpg',
      paymentTerms: 'NET 30',
      taxId: '12-3456789',
      businessLicense: 'BL-2024-12345'
    },
    backup: {
      autoBackup: true,
      frequency: 'daily',
      retentionDays: 30,
      cloudStorage: true,
      localStorage: true
    }
  });

  const queryClient = useQueryClient();

  // Mock system settings data
  const { data: systemData, isLoading, refetch } = useQuery(
    'systemSettings',
    () => {
      const storedSettings = localStorage.getItem('systemSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return {
        general: {
          companyName: 'Smart Inventory System',
          logo: 'https://picsum.photos/seed/company-logo/200/200.jpg',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          timezone: 'America/New_York'
        },
        inventory: {
          defaultThreshold: 10,
          autoUpdate: true,
          unitTypes: ['pieces', 'kg', 'liters', 'meters', 'boxes', 'cartons'],
          lowStockAlert: true,
          outOfStockAlert: true
        },
        transactions: {
          defaultTax: 8.5,
          invoiceFormat: 'INV-YYYY-#####',
          enableDiscounts: true,
          maxDiscount: 20,
          requireApproval: false,
          approvalAmount: 1000
        },
        billing: {
          template: 'modern',
          includeCompanyDetails: true,
          digitalSignature: 'https://picsum.photos/seed/signature/200/100.jpg',
          paymentTerms: 'NET 30',
          taxId: '12-3456789',
          businessLicense: 'BL-2024-12345'
        },
        backup: {
          autoBackup: true,
          frequency: 'daily',
          retentionDays: 30,
          cloudStorage: true,
          localStorage: true
        },
        statistics: {
          totalProducts: 1247,
          totalTransactions: 5689,
          totalRevenue: 1250000,
          activeUsers: 15,
          systemUptime: '99.9%',
          lastBackup: '2024-04-23T02:00:00Z',
          storageUsed: '45.2 GB',
          storageAvailable: '454.8 GB'
        }
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        setFormData({
          general: data.general,
          inventory: data.inventory,
          transactions: data.transactions,
          billing: data.billing,
          backup: data.backup
        });
      }
    }
  );

  // System settings update mutation
  const updateSystemMutation = useMutation(
    async (settings) => {
      const updatedSettings = {
        ...systemData,
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };
      localStorage.setItem('systemSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('systemSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('System settings updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update system settings');
      }
    }
  );

  // Reset demo data mutation
  const resetDemoMutation = useMutation(
    async () => {
      // Simulate data reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const resetData = {
        products: [],
        transactions: [],
        customers: [],
        suppliers: [],
        resetAt: new Date().toISOString()
      };
      localStorage.setItem('demoData', JSON.stringify(resetData));
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Demo data reset successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to reset demo data');
      }
    }
  );

  const handleResetDemo = () => {
    if (window.confirm('Are you sure you want to reset all demo data? This action cannot be undone.')) {
      resetDemoMutation.mutate();
    }
  };

  const handleSaveSystem = () => {
    updateSystemMutation.mutate(formData);
  };

  const system = systemData || {};

  const handleInputChange = (section, field, value) => {
    const updatedData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(updatedData);
    updateSystemMutation.mutate(updatedData);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('general', 'logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('billing', 'digitalSignature', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUnitType = (newUnit) => {
    if (newUnit.trim() && !formData.inventory.unitTypes.includes(newUnit.trim())) {
      const updatedUnits = [...formData.inventory.unitTypes, newUnit.trim()];
      handleInputChange('inventory', 'unitTypes', updatedUnits);
    }
  };

  const handleRemoveUnitType = (unitToRemove) => {
    const updatedUnits = formData.inventory.unitTypes.filter(unit => unit !== unitToRemove);
    handleInputChange('inventory', 'unitTypes', updatedUnits);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'inventory', name: 'Inventory', icon: CubeIcon },
    { id: 'transactions', name: 'Transactions', icon: ReceiptPercentIcon },
    { id: 'billing', name: 'Billing', icon: DocumentTextIcon },
    { id: 'backup', name: 'Backup', icon: CloudArrowUpIcon }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2024)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2024)' }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'UTC'
  ];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">System Settings</h1>
            <p className="page-subtitle">Configure core system settings and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{system.statistics?.totalProducts || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CubeIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(system.statistics?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{system.statistics?.activeUsers || 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{system.statistics?.systemUptime || 'N/A'}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.general.companyName}
                      onChange={(e) => handleInputChange('general', 'companyName', e.target.value)}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={formData.general.currency}
                      onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                      className="input"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                    <select
                      value={formData.general.dateFormat}
                      onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
                      className="input"
                    >
                      {dateFormats.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                    <select
                      value={formData.general.timeFormat}
                      onChange={(e) => handleInputChange('general', 'timeFormat', e.target.value)}
                      className="input"
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={formData.general.timezone}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      className="input"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                  <div className="flex items-center space-x-4">
                    <img
                      src={formData.general.logo}
                      alt="Company Logo"
                      className="h-16 w-16 rounded-lg border border-gray-200"
                    />
                    <div>
                      <label className="btn btn-secondary btn-sm cursor-pointer">
                        <CameraIcon className="h-4 w-4 mr-2" />
                        Change Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Settings */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Inventory Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Stock Threshold</label>
                    <input
                      type="number"
                      value={formData.inventory.defaultThreshold}
                      onChange={(e) => handleInputChange('inventory', 'defaultThreshold', parseInt(e.target.value))}
                      className="input"
                      min="1"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto Stock Update</p>
                      <p className="text-sm text-gray-500">Automatically update stock levels</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inventory.autoUpdate}
                        onChange={(e) => handleInputChange('inventory', 'autoUpdate', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-500">Alert when stock is low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inventory.lowStockAlert}
                        onChange={(e) => handleInputChange('inventory', 'lowStockAlert', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Out of Stock Alerts</p>
                      <p className="text-sm text-gray-500">Alert when item is out of stock</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inventory.outOfStockAlert}
                        onChange={(e) => handleInputChange('inventory', 'outOfStockAlert', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Types</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.inventory.unitTypes.map((unit) => (
                      <span
                        key={unit}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                      >
                        {unit}
                        <button
                          onClick={() => handleRemoveUnitType(unit)}
                          className="ml-2 text-gray-500 hover:text-red-600"
                        >
                          <XCircleIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add new unit type"
                      className="input flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddUnitType(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleAddUnitType(input.value);
                        input.value = '';
                      }}
                      className="btn btn-primary"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Settings */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Transaction Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax (%)</label>
                    <input
                      type="number"
                      value={formData.transactions.defaultTax}
                      onChange={(e) => handleInputChange('transactions', 'defaultTax', parseFloat(e.target.value))}
                      className="input"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Format</label>
                    <input
                      type="text"
                      value={formData.transactions.invoiceFormat}
                      onChange={(e) => handleInputChange('transactions', 'invoiceFormat', e.target.value)}
                      className="input"
                      placeholder="INV-YYYY-#####"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Enable Discounts</p>
                      <p className="text-sm text-gray-500">Allow discounts on transactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.transactions.enableDiscounts}
                        onChange={(e) => handleInputChange('transactions', 'enableDiscounts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {formData.transactions.enableDiscounts && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (%)</label>
                      <input
                        type="number"
                        value={formData.transactions.maxDiscount}
                        onChange={(e) => handleInputChange('transactions', 'maxDiscount', parseInt(e.target.value))}
                        className="input"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Require Approval</p>
                      <p className="text-sm text-gray-500">Require approval for large transactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.transactions.requireApproval}
                        onChange={(e) => handleInputChange('transactions', 'requireApproval', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {formData.transactions.requireApproval && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Approval Amount</label>
                      <input
                        type="number"
                        value={formData.transactions.approvalAmount}
                        onChange={(e) => handleInputChange('transactions', 'approvalAmount', parseFloat(e.target.value))}
                        className="input"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing Settings */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Billing & Invoice Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Template</label>
                    <select
                      value={formData.billing.template}
                      onChange={(e) => handleInputChange('billing', 'template', e.target.value)}
                      className="input"
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <select
                      value={formData.billing.paymentTerms}
                      onChange={(e) => handleInputChange('billing', 'paymentTerms', e.target.value)}
                      className="input"
                    >
                      <option value="NET 15">NET 15</option>
                      <option value="NET 30">NET 30</option>
                      <option value="NET 45">NET 45</option>
                      <option value="NET 60">NET 60</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                    <input
                      type="text"
                      value={formData.billing.taxId}
                      onChange={(e) => handleInputChange('billing', 'taxId', e.target.value)}
                      className="input"
                      placeholder="12-3456789"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business License</label>
                    <input
                      type="text"
                      value={formData.billing.businessLicense}
                      onChange={(e) => handleInputChange('billing', 'businessLicense', e.target.value)}
                      className="input"
                      placeholder="BL-2024-12345"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Include Company Details</p>
                    <p className="text-sm text-gray-500">Show company information on invoices</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.billing.includeCompanyDetails}
                      onChange={(e) => handleInputChange('billing', 'includeCompanyDetails', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature</label>
                  <div className="flex items-center space-x-4">
                    <img
                      src={formData.billing.digitalSignature}
                      alt="Digital Signature"
                      className="h-12 w-32 rounded border border-gray-200"
                    />
                    <div>
                      <label className="btn btn-secondary btn-sm cursor-pointer">
                        <CameraIcon className="h-4 w-4 mr-2" />
                        Change Signature
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Recommended: 200x100px</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Backup & Data Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto Backup</p>
                      <p className="text-sm text-gray-500">Automatically backup system data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.backup.autoBackup}
                        onChange={(e) => handleInputChange('backup', 'autoBackup', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {formData.backup.autoBackup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                      <select
                        value={formData.backup.frequency}
                        onChange={(e) => handleInputChange('backup', 'frequency', e.target.value)}
                        className="input"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retention Days</label>
                    <input
                      type="number"
                      value={formData.backup.retentionDays}
                      onChange={(e) => handleInputChange('backup', 'retentionDays', parseInt(e.target.value))}
                      className="input"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cloud Storage</p>
                      <p className="text-sm text-gray-500">Store backups in cloud storage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.backup.cloudStorage}
                        onChange={(e) => handleInputChange('backup', 'cloudStorage', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Local Storage</p>
                      <p className="text-sm text-gray-500">Store backups locally</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.backup.localStorage}
                        onChange={(e) => handleInputChange('backup', 'localStorage', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Last Backup</p>
                      <p className="font-medium text-gray-900">
                        {system.statistics?.lastBackup ? new Date(system.statistics.lastBackup).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Storage Used</p>
                      <p className="font-medium text-gray-900">{system.statistics?.storageUsed || '0 GB'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Storage Available</p>
                      <p className="font-medium text-gray-900">{system.statistics?.storageAvailable || '0 GB'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Storage Total</p>
                      <p className="font-medium text-gray-900">500 GB</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Data Management</h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleResetDemo}
                      className="btn btn-danger flex items-center space-x-2"
                      disabled={resetDemoMutation.isLoading}
                    >
                      <TrashIcon className="h-4 w-4" />
                      {resetDemoMutation.isLoading ? 'Resetting...' : 'Reset Demo Data'}
                    </button>
                    <p className="text-sm text-gray-500">
                      This will reset all demo data including products, transactions, customers, and suppliers.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveSystem}
                className="btn btn-primary flex items-center space-x-2"
                disabled={updateSystemMutation.isLoading}
              >
                {updateSystemMutation.isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemSettings;
