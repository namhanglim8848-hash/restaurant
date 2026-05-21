import React from 'react';
import { Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import { isCentralDomain } from '../utils/domain';

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
  
  if (!isCentralDomain(hostname)) {
    // Tenant subdomain detected, redirect to tenant login page
    return <Navigate to="/login" replace />;
  }
  
  // Central domain, show the SaaS registration landing page
  return <Landing />;
}
