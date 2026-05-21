import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isCentralDomain } from '../utils/domain';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get active tenant slug dynamically from subdomain or URL path
  const getTenantSlug = () => {
    // 1. Path-based: e.g. /app/sajilo/dashboard or /app/sajilo/login
    const path = window.location.pathname;
    const parts = path.split('/');
    if (parts[1] === 'app' && parts[2]) {
      return parts[2];
    }

    // 2. Subdomain-based: e.g. sajilo.localhost
    const { hostname } = window.location;
    if (!isCentralDomain(hostname)) {
      const hostParts = hostname.split('.');
      return hostParts[0];
    }
    
    // 3. Fallback to localStorage
    return localStorage.getItem('tenant_slug');
  };

  const tenantSlug = getTenantSlug();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('user_role');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUser, newTenantSlug = null) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Explicitly handle central super admin roles vs tenant roles
    const assignedRole = newUser.role || 'staff';
    localStorage.setItem('user_role', assignedRole);

    if (newTenantSlug) {
      localStorage.setItem('tenant_slug', newTenantSlug);
    }

    setToken(newToken);
    setUser(newUser);
    setRole(assignedRole);

    // Redirect correctly based on role
    if (assignedRole === 'super_admin') {
      navigate('/admin/dashboard');
    } else {
      const currentSlug = newTenantSlug || getTenantSlug();
      if (currentSlug) {
        localStorage.setItem('tenant_slug', currentSlug);
        navigate(`/app/${currentSlug}/dashboard`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tenant_slug');
    
    setToken(null);
    setUser(null);
    setRole(null);
    
    const currentSlug = getTenantSlug();
    if (currentSlug) {
      navigate(`/app/${currentSlug}/login`);
    } else {
      navigate('/login');
    }
  };

  // Central permission gate checker
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Super admins and tenant owners bypass all specific checks
    if (role === 'super_admin' || role === 'owner') return true;
    
    // Check specific user permissions
    return user.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    token,
    role,
    tenantSlug,
    loading,
    login,
    logout,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
