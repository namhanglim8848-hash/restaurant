import apiClient from './apiClient';

export const productApi = {
  // Products
  getProducts: (params) => apiClient.get('/products', { params }),
  getProductDetail: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Services
  getServices: (params) => apiClient.get('/services', { params }),
  getServiceDetail: (id) => apiClient.get(`/services/${id}`),
  createService: (data) => apiClient.post('/services', data),
  updateService: (id, data) => apiClient.put(`/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/services/${id}`),

  // Menu Items
  getMenuItems: (params) => apiClient.get('/menu-items', { params }),
  getMenuItemDetail: (id) => apiClient.get(`/menu-items/${id}`),
  createMenuItem: (data) => apiClient.post('/menu-items', data),
  updateMenuItem: (id, data) => apiClient.put(`/menu-items/${id}`, data),
  deleteMenuItem: (id) => apiClient.delete(`/menu-items/${id}`),
};
