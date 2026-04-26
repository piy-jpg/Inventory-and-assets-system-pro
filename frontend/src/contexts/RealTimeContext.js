// Real-time Context - Global real-time state management for all pages
import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

// Real-time state reducer
const realTimeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
        isConnected: action.payload === 'connected',
        isPolling: action.payload === 'polling'
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications.slice(-9), action.payload].slice(-10)
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    
    case 'UPDATE_GLOBAL_STATS':
      return {
        ...state,
        globalStats: {
          ...state.globalStats,
          ...action.payload
        },
        lastUpdates: {
          ...state.lastUpdates,
          [action.source]: new Date()
        }
      };
    
    case 'SET_ACTIVE_USERS':
      return {
        ...state,
        activeUsers: action.payload
      };
    
    case 'UPDATE_PAGE_DATA':
      return {
        ...state,
        pageData: {
          ...state.pageData,
          [action.page]: {
            ...state.pageData[action.page],
            ...action.data,
            lastUpdated: new Date()
          }
        }
      };
    
    case 'BROADCAST_EVENT':
      return {
        ...state,
        recentEvents: [...state.recentEvents.slice(-19), action.payload].slice(-20)
      };
    
    case 'SET_LAST_UPDATE':
      return {
        ...state,
        lastUpdateTime: action.payload
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  connectionStatus: 'disconnected',
  isConnected: false,
  isPolling: false,
  notifications: [],
  globalStats: {
    totalSales: 0,
    totalPurchases: 0,
    totalInventory: 0,
    activeUsers: 0,
    totalAssets: 0,
    totalCustomers: 0,
    totalSuppliers: 0
  },
  activeUsers: [],
  pageData: {},
  recentEvents: [],
  lastUpdateTime: null,
  lastUpdates: {}
};

// Create context
const RealTimeContext = createContext();

// Real-time provider component
export const RealTimeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(realTimeReducer, initialState);
  const queryClient = useQueryClient();

  // Simulate real-time events (replace with actual WebSocket)
  useEffect(() => {
    const simulateRealTimeEvents = () => {
      // Simulate connection
      setTimeout(() => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      }, 1000);

      // Simulate periodic updates
      const interval = setInterval(() => {
        const events = [
          {
            type: 'inventory:updated',
            payload: {
              message: 'Stock levels updated',
              items: Math.floor(Math.random() * 10) + 1
            }
          },
          {
            type: 'sales:created',
            payload: {
              message: 'New sale completed',
              amount: Math.floor(Math.random() * 1000) + 100,
              customer: `Customer ${Math.floor(Math.random() * 100)}`
            }
          },
          {
            type: 'user:activity',
            payload: {
              message: 'User activity detected',
              users: Math.floor(Math.random() * 5) + 1
            }
          }
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        handleRealTimeEvent(randomEvent.type, randomEvent.payload);
      }, 8000 + Math.random() * 4000); // Random interval between 8-12 seconds

      return () => clearInterval(interval);
    };

    const cleanup = simulateRealTimeEvents();
    return cleanup;
  }, []);

  // Handle real-time events
  const handleRealTimeEvent = useCallback((eventType, payload) => {
    const timestamp = new Date();
    
    switch (eventType) {
      case 'inventory:updated':
        dispatch({
          type: 'UPDATE_GLOBAL_STATS',
          payload: { totalInventory: state.globalStats.totalInventory + (payload.items || 0) },
          source: 'inventory'
        });
        
        dispatch({
          type: 'UPDATE_PAGE_DATA',
          page: 'inventory',
          data: { lastUpdate: payload, itemCount: payload.items }
        });
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'info',
            message: payload.message,
            timestamp,
            source: 'inventory'
          }
        });
        
        // Invalidate inventory queries
        queryClient.invalidateQueries(['inventory', 'dashboard']);
        break;

      case 'sales:created':
        dispatch({
          type: 'UPDATE_GLOBAL_STATS',
          payload: { 
            totalSales: state.globalStats.totalSales + payload.amount,
            activeUsers: state.globalStats.activeUsers + 1
          },
          source: 'sales'
        });
        
        dispatch({
          type: 'UPDATE_PAGE_DATA',
          page: 'sales',
          data: { lastSale: payload }
        });
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            message: `New sale: ${payload.customer} - $${payload.amount}`,
            timestamp,
            source: 'sales'
          }
        });
        
        // Invalidate sales queries
        queryClient.invalidateQueries(['sales', 'dashboard', 'analytics']);
        toast.success(`New sale: ${payload.customer} - $${payload.amount}`);
        break;

      case 'purchases:created':
        dispatch({
          type: 'UPDATE_GLOBAL_STATS',
          payload: { totalPurchases: state.globalStats.totalPurchases + payload.amount },
          source: 'purchases'
        });
        
        dispatch({
          type: 'UPDATE_PAGE_DATA',
          page: 'purchases',
          data: { lastPurchase: payload }
        });
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            message: `New purchase: ${payload.supplier} - $${payload.amount}`,
            timestamp,
            source: 'purchases'
          }
        });
        
        // Invalidate purchases queries
        queryClient.invalidateQueries(['purchases', 'dashboard']);
        toast.success(`New purchase: ${payload.supplier} - $${payload.amount}`);
        break;

      case 'assets:updated':
        dispatch({
          type: 'UPDATE_GLOBAL_STATS',
          payload: { totalAssets: state.globalStats.totalAssets + (payload.count || 0) },
          source: 'assets'
        });
        
        dispatch({
          type: 'UPDATE_PAGE_DATA',
          page: 'assets',
          data: { lastUpdate: payload }
        });
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'warning',
            message: `Asset updated: ${payload.name}`,
            timestamp,
            source: 'assets'
          }
        });
        
        // Invalidate assets queries
        queryClient.invalidateQueries(['assets', 'dashboard']);
        break;

      case 'customers:updated':
        dispatch({
          type: 'UPDATE_GLOBAL_STATS',
          payload: { totalCustomers: state.globalStats.totalCustomers + (payload.count || 0) },
          source: 'customers'
        });
        
        dispatch({
          type: 'UPDATE_PAGE_DATA',
          page: 'customers',
          data: { lastUpdate: payload }
        });
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'info',
            message: `Customer updated: ${payload.name}`,
            timestamp,
            source: 'customers'
          }
        });
        
        // Invalidate customers queries
        queryClient.invalidateQueries(['customers', 'dashboard']);
        break;

      case 'suppliers:updated':
        dispatch({
          type: 'UPDATE_GLOBAL_STATS',
          payload: { totalSuppliers: state.globalStats.totalSuppliers + (payload.count || 0) },
          source: 'suppliers'
        });
        
        dispatch({
          type: 'UPDATE_PAGE_DATA',
          page: 'suppliers',
          data: { lastUpdate: payload }
        });
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'info',
            message: `Supplier updated: ${payload.name}`,
            timestamp,
            source: 'suppliers'
          }
        });
        
        // Invalidate suppliers queries
        queryClient.invalidateQueries(['suppliers', 'dashboard']);
        break;

      case 'user:activity':
        dispatch({
          type: 'SET_ACTIVE_USERS',
          payload: payload.users || []
        });
        
        dispatch({
          type: 'UPDATE_GLOBAL_STATS',
          payload: { activeUsers: payload.users?.length || 0 },
          source: 'userActivity'
        });
        break;

      case 'alerts:triggered':
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: payload.severity === 'critical' ? 'error' : 'warning',
            message: payload.message,
            timestamp,
            source: 'alerts'
          }
        });
        
        // Invalidate alerts queries
        queryClient.invalidateQueries(['alerts', 'dashboard']);
        
        if (payload.severity === 'critical') {
          toast.error(payload.message);
        } else {
          toast.warning(payload.message);
        }
        break;

      default:
        console.log('Unknown real-time event type:', eventType);
    }

    // Broadcast event to all pages
    dispatch({
      type: 'BROADCAST_EVENT',
      payload: {
        id: Date.now(),
        type: eventType,
        payload,
        timestamp
      }
    });

    // Update last update time
    dispatch({ type: 'SET_LAST_UPDATE', payload: timestamp });
  }, [state.globalStats, queryClient]);

  // Context value
  const value = {
    ...state,
    dispatch,
    handleRealTimeEvent,
    
    // Helper functions
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
    updateConnectionStatus: (status) => dispatch({ type: 'SET_CONNECTION_STATUS', payload: status }),
    
    // Page-specific data updates
    updatePageData: (page, data) => dispatch({ type: 'UPDATE_PAGE_DATA', page, data }),
    getPageData: (page) => state.pageData[page],
    
    // Global stats updates
    updateGlobalStats: (stats) => dispatch({ type: 'UPDATE_GLOBAL_STATS', payload: stats, source: 'manual' }),
    
    // Event broadcasting
    broadcastEvent: (eventType, payload) => handleRealTimeEvent(eventType, payload),
    
    // Query invalidation helper
    invalidateQueries: (queryKeys) => {
      if (Array.isArray(queryKeys)) {
        queryKeys.forEach(key => queryClient.invalidateQueries(key));
      } else {
        queryClient.invalidateQueries(queryKeys);
      }
    }
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

// Custom hook to use real-time context
export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

// Hook for page-specific real-time updates
export const usePageRealTime = (pageName, options = {}) => {
  const { 
    getPageData, 
    updatePageData, 
    handleRealTimeEvent, 
    invalidateQueries,
    notifications,
    connectionStatus 
  } = useRealTime();
  
  const pageData = getPageData(pageName) || {};
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Subscribe to real-time updates for this page
  useEffect(() => {
    if (options.autoSubscribe !== false) {
      setIsSubscribed(true);
      
      // Page-specific event subscriptions can be added here
      const unsubscribe = () => {
        // Cleanup any page-specific subscriptions
        setIsSubscribed(false);
      };
      
      return unsubscribe;
    }
  }, [pageName, options.autoSubscribe]);

  // Page-specific real-time actions
  const pageActions = {
    updateData: (data) => updatePageData(pageName, data),
    broadcastEvent: (eventType, payload) => handleRealTimeEvent(eventType, payload),
    refreshData: () => invalidateQueries([pageName]),
    subscribeTo: (eventType, handler) => {
      // Subscribe to specific events for this page
      return () => {
        // Unsubscribe logic
      };
    }
  };

  return {
    pageData,
    isSubscribed,
    notifications: notifications.filter(n => n.source === pageName),
    connectionStatus,
    ...pageActions
  };
};

export default RealTimeContext;
