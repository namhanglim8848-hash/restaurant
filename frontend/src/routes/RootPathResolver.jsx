import React from 'react';
import { Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';

export default function RootPathResolver() {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  
  if (token) {
    if (role === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    const tenantSlug = localStorage.getItem('tenant_slug');
    if (tenantSlug) {
      return <Navigate to={`/app/${tenantSlug}/dashboard`} replace />;
    }
  }

  const { hostname } = window.location;
  const parts = hostname.split('.');
  
  // If hostname is e.g. "tenant.localhost", parts will be ["tenant", "localhost"]
  if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    // Tenant subdomain detected, redirect to tenant login page
    return <Navigate to="/login" replace />;
  }
  
  // Central domain, show the SaaS registration landing page
  return <Landing />;
}
