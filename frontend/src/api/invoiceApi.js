import apiClient from './apiClient';

export const invoiceApi = {
  getInvoices: (params) => apiClient.get('/invoices', { params }),
  getInvoiceDetail: (id) => apiClient.get(`/invoices/${id}`),
  createInvoice: (data) => apiClient.post('/invoices', data),
  cancelInvoice: (id) => apiClient.post(`/invoices/${id}/cancel`),
  downloadPdf: (id) => apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};
