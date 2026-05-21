import apiClient from './apiClient';

export const whatsappApi = {
  getSettings: () => apiClient.get('/whatsapp/settings'),
  updateSettings: (data) => apiClient.put('/whatsapp/settings', data),
  getDailyReportsList: () => apiClient.get('/whatsapp/reports'),
  getDailyReportDetail: (id) => apiClient.get(`/whatsapp/reports/${id}`),
  generateDailyReportManually: () => apiClient.post('/whatsapp/reports/generate'),
  sendWhatsAppManually: (id) => apiClient.post(`/whatsapp/reports/${id}/send`),
};
