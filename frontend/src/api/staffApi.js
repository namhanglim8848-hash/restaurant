import apiClient from './apiClient';

export const staffApi = {
  getStaff: () => apiClient.get('/staff'),
  getStaffDetail: (id) => apiClient.get(`/staff/${id}`),
  createStaff: (data) => apiClient.post('/staff', data),
  updateStaff: (id, data) => apiClient.put(`/staff/${id}`, data),
  deleteStaff: (id) => apiClient.delete(`/staff/${id}`),
  
  // Staff Invitations
  getInvitations: () => apiClient.get('/staff/invitations'),
  createInvitation: (data) => apiClient.post('/staff/invitations', data),
  resendInvitation: (id) => apiClient.post(`/staff/invitations/${id}/resend`),
  cancelInvitation: (id) => apiClient.delete(`/staff/invitations/${id}`),
  acceptInvitation: (token, data) => apiClient.post(`/staff/invitations/accept/${token}`, data),
};
