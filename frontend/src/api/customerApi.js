import apiClient from './apiClient';

export const customerApi = {
  getCustomers: (params) => apiClient.get('/customers', { params }),
  getCustomerDetail: (id) => apiClient.get(`/customers/${id}`),
  createCustomer: (data) => apiClient.post('/customers', data),
  updateCustomer: (id, data) => apiClient.put(`/customers/${id}`, data),
  deleteCustomer: (id) => apiClient.delete(`/customers/${id}`),
};
