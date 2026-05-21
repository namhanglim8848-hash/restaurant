import apiClient from './apiClient';

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register-business', data),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/me'),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
};

