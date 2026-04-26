import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define comprehensive theme configurations
const themes = {
  skyblue: {
    name: 'Sky Blue',
    colors: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#3730A3',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: '#0F172A',
      textSecondary: '#334155',
      border: '#CBD5E1',
      error: '#DC2626',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(15, 23, 42, 0.1)',
      md: '0 4px 6px -1px rgba(15, 23, 42, 0.15), 0 2px 4px -1px rgba(15, 23, 42, 0.1)',
      lg: '0 10px 15px -3px rgba(15, 23, 42, 0.15), 0 4px 6px -2px rgba(15, 23, 42, 0.1)'
    }
  },
  green: {
    name: 'Forest Green',
    colors: {
      primary: '#047857',
      secondary: '#059669',
      accent: '#065F46',
      background: '#F0FDF4',
      surface: '#DCFCE7',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#BBF7D0',
      error: '#DC2626',
      warning: '#D97706',
      success: '#059669',
      info: '#0284C7'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(4, 120, 87, 0.1)',
      md: '0 4px 6px -1px rgba(4, 120, 87, 0.15), 0 2px 4px -1px rgba(4, 120, 87, 0.1)',
      lg: '0 10px 15px -3px rgba(4, 120, 87, 0.15), 0 4px 6px -2px rgba(4, 120, 87, 0.1)'
    }
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#7C3AED',
      background: '#0F0F23',
      surface: '#1A1A2E',
      text: '#E9D5FF',
      textSecondary: '#C4B5FD',
      border: '#6B21A8',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(139, 92, 246, 0.25)',
      md: '0 4px 6px -1px rgba(139, 92, 246, 0.35), 0 2px 4px -1px rgba(139, 92, 246, 0.25)',
      lg: '0 10px 15px -3px rgba(139, 92, 246, 0.35), 0 4px 6px -2px rgba(139, 92, 246, 0.25)'
    }
  },
  sunset: {
    name: 'Sunset Orange',
    colors: {
      primary: '#EA580C',
      secondary: '#F97316',
      accent: '#DC2626',
      background: '#FFF7ED',
      surface: '#FED7AA',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FFEDD5',
      error: '#DC2626',
      warning: '#EA580C',
      success: '#059669',
      info: '#0284C7'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(234, 88, 12, 0.1)',
      md: '0 4px 6px -1px rgba(234, 88, 12, 0.15), 0 2px 4px -1px rgba(234, 88, 12, 0.1)',
      lg: '0 10px 15px -3px rgba(234, 88, 12, 0.15), 0 4px 6px -2px rgba(234, 88, 12, 0.1)'
    }
  },
  midnight: {
    name: 'Midnight Dark',
    colors: {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#4F46E5',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: '#334155',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(99, 102, 241, 0.2)',
      md: '0 4px 6px -1px rgba(99, 102, 241, 0.3), 0 2px 4px -1px rgba(99, 102, 241, 0.2)',
      lg: '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)'
    }
  }
};

// Theme context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('skyblue');
  const [customTheme, setCustomTheme] = useState(null);
  const [systemPreference, setSystemPreference] = useState('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    // Set initial preference
    handleChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedCustomTheme = localStorage.getItem('customTheme');
    
    if (savedTheme) {
      // Validate that the saved theme still exists
      if (themes[savedTheme] || savedTheme === 'system') {
        setCurrentTheme(savedTheme);
      } else {
        // Fallback to skyblue if saved theme no longer exists
        setCurrentTheme('skyblue');
        localStorage.setItem('selectedTheme', 'skyblue');
      }
    }
    
    if (savedCustomTheme) {
      try {
        setCustomTheme(JSON.parse(savedCustomTheme));
      } catch (error) {
        console.error('Error parsing custom theme:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const theme = customTheme || themes[currentTheme] || themes.skyblue;
    
    console.log('Applying theme:', currentTheme, theme.name);
    
    // Special logging for Royal Purple theme
    if (currentTheme === 'purple') {
      console.log('Royal Purple theme being applied with colors:', theme.colors);
    }
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
      if (currentTheme === 'purple') {
        console.log(`Royal Purple --color-${key}: ${value}`);
      }
    });
    
    // Apply dark class for Tailwind dark mode
    const isDarkTheme = currentTheme === 'midnight';
    document.documentElement.classList.toggle('dark', isDarkTheme);
    console.log('Dark mode:', isDarkTheme);
    
    // Store current theme
    localStorage.setItem('selectedTheme', currentTheme);
    
    // Enhanced stability for Royal Purple theme
    if (currentTheme === 'purple') {
      setTimeout(() => {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
        const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-background');
        const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
        const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border');
        
        console.log('Royal Purple enhanced verification - All colors:');
        console.log('Primary:', primaryColor.trim());
        console.log('Background:', backgroundColor.trim());
        console.log('Surface:', surfaceColor.trim());
        console.log('Text:', textColor.trim());
        console.log('Border:', borderColor.trim());
        
        // Verify all colors are purple-themed with updated values
        const isPurplePrimary = primaryColor.trim().includes('7C3AED');
        const isPurpleBackground = backgroundColor.trim().includes('FBF7FF');
        const isPurpleSurface = surfaceColor.trim().includes('F5F0FF');
        const isPurpleText = textColor.trim().includes('4C1D95');
        
        if (isPurplePrimary && isPurpleBackground && isPurpleSurface && isPurpleText) {
          console.log('✅ Royal Purple theme is fully stable with enhanced purple colors!');
          
          // Apply additional stability enhancements
          document.documentElement.style.setProperty('--theme-stability', 'purple-enhanced');
        } else {
          console.log('❌ Royal Purple theme colors not properly applied - reapplying...');
          // Force reapplication for stability
          Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
          });
        }
      }, 100);
    }
  }, [currentTheme, customTheme]);

  const setTheme = useCallback((themeName) => {
    if (themeName === 'system') {
      setCurrentTheme(systemPreference);
    } else {
      setCurrentTheme(themeName);
    }
  }, [systemPreference]);

  const setCustomThemeColors = useCallback((colors) => {
    const newCustomTheme = {
      name: 'Custom',
      colors,
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    };
    setCustomTheme(newCustomTheme);
    localStorage.setItem('customTheme', JSON.stringify(newCustomTheme));
  }, []);

  const resetToDefaults = useCallback(() => {
    setCurrentTheme('skyblue');
    setCustomTheme(null);
    localStorage.removeItem('customTheme');
  }, []);

  const value = {
    currentTheme,
    themes,
    customTheme,
    systemPreference,
    setTheme,
    setCustomThemeColors,
    resetToDefaults,
    isDarkMode: currentTheme === 'midnight'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
