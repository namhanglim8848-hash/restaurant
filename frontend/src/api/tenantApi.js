import apiClient from './apiClient';

export const tenantApi = {
  // Local tenant settings (VAT, PAN, prefix, name, etc.)
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
  
  // Spaces & Tables Management
  getSpaces: () => apiClient.get('/spaces'),
  createSpace: (data) => apiClient.post('/spaces', data),
  updateSpace: (id, data) => apiClient.put(`/spaces/${id}`, data),
  deleteSpace: (id) => apiClient.delete(`/spaces/${id}`),

  getTables: () => apiClient.get('/tables'),
  createTable: (data) => apiClient.post('/tables', data),
  updateTable: (id, data) => apiClient.put(`/tables/${id}`, data),
  deleteTable: (id) => apiClient.delete(`/tables/${id}`),
};
