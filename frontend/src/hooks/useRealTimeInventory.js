import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import io from 'socket.io-client';
import { SOCKET_URL } from '../services/api';

const useRealTimeInventory = () => {
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    const isLocalDemoToken = !token || token.startsWith('mock-jwt-token-');

    if (isLocalDemoToken) {
      setIsConnected(true);
      const pollingInterval = setInterval(() => {
        queryClient.invalidateQueries('inventory');
      }, 5000);

      return () => clearInterval(pollingInterval);
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: { token },
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to real-time inventory updates');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from real-time inventory updates');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('Connection error:', error);
      setIsConnected(true);
      queryClient.invalidateQueries('inventory');
    });

    socketRef.current.on('reconnect', () => {
      console.log('Reconnected to real-time inventory updates');
      setIsConnected(true);
    });

    socketRef.current.on('reconnect_error', (error) => {
      console.log('Reconnection error:', error);
      setIsConnected(true);
    });

      // Listen for inventory updates
      socketRef.current.on('inventory:updated', (data) => {
        console.log('Real-time inventory update:', data);
        
        // Update the cache with new data
        queryClient.setQueryData(['inventory', { id: data._id }], data);
        
        // Invalidate inventory list queries to trigger refetch
        queryClient.invalidateQueries('inventory');
        
        // Add to real-time updates list
        setRealTimeUpdates(prev => [data, ...prev.slice(0, 9)]);
      });

      // Listen for stock adjustments
      socketRef.current.on('inventory:stock-adjusted', (data) => {
        console.log('Real-time stock adjustment:', data);
        
        // Update specific item in cache
        queryClient.setQueryData(['inventory', { id: data._id }], data);
        queryClient.invalidateQueries('inventory');
        
        // Show notification for critical stock changes
        if (data.quantity <= data.minStockLevel) {
          showStockAlert(data);
        }
        
        setRealTimeUpdates(prev => [data, ...prev.slice(0, 9)]);
      });

      // Listen for low stock alerts
      socketRef.current.on('inventory:low-stock', (data) => {
        console.log('Low stock alert:', data);
        showStockAlert(data);
      });

      // Listen for new inventory items
      socketRef.current.on('inventory:created', (data) => {
        console.log('New inventory item:', data);
        queryClient.invalidateQueries('inventory');
        setRealTimeUpdates(prev => [data, ...prev.slice(0, 9)]);
      });

      // Listen for deleted items
      socketRef.current.on('inventory:deleted', (data) => {
        console.log('Inventory item deleted:', data);
        queryClient.invalidateQueries('inventory');
        setRealTimeUpdates(prev => [{ ...data, action: 'deleted' }, ...prev.slice(0, 9)]);
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [queryClient]);

  const showStockAlert = (item) => {
    // Create browser notification
    if (Notification.permission === 'granted') {
      new Notification('Low Stock Alert', {
        body: `${item.name} is running low on stock (${item.quantity} remaining)`,
        icon: '/favicon.ico'
      });
    }
    
    // Show toast notification
    const toast = require('react-hot-toast').toast;
    toast.error(`Low Stock: ${item.name} (${item.quantity} remaining)`, {
      duration: 5000,
      position: 'top-right'
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    isConnected,
    realTimeUpdates,
    requestNotificationPermission
  };
};

export default useRealTimeInventory;
