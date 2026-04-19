import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../services/api';

const invalidateMany = (queryClient, keys) => {
  keys.forEach((key) => {
    queryClient.invalidateQueries(key);
  });
};

const RealtimeQueryBridge = ({ enabled = true }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const inventoryHandler = () => {
      invalidateMany(queryClient, [
        'inventory',
        'dashboardOverview',
        'inventoryTrends',
        'dashboardInventorySnapshot',
        'dashboardTransactionsSnapshot',
        'ai-demand-inventory',
        'ai-inventory-optimization',
      ]);
    };

    const assetHandler = () => {
      invalidateMany(queryClient, [
        'assets',
        'assetsOverview',
        'dashboardOverview',
        'dashboardAssetsSnapshot',
      ]);
    };

    const transactionHandler = () => {
      invalidateMany(queryClient, [
        'transactions',
        'transactionsAnalysis',
        'dashboardOverview',
        'dashboardTransactionsSnapshot',
        'paymentTransactions',
        'paymentAccounts',
      ]);
    };

    const alertHandler = () => {
      invalidateMany(queryClient, [
        'alerts',
        'dashboardOverview',
        'dashboardAlertsSnapshot',
        'ai-smart-alerts',
      ]);
    };

    const supplierHandler = () => {
      invalidateMany(queryClient, [
        'suppliers',
        'suppliersPerformance',
        'product-tool-suppliers',
      ]);
    };

    const userHandler = () => {
      invalidateMany(queryClient, ['users']);
    };

    const paymentHandler = () => {
      invalidateMany(queryClient, [
        'paymentAccounts',
        'paymentTransactions',
        'dashboardTransactionsSnapshot',
      ]);
    };

    [
      'inventory-updated',
      'stock-adjusted',
    ].forEach((event) => socket.on(event, inventoryHandler));

    [
      'asset-updated',
      'asset-assigned',
      'asset-unassigned',
      'asset-maintenance',
    ].forEach((event) => socket.on(event, assetHandler));

    [
      'transaction-created',
      'transaction-updated',
      'transaction-approved',
      'transaction-cancelled',
    ].forEach((event) => socket.on(event, transactionHandler));

    [
      'alert-created',
      'alert-acknowledged',
      'alert-resolved',
      'alert-dismissed',
      'alert-assigned',
    ].forEach((event) => socket.on(event, alertHandler));

    ['supplier-created', 'supplier-updated', 'supplier-deleted'].forEach((event) =>
      socket.on(event, supplierHandler)
    );

    [
      'user-created',
      'user-updated',
      'user-deleted',
      'user-permissions-updated',
      'user-status-updated',
    ].forEach((event) => socket.on(event, userHandler));

    ['payment-account-updated', 'payment-transaction-created'].forEach((event) =>
      socket.on(event, paymentHandler)
    );

    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);

  return null;
};

export default RealtimeQueryBridge;
