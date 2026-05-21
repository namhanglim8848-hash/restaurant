import apiClient from './apiClient';

export const orderApi = {
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrderDetail: (id) => apiClient.get(`/orders/${id}`),
  createOrder: (data) => apiClient.post('/orders', data),
  updateOrder: (id, data) => apiClient.put(`/orders/${id}`, data),
  cancelOrder: (id) => apiClient.post(`/orders/${id}/cancel`),
  completeOrder: (id) => apiClient.post(`/orders/${id}/complete`),
  
  // Kitchen Tickets (KOT/BOT)
  getKitchenTickets: (params) => apiClient.get('/kitchen-tickets', { params }),
  getKitchenTicketDetail: (id) => apiClient.get(`/kitchen-tickets/${id}`),
  updateKitchenTicketStatus: (id, data) => apiClient.put(`/kitchen-tickets/${id}/status`, data),
  updateKitchenTicketItemStatus: (id, itemId, data) => apiClient.put(`/kitchen-tickets/${id}/items/${itemId}/status`, data),
};
