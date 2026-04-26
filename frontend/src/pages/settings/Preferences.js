import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ViewColumnsIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  BellIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const Preferences = () => {
  const [formData, setFormData] = useState({
    defaultLandingPage: 'dashboard',
    tableView: 'grid',
    itemsPerPage: 25,
    autoRefresh: true,
    refreshInterval: 30,
    showTooltips: true,
    compactView: false,
    showSidebar: true,
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    decimalPlaces: 2,
    showQuickActions: true,
    showNotifications: true,
    showSystemInfo: false,
    enableSounds: true,
    enableAnimations: true,
    autoSave: true,
    autoSaveInterval: 5,
    enableKeyboardShortcuts: true,
    showKeyboardShortcuts: false,
    enableRightClick: true,
    enableDragDrop: true,
    showRowNumbers: true,
    showGridLines: true,
    enableVirtualScrolling: true,
    pageSizeOptions: [10, 25, 50, 100],
    defaultSort: 'name',
    defaultSortOrder: 'asc'
  });

  const queryClient = useQueryClient();

  // Mock preferences data
  const { data: preferencesData, isLoading, refetch } = useQuery(
    'userPreferences',
    () => {
      const storedPreferences = localStorage.getItem('userPreferences');
      if (storedPreferences) {
        return JSON.parse(storedPreferences);
      }
      
      return {
        defaultLandingPage: 'dashboard',
        tableView: 'grid',
        itemsPerPage: 25,
        autoRefresh: true,
        refreshInterval: 30,
        showTooltips: true,
        compactView: false,
        showSidebar: true,
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        decimalPlaces: 2,
        showQuickActions: true,
        showNotifications: true,
        showSystemInfo: false,
        enableSounds: true,
        enableAnimations: true,
        autoSave: true,
        autoSaveInterval: 5,
        enableKeyboardShortcuts: true,
        showKeyboardShortcuts: false,
        enableRightClick: true,
        enableDragDrop: true,
        showRowNumbers: true,
        showGridLines: true,
        enableVirtualScrolling: true,
        pageSizeOptions: [10, 25, 50, 100],
        defaultSort: 'name',
        defaultSortOrder: 'asc',
        sessionTimeout: 120,
        lastActivity: '2024-04-23T10:30:00Z',
        loginCount: 342,
        totalSessions: 156,
        avgSessionDuration: 45, // minutes
        preferredDevices: ['desktop', 'mobile'],
        lastUpdated: '2024-04-22T15:30:00Z'
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        setFormData({
          defaultLandingPage: data.defaultLandingPage,
          tableView: data.tableView,
          itemsPerPage: data.itemsPerPage,
          autoRefresh: data.autoRefresh,
          refreshInterval: data.refreshInterval,
          showTooltips: data.showTooltips,
          compactView: data.compactView,
          showSidebar: data.showSidebar,
          language: data.language,
          timezone: data.timezone,
          dateFormat: data.dateFormat,
          timeFormat: data.timeFormat,
          currency: data.currency,
          decimalPlaces: data.decimalPlaces,
          showQuickActions: data.showQuickActions,
          showNotifications: data.showNotifications,
          showSystemInfo: data.showSystemInfo,
          enableSounds: data.enableSounds,
          enableAnimations: data.enableAnimations,
          autoSave: data.autoSave,
          autoSaveInterval: data.autoSaveInterval,
          enableKeyboardShortcuts: data.enableKeyboardShortcuts,
          showKeyboardShortcuts: data.showKeyboardShortcuts,
          enableRightClick: data.enableRightClick,
          enableDragDrop: data.enableDragDrop,
          showRowNumbers: data.showRowNumbers,
          showGridLines: data.showGridLines,
          enableVirtualScrolling: data.enableVirtualScrolling,
          pageSizeOptions: data.pageSizeOptions,
          defaultSort: data.defaultSort,
          defaultSortOrder: data.defaultSortOrder
        });
      }
    }
  );

  // Preferences update mutation
  const updatePreferencesMutation = useMutation(
    async (preferences) => {
      const updatedPreferences = {
        ...preferencesData,
        ...preferences,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'user'
      };
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      queryClient.setQueryData('userPreferences', updatedPreferences);
      return updatedPreferences;
    },
    {
      onSuccess: () => {
        toast.success('Preferences updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update preferences');
      }
    }
  );

  const preferences = preferencesData || {};

  const handleToggle = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    updatePreferencesMutation.mutate(updatedData);
  };

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    updatePreferencesMutation.mutate(updatedData);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all preferences to defaults?')) {
      const defaultPreferences = {
        defaultLandingPage: 'dashboard',
        tableView: 'grid',
        itemsPerPage: 25,
        autoRefresh: true,
        refreshInterval: 30,
        showTooltips: true,
        compactView: false,
        showSidebar: true,
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        decimalPlaces: 2,
        showQuickActions: true,
        showNotifications: true,
        showSystemInfo: false,
        enableSounds: true,
        enableAnimations: true,
        autoSave: true,
        autoSaveInterval: 5,
        enableKeyboardShortcuts: true,
        showKeyboardShortcuts: false,
        enableRightClick: true,
        enableDragDrop: true,
        showRowNumbers: true,
        showGridLines: true,
        enableVirtualScrolling: true,
        pageSizeOptions: [10, 25, 50, 100],
        defaultSort: 'name',
        defaultSortOrder: 'asc'
      };
      setFormData(defaultPreferences);
      updatePreferencesMutation.mutate(defaultPreferences);
    }
  };

  const landingPages = [
    { value: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { value: 'products', label: 'Products', icon: ViewColumnsIcon },
    { value: 'customers', label: 'Customers', icon: UserGroupIcon },
    { value: 'transactions', label: 'Transactions', icon: DocumentTextIcon },
    { value: 'reports', label: 'Reports', icon: DocumentTextIcon }
  ];

  const tableViews = [
    { value: 'grid', label: 'Grid View', description: 'Card-based layout' },
    { value: 'list', label: 'List View', description: 'Table layout' },
    { value: 'kanban', label: 'Kanban View', description: 'Board layout' },
    { value: 'calendar', label: 'Calendar View', description: 'Date-based layout' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland',
    'UTC'
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2024)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2024)' }
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

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Preferences</h1>
            <p className="page-subtitle">Customize your user experience and interface behavior</p>
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
            <button
              onClick={handleResetToDefaults}
              className="btn btn-outline"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* General Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">General Preferences</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Landing Page</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {landingPages.map((page) => {
                    const Icon = page.icon;
                    return (
                      <div
                        key={page.value}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          formData.defaultLandingPage === page.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleToggle('defaultLandingPage', page.value)}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{page.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table View</label>
                <div className="grid grid-cols-2 gap-3">
                  {tableViews.map((view) => (
                    <div
                      key={view.value}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        formData.tableView === view.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggle('tableView', view.value)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{view.label}</p>
                        <p className="text-xs text-gray-500">{view.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
                  <select
                    value={formData.itemsPerPage}
                    onChange={(e) => handleInputChange('itemsPerPage', parseInt(e.target.value))}
                    className="input"
                  >
                    {formData.pageSizeOptions.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Size Options</label>
                  <div className="flex flex-wrap gap-2">
                    {[10, 25, 50, 100].map((size) => (
                      <label key={size} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.pageSizeOptions.includes(size)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.pageSizeOptions, size]
                              : formData.pageSizeOptions.filter(s => s !== size);
                            handleInputChange('pageSizeOptions', updated);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto Refresh</p>
                  <p className="text-sm text-gray-500">Automatically refresh data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoRefresh}
                    onChange={(e) => handleToggle('autoRefresh', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.autoRefresh && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval (seconds)</label>
                  <input
                    type="number"
                    value={formData.refreshInterval}
                    onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value))}
                    className="input"
                    min="10"
                    max="300"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Sort</label>
                  <select
                    value={formData.defaultSort}
                    onChange={(e) => handleInputChange('defaultSort', e.target.value)}
                    className="input"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="created">Created</option>
                    <option value="modified">Modified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <select
                    value={formData.defaultSortOrder}
                    onChange={(e) => handleInputChange('defaultSortOrder', e.target.value)}
                    className="input"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Display Preferences</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="input"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="input"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select
                    value={formData.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    className="input"
                  >
                    {dateFormats.map((format) => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                  <select
                    value={formData.timeFormat}
                    onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                    className="input"
                  >
                    <option value="12h">12-hour (AM/PM)</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
                  <select
                    value={formData.decimalPlaces}
                    onChange={(e) => handleInputChange('decimalPlaces', parseInt(e.target.value))}
                    className="input"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Tooltips</p>
                    <p className="text-sm text-gray-500">Display helpful tooltips</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showTooltips}
                      onChange={(e) => handleToggle('showTooltips', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Compact View</p>
                    <p className="text-sm text-gray-500">Use compact layout</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.compactView}
                      onChange={(e) => handleToggle('compactView', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Sidebar</p>
                    <p className="text-sm text-gray-500">Display navigation sidebar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showSidebar}
                      onChange={(e) => handleToggle('showSidebar', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Interface Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Interface Preferences</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Quick Actions</p>
                    <p className="text-sm text-gray-500">Display quick action buttons</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showQuickActions}
                      onChange={(e) => handleToggle('showQuickActions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Notifications</p>
                    <p className="text-sm text-gray-500">Display system notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showNotifications}
                      onChange={(e) => handleToggle('showNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show System Info</p>
                    <p className="text-sm text-gray-500">Display system information</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showSystemInfo}
                      onChange={(e) => handleToggle('showSystemInfo', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable Sounds</p>
                    <p className="text-sm text-gray-500">Play notification sounds</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableSounds}
                      onChange={(e) => handleToggle('enableSounds', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable Animations</p>
                    <p className="text-sm text-gray-500">Use interface animations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableAnimations}
                      onChange={(e) => handleToggle('enableAnimations', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable Keyboard Shortcuts</p>
                    <p className="text-sm text-gray-500">Use keyboard shortcuts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableKeyboardShortcuts}
                      onChange={(e) => handleToggle('enableKeyboardShortcuts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto Save</p>
                    <p className="text-sm text-gray-500">Automatically save work</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoSave}
                      onChange={(e) => handleToggle('autoSave', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.autoSave && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auto Save Interval (minutes)</label>
                    <input
                      type="number"
                      value={formData.autoSaveInterval}
                      onChange={(e) => handleInputChange('autoSaveInterval', parseInt(e.target.value))}
                      className="input"
                      min="1"
                      max="30"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Row Numbers</p>
                    <p className="text-sm text-gray-500">Display row numbers in tables</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showRowNumbers}
                      onChange={(e) => handleToggle('showRowNumbers', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Grid Lines</p>
                    <p className="text-sm text-gray-500">Display grid lines in tables</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showGridLines}
                      onChange={(e) => handleToggle('showGridLines', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable Virtual Scrolling</p>
                    <p className="text-sm text-gray-500">Use virtual scrolling for large datasets</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableVirtualScrolling}
                      onChange={(e) => handleToggle('enableVirtualScrolling', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Session Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Login Count</span>
                <span className="text-sm font-medium text-gray-900">{preferences.loginCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="text-sm font-medium text-gray-900">{preferences.totalSessions || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Session Duration</span>
                <span className="text-sm font-medium text-gray-900">{preferences.avgSessionDuration || 0} min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Session Timeout</span>
                <span className="text-sm font-medium text-gray-900">{preferences.sessionTimeout || 120} min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm font-medium text-gray-900">
                  {preferences.lastActivity ? new Date(preferences.lastActivity).toLocaleString() : 'Never'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {preferences.lastUpdated ? new Date(preferences.lastUpdated).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Landing Page</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {formData.defaultLandingPage}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Table View</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {formData.tableView}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Items Per Page</span>
                <span className="text-sm font-medium text-gray-900">{formData.itemsPerPage}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Language</span>
                <span className="text-sm font-medium text-gray-900">
                  {languages.find(l => l.code === formData.language)?.name || formData.language}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Refresh</span>
                <span className={`text-sm font-medium ${
                  formData.autoRefresh ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.autoRefresh ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Animations</span>
                <span className={`text-sm font-medium ${
                  formData.enableAnimations ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.enableAnimations ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Cog6ToothIcon className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Your preferences are automatically saved and applied across all your sessions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Preferences;
