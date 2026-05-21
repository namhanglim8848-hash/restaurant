import apiClient from './apiClient';

export const adminApi = {
  // Super Admin Central Dashboard
  getDashboardMetrics: () => apiClient.get('/admin/dashboard'),

  // Tenant Lifecycles
  getTenants: () => apiClient.get('/admin/tenants'),
  getTenantDetail: (id) => apiClient.get(`/admin/tenants/${id}`),
  updateTenantStatus: (id, status) => {
    if (status === 'suspended') {
      return apiClient.put(`/admin/tenants/${id}/suspend`);
    } else if (status === 'active') {
      return apiClient.put(`/admin/tenants/${id}/restore`);
    } else if (status === 'deactivated') {
      return apiClient.put(`/admin/tenants/${id}/deactivate`);
    }
    return apiClient.put(`/admin/tenants/${id}/activate`);
  },
  getTenantSummary: (id) => apiClient.get(`/admin/tenants/${id}/summary`),
  deleteTenant: (id, force = false) => apiClient.delete(`/admin/tenants/${id}`, { params: { force } }),

  // Subscription Plans CRUD
  getPlans: () => apiClient.get('/admin/subscription-plans'),
  getPlanDetail: (id) => apiClient.get(`/admin/subscription-plans/${id}`),
  createPlan: (data) => apiClient.post('/admin/subscription-plans', data),
  updatePlan: (id, data) => apiClient.put(`/admin/subscription-plans/${id}`, data),
  deletePlan: (id) => apiClient.delete(`/admin/subscription-plans/${id}`),

  // Subscription Assignments
  getSubscriptions: () => apiClient.get('/admin/subscriptions'),
  assignSubscription: (tenantId, planId, data = {}) => apiClient.post(`/admin/tenants/${tenantId}/subscriptions`, { 
    subscription_plan_id: planId,
    ...data 
  }),
  cancelSubscription: (id) => apiClient.put(`/admin/subscriptions/${id}/cancel`),
  expireSubscription: (id) => apiClient.put(`/admin/subscriptions/${id}/expire`),
  renewSubscription: (id, data = {}) => apiClient.put(`/admin/subscriptions/${id}/renew`, data),

  // Central Platform Analytics & Logs
  getPlatformAnalytics: () => apiClient.get('/admin/platform-analytics'),
  getAuditLogs: () => apiClient.get('/admin/audit-logs'),
};
