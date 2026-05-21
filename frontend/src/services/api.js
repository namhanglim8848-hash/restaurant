import axios from 'axios';
import { isCentralDomain } from '../utils/domain';

// Detect host and construct API Base URL dynamically
const getApiBaseUrl = () => {
  const { hostname } = window.location;
  
  // Local development Laravel backend runs on port 8000
  const backendPort = '8000';
  
  // Check if we are on a tenant subdomain or central localhost
  if (!isCentralDomain(hostname)) {
    // Tenant subdomain detected
    return `${window.location.protocol}//${hostname}:${backendPort}/api`;
  }
  
  // Default to central API
  return `${window.location.protocol}//localhost:${backendPort}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to automatically attach Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses and common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (e.g. invalid/expired token), clear local session
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
