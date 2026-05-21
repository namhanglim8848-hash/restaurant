import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const response = await adminApi.getDashboardMetrics();
        setMetrics(response.data);
      } catch (err) {
        console.error(err);
        showToast('Failed to fetch central SaaS platform metrics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <span className="h-8 w-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
        <p className="text-sm text-dark-400">Syncing with platform control cluster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800/40 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Growstro <span className="glow-text">Super Admin Console</span>
          </h1>
          <p className="text-sm text-dark-400 mt-1">Govern multi-tenant isolated databases, subscriptions, and platform control panels</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Tenants Registered"
          value={String(metrics?.total_tenants ?? 0)}
          subtext="🏢 Active tenant subdomains"
          icon="🏢"
        />

        <StatCard
          label="Active Subscriptions"
          value={String(metrics?.active_subscriptions ?? 0)}
          subtext="💳 Starter/Business/Pro plans"
          icon="💎"
        />

        <StatCard
          label="Monthly SaaS Revenue"
          value={`Rs. ${(metrics?.monthly_recurring_revenue ?? 0).toFixed(2)}`}
          subtext="📈 Platform subscription billing"
          icon="💸"
        />

        <StatCard
          label="Database Isolation health"
          value="100%"
          subtext="✓ pg_catalog PostgreSQL drivers"
          icon="🛡️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PostgreSQL Cluster Health */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
          <h3 className="text-base font-bold text-white mb-4">🛡️ Central Database Isolation Status</h3>
          <div className="text-sm text-dark-300 space-y-4">
            <p>
              Growstro partitions all databases at the schema driver layer securely using isolated PostgreSQL segments. Central administrative structures and plan templates are kept separate.
            </p>
            <div className="bg-dark-950/60 rounded-xl p-4 border border-dark-800/80 font-mono text-xs text-dark-400 space-y-2">
              <div><span className="text-white">Active Driver Cluster:</span> PostgreSQL 15+</div>
              <div><span className="text-white">Central Schema DB:</span> growstro_central</div>
              <div><span className="text-white">Tenant DB Naming Suffix:</span> tenant_[slug]</div>
              <div><span className="text-white">Security Encrypt Protocol:</span> SHA-256</div>
            </div>
          </div>
        </div>

        {/* Quick Commands Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
          <h3 className="text-base font-bold text-white mb-4">⚡ Administrative Control Hub</h3>
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="/admin/tenants" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">🏢</span>
              <span className="text-xs font-semibold text-white">Manage Tenants</span>
            </a>

            <a 
              href="/admin/plans" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">💎</span>
              <span className="text-xs font-semibold text-white">SaaS Billing Plans</span>
            </a>

            <a 
              href="/admin/subscriptions" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">💳</span>
              <span className="text-xs font-semibold text-white">SaaS Subscriptions</span>
            </a>

            <a 
              href="/admin/analytics" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">📈</span>
              <span className="text-xs font-semibold text-white">SaaS Analytics</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
