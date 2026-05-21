import axios from 'axios';

// Dynamically compute the API Base URL for local/production subdomain environments
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const { hostname, protocol } = window.location;
  const backendPort = '8000';
  const parts = hostname.split('.');

  // If a tenant subdomain is present (e.g., "sajilo.localhost")
  if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    return `${protocol}//${hostname}:${backendPort}/api`;
  }

  // Otherwise, default to the central base URL
  return `${protocol}//localhost:${backendPort}/api`;
};

// Helper to get active tenant slug dynamically from subdomain or URL path
const getTenantSlug = () => {
  // 1. Path-based: e.g. /app/sajilo/dashboard
  const path = window.location.pathname;
  const parts = path.split('/');
  if (parts[1] === 'app' && parts[2]) {
    return parts[2];
  }

  // 2. Subdomain-based: e.g. sajilo.localhost
  const { hostname } = window.location;
  const hostParts = hostname.split('.');
  if (hostParts.length > 1 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
    return hostParts[0];
  }
  
  // 3. Fallback to localStorage
  return localStorage.getItem('tenant_slug');
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach bearer tokens automatically from LocalStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically append tenant slug if not already prefixed and if it is a tenant-scoped request
    const tenantSlug = getTenantSlug();
    if (
      tenantSlug && 
      !config.url.startsWith('/admin/') && 
      !config.url.includes('/auth/register-business') && 
      !config.url.includes('/auth/login') &&
      !config.url.includes('/auth/forgot-password')
    ) {
      // Remove any leading slash
      const cleanUrl = config.url.replace(/^\/+/, '');
      if (!cleanUrl.startsWith(`${tenantSlug}/`) && !cleanUrl.startsWith(`api/${tenantSlug}/`)) {
        config.url = `/${tenantSlug}/${cleanUrl}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified global response parsing & session handling
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;

    // Dynamically unwrap Laravel's paginated API response wrapper (success: true, data: { data: [...] })
    // so that frontend page components receive a clean, flat array of records.
    if (res && res.success && res.data !== undefined) {
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        response.data = res.data.data;
      } else {
        response.data = res.data;
      }
    } else if (res && res.success) {
      response.data = res;
    }

    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    // Handle session expirations cleanly
    if (status === 401) {
      const tenantSlug = getTenantSlug();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      localStorage.removeItem('tenant_slug');

      const currentPath = window.location.pathname;
      if (
        currentPath !== '/login' && 
        currentPath !== '/register' && 
        currentPath !== '/' &&
        !currentPath.includes('/login')
      ) {
        if (tenantSlug) {
          window.location.href = `/app/${tenantSlug}/login`;
        } else {
          window.location.href = '/login';
        }
      }
    }

    // Pass custom error messages back securely
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const errors = error.response?.data?.errors || null;
    return Promise.reject({ status, message, errors });
  }
);

export default apiClient;
