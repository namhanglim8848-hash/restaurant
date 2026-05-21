import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: '👑' },
    { label: 'Tenants Lifecycles', path: '/admin/tenants', icon: '🏢' },
    { label: 'Subscription Plans', path: '/admin/plans', icon: '💎' },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: '💳' },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: '📈' },
    { label: 'Central Audit Logs', path: '/admin/audit-logs', icon: '📝' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-dark-950 text-dark-100">
      {/* Brand Header */}
      <div className="p-6 border-b border-dark-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg border border-brand-300/10 shrink-0">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          {sidebarOpen && (
            <div className="flex flex-col shrink-0">
              <span className="font-extrabold text-lg glow-text">Growstro</span>
              <span className="text-[10px] text-brand-400 uppercase tracking-widest font-bold">Platform Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold' 
                  : 'hover:bg-dark-800/50 hover:text-white text-dark-300'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile / Logout section */}
      <div className="p-4 border-t border-dark-800/60 flex flex-col gap-2">
        {sidebarOpen && user && (
          <div className="px-2 py-1.5 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-dark-400 truncate uppercase">SUPER ADMIN</p>
          </div>
        )}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-dark-400 transition-all w-full text-left"
        >
          <span className="text-base">🚪</span>
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-dark-950 text-dark-100 font-sans relative overflow-hidden">
      {/* Subtle top-right ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col glass-panel border-y-0 border-l-0 border-r border-dark-800/60 z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm"
        ></div>
      )}

      {/* Mobile Drawer Navigation */}
      <div className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-dark-800/60 bg-dark-950 transition-transform duration-300 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-dark-800/60 flex items-center justify-between px-6 z-20 glass-panel border-x-0 border-t-0 bg-dark-950/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Desktop Collapse button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="hidden md:flex h-9 w-9 rounded-lg border border-dark-800 hover:border-brand-500/40 items-center justify-center transition-colors text-dark-300 hover:text-brand-400"
            >
              ☰
            </button>
            {/* Mobile Sidebar open button */}
            <button 
              onClick={() => setMobileOpen(true)} 
              className="md:hidden h-9 w-9 rounded-lg border border-dark-800 hover:border-brand-500/40 flex items-center justify-center transition-colors text-dark-300 hover:text-brand-400"
            >
              ☰
            </button>
            
            {/* Central System Admin Badge */}
            <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-xl text-brand-400">
              <span className="text-xs">⚙️</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Super Control Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-dark-400 font-medium">Central System Connection</span>
            </div>
          </div>
        </header>

        {/* Scrollable workspace area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
