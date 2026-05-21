import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import RootPathResolver from './RootPathResolver';
import { isCentralDomain } from '../utils/domain';

// Layout Frames
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Shared Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';

// Tenant Workspace Pages
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import Products from '../pages/Products';
import Services from '../pages/Services';
import MenuItems from '../pages/MenuItems';
import Tables from '../pages/Tables';
import Orders from '../pages/Orders';
import KitchenTickets from '../pages/KitchenTickets';
import Invoices from '../pages/Invoices';
import Payments from '../pages/Payments';
import Analytics from '../pages/Analytics';
import WhatsAppReports from '../pages/WhatsAppReports';
import Staff from '../pages/Staff';
import Settings from '../pages/Settings';

// Central Super Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import TenantsList from '../pages/admin/TenantsList';
import PlansList from '../pages/admin/PlansList';
import SubscriptionsList from '../pages/admin/SubscriptionsList';
import PlatformAnalytics from '../pages/admin/PlatformAnalytics';
import AuditLogs from '../pages/admin/AuditLogs';

// Helper to get active tenant slug dynamically from subdomain or URL path or localStorage
const getTenantSlug = () => {
  const path = window.location.pathname;
  const parts = path.split('/');
  if (parts[1] === 'app' && parts[2]) {
    return parts[2];
  }
  const { hostname } = window.location;
  if (!isCentralDomain(hostname)) {
    const hostParts = hostname.split('.');
    return hostParts[0];
  }
  return localStorage.getItem('tenant_slug');
};

// Protected Route Guard (blocks guests and super admin from entering tenant pages)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  const { tenant } = useParams();
  if (!token) {
    const redirectPath = tenant ? `/app/${tenant}/login` : '/login';
    return <Navigate to={redirectPath} replace />;
  }
  if (role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

// Guest Route Guard (redirects already authenticated)
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  if (token) {
    if (role === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      return <Navigate to={`/app/${tenantSlug}/dashboard`} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Super Admin Protection Guard
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'super_admin') {
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      return <Navigate to={`/app/${tenantSlug}/dashboard`} replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
};

// Legacy Flat Route Interceptor & Upgrader
const TenantPathRedirect = ({ to }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  const tenantSlug = getTenantSlug();
  if (tenantSlug) {
    return <Navigate to={`/app/${tenantSlug}/${to}`} replace />;
  }
  return <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dynamic Root Path Resolver */}
      <Route path="/" element={<RootPathResolver />} />

      {/* Guest / Authentication Scope */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        <Route path="/app/:tenant/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />
        <Route path="/app/:tenant/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        } />
        <Route path="/app/:tenant/forgot-password" element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        } />
      </Route>

      {/* Authenticated Tenant Workspace Scope */}
      <Route path="/app/:tenant" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="services" element={<Services />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="tables" element={<Tables />} />
        <Route path="orders" element={<Orders />} />
        <Route path="kitchen-tickets" element={<KitchenTickets />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="whatsapp" element={<WhatsAppReports />} />
        <Route path="staff" element={<Staff />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Legacy Fallback Redirects */}
      <Route path="/dashboard" element={<TenantPathRedirect to="dashboard" />} />
      <Route path="/customers" element={<TenantPathRedirect to="customers" />} />
      <Route path="/products" element={<TenantPathRedirect to="products" />} />
      <Route path="/services" element={<TenantPathRedirect to="services" />} />
      <Route path="/menu-items" element={<TenantPathRedirect to="menu-items" />} />
      <Route path="/tables" element={<TenantPathRedirect to="tables" />} />
      <Route path="/orders" element={<TenantPathRedirect to="orders" />} />
      <Route path="/kitchen-tickets" element={<TenantPathRedirect to="kitchen-tickets" />} />
      <Route path="/invoices" element={<TenantPathRedirect to="invoices" />} />
      <Route path="/payments" element={<TenantPathRedirect to="payments" />} />
      <Route path="/analytics" element={<TenantPathRedirect to="analytics" />} />
      <Route path="/whatsapp" element={<TenantPathRedirect to="whatsapp" />} />
      <Route path="/staff" element={<TenantPathRedirect to="staff" />} />
      <Route path="/settings" element={<TenantPathRedirect to="settings" />} />

      {/* Authenticated Central Super Admin Scope */}
      <Route element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tenants" element={<TenantsList />} />
        <Route path="/admin/plans" element={<PlansList />} />
        <Route path="/admin/subscriptions" element={<SubscriptionsList />} />
        <Route path="/admin/analytics" element={<PlatformAnalytics />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
