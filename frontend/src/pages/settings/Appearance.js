import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  MoonIcon,
  SwatchIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';

const Appearance = () => {
  const { currentTheme, themes, setTheme, setCustomThemeColors, resetToDefaults, systemPreference } = useTheme();
  const [showCustomColorEditor, setShowCustomColorEditor] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(null);
  const [customColors, setCustomColors] = useState({
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB'
  });

  const [formData, setFormData] = useState({
    layout: 'comfortable',
    fontSize: 'medium',
    sidebarCollapsed: false,
    showNotifications: true,
    compactMode: false,
    highContrast: false,
    animationsEnabled: true
  });

  const queryClient = useQueryClient();

  const applyRealTimeChanges = (field, value) => {
    const root = document.documentElement;
    const body = document.body;
    
    switch (field) {
      case 'layout':
        // Apply layout changes immediately
        if (value === 'compact') {
          root.style.setProperty('--layout-spacing', '0.25rem');
          root.style.setProperty('--layout-padding', '0.5rem');
          root.style.setProperty('--component-gap', '0.5rem');
        } else if (value === 'spacious') {
          root.style.setProperty('--layout-spacing', '1.5rem');
          root.style.setProperty('--layout-padding', '2rem');
          root.style.setProperty('--component-gap', '1.5rem');
        } else {
          root.style.setProperty('--layout-spacing', '1rem');
          root.style.setProperty('--layout-padding', '1rem');
          root.style.setProperty('--component-gap', '1rem');
        }
        break;
        
      case 'fontSize':
        // Apply font size changes immediately
        const fontSizeMap = {
          'small': '14px',
          'medium': '16px',
          'large': '18px',
          'xlarge': '20px'
        };
        const fontSize = fontSizeMap[value] || '16px';
        root.style.setProperty('--font-size-base', fontSize);
        
        // Update root font size for rem calculations
        root.style.fontSize = fontSize;
        break;
        
      case 'animationsEnabled':
        // Apply animation changes immediately
        if (value) {
          root.style.setProperty('--animation-duration', '0.3s');
          root.style.setProperty('--transition-duration', '0.2s');
          root.style.setProperty('--transition-timing', 'ease');
          body.classList.remove('no-animations');
        } else {
          root.style.setProperty('--animation-duration', '0s');
          root.style.setProperty('--transition-duration', '0s');
          root.style.setProperty('--transition-timing', 'linear');
          body.classList.add('no-animations');
        }
        break;
        
      case 'highContrast':
        // Apply high contrast changes immediately
        if (value) {
          root.style.setProperty('--contrast-filter', 'contrast(1.2)');
          root.style.setProperty('--brightness-filter', 'brightness(1.1)');
          body.classList.add('high-contrast');
        } else {
          root.style.setProperty('--contrast-filter', 'contrast(1)');
          root.style.setProperty('--brightness-filter', 'brightness(1)');
          body.classList.remove('high-contrast');
        }
        break;
        
      case 'compactMode':
        // Apply compact mode changes immediately
        if (value) {
          root.style.setProperty('--compact-spacing', '0.25rem');
          root.style.setProperty('--compact-padding', '0.375rem');
          root.style.setProperty('--compact-font-size', '0.875em');
          body.classList.add('compact-mode');
        } else {
          root.style.setProperty('--compact-spacing', 'var(--layout-spacing, 1rem)');
          root.style.setProperty('--compact-padding', 'var(--layout-padding, 1rem)');
          root.style.setProperty('--compact-font-size', '1em');
          body.classList.remove('compact-mode');
        }
        break;
        
      case 'primary':
        // Apply primary color changes immediately
        root.style.setProperty('--color-primary', value);
        break;
        
      case 'secondary':
        // Apply secondary color changes immediately
        root.style.setProperty('--color-secondary', value);
        break;
        
      case 'showCustomEditor':
        // Toggle custom theme editor
        setShowCustomColorEditor(value);
        break;
        
      default:
        break;
    }
    
    // Store real-time settings
    const currentSettings = { ...formData, [field]: value };
    localStorage.setItem('realTimeAppearance', JSON.stringify(currentSettings));
    
    // Apply global styles
    applyGlobalStyles(currentSettings);
  };

  const applyGlobalStyles = (settings) => {
    const root = document.documentElement;
    
    // Apply combined styles
    let filterString = '';
    if (settings.highContrast) {
      filterString += ' contrast(1.2) brightness(1.1)';
    }
    root.style.setProperty('--global-filter', filterString || 'none');
    
    // Update body classes
    const body = document.body;
    body.className = body.className.replace(/\b(no-animations|high-contrast|compact-mode)\b/g, '').trim();
    
    if (!settings.animationsEnabled) body.classList.add('no-animations');
    if (settings.highContrast) body.classList.add('high-contrast');
    if (settings.compactMode) body.classList.add('compact-mode');
  };

  // Load and apply real-time settings on mount
  useEffect(() => {
    const storedRealTimeSettings = localStorage.getItem('realTimeAppearance');
    if (storedRealTimeSettings) {
      const realTimeSettings = JSON.parse(storedRealTimeSettings);
      
      // Apply all real-time settings
      Object.entries(realTimeSettings).forEach(([field, value]) => {
        applyRealTimeChanges(field, value);
      });
      
      // Update form data with real-time settings
      setFormData(prev => ({ ...prev, ...realTimeSettings }));
    }
  }, []);

  // Mock appearance settings data
  const { data: appearanceData, isLoading, refetch } = useQuery(
    'appearanceSettings',
    () => {
      const storedSettings = localStorage.getItem('appearanceSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return {
        layout: 'comfortable',
        fontSize: 'medium',
        sidebarCollapsed: false,
        showNotifications: true,
        compactMode: false,
        highContrast: false,
        animationsEnabled: true,
        preview: {
          currentLayout: 'comfortable',
          currentFontSize: 'medium'
        }
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        setFormData({
          layout: data.layout,
          fontSize: data.fontSize,
          sidebarCollapsed: data.sidebarCollapsed,
          showNotifications: data.showNotifications,
          compactMode: data.compactMode,
          highContrast: data.highContrast,
          animationsEnabled: data.animationsEnabled
        });
      }
    }
  );

  // Appearance settings update mutation
  const updateAppearanceMutation = useMutation(
    async (settings) => {
      const updatedSettings = {
        ...appearanceData,
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: 'user'
      };
      localStorage.setItem('appearanceSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('appearanceSettings', updatedSettings);
      
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('Appearance settings updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update appearance settings');
      }
    }
  );

  const appearance = appearanceData || {};

  const handleToggle = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    updateAppearanceMutation.mutate(updatedData);
    
    // Apply real-time changes
    applyRealTimeChanges(field, value);
  };

  const handleThemeChange = (themeName) => {
    console.log('Theme change requested:', themeName);
    console.log('Available themes:', Object.keys(themes));
    
    // Special testing for Royal Purple theme
    if (themeName === 'purple') {
      console.log('Royal Purple theme selected');
      console.log('Royal Purple theme colors:', themes.purple.colors);
    }
    
    // Validate theme exists
    if (themeName === 'system' || themes[themeName]) {
      console.log('Theme is valid, applying:', themeName);
      setTheme(themeName);
      const themeDisplayName = themeName === 'system' ? 'System' : themes[themeName]?.name || themeName;
      toast.success(`Theme changed to ${themeDisplayName}`);
      
      // Test function to verify Royal Purple theme
      const testRoyalPurpleTheme = () => {
        console.log('Testing Royal Purple theme...');
        handleThemeChange('purple');
        setTimeout(() => {
          const root = document.documentElement;
          const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
          const backgroundColor = getComputedStyle(root).getPropertyValue('--color-background');
          const textColor = getComputedStyle(root).getPropertyValue('--color-text');
          
          console.log('Royal Purple Test Results:');
          console.log('Primary Color:', primaryColor.trim());
          console.log('Background Color:', backgroundColor.trim());
          console.log('Text Color:', textColor.trim());
          
          // Verify the colors match the Royal Purple theme
          const expectedPrimary = '#7C3AED';
          const expectedBackground = '#FAF5FF';
          const expectedText = '#4C1D95';
          
          if (primaryColor.trim() === expectedPrimary && 
              backgroundColor.trim() === expectedBackground && 
              textColor.trim() === expectedText) {
            console.log(' Royal Purple theme is working correctly!');
            toast.success('Royal Purple theme verified!');
          } else {
            console.log(' Royal Purple theme has issues');
            toast.error('Royal Purple theme verification failed');
          }
        }, 300);
      };

      // Special verification for Royal Purple
      if (themeName === 'purple') {
        setTimeout(() => {
          console.log('Royal Purple theme verification:');
          console.log('Primary color:', getComputedStyle(document.documentElement).getPropertyValue('--color-primary'));
          console.log('Background color:', getComputedStyle(document.documentElement).getPropertyValue('--color-background'));
          console.log('Text color:', getComputedStyle(document.documentElement).getPropertyValue('--color-text'));
        }, 200);
      }
      
      // Force a re-render to ensure theme applies
      setTimeout(() => {
        console.log('Theme applied, current theme:', themeName);
      }, 100);
    } else {
      console.error('Theme not found:', themeName);
      toast.error('Theme not found');
    }
  };

  // Test function to verify Royal Purple theme
  const testRoyalPurpleTheme = () => {
    console.log('Testing Royal Purple theme...');
    handleThemeChange('purple');
    setTimeout(() => {
      const root = document.documentElement;
      const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
      const backgroundColor = getComputedStyle(root).getPropertyValue('--color-background');
      const textColor = getComputedStyle(root).getPropertyValue('--color-text');
      
      console.log('Royal Purple Test Results:');
      console.log('Primary Color:', primaryColor.trim());
      console.log('Background Color:', backgroundColor.trim());
      console.log('Text Color:', textColor.trim());
      
      // Verify the colors match the Royal Purple theme
      const expectedPrimary = '#7C3AED';
      const expectedBackground = '#FAF5FF';
      const expectedText = '#4C1D95';
      
      if (primaryColor.trim() === expectedPrimary && 
          backgroundColor.trim() === expectedBackground && 
          textColor.trim() === expectedText) {
        console.log('✅ Royal Purple theme is working correctly!');
        toast.success('Royal Purple theme verified!');
      } else {
        console.log('❌ Royal Purple theme has issues');
        toast.error('Royal Purple theme verification failed');
      }
    }, 300);
  };

  const handleCustomColorChange = (colorType, color) => {
    const updatedColors = { ...customColors, [colorType]: color };
    setCustomColors(updatedColors);
  };

  const applyCustomTheme = () => {
    setCustomThemeColors(customColors);
    setShowCustomColorEditor(false);
    toast.success('Custom theme applied successfully');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all appearance settings to defaults?')) {
      resetToDefaults();
      const defaultSettings = {
        layout: 'comfortable',
        fontSize: 'medium',
        sidebarCollapsed: false,
        showNotifications: true,
        compactMode: false,
        highContrast: false,
        animationsEnabled: true
      };
      setFormData(defaultSettings);
      updateAppearanceMutation.mutate(defaultSettings);
    }
  };

  const handleColorChange = (colorType, color) => {
    const updatedColors = { ...customColors, [colorType]: color };
    setCustomColors(updatedColors);
  };

  const themeColors = [
    { name: 'Blue', value: 'blue', primary: '#3B82F6', secondary: '#1E40AF' },
    { name: 'Green', value: 'green', primary: '#10B981', secondary: '#047857' },
    { name: 'Purple', value: 'purple', primary: '#8B5CF6', secondary: '#6D28D9' },
    { name: 'Red', value: 'red', primary: '#EF4444', secondary: '#B91C1C' },
    { name: 'Orange', value: 'orange', primary: '#F97316', secondary: '#EA580C' },
    { name: 'Pink', value: 'pink', primary: '#EC4899', secondary: '#BE185D' },
    { name: 'Indigo', value: 'indigo', primary: '#6366F1', secondary: '#4F46E5' },
    { name: 'Teal', value: 'teal', primary: '#14B8A6', secondary: '#0F766E' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
    { value: 'xlarge', label: 'Extra Large', size: '20px' }
  ];

  const layoutOptions = [
    { value: 'compact', label: 'Compact', description: 'Dense layout with minimal spacing' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing and layout' },
    { value: 'spacious', label: 'Spacious', description: 'Extra spacing and roomy layout' }
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
            <h1 className="page-title">Appearance</h1>
            <p className="page-subtitle">Customize your interface appearance and preferences</p>
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
        {/* Theme Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Theme Selection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(themes).map(([themeKey, theme]) => (
                <div
                  key={themeKey}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    currentTheme === themeKey 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleThemeChange(themeKey)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{theme.name}</h4>
                    {currentTheme === themeKey && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div 
                    className="border border-gray-200 dark:border-gray-600 rounded p-2"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    <div 
                      className="h-2 rounded mb-1"
                      style={{ backgroundColor: theme.colors.textSecondary }}
                    ></div>
                    <div 
                      className="h-2 rounded w-3/4"
                      style={{ backgroundColor: theme.colors.border }}
                    ></div>
                  </div>
                </div>
              ))}

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  currentTheme === 'system' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleThemeChange('system')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">System</h4>
                  {currentTheme === 'system' && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="bg-gradient-to-r from-white to-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2">
                  <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-600 rounded mb-1"></div>
                  <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Animations</p>
                <p className="text-sm text-gray-500">Enable interface animations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.animationsEnabled}
                  onChange={(e) => handleToggle('animationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">High Contrast</p>
                <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.highContrast}
                  onChange={(e) => handleToggle('highContrast', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Custom Theme Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Theme</h3>
              <button
                onClick={() => setShowCustomColorEditor(!showCustomColorEditor)}
                className="btn btn-outline flex items-center space-x-2"
              >
                <PaintBrushIcon className="h-4 w-4" />
                <span>{showCustomColorEditor ? 'Hide' : 'Show'} Editor</span>
              </button>
            </div>

            {showCustomColorEditor && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(customColors).map(([colorType, color]) => (
                    <div key={colorType}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {colorType.charAt(0).toUpperCase() + colorType.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleCustomColorChange(colorType, e.target.value)}
                          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => handleCustomColorChange(colorType, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={applyCustomTheme}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>Apply Custom Theme</span>
                  </button>
                  <button
                    onClick={() => setCustomColors({
                      primary: '#3B82F6',
                      secondary: '#10B981',
                      accent: '#F59E0B',
                      background: '#FFFFFF',
                      surface: '#F3F4F6',
                      text: '#111827',
                      textSecondary: '#6B7280',
                      border: '#E5E7EB'
                    })}
                    className="btn btn-outline"
                  >
                    Reset Colors
                  </button>
                </div>
              </div>
            )}
          </div>

          
          {/* Layout Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Layout Options</h3>
            
            <div className="space-y-4">
              {layoutOptions.map((option) => (
                <div
                  key={option.value}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.layout === option.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleToggle('layout', option.value)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{option.label}</h4>
                    {formData.layout === option.value && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reduce spacing for more content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.compactMode}
                  onChange={(e) => handleToggle('compactMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Font Size */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Font Size</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fontSizes.map((size) => (
                <div
                  key={size.value}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.fontSize === size.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggle('fontSize', size.value)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{size.label}</h4>
                    {formData.fontSize === size.value && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{size.size}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            
            <div className={`border rounded-lg p-4 ${
              currentTheme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Sample Header
                  </h4>
                  <div className={`w-2 h-2 rounded-full ${
                    currentTheme === 'dark' ? 'bg-gray-400' : 'bg-gray-300'
                  }`}></div>
                </div>
                
                <div className={`h-2 rounded ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                
                <div className={`h-2 rounded w-3/4 ${
                  currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}></div>
                
                <div className={`p-3 rounded ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Sample content with current theme settings
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 rounded text-sm ${
                      currentTheme === 'dark' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}
                    style={{ backgroundColor: customColors.primary }}
                  >
                    Primary
                  </button>
                  <button 
                    className={`px-3 py-1 rounded text-sm ${
                      currentTheme === 'dark' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-500 text-white'
                    }`}
                    style={{ backgroundColor: customColors.secondary }}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Theme</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {currentTheme}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Layout</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {formData.layout}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Font Size</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {formData.fontSize}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Animations</span>
                <span className={`text-sm font-medium ${
                  formData.animationsEnabled ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.animationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Changes are applied immediately and saved automatically
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Appearance;
