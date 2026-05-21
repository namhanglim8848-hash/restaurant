import apiClient from './apiClient';

export const paymentApi = {
  getPayments: (params) => apiClient.get('/payments', { params }),
  createManualPayment: (data) => apiClient.post('/payments/manual', data),
  initiateEsewa: (data) => apiClient.post('/payments/esewa/initiate', data),
};
