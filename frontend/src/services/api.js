import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Keep the original response contract, but also flatten common payloads so
    // pages written against either `res.data.foo` or `res.data.data.foo` work.
    if (
      response?.data &&
      typeof response.data === 'object' &&
      response.data.data &&
      typeof response.data.data === 'object' &&
      !Array.isArray(response.data.data)
    ) {
      response.data = {
        ...response.data,
        ...response.data.data,
      };
    }

    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    const hasStoredToken = Boolean(localStorage.getItem('token'));

    if (error.response?.status === 401 && hasStoredToken && !isAuthRequest) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  adjustStock: (id, data) => api.post(`/inventory/${id}/adjust-stock`, data),
  getCategories: () => api.get('/inventory/categories/list'),
  getLowStock: () => api.get('/inventory/low-stock/alerts'),
};

export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  assign: (id, data) => api.post(`/assets/${id}/assign`, data),
  unassign: (id) => api.post(`/assets/${id}/unassign`),
  addMaintenance: (id, data) => api.post(`/assets/${id}/maintenance`, data),
  getMaintenanceDue: () => api.get('/assets/maintenance/due'),
  getCategories: () => api.get('/assets/categories/list'),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  approve: (id) => api.post(`/transactions/${id}/approve`),
  cancel: (id) => api.post(`/transactions/${id}/cancel`),
  getSummary: (params) => api.get('/transactions/summary/stats', { params }),
};

export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  updatePerformance: (id, data) => api.post(`/suppliers/${id}/performance`, data),
  getCategories: () => api.get('/suppliers/categories/list'),
};

export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  getLedger: (id) => api.get(`/customers/${id}/ledger`),
  getAnalytics: () => api.get('/customers/analytics/summary'),
  create: (data) => api.post('/customers', data),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updatePermissions: (id, permissions) => api.put(`/users/${id}/permissions`, { permissions }),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
};

export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  acknowledge: (id) => api.post(`/alerts/${id}/acknowledge`),
  resolve: (id, data) => api.post(`/alerts/${id}/resolve`, data),
  dismiss: ({ id, dismissal_reason }) => api.post(`/alerts/${id}/dismiss`, { dismissal_reason }),
  getActiveCount: () => api.get('/alerts/active/count'),
};

export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  getCategories: () => api.get('/expenses/categories/list'),
};

export const purchasesAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  create: (data) => api.post('/purchases', data),
  updateStatus: (id, status) => api.put(`/purchases/${id}/status`, { status }),
};

export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  create: (data) => api.post('/sales', data),
};

export const stockAdjustmentsAPI = {
  getAll: (params) => api.get('/stock-adjustments', { params }),
  create: (data) => api.post('/stock-adjustments', data),
};

export const stockTransfersAPI = {
  getAll: (params) => api.get('/stock-transfers', { params }),
  create: (data) => api.post('/stock-transfers', data),
  updateStatus: (id, status) => api.put(`/stock-transfers/${id}/status`, { status }),
};

export const warehousesAPI = {
  getAll: () => api.get('/warehouses'),
  create: (data) => api.post('/warehouses', data),
};

export const metadataAPI = {
  getUnits: () => api.get('/metadata/units'),
  createUnit: (data) => api.post('/metadata/units', data),
  updateUnit: (id, data) => api.put(`/metadata/units/${id}`, data),
  deleteUnit: (id) => api.delete(`/metadata/units/${id}`),
  getBrands: () => api.get('/metadata/brands'),
  createBrand: (data) => api.post('/metadata/brands', data),
  updateBrand: (id, data) => api.put(`/metadata/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/metadata/brands/${id}`),
  getCategories: () => api.get('/metadata/categories'),
  createCategory: (data) => api.post('/metadata/categories', data),
  updateCategory: (id, data) => api.put(`/metadata/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/metadata/categories/${id}`),
  getWarranties: () => api.get('/metadata/warranties'),
  createWarranty: (data) => api.post('/metadata/warranties', data),
  updateWarranty: (id, data) => api.put(`/metadata/warranties/${id}`, data),
  deleteWarranty: (id) => api.delete(`/metadata/warranties/${id}`),
};

export const paymentAccountsAPI = {
  getAll: () => api.get('/payment-accounts'),
  create: (data) => api.post('/payment-accounts', data),
  getTransactions: (params) => api.get('/payment-accounts/transactions', { params }),
  createTransaction: (data) => api.post('/payment-accounts/transactions', data),
};

export const analyticsAPI = {
  getDashboardOverview: () => api.get('/analytics/dashboard/overview'),
  getInventoryTrends: (params) => api.get('/analytics/inventory/trends', { params }),
  getAssetsOverview: () => api.get('/analytics/assets/overview'),
  getTransactionsAnalysis: (params) => api.get('/analytics/transactions/analysis', { params }),
  getSuppliersPerformance: () => api.get('/analytics/suppliers/performance'),
  getAlertsAnalysis: (params) => api.get('/analytics/alerts/analysis', { params }),
  getReportsSummary: (params) => api.get('/analytics/reports/summary', { params }),
  getStockReport: () => api.get('/analytics/reports/stock'),
};

export const aiAPI = {
  predictDemand: (data) => api.post('/ai/predict-demand', data),
  getRestockSuggestions: (data) => api.post('/ai/auto-restock-suggestions', data),
  getExpenseInsights: (data) => api.post('/ai/expense-insights', data),
  getFraudDetection: (data) => api.post('/ai/fraud-detection', data),
};

export const demoAPI = {
  seedGroceryStoreMonth: (data = {}) => api.post('/demo/grocery-store-month', data),
};

export default api;
