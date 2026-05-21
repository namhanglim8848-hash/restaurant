import apiClient from './apiClient';

export const analyticsApi = {
  getOverview: () => apiClient.get('/analytics/overview'),
  getSales: (params) => apiClient.get('/analytics/sales', { params }),
  getPayments: (params) => apiClient.get('/analytics/payments', { params }),
  getCustomers: () => apiClient.get('/analytics/customers'),
  getProducts: () => apiClient.get('/analytics/products'),
  getExpenses: () => apiClient.get('/analytics/expenses'),
  getDueSummary: () => apiClient.get('/analytics/due-summary'),
  getDailyReport: () => apiClient.get('/analytics/daily-report'),
};
